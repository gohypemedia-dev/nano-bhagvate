import { z } from "zod";
import { requireAdminApi } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

const schema = z.object({ note: z.string().trim().max(1000).optional() });

class NotPending extends Error {}

export async function POST(request: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;
  const { donationId } = await params;
  const parsed = schema.safeParse((await request.json().catch(() => ({}))) ?? {});
  if (!parsed.success) return jsonError("The note must be under 1000 characters.", 400);
  const { note } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.donation.updateMany({
        where: { donationId, status: "PENDING_VERIFICATION" },
        data: { status: "REJECTED", rejectedAt: new Date(), verifiedById: admin.id, ...(note ? { adminNote: note } : {}) },
      });
      if (updated.count === 0) throw new NotPending();
      // Free the UTR so a genuine payment with this UTR can still be submitted.
      await tx.utrClaim.deleteMany({ where: { donation: { donationId } } });
    });
  } catch (e) {
    if (!(e instanceof NotPending)) throw e;
    const existing = await prisma.donation.findUnique({ where: { donationId }, select: { status: true } });
    if (!existing) return jsonError("Donation not found.", 404);
    return jsonError(`This donation is ${existing.status.replace("_", " ").toLowerCase()} and can't be rejected.`, 409);
  }

  return Response.json({ success: true, status: "REJECTED" }, { headers: { "Cache-Control": "no-store" } });
}
