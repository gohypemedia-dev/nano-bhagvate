import { after } from "next/server";
import { z } from "zod";
import { donationIdSchema } from "@/lib/validation/donation";
import { syncBankAlerts } from "@/lib/server/bank-alerts";
import { tokenMatchesHash } from "@/lib/server/donation";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

const schema = z.object({ submitToken: z.string().min(20).max(100) });

// Gives the background inbox check time to finish on serverless hosts.
export const maxDuration = 30;

// Polled by the donor's payment screen. While the donation awaits payment or approval it
// also triggers a (throttled) check of the bank-alert inbox.
export async function POST(request: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  if (!donationIdSchema.safeParse(donationId).success) return jsonError("Donation not found.", 404);

  const limit = await rateLimit("status-ip", clientIp(request), 300, 10 * 60);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const body = schema.safeParse(await request.json().catch(() => null));
  const donation = await prisma.donation.findUnique({
    where: { donationId },
    select: { status: true, emailStatus: true, submitTokenHash: true },
  });
  if (!donation || !body.success || !tokenMatchesHash(body.data.submitToken, donation.submitTokenHash)) {
    return jsonError("Donation not found.", 404);
  }

  // Check the inbox after replying, so the donor never waits on Gmail.
  // A match shows up on the next poll a few seconds later.
  if (donation.status === "PENDING_PAYMENT" || donation.status === "PENDING_VERIFICATION") {
    after(async () => {
      try {
        await syncBankAlerts();
      } catch (e) {
        console.error("[bank-alerts] inbox check failed:", e instanceof Error ? e.message : e);
      }
    });
  }

  return Response.json(
    { status: donation.status, emailStatus: donation.emailStatus },
    { headers: { "Cache-Control": "no-store" } },
  );
}
