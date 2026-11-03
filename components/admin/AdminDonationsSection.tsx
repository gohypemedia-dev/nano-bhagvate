"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Loader2, Search, X } from "lucide-react";
import AdminDonationRow, { AdminDonationItem } from "@/components/admin/AdminDonationRow";
import { STATUS_LABELS } from "@/lib/admin-format";
import type { DonationStatus, DonationType } from "@prisma/client";

const TYPES = [
  { value: "DONATION", label: "Donations" },
  { value: "MEMBERSHIP", label: "Memberships" },
  { value: "EVENT", label: "Events" },
] as const;

const STATUSES: DonationStatus[] = [
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "PENDING_PAYMENT",
  "CANCELLED",
];

interface AdminDonationsSectionProps {
  currentType?: string;
  currentStatus?: DonationStatus;
  currentQuery?: string;
  currentPage: number;
  totalPages: number;
  pageNumbers: (number | "…")[];
  pageSize: number;
  total: number;
  statusCounts: Record<string, number>;
  donations: AdminDonationItem[];
  noun: string;
}

export default function AdminDonationsSection({
  currentType,
  currentStatus,
  currentQuery,
  currentPage,
  totalPages,
  pageNumbers,
  pageSize,
  total,
  statusCounts,
  donations,
  noun,
}: AdminDonationsSectionProps) {
  const router = useRouter();

  // Optimistic pending states for instantaneous 0ms feedback
  const [pendingType, setPendingType] = useState<string | null | undefined>(undefined);
  const [pendingStatus, setPendingStatus] = useState<string | null | undefined>(undefined);
  const [pendingPage, setPendingPage] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState(currentQuery ?? "");

  // Sync searchQuery when currentQuery changes from URL
  useEffect(() => {
    setSearchQuery(currentQuery ?? "");
  }, [currentQuery]);

  // When props update (route transition completes on server), clear pending optimistic states
  useEffect(() => {
    setPendingType(undefined);
    setPendingStatus(undefined);
    setPendingPage(null);
    setIsSearching(false);
  }, [currentType, currentStatus, currentQuery, currentPage, donations]);

  // Determine effective active values (optimistic pending state takes precedence)
  const effectiveType = pendingType !== undefined ? pendingType : currentType;
  const effectiveStatus = pendingStatus !== undefined ? pendingStatus : currentStatus;
  const effectivePage = pendingPage !== null ? pendingPage : currentPage;

  const isTableLoading =
    pendingType !== undefined ||
    pendingStatus !== undefined ||
    pendingPage !== null ||
    isSearching;

  // Construct target URL helper
  const buildHref = useCallback(
    (opts: { type?: string | null; status?: string | null; q?: string; page?: number }) => {
      const p = new URLSearchParams();
      const t = opts.type !== undefined ? opts.type : effectiveType;
      const s = opts.status !== undefined ? opts.status : effectiveStatus;
      const query = opts.q !== undefined ? opts.q : currentQuery;
      const pg = opts.page !== undefined ? opts.page : 1;

      if (t) p.set("type", t);
      if (s) p.set("status", s);
      if (query && query.trim()) p.set("q", query.trim());
      if (pg && pg > 1) p.set("page", String(pg));

      const qs = p.toString();
      return qs ? `/admin?${qs}` : "/admin";
    },
    [effectiveType, effectiveStatus, currentQuery]
  );

  // Type filter click handler (Everything, Donations, Memberships, Events)
  const handleTypeSelect = (targetType?: string | null) => {
    const nextVal = targetType ?? null;
    const currentVal = currentType ?? null;

    if (nextVal === currentVal && pendingType === undefined) return;

    // 1. Instant 0ms state change: button highlights and shows spinner immediately!
    setPendingType(targetType);
    setPendingPage(1);

    const targetUrl = buildHref({ type: targetType, page: 1 });
    router.prefetch(targetUrl);

    // 2. Begin server navigation in next tick
    setTimeout(() => {
      router.push(targetUrl);
    }, 0);
  };

  // Status filter click handler (All, Pending verification, etc.)
  const handleStatusSelect = (targetStatus?: string | null) => {
    const nextVal = targetStatus ?? null;
    const currentVal = currentStatus ?? null;

    if (nextVal === currentVal && pendingStatus === undefined) return;

    setPendingStatus(targetStatus);
    setPendingPage(1);

    const targetUrl = buildHref({ status: targetStatus, page: 1 });
    router.prefetch(targetUrl);

    setTimeout(() => {
      router.push(targetUrl);
    }, 0);
  };

  // Search form submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setPendingPage(1);

    const targetUrl = buildHref({ q: searchQuery.trim(), page: 1 });
    router.prefetch(targetUrl);

    setTimeout(() => {
      router.push(targetUrl);
    }, 0);
  };

  // Clear search handler
  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(true);
    setPendingPage(1);

    const targetUrl = buildHref({ q: "", page: 1 });
    router.prefetch(targetUrl);

    setTimeout(() => {
      router.push(targetUrl);
    }, 0);
  };

  // Pagination click handler
  const handlePageSelect = (pageNumber: number) => {
    if (pageNumber === effectivePage || pageNumber < 1 || pageNumber > totalPages) return;

    setPendingPage(pageNumber);

    const targetUrl = buildHref({ page: pageNumber });
    router.prefetch(targetUrl);

    setTimeout(() => {
      router.push(targetUrl);
    }, 0);
  };

  const allTypes = [{ value: null, label: "Everything" }, ...TYPES];

  return (
    <section className="space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* ROW 1: TYPE FILTER PILLS (Everything, Donations, Memberships, Events) */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0"
          aria-label="Filter by type"
        >
          {allTypes.map((t) => {
            const isMatch = t.value === null ? !effectiveType : effectiveType === t.value;
            const isTargetPending =
              pendingType !== undefined &&
              (t.value === null ? pendingType === null : pendingType === t.value);

            return (
              <button
                key={t.label}
                type="button"
                onClick={() => handleTypeSelect(t.value)}
                onMouseEnter={() => {
                  router.prefetch(buildHref({ type: t.value, page: 1 }));
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                  isMatch
                    ? "bg-[#E86F1D] text-white border-[#E86F1D] shadow-xs"
                    : "bg-white border-[#E7D8C8] text-[#2B201A]/75 hover:border-[#E86F1D]/50 hover:bg-[#FAF3EA]/40"
                }`}
              >
                {/* Loader appears instantly on click */}
                {isTargetPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
                )}
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        <Link
          href="/admin/members"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FAF3EA] hover:bg-[#E86F1D] text-[#E86F1D] hover:text-white border border-[#E86F1D]/30 hover:border-[#E86F1D] text-xs font-bold transition-all shadow-xs w-full sm:w-auto text-center cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>Manage Members (Upgrade / Downgrade Tiers & Remove) →</span>
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ROW 2: STATUS FILTER PILLS & SEARCH BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
        {/* Status Pills */}
        <nav
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0"
          aria-label="Filter by status"
        >
          {/* All Status Pill */}
          <button
            type="button"
            onClick={() => handleStatusSelect(null)}
            onMouseEnter={() => {
              router.prefetch(buildHref({ status: null, page: 1 }));
            }}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 whitespace-nowrap transition-all cursor-pointer ${
              !effectiveStatus
                ? "bg-[#2B201A] text-white border-[#2B201A] shadow-xs"
                : "bg-white border-[#E7D8C8] text-[#2B201A]/75 hover:border-[#2B201A]/40 hover:bg-[#FAF3EA]/40"
            }`}
          >
            {pendingStatus === null && (
              <Loader2 className="w-3 h-3 animate-spin text-[#E86F1D] shrink-0 mr-1" />
            )}
            <span>All</span>
          </button>

          {/* Each Status Pill */}
          {STATUSES.map((s) => {
            const isMatch = effectiveStatus === s;
            const isThisPending = pendingStatus === s;
            const count = statusCounts[s] ?? 0;

            return (
              <button
                key={s}
                type="button"
                onClick={() => handleStatusSelect(s)}
                onMouseEnter={() => {
                  router.prefetch(buildHref({ status: s, page: 1 }));
                }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                  isMatch
                    ? "bg-[#2B201A] text-white border-[#2B201A] shadow-xs"
                    : "bg-white border-[#E7D8C8] text-[#2B201A]/75 hover:border-[#2B201A]/40 hover:bg-[#FAF3EA]/40"
                }`}
              >
                {isThisPending && (
                  <Loader2 className="w-3 h-3 animate-spin text-[#E86F1D] shrink-0 mr-1" />
                )}
                <span>{STATUS_LABELS[s]}</span>
                <span className="opacity-60 tabular-nums ml-1">{count}</span>
              </button>
            );
          })}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <input
              type="search"
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, name, email or UTR..."
              className="px-3.5 py-1.5 text-xs bg-white border border-[#E7D8C8] rounded-xl focus:outline-hidden focus:border-[#E86F1D] w-full pr-7"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  if (currentQuery) handleClearSearch();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-0.5"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E7D8C8] rounded-xl text-xs font-bold text-[#2B201A] hover:bg-[#FBF2E7] transition-colors cursor-pointer shrink-0 disabled:opacity-60"
          >
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E86F1D]" />
            ) : (
              <Search className="w-3.5 h-3.5 text-[#2B201A]/70" />
            )}
            <span>Search</span>
          </button>

          {currentQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs text-[#E86F1D] hover:underline cursor-pointer shrink-0"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ROW 3: DONATIONS TABLE (With Instant Loading State) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-x-auto rounded-xl border border-[#E7D8C8] bg-white shadow-2xs">
        {/* Table Loading Notice Bar */}
        {isTableLoading && (
          <div className="absolute inset-x-0 top-0 z-10 bg-amber-500/10 backdrop-blur-[1px] border-b border-amber-200/60 py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#8C3A00] animate-in fade-in duration-150">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E86F1D]" />
            <span>Updating {effectiveType ? effectiveType.toLowerCase() + " records" : "donations"}...</span>
          </div>
        )}

        <table className={`w-full text-sm min-w-[680px] transition-opacity duration-150 ${isTableLoading ? "opacity-40" : "opacity-100"}`}>
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-[#2B201A]/60 border-b border-[#E7D8C8] bg-[#FAF6F0]/50">
              <th className="px-4 py-3 font-bold">Donation ID</th>
              <th className="px-4 py-3 font-bold">Donor</th>
              <th className="px-4 py-3 font-bold">For</th>
              <th className="px-4 py-3 font-bold text-right">Amount</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Created</th>
            </tr>
          </thead>
          <tbody>
            {/* If table is loading and had no rows yet, show skeletons */}
            {isTableLoading && donations.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="border-b border-[#E7D8C8] animate-pulse">
                  <td className="px-4 py-3.5"><div className="h-4 bg-[#E7D8C8]/60 rounded w-28" /></td>
                  <td className="px-4 py-3.5 space-y-1">
                    <div className="h-3.5 bg-[#E7D8C8]/60 rounded w-36" />
                    <div className="h-3 bg-[#E7D8C8]/40 rounded w-44" />
                  </td>
                  <td className="px-4 py-3.5"><div className="h-3.5 bg-[#E7D8C8]/50 rounded w-28" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-[#E7D8C8]/60 rounded w-16 ml-auto" /></td>
                  <td className="px-4 py-3.5"><div className="h-5 bg-[#E7D8C8]/50 rounded-full w-24" /></td>
                  <td className="px-4 py-3.5"><div className="h-3.5 bg-[#E7D8C8]/40 rounded w-28" /></td>
                </tr>
              ))
            ) : donations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#2B201A]/60">
                  {currentQuery || effectiveStatus || effectiveType
                    ? `No ${noun} match this filter.`
                    : "No donations yet. They will appear here when donors submit the donation form."}
                </td>
              </tr>
            ) : (
              donations.map((d) => <AdminDonationRow key={d.donationId} donation={d} />)
            )}
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ROW 4: PAGINATION CONTROLS */}
      {/* ------------------------------------------------------------- */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E7D8C8]/60 text-xs sm:text-sm">
          <span className="text-[#2B201A]/70 font-medium">
            Showing <strong className="text-[#2B201A]">{(effectivePage - 1) * pageSize + 1}</strong>–
            <strong className="text-[#2B201A]">{Math.min(effectivePage * pageSize, total)}</strong> of{" "}
            <strong className="text-[#2B201A]">{total}</strong> {noun}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              type="button"
              disabled={effectivePage <= 1 || pendingPage !== null}
              onClick={() => handlePageSelect(effectivePage - 1)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E7D8C8] bg-white text-xs font-bold text-[#2B201A]/80 hover:bg-[#FBF2E7] transition-colors cursor-pointer ${
                effectivePage <= 1 ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <span>← Previous</span>
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-[#2B201A]/40 font-bold">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    disabled={pendingPage !== null}
                    onClick={() => handlePageSelect(p)}
                    className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      effectivePage === p
                        ? "bg-[#2B201A] text-white border-[#2B201A] shadow-xs"
                        : "bg-white text-[#2B201A]/80 border-[#E7D8C8] hover:bg-[#FBF2E7]"
                    }`}
                  >
                    {pendingPage === p ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#E86F1D]" />
                    ) : (
                      p
                    )}
                  </button>
                )
              )}
            </div>

            {/* Next Page Button */}
            <button
              type="button"
              disabled={effectivePage >= totalPages || pendingPage !== null}
              onClick={() => handlePageSelect(effectivePage + 1)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E7D8C8] bg-white text-xs font-bold text-[#2B201A]/80 hover:bg-[#FBF2E7] transition-colors cursor-pointer ${
                effectivePage >= totalPages ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <span>Next →</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

