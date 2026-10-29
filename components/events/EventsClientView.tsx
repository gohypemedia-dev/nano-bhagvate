"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";
import { useApp } from "@/context/AppContext";
import HeadingDivider from "@/components/HeadingDivider";
import EventDetailsModal, { EventItem } from "@/components/EventDetailsModal";

interface EventsClientViewProps {
  initialEvents: EventItem[];
}

export default function EventsClientView({ initialEvents }: EventsClientViewProps) {
  const { lang, openDonateModal } = useApp();
  const [events] = useState<EventItem[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const formatCardDate = (dateVal: string | Date) => {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
  };

  return (
    <div className="bg-[#FAF3EA] min-h-screen py-10 sm:py-16 lg:py-20">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Centered Title Header with Orange Color & Ornamental Divider */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10">
          <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-[#E86F1D] tracking-tight sm:whitespace-nowrap">
            {lang === "hi"
              ? "आगामी कार्यक्रम एवं आध्यात्मिक सत्संग"
              : "Upcoming Events & Spiritual Discourses"}
          </h1>
          <HeadingDivider className="mt-3" />
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E7D8C8] p-12 sm:p-16 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF9F2] text-[#E86F1D] mx-auto flex items-center justify-center border border-[#E7D8C8]">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#2B201A]">
              {lang === "hi" ? "कोई आगामी कार्यक्रम नहीं है" : "No Upcoming Events"}
            </h3>
            <p className="text-xs sm:text-sm text-[#2B201A]/70 leading-relaxed">
              {lang === "hi"
                ? "वर्तमान में कोई नया कार्यक्रम निर्धारित नहीं है। शीघ्र ही नए आध्यात्मिक आयोजनों की सूचना यहाँ दी जाएगी।"
                : "No new events are currently scheduled. Please check back soon for upcoming spiritual discourses and seva gatherings."}
            </p>
          </div>
        ) : (
          /* Grid of Event Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-2">
            {events.map((event) => {
              const hindiTitle =
                event.titleHi ||
                (event.title.toLowerCase().includes("bhagwat")
                  ? "श्रीमद्भागवत कथा ज्ञान यज्ञ"
                  : event.title.toLowerCase().includes("yoga")
                    ? "योग एवं प्राकृतिक चिकित्सा शिविर"
                    : event.title.toLowerCase().includes("gurukul")
                      ? "गुरुकुल वार्षिकोत्सव एवं बाल संस्कार"
                      : event.title);

              return (
                <div key={event.id} className="h-full">
                  <div
                    onClick={() => {
                      setSelectedEvent(event);
                      setEventModalOpen(true);
                    }}
                    className="rounded-2xl overflow-hidden bg-white border border-[#E7D8C8] shadow-[0_10px_30px_-8px_rgba(43,32,26,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(232,111,29,0.2)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between cursor-pointer h-full"
                  >
                    {/* Top Saffron/Orange Textured Banner with Bold White Devanagari Title */}
                    <div className="relative w-full h-[190px] sm:h-[210px] rounded-t-2xl bg-gradient-to-br from-[#F97316] via-[#E86F1D] to-[#C2410C] flex items-center justify-center p-6 text-center shadow-inner overflow-hidden">
                      {/* Soft subtle radial ambient glow */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/25 via-transparent to-black/25 pointer-events-none" />

                      {/* Bold White Hindi Title */}
                      <h3 className="relative z-10 font-sans font-black text-2xl sm:text-3xl lg:text-[28px] text-white leading-tight drop-shadow-md tracking-wide px-3">
                        {hindiTitle}
                      </h3>
                    </div>

                    {/* Overlapping Seam Circular Trust Emblem */}
                    <div className="relative -mt-6 z-10 flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/logo.jpg"
                          alt="Trust Logo"
                          width={44}
                          height={44}
                          className="w-full h-full object-cover object-top rounded-full"
                        />
                      </div>
                    </div>

                    {/* Bottom Clean White Card Body */}
                    <div className="bg-white p-6 pt-3 pb-6 flex-1 flex flex-col justify-between text-center space-y-3">
                      <div className="space-y-2">
                        {/* English Title */}
                        <h4 className="font-sans font-bold text-lg sm:text-xl text-[#1E1612] group-hover:text-[#E86F1D] transition-colors leading-snug">
                          {event.title}
                        </h4>

                        {/* Line-Dot-Line Divider */}
                        <HeadingDivider className="!py-0.5" />

                        {/* Description / Summary */}
                        <p className="text-xs sm:text-sm text-[#4A3E38]/85 leading-relaxed line-clamp-3 font-sans pt-0.5">
                          {lang === "hi" && event.summaryHi ? event.summaryHi : event.summary}
                        </p>
                      </div>

                      {/* Location & Date Details Row */}
                      <div className="pt-3 border-t border-[#F0E4D5] flex items-center justify-between text-xs text-[#8C6B3E] font-medium gap-2">
                        <span className="flex items-center gap-1.5 truncate max-w-[60%]">
                          <MapPin className="w-3.5 h-3.5 text-[#E86F1D] shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </span>
                        <span className="text-[#E86F1D] font-bold shrink-0">
                          {formatCardDate(event.startDate)}
                        </span>
                      </div>

                      {/* View Details Action Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            setEventModalOpen(true);
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-[#FAF3EA] hover:bg-[#E86F1D] text-[#8C6B3E] hover:text-white font-bold text-xs uppercase tracking-wider transition-colors border border-[#E7D8C8] hover:border-[#E86F1D] cursor-pointer"
                        >
                          {lang === "hi" ? "विवरण एवं पंजीकरण देखें" : "View Details & Register"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Details Modal Popup */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onRegister={(title) => {
          setEventModalOpen(false);
          openDonateModal(title);
        }}
        lang={lang}
      />
    </div>
  );
}

