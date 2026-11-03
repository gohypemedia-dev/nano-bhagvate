import Link from "next/link";
import { Prisma, type DonationStatus } from "@prisma/client";
import { Users, ArrowRight } from "lucide-react";
import { requireAdminPage } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { formatIST, rupeesFromPaise, STATUS_LABELS } from "@/lib/admin-format";
import StatusBadge from "@/components/admin/StatusBadge";
import BankAlertsPanel from "@/components/admin/BankAlertsPanel";
import AutoRefresh from "@/components/admin/AutoRefresh";
import AdminDonationsSection from "@/components/admin/AdminDonationsSection";
import type { AdminDonationItem } from "@/components/admin/AdminDonationRow";

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

// In-memory cache for event titles (60s TTL) to prevent repeated DB round-trips
let cachedEventTitles: string[] | null = null;
let lastEventTitlesFetch = 0;
async function getCachedEventTitles(): Promise<string[]> {
  const now = Date.now();
  if (cachedEventTitles && now - lastEventTitlesFetch < 60000) {
    return cachedEventTitles;
  }
  const allEvents = await prisma.event.findMany({ select: { title: true } });
  cachedEventTitles = allEvents.map((e) => e.title);
  lastEventTitlesFetch = now;
  return cachedEventTitles;
}

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

  // Cached event titles for fast differentiation of event registrations
  const eventTitles = await getCachedEventTitles();

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

  const formattedDonations: AdminDonationItem[] = donations.map((d) => ({
    donationId: d.donationId,
    type: d.type,
    donorName: d.donorName,
    donorEmail: d.donorEmail,
    amountPaise: d.amountPaise,
    status: d.status,
    program: d.program,
    createdAt: d.createdAt,
    isEvent: eventTitles.some(
      (t: string) => t.toLowerCase() === (d.program || "").toLowerCase().trim()
    ),
  }));

  const statusCountsObj: Record<string, number> = {
    PENDING_VERIFICATION: count("PENDING_VERIFICATION"),
    VERIFIED: count("VERIFIED"),
    REJECTED: count("REJECTED"),
    PENDING_PAYMENT: count("PENDING_PAYMENT"),
    CANCELLED: count("CANCELLED"),
  };

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

      <AdminDonationsSection
        currentType={type}
        currentStatus={status}
        currentQuery={q}
        currentPage={page}
        totalPages={pages}
        pageNumbers={pageNumbers}
        pageSize={PAGE_SIZE}
        total={total}
        statusCounts={statusCountsObj}
        donations={formattedDonations}
        noun={noun}
      />
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
