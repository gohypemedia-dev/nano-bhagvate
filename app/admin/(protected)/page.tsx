import Link from "next/link";
import { Prisma, type DonationStatus } from "@prisma/client";
import { Users, ArrowRight } from "lucide-react";
import { requireAdminPage } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { formatIST, rupeesFromPaise, STATUS_LABELS } from "@/lib/admin-format";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminDonationRow from "@/components/admin/AdminDonationRow";
import BankAlertsPanel from "@/components/admin/BankAlertsPanel";
import AutoRefresh from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

const PAGE_SIZE = 10;
const STATUSES = ["PENDING_VERIFICATION", "VERIFIED", "REJECTED", "PENDING_PAYMENT", "CANCELLED"] as const;
const TYPES = [
  { value: "DONATION", label: "Donations" },
  { value: "MEMBERSHIP", label: "Memberships" },
  { value: "EVENT", label: "Events" },
] as const;

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string; page?: string }>;
}) {
  await requireAdminPage();
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as DonationStatus) ? (sp.status as DonationStatus) : undefined;
  const type = TYPES.find((t) => t.value === sp.type)?.value;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  // Fetch all existing event titles to differentiate event registrations from general donations
  const allEvents = await prisma.event.findMany({ select: { title: true } });
  const eventTitles = allEvents.map((e) => e.title);

  // The stats and status counts follow the Donations / Memberships / Events filter.
  let typeWhere: Prisma.DonationWhereInput = {};
  if (type === "EVENT") {
    typeWhere = {
      type: "DONATION",
      program: { in: eventTitles },
    };
  } else if (type === "DONATION") {
    typeWhere = {
      type: "DONATION",
      OR: [
        { program: null },
        { program: { notIn: eventTitles } },
      ],
    };
  } else if (type === "MEMBERSHIP") {
    typeWhere = { type: "MEMBERSHIP" };
  }

  const where: Prisma.DonationWhereInput = {
    ...typeWhere,
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { donationId: { contains: q, mode: "insensitive" } },
            { donorName: { contains: q, mode: "insensitive" } },
            { donorEmail: { contains: q, mode: "insensitive" } },
            { utr: { contains: q } },
          ],
        }
      : {}),
  };

  const [grouped, uniqueDonors, donations, total, lastSync, reviewAlerts] = await Promise.all([
    prisma.donation.groupBy({ by: ["status"], where: typeWhere, _sum: { amountPaise: true }, _count: { _all: true } }),
    prisma.donation.findMany({
      where: {
        status: "VERIFIED",
        ...typeWhere,
      },
      distinct: ["donorEmail"],
      select: { donorEmail: true },
    }),
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { donationId: true, type: true, donorName: true, donorEmail: true, amountPaise: true, status: true, program: true, createdAt: true },
    }),
    prisma.donation.count({ where }),
    lastBankSync(),
    alertsNeedingReview(),
  ]);

  const donorCount = uniqueDonors.length;
  const byStatus = (s: DonationStatus) => grouped.find((g) => g.status === s);
  const sum = (s: DonationStatus) => byStatus(s)?._sum.amountPaise ?? 0;
  const count = (s: DonationStatus) => byStatus(s)?._count._all ?? 0;

  // Only proof-submitted and verified donations count; QR-only intents are excluded.
  const noun =
    type === "MEMBERSHIP"
      ? "memberships"
      : type === "EVENT"
      ? "event passes"
      : "donations";

  const stats = [
    { label: `Total ${noun}`, value: rupeesFromPaise(sum("VERIFIED") + sum("PENDING_VERIFICATION")), note: "Verified + pending verification" },
    { label: `Verified ${noun}`, value: rupeesFromPaise(sum("VERIFIED")), note: `${count("VERIFIED")} ${noun}` },
    { label: "Pending verification", value: rupeesFromPaise(sum("PENDING_VERIFICATION")), note: `${count("PENDING_VERIFICATION")} to review`, highlight: count("PENDING_VERIFICATION") > 0 },
    {
      label:
        type === "MEMBERSHIP"
          ? "Verified members"
          : type === "EVENT"
          ? "Verified attendees"
          : "Verified donors",
      value: donorCount.toLocaleString("en-IN"),
      note: "Unique email addresses",
    },
  ];

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageNumbers = getPageNumbers(page, pages);

  function href(opts: { type?: string; status?: string; q?: string; page?: number }) {
    const p = new URLSearchParams();
    if (opts.type) p.set("type", opts.type);
    if (opts.status) p.set("status", opts.status);
    if (opts.q) p.set("q", opts.q);
    if (opts.page && opts.page > 1) p.set("page", String(opts.page));
    const qs = p.toString();
    return qs ? `/admin?${qs}` : "/admin";
  }

  return (
    <div className="space-y-6">
      <AutoRefresh />
      <BankAlertsPanel
        lastSync={lastSync ? formatIST(lastSync) : null}
        alerts={reviewAlerts.map((a) => ({
          id: a.id,
          amount: rupeesFromPaise(a.amountPaise),
          receivedAt: formatIST(a.receivedAt),
          utr: a.utr,
          payer: a.payer,
          status: a.status as "AMBIGUOUS" | "UNMATCHED",
          note: a.note,
        }))}
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border bg-white p-3 sm:p-5 ${s.highlight ? "border-[#B8893E]" : "border-[#E7D8C8]"}`}>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/60">{s.label}</p>
            <p className="mt-1 text-lg sm:text-2xl font-extrabold text-[#2B201A] tabular-nums">{s.value}</p>
            <p className={`mt-0.5 text-xs ${s.highlight ? "text-[#7A5A12] font-semibold" : "text-[#2B201A]/55"}`}>{s.note}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0" aria-label="Filter by type">
            {[{ value: undefined, label: "Everything" }, ...TYPES].map((t) => (
              <Link key={t.label} href={href({ type: t.value, status, q })} className={`px-3 py-1.5 rounded-lg text-xs font-bold border shrink-0 whitespace-nowrap ${type === t.value ? "bg-[#E86F1D] text-white border-[#E86F1D]" : "bg-white border-[#E7D8C8] text-[#2B201A]/75 hover:border-[#E86F1D]/50"}`}>
                {t.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/admin/members"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FAF3EA] hover:bg-[#E86F1D] text-[#E86F1D] hover:text-white border border-[#E86F1D]/30 hover:border-[#E86F1D] text-xs font-bold transition-all shadow-xs w-full sm:w-auto text-center"
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Manage Members (Upgrade / Downgrade Tiers & Remove) →</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0" aria-label="Filter by status">
            <Link href={href({ type, q })} className={`px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 whitespace-nowrap ${!status ? "bg-[#2B201A] text-white border-[#2B201A]" : "bg-white border-[#E7D8C8] text-[#2B201A]/75 hover:border-[#2B201A]/40"}`}>
              All
            </Link>
            {STATUSES.map((s) => (
              <Link key={s} href={href({ type, status: s, q })} className={`px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 whitespace-nowrap ${status === s ? "bg-[#2B201A] text-white border-[#2B201A]" : "bg-white border-[#E7D8C8] text-[#2B201A]/75 hover:border-[#2B201A]/40"}`}>
                {STATUS_LABELS[s]} <span className="opacity-60 tabular-nums">{count(s)}</span>
              </Link>
            ))}
          </nav>

          <form method="get" className="flex items-center gap-2">
            {type && <input type="hidden" name="type" value={type} />}
            {status && <input type="hidden" name="status" value={status} />}
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search ID, name, email or UTR..."
              className="px-3.5 py-1.5 text-xs bg-white border border-[#E7D8C8] rounded-xl focus:outline-hidden focus:border-[#E86F1D] w-full sm:w-64"
            />
            <button type="submit" className="px-3.5 py-1.5 bg-white border border-[#E7D8C8] rounded-xl text-xs font-bold text-[#2B201A] hover:bg-[#FBF2E7]">
              Search
            </button>
            {q && (
              <Link href={href({ type, status })} className="text-xs text-[#E86F1D] hover:underline">
                Clear
              </Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E7D8C8] bg-white">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#2B201A]/60 border-b border-[#E7D8C8]">
                <th className="px-4 py-3 font-bold">Donation ID</th>
                <th className="px-4 py-3 font-bold">Donor</th>
                <th className="px-4 py-3 font-bold">For</th>
                <th className="px-4 py-3 font-bold text-right">Amount</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Created</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#2B201A]/60">
                    {q || status || type ? `No ${noun} match this filter.` : "No donations yet. They will appear here when donors submit the donation form."}
                  </td>
                </tr>
              )}
              {donations.map((d) => (
                <AdminDonationRow
                  key={d.donationId}
                  donation={{
                    ...d,
                    isEvent: eventTitles.some(
                      (t) => t.toLowerCase() === (d.program || "").toLowerCase().trim()
                    ),
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E7D8C8]/60 text-xs sm:text-sm">
            <span className="text-[#2B201A]/70 font-medium">
              Showing <strong className="text-[#2B201A]">{(page - 1) * PAGE_SIZE + 1}</strong>–<strong className="text-[#2B201A]">{Math.min(page * PAGE_SIZE, total)}</strong> of <strong className="text-[#2B201A]">{total}</strong> {noun}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={href({ type, status, q, page: page - 1 })}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E7D8C8] bg-white text-xs font-bold text-[#2B201A]/80 hover:bg-[#FBF2E7] transition-colors ${
                  page <= 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <span>← Previous</span>
              </Link>

              <div className="flex items-center gap-1">
                {pageNumbers.map((p, idx) =>
                  p === "…" ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-[#2B201A]/40 font-bold">
                      …
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={href({ type, status, q, page: p })}
                      className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors ${
                        page === p
                          ? "bg-[#2B201A] text-white border-[#2B201A] shadow-xs"
                          : "bg-white text-[#2B201A]/80 border-[#E7D8C8] hover:bg-[#FBF2E7]"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}
              </div>

              <Link
                href={href({ type, status, q, page: page + 1 })}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E7D8C8] bg-white text-xs font-bold text-[#2B201A]/80 hover:bg-[#FBF2E7] transition-colors ${
                  page >= pages ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <span>Next →</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

async function lastBankSync() {
  const row = await prisma.syncState.findUnique({ where: { id: "bank-emails" } });
  return row?.lastRunAt ?? null;
}

async function alertsNeedingReview() {
  return prisma.paymentAlert.findMany({
    where: { status: { in: ["AMBIGUOUS", "UNMATCHED"] } },
    orderBy: { receivedAt: "desc" },
    take: 10,
    select: { id: true, amountPaise: true, receivedAt: true, utr: true, payer: true, status: true, note: true },
  });
}
