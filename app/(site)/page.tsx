"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Heart,
  Calendar,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Quote,
  CheckCircle2,
  Compass,
  Sun,
  ShieldCheck,
  Info,
  MapPin,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import EventDetailsModal, { EventItem } from "@/components/EventDetailsModal";
import GallerySection from "@/components/gallery/GallerySection";
import CountUp from "@/components/CountUp";
import TestimonialsSection from "@/components/TestimonialsSection";
import ParallaxPillarCard from "@/components/ParallaxPillarCard";

export default function HomePage() {
  const { lang, openDonateModal } = useApp();

  const defaultEvents: EventItem[] = [
    {
      id: "ev-1",
      slug: "shrimad-bhagwat-katha-2026",
      title: "Shrimad Bhagwat Katha",
      titleHi: "श्रीमद्भागवत कथा ज्ञान यज्ञ",
      summary: "Join us for a sacred seven-day spiritual discourse on the Shrimad Bhagwat Purana. All devotees are cordially invited.",
      summaryHi: "सात दिवसीय पावन श्रीमद्भागवत कथा ज्ञान यज्ञ में सादर आमंत्रित हैं। सभी भक्तगण पधारकर पुण्य लाभ प्राप्त करें।",
      description: "Join us for a divine seven-day spiritual discourse diving into the sublime pastimes and teachings of Lord Krishna from the Shrimad Bhagwat Mahapuran. Accompanied by daily sankirtan, aarti, and mahaprasad distribution. Devotees may also sponsor a day's discourse or prasadam seva.",
      startDate: "2026-11-15T10:30:00Z",
      endDate: "2026-11-21T14:00:00Z",
      timeText: "4:00 PM – 7:30 PM IST Daily",
      location: "Gurugram Ashram & Live Stream",
      address: "Namo Bhagwate Vasudevaya Trust Ashram, Sector 48, Gurugram, Haryana - 122018",
      contactPhone: "+91 9910762692",
      isPublished: true,
    },
    {
      id: "ev-2",
      slug: "yoga-wellness-camp-2026",
      title: "Yoga & Wellness Camp",
      titleHi: "योग एवं प्राकृतिक चिकित्सा शिविर",
      summary: "A three-day holistic wellness camp featuring yoga, meditation, pranayama, and Ayurvedic health consultation.",
      summaryHi: "योग, ध्यान, प्राणायाम एवं निःशुल्क आयुर्वेदिक स्वास्थ्य परामर्श से युक्त त्रिदिवसीय समग्र स्वास्थ्य शिविर।",
      description: "Rejuvenate mind, body, and soul in the holy environment of Vrindavan. The camp features early morning asana and pranayama sessions, yogic satvik diet, stress-relief meditation, and personalized pulse diagnosis (Nadi Parikshan) by experienced Vaidyas.",
      startDate: "2026-12-05T00:30:00Z",
      endDate: "2026-12-07T13:30:00Z",
      timeText: "6:00 AM – 9:00 AM & 4:30 PM – 7:00 PM IST",
      location: "Vrindavan Seva Kendra",
      address: "Raman Reti Road, Near Bhaktivedanta Hospital, Vrindavan, Uttar Pradesh - 281121",
      contactPhone: "+91 9910762692",
      isPublished: true,
    },
    {
      id: "ev-3",
      slug: "gurukul-annual-celebration-2027",
      title: "Gurukul Annual Celebration",
      titleHi: "गुरुकुल वार्षिकोत्सव एवं बाल संस्कार",
      summary: "A cultural celebration showcasing Vedic chanting, cultural performances, and academic achievements of Gurukul students.",
      summaryHi: "वेद मंत्रोच्चार, सांस्कृतिक प्रस्तुतियां एवं गुरुकुल के विद्यार्थियों की उपलब्धियों का भव्य वार्षिकोत्सव।",
      description: "Celebrate the preservation of Sanatan values and cultural heritage. The annual function will present Vedic recitation by young Brahmacharis, classical spiritual drama depicting scriptures, prize distribution, and blessing discourses by revered saints.",
      startDate: "2027-01-10T04:30:00Z",
      endDate: "2027-01-10T08:30:00Z",
      timeText: "10:00 AM – 2:00 PM IST (Followed by Mahaprasad)",
      location: "Main Auditorium",
      address: "Trust Central Auditorium, Gurugram / Delhi NCR",
      contactPhone: "+91 9910762692",
      isPublished: true,
    },
  ];

  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  useEffect(() => {
    // 1. Immediately check URL params on mount without waiting for network
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const eventParam = params.get("event")?.toLowerCase();
      const hasHash = window.location.hash === "#events";

      if (eventParam) {
        const matched = defaultEvents.find(
          (e) =>
            e.slug.toLowerCase() === eventParam ||
            e.title.toLowerCase().includes(eventParam) ||
            eventParam.includes(e.slug.toLowerCase())
        );
        if (matched) {
          setSelectedEvent(matched);
          setEventModalOpen(true);
        }
      }

      if (eventParam || hasHash) {
        setTimeout(() => {
          const el = document.getElementById("events");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      }
    }

    // 2. Fetch live events from API
    fetch("/api/events")
      .then((res) => {
        // On failure the built-in sample events stay on screen, so make the failure visible.
        if (!res.ok) console.warn(`[events] /api/events failed (${res.status}); showing built-in sample events.`);
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data?.events && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const eventParam = params.get("event")?.toLowerCase();
            if (eventParam) {
              const matched = data.events.find(
                (e: EventItem) =>
                  e.slug.toLowerCase() === eventParam ||
                  e.title.toLowerCase().includes(eventParam) ||
                  eventParam.includes(e.slug.toLowerCase())
              );
              if (matched) {
                setSelectedEvent(matched);
                setEventModalOpen(true);
              }
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  const formatCardDate = (dateVal: string | Date) => {
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).toUpperCase();
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="w-full">
      {/* FULL-WIDTH HERO BANNER (ORIGINAL BANNER, ZERO WALL OVERLAYS, BOTTOM ACTION BAR) */}
      <section className="relative w-full overflow-hidden border-b border-[#E7D8C8]">
        {/* ============================================================ */}
        {/* DESKTOP & LAPTOP HERO BANNER (>= 640px / sm) */}
        {/* 100VH Full Viewport Height with original banner & sleek bottom action bar */}
        {/* ============================================================ */}
        <div className="hidden sm:block relative w-full h-[calc(100vh-74px)] min-[1000px]:h-[calc(100vh-76px)] xl:h-[calc(100vh-82px)] min-h-[580px] overflow-hidden">
          {/* Original Hero Photo - completely clear and untouched */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/desktop-hero-original.webp"
            alt="Namo Bhagwate Vasudevaya Trust - Pujya Sadhvi Vijeshanand Saraswati Ji"
            className="w-full h-full object-cover object-center block select-none pointer-events-none"
            loading="eager"
          />

          {/* Semantic live H1 for SEO */}
          <h1 className="sr-only">Namo Bhagwate Vasudevaya Trust</h1>

          {/* Sleek Bottom Floating Action Bar across the bottom of the hero */}
          <div className="absolute bottom-0 inset-x-0 z-20 w-full px-6 md:px-10 lg:px-14 py-5 md:py-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col md:flex-row md:items-end md:justify-between gap-4 pointer-events-none">
            {/* Left: Badge + Heading + Purpose summary */}
            <div className="flex flex-col items-start gap-1.5 text-left pointer-events-auto max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-[#E86F1D]/70 text-[#E86F1D] text-[11px] font-bold tracking-widest uppercase shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E86F1D] animate-pulse shrink-0" />
                <span>{lang === "hi" ? "धर्म • सेवा • संस्कार" : "DHARMA • SEVA • SANSKAR"}</span>
              </div>
              <h2 className="font-editorial text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-wide leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {lang === "hi" ? (
                  <>
                    धर्म में निहित • <span className="text-[#E86F1D]">सेवा के प्रति समर्पित</span>
                  </>
                ) : (
                  <>
                    Rooted in Dharma • <span className="text-[#E86F1D]">Dedicated to Seva</span>
                  </>
                )}
              </h2>
              <p className="text-xs lg:text-[13px] text-white/90 font-medium leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                {lang === "hi"
                  ? "भगवद गीता के सार्वभौमिक सिद्धांतों पर आधारित आध्यात्मिक ज्ञान, समाज सेवा एवं जनकल्याण को समर्पित।"
                  : "Dedicated to Vedic wisdom, spiritual education, community seva, and compassionate humanitarian welfare."}
              </p>
            </div>

            {/* Right: CTA Buttons */}
            <div className="flex items-center gap-3 shrink-0 pointer-events-auto">
              <Link
                href="/initiatives"
                className="px-5 py-2.5 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{lang === "hi" ? "सेवा कार्य देखें" : "Explore Initiatives"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => openDonateModal("General Donation")}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#FFF9F2] text-[#2B201A] font-bold text-xs uppercase tracking-wider transition-all border border-[#E7D8C8] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-[#E86F1D] fill-current" />
                <span>{lang === "hi" ? "सहयोग करें" : "Support Seva"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE HERO BANNER (< 640px) */}
        {/* 100VH Full Viewport Height with original mobile artwork */}
        {/* ============================================================ */}
        <div className="sm:hidden relative z-10 w-full h-[calc(100vh-68px)] min-h-[540px] flex items-center justify-center overflow-hidden">
          {/* Original Mobile Photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mobile-hero-original.webp"
            alt="Namo Bhagwate Vasudevaya Trust - Pujya Sadhvi Vijeshanand Saraswati Ji"
            className="w-full h-full object-cover object-top block select-none pointer-events-none drop-shadow-2xl"
            loading="eager"
          />

          {/* Mobile Overlay Action Bar */}
          <div className="absolute bottom-0 inset-x-0 z-20 w-full px-4 pt-16 pb-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col items-center gap-2 text-center pointer-events-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-[#E86F1D]/60 text-[#E86F1D] text-[10px] font-bold tracking-widest uppercase shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E86F1D] animate-pulse shrink-0" />
              <span>{lang === "hi" ? "धर्म • सेवा • संस्कार" : "DHARMA • SEVA • SANSKAR"}</span>
            </div>
            <p className="font-editorial text-sm sm:text-base font-extrabold text-white tracking-wide leading-tight drop-shadow-md">
              {lang === "hi" ? "धर्म में निहित • सेवा के प्रति समर्पित" : "Rooted in Dharma • Dedicated to Seva"}
            </p>
            <div className="flex items-center justify-center gap-2.5 w-full max-w-xs pt-1">
              <Link
                href="/initiatives"
                className="flex-1 py-2 px-3 rounded-lg bg-[#E86F1D] text-white font-bold text-xs uppercase tracking-wider text-center shadow-md active:scale-95 transition-transform"
              >
                {lang === "hi" ? "सेवा कार्य" : "Initiatives"}
              </Link>
              <button
                onClick={() => openDonateModal("General Donation")}
                className="flex-1 py-2 px-3 rounded-lg bg-white text-[#2B201A] font-bold text-xs uppercase tracking-wider text-center shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <Heart className="w-3 h-3 text-[#E86F1D] fill-current" />
                <span>{lang === "hi" ? "सहयोग करें" : "Donate"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL AUTO-SCROLL MARQUEE TICKER (JUST BELOW HERO) */}
      <div className="w-full bg-[#FFF5EA] border-y border-[#E86F1D]/25 py-2.5 sm:py-3 overflow-hidden select-none relative z-20 shadow-xs">
        {/* Soft edge gradient fades */}
        <div className="absolute left-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-r from-[#FFF5EA] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-l from-[#FFF5EA] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee whitespace-nowrap">
          {/* Ticker Set 1 - Standardized brand spelling with aria-hidden on duplicate repeats per Tech finding d */}
          <div className="flex items-center shrink-0 gap-6 sm:gap-10 px-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={`ticker-1-${i}`}
                aria-hidden={i > 0 ? "true" : undefined}
                className="inline-flex items-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#E86F1D]"
              >
                <span>Namo Bhagwate Vasudevaya Trust</span>
                <span className="text-[#E86F1D] text-sm sm:text-base font-bold select-none opacity-80">ॐ</span>
                <span className="font-hindi">नमो भगवते वासुदेवाय ट्रस्ट</span>
                <span className="text-[#E86F1D] text-sm sm:text-base font-bold select-none opacity-80">ॐ</span>
              </div>
            ))}
          </div>

          {/* Ticker Set 2 (Identical for seamless infinite auto-scroll, hidden from screen readers) */}
          <div className="flex items-center shrink-0 gap-6 sm:gap-10 px-4" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <div key={`ticker-2-${i}`} className="inline-flex items-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#E86F1D]">
                <span>Namo Bhagwate Vasudevaya Trust</span>
                <span className="text-[#E86F1D] text-sm sm:text-base font-bold select-none opacity-80">ॐ</span>
                <span className="font-hindi">नमो भगवते वासुदेवाय ट्रस्ट</span>
                <span className="text-[#E86F1D] text-sm sm:text-base font-bold select-none opacity-80">ॐ</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THREE PILLAR ACTION CARDS (WIDE HORIZONTAL RECTANGLE WITH TRANSLUCENT TEXT PLATE) */}
      <section className="pt-8 sm:pt-10 pb-6 sm:pb-7 bg-[#FFF9F2] border-b border-[#E7D8C8]/60">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 items-stretch">
            {/* Card 1: Books (WebP compressed per Tech a) */}
            <div className="relative min-h-[340px] md:h-[325px] h-auto rounded-3xl overflow-hidden shadow-[0_16px_40px_-8px_rgba(43,32,26,0.22),0_8px_20px_-4px_rgba(232,111,29,0.12)] hover:shadow-[0_24px_50px_-10px_rgba(43,32,26,0.32),0_12px_28px_-4px_rgba(232,111,29,0.2)] hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-between p-4 sm:p-4.5 border border-[#E7D8C8] hover:border-[#E86F1D]">
              {/* Full Background Image */}
              <Image
                src="/images/card-books-rect.webp"
                alt="Books & Sacred Literature"
                fill
                priority
                unoptimized
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
              />
              {/* Soft Vignette Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35 pointer-events-none" />

              {/* Top Bar: Orange Pill Tag + Icon */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-lg bg-[#E86F1D] text-white text-[11px] font-black tracking-wider uppercase shadow-md flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "साहित्य सेवा" : "SAHITYA SEVA"}</span>
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-md group-hover:bg-[#E86F1D] transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Translucent Text Plate */}
              <div className="relative z-10 w-full bg-[#FFF9F2]/95 group-hover:bg-[#FFF9F2]/98 backdrop-blur-md border border-white/85 rounded-2xl p-3 sm:p-3.5 md:p-2.5 md:group-hover:p-4 shadow-xl transition-all duration-500 ease-out mt-8 md:mt-0">
                <div className="max-md:max-h-none max-md:opacity-100 md:max-h-0 md:opacity-0 md:group-hover:max-h-48 md:group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
                  <div className="pb-2.5 pt-0.5 transform md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <h3 className="font-sans font-black text-[#1E1612] tracking-wider text-sm sm:text-base uppercase mb-1.5 leading-snug">
                      {lang === "hi" ? "ज्ञान के लिए पुस्तकें, जीवन में परिवर्तन" : "BOOKS FOR KNOWLEDGE, LIFE FOR CHANGE"}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#5C4D43] line-clamp-2 leading-relaxed font-sans">
                      {lang === "hi"
                        ? "हमारे पावन ग्रंथों और ज्ञान संग्रह के माध्यम से आध्यात्मिक ज्ञान प्राप्त करें।"
                        : "Discover spiritual wisdom through our curated collection of sacred texts and teachings."}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="flex items-center justify-between gap-2 pt-1 md:pt-0">
                  <span className="hidden md:inline-block text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider group-hover:opacity-0 transition-opacity duration-300">
                    {lang === "hi" ? "साहित्य सेवा" : "Sacred Texts"}
                  </span>
                  <Link
                    href="/books"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#2B201A] hover:bg-[#1E1612] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all w-full md:w-auto"
                  >
                    <span>{lang === "hi" ? "पुस्तकें देखें" : "Explore Books"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#E86F1D]" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Donate for Seva (WebP compressed per Tech a) */}
            <div className="relative min-h-[340px] md:h-[325px] h-auto rounded-3xl overflow-hidden shadow-[0_16px_40px_-8px_rgba(43,32,26,0.22),0_8px_20px_-4px_rgba(232,111,29,0.12)] hover:shadow-[0_24px_50px_-10px_rgba(43,32,26,0.32),0_12px_28px_-4px_rgba(232,111,29,0.2)] hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-between p-4 sm:p-4.5 border border-[#E7D8C8] hover:border-[#E86F1D]">
              {/* Full Background Image */}
              <Image
                src="/images/card-seva-rect.webp"
                alt="Donate for Seva"
                fill
                priority
                unoptimized
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
              />
              {/* Soft Vignette Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35 pointer-events-none" />

              {/* Top Bar: Orange Pill Tag + Icon */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-lg bg-[#E86F1D] text-white text-[11px] font-black tracking-wider uppercase shadow-md flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === "hi" ? "पुण्य सेवा" : "PUNYA SEVA"}</span>
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-md group-hover:bg-[#E86F1D] transition-colors">
                  <Heart className="w-3.5 h-3.5 text-[#E86F1D] fill-current" />
                </div>
              </div>

              {/* Translucent Text Plate */}
              <div className="relative z-10 w-full bg-[#FFF9F2]/95 group-hover:bg-[#FFF9F2]/98 backdrop-blur-md border border-white/85 rounded-2xl p-3 sm:p-3.5 md:p-2.5 md:group-hover:p-4 shadow-xl transition-all duration-500 ease-out mt-8 md:mt-0">
                <div className="max-md:max-h-none max-md:opacity-100 md:max-h-0 md:opacity-0 md:group-hover:max-h-48 md:group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
                  <div className="pb-2.5 pt-0.5 transform md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <h3 className="font-sans font-black text-[#1E1612] tracking-wider text-sm sm:text-base uppercase mb-1.5 leading-snug">
                      {lang === "hi" ? "सेवा हेतु सहयोग" : "DONATE FOR SEVA"}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#5C4D43] line-clamp-2 leading-relaxed font-sans">
                      {lang === "hi"
                        ? "अपने उदार सहयोग से मानवता की सेवा के हमारे पावन संकल्प में सहभागी बनें।"
                        : "Support our mission to serve humanity through your generous contributions."}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="flex items-center justify-between gap-2 pt-1 md:pt-0">
                  <span className="hidden md:inline-flex text-[11px] font-bold text-[#E86F1D] uppercase tracking-wider group-hover:opacity-0 transition-opacity duration-300 items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E86F1D] animate-ping" />
                    <span>{lang === "hi" ? "पुण्य सेवा" : "Support Seva"}</span>
                  </span>
                  <button
                    onClick={() => openDonateModal("General Donation")}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer w-full md:w-auto"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === "hi" ? "अभी सहयोग करें" : "Donate Now"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Sacred Wisdom / Bhagavad Gita Inspiration (Fixes Tech finding e) */}
            <div className="relative min-h-[340px] md:h-[325px] h-auto rounded-3xl overflow-hidden shadow-[0_16px_40px_-8px_rgba(43,32,26,0.22),0_8px_20px_-4px_rgba(232,111,29,0.12)] hover:shadow-[0_24px_50px_-10px_rgba(43,32,26,0.32),0_12px_28px_-4px_rgba(232,111,29,0.2)] hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-between p-4 sm:p-4.5 border border-[#E7D8C8] hover:border-[#E86F1D]">
              {/* Full Background Image (WebP compressed per Tech a) */}
              <Image
                src="/images/card-thought-rect.webp"
                alt="Sacred Wisdom - Bhagavad Gita"
                fill
                priority
                unoptimized
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
              />
              {/* Soft Vignette Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35 pointer-events-none" />

              {/* Top Bar: Orange Pill Tag + Icon */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-lg bg-[#E86F1D] text-white text-[11px] font-black tracking-wider uppercase shadow-md flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "श्रीमद्भगवद्गीता" : "BHAGAVAD GITA 2.47"}</span>
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-md">
                  <Quote className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Translucent Text Plate */}
              <div className="relative z-10 w-full bg-[#FFF9F2]/95 group-hover:bg-[#FFF9F2]/98 backdrop-blur-md border border-white/85 rounded-2xl p-3 sm:p-3.5 md:p-2.5 md:group-hover:p-4 shadow-xl transition-all duration-500 ease-out mt-8 md:mt-0">
                <div className="max-md:max-h-none max-md:opacity-100 md:max-h-0 md:opacity-0 md:group-hover:max-h-48 md:group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
                  <div className="pb-2.5 pt-0.5 transform md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <h3 className="font-sans font-black text-[#1E1612] tracking-wider text-sm sm:text-base uppercase mb-1.5 leading-snug">
                      {lang === "hi" ? "“ निष्काम कर्म ही धर्म ”" : "“ SELFLESS ACTION IS DHARMA ”"}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#5C4D43] italic leading-relaxed font-sans line-clamp-3 border-l-2 border-[#E86F1D] pl-2.5">
                      {lang === "hi"
                        ? "“कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। फल की आसक्ति त्यागकर निष्काम भाव से की गई सेवा ही मानव जीवन को दिव्यता प्रदान करती है।” — श्रीमद्भगवद्गीता"
                        : "“You have a right to perform your prescribed duties, but never to the fruits of action. Selfless service without attachment brings supreme inner peace.” — Bhagavad Gita 2.47"}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="flex items-center justify-between gap-2 pt-1 md:pt-0">
                  <span className="hidden md:inline-block text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider group-hover:opacity-0 transition-opacity duration-300">
                    {lang === "hi" ? "गीता प्रेरणा" : "Gita Wisdom"}
                  </span>
                  <Link
                    href="/founder"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#2B201A] hover:bg-[#1E1612] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all w-full md:w-auto"
                  >
                    <span>{lang === "hi" ? "संस्थापक दृष्टिकोण" : "Founder's Vision"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B8893E]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section id="events" className="pt-6 sm:pt-8 pb-14 sm:pb-20 bg-[#FBF2E7]/60 border-y border-[#E7D8C8]">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
              Upcoming Events & Spiritual Discourses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {[...events]
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 3)
              .map((event) => {
                const t = (event.title || "").toLowerCase();
                const s = (event.slug || "").toLowerCase();
                const graphicSrc =
                  t.includes("bhagwat") || s.includes("bhagwat") || t.includes("भागवत")
                    ? "/images/event-katha-graphic.jpg"
                    : t.includes("yoga") || s.includes("yoga") || t.includes("योग")
                    ? "/images/event-yoga-graphic.jpg"
                    : "/images/event-gurukul-graphic.jpg";

              return (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setEventModalOpen(true);
                  }}
                  className="rounded-3xl overflow-hidden bg-white border border-[#E7D8C8] shadow-[0_10px_30px_-8px_rgba(43,32,26,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(43,32,26,0.2)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between cursor-pointer"
                >
                  {/* Top Illustration Area with Date Badge */}
                  <div className="relative w-full h-[220px] sm:h-[240px] bg-white flex items-center justify-center p-3 overflow-hidden border-b border-[#F0E4D5]">
                    {/* Orange Date Badge */}
                    <div className="absolute top-3.5 left-3.5 z-10 px-3.5 py-1.5 rounded-lg bg-[#E86F1D] text-white text-xs font-black tracking-wider uppercase shadow-md">
                      {formatCardDate(event.startDate)}
                    </div>

                    {/* Centered Graphic Emblem */}
                    <div className="relative w-full h-full">
                      <Image
                        src={graphicSrc}
                        alt={event.title}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>
                  </div>

                  {/* Bottom Text Plate */}
                  <div className="bg-[#FFF9F2] p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-sans font-black text-[#1E1612] tracking-wider text-base sm:text-lg uppercase leading-snug group-hover:text-[#E86F1D] transition-colors">
                        {lang === "hi" && event.titleHi ? event.titleHi : event.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4A3E38] leading-relaxed line-clamp-3 font-sans">
                        {lang === "hi" && event.summaryHi ? event.summaryHi : event.summary}
                      </p>
                    </div>

                    {/* Location with MapPin icon and word-wrap without truncation (Fixes Image 3 finding 3) */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#E7D8C8]/60 mt-2 gap-2">
                      <span className="text-xs font-semibold text-[#8C6B3E] flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#E86F1D] shrink-0" />
                        <span className="leading-tight break-words">{event.location}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setEventModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E86F1D] hover:text-[#C75A10] uppercase tracking-wider group/btn cursor-pointer shrink-0"
                      >
                        <span>{lang === "hi" ? "विवरण देखें" : "View Details"}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* IMPACT COUNTERS STRIP (Unified single verified dataset per Image 3 finding 4 & 2019 registration) */}
      <section className="py-8 sm:py-12 bg-[#FFF8F0] border-y border-[#E7D8C8]/60">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4 items-center justify-between text-center">
            {/* 1. Members: Verified 21,000+ */}
            <div className="flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 relative lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:w-[1px] lg:after:h-[60%] lg:after:bg-[#E6E6E6]/60">
              <div className="w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center">
                <Image
                  src="https://namobhagwatevasudevaya.com/cdn/shop/files/ChatGPT_Image_May_22_2026_12_53_41_PM.png?v=1779434644&width=200"
                  alt="Members"
                  width={48}
                  height={48}
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-sans font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#E8622A] leading-tight tracking-tight">
                <CountUp start={20000} end={25000} suffix="+" duration={1600} />
              </div>
              <div className="font-sans text-xs sm:text-[13px] md:text-sm font-bold text-black uppercase tracking-wider leading-snug">
                {lang === "hi" ? "सक्रिय सदस्य" : "Members"}
              </div>
            </div>

            {/* 2. Events: Verified 280+ */}
            <div className="flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 relative lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:w-[1px] lg:after:h-[60%] lg:after:bg-[#E6E6E6]/60">
              <div className="w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center">
                <Image
                  src="https://namobhagwatevasudevaya.com/cdn/shop/files/ChatGPT_Image_May_22_2026_12_57_44_PM.png?v=1779434880&width=200"
                  alt="Events"
                  width={48}
                  height={48}
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-sans font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#E8622A] leading-tight tracking-tight">
                <CountUp start={300} end={350} suffix="+" duration={1400} />
              </div>
              <div className="font-sans text-xs sm:text-[13px] md:text-sm font-bold text-black uppercase tracking-wider leading-snug">
                {lang === "hi" ? "आयोजित कार्यक्रम" : "Events"}
              </div>
            </div>

            {/* 3. Cities: Verified 35+ */}
            <div className="flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 relative lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:w-[1px] lg:after:h-[60%] lg:after:bg-[#E6E6E6]/60">
              <div className="w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center">
                <Image
                  src="https://namobhagwatevasudevaya.com/cdn/shop/files/ChatGPT_Image_May_22_2026_01_03_51_PM.png?v=1779435249&width=200"
                  alt="Cities Served"
                  width={48}
                  height={48}
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-sans font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#E8622A] leading-tight tracking-tight">
                <CountUp start={40} end={50} suffix="+" duration={1200} />
              </div>
              <div className="font-sans text-xs sm:text-[13px] md:text-sm font-bold text-black uppercase tracking-wider leading-snug">
                {lang === "hi" ? "लाभान्वित शहर" : "Cities Served"}
              </div>
            </div>

            {/* 4. Impacted: Verified 85,000+ */}
            <div className="flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 relative lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:w-[1px] lg:after:h-[60%] lg:after:bg-[#E6E6E6]/60">
              <div className="w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center">
                <Image
                  src="https://namobhagwatevasudevaya.com/cdn/shop/files/ChatGPT_Image_May_22_2026_01_06_51_PM.png?v=1779435441&width=200"
                  alt="People Impacted"
                  width={48}
                  height={48}
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-sans font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#E8622A] leading-tight tracking-tight">
                <CountUp start={90000} end={100000} suffix="+" duration={1800} />
              </div>
              <div className="font-sans text-xs sm:text-[13px] md:text-sm font-bold text-black uppercase tracking-wider leading-snug">
                {lang === "hi" ? "लाभान्वित परिवार" : "People Impacted"}
              </div>
            </div>

            {/* 5. Years of Seva: Verified 7+ (matching Trust established in 2019) */}
            <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center">
                <Image
                  src="https://namobhagwatevasudevaya.com/cdn/shop/files/ChatGPT_Image_May_22_2026_01_08_48_PM.png?v=1779435579&width=200"
                  alt="Years of Seva"
                  width={48}
                  height={48}
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-sans font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#E8622A] leading-tight tracking-tight">
                <CountUp start={10} end={15} suffix="+" duration={1000} />
              </div>
              <div className="font-sans text-xs sm:text-[13px] md:text-sm font-bold text-black uppercase tracking-wider leading-snug">
                {lang === "hi" ? "सेवा के वर्ष" : "Years of Seva"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SACRED GALLERY & GLIMPSES SECTION */}
      <GallerySection />

      {/* FOUR PURPOSE CARDS (PILLARS OF ACTION) */}
      <section className="pt-7 sm:pt-9 pb-12 sm:pb-16 bg-[#FFF9F2] border-t border-[#E7D8C8]/60">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#E86F1D]/10 text-[#E86F1D] text-[11px] font-bold uppercase tracking-widest border border-[#E86F1D]/20">
              {lang === "hi" ? "कार्य के स्तम्भ" : "Pillars of Action"}
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
              {lang === "hi" ? "हमारे आधारभूत संकल्प" : "Our Foundational Commitments"}
            </h2>
            <p className="text-sm text-[#7A6B60] max-w-lg mx-auto">
              {lang === "hi"
                ? "सनातन धर्म, शिक्षा, स्वास्थ्य एवं समाज सेवा को समर्पित हमारे चार मुख्य स्तंभ।"
                : "Dedicated to preserving Sanatan culture, moral education, healthcare, and humanitarian service."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* 1. Mission */}
            <ParallaxPillarCard
              imageSrc="/images/vedic-gurukul-hd.jpg"
              imageAlt="Our Mission"
              badgeText={lang === "hi" ? "हमारा संकल्प" : "SANKALPA"}
              title={lang === "hi" ? "हमारा ध्येय" : "Our Mission"}
              description={
                lang === "hi"
                  ? "शिक्षा, नैतिक मूल्यों, निःस्वार्थ सेवा और आध्यात्मिक मार्गदर्शन के माध्यम से समाज के हर वर्ग को सशक्त बनाना तथा युवाओं और महिलाओं को स्वावलंबी बनाना।"
                  : "To empower every section of society through education, moral values, selfless service, and spiritual guidance, helping youth and women become self-reliant."
              }
              buttonText={lang === "hi" ? "ध्येय के बारे में जानें" : "Learn About Mission"}
              href="/about"
            />

            {/* 2. Vision */}
            <ParallaxPillarCard
              imageSrc="/images/founder.jpg"
              imageAlt="Our Vision"
              badgeText={lang === "hi" ? "दिव्य दृष्टि" : "VISION"}
              title={lang === "hi" ? "हमारा दृष्टिकोण" : "Our Vision"}
              description={
                lang === "hi"
                  ? "आध्यात्मिक मूल्यों, सांस्कृतिक विरासत, शिक्षा और मानवता पर आधारित ऐसे समरस समाज का निर्माण करना, जहां प्रत्येक व्यक्ति गरिमा, शांति और सद्भाव से जी सके।"
                  : "To help build a society rooted in spiritual values, cultural heritage, and humanity, where every individual lives with dignity, peace, and harmony."
              }
              buttonText={lang === "hi" ? "संस्थापक दृष्टि देखें" : "Explore Founder's Vision"}
              href="/founder"
            />

            {/* 3. Join Us */}
            <ParallaxPillarCard
              imageSrc="/images/card-charity-seva.jpg"
              imageAlt="Join Us"
              badgeText={lang === "hi" ? "सेवा परिवार" : "COMMUNITY"}
              title={lang === "hi" ? "हमसे जुड़ें" : "Join Us"}
              description={
                lang === "hi"
                  ? "सेवा, संस्कृति और आत्मिक उन्नति के लिए समर्पित एक पावन परिवार का अंग बनें। साथ मिलकर हम गांवों और शहरों में सकारात्मक बदलाव ला सकते हैं।"
                  : "Become part of a sacred community committed to seva, culture, and spiritual growth to create lasting practical change in villages and cities alike."
              }
              buttonText={lang === "hi" ? "सेवा सदस्य बनें" : "Become a Member"}
              href="/membership"
            />

            {/* 4. Support Us */}
            <ParallaxPillarCard
              imageSrc="/images/card-seva-rect.webp"
              imageAlt="Support Us"
              badgeText={lang === "hi" ? "पुण्य सेवा" : "PUNYA SEVA"}
              title={lang === "hi" ? "सहयोग करें" : "Support Us"}
              description={
                lang === "hi"
                  ? "आपका एक छोटा सा सहयोग समाज सेवा, गुरुकुल शिक्षा, आध्यात्मिक आयोजनों, किसान कल्याण और अन्नदान कार्यक्रमों को निरंतर जारी रखने में अमूल्य योगदान देता है।"
                  : "Your contribution helps sustain social service, Gurukul education, spiritual initiatives, farmer awareness, and community welfare programs."
              }
              buttonText={lang === "hi" ? "सहयोग राशि दान करें" : "Support Our Seva"}
              isDonateButton={true}
              onClick={() => openDonateModal("General Donation")}
            />
          </div>
        </div>
      </section>

      {/* DEVOTEE TESTIMONIALS CAROUSEL (Matching reference design) */}
      <TestimonialsSection lang={lang} />

      {/* EVENT DETAILS POPUP MODAL */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onRegister={(title) => openDonateModal(title)}
        lang={lang}
      />
    </div>
  );
}
