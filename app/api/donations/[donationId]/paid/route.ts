import { after } from "next/server";
import { z } from "zod";
import { donationIdSchema } from "@/lib/validation/donation";
import { generateToken, sha256, tokenMatchesHash } from "@/lib/server/donation";
import { sendApprovalRequestEmail } from "@/lib/server/email";
import { env } from "@/lib/server/env";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

const schema = z.object({ submitToken: z.string().min(20).max(100) });

export const maxDuration = 30;

// The donor taps "I have completed the payment". No UTR or screenshot is asked for:
// the donation moves to PENDING_VERIFICATION and the Trust gets an email with a
// one-time link to approve it once the money shows up in their UPI account.
// The bank-alert matcher can still confirm it automatically in the meantime.
export async function POST(request: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  if (!donationIdSchema.safeParse(donationId).success) return jsonError("Donation not found.", 404);

  const limit = await rateLimit("paid-ip", clientIp(request), 20, 10 * 60);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const body = schema.safeParse(await request.json().catch(() => null));
  const donation = await prisma.donation.findUnique({
    where: { donationId },
    select: { status: true, submitTokenHash: true },
  });
  if (!donation || !body.success || !tokenMatchesHash(body.data.submitToken, donation.submitTokenHash)) {
    return jsonError("Donation not found.", 404);
  }

  // Conditional update: tapping twice sends only one approval email.
  const approvalToken = generateToken();
  const updated = await prisma.donation.updateMany({
    where: { donationId, status: "PENDING_PAYMENT" },
    data: { status: "PENDING_VERIFICATION", proofSubmittedAt: new Date(), approvalTokenHash: sha256(approvalToken) },
  });

  if (updated.count === 1) {
    // The approver opens this link from their phone/inbox, so it must be the public site:
    // NEXT_PUBLIC_APP_URL, else the Vercel production domain (set by Vercel), else this request's origin.
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    const base = (env().NEXT_PUBLIC_APP_URL ?? (vercel ? `https://${vercel}` : new URL(request.url).origin)).replace(/\/+$/, "");
    const approveUrl = `${base}/admin/approve/${approvalToken}`;
    after(async () => {
      const fresh = await prisma.donation.findUniqueOrThrow({ where: { donationId } });
      await sendApprovalRequestEmail(fresh, approveUrl);
    });
  }

  const current = updated.count === 1 ? "PENDING_VERIFICATION" : donation.status;
  return Response.json({ status: current }, { headers: { "Cache-Control": "no-store" } });
}
