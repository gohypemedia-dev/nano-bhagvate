import "server-only";

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

export function isUniqueViolation(e: unknown, field?: string) {
  if (typeof e !== "object" || e === null || (e as { code?: string }).code !== "P2002") return false;
  if (!field) return true;
  const meta = (e as {
    meta?: {
      target?: string[] | string;
      driverAdapterError?: { cause?: { constraint?: { fields?: string[] } } };
    };
  }).meta;
  // The pg driver adapter reports the columns under driverAdapterError (quoted, e.g. "\"messageId\"").
  const fields = [
    ...(Array.isArray(meta?.target) ? meta.target : meta?.target ? [meta.target] : []),
    ...(meta?.driverAdapterError?.cause?.constraint?.fields ?? []),
  ].map((f) => f.replace(/"/g, ""));
  return fields.some((f) => f === field || f.includes(field));
}

// Identifies an image by its first bytes. The browser-supplied MIME type is not trusted.
export function sniffImage(bytes: Uint8Array): { ext: "jpg" | "png" | "webp"; type: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b)) return { ext: "png", type: "image/png" };
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  return null;
}
