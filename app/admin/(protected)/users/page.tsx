import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireAdminPage } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { formatIST } from "@/lib/admin-format";
import { pageNumber, queryValue, USER_PAGE_SIZE, userProfileSelect, type UserSearchParams } from "@/lib/server/admin-users";
import { cellClass, panelClass, UserEmpty, UserPagination, UserStats, UserStatus } from "@/components/admin/users/UserWidgets";
import AutoRefresh from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users | Namo Bhagwate Admin" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<UserSearchParams> }) {
  await requireAdminPage();
  const params = await searchParams;
  const q = queryValue(params.q).trim().slice(0, 150);
  const filter = queryValue(params.filter);
  const now = new Date();
  const where: Prisma.UserWhereInput = {
    ...(q ? { OR: [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ] } : {}),
    ...(filter === "with-orders" ? { orders: { some: {} } } : {}),
    ...(filter === "no-orders" ? { orders: { none: {} } } : {}),
    ...(filter === "signed-in" ? { sessions: { some: { expiresAt: { gt: now } } } } : {}),
  };
  const [total, allUsers, signedIn, withOrders, recentUsers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.count(),
    prisma.user.count({ where: { sessions: { some: { expiresAt: { gt: now } } } } }),
    prisma.user.count({ where: { orders: { some: {} } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(now.getTime() - 30 * 86400000) } } }),
  ]);
  const page = Math.min(pageNumber(params.page), Math.max(1, Math.ceil(total / USER_PAGE_SIZE)));
  const users = await prisma.user.findMany({
    where, orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * USER_PAGE_SIZE, take: USER_PAGE_SIZE,
    select: {
      ...userProfileSelect,
      _count: { select: { orders: true, sessions: { where: { expiresAt: { gt: now } } } } },
      activities: { where: { type: { in: ["LOGIN", "REGISTER"] } }, orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
  });
  // Resolve membership records in one query for this page, including older email-only records.
  const members = users.length ? await prisma.member.findMany({
    where: { OR: users.map((user) => ({ OR: [
      { userId: user.id },
      { userId: null, email: { equals: user.email, mode: "insensitive" as const } },
    ] })) },
    orderBy: { createdAt: "desc" },
    select: { userId: true, email: true, tier: true, status: true, validUntil: true },
  }) : [];
  function href(nextPage: number) {
    const query = new URLSearchParams({ q, filter, page: String(nextPage) });
    return `/admin/users?${query}`;
  }

  return <div className="space-y-5 text-[#2B201A]">
    <AutoRefresh seconds={60} />
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold font-editorial">Users</h1>
      <p className="mt-1 text-sm text-[#2B201A]/65">Every registered account, including non-members and users with no transactions.</p>
    </div>
    <UserStats stats={[
      { label: "Registered users", value: allUsers },
      { label: "Users with valid sessions", value: signedIn },
      { label: "Users with book orders", value: withOrders },
      { label: "Joined in the last 30 days", value: recentUsers },
    ]} />
    <div className={panelClass}>
      <form action="/admin/users" className="flex flex-wrap gap-3 border-b border-[#E7D8C8] p-4">
        <div className="flex-1 min-w-48">
          <label htmlFor="user-search" className="sr-only">Search by name, email or phone</label>
          <input id="user-search" name="q" defaultValue={q} placeholder="Search name, email or phone…" maxLength={150} className="w-full rounded-lg border border-[#E7D8C8] px-3 py-2 text-sm focus:outline-[#E86F1D]" />
        </div>
        <label className="sr-only" htmlFor="user-filter">Filter users</label>
        <select id="user-filter" name="filter" defaultValue={filter} className="rounded-lg border border-[#E7D8C8] bg-white px-3 py-2 text-sm">
          <option value="">All users</option>
          <option value="signed-in">With valid sessions</option>
          <option value="with-orders">With book orders</option>
          <option value="no-orders">No book orders</option>
        </select>
        <button className="rounded-lg bg-[#2B201A] px-4 py-2 text-sm font-semibold text-white">Search</button>
        {(q || filter) && <Link href="/admin/users" className="px-2 py-2 text-sm underline">Clear</Link>}
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#FFFDF9] text-xs text-[#2B201A]/65"><tr>
            {['User', 'Membership', 'Joined / last sign-in (IST)', 'Sessions / orders', 'History'].map((title) => <th key={title} scope="col" className={cellClass}>{title}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-[#E7D8C8]">{users.map((user) => {
            const member = members.find((m) => m.userId === user.id) ?? members.find((m) => !m.userId && m.email?.toLowerCase() === user.email.toLowerCase());
            const tier = member?.tier ?? user.membershipTier;
            const status = member?.validUntil && member.validUntil < now ? "EXPIRED" : member?.status ?? user.membershipStatus;
            return <tr key={user.id} className="hover:bg-[#FFFDF9]">
              <td className={cellClass}><Link href={`/admin/users/${user.id}`} className="font-semibold hover:underline">{user.name}</Link><p className="mt-1 text-xs text-[#2B201A]/60">{user.email}</p><p className="mt-1 text-xs text-[#2B201A]/60">{user.phone || "No phone provided"}</p></td>
              <td className={cellClass}><UserStatus>{tier === "FREE" ? "Non-member" : `${tier} · ${status}`}</UserStatus></td>
              <td className={`${cellClass} whitespace-nowrap`}><p>{formatIST(user.createdAt)}</p><p className="mt-1 text-xs text-[#2B201A]/60">Last sign-in: {user.activities[0] ? formatIST(user.activities[0].createdAt) : "Not recorded"}</p></td>
              <td className={cellClass}><p>{user._count.sessions} valid sessions</p><p className="mt-1 text-xs text-[#2B201A]/60">{user._count.orders} orders</p></td>
              <td className={cellClass}><Link href={`/admin/users/${user.id}`} className="font-semibold text-[#B85213] hover:underline whitespace-nowrap">View history →</Link></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
      {!users.length && <UserEmpty>No users match your search.</UserEmpty>}
    </div>
    <UserPagination page={page} total={total} pageSize={USER_PAGE_SIZE} href={href} />
    <p className="text-xs text-[#2B201A]/60">A valid session means the account is signed in on a device; it does not mean the user is currently online. Guest donations without an account remain in Donations.</p>
  </div>;
}
