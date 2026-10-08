import { sameOrigin } from "@/lib/server/auth";
import { confirmPayment } from "@/lib/server/bank-alerts";
import { sha256 } from "@/lib/server/donation";
import { prisma } from "@/lib/server/prisma";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

// Form posted from /admin/approve/[token], the page linked in the "payment to approve"
// email. Whoever holds the emailed link may approve or reject that one donation.
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const limit = await rateLimit("approve-ip", clientIp(request), 30, 10 * 60);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const { token } = await params;
  const back = new URL(`/admin/approve/${encodeURIComponent(token)}`, request.url);
  if (!/^[\w-]{40,64}$/.test(token)) return Response.redirect(back, 303);

  const donation = await prisma.donation.findUnique({
    where: { approvalTokenHash: sha256(token) },
    select: { id: true, status: true },
  });
  const action = (await request.formData().catch(() => null))?.get("action");
  if (!donation || donation.status !== "PENDING_VERIFICATION") return Response.redirect(back, 303);

  if (action === "approve") {
    // Same path as an automatic bank match: marks VERIFIED and emails the donor.
    const result = await confirmPayment(donation.id, { source: "ADMIN", approvedBy: "Approval email link" });
    if (result.ok) {
      await prisma.donation.update({ where: { id: donation.id }, data: { adminNote: "Approved from the payment email link." } });
    }
  } else if (action === "reject") {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.donation.updateMany({
        where: { id: donation.id, status: "PENDING_VERIFICATION" },
        data: { status: "REJECTED", rejectedAt: new Date(), adminNote: "Rejected from the payment email link: payment not received." },
      });
      if (updated.count === 1) await tx.utrClaim.deleteMany({ where: { donationId: donation.id } });
    });
  }

  return Response.redirect(back, 303);
}
