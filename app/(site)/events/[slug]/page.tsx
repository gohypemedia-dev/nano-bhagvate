import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Phone, Heart, ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return { title: "Event Not Found | Namo Bhagwate Vasudevaya Trust" };

  return {
    title: `${event.title} | Namo Bhagwate Vasudevaya Trust`,
    description: event.summary,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });

  if (!event) notFound();

  const formatDate = (start: Date, end?: Date | null) => {
    const s = new Date(start);
    const startStr = s.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!end) return startStr;
    const e = new Date(end);
    if (s.toDateString() === e.toDateString()) return startStr;
    const endStr = e.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${startStr} – ${endStr}`;
  };

  return (
    <div className="bg-[#FFF9F2] min-h-screen py-10 sm:py-14">
      <div className="page-container max-w-4xl mx-auto space-y-8 px-4 sm:px-6">
        {/* Navigation Back */}
        <div>
          <Link
            href="/#events"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#E86F1D] hover:underline uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>
        </div>

        {/* Main Event Card */}
        <div className="bg-white rounded-3xl border border-[#E7D8C8] shadow-sm overflow-hidden p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-block px-3.5 py-1.5 bg-[#E86F1D] text-white text-xs font-bold rounded-lg uppercase tracking-wider">
              {formatDate(event.startDate, event.endDate)}
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#2B201A] leading-tight">
              {event.title}
            </h1>
            {event.titleHi && (
              <p className="font-editorial text-xl sm:text-2xl font-bold text-[#B8893E]">
                {event.titleHi}
              </p>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#FBF2E7] border border-[#E7D8C8]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#2B201A]/60 uppercase tracking-wider">Date & Duration</p>
                <p className="font-bold text-[#2B201A] text-sm mt-0.5">
                  {formatDate(event.startDate, event.endDate)}
                </p>
              </div>
            </div>

            {event.timeText && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B8893E]/15 text-[#B8893E] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#2B201A]/60 uppercase tracking-wider">Daily Timing</p>
                  <p className="font-bold text-[#2B201A] text-sm mt-0.5">{event.timeText}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-[#2F5A43]/15 text-[#2F5A43] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-xs min-w-0">
                <p className="font-bold text-[#2B201A]/60 uppercase tracking-wider">Venue Location</p>
                <p className="font-bold text-[#2B201A] text-sm mt-0.5">{event.location}</p>
                {event.address && (
                  <p className="text-[#2B201A]/80 mt-1 leading-relaxed text-xs">{event.address}</p>
                )}
                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#E86F1D] font-bold mt-1.5 hover:underline"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {event.contactPhone && (
              <div className="flex items-start gap-3 sm:col-span-2 pt-3 border-t border-[#E7D8C8]">
                <div className="w-10 h-10 rounded-xl bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#2B201A]/60 uppercase tracking-wider">Helpline & Seva Information</p>
                  <a
                    href={`tel:${event.contactPhone.replace(/[^0-9+]/g, "")}`}
                    className="font-bold text-sm text-[#E86F1D] hover:underline mt-0.5 block"
                  >
                    {event.contactPhone}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">Overview</h2>
            <p className="text-base text-[#2B201A] leading-relaxed">
              {event.summary}
            </p>
          </div>

          {/* Detailed Description */}
          {event.description && (
            <div className="space-y-3 pt-4 border-t border-[#E7D8C8]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">
                Event Highlights & Discourse Schedule
              </h2>
              <div className="text-sm sm:text-base text-[#2B201A]/85 leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            </div>
          )}

          {/* Register Action */}
          <div className="pt-6 border-t border-[#E7D8C8] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FBF2E7]/60 p-6 rounded-2xl">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#2B201A]">
                Join the Sacred Discourse
              </h3>
              <p className="text-xs text-[#2B201A]/70 mt-0.5">
                Support the satsang or sponsor prasadam seva to receive your official entry pass.
              </p>
            </div>
            <Link
              href={`/donate?program=${encodeURIComponent(event.title)}`}
              className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2 shadow-xs shrink-0 w-full sm:w-auto justify-center"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Register / Support Event</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
