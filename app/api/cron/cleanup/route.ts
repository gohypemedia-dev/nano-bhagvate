import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/server/env";
import { prisma } from "@/lib/server/prisma";
import { syncBankAlerts } from "@/lib/server/bank-alerts";

// Daily housekeeping, called by Vercel Cron (see vercel.json) with
// "Authorization: Bearer $CRON_SECRET".
export async function GET(request: Request) {
  const secret = env().CRON_SECRET;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // First pick up any bank alerts that arrived while nobody was waiting on the site.
  const bank = await syncBankAlerts({ force: true }).catch((e) => ({ ran: false, reason: String(e) }));

  const now = new Date();
  const [cancelled, rateLimits, sessions] = await prisma.$transaction([
    prisma.donation.updateMany({
      where: { status: "PENDING_PAYMENT", createdAt: { lt: new Date(now.getTime() - 48 * 60 * 60 * 1000) } },
      data: { status: "CANCELLED" },
    }),
    prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }),
    prisma.adminSession.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);

  return Response.json({
    bankSync: bank,
    cancelledDonations: cancelled.count,
    expiredRateLimits: rateLimits.count,
    expiredSessions: sessions.count,
  });
}
