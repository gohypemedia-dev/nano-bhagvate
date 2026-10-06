import { randomBytes } from "node:crypto";
import { donationIdSchema, utrSchema } from "@/lib/validation/donation";
import { tokenMatchesHash } from "@/lib/server/donation";
import { env } from "@/lib/server/env";
import { isUniqueViolation, jsonError, sniffImage } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { deletePrivateFile, putPrivateFile } from "@/lib/server/storage";

const DUPLICATE_UTR =
  "This UTR is already linked to another donation. Please check the number, or contact the Trust with your Donation ID.";

class AlreadySubmitted extends Error {}

// Accepts the donor's UTR and payment screenshot and moves the donation to
// PENDING_VERIFICATION. This does NOT mark the payment as received.
export async function POST(request: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  if (!donationIdSchema.safeParse(donationId).success) return jsonError("Donation not found.", 404);

  const byIp = await rateLimit("proof-ip", clientIp(request), 10, 10 * 60);
  if (!byIp.ok) return tooManyRequests(byIp.retryAfterSeconds);

  const config = env();
  const maxBytes = Math.floor(config.MAX_UPLOAD_MB * 1024 * 1024);
  const tooLarge = `The screenshot must be smaller than ${config.MAX_UPLOAD_MB} MB.`;
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes + 64 * 1024) return jsonError(tooLarge, 413);

  const form = await request.formData().catch(() => null);
  if (!form) return jsonError("Invalid submission.", 400);

  const token = form.get("submitToken");
  const file = form.get("paymentScreenshot");
  const utr = utrSchema.safeParse(form.get("utr") ?? "");
  if (!utr.success) return jsonError(utr.error.issues[0].message, 400, { field: "utr" });
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Please attach a screenshot of your payment.", 400, { field: "paymentScreenshot" });
  }
  if (file.size > maxBytes) return jsonError(tooLarge, 413, { field: "paymentScreenshot" });

  const donation = await prisma.donation.findUnique({
    where: { donationId },
    select: { id: true, status: true, submitTokenHash: true },
  });
  if (!donation || typeof token !== "string" || !tokenMatchesHash(token, donation.submitTokenHash)) {
    return jsonError("We couldn't match this submission to your donation. Please start a new donation.", 403);
  }
  // Counted only after the token check, so strangers can't use up a donor's attempts.
  const byDonation = await rateLimit("proof-donation", donationId, 8, 10 * 60);
  if (!byDonation.ok) return tooManyRequests(byDonation.retryAfterSeconds);
  if (donation.status !== "PENDING_PAYMENT") {
    return jsonError("Payment details for this donation have already been submitted.", 409, { status: donation.status });
  }
  if (await prisma.utrClaim.findUnique({ where: { utr: utr.data } })) {
    return jsonError(DUPLICATE_UTR, 409, { field: "utr" });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const image = sniffImage(bytes);
  if (!image) return jsonError("Please upload a JPG, PNG or WEBP image.", 415, { field: "paymentScreenshot" });

  const key = `private/donations/${donationId}/payment-${randomBytes(4).toString("hex")}.${image.ext}`;
  await putPrivateFile(key, bytes, image.type);

  try {
    await prisma.$transaction(async (tx) => {
      // Conditional update: only one submission can ever win.
      const updated = await tx.donation.updateMany({
        where: { id: donation.id, status: "PENDING_PAYMENT" },
        data: { status: "PENDING_VERIFICATION", utr: utr.data, screenshotKey: key, proofSubmittedAt: new Date() },
      });
      if (updated.count === 0) throw new AlreadySubmitted();
      await tx.utrClaim.create({ data: { utr: utr.data, donationId: donation.id } });
    });
  } catch (e) {
    await deletePrivateFile(key).catch(() => {});
    if (e instanceof AlreadySubmitted) {
      return jsonError("Payment details for this donation have already been submitted.", 409);
    }
    if (isUniqueViolation(e)) return jsonError(DUPLICATE_UTR, 409, { field: "utr" });
    throw e;
  }

  return Response.json(
    { success: true, status: "PENDING_VERIFICATION", donationId },
    { headers: { "Cache-Control": "no-store" } },
  );
}
