import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LEGAL, POLICY_LINKS } from "@/lib/legal";
import HeadingDivider from "@/components/HeadingDivider";

// Shared layout for the policy pages: hero, numbered sections, contact box and links to the other policies.
export default function LegalPage({
  title,
  intro,
  current,
  children,
}: {
  title: string;
  intro: React.ReactNode;
  current: (typeof POLICY_LINKS)[number]["href"];
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <section className="py-14 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container text-center space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FFF9F2] border border-[#B8893E]/30 rounded-full text-xs font-bold text-[#B8893E] uppercase tracking-widest mx-auto">
            <ShieldCheck className="w-4 h-4 text-[#2F5A43]" />
            <span>Policies</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#E86F1D]">{title}</h1>
          <HeadingDivider className="my-1.5" />
          <p className="text-xs text-[#2B201A]/60 font-semibold">
            Last updated: {LEGAL.lastUpdated} • {LEGAL.trustName}
          </p>
        </div>
      </section>

      <section className="section-py">
        <div className="page-container max-w-4xl space-y-6">
          <nav aria-label="Policies" className="flex flex-wrap justify-center gap-2">
            {POLICY_LINKS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                aria-current={p.href === current ? "page" : undefined}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  p.href === current
                    ? "bg-[#2B201A] text-white border-[#2B201A]"
                    : "bg-white text-[#2B201A]/75 border-[#E7D8C8] hover:border-[#E86F1D]/50"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </nav>

          <div className="card-warm p-6 sm:p-12 space-y-8 font-sans text-base text-[#2B201A]/85 leading-relaxed">
            <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#E7D8C8] text-sm text-[#2B201A]/80">{intro}</div>
            {children}
            <ContactBox />
          </div>
        </div>
      </section>
    </div>
  );
}

export function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-editorial text-2xl font-bold text-[#2B201A] border-b border-[#E7D8C8] pb-2">
        {n}. {title}
      </h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:text-sm [&_a]:text-[#E86F1D] [&_a]:underline">
        {children}
      </div>
    </div>
  );
}

function ContactBox() {
  return (
    <div className="p-6 bg-[#FFF9F2] rounded-2xl border border-[#E7D8C8] space-y-3">
      <h3 className="font-editorial text-xl font-bold text-[#2B201A]">Contact &amp; Grievance Officer</h3>
      <p className="text-sm text-[#2B201A]/80">
        For questions, complaints, refund requests or requests about your personal data, contact:
      </p>
      <div className="text-sm space-y-1 text-[#2B201A]">
        <p className="font-bold">{LEGAL.grievanceOfficer}</p>
        <p>
          {LEGAL.trustName} (Reg. No. {LEGAL.registration})
        </p>
        <p>{LEGAL.address}</p>
        <p>
          Email:{" "}
          <a href={`mailto:${LEGAL.email}`} className="text-[#E86F1D] font-semibold hover:underline">
            {LEGAL.email}
          </a>{" "}
          • Phone:{" "}
          <a href={LEGAL.phoneHref} className="text-[#E86F1D] font-semibold hover:underline">
            {LEGAL.phone}
          </a>
        </p>
      </div>
      <p className="text-xs text-[#2B201A]/70">
        We acknowledge complaints within {LEGAL.grievanceAckHours} hours and aim to resolve them within{" "}
        {LEGAL.grievanceResolveDays} days of receipt.
      </p>
    </div>
  );
}
