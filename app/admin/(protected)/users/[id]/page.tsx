import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { formatIST, rupeesFromPaise, STATUS_LABELS } from "@/lib/admin-format";
import { pageNumber, queryValue, USER_PAGE_SIZE, userDonationsWhere, userMembersWhere, userProfileSelect, type UserSearchParams } from "@/lib/server/admin-users";
import { cellClass, panelClass, UserEmpty, UserPagination, UserStats, UserStatus } from "@/components/admin/users/UserWidgets";
import AutoRefresh from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";
export const metadata = { title: "User History | Namo Bhagwate Admin" };

const activityLabels: Record<string, string> = {
  REGISTER: "Account created and signed in", LOGIN: "Signed in", LOGOUT: "Signed out", PROFILE_UPDATED: "Profile updated",
};
const donationSelect = {
  id: true, donationId: true, type: true, program: true, amountPaise: true,
  currency: true, status: true, donorEmail: true, userId: true,
  createdAt: true, proofSubmittedAt: true, verifiedAt: true, rejectedAt: true,
} as const;
const orderSelect = {
  id: true, orderNumber: true, totalAmount: true, currency: true, status: true,
  paymentStatus: true, paymentMethod: true, refundStatus: true, refundReference: true,
  refundedAt: true, createdAt: true, updatedAt: true,
  items: { select: { id: true, title: true, quantity: true } },
} as const;

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
}

