"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartPulse, GraduationCap, Users, HeartHandshake, CheckCircle2, ArrowRight, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function InitiativesPage() {
  const { lang, openDonateModal } = useApp();

  const initiatives = [
    {
      id: "health",
      title: "Health & Wellness Initiatives",
      titleHi: "स्वास्थ्य एवं प्राकृतिक कल्याण सेवा",
      image: "/images/initiative-health.jpg",
      icon: HeartPulse,
      bullets: [
        "Free medical camps in rural and underserved regions",
        "Yoga and Ayurvedic wellness programs for holistic health",
        "Mental health awareness and stress management initiatives",
        "Free distribution of essential medicines and health kits",
      ],
    },
    {
      id: "education",
      title: "Education & Gurukul Development",
      titleHi: "शिक्षा एवं गुरुकुल विकास परियोजना",
      image: "/images/initiative-education.jpg",
      icon: GraduationCap,
      bullets: [
        "Gurukul establishment and traditional Vedic education management",
        "Free education and study material for underprivileged children",
        "Seamless integration of Vedic wisdom with modern science & IT",
        "Moral values (Sanskar) and character building workshops",
      ],
    },
    {
      id: "women",
      title: "Women Empowerment",
      titleHi: "महिला सशक्तिकरण एवं कौशल विकास",
      image: "/images/initiative-women.jpg",
      icon: Users,
      bullets: [
        "Skill-development workshops in tailoring, handicrafts & IT",
        "Self-reliance and small-scale entrepreneurship support",
        "Social, legal, and financial literacy guidance for women",
        "Self-defense and confidence building camps",
      ],
    },
    {
      id: "welfare",
      title: "Social Welfare & Humanitarian Support",
      titleHi: "सामाजिक कल्याण एवं सर्वजन सेवा",
      image: "/images/initiative-farmers.jpg",
      icon: HeartHandshake,
      bullets: [
        "Regular food (Annadan) and warm clothing distribution drives",
        "Comprehensive support for orphans, widows, and vulnerable groups",
        "Care and medical support for elderly and underprivileged citizens",
        "Disaster relief and emergency humanitarian assistance",
      ],
    },
  ];

  return (
    <div className="w-full space-y-0">
      {/* HERO SECTION */}
      <section className="relative py-14 md:py-20 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container text-center space-y-4 max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">SEVA IN ACTION</p>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B201A]">
            Transforming Lives Through Service
          </h1>
          <p className="text-base sm:text-lg text-[#2B201A]/85 leading-relaxed font-sans max-w-2xl mx-auto">
            Our initiatives are designed to empower individuals, nurture communities, and create meaningful long-term impact. Guided by the values of the Bhagavad Gita, each program brings compassion together with practical support.
          </p>
        </div>
      </section>

      {/* 4 PRIMARY INITIATIVE CARDS */}
      <section className="section-py">
        <div className="page-container space-y-10">
          {initiatives.map((item, idx) => {
            const IconComp = item.icon;
            const isEven = idx % 2 === 0;
            return (
              <div
                key={item.id}
                className="card-warm p-0 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
              >
                {/* Media Column */}
                <div className={`lg:col-span-6 relative aspect-[16/10] w-full min-h-[260px] ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>

                {/* Text Content Column */}
                <div className={`lg:col-span-6 p-6 sm:p-8 md:p-10 card-body justify-between space-y-6 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E86F1D]/10 text-[#E86F1D] rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                      <IconComp className="w-4 h-4" />
                      <span>Initiative 0{idx + 1}</span>
                    </div>
                    <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A]">
                      {lang === "hi" ? item.titleHi : item.title}
                    </h2>

                    <ul className="space-y-3 text-sm text-[#2B201A]/85 font-sans pt-2">
                      {item.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#2F5A43] shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 card-action flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 border-t border-[#E7D8C8]">
                    <button
                      onClick={() => openDonateModal(item.title)}
                      className="btn-primary flex-1"
                    >
                      Support Initiative
                    </button>
                    <Link href="/contact" className="btn-outline flex-1">
                      Volunteer With Us
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PREMIUM CTA BANNER */}
      <section className="section-py bg-[#FBF2E7]/50 border-t border-[#E7D8C8]">
        <div className="page-container max-w-5xl">
          <div className="bg-gradient-to-r from-[#2B201A] to-[#3D2C24] text-white rounded-3xl p-8 sm:p-12 text-center border-2 border-[#B8893E] shadow-2xl space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">JOIN THE SEVA MISSION</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold leading-tight">
              Serve with us. Support an initiative.
              <br />
              Help turn compassion into action.
            </h2>
            <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto font-sans">
              Every contribution directly powers our health camps, Gurukul education, women skill workshops, and farmer advisory programs.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-4 max-w-md mx-auto">
              <Link href="/membership" className="btn-secondary flex-1">
                Become a Member
              </Link>
              <button
                onClick={() => openDonateModal("General Donation")}
                className="btn-primary flex-1"
              >
                <Heart className="w-4 h-4 fill-current text-white" />
                <span>Donate Now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STRICT RULE CONFIRMED: ZERO GALLERY SECTION HERE! */}
    </div>
  );
}
