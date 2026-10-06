import { STATUS_LABELS } from "@/lib/admin-format";

const STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-[#3D5A80]/10 text-[#3D5A80]",
  PENDING_VERIFICATION: "bg-[#B8893E]/15 text-[#7A5A12]",
  VERIFIED: "bg-[#2F5A43]/12 text-[#2F5A43]",
  REJECTED: "bg-[#B3261E]/10 text-[#B3261E]",
  CANCELLED: "bg-[#2B201A]/8 text-[#2B201A]/60",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${STYLES[status] ?? ""}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
