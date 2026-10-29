import { prisma } from "@/lib/server/prisma";

export function determineTier(
  program?: string | null,
  amountPaise?: number | null
): "BASIC" | "SILVER" | "GOLD" | "PLATINUM" {
  const prog = (program || "").toLowerCase();
  const amt = (amountPaise ?? 0) / 100;
  if (prog.includes("platinum") || amt >= 51000) return "PLATINUM";
  if (prog.includes("gold") || amt >= 11000) return "GOLD";
  if (prog.includes("silver") || amt >= 5100) return "SILVER";
  return "BASIC";
}

export async function syncDonationToMember(donation: {
  donorName: string;
  donorEmail: string;
  donorMobile?: string | null;
  program?: string | null;
  amountPaise?: number | null;
}) {
  const tier = determineTier(donation.program, donation.amountPaise);

  const linkedUser = donation.donorEmail
    ? await prisma.user.findFirst({
        where: {
          OR: [
            { email: donation.donorEmail },
            { email: donation.donorEmail.toLowerCase() },
          ],
        },
        select: { id: true },
      })
    : null;

  if (donation.donorEmail) {
    await prisma.user.updateMany({
      where: {
        OR: [
          { email: donation.donorEmail },
          { email: donation.donorEmail.toLowerCase() },
        ],
      },
      data: {
        membershipTier: tier,
        membershipStatus: "ACTIVE",
      },
    }).catch(() => null);
  }

  const existing = await prisma.member.findFirst({
    where: {
      OR: [{ email: donation.donorEmail }, { name: donation.donorName }],
    },
  });

  if (existing) {
    return prisma.member.update({
      where: { id: existing.id },
      data: {
        tier,
        phone: existing.phone || donation.donorMobile || null,
        status: "ACTIVE",
        ...(linkedUser && !existing.userId ? { userId: linkedUser.id } : {}),
      },
    });
  }

  return prisma.member.create({
    data: {
      name: donation.donorName,
      email: donation.donorEmail,
      phone: donation.donorMobile || null,
      tier,
      status: "ACTIVE",
      role: "Devotee Member",
      ...(linkedUser ? { userId: linkedUser.id } : {}),
    },
  });
}

export async function ensureVerifiedMembershipsSynced() {
  try {
    const verifiedMemberships = await prisma.donation.findMany({
      where: {
        type: "MEMBERSHIP",
        status: "VERIFIED",
      },
      select: {
        donorName: true,
        donorEmail: true,
        donorMobile: true,
        program: true,
        amountPaise: true,
      },
    });

    for (const d of verifiedMemberships) {
      await syncDonationToMember(d).catch(() => null);
    }
  } catch (err) {
    console.warn("Failed to auto-sync verified memberships:", err);
  }
}
