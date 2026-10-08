import { z } from "zod";
import { donationIdSchema } from "@/lib/validation/donation";
import { requireAdminApi } from "@/lib/server/auth";
import { confirmPayment } from "@/lib/server/bank-alerts";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

const schema = z.object({ donationId: donationIdSchema });

// Admin links a bank alert that couldn't be matched automatically to a donation.
export async function POST(request: Request, { params }: { params: Promise<{ alertId: string }> }) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;
  const { alertId } = await params;

  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return jsonError("Enter a Donation ID like DON-20261006-A8F32.", 400);

  const alert = await prisma.paymentAlert.findUnique({ where: { id: alertId } });
  if (!alert) return jsonError("Bank alert not found.", 404);
  if (alert.status === "MATCHED") return jsonError("This bank alert is already matched.", 409);

  const donation = await prisma.donation.findUnique({
    where: { donationId: body.data.donationId },
    select: { id: true, amountPaise: true, status: true },
  });
  if (!donation) return jsonError("No donation with that ID.", 404);
  if (donation.amountPaise !== alert.amountPaise) {
    return jsonError(
      `Amounts differ: the bank received ₹${(alert.amountPaise / 100).toFixed(2)} but the donation is ₹${(donation.amountPaise / 100).toFixed(2)}.`,
      409,
    );
  }

  const result = await confirmPayment(donation.id, { utr: alert.utr ?? undefined, alertId: alert.id, adminId: admin.id, source: "ADMIN", approvedBy: `${admin.name} (dashboard, bank alert match)` });
  if (!result.ok) {
    return jsonError(
      result.reason === "utr-in-use" ? `UTR ${alert.utr} is already linked to another donation.` : "That donation is not awaiting payment.",
      409,
    );
  }
  return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
