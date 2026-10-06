import { requireAdminApi } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { privateFileResponse } from "@/lib/server/storage";

export async function GET(request: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;
  const { donationId } = await params;

  const donation = await prisma.donation.findUnique({ where: { donationId }, select: { screenshotKey: true } });
  if (!donation?.screenshotKey) return jsonError("No screenshot for this donation.", 404);
  return privateFileResponse(donation.screenshotKey);
}
