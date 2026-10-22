"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartPulse, GraduationCap, Users, HeartHandshake, CheckCircle2, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function InitiativesPage() {
  const { lang, openDonateModal } = useApp();

  const initiatives = [
    {
      id: "health",
      title: "Health & Wellness Initiatives",
      titleHi: "स्वास्थ्य एवं प्राकृतिक कल्याण सेवा",
      description: "Providing accessible healthcare, medical assistance, and promoting holistic wellness through Ayurveda and Yoga in rural communities.",
      descriptionHi: "ग्रामीण और वंचित क्षेत्रों में मुफ्त चिकित्सा शिविर, योग और प्राकृतिक स्वास्थ्य सेवाएं प्रदान करना।",
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
      description: "Preserving Vedic traditions while integrating modern education, science, and IT for holistic youth development.",
      descriptionHi: "युवाओं के सर्वांगीण विकास के लिए आधुनिक शिक्षा और मूल्यों को एकीकृत करते हुए वैदिक परंपराओं का संरक्षण।",
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
      description: "Fostering economic independence and self-reliance for women through vocational skills, training, and guidance.",
      descriptionHi: "व्यावसायिक कौशलों और मार्गदर्शन के माध्यम से महिलाओं के लिए आर्थिक स्वतंत्रता और स्वावलंबन को बढ़ावा देना।",
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
      description: "Delivering essential relief, food distribution, and compassionate care to vulnerable communities and elder citizens.",
      descriptionHi: "कमजोर वर्गों और वरिष्ठ नागरिकों को आवश्यक राहत, पोषण और करुणामय देखभाल प्रदान करना।",
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
      {/* HERO SECTION - RECREATED FROM REFERENCE (PANORAMIC ON DESKTOP, EXACT 4:5 HERO ON MOBILE) */}
      <section className="relative overflow-hidden bg-[#1F150E] md:bg-[#F6EDE2] border-b border-[#E7D8C8] md:min-h-[calc(100vh-80px)] md:flex md:items-center">
        {/* Desktop Panoramic Background Banner (hidden on mobile) */}
        <div className="hidden md:block absolute inset-0 z-0">
          <Image
            src="/images/initiatives-hero-banner.png"
            alt="Transforming Lives Through Service"
            fill
            priority
            unoptimized
            className="object-cover object-right lg:object-center"
          />
          {/* Smooth Warm Mist Gradient on Desktop */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6EDE2] via-[#F6EDE2] via-38% lg:via-46% to-transparent" />
        </div>

        {/* MOBILE HERO (4:5 Banner with Bottom Overlay - Exact Home Page Format) */}
        <div className="md:hidden relative z-1 w-full aspect-[4/5] flex items-center justify-center overflow-hidden">
          <Image
            src="/images/initiatives-mobile-hero.png"
            alt="Transforming Lives Through Service - Namo Bhagwate Vasudevaya"
            fill
            priority
            unoptimized
            className="w-full h-full object-cover block select-none pointer-events-none"
          />

          {/* Mobile Overlay Action Bar (Clean gradient at bottom of mobile banner) */}
          <div className="absolute bottom-0 inset-x-0 z-20 w-full px-4 pt-10 pb-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col items-center gap-1.5 text-center pointer-events-auto">
            <h2 className="font-editorial text-sm sm:text-base font-extrabold text-white tracking-wide leading-tight drop-shadow-md">
              {lang === "hi" ? "सेवा से जीवन • सशक्तिकरण एवं परिवर्तन" : "Transforming Lives • Through Service"}
            </h2>
            <div className="flex items-center justify-center gap-2.5 w-full max-w-xs pt-1">
              <a
                href="#all-initiatives"
                className="flex-1 py-2 px-3 rounded-lg bg-[#E86F1D] text-white font-bold text-xs uppercase tracking-wider text-center shadow-md active:scale-95 transition-transform"
              >
                {lang === "hi" ? "सेवा कार्य" : "Initiatives"}
              </a>
              <button
                onClick={() => openDonateModal()}
                className="flex-1 py-2 px-3 rounded-lg bg-white text-[#2B201A] font-bold text-xs uppercase tracking-wider text-center shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <Heart className="w-3 h-3 text-[#E86F1D] fill-current" />
                <span>{lang === "hi" ? "सहयोग करें" : "Support"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Hero Content (hidden on mobile) */}
        <div className="hidden md:block relative z-10 page-container py-8 sm:py-12 md:py-24 w-full">
          <div className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-5">
            {/* Main Title matching reference */}
            <h1 className="font-editorial text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F1712] leading-[1.12] tracking-tight">
              {lang === "hi" ? (
                <>
                  सेवा से जीवन <br />
                  <span className="text-[#E86F1D]">सशक्तिकरण एवं परिवर्तन</span>
                </>
              ) : (
                <>
                  Transforming Lives <br />
                  <span className="text-[#E86F1D]">Through Service</span>
                </>
              )}
            </h1>

            {/* Description matching exact reference text */}
            <p className="text-sm sm:text-base md:text-lg text-[#3E3129] leading-relaxed font-sans font-medium">
              {lang === "hi"
                ? "ऐसे सार्थक सेवा प्रकल्पों से जुड़ें जो व्यक्तियों को सशक्त बनाते हैं, समाज को पोषित करते हैं और स्थायी सामाजिक बदलाव लाते हैं। श्रीमद्भगवद्गीता के शाश्वत ज्ञान से प्रेरित होकर, हमारा प्रत्येक प्रकल्प करुणा, सेवा और समग्र विकास के प्रति हमारी निष्ठा को दर्शाता है।"
                : "Discover meaningful initiatives that empower individuals, nurture communities, and create lasting social impact. Guided by the timeless wisdom of the Bhagavad Gita, every initiative reflects our commitment to compassion, service, and holistic development."}
            </p>

            {/* Trust Points / Micro Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-[#2B201A]/85 font-semibold">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white/70 backdrop-blur-xs border border-[#E7D8C8] text-[11px] sm:text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2F5A43]" />
                {lang === "hi" ? "80G आयकर छूट उपलब्ध" : "100% Tax Benefit (80G)"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white/70 backdrop-blur-xs border border-[#E7D8C8] text-[11px] sm:text-xs">
                <Users className="w-3.5 h-3.5 text-[#E86F1D]" />
                {lang === "hi" ? "शिक्षा, स्वास्थ्य व महिला उत्थान" : "Education, Health & Women Empowerment"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white/70 backdrop-blur-xs border border-[#E7D8C8] text-[11px] sm:text-xs">
                <Heart className="w-3.5 h-3.5 text-[#E86F1D]" />
                {lang === "hi" ? "गौ सेवा व ग्रामीण सहायता" : "Gau Seva & Rural Welfare"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-4">
              <a
                href="#all-initiatives"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <span>{lang === "hi" ? "सभी सेवा प्रकल्प देखें" : "Explore All Initiatives"}</span>
              </a>
              <button
                type="button"
                onClick={() => openDonateModal()}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-white/80 hover:bg-white text-[#2B201A] font-bold text-xs sm:text-sm uppercase tracking-wider border border-[#E7D8C8] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span>{lang === "hi" ? "प्रकल्प में सहयोग करें" : "Support An Initiative"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 PRIMARY INITIATIVE CARDS */}
      <section className="section-py" id="all-initiatives">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            {initiatives.map((item, idx) => (
                <div
                  key={item.id}
                  className="card-warm p-0 overflow-hidden flex flex-col justify-between"
                >
                  {/* 1. Initiative Image (TOP) */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#2B201A]">
                    <Image
                      src={item.image}
                      alt={lang === "hi" ? item.titleHi : item.title}
                      fill
                      className="object-cover object-center transition-transform duration-500 hover:scale-105"
                      priority={idx === 0}
                    />
                  </div>

                  {/* Content Body */}
                  <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between space-y-6">
                    <div className="space-y-4">
                      {/* Initiative Title */}
                      <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A]">
                        {lang === "hi" ? item.titleHi : item.title}
                      </h2>

                      {/* 4. Description */}
                      <p className="text-sm sm:text-base text-[#2B201A]/85 font-sans leading-relaxed">
                        {lang === "hi" ? item.descriptionHi : item.description}
                      </p>

                      {/* 5. Bullet Points */}
                      <ul className="space-y-3 text-sm text-[#2B201A]/85 font-sans pt-1">
                        {item.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#2F5A43] shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 6. Support Initiative and Volunteer With Us Buttons (BOTTOM) */}
                    <div className="pt-4 card-action flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 border-t border-[#E7D8C8] mt-auto">
                      <button
                        onClick={() => openDonateModal(item.title)}
                        className="btn-primary flex-1"
                      >
                        Support Initiative
                      </button>
                      <Link href="/contact" className="btn-outline flex-1 text-center">
                        Volunteer With Us
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
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
              <Link href="/membership" className="btn-secondary flex-1 text-center">
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

