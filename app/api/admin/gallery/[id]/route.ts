import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { deletePublicFileFromR2 } from "@/lib/server/r2";

const updateSchema = z.object({
  type: z.enum(["PHOTO", "VIDEO", "photo", "video"]).optional().transform((v) => v ? v.toUpperCase() as "PHOTO" | "VIDEO" : undefined),
  title: z.string().trim().min(1, "Title is required").max(200).optional(),
  titleHi: z.string().trim().max(200).optional().nullable(),
  event: z.string().trim().max(100).optional().nullable(),
  eventHi: z.string().trim().max(100).optional().nullable(),
  src: z.string().trim().min(1, "Source URL is required").optional(),
  thumbnail: z.string().trim().min(1, "Thumbnail URL is required").optional(),
  alt: z.string().trim().min(1, "Alt text is required").max(255).optional(),
  videoProvider: z.enum(["youtube", "vimeo", "mp4"]).optional().nullable(),
  focalPoint: z.string().trim().max(50).optional().nullable(),
  aspectRatio: z.string().trim().max(20).optional().nullable(),
  displayOrder: z.coerce.number().int().optional(),
  date: z.string().trim().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) return jsonError("Gallery item not found.", 404);

  return Response.json({ item });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    return jsonError(message, 400);
  }

  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) return jsonError("Gallery item not found.", 404);

  const data = parsed.data;

  const updated = await prisma.galleryItem.update({
    where: { id },
    data: {
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.titleHi !== undefined ? { titleHi: data.titleHi } : {}),
      ...(data.event !== undefined ? { event: data.event } : {}),
      ...(data.eventHi !== undefined ? { eventHi: data.eventHi } : {}),
      ...(data.src !== undefined ? { src: data.src } : {}),
      ...(data.thumbnail !== undefined ? { thumbnail: data.thumbnail } : {}),
      ...(data.alt !== undefined ? { alt: data.alt } : {}),
      ...(data.videoProvider !== undefined ? { videoProvider: data.videoProvider } : {}),
      ...(data.focalPoint !== undefined ? { focalPoint: data.focalPoint } : {}),
      ...(data.aspectRatio !== undefined ? { aspectRatio: data.aspectRatio } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.date !== undefined ? { date: data.date } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });

  // Revalidate frontend
  revalidatePath("/gallery");
  revalidatePath("/");

  return Response.json({ success: true, item: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) return jsonError("Gallery item not found.", 404);

  // If the asset is hosted on R2, optionally attempt cleanup
  if (existing.src.includes(".r2.dev/")) {
    await deletePublicFileFromR2(existing.src).catch(() => {});
  }
  if (existing.thumbnail.includes(".r2.dev/") && existing.thumbnail !== existing.src) {
    await deletePublicFileFromR2(existing.thumbnail).catch(() => {});
  }

  await prisma.galleryItem.delete({ where: { id } });

  // Revalidate frontend
  revalidatePath("/gallery");
  revalidatePath("/");

  return Response.json({ success: true, message: "Gallery item deleted successfully." });
}
