import "server-only";
import { prisma } from "./prisma";
import { sha256 } from "./donation";

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

type Result = { ok: true } | { ok: false; retryAfterSeconds: number };

// Fixed-window counter stored in Postgres. One atomic upsert per call, so it
// is safe across serverless instances without Redis.
export async function rateLimit(bucket: string, identifier: string, limit: number, windowSeconds: number): Promise<Result> {
  const key = `${bucket}:${sha256(identifier).slice(0, 32)}`;
  const window = `${windowSeconds} seconds`;

  // All time maths happens in Postgres, in UTC (the same convention Prisma uses for
  // DateTime columns), so the app server's time zone can't skew the window.
  const rows = await prisma.$queryRaw<{ count: number; retryAfter: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, (now() AT TIME ZONE 'UTC') + ${window}::interval)
    ON CONFLICT ("key") DO UPDATE SET
      "count"   = CASE WHEN "RateLimit"."resetAt" <= (now() AT TIME ZONE 'UTC') THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" <= (now() AT TIME ZONE 'UTC') THEN EXCLUDED."resetAt" ELSE "RateLimit"."resetAt" END
    RETURNING "count", CEIL(EXTRACT(EPOCH FROM ("resetAt" - (now() AT TIME ZONE 'UTC'))))::int AS "retryAfter"`;

  const row = rows[0];
  if (row.count <= limit) return { ok: true };
  return { ok: false, retryAfterSeconds: Math.max(1, row.retryAfter) };
}

export function tooManyRequests(retryAfterSeconds: number) {
  return Response.json(
    { error: "Too many attempts. Please wait a few minutes and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
