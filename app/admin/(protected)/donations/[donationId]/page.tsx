import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, TriangleAlert } from "lucide-react";
import { requireAdminPage } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { formatIST, rupeesFromPaise } from "@/lib/admin-format";
import StatusBadge from "@/components/admin/StatusBadge";
import DonationActions from "@/components/admin/DonationActions";
import AutoRefresh from "@/components/admin/AutoRefresh";

export default async function DonationDetailPage({ params }: { params: Promise<{ donationId: string }> }) {
  await requireAdminPage();
  const { donationId } = await params;

  const donation = await prisma.donation.findUnique({
    where: { donationId },
    include: {
      verifiedBy: { select: { name: true } },
      emails: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!donation) notFound();

  const sameUtr = donation.utr
    ? await prisma.donation.findMany({
        where: { utr: donation.utr, id: { not: donation.id } },
        select: { donationId: true, status: true },
      })
    : [];

  const screenshotUrl = `/api/admin/donations/${donation.donationId}/screenshot`;
  const rows: [string, React.ReactNode][] = [
    ["Donation ID", <span key="id" className="font-mono">{donation.donationId}</span>],
    ["Donor", donation.donorName],
    ["Email", <a key="e" href={`mailto:${donation.donorEmail}`} className="text-[#E86F1D] hover:underline break-all">{donation.donorEmail}</a>],
    ["Mobile", donation.donorMobile ?? "—"],
    ["Amount", <span key="a" className="font-extrabold tabular-nums">{rupeesFromPaise(donation.amountPaise)}</span>],
    ["Towards", donation.program ?? "—"],
    ["UTR", donation.utr ? <span key="u" className="font-mono">{donation.utr}</span> : "—"],
    ["Created", formatIST(donation.createdAt)],
    ["Marked as paid", donation.proofSubmittedAt ? formatIST(donation.proofSubmittedAt) : "—"],
  ];
  if (donation.verificationSource === "BANK_EMAIL") {
    rows.push(["Confirmed by", `Bank payment email (automatic), ${formatIST(donation.verifiedAt ?? donation.updatedAt)}`]);
  } else if (donation.verifiedBy) {
    rows.push([
      "Reviewed by",
      `${donation.verifiedBy.name}, ${formatIST(donation.verifiedAt ?? donation.rejectedAt ?? donation.updatedAt)}`,
    ]);
  }

  return (
    <div className="space-y-6">
      <AutoRefresh />
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2B201A]/70 hover:text-[#E86F1D]">
        <ArrowLeft className="w-4 h-4" /> All donations
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-editorial text-3xl font-bold text-[#2B201A]">Donation details</h1>
        <StatusBadge status={donation.status} />
      </div>

      {(donation.utrOverride || sameUtr.length > 0) && (
        <div className="flex gap-3 rounded-xl border border-[#B3261E]/25 bg-[#B3261E]/5 p-4 text-sm text-[#2B201A]">
          <TriangleAlert className="w-5 h-5 text-[#B3261E] shrink-0" />
          <div>
            <p className="font-bold">This UTR also appears on another donation.</p>
            <p className="text-[#2B201A]/75">
              {sameUtr.map((d, i) => (
                <span key={d.donationId}>
                  {i > 0 && ", "}
                  <Link href={`/admin/donations/${d.donationId}`} className="font-mono text-[#E86F1D] hover:underline">{d.donationId}</Link> ({d.status.toLowerCase().replace("_", " ")})
                </span>
              ))}
              {donation.utrOverride && " An admin allowed this duplicate. Check the bank statement carefully before verifying."}
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <section className="rounded-xl border border-[#E7D8C8] bg-white">
            <dl className="divide-y divide-[#E7D8C8]">
              {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[130px_1fr] sm:grid-cols-[170px_1fr] gap-3 px-4 sm:px-5 py-3 text-sm">
                  <dt className="text-[#2B201A]/60">{label}</dt>
                  <dd className="text-[#2B201A] font-semibold min-w-0">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {donation.adminNote && (
            <section className="rounded-xl border border-[#E7D8C8] bg-white p-4 sm:p-5 text-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/60 mb-1">Admin note</h2>
              <p className="whitespace-pre-wrap text-[#2B201A]">{donation.adminNote}</p>
            </section>
          )}

          <DonationActions
            donationId={donation.donationId}
            status={donation.status}
            amount={rupeesFromPaise(donation.amountPaise)}
            utr={donation.utr}
            emailStatus={donation.emailStatus}
            donorEmail={donation.donorEmail}
          />

          {donation.emails.length > 0 && (
            <section className="rounded-xl border border-[#E7D8C8] bg-white p-4 sm:p-5 text-sm space-y-2">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/60">Email log</h2>
              <ul className="space-y-1.5">
                {donation.emails.map((e) => (
                  <li key={e.id} className="flex flex-wrap gap-x-3 gap-y-0.5">
                    <span className={`font-bold ${e.status === "SENT" ? "text-[#2F5A43]" : "text-[#B3261E]"}`}>{e.status}</span>
                    <span className="text-[#2B201A]/65">{formatIST(e.createdAt)}</span>
                    <span className="text-[#2B201A]/65 break-all">to {e.to}</span>
                    {e.error && <span className="w-full text-xs text-[#B3261E]">{e.error}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="rounded-xl border border-[#E7D8C8] bg-white p-4 space-y-3 lg:sticky lg:top-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/60">Payment screenshot</h2>
          {donation.screenshotKey ? (
            <>
              <a href={screenshotUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-[#E7D8C8] bg-[#FAF6F0]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={screenshotUrl} alt={`Payment screenshot for ${donation.donationId}`} className="w-full max-h-[480px] object-contain" />
              </a>
              <a href={screenshotUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E86F1D] hover:underline">
                View full size <ExternalLink className="w-4 h-4" />
              </a>
            </>
          ) : (
            <p className="text-sm text-[#2B201A]/60">No screenshot uploaded.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
