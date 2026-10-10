import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdminApi } from "@/lib/server/auth";
import { jsonError, sniffMedia } from "@/lib/server/http";
import { isR2Configured, uploadPublicFileToR2, deletePublicFileFromR2 } from "@/lib/server/r2";

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB for images & videos

export async function POST(request: Request) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid form data. Please upload a file.", 400);
  }

  const file = formData.get("file");
  const oldUrl = formData.get("oldUrl")?.toString();

  if (!file || !(file instanceof File)) {
    return jsonError("No file uploaded. Please choose an image or video to upload.", 400);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return jsonError("File size exceeds the 100MB limit.", 400);
  }

  const ext = path.extname(file.name);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffMedia(bytes, ext);
  if (!sniffed) {
    return jsonError("Invalid file type. Allowed formats: JPG, PNG, WebP images, or MP4, WebM, MOV videos.", 400);
  }

  // If oldUrl was passed and belongs to R2, remove it so old uploads are deleted!
  if (oldUrl && (oldUrl.includes(".r2.dev/") || oldUrl.includes("gallery/"))) {
    try {
      await deletePublicFileFromR2(oldUrl);
    } catch (e) {
      console.warn("Could not delete old R2 file:", e);
    }
  }

  const safeOriginalName = path
    .basename(file.name, ext)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 30);

  const subfolder = sniffed.isVideo ? "gallery/videos" : "gallery";
  const filename = `${safeOriginalName || "media"}-${Date.now()}-${randomBytes(4).toString("hex")}.${sniffed.ext}`;
  const key = `${subfolder}/${filename}`;

  // If Cloudflare R2 is configured, upload directly to R2!
  if (isR2Configured()) {
    try {
      const publicUrl = await uploadPublicFileToR2(key, bytes, sniffed.type);
      return Response.json({
        success: true,
        url: publicUrl,
        filename,
        isVideo: sniffed.isVideo,
        storage: "r2",
      });
    } catch (err: unknown) {
      console.error("Cloudflare R2 upload error:", err);
      const msg = err instanceof Error ? err.message : "Failed to upload to Cloudflare R2.";
      return jsonError(`Cloudflare R2 Upload Error: ${msg}`, 500);
    }
  }

  // Fallback: save into public/images/gallery/
  try {
    const uploadDir = path.resolve(process.cwd(), `public/${subfolder}`);
    await mkdir(uploadDir, { recursive: true });
    const localFilePath = path.join(uploadDir, filename);
    await writeFile(localFilePath, bytes);

    return Response.json({
      success: true,
      url: `/${subfolder}/${filename}`,
      filename,
      isVideo: sniffed.isVideo,
      storage: "local",
      notice: "Saved locally because R2 credentials are not configured.",
    });
  } catch (err: unknown) {
    console.error("Local upload fallback error:", err);
    return jsonError("Failed to save media locally.", 500);
  }
}

// DELETE action to delete an uploaded file from Cloudflare R2
export async function DELETE(request: Request) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  try {
    const body = await request.json().catch(() => ({}));
    const { url } = body;
    if (url && (url.includes(".r2.dev/") || url.includes("gallery/"))) {
      await deletePublicFileFromR2(url);
    }
    return Response.json({ success: true, message: "Upload removed from storage." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return jsonError(msg, 500);
  }
}
