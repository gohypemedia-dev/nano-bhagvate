import { after } from "next/server";
import { z } from "zod";
import { donationIdSchema } from "@/lib/validation/donation";
import { approvalLink, generateToken, sha256, tokenMatchesHash } from "@/lib/server/donation";
import { sendApprovalRequestEmail } from "@/lib/server/email";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

const schema = z.object({ submitToken: z.string().min(20).max(100) });

export const maxDuration = 30;

// The donor taps "I have completed the payment". No UTR or screenshot is asked for:
// the donation moves to PENDING_VERIFICATION, which the approval page and the dashboard
// show as "donor says they paid". The approval email already went out when the QR was
// created, so no second email is sent (except for donations created before that change).
export async function POST(request: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  if (!donationIdSchema.safeParse(donationId).success) return jsonError("Donation not found.", 404);

  const limit = await rateLimit("paid-ip", clientIp(request), 20, 10 * 60);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const body = schema.safeParse(await request.json().catch(() => null));
  const donation = await prisma.donation.findUnique({
    where: { donationId },
    select: { status: true, submitTokenHash: true, approvalTokenHash: true },
  });
  if (!donation || !body.success || !tokenMatchesHash(body.data.submitToken, donation.submitTokenHash)) {
    return jsonError("Donation not found.", 404);
  }

  // Older donations have no approval link yet: create one and email it now.
  const approvalToken = donation.approvalTokenHash ? null : generateToken();
  // Conditional update: tapping twice changes nothing the second time.
  const updated = await prisma.donation.updateMany({
    where: { donationId, status: "PENDING_PAYMENT" },
    data: {
      status: "PENDING_VERIFICATION",
      proofSubmittedAt: new Date(),
      ...(approvalToken ? { approvalTokenHash: sha256(approvalToken) } : {}),
    },
  });

  if (updated.count === 1 && approvalToken) {
    const approveUrl = approvalLink(request, approvalToken);
    after(async () => {
      const fresh = await prisma.donation.findUniqueOrThrow({ where: { donationId } });
      await sendApprovalRequestEmail(fresh, approveUrl);
    });
  }

  const current = updated.count === 1 ? "PENDING_VERIFICATION" : donation.status;
  return Response.json({ status: current }, { headers: { "Cache-Control": "no-store" } });
}
