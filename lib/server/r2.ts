import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

let s3Client: S3Client | undefined;

export function getR2PublicBaseUrl(): string {
  return (process.env.R2_PUBLIC_URL || "https://pub-6c55b4a33c034944bc9030fd94d673db.r2.dev").replace(/\/+$/, "");
}

export function isR2Configured(): boolean {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  return Boolean(accountId && accessKeyId && secretAccessKey && bucket);
}

function getClient() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET || "namo";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 credentials (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are missing in .env. Please configure them to upload to Cloudflare R2."
    );
  }

  s3Client ??= new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return { client: s3Client, bucket };
}

/**
 * Uploads a public asset (image/video thumbnail) to Cloudflare R2
 * and returns its public URL on https://pub-...r2.dev.
 */
export async function uploadPublicFileToR2(
  key: string,
  bytes: Uint8Array | Buffer,
  contentType: string
): Promise<string> {
  const { client, bucket } = getClient();
  const normalizedKey = key.replace(/^\/+/, "");

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: normalizedKey,
      Body: bytes,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const baseUrl = getR2PublicBaseUrl();
  return `${baseUrl}/${normalizedKey}`;
}

/**
 * Deletes a file from Cloudflare R2 by key or full URL.
 */
export async function deletePublicFileFromR2(keyOrUrl: string): Promise<void> {
  if (!isR2Configured()) return;
  const { client, bucket } = getClient();

  let key = keyOrUrl;
  const baseUrl = getR2PublicBaseUrl();
  if (key.startsWith(baseUrl)) {
    key = key.slice(baseUrl.length).replace(/^\/+/, "");
  } else if (key.includes(".r2.dev/")) {
    key = key.split(".r2.dev/")[1].replace(/^\/+/, "");
  }

  if (!key) return;

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (err) {
    console.error("Failed to delete object from R2:", err);
  }
}
