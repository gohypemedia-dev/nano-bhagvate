import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

// Payment screenshots are private. They are never written under /public and
// are only served through the admin screenshot route after an auth check.

let s3: S3Client | undefined;

function r2() {
  const config = env();
  s3 ??= new S3Client({
    region: "auto",
    endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.R2_ACCESS_KEY_ID!, secretAccessKey: config.R2_SECRET_ACCESS_KEY! },
  });
  return { client: s3, bucket: config.R2_BUCKET! };
}

function localPath(key: string) {
  const root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), env().LOCAL_STORAGE_DIR);
  const full = path.resolve(/*turbopackIgnore: true*/ root, key);
  if (!full.startsWith(root + path.sep)) throw new Error("Invalid storage key");
  return full;
}

export async function putPrivateFile(key: string, bytes: Uint8Array, contentType: string) {
  if (env().STORAGE_DRIVER === "r2") {
    const { client, bucket } = r2();
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: contentType }));
    return;
  }
  const file = localPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, bytes);
}

export async function deletePrivateFile(key: string) {
  if (env().STORAGE_DRIVER === "r2") {
    const { client, bucket } = r2();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return;
  }
  await rm(localPath(key), { force: true });
}

// For R2: redirect to a signed URL that expires in 60 seconds.
// For local storage: stream the bytes directly.
export async function privateFileResponse(key: string) {
  const noStore = { "Cache-Control": "private, no-store" };
  if (env().STORAGE_DRIVER === "r2") {
    const { client, bucket } = r2();
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: key, ResponseCacheControl: "private, no-store" }),
      { expiresIn: 60 },
    );
    return new Response(null, { status: 302, headers: { Location: url, ...noStore } });
  }
  const bytes = await readFile(localPath(key));
  const ext = path.extname(key).slice(1);
  const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": type, "X-Content-Type-Options": "nosniff", ...noStore },
  });
}