export default async function AdminUserPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<UserSearchParams>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const query = await searchParams;
  const requestedTab = queryValue(query.tab);
  const tab = ["donations", "orders", "activity"].includes(requestedTab) ? requestedTab : "overview";
  const user = await prisma.user.findUnique({ where: { id }, select: userProfileSelect });
  if (!user) notFound();
  const now = new Date();
  const donationWhere = userDonationsWhere(user);
  const [donationCount, orderCount, activityCount, activeSessions, verified, paidOrders, lastSignIn, members] = await Promise.all([
    prisma.donation.count({ where: donationWhere }),
    prisma.order.count({ where: { userId: id } }),
    prisma.userActivity.count({ where: { userId: id } }),
    prisma.userSession.count({ where: { userId: id, expiresAt: { gt: now } } }),
    prisma.donation.aggregate({ where: { AND: [donationWhere, { status: "VERIFIED", currency: "INR" }] }, _sum: { amountPaise: true } }),
    prisma.order.aggregate({ where: { userId: id, paymentStatus: "PAID", status: { not: "CANCELLED" }, currency: "INR" }, _sum: { totalAmount: true } }),
    prisma.userActivity.findFirst({ where: { userId: id, type: { in: ["LOGIN", "REGISTER"] } }, orderBy: { createdAt: "desc" }, select: { createdAt: true, provider: true } }),
    prisma.member.findMany({ where: userMembersWhere(user), orderBy: { createdAt: "desc" }, select: {
      id: true, userId: true, name: true, tier: true, status: true, role: true, validUntil: true, createdAt: true,
    } }),
  ]);
  const total = tab === "donations" ? donationCount : tab === "orders" ? orderCount : tab === "activity" ? activityCount : 0;
  const page = Math.min(pageNumber(query.page), Math.max(1, Math.ceil(total / USER_PAGE_SIZE)));
  const recent = tab === "overview";
  const pagination = { skip: recent ? 0 : (page - 1) * USER_PAGE_SIZE, take: recent ? 10 : USER_PAGE_SIZE };
  const [donations, orders, activities] = await Promise.all([
    tab === "donations" || recent ? prisma.donation.findMany({ where: donationWhere, orderBy: [{ createdAt: "desc" }, { id: "desc" }], ...pagination, select: donationSelect }) : [],
    tab === "orders" || recent ? prisma.order.findMany({ where: { userId: id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], ...pagination, select: orderSelect }) : [],
    tab === "activity" || recent ? prisma.userActivity.findMany({ where: { userId: id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], ...pagination, select: { id: true, type: true, provider: true, createdAt: true } }) : [],
  ]);
  const member = members.find((m) => m.userId === id) ?? members[0];
  const tier = member?.tier ?? user.membershipTier;
  const memberStatus = member?.validUntil && member.validUntil < now ? "EXPIRED" : member?.status ?? user.membershipStatus;
  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "donations", label: `Donations & memberships (${donationCount})` },
    { value: "orders", label: `Book orders (${orderCount})` },
    { value: "activity", label: `Account activity (${activityCount})` },
  ];
  const timeline = [
    { key: "registered", date: user.createdAt, title: "Account registered", text: user.email, href: null },
    ...activities.map((a) => ({ key: a.id, date: a.createdAt, title: activityLabels[a.type] ?? a.type, text: a.provider ? `${a.provider === "GOOGLE" ? "Google" : "Password"} sign-in` : "Account activity", href: null })),
    ...donations.map((d) => ({ key: d.id, date: d.createdAt, title: `${d.type === "MEMBERSHIP" ? "Membership payment" : "Donation"} started`, text: `${d.donationId} · ${money(d.amountPaise / 100, d.currency)} · ${STATUS_LABELS[d.status] ?? d.status}`, href: `/admin/donations/${d.donationId}` })),
    ...orders.map((o) => ({ key: o.id, date: o.createdAt, title: "Book order placed", text: `${o.orderNumber} · ${money(o.totalAmount, o.currency)} · ${o.paymentStatus} · ${o.status}`, href: "/admin/orders" })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 15);

  return <div className="space-y-5 text-[#2B201A]">
    <AutoRefresh seconds={60} />
    <Link href="/admin/users" className="text-sm font-semibold text-[#B85213] hover:underline">← All users</Link>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-2xl sm:text-3xl font-editorial font-bold">{user.name}</h1><p className="mt-1 text-sm text-[#2B201A]/65 break-all">{user.email}</p></div>
      <UserStatus>{tier === "FREE" ? "Non-member" : `${tier} · ${memberStatus}`}</UserStatus>
    </div>
    <UserStats stats={[
      { label: "Valid sessions", value: activeSessions },
      { label: "All transactions / attempts", value: donationCount + orderCount },
      { label: "Verified contributions (INR)", value: rupeesFromPaise(verified._sum.amountPaise ?? 0) },
      { label: "Paid, uncancelled orders (INR)", value: money(paidOrders._sum.totalAmount ?? 0, "INR") },
    ]} />
    <nav aria-label="User history sections" className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((item) => <Link key={item.value} href={`/admin/users/${id}?tab=${item.value}`} aria-current={tab === item.value ? "page" : undefined} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${tab === item.value ? "bg-[#2B201A] text-white" : "border border-[#E7D8C8] bg-white hover:bg-[#FBF2E7]"}`}>{item.label}</Link>)}
    </nav>

    {recent && <>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${panelClass} p-5`}>
          <h2 className="font-bold mb-4">Account details</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-sm">
            <dt className="text-[#2B201A]/60">Phone</dt><dd>{user.phone || "Not provided"}</dd>
            <dt className="text-[#2B201A]/60">Address</dt><dd>{[user.address, user.city, user.state, user.pincode].filter(Boolean).join(", ") || "Not provided"}</dd>
            <dt className="text-[#2B201A]/60">Joined (IST)</dt><dd>{formatIST(user.createdAt)}</dd>
            <dt className="text-[#2B201A]/60">Last sign-in (IST)</dt><dd>{lastSignIn ? formatIST(lastSignIn.createdAt) : "Not recorded"}{lastSignIn?.provider ? ` · ${lastSignIn.provider === "GOOGLE" ? "Google" : "Password"}` : ""}</dd>
          </dl>
          <p className="mt-4 text-xs text-[#2B201A]/60">Valid sessions indicate signed-in devices, rather than current online activity.</p>
        </section>
        <section className={`${panelClass} p-5`}>
          <div className="flex justify-between gap-3"><h2 className="font-bold">Membership records</h2><Link href="/admin/members" className="text-sm text-[#B85213] hover:underline">Manage members →</Link></div>
          {members.length ? <ul className="mt-3 divide-y divide-[#E7D8C8] text-sm">{members.map((m) => <li key={m.id} className="py-3">
            <p className="font-semibold">{m.tier} · {m.validUntil && m.validUntil < now ? "EXPIRED" : m.status}</p>
            <p className="mt-1 text-xs text-[#2B201A]/60">{m.role || "Member"} · Added {formatIST(m.createdAt)}{m.validUntil ? ` · Valid until ${formatIST(m.validUntil)}` : ""} · {m.userId ? "Linked to account" : "Matched by email"}</p>
          </li>)}</ul> : <p className="mt-4 text-sm text-[#2B201A]/60">{tier === "FREE" ? "No membership record. This user can still donate and place orders." : `Account membership: ${tier} · ${user.membershipStatus}. No separate member record.`}</p>}
        </section>
      </div>
      <section className={panelClass}>
        <h2 className="border-b border-[#E7D8C8] px-5 py-4 font-bold">Recent history</h2>
        <ol className="divide-y divide-[#E7D8C8]">{timeline.map((event) => <li key={event.key} className="flex flex-col sm:flex-row gap-2 sm:gap-5 px-5 py-4 text-sm">
          <time dateTime={event.date.toISOString()} className="shrink-0 text-xs text-[#2B201A]/60 sm:w-44">{formatIST(event.date)} IST</time>
          <div className="min-w-0"><p className="font-semibold">{event.title}</p><p className="mt-1 text-xs text-[#2B201A]/60 break-words">{event.text}</p>{event.href && <Link href={event.href} className="mt-1 inline-block text-xs text-[#B85213] hover:underline">View transaction →</Link>}</div>
        </li>)}</ol>
        <p className="border-t border-[#E7D8C8] px-5 py-3 text-xs text-[#2B201A]/60">Latest 15 entries. Open the history sections above to browse all records.</p>
      </section>
    </>}

    {tab === "donations" && <div className={panelClass}>
      <p className="border-b border-[#E7D8C8] px-4 py-3 text-xs text-[#2B201A]/60">Includes pending, verified, rejected and cancelled attempts. Older or guest payments are matched by account email; each match is labelled.</p>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-[#FFFDF9] text-xs"><tr>{["Donation / program", "Amount", "Status", "Dates (IST)", "Account match"].map((label) => <th key={label} scope="col" className={cellClass}>{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#E7D8C8]">{donations.map((d) => <tr key={d.id}>
          <td className={cellClass}><Link className="font-semibold text-[#B85213] hover:underline" href={`/admin/donations/${d.donationId}`}>{d.donationId}</Link><p className="mt-1 text-xs">{d.type === "MEMBERSHIP" ? "Membership" : "Donation"} · {d.program || "General donation"}</p></td>
          <td className={`${cellClass} whitespace-nowrap`}>{money(d.amountPaise / 100, d.currency)}</td>
          <td className={cellClass}><UserStatus>{STATUS_LABELS[d.status] ?? d.status}</UserStatus></td>
          <td className={`${cellClass} whitespace-nowrap text-xs`}><p>Created: {formatIST(d.createdAt)}</p>{d.proofSubmittedAt && <p className="mt-1">Submitted: {formatIST(d.proofSubmittedAt)}</p>}{d.verifiedAt && <p className="mt-1">Verified: {formatIST(d.verifiedAt)}</p>}{d.rejectedAt && <p className="mt-1">Rejected: {formatIST(d.rejectedAt)}</p>}</td>
          <td className={cellClass}><p className="text-xs">{d.userId ? "Linked to account" : "Matched by email"}</p><p className="mt-1 text-xs text-[#2B201A]/60">{d.donorEmail}</p></td>
        </tr>)}</tbody>
      </table></div>
      {!donations.length && <UserEmpty>This user has no donations or membership payment attempts.</UserEmpty>}
    </div>}

    {tab === "orders" && <div className={panelClass}>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-[#FFFDF9] text-xs"><tr>{["Order / books", "Amount / payment", "Order status", "Refund", "Dates (IST)"].map((label) => <th key={label} scope="col" className={cellClass}>{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#E7D8C8]">{orders.map((o) => <tr key={o.id}>
          <td className={cellClass}><p className="font-semibold">{o.orderNumber}</p><ul className="mt-1 text-xs text-[#2B201A]/65">{o.items.map((item) => <li key={item.id}>{item.title} × {item.quantity}</li>)}</ul><Link href="/admin/orders" className="mt-2 inline-block text-xs text-[#B85213] hover:underline">Manage book orders →</Link></td>
          <td className={cellClass}><p className="whitespace-nowrap">{money(o.totalAmount, o.currency)}</p><p className="mt-1 text-xs">{o.paymentStatus} · {o.paymentMethod}</p></td>
          <td className={cellClass}><UserStatus>{o.status}</UserStatus></td>
          <td className={cellClass}><p className="text-xs">{o.refundStatus || "No refund recorded"}</p>{o.refundReference && <p className="mt-1 text-xs">Ref: {o.refundReference}</p>}{o.refundedAt && <p className="mt-1 text-xs whitespace-nowrap">{formatIST(o.refundedAt)}</p>}</td>
          <td className={`${cellClass} text-xs whitespace-nowrap`}><p>Placed: {formatIST(o.createdAt)}</p><p className="mt-1">Updated: {formatIST(o.updatedAt)}</p></td>
        </tr>)}</tbody>
      </table></div>
      {!orders.length && <UserEmpty>This user has not placed any book orders.</UserEmpty>}
    </div>}

    {tab === "activity" && <section className={panelClass}>
      <p className="border-b border-[#E7D8C8] px-4 py-3 text-xs text-[#2B201A]/60">Sign-ins, explicit sign-outs and profile changes. Earlier sign-ins are recovered from retained sessions only; deleted sessions cannot be recovered. Session expiry does not produce a sign-out event.</p>
      <ul className="divide-y divide-[#E7D8C8]">{activities.map((a) => <li key={a.id} className="flex flex-wrap justify-between gap-3 px-5 py-4 text-sm">
        <div><p className="font-semibold">{activityLabels[a.type] ?? a.type}</p><p className="mt-1 text-xs text-[#2B201A]/60">{a.provider === "GOOGLE" ? "Google" : a.provider === "PASSWORD" ? "Password" : a.type === "LOGIN" ? "Historical session · sign-in method not recorded" : "Account activity"}</p></div>
        <time dateTime={a.createdAt.toISOString()} className="text-xs text-[#2B201A]/60">{formatIST(a.createdAt)} IST</time>
      </li>)}</ul>
      {!activities.length && <UserEmpty>No account activity has been recorded yet. Registration date: {formatIST(user.createdAt)} IST.</UserEmpty>}
    </section>}
    {!recent && <UserPagination page={page} total={total} pageSize={USER_PAGE_SIZE} href={(nextPage) => `/admin/users/${id}?tab=${tab}&page=${nextPage}`} />}
  </div>;
}
