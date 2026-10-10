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

// Identifies either image or video media by signature or extension
export function sniffMedia(bytes: Uint8Array, fallbackExt?: string): { isVideo: boolean; ext: string; type: string } | null {
  const img = sniffImage(bytes);
  if (img) return { isVideo: false, ...img };

  // MP4 check (ftyp box at byte 4)
  if (bytes.length >= 8 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    return { isVideo: true, ext: "mp4", type: "video/mp4" };
  }
  // WebM check (EBML header 0x1A 0x45 0xDF 0xA3)
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return { isVideo: true, ext: "webm", type: "video/webm" };
  }
  // Fallbacks by safe extension
  const ext = fallbackExt?.toLowerCase().replace(/^\./, "");
  if (ext === "mp4" || ext === "m4v") return { isVideo: true, ext: "mp4", type: "video/mp4" };
  if (ext === "webm") return { isVideo: true, ext: "webm", type: "video/webm" };
  if (ext === "mov") return { isVideo: true, ext: "mov", type: "video/quicktime" };

  return null;
}

