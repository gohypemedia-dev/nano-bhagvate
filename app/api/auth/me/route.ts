import { z } from "zod";
import { getCurrentUser } from "@/lib/server/user-auth";
import { prisma } from "@/lib/server/prisma";
import { jsonError } from "@/lib/server/http";
import { MEMBERSHIP_PLANS } from "@/lib/donation-config";
import { determineTier } from "@/lib/server/member-sync";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ user: null });
  }

  // Find membership from Member table or Donation table
  const [memberRecord, membershipDonation] = await Promise.all([
    prisma.member.findFirst({
      where: {
        OR: [
          { email: user.email },
          { email: user.email.toLowerCase() },
          ...(user.phone ? [{ phone: user.phone }] : []),
          ...(user.id ? [{ userId: user.id }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.donation.findFirst({
      where: {
        OR: [
          { donorEmail: user.email },
          { donorEmail: user.email.toLowerCase() },
          ...(user.phone ? [{ donorMobile: user.phone }] : []),
        ],
        type: "MEMBERSHIP",
        status: "VERIFIED",
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let membership = null;
  const userTier = (user as unknown as { membershipTier?: string }).membershipTier;
  const inferredTier =
    (memberRecord && memberRecord.tier !== "FREE" ? memberRecord.tier : null) ||
    (userTier && userTier !== "FREE" ? userTier : null) ||
    (membershipDonation
      ? determineTier(membershipDonation.program, membershipDonation.amountPaise)
      : null);

  const hasActiveMembership = Boolean(inferredTier || membershipDonation);

  if (hasActiveMembership) {
    const tier = (inferredTier || "BASIC").toUpperCase();
    const planKey = tier.toLowerCase();
    const plan = MEMBERSHIP_PLANS.find((p) => p.id === planKey) || MEMBERSHIP_PLANS[0];

    membership = {
      tier,
      tierName: plan.name,
      tierNameHi:
        tier === "PLATINUM"
          ? "प्लैटिनम संरक्षक"
          : tier === "GOLD"
          ? "स्वर्ण (गोल्ड) सदस्यता"
          : tier === "SILVER"
          ? "रजत (सिल्वर) सदस्यता"
          : "साधारण सदस्यता",
      status: memberRecord?.status || "ACTIVE",
      program: membershipDonation?.program || plan.name,
      donationId: membershipDonation?.donationId || null,
      amountPaise: membershipDonation?.amountPaise || plan.price * 100,
      verifiedAt: membershipDonation?.verifiedAt?.toISOString() || null,
      benefits: plan.benefits,
      price: plan.price,
    };
  }

  return Response.json({
    user: {
      ...user,
      membership,
    },
  });
}

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(10).optional(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Unauthorized. Please log in.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid data.", 400);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone || null } : {}),
      ...(parsed.data.address !== undefined ? { address: parsed.data.address || null } : {}),
      ...(parsed.data.city !== undefined ? { city: parsed.data.city || null } : {}),
      ...(parsed.data.state !== undefined ? { state: parsed.data.state || null } : {}),
      ...(parsed.data.pincode !== undefined ? { pincode: parsed.data.pincode || null } : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
      createdAt: true,
    },
  });

  return Response.json({ success: true, user: updated });
}
