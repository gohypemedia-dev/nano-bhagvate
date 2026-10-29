"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { rupeesFromPaise, formatIST } from "@/lib/admin-format";
import type { DonationStatus, DonationType } from "@prisma/client";

export interface AdminDonationItem {
  donationId: string;
  type: DonationType;
  donorName: string;
  donorEmail: string;
  amountPaise: number;
  status: DonationStatus;
  program: string | null;
  createdAt: Date | string;
}

interface AdminDonationRowProps {
  donation: AdminDonationItem;
}

export default function AdminDonationRow({ donation: d }: AdminDonationRowProps) {
  const router = useRouter();
  const isUnverified = d.status !== "VERIFIED";

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const target = e.target as HTMLElement;
    // Don't intercept clicks on links, buttons, or inputs
    if (target.closest("a") || target.closest("button") || target.closest("select") || target.closest("input")) {
      return;
    }

    if (isUnverified) {
      router.push(`/admin/donations/${d.donationId}`);
    }
  };

  return (
    <tr
      onClick={handleRowClick}
      className={`border-b border-[#E7D8C8] last:border-0 transition-all duration-150 ${
        isUnverified
          ? "cursor-pointer hover:bg-[#FDF3E7] hover:border-[#E86F1D]/40"
          : "hover:bg-[#FBF2E7]/60"
      }`}
      title={isUnverified ? "क्लिक करें: विवरण देखें एवं वेरिफाई/रिजेक्ट करें (Click to view details & verify/reject)" : undefined}
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <Link
          href={`/admin/donations/${d.donationId}`}
          className="font-mono font-semibold text-[#E86F1D] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {d.donationId}
        </Link>
      </td>
      <td className="px-4 py-3">
        <div className="font-semibold text-[#2B201A]">{d.donorName}</div>
        <div className="text-xs text-[#2B201A]/55">{d.donorEmail}</div>
      </td>
      <td className="px-4 py-3">
        {d.type === "MEMBERSHIP" && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-block px-2 py-0.5 rounded-full bg-[#B8893E]/15 text-[#7A5A12] text-[10px] font-bold uppercase tracking-wider">
              Member
            </span>
            <Link
              href={`/admin/members?search=${encodeURIComponent(d.donorEmail)}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-[#E86F1D] font-bold hover:underline inline-flex items-center gap-0.5"
            >
              <span>Manage Tier</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        )}
        <div className="text-xs text-[#2B201A]/75">{d.program ?? "—"}</div>
      </td>
      <td className="px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap">
        {rupeesFromPaise(d.amountPaise)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={d.status} />
      </td>
      <td className="px-4 py-3 text-xs text-[#2B201A]/65 whitespace-nowrap">
        {formatIST(d.createdAt)}
      </td>
    </tr>
  );
}

