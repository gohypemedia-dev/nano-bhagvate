"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { useApp } from "@/context/AppContext";
import HeadingDivider from "@/components/HeadingDivider";
import EventDetailsModal, { EventItem } from "@/components/EventDetailsModal";

export default function EventsPage() {
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
    {
      id: "ev-4",
      slug: "gopashtami-gau-seva-mahotsav",
      title: "Gopashtami & Gau Seva Mahotsav",
      titleHi: "गोपाष्टमी एवं गौ सेवा महोत्सव",
      summary: "Special Gau Pujan, havan, and community satsang dedicated to cow protection and welfare across our Gaushala shelters.",
      summaryHi: "गौ संवर्धन, पावन गोपूजन, विशेष हवन एवं गौशाला परिसर में विशाल महाप्रसाद व आध्यात्मिक सत्संग।",
      description: "Participate in the auspicious Gopashtami Mahotsav at our Vrindavan Gaushala. Devotees perform sacred cow worship, offer grass and jaggery, take part in Vedic havan for cosmic peace, and listen to spiritual discourses on the significance of Gomata in Sanatan Dharma.",
      startDate: "2027-01-24T03:30:00Z",
      endDate: "2027-01-24T12:30:00Z",
      timeText: "9:00 AM – 4:00 PM IST",
      location: "Trust Gaushala, Vrindavan",
      address: "Namo Bhagwate Vasudevaya Gaushala complex, Vrindavan, UP",
      contactPhone: "+91 9910762692",
      isPublished: true,
    },
    {
      id: "ev-5",
      slug: "youth-spiritual-leadership-camp",
      title: "Youth Spiritual Leadership Camp",
      titleHi: "युवा संस्कार एवं ध्यान साधना शिविर",
      summary: "Guiding the next generation with Vedic wisdom, value-based living, meditation workshops, and nation-building discourses.",
      summaryHi: "वैदिक जीवन दृष्टि, ध्यान साधना, राष्ट्र निर्माण एवं चरित्र निर्माण हेतु युवाओं के लिए विशेष तीन दिवसीय आवासीय शिविर।",
      description: "A transformative three-day residential camp aimed at teenagers and young adults. Combines guided meditation, character building, time management through the Bhagavad Gita, and dialogue with motivational spiritual mentors.",
      startDate: "2027-02-18T04:30:00Z",
      endDate: "2027-02-20T12:30:00Z",
      timeText: "All Day Residential Camp",
      location: "Rishikesh Ashram Kendra",
      address: "Swargashram Road, Rishikesh, Uttarakhand - 249304",
      contactPhone: "+91 9910762692",
      isPublished: true,
    },
    {
      id: "ev-6",
      slug: "sant-samagam-spiritual-conclave",
      title: "Sant Samagam & Vedic Conclave",
      titleHi: "विराट संत समागम एवं वेद सम्मेलन",
      summary: "A grand congregation of revered saints, scholars, and spiritual leaders discussing Sanatan culture and community welfare.",
      summaryHi: "पूज्य संतों, विद्वानों एवं आचार्यों का पावन सान्निध्य, सनातन संस्कृति के संरक्षण व समाज जागरण पर विराट विमर्श।",
      description: "Join leading spiritual masters, Mahants, and Vedic scholars for an inspiring dialogue on moral rejuvenation, cultural preservation, and social unity. Concludes with collective Mahamrityunjaya chanting and community bhandara.",
      startDate: "2027-03-15T04:30:00Z",
      endDate: "2027-03-16T13:30:00Z",
      timeText: "10:00 AM – 5:00 PM IST",
      location: "Central Ashram, Gurugram",
      address: "Namo Bhagwate Vasudevaya Trust Ashram, Sector 48, Gurugram, Haryana - 122018",
      contactPhone: "+91 9910762692",
      isPublished: true,
    },
  ];

  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.events && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      })
      .catch((err) => {
        console.warn("Failed to load events from API, showing defaults:", err);
      });
  }, []);

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
    <div className="bg-[#FAF3EA] min-h-screen py-12 sm:py-16 lg:py-20">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Centered Title Header with Orange Color & Ornamental Divider matching Reference Image 2 */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10">
          <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-[#E86F1D] tracking-tight sm:whitespace-nowrap">
            {lang === "hi"
              ? "आगामी कार्यक्रम एवं आध्यात्मिक सत्संग"
              : "Upcoming Events & Spiritual Discourses"}
          </h1>
          <HeadingDivider className="mt-3" />
        </div>

        {/* Grid of Event Cards Matching Reference */}
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
