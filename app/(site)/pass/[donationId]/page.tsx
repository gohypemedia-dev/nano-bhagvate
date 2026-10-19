import type { Metadata } from "next";
import Link from "next/link";
import { Download, Calendar, Clock, MapPin, Phone, CheckCircle2, FileX2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { certificateKey } from "@/lib/server/certificate";
import { prisma } from "@/lib/server/prisma";
import { donationIdSchema } from "@/lib/validation/donation";
import { formatINR } from "@/lib/donation-config";

export const metadata: Metadata = {
  title: "Official Event Entry Pass | Namo Bhagwate Vasudevaya Trust",
  robots: { index: false, follow: false },
};

export default async function EventPassPage({
  params,
  searchParams,
}: {
  params: Promise<{ donationId: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const { donationId } = await params;
  const { k = "" } = await searchParams;

  const validId = donationIdSchema.safeParse(donationId).success;
  const donation = validId
    ? await prisma.donation.findUnique({ where: { donationId } })
    : null;

  const valid = donation && k === certificateKey(donation);

  if (!valid) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-[#E7D8C8] shadow-sm space-y-4">
          <FileX2 className="w-12 h-12 text-[#B3261E] mx-auto" />
          <h1 className="font-editorial text-2xl font-bold text-[#2B201A]">Pass Not Found</h1>
          <p className="text-sm text-[#2B201A]/70">
            This entry pass link is invalid or expired. Please check your confirmation email or contact the Trust.
          </p>
        </div>
      </div>
    );
  }

  if (donation.status !== "VERIFIED") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-[#E7D8C8] shadow-sm space-y-4">
          <Clock className="w-12 h-12 text-[#B8893E] mx-auto" />
          <h1 className="font-editorial text-2xl font-bold text-[#2B201A]">Pass Pending Approval</h1>
          <p className="text-sm text-[#2B201A]/70">
            Your payment is currently being verified by the Trust. Your official entry pass will be issued and emailed once approved.
          </p>
        </div>
      </div>
    );
  }

  let event = null;
  if (donation.program) {
    event = await prisma.event.findFirst({
      where: { title: { equals: donation.program, mode: "insensitive" } },
    });
  }

  const eventName = event?.title || donation.program || "Spiritual Gathering";
  const eventSlug = event?.slug || "shrimad-bhagwat-katha-2026";
  const eventRedirectUrl = `https://nano-bhagvate.vercel.app/?event=${encodeURIComponent(eventSlug)}#events`;
  const pdfDownloadUrl = `/api/pass/${donation.donationId}?k=${k}`;

  const eventDateStr = event?.startDate
    ? new Date(event.startDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(donation.verifiedAt ?? new Date());

  return (
    <section className="section-py bg-[#FFF9F2] min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Pass Actions Top */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E7D8C8] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2F5A43]/10 text-[#2F5A43] text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified & Approved</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={eventRedirectUrl}
              className="btn-outline text-xs py-2 px-3.5"
            >
              View Event Details
            </Link>
            <a
              href={pdfDownloadUrl}
              download
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Pass</span>
            </a>
          </div>
        </div>

        {/* The Digital Pass Card */}
        <div className="bg-[#FFFDF8] rounded-3xl border-2 border-[#B8893E] shadow-xl overflow-hidden relative">
          {/* Header Banner */}
          <div className="bg-[#2B201A] text-white p-6 sm:p-7 text-center relative overflow-hidden border-b-2 border-[#B8893E]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#B8893E] mb-1">
              NAMO BHAGWATE VASUDEVAYA TRUST
            </p>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-wide">
              OFFICIAL EVENT ENTRY PASS
            </h1>
            <p className="text-xs text-[#E7D8C8] font-serif mt-1">
              सत्संग एवं कथा प्रवेश पत्र
            </p>
          </div>

          {/* Pass Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Event Title */}
            <div className="text-center space-y-1 pb-4 border-b border-[#E7D8C8]">
              <span className="inline-block px-3 py-1 bg-[#E86F1D] text-white text-xs font-bold rounded-md uppercase tracking-wider mb-2">
                {eventName}
              </span>
              {event?.titleHi && (
                <p className="text-base font-semibold text-[#B8893E]">
                  {event.titleHi}
                </p>
              )}
            </div>

            {/* Devotee Info & QR Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-[#FBF2E7] p-5 rounded-2xl border border-[#E7D8C8]">
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5B4E]">
                    Pass Holder / Devotee
                  </p>
                  <p className="font-editorial text-2xl font-bold text-[#2B201A] mt-0.5">
                    {donation.donorName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#2B201A]">
                  <div>
                    <span className="text-[#6B5B4E] block">Pass ID:</span>
                    <span className="font-mono font-bold text-[#2F5A43]">PASS-{donation.donationId}</span>
                  </div>
                  <div>
                    <span className="text-[#6B5B4E] block">Contribution:</span>
                    <span className="font-bold">{formatINR(donation.amountPaise / 100)}</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-[#E7D8C8] shrink-0">
                <QRCodeSVG value={eventRedirectUrl} size={110} level="M" />
                <span className="text-[10px] font-bold text-[#6B5B4E] uppercase tracking-wider mt-2">
                  Scan for Event Details
                </span>
              </div>
            </div>

            {/* Schedule & Venue Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 p-3.5 bg-white rounded-xl border border-[#E7D8C8]">
                <p className="font-bold text-[#6B5B4E] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#E86F1D]" />
                  <span>Date & Duration</span>
                </p>
                <p className="font-bold text-[#2B201A] text-sm mt-1">{eventDateStr}</p>
                <p className="text-[#6B5B4E] flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-[#B8893E]" />
                  <span>{event?.timeText || "4:00 PM – 7:30 PM IST Daily"}</span>
                </p>
              </div>

              <div className="space-y-1 p-3.5 bg-white rounded-xl border border-[#E7D8C8]">
                <p className="font-bold text-[#6B5B4E] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2F5A43]" />
                  <span>Ashram Venue</span>
                </p>
                <p className="font-bold text-[#2B201A] text-sm mt-1">
                  {event?.location || "Trust Ashram & Satsang Kendra"}
                </p>
                <p className="text-[#6B5B4E] leading-relaxed mt-1">
                  {event?.address || "Gurugram Ashram, Sector 48, Haryana"}
                </p>
              </div>
            </div>

            {/* Gate Instructions */}
            <div className="bg-[#FFF9F2] p-4 rounded-xl border border-[#E7D8C8] text-xs text-[#2B201A]/80 space-y-1.5">
              <p className="font-bold text-[#B8893E] uppercase tracking-wider">
                Important Entry Instructions:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Please present this digital pass or downloaded PDF at the ashram entry gate.</li>
                <li>Pass entitles seating in the discourse hall and Mahaprasad coupon.</li>
                {event?.contactPhone && (
                  <li>
                    Helpline for travel and accommodation queries:{" "}
                    <a href={`tel:${event.contactPhone}`} className="font-bold text-[#E86F1D] underline">
                      {event.contactPhone}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-[#FBF2E7] px-6 py-3 border-t border-[#E7D8C8] text-center text-[11px] text-[#6B5B4E]">
            Non-transferable digital pass issued under Namo Bhagwate Vasudevaya Trust (Regd.)
          </div>
        </div>
      </div>
    </section>
  );
}
