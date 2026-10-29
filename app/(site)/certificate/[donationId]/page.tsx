import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Check, Download, ExternalLink, FileX2, Clock } from "lucide-react";
import { amountInWords, certificateKey, certificateNumber } from "@/lib/server/certificate";
import { env } from "@/lib/server/env";
import { prisma } from "@/lib/server/prisma";
import { donationIdSchema } from "@/lib/validation/donation";
import { getCurrentUser } from "@/lib/server/user-auth";
import { getAdmin } from "@/lib/server/auth";
import { formatINR, membershipValidUntil, planForProgram, type MembershipPlan } from "@/lib/donation-config";

export const metadata: Metadata = {
  title: "Certificate | Namo Bhagwate Vasudevaya Trust",
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
  if (!donation) {
    return (
      <Notice icon={<FileX2 className="w-12 h-12 text-[#B3261E]" />} title="Certificate not found">
        This certificate link is not valid. Please open it again from your confirmation email, or contact the Trust at{" "}
        <a href="mailto:help@namobhagwatevasudevaya.com" className="font-semibold text-[#E86F1D] hover:underline">help@namobhagwatevasudevaya.com</a>.
      </Notice>
    );
  }

  const [currentUser, admin] = await Promise.all([
    getCurrentUser().catch(() => null),
    getAdmin().catch(() => null),
  ]);

  const isOwner = Boolean(
    currentUser &&
      (currentUser.email.toLowerCase() === donation.donorEmail.toLowerCase() ||
        (currentUser.phone && donation.donorMobile && currentUser.phone === donation.donorMobile))
  );
  const isAdmin = Boolean(admin);
  const keyMatches = Boolean(k && k === certificateKey(donation));

  if (!keyMatches && !isOwner && !isAdmin) {
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
        This {donation.type === "MEMBERSHIP" ? "membership" : "donation"} is still being confirmed by the Trust. The certificate is issued and emailed once the payment is approved.
      </Notice>
    );
  }

  const member = donation.type === "MEMBERSHIP";
  const paise = donation.amountPaise;
  const amount = formatINR(paise / 100);
  const longDate = (d: Date) =>
    new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric" }).format(d);
  const date = longDate(donation.verifiedAt ?? donation.updatedAt);
  const effectiveKey = k || certificateKey(donation);
  const pdfUrl = `/api/certificate/${donation.donationId}?k=${effectiveKey}`;
  const signatory = { name: env().CERT_SIGNATORY_NAME, title: env().CERT_SIGNATORY_TITLE };

  return (
    <section className="section-py bg-[#FBF2E7]/60">
      <div className="page-container max-w-4xl space-y-6">
        <div className="flex items-start gap-3 rounded-2xl border border-[#2F5A43]/25 bg-[#2F5A43]/5 p-4 sm:p-5">
          <BadgeCheck className="w-6 h-6 text-[#2F5A43] shrink-0" />
          <div>
            <p className="font-bold text-[#2F5A43]">Genuine certificate</p>
            <p className="text-sm text-[#2B201A]/75">
              Issued by Namo Bhagwate Vasudevaya Trust for an approved {member ? "membership" : "donation"}. The details below match the Trust&apos;s records.
            </p>
          </div>
        </div>

        {/* On-screen version of the certificate */}
        {member ? (
          <MembershipCertificate
            plan={planForProgram(donation.program)}
            name={donation.donorName}
            donationId={donation.donationId}
            since={donation.verifiedAt ?? donation.updatedAt}
            amount={amount}
            inWords={amountInWords(paise)}
            longDate={longDate}
            signatory={signatory}
          />
        ) : (
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
                {([
                  ["Certificate No.", certificateNumber(donation.donationId)],
                  ["Donation ID", donation.donationId],
                  ["Payment", donation.utr ? `UPI · UTR ${donation.utr}` : "UPI"],
                  ["Date of donation", date],
                ] as [string, string][]).map(([label, value], i) => (
                  <div key={label} className={`px-3 py-3 ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t sm:border-t-0" : ""} sm:border-l sm:first:border-l-0 border-[#D9BC7A]`}>
                    <dt className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B8893E]">{label}</dt>
                    <dd className="mt-0.5 font-editorial font-semibold text-sm sm:text-base text-[#2B201A] break-all sm:break-normal">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 flex flex-col items-center sm:items-end">
                <div className="w-56 border-t border-[#2B201A] pt-1.5 text-center">
                  <p className="font-editorial font-bold text-[#2B201A]">{signatory.name}</p>
                  <p className="font-editorial italic text-sm text-[#6B5B4E]">{signatory.title}</p>
                </div>
              </div>
            </div>
          </article>
        )}

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

// Matches the membership PDF: a panel in the plan's colour with the membership details,
// then the citation and the plan's privileges.
function MembershipCertificate({
  plan,
  name,
  donationId,
  since,
  amount,
  inWords,
  longDate,
  signatory,
}: {
  plan: MembershipPlan;
  name: string;
  donationId: string;
  since: Date;
  amount: string;
  inWords: string;
  longDate: (d: Date) => string;
  signatory: { name: string; title: string };
}) {
  const validUntil = membershipValidUntil(plan, since);
  const [first, ...rest] = plan.title.split(" ");
  const facts: [string, string][] = [
    ["Membership ID", donationId],
    ["Member since", longDate(since)],
    ["Valid until", validUntil ? longDate(validUntil) : "Lifetime"],
    ["Certificate No.", certificateNumber(donationId)],
  ];
  return (
    <article className="overflow-hidden rounded-2xl bg-[#FFFBF3] shadow-sm border border-[#E7D8C8] grid md:grid-cols-[230px_1fr]">
      <div className="text-[#FFFBF3] px-6 py-8 text-center border-b-[5px] md:border-b-0 md:border-r-[5px] border-[#B8893E]" style={{ backgroundColor: plan.color }}>
        <div className="relative mx-auto w-24 h-24 rounded-full bg-[#FFFBF3] ring-2 ring-[#B8893E] ring-offset-4" style={{ ["--tw-ring-offset-color" as string]: plan.color }}>
          <Image src="/images/logo.jpg" alt="Namo Bhagwate Vasudevaya Trust emblem" fill sizes="96px" className="object-contain p-2 mix-blend-multiply" />
        </div>
        <p className="mt-6 text-[10px] font-semibold tracking-[0.35em] uppercase">Membership</p>
        <p className="mt-1 font-editorial text-3xl font-bold tracking-[0.12em] uppercase">{first}</p>
        {rest.length > 0 && <p className="font-editorial text-base font-semibold tracking-[0.3em] uppercase">{rest.join(" ")}</p>}
        <dl className="mt-6 grid grid-cols-2 md:grid-cols-1 gap-4 border-t border-[#FFFBF3]/30 pt-5">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[9px] font-semibold tracking-[0.25em] uppercase opacity-85">{label}</dt>
              <dd className="font-editorial font-semibold text-sm sm:text-base break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="px-5 py-8 sm:px-10 sm:py-10 text-center">
        <p className="font-editorial text-sm sm:text-lg font-bold tracking-[0.18em] text-[#14532D]">NAMO BHAGWATE VASUDEVAYA TRUST</p>
        <p className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] text-[#B8893E]">BHAKTI • SEVA • SANSKAR • SAMARPAN</p>
        <h1 className="mt-5 font-editorial text-3xl sm:text-5xl font-bold text-[#2B201A]">Membership Certificate</h1>
        <div className="mx-auto mt-3 flex max-w-xs items-center gap-2" aria-hidden="true">
          <span className="h-px flex-1" style={{ backgroundColor: plan.color }} />
          <span className="w-2 h-2 rotate-45" style={{ backgroundColor: plan.color }} />
          <span className="h-px flex-1" style={{ backgroundColor: plan.color }} />
        </div>

        <p className="mt-5 font-editorial italic text-[#6B5B4E] sm:text-lg">This is to certify that</p>
        <p className="mt-1 font-editorial italic font-semibold text-3xl sm:text-4xl wrap-break-word" style={{ color: plan.color }}>{name}</p>
        <div className="mx-auto mt-2 h-px max-w-md bg-[#B8893E]/70" />

        <p className="mt-5 font-editorial font-semibold text-[#2B201A] sm:text-lg">
          is an honoured {plan.title} of Namo Bhagwate Vasudevaya Trust,
        </p>
        <p className="mt-1 font-editorial text-[#2B201A] sm:text-lg">
          having joined on {longDate(since)} with a contribution of {amount}
        </p>
        <p className="font-editorial italic text-sm text-[#6B5B4E]">({inWords})</p>

        {/* The plan card, as on the membership page */}
        <div className="relative mt-9 rounded-xl border bg-white/60 px-5 pt-7 pb-5 text-left grid sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] gap-5" style={{ borderColor: plan.color }}>
          <span
            className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[#FFFBF3]"
            style={{ backgroundColor: plan.color }}
          >
            {plan.badge}
          </span>
          <div className="sm:border-r sm:border-[#D9BC7A] sm:pr-5">
            <p className="font-editorial text-xl font-bold text-[#2B201A]">{plan.name}</p>
            <p className="mt-1 font-editorial italic text-sm text-[#6B5B4E]">{plan.description}</p>
            <p className="mt-3">
              <span className="font-editorial text-2xl font-bold" style={{ color: plan.color }}>{formatINR(plan.price)}</span>
              <span className="ml-1.5 text-xs font-semibold text-[#6B5B4E]">INR / {plan.period}</span>
            </p>
          </div>
          <ul className="space-y-2 font-editorial text-[#2B201A]">
            {plan.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#14532D]" aria-hidden="true" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center sm:items-end">
          <div className="w-56 border-t border-[#2B201A] pt-1.5 text-center">
            <p className="font-editorial font-bold text-[#2B201A]">{signatory.name}</p>
            <p className="font-editorial italic text-sm text-[#6B5B4E]">{signatory.title}</p>
          </div>
        </div>
      </div>
    </article>
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
