import { after } from "next/server";
import { findPlan } from "@/lib/donation-config";
import { createDonationSchema } from "@/lib/validation/donation";
import { approvalLink, buildUpiUri, generateDonationId, generateToken, sha256 } from "@/lib/server/donation";
import { sendApprovalRequestEmail } from "@/lib/server/email";
import { env } from "@/lib/server/env";
import { isUniqueViolation, jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

// Gives the background approval email time to send on serverless hosts.
export const maxDuration = 30;

// Creates a payment intent (status PENDING_PAYMENT), returns the UPI QR data and
// emails the approvers a link to approve it once the money arrives.
export async function POST(request: Request) {
  const limit = await rateLimit("donation-create", clientIp(request), 10, 10 * 60);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const body = await request.json().catch(() => null);
  const config = env();
  const upiId = config.UPI_ID;
  if (!upiId) {
    console.error("[donations] UPI_ID is not set; refusing to create donations.");
    return jsonError("Online donations are not available right now. Please try again later.", 503);
  }
  const parsed = createDonationSchema(config.MIN_DONATION_AMOUNT).safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return jsonError(issue?.message ?? "Please check your details.", 400, { field: issue?.path[0] });
  }

  const { name, email, mobile, program, amount, planId } = parsed.data;
  const plan = planId ? findPlan(planId) : undefined;
  // Membership prices always come from the server-side plan list.
  const rupees = plan ? plan.price : amount!;

  // With AUTO_CONFIRM_BANK_EMAILS, bank alerts are matched by amount alone, so no two waiting
  // donations may share one: a taken amount gets a few paise added (₹500 → ₹500.01).
  // Otherwise a person approves each payment (the UPI app shows who paid), so the donor
  // pays exactly the amount they chose.
  const base = rupees * 100;
  const taken = new Set(
    config.AUTO_CONFIRM_BANK_EMAILS
      ? (
          await prisma.donation.findMany({
            where: {
              status: { in: ["PENDING_PAYMENT", "PENDING_VERIFICATION"] },
              amountPaise: { gte: base, lt: base + 100 },
              createdAt: { gte: new Date(Date.now() - config.AUTO_MATCH_WINDOW_MINUTES * 60_000) },
            },
            select: { amountPaise: true },
          })
        ).map((d) => d.amountPaise)
      : [],
  );
  let amountPaise = base;
  while (taken.has(amountPaise) && amountPaise < base + 99) amountPaise++;
  const submitToken = generateToken();
  const approvalToken = generateToken();

  for (let attempt = 1; ; attempt++) {
    const donationId = generateDonationId();
    const upiUri = buildUpiUri(upiId, donationId, amountPaise);
    try {
      await prisma.donation.create({
        data: {
          donationId,
          type: plan ? "MEMBERSHIP" : "DONATION",
          program: plan ? plan.name : program || "General Donation",
          donorName: name,
          donorEmail: email,
          donorMobile: mobile || null,
          amountPaise,
          upiUri,
          submitTokenHash: sha256(submitToken),
          approvalTokenHash: sha256(approvalToken),
        },
      });
      // Tell the approvers right away, so they can approve as soon as the money shows up
      // in the UPI app, whether or not the donor taps "I have completed the payment".
      const approveUrl = approvalLink(request, approvalToken);
      after(async () => {
        const created = await prisma.donation.findUniqueOrThrow({ where: { donationId } });
        await sendApprovalRequestEmail(created, approveUrl);
      });
      return Response.json(
        {
          donationId,
          amount: amountPaise / 100,
          upiId,
          upiName: config.UPI_NAME,
          accountLabel: config.UPI_ACCOUNT_LABEL ?? null,
          qrData: upiUri,
          submitToken,
          status: "PENDING_PAYMENT",
        },
        { status: 201, headers: { "Cache-Control": "no-store" } },
      );
    } catch (e) {
      if (attempt < 3 && isUniqueViolation(e, "donationId")) continue;
      throw e;
    }
  }
}
