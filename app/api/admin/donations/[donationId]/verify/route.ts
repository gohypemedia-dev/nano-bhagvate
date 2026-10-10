import { z } from "zod";
import { requireAdminApi } from "@/lib/server/auth";
import { sendApprovedNoticeEmail, sendConfirmationEmail } from "@/lib/server/email";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

const schema = z.object({ note: z.string().trim().max(1000).optional() });

// Admin confirms the money arrived in the Trust's account. This is the only
// place that sends the confirmation email.
export async function POST(request: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;
  const { donationId } = await params;
  const parsed = schema.safeParse((await request.json().catch(() => ({}))) ?? {});
  if (!parsed.success) return jsonError("The note must be under 1000 characters.", 400);
  const { note } = parsed.data;

  // Conditional update: a second click (or a second admin) changes nothing and sends no second email.
  const updated = await prisma.donation.updateMany({
    where: { donationId, status: { in: ["PENDING_PAYMENT", "PENDING_VERIFICATION"] } },
    data: { status: "VERIFIED", verificationSource: "ADMIN", verifiedById: admin.id, verifiedAt: new Date(), ...(note ? { adminNote: note } : {}) },
  });
  if (updated.count === 0) {
    const existing = await prisma.donation.findUnique({ where: { donationId }, select: { status: true } });
    if (!existing) return jsonError("Donation not found.", 404);
    return jsonError(`This donation is ${existing.status.replace("_", " ").toLowerCase()} and can't be verified.`, 409);
  }

  const donation = await prisma.donation.findUniqueOrThrow({ where: { donationId } });
  const email = await sendConfirmationEmail(donation);
  await sendApprovedNoticeEmail(await prisma.donation.findUniqueOrThrow({ where: { donationId } }), `${admin.name} (dashboard)`);

  return Response.json(
    { success: true, status: "VERIFIED", emailStatus: email.status, emailError: email.error },
    { headers: { "Cache-Control": "no-store" } },
  );
}
