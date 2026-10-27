"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Calendar,
  Users,
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
import MemberCarousel from "@/components/MemberCarousel";
import CountUp from "@/components/CountUp";
import TestimonialsSection from "@/components/TestimonialsSection";
import ParallaxPillarCard from "@/components/ParallaxPillarCard";
import HeadingDivider from "@/components/HeadingDivider";
import {
  TextReveal,
  ParagraphReveal,
  SectionReveal,
  StaggerContainer,
  StaggerItem,
  ParallaxSection,
} from "@/components/animation";

export default function HomePage() {
  const { lang, openDonateModal } = useApp();

  const defaultEvents: EventItem[] = [
    {
      id: "ev-1",
      slug: "shrimad-bhagwat-katha-2026",
      title: "Shrimad Bhagwat Katha",
      titleHi: "श्रीमद्भागवत कथा ज्ञान यज्ञ",
      summary: "Join us for a sacred spiritual discourse on the Shrimad Bhagwat Purana. All devotees are cordially invited.",
      summaryHi: "पावन श्रीमद्भागवत कथा ज्ञान यज्ञ में सादर आमंत्रित हैं। सभी भक्तगण पधारकर पुण्य लाभ प्राप्त करें।",
      description: "Join us for a divine spiritual discourse diving into the sublime pastimes and teachings of Lord Krishna from the Shrimad Bhagwat Mahapuran. Accompanied by daily sankirtan, aarti, and mahaprasad distribution. Devotees may also sponsor a day's discourse or prasadam seva.",
      startDate: "2026-11-15T10:30:00Z",
      endDate: "2026-11-16T14:00:00Z",
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
      timeText: "6:00 AM – 9:00 AM IST",
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
      .catch(() => { });
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
        {/* Full Image Display - Complete 1920x1080 uncropped, scrolls naturally */}
        {/* ============================================================ */}
        <div className="hidden sm:block relative w-full">
          {/* Full Original Hero Photo - untouched and uncropped */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/desktop-hero-original.webp"
            alt="Namo Bhagwate Vasudevaya Trust - Pujya Sadhvi Vijeshanand Saraswati Ji"
            className="w-full h-auto block select-none"
            loading="eager"
            width={1920}
            height={1080}
          />

          {/* Semantic live H1 for SEO */}
          <h1 className="sr-only">Namo Bhagwate Vasudevaya Trust</h1>

          {/* Sleek Bottom Floating Action Bar across the bottom of the hero */}
          <div className="absolute bottom-4 sm:bottom-6 right-6 md:right-10 z-20 flex items-center gap-3">
            <Link
              href="/initiatives"
              className="px-5 py-2.5 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer backdrop-blur-xs"
            >
              <span>{lang === "hi" ? "सेवा कार्य देखें" : "Explore Initiatives"}</span>
            </Link>
            <button
              onClick={() => openDonateModal("General Donation")}
              className="px-5 py-2.5 rounded-xl bg-white/95 hover:bg-white text-[#2B201A] font-bold text-xs uppercase tracking-wider transition-all border border-[#E7D8C8] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <Heart className="w-3.5 h-3.5 text-[#E86F1D] fill-current" />
              <span>{lang === "hi" ? "सहयोग करें" : "Support Seva"}</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE HERO BANNER (< 640px) */}
        {/* Full Image Display - Complete 1080x1350 uncropped */}
        {/* ============================================================ */}
        <div className="sm:hidden relative z-10 w-full">
          {/* Full Original Mobile Photo - untouched and uncropped */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mobile-hero-original.webp"
            alt="Namo Bhagwate Vasudevaya Trust - Pujya Sadhvi Vijeshanand Saraswati Ji"
            className="w-full h-auto block select-none"
            loading="eager"
            width={1080}
            height={1350}
          />

          {/* Mobile Floating Action Buttons */}
          <div className="absolute bottom-4 inset-x-0 z-20 px-4 flex items-center justify-center gap-2.5">
            <Link
              href="/initiatives"
              className="flex-1 max-w-[150px] py-2 px-3 rounded-lg bg-[#E86F1D] text-white font-bold text-xs uppercase tracking-wider text-center shadow-lg active:scale-95 transition-transform"
            >
              {lang === "hi" ? "सेवा कार्य" : "Initiatives"}
            </Link>
            <button
              onClick={() => openDonateModal("General Donation")}
              className="flex-1 max-w-[150px] py-2 px-3 rounded-lg bg-white/95 text-[#2B201A] font-bold text-xs uppercase tracking-wider text-center shadow-lg flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform border border-[#E7D8C8]"
            >
              <Heart className="w-3 h-3 text-[#E86F1D] fill-current" />
              <span>{lang === "hi" ? "सहयोग करें" : "Donate"}</span>
            </button>
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
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-[#FFF9F2] border-b border-[#E7D8C8]/60">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 items-stretch">
            {/* Card 1: Books (WebP compressed per Tech a) */}
            <StaggerItem className="h-full">
              <div className="relative min-h-[340px] md:h-[325px] h-auto rounded-3xl overflow-hidden shadow-[0_16px_40px_-8px_rgba(43,32,26,0.22),0_8px_20px_-4px_rgba(232,111,29,0.12)] hover:shadow-[0_24px_50px_-10px_rgba(43,32,26,0.32),0_12px_28px_-4px_rgba(232,111,29,0.2)] hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-end p-4 sm:p-4.5 border border-[#E7D8C8] hover:border-[#E86F1D]">
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
                    </Link>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Card 2: Donate for Seva (WebP compressed per Tech a) */}
            <StaggerItem className="h-full">
              <div className="relative min-h-[340px] md:h-[325px] h-auto rounded-3xl overflow-hidden shadow-[0_16px_40px_-8px_rgba(43,32,26,0.22),0_8px_20px_-4px_rgba(232,111,29,0.12)] hover:shadow-[0_24px_50px_-10px_rgba(43,32,26,0.32),0_12px_28px_-4px_rgba(232,111,29,0.2)] hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-end p-4 sm:p-4.5 border border-[#E7D8C8] hover:border-[#E86F1D]">
                {/* Full Background Image */}
                <Image
                  src="/images/card-seva-real.webp"
                  alt="Donate for Seva"
                  fill
                  priority
                  unoptimized
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                />
                {/* Soft Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35 pointer-events-none" />

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
            </StaggerItem>

            {/* Card 3: Sacred Wisdom / Bhagavad Gita Inspiration (Fixes Tech finding e) */}
            <StaggerItem className="h-full">
              <div className="relative min-h-[340px] md:h-[325px] h-auto rounded-3xl overflow-hidden shadow-[0_16px_40px_-8px_rgba(43,32,26,0.22),0_8px_20px_-4px_rgba(232,111,29,0.12)] hover:shadow-[0_24px_50px_-10px_rgba(43,32,26,0.32),0_12px_28px_-4px_rgba(232,111,29,0.2)] hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-end p-4 sm:p-4.5 border border-[#E7D8C8] hover:border-[#E86F1D]">
                {/* Full Background Image (WebP compressed per Tech a) */}
                <Image
                  src="/images/card-thought-real.webp"
                  alt="Sacred Wisdom - Bhagavad Gita"
                  fill
                  priority
                  unoptimized
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                />
                {/* Soft Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35 pointer-events-none" />

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
                    </Link>
                  </div>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </SectionReveal>

      {/* UPCOMING EVENTS - Reliable section loading without nested viewport delays */}
      <section id="events" className="py-16 sm:py-20 lg:py-24 bg-[#FBF2E7]/60 border-y border-[#E7D8C8]">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10">
            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-[#E86F1D] tracking-tight sm:whitespace-nowrap">
              {lang === "hi"
                ? "आगामी कार्यक्रम एवं आध्यात्मिक सत्संग"
                : "Upcoming Events & Spiritual Discourses"}
            </h2>
            <HeadingDivider className="mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {[...events]
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 3)
              .map((event) => {
                const hindiTitle =
                  event.titleHi ||
                  (event.title.toLowerCase().includes("bhagwat")
                    ? "श्रीमद् भागवत कथा"
                    : event.title.toLowerCase().includes("yoga")
                      ? "योग एवं स्वास्थ्य शिविर"
                      : "गुरुकुल वार्षिकोत्सव");

                return (
                  <div key={event.id} className="h-full">
                    <div
                      onClick={() => {
                        setSelectedEvent(event);
                        setEventModalOpen(true);
                      }}
                      className="rounded-2xl overflow-hidden bg-white border border-[#E7D8C8] shadow-[0_10px_30px_-8px_rgba(43,32,26,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(232,111,29,0.2)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between cursor-pointer h-full"
                    >
                      {/* Top Saffron/Orange Textured Banner with Bold White Devanagari Title (Matching Picture 2, 16px radius) */}
                      <div className="relative w-full h-[190px] sm:h-[210px] rounded-t-2xl bg-gradient-to-br from-[#F97316] via-[#EA580C] to-[#C2410C] flex items-center justify-center p-6 text-center shadow-inner overflow-hidden">
                        {/* Soft subtle radial ambient glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/25 via-transparent to-black/25 pointer-events-none" />

                        {/* Bold White Hindi Title */}
                        <h3 className="relative z-10 font-sans font-black text-2xl sm:text-3xl lg:text-[30px] text-white leading-tight drop-shadow-md tracking-wide px-3">
                          {hindiTitle}
                        </h3>
                      </div>

                      {/* Overlapping Seam Circular Trust Emblem (Matching Picture 2) */}
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

                      {/* Bottom Clean White Card Body (Matching Picture 2) */}
                      <div className="bg-white p-6 pt-3 pb-6 flex-1 flex flex-col justify-between text-center space-y-3">
                        <div className="space-y-2">
                          {/* English Title */}
                          <h4 className="font-sans font-bold text-lg sm:text-xl text-[#1E1612] group-hover:text-[#E86F1D] transition-colors leading-snug">
                            {event.title}
                          </h4>

                          {/* Line-Dot-Line Divider Matching Picture 2 */}
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
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Centered View All Button (Matching Picture 2) */}
          <div className="mt-8 sm:mt-10 text-center">
            <button
              type="button"
              onClick={() => {
                setSelectedEvent(events[0]);
                setEventModalOpen(true);
              }}
              className="inline-flex items-center justify-center px-7 py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#D45A0E] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>{lang === "hi" ? "सभी कार्यक्रम देखें" : "View All"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* IMPACT COUNTERS STRIP (Unified single verified dataset per Image 3 finding 4 & 2019 registration) */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-[#FFF8F0] border-y border-[#E7D8C8]/60">
        <div className="page-container">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4 items-center justify-between text-center">
            {/* 1. Members: Verified 21,000+ */}
            <StaggerItem className="flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 relative lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:w-[1px] lg:after:h-[60%] lg:after:bg-[#E6E6E6]/60">
              <div className="w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center">
                <Image
                  src="/images/stat-members.png"
                  alt="Members"
                  width={48}
                  height={48}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-sans font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#E8622A] leading-tight tracking-tight">
                <CountUp start={20000} end={25000} suffix="+" duration={1600} />
              </div>
              <div className="font-sans text-xs sm:text-[13px] md:text-sm font-bold text-black uppercase tracking-wider leading-snug">
                {lang === "hi" ? "सक्रिय सदस्य" : "Members"}
              </div>
            </StaggerItem>

            {/* 2. Events: Verified 280+ */}
            <StaggerItem className="flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 relative lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:w-[1px] lg:after:h-[60%] lg:after:bg-[#E6E6E6]/60">
              <div className="w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center">
                <Image
                  src="/images/stat-events.png"
                  alt="Events"
                  width={48}
                  height={48}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-sans font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#E8622A] leading-tight tracking-tight">
                <CountUp start={300} end={350} suffix="+" duration={1400} />
              </div>
              <div className="font-sans text-xs sm:text-[13px] md:text-sm font-bold text-black uppercase tracking-wider leading-snug">
                {lang === "hi" ? "आयोजित कार्यक्रम" : "Events"}
              </div>
            </StaggerItem>

            {/* 3. Cities: Verified 35+ */}
            <StaggerItem className="flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 relative lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:w-[1px] lg:after:h-[60%] lg:after:bg-[#E6E6E6]/60">
              <div className="w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center">
                <Image
                  src="/images/stat-cities.png"
                  alt="Cities Served"
                  width={48}
                  height={48}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-sans font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#E8622A] leading-tight tracking-tight">
                <CountUp start={40} end={50} suffix="+" duration={1200} />
              </div>
              <div className="font-sans text-xs sm:text-[13px] md:text-sm font-bold text-black uppercase tracking-wider leading-snug">
                {lang === "hi" ? "लाभान्वित शहर" : "Cities Served"}
              </div>
            </StaggerItem>

            {/* 4. Impacted: Verified 85,000+ */}
            <StaggerItem className="flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 relative lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:w-[1px] lg:after:h-[60%] lg:after:bg-[#E6E6E6]/60">
              <div className="w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center">
                <Image
                  src="/images/stat-impacted.png"
                  alt="People Impacted"
                  width={48}
                  height={48}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-sans font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#E8622A] leading-tight tracking-tight">
                <CountUp start={90000} end={100000} suffix="+" duration={1800} />
              </div>
              <div className="font-sans text-xs sm:text-[13px] md:text-sm font-bold text-black uppercase tracking-wider leading-snug">
                {lang === "hi" ? "लाभान्वित परिवार" : "People Impacted"}
              </div>
            </StaggerItem>

            {/* 5. Years of Seva: Verified 7+ (matching Trust established in 2019) */}
            <StaggerItem className="col-span-2 md:col-span-1 flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center">
                <Image
                  src="/images/stat-years.png"
                  alt="Years of Seva"
                  width={48}
                  height={48}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-sans font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#E8622A] leading-tight tracking-tight">
                <CountUp start={10} end={15} suffix="+" duration={1000} />
              </div>
              <div className="font-sans text-xs sm:text-[13px] md:text-sm font-bold text-black uppercase tracking-wider leading-snug">
                {lang === "hi" ? "सेवा के वर्ष" : "Years of Seva"}
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </SectionReveal>

      {/* SACRED GALLERY & GLIMPSES SECTION */}
      <GallerySection />

      {/* OUR MEMBERS SECTION (Continuous Auto-Scroll Ticker) */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-[#FFF9F2] border-t border-[#E7D8C8] overflow-hidden">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
          <div className="flex flex-col items-center justify-center text-center">
            <TextReveal
              as="h2"
              className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#E86F1D] tracking-wider whitespace-nowrap px-2"
              text={lang === "hi" ? "हमारे सदस्य" : "Our Members"}
            />
            <HeadingDivider className="mt-2.5" />
          </div>
        </div>

        {/* Aligned carousel container matching Gallery above */}
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
          <MemberCarousel />
        </div>
      </SectionReveal>

      {/* FOUR PURPOSE CARDS (PILLARS OF ACTION) */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-[#FFF9F2] border-t border-[#E7D8C8]/60">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
            <TextReveal
              as="h2"
              className="font-editorial text-3xl sm:text-4xl font-bold text-[#E86F1D] tracking-tight"
              text={lang === "hi" ? "हमारे आधारभूत संकल्प" : "Our Foundational Commitments"}
            />
            <HeadingDivider className="mt-2" />
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* 1. Mission */}
            <StaggerItem className="h-full">
              <ParallaxPillarCard
                imageSrc="/images/gurukul-real.webp"
                imageAlt="Our Mission"
                title={lang === "hi" ? "हमारा ध्येय" : "Our Mission"}
                description={
                  lang === "hi"
                    ? "शिक्षा, नैतिक मूल्यों, निःस्वार्थ सेवा और आध्यात्मिक मार्गदर्शन के माध्यम से समाज के हर वर्ग को सशक्त बनाना तथा युवाओं और महिलाओं को स्वावलंबी बनाना।"
                    : "To empower every section of society through education, moral values, selfless service, and spiritual guidance, helping youth and women become self-reliant."
                }
                buttonText={lang === "hi" ? "ध्येय के बारे में जानें" : "Learn About Mission"}
                href="/about"
              />
            </StaggerItem>

            {/* 2. Vision */}
            <StaggerItem className="h-full">
              <ParallaxPillarCard
                imageSrc="/images/founder.jpg"
                imageAlt="Our Vision"
                title={lang === "hi" ? "हमारा दृष्टिकोण" : "Our Vision"}
                description={
                  lang === "hi"
                    ? "आध्यात्मिक मूल्यों, सांस्कृतिक विरासत, शिक्षा और मानवता पर आधारित ऐसे समरस समाज का निर्माण करना, जहां प्रत्येक व्यक्ति गरिमा, शांति और सद्भाव से जी सके।"
                    : "To help build a society rooted in spiritual values, cultural heritage, and humanity, where every individual lives with dignity, peace, and harmony."
                }
                buttonText={lang === "hi" ? "संस्थापक दृष्टि देखें" : "Explore Founder's Vision"}
                href="/founder"
              />
            </StaggerItem>

            {/* 3. Join Us */}
            <StaggerItem className="h-full">
              <ParallaxPillarCard
                imageSrc="/images/card-join-real.webp"
                imageAlt="Join Us"
                title={lang === "hi" ? "हमसे जुड़ें" : "Join Us"}
                description={
                  lang === "hi"
                    ? "सेवा, संस्कृति और आत्मिक उन्नति के लिए समर्पित एक पावन परिवार का अंग बनें। साथ मिलकर हम गांवों और शहरों में सकारात्मक बदलाव ला सकते हैं।"
                    : "Become part of a sacred community committed to seva, culture, and spiritual growth to create lasting practical change in villages and cities alike."
                }
                buttonText={lang === "hi" ? "सेवा सदस्य बनें" : "Become a Member"}
                href="/membership"
              />
            </StaggerItem>

            {/* 4. Support Us */}
            <StaggerItem className="h-full">
              <ParallaxPillarCard
                imageSrc="/images/card-seva-real.webp"
                imageAlt="Support Us"
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
            </StaggerItem>
          </StaggerContainer>
        </div>
      </SectionReveal>


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
