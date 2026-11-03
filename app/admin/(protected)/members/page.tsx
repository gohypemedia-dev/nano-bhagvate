import { requireAdminPage } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ensureVerifiedMembershipsSynced } from "@/lib/server/member-sync";
import MemberManager, { AdminMemberItem, MembershipTier } from "@/components/admin/members/MemberManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Member Management | Namo Bhagwate Admin",
};

export default async function AdminMembersPage() {
  await requireAdminPage();

  // Sync verified memberships non-blockingly in the background
  void ensureVerifiedMembershipsSynced();

  const rawMembers = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formattedMembers: AdminMemberItem[] = rawMembers.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    tier: (m.tier as MembershipTier) || "BASIC",
    status: (m.status as "ACTIVE" | "INACTIVE" | "EXPIRED") || "ACTIVE",
    role: m.role,
    address: m.address,
    city: m.city,
    state: m.state,
    pincode: m.pincode,
    photoUrl: m.photoUrl,
    validUntil: m.validUntil ? m.validUntil.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
  }));

  return <MemberManager initialMembers={formattedMembers} />;
}
