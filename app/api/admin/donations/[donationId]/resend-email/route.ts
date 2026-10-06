import { requireAdminApi } from "@/lib/server/auth";
import { sendConfirmationEmail } from "@/lib/server/email";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;
  const { donationId } = await params;

  const donation = await prisma.donation.findUnique({ where: { donationId } });
  if (!donation) return jsonError("Donation not found.", 404);
  if (donation.status !== "VERIFIED") return jsonError("Only verified donations get a confirmation email.", 409);

  const email = await sendConfirmationEmail(donation);
  return Response.json(
    { success: email.status === "SENT", emailStatus: email.status, emailError: email.error },
    { headers: { "Cache-Control": "no-store" } },
  );
}
