import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdminApi } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

const updateMemberSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().trim().max(30).optional().nullable().or(z.literal("")),
  tier: z.enum(["FREE", "BASIC", "SILVER", "GOLD", "PLATINUM"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
  role: z.string().trim().max(100).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  pincode: z.string().trim().max(10).optional().nullable(),
  photoUrl: z.string().trim().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return jsonError("Member not found.", 404);

  return Response.json({ member });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateMemberSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid data.", 400);
  }

  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) return jsonError("Member not found.", 404);

  const updated = await prisma.member.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.email !== undefined ? { email: parsed.data.email || null } : {}),
      ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone || null } : {}),
      ...(parsed.data.tier !== undefined ? { tier: parsed.data.tier } : {}),
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      ...(parsed.data.role !== undefined ? { role: parsed.data.role || null } : {}),
      ...(parsed.data.address !== undefined ? { address: parsed.data.address || null } : {}),
      ...(parsed.data.city !== undefined ? { city: parsed.data.city || null } : {}),
      ...(parsed.data.state !== undefined ? { state: parsed.data.state || null } : {}),
      ...(parsed.data.pincode !== undefined ? { pincode: parsed.data.pincode || null } : {}),
      ...(parsed.data.photoUrl !== undefined ? { photoUrl: parsed.data.photoUrl || null } : {}),
    },
  });

  // Keep linked user account's tier & status in sync
  if (parsed.data.tier) {
    const userOrConditions: Prisma.UserWhereInput[] = [];
    if (existing.userId) userOrConditions.push({ id: existing.userId });
    if (existing.email) {
      userOrConditions.push({ email: existing.email });
      userOrConditions.push({ email: existing.email.toLowerCase() });
    }
    if (userOrConditions.length > 0) {
      await prisma.user
        .updateMany({
          where: { OR: userOrConditions },
          data: {
            membershipTier: parsed.data.tier,
            membershipStatus: parsed.data.status ?? existing.status,
          },
        })
        .catch(() => null);
    }
  }

  return Response.json({ success: true, member: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) return jsonError("Member not found.", 404);

  // 1. Delete associated membership records from Donation table so they no longer appear on Admin Dashboard
  const orConditions: Prisma.DonationWhereInput[] = [];
  if (existing.email) {
    orConditions.push({ donorEmail: existing.email });
    orConditions.push({ donorEmail: existing.email.toLowerCase() });
  }
  if (existing.phone) {
    orConditions.push({ donorMobile: existing.phone });
  }
  if (existing.name) {
    orConditions.push({ donorName: existing.name });
  }

  if (orConditions.length > 0) {
    const matchingDonations = await prisma.donation.findMany({
      where: {
        OR: [
          { type: "MEMBERSHIP" },
          { program: { contains: "membership", mode: "insensitive" } },
          { program: { contains: "patron", mode: "insensitive" } },
        ],
        AND: [
          {
            OR: orConditions,
          },
        ],
      },
      select: { id: true },
    });

    if (matchingDonations.length > 0) {
      const donationDbIds = matchingDonations.map((d) => d.id);
      await prisma.emailLog.deleteMany({ where: { donationId: { in: donationDbIds } } }).catch(() => null);
      await prisma.utrClaim.deleteMany({ where: { donationId: { in: donationDbIds } } }).catch(() => null);
      await prisma.paymentAlert.updateMany({
        where: { donationId: { in: donationDbIds } },
        data: { donationId: null },
      }).catch(() => null);
      await prisma.donation.deleteMany({ where: { id: { in: donationDbIds } } }).catch(() => null);
    }
  }

  // 2. Reset linked user's membership tier and status back to normal devotee (FREE / INACTIVE)
  const userOrConditions: Prisma.UserWhereInput[] = [];
  if (existing.userId) {
    userOrConditions.push({ id: existing.userId });
  }
  if (existing.email) {
    userOrConditions.push({ email: existing.email });
    userOrConditions.push({ email: existing.email.toLowerCase() });
  }
  if (existing.phone) {
    userOrConditions.push({ phone: existing.phone });
  }

  if (userOrConditions.length > 0) {
    await prisma.user.updateMany({
      where: { OR: userOrConditions },
      data: {
        membershipTier: "FREE",
        membershipStatus: "INACTIVE",
      },
    }).catch(() => null);
  }

  // 3. Delete the member record permanently
  await prisma.member.delete({ where: { id } });

  return Response.json({ success: true, deletedId: id });
}
