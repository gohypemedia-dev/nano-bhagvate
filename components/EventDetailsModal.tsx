"use client";

import React, { useEffect } from "react";
import { X, Calendar, Clock, MapPin, Phone, Heart, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

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

export default function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onRegister,
  lang = "en",
}: EventDetailsModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const displayTitle = lang === "hi" && event.titleHi ? event.titleHi : event.title;
  const secondaryTitle = lang === "hi" ? event.title : event.titleHi;
  const displaySummary = lang === "hi" && event.summaryHi ? event.summaryHi : event.summary;

  const formatEventDate = (start: string | Date, end?: string | Date | null) => {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-[#FFF9F2] rounded-2xl w-full max-h-[calc(100dvh-28px)] sm:max-h-[calc(100dvh-36px)] border border-[#E7D8C8] shadow-2xl relative flex flex-col overflow-hidden max-w-[640px] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FBF2E7] px-4 py-3.5 sm:px-6 sm:py-4 border-b border-[#E7D8C8] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-block px-3 py-1 rounded-md bg-[#E86F1D] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
              {formatEventDate(event.startDate, event.endDate)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="text-[#2B201A]/60 hover:text-[#2B201A] hover:bg-[#2B201A]/5 rounded-full p-2 transition-colors"
              title="Share Event"
              type="button"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-[#2B201A]/60 hover:text-[#2B201A] hover:bg-[#2B201A]/5 rounded-full p-2 transition-colors"
              title="Close modal"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Title Area */}
          <div className="space-y-1.5">
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A] leading-tight">
              {displayTitle}
            </h2>
            {secondaryTitle && (
              <p className="text-sm font-semibold text-[#B8893E]">
                {secondaryTitle}
              </p>
            )}
          </div>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#FBF2E7]/80 border border-[#E7D8C8]">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#2B201A]/60 uppercase tracking-wider">Date & Duration</p>
                <p className="font-semibold text-[#2B201A] mt-0.5">
                  {formatEventDate(event.startDate, event.endDate)}
                </p>
              </div>
            </div>

            {event.timeText && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#B8893E]/15 text-[#B8893E] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#2B201A]/60 uppercase tracking-wider">Timing</p>
                  <p className="font-semibold text-[#2B201A] mt-0.5">{event.timeText}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5 sm:col-span-2">
              <div className="w-8 h-8 rounded-lg bg-[#2F5A43]/15 text-[#2F5A43] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs min-w-0">
                <p className="font-bold text-[#2B201A]/60 uppercase tracking-wider">Venue / Location</p>
                <p className="font-bold text-[#2B201A] mt-0.5">{event.location}</p>
                {event.address && (
                  <p className="text-[#2B201A]/75 mt-0.5 leading-relaxed">{event.address}</p>
                )}
                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#E86F1D] font-bold mt-1 hover:underline"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {event.contactPhone && (
              <div className="flex items-start gap-2.5 sm:col-span-2 pt-2 border-t border-[#E7D8C8]/60">
                <div className="w-8 h-8 rounded-lg bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#2B201A]/60 uppercase tracking-wider">Information & Helpline</p>
                  <a
                    href={`tel:${event.contactPhone.replace(/[^0-9+]/g, "")}`}
                    className="font-bold text-[#E86F1D] hover:underline mt-0.5 block"
                  >
                    {event.contactPhone}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {displaySummary && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">Overview</h4>
              <p className="text-sm text-[#2B201A] font-medium leading-relaxed bg-white/70 p-3.5 rounded-xl border border-[#E7D8C8]">
                {displaySummary}
              </p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">Event Details & Schedule</h4>
              <div className="text-sm text-[#2B201A]/85 leading-relaxed whitespace-pre-line space-y-2">
                {event.description}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="bg-[#FBF2E7] px-3.5 sm:px-5 py-3 sm:py-4 border-t border-[#E7D8C8] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-[#2B201A]/70 text-center sm:text-left">
            Join the sacred discourse or contribute for prasadam seva.
          </p>
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline shrink-0 text-xs !min-h-[40px] !py-2 !px-3 sm:!px-4"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRegister(event.title);
              }}
              className="btn-primary flex-1 sm:flex-initial text-xs !min-h-[40px] !py-2 !px-3 sm:!px-5 inline-flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap tracking-normal sm:tracking-wider"
            >
              <Heart className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="inline sm:hidden">Register / Support</span>
              <span className="hidden sm:inline">Register / Support Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
