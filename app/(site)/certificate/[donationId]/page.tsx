import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Download, ExternalLink, FileX2, Clock } from "lucide-react";
import { amountInWords, certificateKey, certificateNumber } from "@/lib/server/certificate";
import { env } from "@/lib/server/env";
import { prisma } from "@/lib/server/prisma";
import { donationIdSchema } from "@/lib/validation/donation";
import { formatINR } from "@/lib/donation-config";

export const metadata: Metadata = {
  title: "Donation Certificate | Namo Bhagwate Vasudevaya Trust",
  robots: { index: false, follow: false },
  // The key is in the URL; don't pass it to other sites.
  referrer: "same-origin",
};

// Opened from the QR code on the certificate PDF and from the donor's confirmation email.
// Confirms the certificate is genuine and offers the PDF.
export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ donationId: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const { donationId } = await params;
  const { k = "" } = await searchParams;
  const donation = donationIdSchema.safeParse(donationId).success
    ? await prisma.donation.findUnique({ where: { donationId } })
    : null;
  const valid = donation && k === certificateKey(donation);

  if (!valid) {
    return (
      <Notice icon={<FileX2 className="w-12 h-12 text-[#B3261E]" />} title="Certificate not found">
        This certificate link is not valid. Please open it again from your confirmation email, or contact the Trust at{" "}
        <a href="mailto:help@namobhagwatevasudevaya.com" className="font-semibold text-[#E86F1D] hover:underline">help@namobhagwatevasudevaya.com</a>.
      </Notice>
    );
  }

  if (donation.status !== "VERIFIED") {
    return (
      <Notice icon={<Clock className="w-12 h-12 text-[#B8893E]" />} title="Certificate not issued yet">
        This donation is still being confirmed by the Trust. The certificate is issued and emailed once the payment is approved.
      </Notice>
    );
  }

  const paise = donation.amountPaise;
  const amount = formatINR(paise / 100);
  const date = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric" }).format(
    donation.verifiedAt ?? donation.updatedAt,
  );
  const pdfUrl = `/api/certificate/${donation.donationId}?k=${k}`;
  const details: [string, string][] = [
    ["Certificate No.", certificateNumber(donation.donationId)],
    ["Donation ID", donation.donationId],
    ["Payment", donation.utr ? `UPI · UTR ${donation.utr}` : "UPI"],
    ["Date of donation", date],
  ];

  return (
    <section className="section-py bg-[#FBF2E7]/60">
      <div className="page-container max-w-4xl space-y-6">
        <div className="flex items-start gap-3 rounded-2xl border border-[#2F5A43]/25 bg-[#2F5A43]/5 p-4 sm:p-5">
          <BadgeCheck className="w-6 h-6 text-[#2F5A43] shrink-0" />
          <div>
            <p className="font-bold text-[#2F5A43]">Genuine certificate</p>
            <p className="text-sm text-[#2B201A]/75">
              Issued by Namo Bhagwate Vasudevaya Trust for an approved donation. The details below match the Trust&apos;s records.
            </p>
          </div>
        </div>

        {/* On-screen version of the certificate */}
        <article className="relative overflow-hidden rounded-2xl bg-[#FFFBF3] p-1.5 shadow-sm border-[5px] border-[#B8893E]">
          <div className="rounded-xl border border-[#14532D]/70 px-5 py-8 sm:px-12 sm:py-10 text-center">
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
              <Image src="/images/logo.jpg" alt="Namo Bhagwate Vasudevaya Trust emblem" fill sizes="96px" className="object-contain mix-blend-multiply" />
            </div>
            <p className="mt-3 font-editorial text-base sm:text-xl font-bold tracking-[0.18em] text-[#14532D]">NAMO BHAGWATE VASUDEVAYA TRUST</p>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] text-[#B8893E]">BHAKTI • SEVA • SANSKAR • SAMARPAN</p>

            <h1 className="mt-5 font-editorial text-3xl sm:text-5xl font-bold text-[#2B201A]">Certificate of Donation</h1>
            <div className="mx-auto mt-3 flex max-w-xs items-center gap-2" aria-hidden="true">
              <span className="h-px flex-1 bg-[#B8893E]" />
              <span className="w-2 h-2 rotate-45 bg-[#B8893E]" />
              <span className="h-px flex-1 bg-[#B8893E]" />
            </div>

            <p className="mt-5 font-editorial italic text-[#6B5B4E] sm:text-lg">This certificate is gratefully presented to</p>
            <p className="mt-1 font-editorial italic font-semibold text-3xl sm:text-4xl text-[#B4531A] wrap-break-word">{donation.donorName}</p>
            <div className="mx-auto mt-2 h-px max-w-md bg-[#B8893E]/70" />

            <p className="mt-5 text-[#2B201A] sm:text-lg font-editorial">in grateful recognition of a generous contribution of</p>
            <p className="mt-1 font-editorial text-xl sm:text-2xl font-bold text-[#14532D]">
              {amount} <span className="text-[#B8893E]">·</span> {amountInWords(paise)}
            </p>
            <p className="mt-1 text-[#2B201A] sm:text-lg font-editorial">
              towards {donation.program || "General Donation"}, received on {date}.
            </p>

            <dl className="mt-7 grid grid-cols-2 sm:grid-cols-4 border-y border-[#D9BC7A] text-left sm:text-center">
              {details.map(([label, value], i) => (
                <div key={label} className={`px-3 py-3 ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t sm:border-t-0" : ""} sm:border-l sm:first:border-l-0 border-[#D9BC7A]`}>
                  <dt className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B8893E]">{label}</dt>
                  <dd className="mt-0.5 font-editorial font-semibold text-sm sm:text-base text-[#2B201A] break-all sm:break-normal">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-col items-center sm:items-end">
              <div className="w-56 border-t border-[#2B201A] pt-1.5 text-center">
                <p className="font-editorial font-bold text-[#2B201A]">{env().CERT_SIGNATORY_NAME}</p>
                <p className="font-editorial italic text-sm text-[#6B5B4E]">{env().CERT_SIGNATORY_TITLE}</p>
              </div>
            </div>
          </div>
        </article>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={`${pdfUrl}&download`} className="btn-primary">
            <Download className="w-4 h-4" />
            <span>Download certificate (PDF)</span>
          </a>
          <a href={pdfUrl} target="_blank" rel="noopener" className="btn-outline">
            <ExternalLink className="w-4 h-4" />
            <span>Open PDF</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Notice({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="section-py">
      <div className="page-container max-w-lg">
        <div className="card-warm p-8 text-center space-y-3">
          <div className="flex justify-center">{icon}</div>
          <h1 className="font-editorial text-3xl font-bold text-[#2B201A]">{title}</h1>
          <p className="text-sm text-[#2B201A]/75 leading-relaxed">{children}</p>
        </div>
      </div>
    </section>
  );
}
