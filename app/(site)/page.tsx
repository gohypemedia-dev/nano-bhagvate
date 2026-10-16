"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Heart,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Quote,
  CheckCircle2,
  Compass,
  Sun,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import EventDetailsModal, { EventItem } from "@/components/EventDetailsModal";

export default function HomePage() {
  const { lang, openDonateModal } = useApp();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      quote:
        "The spiritual guidance I received here has brought greater peace and clarity to my life. Every visit feels deeply grounding and inspiring.",
      quoteHi:
        "यहाँ से प्राप्त आध्यात्मिक मार्गदर्शन ने मेरे जीवन में अपार शांति और स्पष्टता प्रदान की है। हर विचार आत्मिक ऊर्जा प्रदान करता है।",
      name: "Rajesh Kumar",
      location: "Mumbai, Maharashtra",
      role: "Devotee & Lifetime Member",
    },
    {
      quote:
        "A warm and meaningful experience. The community, teachings and atmosphere have strengthened my faith and sense of cultural connection.",
      quoteHi:
        "अत्यंत पवित्र और प्रेरणादायक अनुभव। ट्रस्ट द्वारा संचालित शिक्षा और सेवा कार्यक्रमों से समाज में सकारात्मक बदलाव आ रहा है।",
      name: "Priya Sharma",
      location: "New Delhi",
      role: "Voluntary Sevadar",
    },
    {
      quote:
        "The Bhagavad Gita teachings have brought more purpose and calm to my everyday life. I am deeply grateful to Sadhvi Ji and this community.",
      quoteHi:
        "श्रीमद्भगवद्गीता के उपदेशों ने मेरे दैनिक जीवन में शांति और उद्देश्य ला दिया है। नमो भगवते वासुदेवाय ट्रस्ट का हृदय से आभार।",
      name: "Amit Patel",
      location: "Ahmedabad, Gujarat",
      role: "Gold Member",
    },
  ];

  const defaultEvents: EventItem[] = [
    {
      id: "ev-1",
      slug: "shrimad-bhagwat-katha-2026",
      title: "Shrimad Bhagwat Katha",
      titleHi: "श्रीमद्भागवत कथा ज्ञान यज्ञ",
      summary: "Join us for a sacred seven-day spiritual discourse on the Shrimad Bhagwat Purana. All devotees are cordially invited.",
      summaryHi: "सात दिवसीय पावन श्रीमद्भागवत कथा ज्ञान यज्ञ में सादर आमंत्रित हैं। सभी भक्तगण पधारकर पुण्य लाभ प्राप्त करें।",
      description: "Join us for a divine seven-day spiritual discourse diving into the sublime pastimes and teachings of Lord Krishna from the Shrimad Bhagwat Mahapuran. Accompanied by daily sankirtan, aarti, and mahaprasad distribution. Devotees may also sponsor a day's discourse or prasadam seva.",
      startDate: "2026-05-25T10:30:00Z",
      endDate: "2026-05-31T14:00:00Z",
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
      startDate: "2026-06-10T00:30:00Z",
      endDate: "2026-06-12T13:30:00Z",
      timeText: "6:00 AM – 9:00 AM & 4:30 PM – 7:00 PM IST",
      location: "Vrindavan Seva Kendra",
      address: "Raman Reti Road, Near Bhaktivedanta Hospital, Vrindavan, Uttar Pradesh - 281121",
      contactPhone: "+91 9910762692",
      isPublished: true,
    },
    {
      id: "ev-3",
      slug: "gurukul-annual-celebration-2026",
      title: "Gurukul Annual Celebration",
      titleHi: "गुरुकुल वार्षिकोत्सव एवं बाल संस्कार",
      summary: "A cultural celebration showcasing Vedic chanting, cultural performances, and academic achievements of Gurukul students.",
      summaryHi: "वेद मंत्रोच्चार, सांस्कृतिक प्रस्तुतियां एवं गुरुकुल के विद्यार्थियों की उपलब्धियों का भव्य वार्षिकोत्सव।",
      description: "Celebrate the preservation of Sanatan values and cultural heritage. The annual function will present Vedic recitation by young Brahmacharis, classical spiritual drama depicting scriptures, prize distribution, and blessing discourses by revered saints.",
      startDate: "2026-06-21T04:30:00Z",
      endDate: "2026-06-21T08:30:00Z",
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
      .then((res) => (res.ok ? res.json() : null))
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
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 md:pt-14 pb-14 md:pb-20 bg-[#FFF9F2] border-b border-[#E7D8C8]">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBF2E7] border border-[#B8893E]/30 text-[#E86F1D] text-xs font-bold uppercase tracking-widest">
                <span>DHARMA • SEVA • SANSKAR</span>
              </div>

              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B201A] leading-[1.12] tracking-tight">
                {lang === "hi" ? (
                  <span className="lang-hi">धर्म में निहित। सेवा के प्रति समर्पित</span>
                ) : (
                  <>
                    Rooted in <span className="text-[#E86F1D]">Dharma</span>
                    <br />
                    Dedicated to <span className="text-[#B8893E]">Seva</span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-[#2B201A]/85 leading-relaxed max-w-2xl font-sans">
                {lang === "hi"
                  ? "श्रीमद्भगवद्गीता के शाश्वत ज्ञान से प्रेरित होकर, नमो भगवते वासुदेवाय ट्रस्ट आध्यात्मिक शिक्षा, समाज सेवा, महिला एवं युवा सशक्तिकरण, किसान कल्याण और दयालु कार्यों के माध्यम से जीवन को उन्नत बनाने के लिए तत्पर है।"
                  : "Guided by the timeless wisdom of the Bhagavad Gita, Namo Bhagwate Vasudevaya Trust works to uplift lives through spiritual education, community service, women and youth empowerment, farmer welfare, and compassionate action."}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link href="/initiatives" className="btn-primary">
                  <span>{lang === "hi" ? "कार्य देखें" : "Explore Our Work"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => openDonateModal("General Donation")}
                  className="btn-outline"
                >
                  <Heart className="w-4 h-4 text-[#E86F1D] fill-current" />
                  <span>{lang === "hi" ? "मिशन का समर्थन करें" : "Support the Mission"}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#E7D8C8] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#2B201A]/80 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2F5A43] shrink-0" />
                  <span>Registered Charitable Trust</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-[#B8893E] shrink-0" />
                  <span>15+ Years of Seva</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#E86F1D] shrink-0" />
                  <span>25,000+ Active Devotees</span>
                </div>
              </div>
            </div>

            {/* Right Media Display: Premium Founder Hero Card */}
            <div className="lg:col-span-5 relative w-full">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Main Founder Image Hero Card */}
                <div className="relative rounded-[24px] overflow-hidden border-4 border-[#FFF9F2] shadow-2xl group transition-all duration-300 hover:shadow-warm-lg">
                  <div className="aspect-[16/10] relative w-full overflow-hidden bg-[#2B201A]">
                    <Image
                      src="/images/founder-hero-card.jpg"
                      alt="Pujya Sadhvi Vijeshanand Saraswati Ji"
                      fill
                      className="object-cover object-[50%_35%] contrast-[1.04] brightness-[1.02] transition-transform duration-700 group-hover:scale-[1.03]"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
                    />
                  </div>
                  {/* Reduced Height & Intensity Dark Gradient Overlay at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-[32%] bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />
                  
                  {/* Lower-left Clean Text Overlay */}
                  <div className="founder-text-overlay">
                    <div className="founder-label">FOUNDER</div>
                    <div className="founder-name">
                      Pujya Sadhvi Vijeshanand Saraswati Ji
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTION CARDS */}
      <section className="section-py">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: Books */}
            <div className="card-warm">
              <div className="card-body space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                  Books for Knowledge & Change
                </h3>
                <p className="text-sm text-[#2B201A]/85 leading-relaxed">
                  Discover practical, value-led publications created to educate, guide and empower agricultural & spiritual communities.
                </p>
              </div>
              <div className="card-action">
                <Link href="/books" className="btn-outline w-full">
                  <span>Explore Books</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Donate */}
            <div className="card-warm">
              <div className="card-body space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#2F5A43]/10 text-[#2F5A43] flex items-center justify-center">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                  Donate for Seva
                </h3>
                <p className="text-sm text-[#2B201A]/85 leading-relaxed">
                  Support programs that bring education, welfare, spiritual learning and practical assistance to underserved families.
                </p>
              </div>
              <div className="card-action">
                <button
                  onClick={() => openDonateModal("General Donation")}
                  className="btn-secondary w-full"
                >
                  <span>Donate Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 3: Daily Thought */}
            <div className="card-warm border-[#B8893E]/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Quote className="w-20 h-20 text-[#B8893E]" />
              </div>
              <div className="card-body space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[#B8893E]/10 text-[#B8893E] flex items-center justify-center">
                  <Sun className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                  Daily Thought
                </h3>
                <p className="text-base font-editorial italic text-[#2B201A] leading-relaxed pt-1">
                  “Let every thought become clearer, every action kinder, and every day an opportunity to serve.”
                </p>
              </div>
              <div className="card-action text-xs font-bold text-[#B8893E] uppercase tracking-wider">
                — Pujya Sadhvi Vijeshanand Saraswati Ji
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section id="events" className="section-py bg-[#FBF2E7]/60 border-y border-[#E7D8C8]">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto section-header space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">Punya Seva & Satsang</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
              Upcoming Events & Spiritual Discourses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event);
                  setEventModalOpen(true);
                }}
                className="card-warm cursor-pointer group hover:border-[#E86F1D]/50 hover:shadow-lg transition-all duration-200"
              >
                <div className="card-body space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-block px-3 py-1 bg-[#E86F1D] text-white text-xs font-bold rounded-md w-fit shadow-xs">
                      {formatCardDate(event.startDate)}
                    </div>
                    <span className="text-[11px] font-bold text-[#E86F1D] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-[#2B201A] group-hover:text-[#E86F1D] transition-colors leading-snug">
                    {lang === "hi" && event.titleHi ? event.titleHi : event.title}
                  </h3>
                  <p className="text-xs text-[#B8893E] font-bold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </p>
                  <p className="text-sm text-[#2B201A]/85 leading-relaxed line-clamp-3">
                    {lang === "hi" && event.summaryHi ? event.summaryHi : event.summary}
                  </p>
                </div>
                <div className="card-action">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDonateModal(event.title);
                    }}
                    className="btn-outline w-full"
                  >
                    REGISTER / SUPPORT EVENT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT COUNTERS STRIP */}
      <section className="py-12 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            <div className="space-y-1 p-3">
              <p className="font-editorial text-3xl sm:text-4xl font-bold text-[#E86F1D]">25,000+</p>
              <p className="text-xs sm:text-sm font-bold text-[#2B201A]/80 uppercase tracking-wider">Active Members</p>
            </div>
            <div className="space-y-1 p-3">
              <p className="font-editorial text-3xl sm:text-4xl font-bold text-[#B8893E]">350+</p>
              <p className="text-xs sm:text-sm font-bold text-[#2B201A]/80 uppercase tracking-wider">Events Conducted</p>
            </div>
            <div className="space-y-1 p-3">
              <p className="font-editorial text-3xl sm:text-4xl font-bold text-[#2F5A43]">50+</p>
              <p className="text-xs sm:text-sm font-bold text-[#2B201A]/80 uppercase tracking-wider">Cities Served</p>
            </div>
            <div className="space-y-1 p-3">
              <p className="font-editorial text-3xl sm:text-4xl font-bold text-[#E86F1D]">1,00,000+</p>
              <p className="text-xs sm:text-sm font-bold text-[#2B201A]/80 uppercase tracking-wider">Lives Impacted</p>
            </div>
            <div className="col-span-2 lg:col-span-1 space-y-1 p-3">
              <p className="font-editorial text-3xl sm:text-4xl font-bold text-[#B8893E]">15+</p>
              <p className="text-xs sm:text-sm font-bold text-[#2B201A]/80 uppercase tracking-wider">Years of Seva</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR PURPOSE CARDS */}
      <section className="section-py">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto section-header space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">Pillars of Action</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
              Our Foundational Commitments
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Mission */}
            <div className="card-warm">
              <div className="card-body space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">Our Mission</h3>
                <p className="text-sm sm:text-base text-[#2B201A]/85 leading-relaxed">
                  To empower every section of society through education, moral values, selfless service, and spiritual guidance, while helping youth and women become self-reliant and strengthening cultural heritage.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="card-warm">
              <div className="card-body space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#B8893E]/10 text-[#B8893E] flex items-center justify-center">
                  <Sun className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">Our Vision</h3>
                <p className="text-sm sm:text-base text-[#2B201A]/85 leading-relaxed">
                  To help build a society rooted in spiritual values, cultural heritage, education, and humanity, where every individual can live with dignity, peace, and harmony.
                </p>
              </div>
            </div>

            {/* Join Us */}
            <div className="card-warm">
              <div className="card-body space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#2F5A43]/10 text-[#2F5A43] flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">Join Us</h3>
                <p className="text-sm sm:text-base text-[#2B201A]/85 leading-relaxed">
                  Become part of a community committed to seva, culture, and spiritual growth. Together, we can create practical and compassionate change in villages and cities alike.
                </p>
              </div>
              <div className="card-action">
                <Link href="/membership" className="btn-secondary w-full">
                  <span>Become a Member</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Support Us */}
            <div className="card-warm">
              <div className="card-body space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">Support Us</h3>
                <p className="text-sm sm:text-base text-[#2B201A]/85 leading-relaxed">
                  Your contribution helps sustain social service, Gurukul education, spiritual initiatives, farmer awareness workshops, and community welfare programs that create lasting impact.
                </p>
              </div>
              <div className="card-action">
                <button
                  onClick={() => openDonateModal("General Donation")}
                  className="btn-primary w-full"
                >
                  <span>Make a Donation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEVOTEE TESTIMONIAL CAROUSEL */}
      <section className="section-py bg-[#FBF2E7]/40 border-t border-[#E7D8C8]">
        <div className="page-container max-w-4xl">
          <div className="card-warm text-center relative overflow-hidden p-8 sm:p-12">
            <Quote className="w-16 h-16 text-[#B8893E]/20 mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D] mb-2">
              WHAT OUR DEVOTEES SAY
            </p>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A] mb-6">
              Experiences & Blessings Shared by Our Community
            </h2>

            <div className="min-h-[140px] flex items-center justify-center">
              <blockquote className="space-y-4">
                <p className="font-editorial text-lg sm:text-xl text-[#2B201A] italic leading-relaxed max-w-2xl mx-auto">
                  “{lang === "hi" ? testimonials[activeTestimonial].quoteHi : testimonials[activeTestimonial].quote}”
                </p>
                <div>
                  <p className="font-bold text-sm text-[#2B201A]">{testimonials[activeTestimonial].name}</p>
                  <p className="text-xs text-[#B8893E] font-semibold">
                    {testimonials[activeTestimonial].role} — {testimonials[activeTestimonial].location}
                  </p>
                </div>
              </blockquote>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-[#E7D8C8]">
              <button
                onClick={() =>
                  setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
                }
                className="p-2.5 rounded-full border border-[#E7D8C8] hover:bg-[#FFF9F2] text-[#2B201A] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      activeTestimonial === idx ? "bg-[#E86F1D] w-6" : "bg-[#E7D8C8] w-2.5"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() =>
                  setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
                }
                className="p-2.5 rounded-full border border-[#E7D8C8] hover:bg-[#FFF9F2] text-[#2B201A] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

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
