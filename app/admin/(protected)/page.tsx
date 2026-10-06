import Link from "next/link";
import type { DonationStatus, Prisma } from "@prisma/client";
import { requireAdminPage } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { formatIST, rupeesFromPaise, STATUS_LABELS } from "@/lib/admin-format";
import StatusBadge from "@/components/admin/StatusBadge";
import BankAlertsPanel from "@/components/admin/BankAlertsPanel";
import { alertsNeedingReview, lastBankSync } from "@/lib/server/bank-alerts";

const PAGE_SIZE = 25;
const STATUSES = ["PENDING_VERIFICATION", "VERIFIED", "REJECTED", "PENDING_PAYMENT", "CANCELLED"] as const;

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  await requireAdminPage();
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const q = sp.q?.trim().slice(0, 100) ?? "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.DonationWhereInput = {
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

  const [grouped, donorRows, donations, total, lastSync, reviewAlerts] = await Promise.all([
    prisma.donation.groupBy({ by: ["status"], _sum: { amountPaise: true }, _count: { _all: true } }),
    prisma.$queryRaw<{ count: number }[]>`SELECT COUNT(DISTINCT "donorEmail")::int AS count FROM "Donation" WHERE "status" = 'VERIFIED'`,
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { donationId: true, donorName: true, donorEmail: true, amountPaise: true, status: true, program: true, createdAt: true },
    }),
    prisma.donation.count({ where }),
    lastBankSync(),
    alertsNeedingReview(),
  ]);

  const byStatus = (s: DonationStatus) => grouped.find((g) => g.status === s);
  const sum = (s: DonationStatus) => byStatus(s)?._sum.amountPaise ?? 0;
  const count = (s: DonationStatus) => byStatus(s)?._count._all ?? 0;

  // Only proof-submitted and verified donations count; QR-only intents are excluded.
  const stats = [
    { label: "Total donations", value: rupeesFromPaise(sum("VERIFIED") + sum("PENDING_VERIFICATION")), note: "Verified + pending verification" },
    { label: "Verified donations", value: rupeesFromPaise(sum("VERIFIED")), note: `${count("VERIFIED")} donations` },
    { label: "Pending verification", value: rupeesFromPaise(sum("PENDING_VERIFICATION")), note: `${count("PENDING_VERIFICATION")} to review`, highlight: count("PENDING_VERIFICATION") > 0 },
    { label: "Verified donors", value: (donorRows[0]?.count ?? 0).toLocaleString("en-IN"), note: "Unique email addresses" },
  ];

  const href = (params: { status?: string; q?: string; page?: number }) => {
    const u = new URLSearchParams();
    if (params.status) u.set("status", params.status);
    if (params.q) u.set("q", params.q);
    if (params.page && params.page > 1) u.set("page", String(params.page));
    const s = u.toString();
    return s ? `/admin?${s}` : "/admin";
  };
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-8">
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

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border bg-white p-4 sm:p-5 ${s.highlight ? "border-[#B8893E]" : "border-[#E7D8C8]"}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/60">{s.label}</p>
            <p className="mt-1 text-xl sm:text-2xl font-extrabold text-[#2B201A] tabular-nums">{s.value}</p>
            <p className={`mt-0.5 text-xs ${s.highlight ? "text-[#7A5A12] font-semibold" : "text-[#2B201A]/55"}`}>{s.note}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
          <nav className="flex flex-wrap gap-1.5" aria-label="Filter by status">
            <Link href={href({ q })} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${!status ? "bg-[#2B201A] text-white border-[#2B201A]" : "bg-white border-[#E7D8C8] text-[#2B201A]/75 hover:border-[#2B201A]/40"}`}>
              All
            </Link>
            {STATUSES.map((s) => (
              <Link key={s} href={href({ status: s, q })} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${status === s ? "bg-[#2B201A] text-white border-[#2B201A]" : "bg-white border-[#E7D8C8] text-[#2B201A]/75 hover:border-[#2B201A]/40"}`}>
                {STATUS_LABELS[s]} <span className="opacity-60 tabular-nums">{count(s)}</span>
              </Link>
            ))}
          </nav>
          <form action="/admin" className="flex gap-2 w-full lg:w-auto">
            {status && <input type="hidden" name="status" value={status} />}
            <input id="admin-search" name="q" defaultValue={q} placeholder="Search ID, name, email or UTR" className="input-warm min-h-10! py-2! text-sm lg:w-72" />
            <button className="btn-outline min-h-10! px-4! text-xs">Search</button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E7D8C8] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#2B201A]/60 border-b border-[#E7D8C8]">
                <th className="px-4 py-3 font-bold">Donation ID</th>
                <th className="px-4 py-3 font-bold">Donor</th>
                <th className="px-4 py-3 font-bold text-right">Amount</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Created</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[#2B201A]/60">
                    {q || status ? "No donations match this filter." : "No donations yet. They will appear here when donors submit the donation form."}
                  </td>
                </tr>
              )}
              {donations.map((d) => (
                <tr key={d.donationId} className="border-b border-[#E7D8C8] last:border-0 hover:bg-[#FBF2E7]/60">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link href={`/admin/donations/${d.donationId}`} className="font-mono font-semibold text-[#E86F1D] hover:underline">
                      {d.donationId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#2B201A]">{d.donorName}</div>
                    <div className="text-xs text-[#2B201A]/55">{d.donorEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap">{rupeesFromPaise(d.amountPaise)}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-xs text-[#2B201A]/65 whitespace-nowrap">{formatIST(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#2B201A]/60">Page {page} of {pages} · {total} donations</span>
            <div className="flex gap-2">
              {page > 1 && <Link href={href({ status, q, page: page - 1 })} className="btn-outline min-h-9! px-3! text-xs">Previous</Link>}
              {page < pages && <Link href={href({ status, q, page: page + 1 })} className="btn-outline min-h-9! px-3! text-xs">Next</Link>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
