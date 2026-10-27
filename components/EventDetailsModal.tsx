"use client";

import React, { useEffect, useRef } from "react";
import { X, Calendar, Clock, MapPin, Phone, Heart, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import HeadingDivider from "@/components/HeadingDivider";

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  titleHi?: string | null;
  summary: string;
  summaryHi?: string | null;
  description: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  timeText?: string | null;
  location: string;
  address?: string | null;
  mapUrl?: string | null;
  image?: string | null;
  contactPhone?: string | null;
  isPublished?: boolean;
}

interface EventDetailsModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (eventTitle: string) => void;
  lang?: "en" | "hi";
}

interface DayScheduleItem {
  dayNumber: number;
  dateStr: string;
  dayName: string;
  timeStr: string;
  topic?: string;
}

export default function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onRegister,
  lang = "en",
}: EventDetailsModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Complete lock of background document and body scroll on all browsers & devices
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      const origBodyOverflow = document.body.style.overflow;
      const origHtmlOverflow = document.documentElement.style.overflow;
      const origBodyPosition = document.body.style.position;
      const origTouchAction = document.body.style.touchAction;

      // Lock both HTML and BODY so background page can NEVER scroll
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      window.addEventListener("keydown", handleKeyDown);

      // Auto-focus scroll container so arrow keys and wheel work immediately
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.focus();
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        document.documentElement.style.overflow = origHtmlOverflow;
        document.body.style.overflow = origBodyOverflow;
        document.body.style.position = origBodyPosition;
        document.body.style.touchAction = origTouchAction;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const displayTitle = lang === "hi" && event.titleHi ? event.titleHi : event.title;
  const secondaryTitle = lang === "hi" ? event.title : event.titleHi;
  const displaySummary = lang === "hi" && event.summaryHi ? event.summaryHi : event.summary;

  const formatEventDateRange = (start: string | Date, end?: string | Date | null) => {
    const s = new Date(start);
    const startStr = s.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    if (!end) return startStr;
    const e = new Date(end);
    if (s.toDateString() === e.toDateString()) return startStr;
    const endStr = e.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${startStr} – ${endStr}`;
  };

  // Helper to ensure only a single time slot is shown (never double times like "7 AM & 2 PM")
  const cleanSingleTime = (timeStr?: string | null): string => {
    if (!timeStr) return "";
    let cleaned = timeStr.trim();
    if (cleaned.includes("&")) {
      const parts = cleaned.split("&");
      const first = parts[0].trim();
      if (cleaned.includes("IST") && !first.includes("IST")) {
        cleaned = `${first} IST`;
      } else {
        cleaned = first;
      }
    }
    return cleaned;
  };

  // Generate detailed day-by-day date & time pairings
  const getDetailedSchedule = (): DayScheduleItem[] => {
    const s = new Date(event.startDate);
    const e = event.endDate ? new Date(event.endDate) : s;

    // Bhagwat Katha 2-day schedule
    if (event.id === "ev-1" || event.slug.includes("bhagwat")) {
      const list: DayScheduleItem[] = [];
      const curr = new Date(s);
      let day = 1;
      while (curr <= e && day <= 2) {
        list.push({
          dayNumber: day,
          dateStr: curr.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          dayName: curr.toLocaleDateString("en-IN", { weekday: "short" }),
          timeStr: cleanSingleTime("4:00 PM – 7:30 PM IST"),
        });
        curr.setDate(curr.getDate() + 1);
        day++;
      }
      return list;
    }

    // Yoga Camp 3-day schedule (Single time: 6:00 AM – 9:00 AM IST)
    if (event.id === "ev-2" || event.slug.includes("yoga")) {
      const list: DayScheduleItem[] = [];
      const curr = new Date(s);
      let day = 1;
      while (curr <= e && day <= 3) {
        list.push({
          dayNumber: day,
          dateStr: curr.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          dayName: curr.toLocaleDateString("en-IN", { weekday: "short" }),
          timeStr: cleanSingleTime(event.timeText || "6:00 AM – 9:00 AM IST"),
        });
        curr.setDate(curr.getDate() + 1);
        day++;
      }
      return list;
    }

    // Gurukul Annual Day or single/multi day event fallback
    if (event.id === "ev-3" || event.slug.includes("gurukul")) {
      return [
        {
          dayNumber: 1,
          dateStr: s.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          dayName: s.toLocaleDateString("en-IN", { weekday: "long" }),
          timeStr: cleanSingleTime(event.timeText || "10:00 AM – 2:00 PM IST"),
        },
      ];
    }

    // Dynamic fallback for any general/future event
    const list: DayScheduleItem[] = [];
    const curr = new Date(s);
    let day = 1;
    while (curr <= e) {
      list.push({
        dayNumber: day,
        dateStr: curr.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        dayName: curr.toLocaleDateString("en-IN", { weekday: "short" }),
        timeStr: cleanSingleTime(event.timeText || "Daily Schedule"),
      });
      curr.setDate(curr.getDate() + 1);
      day++;
      if (day > 30) break;
    }
    return list;
  };

  const scheduleList = getDetailedSchedule();

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.summary,
          url: shareUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${event.title} - ${shareUrl}`);
      toast.success("Event details link copied to clipboard!");
    }
  };

  // If wheel event happens anywhere on the modal card (even on header or footer), route to scroll container!
  const handleCardWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (scrollContainerRef.current) {
      // If event was outside the scrollable body, manually scroll it
      if (!scrollContainerRef.current.contains(e.target as Node)) {
        scrollContainerRef.current.scrollTop += e.deltaY;
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      {/* Modal Dialog Card - Definite height (h-[88dvh] max-h-[820px]) so inner overflow-y-auto is 100% active */}
      <div
        className="bg-white rounded-2xl w-full h-[88dvh] max-h-[820px] border border-[#E7D8C8] shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative flex flex-col max-w-[680px] animate-in zoom-in-95 duration-200 overflow-hidden"
        style={{ overscrollBehavior: "contain" }}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleCardWheel}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar (Fixed at top of modal) */}
        <div className="bg-white px-5 py-3.5 sm:px-6 sm:py-4 border-b border-[#F0E4D5] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFF5EA] text-[#E86F1D] border border-[#E86F1D]/30 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#E86F1D]" />
              <span>
                {scheduleList.length > 1
                  ? `${scheduleList[0].dateStr} – ${scheduleList[scheduleList.length - 1].dateStr}`
                  : scheduleList.length === 1
                  ? scheduleList[0].dateStr
                  : formatEventDateRange(event.startDate, event.endDate)}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="text-[#5C4D43] hover:text-[#E86F1D] hover:bg-[#FFF5EA] rounded-full p-2 transition-colors cursor-pointer"
              title="Share Event"
              type="button"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-[#5C4D43] hover:text-[#E86F1D] hover:bg-[#FFF5EA] rounded-full p-2 transition-colors cursor-pointer"
              title="Close"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body - Strictly constrained with flex-1 min-h-0 and high-contrast orange scrollbar */}
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 md:p-7 space-y-6 touch-pan-y outline-none select-text [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-[#FBF6EE] [&::-webkit-scrollbar-thumb]:bg-[#E86F1D]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#E86F1D] [&::-webkit-scrollbar-thumb]:rounded-full"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
          }}
        >
          {/* Title Area */}
          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className="font-sans font-bold text-2xl sm:text-3xl text-[#E86F1D] leading-tight">
              {displayTitle}
            </h2>
            {secondaryTitle && (
              <p className="text-sm font-semibold text-[#8C6B3E]">
                {secondaryTitle}
              </p>
            )}
            <HeadingDivider align="left" className="!py-1 max-sm:justify-center" />
          </div>

          {/* ============================================================ */}
          {/* COMBINED SCHEDULE, VENUE & HELPLINE SECTION (Single Box)    */}
          {/* ============================================================ */}
          <div className="rounded-2xl border border-[#F0E4D5] bg-[#FFFBF7] shadow-xs overflow-hidden divide-y divide-[#F0E4D5]">
            {/* 1. Date & Timing Schedule */}
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[#F0E4D5]">
                <div className="w-7 h-7 rounded-lg bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#E86F1D]" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm sm:text-base text-[#1E1612]">
                    {lang === "hi" ? "दिनांक एवं समय सारणी" : "Date & Timing Schedule"}
                  </h3>
                </div>
              </div>

              {/* Day-by-Day Date + Time Rows (No 1,2,3 sequence, No subtitle topic under date, Single time) */}
              <div className="space-y-2.5">
                {scheduleList.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg bg-white border border-[#EFE5D8] px-3.5 py-2.5 hover:border-[#E86F1D]/50 transition-colors shadow-2xs flex items-center justify-between gap-3"
                  >
                    {/* Left: Date & Day Badge */}
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-xs sm:text-sm text-[#1E1612]">
                        {item.dateStr}
                      </span>
                      <span className="text-[11px] font-semibold text-[#8C6B3E] bg-[#FFF5EA] px-2 py-0.5 rounded-md border border-[#E86F1D]/15">
                        {item.dayName}
                      </span>
                    </div>

                    {/* Right: Exact Single Time Pill */}
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF5EA] border border-[#E86F1D]/30 text-[#EA580C] font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>{item.timeStr}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Venue & Location */}
            <div className="p-4 sm:p-5 bg-[#FFF9F2]/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-[#E86F1D]" />
              </div>
              <div className="text-xs sm:text-sm min-w-0 flex-1">
                <p className="font-bold text-[#8C6B3E] uppercase text-[11px] tracking-wider">
                  {lang === "hi" ? "स्थान / आयोजन स्थल" : "Venue / Location"}
                </p>
                <p className="font-bold text-[#1E1612] text-sm sm:text-base mt-0.5">{event.location}</p>
                {event.address && (
                  <p className="text-[#5C4D43] mt-1 leading-relaxed text-xs sm:text-sm">{event.address}</p>
                )}
                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#E86F1D] font-bold mt-2 hover:underline text-xs"
                  >
                    <span>{lang === "hi" ? "गूगल मैप पर स्थान देखें" : "View on Google Maps"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* 3. Contact & Helpline */}
            {event.contactPhone && (
              <div className="p-3.5 sm:p-4 bg-white/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-[#E86F1D]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#8C6B3E] uppercase text-[10px] tracking-wider">
                      {lang === "hi" ? "सहयोग व जानकारी हेल्पलाइन" : "Information & Helpline"}
                    </p>
                    <p className="font-bold text-[#1E1612] text-xs sm:text-sm">{event.contactPhone}</p>
                  </div>
                </div>
                <a
                  href={`tel:${event.contactPhone.replace(/[^0-9+]/g, "")}`}
                  className="px-3 py-1.5 rounded-lg bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs transition-colors shrink-0"
                >
                  {lang === "hi" ? "कॉल करें" : "Call Now"}
                </a>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* OVERVIEW SUMMARY */}
          {/* ============================================================ */}
          {displaySummary && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C6B3E]">
                {lang === "hi" ? "संक्षिप्त विवरण" : "Overview"}
              </h4>
              <p className="text-xs sm:text-sm text-[#3E3129] font-medium leading-relaxed bg-[#FFFBF7] p-4 rounded-xl border border-[#F0E4D5]">
                {displaySummary}
              </p>
            </div>
          )}

          {/* ============================================================ */}
          {/* EVENT DETAILS & SCHEDULE DESCRIPTION */}
          {/* ============================================================ */}
          {event.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C6B3E]">
                {lang === "hi" ? "विस्तृत विवरण एवं सत्संग रूपरेखा" : "Event Details & Schedule"}
              </h4>
              <div className="text-xs sm:text-sm text-[#4A3E38] leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-[#F0E4D5] shadow-2xs">
                {event.description}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer (Fixed at bottom of modal) */}
        <div className="bg-[#FAF4ED] px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#F0E4D5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-[#5C4D43] text-center sm:text-left font-medium">
            {lang === "hi"
              ? "पावन सत्संग में पधारें अथवा प्रसाद सेवा में सहयोग करें।"
              : "Join the sacred discourse or contribute for prasadam seva."}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E7D8C8] bg-white hover:bg-[#F3EBE0] text-[#1E1612] font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              {lang === "hi" ? "बंद करें" : "Close"}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRegister(event.title);
              }}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-lg bg-[#EA580C] hover:bg-[#D45A0E] text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>{lang === "hi" ? "सहयोग / पंजीकरण करें" : "Register / Support Event"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
