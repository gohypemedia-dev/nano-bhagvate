"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartPulse, GraduationCap, Users, HeartHandshake, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  TextReveal,
  ParagraphReveal,
  SectionReveal,
  StaggerContainer,
  StaggerItem,
  ParallaxSection,
  ParallaxImage,
} from "@/components/animation";
import HeadingDivider from "@/components/HeadingDivider";

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
        "Free Medical Camps",
        "Yoga & Ayurvedic Health Programs",
        "Mental Health Awareness",
      ],
      bulletsHi: [
        "निःशुल्क चिकित्सा एवं स्वास्थ्य परीक्षण शिविर",
        "समग्र स्वास्थ्य हेतु योग एवं आयुर्वेदिक आरोग्य कार्यक्रम",
        "मानसिक स्वास्थ्य जागरूकता एवं तनाव प्रबंधन",
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
        "Gurukul Establishment & Management",
        "Free Education for Underprivileged Children",
        "Integration of Vedic and Modern Education",
      ],
      bulletsHi: [
        "गुरुकुल स्थापना एवं पारंपरिक वैदिक शिक्षा प्रबंधन",
        "वंचित वर्ग के बच्चों को निःशुल्क शिक्षा व पाठ्य सामग्री",
        "वैदिक ज्ञान के साथ आधुनिक विज्ञान व कंप्यूटर शिक्षा का समन्वय",
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
        "Skill Development Programs for Women",
        "Self-Reliance & Entrepreneurship Support",
        "Social & Legal Assistance",
      ],
      bulletsHi: [
        "महिलाओं के लिए कौशल विकास एवं स्वावलंबन कार्यक्रम",
        "आत्मनिर्भरता एवं लघु स्वरोजगार हेतु प्रत्यक्ष सहयोग",
        "सामाजिक एवं विधिक साक्षरता मार्गदर्शन",
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
        "Food & Clothing Distribution",
        "Support for Orphans & the Needy",
        "Support for the Elderly & Underprivileged",
      ],
      bulletsHi: [
        "नियमित अन्नदान (भंडारा) एवं वस्त्र वितरण अभियान",
        "अनाथ बच्चों एवं जरूरतमंदों के लिए सर्वांगीण सहयोग",
        "वरिष्ठ नागरिकों व असहाय जनों की नियमित सेवा व देखभाल",
      ],
    },
  ];

  return (
    <div className="w-full space-y-0">
      {/* HERO SECTION - RECREATED FROM REFERENCE (PANORAMIC ON DESKTOP, 100VH ON MOBILE & LAPTOP) */}
      <section className="relative overflow-hidden bg-[#1F150E] md:bg-[#F6EDE2] border-b border-[#E7D8C8] min-h-[calc(100vh-68px)] sm:min-h-[calc(100vh-74px)] min-[1000px]:min-h-[calc(100vh-76px)] xl:min-h-[calc(100vh-82px)] md:flex md:items-center">
        {/* Desktop Panoramic Background Banner (hidden on mobile) */}
        <ParallaxImage offset={45} className="hidden md:block absolute inset-0 z-0">
          <Image
            src="/images/initiatives-hero-banner.png"
            alt="Transforming Lives Through Service"
            fill
            priority
            unoptimized
            className="object-cover object-right lg:object-center"
          />
          {/* Clean feathered mask: completely masks baked-in text & dark background on left while seamlessly revealing community & Sadhvi Ji on right */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, #F6EDE2 0%, #F6EDE2 45%, rgba(246,237,226,0.98) 49%, rgba(246,237,226,0.85) 54%, rgba(246,237,226,0.45) 60%, rgba(246,237,226,0.12) 65%, rgba(246,237,226,0) 70%)",
            }}
          />
        </ParallaxImage>

        {/* MOBILE HERO (100VH Full Viewport Height with Bottom Overlay) */}
        <div className="md:hidden relative z-1 w-full h-[calc(100vh-68px)] min-h-[540px] flex items-center justify-center overflow-hidden">
          <ParallaxImage offset={30} className="absolute inset-0 w-full h-full">
            <Image
              src="/images/initiatives-mobile-hero.png"
              alt="Transforming Lives Through Service - Namo Bhagwate Vasudevaya"
              fill
              priority
              unoptimized
              className="w-full h-full object-cover object-top block select-none pointer-events-none"
            />
          </ParallaxImage>

          {/* Mobile Overlay Action Bar (Clean gradient at bottom of mobile banner) */}
          <div className="absolute bottom-0 inset-x-0 z-20 w-full px-4 pt-16 pb-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col items-center gap-2 text-center pointer-events-auto">
            <TextReveal as="h2" className="font-editorial text-sm sm:text-base font-extrabold text-white tracking-wide leading-tight drop-shadow-md">
              {lang === "hi" ? "सेवा से जीवन • सशक्तिकरण एवं परिवर्तन" : "Transforming Lives • Through Service"}
            </TextReveal>
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
          <div className="max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-4 sm:space-y-5">
            {/* Main Title matching reference */}
            <TextReveal as="h1" className="font-editorial text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F1712] leading-[1.12] tracking-tight">
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
            </TextReveal>

            {/* Description matching exact reference text */}
            <ParagraphReveal className="text-sm sm:text-base md:text-lg text-[#3E3129] leading-relaxed font-sans font-medium">
              {lang === "hi"
                ? "ऐसे सार्थक सेवा प्रकल्पों से जुड़ें जो व्यक्तियों को सशक्त बनाते हैं, समाज को पोषित करते हैं और स्थायी सामाजिक बदलाव लाते हैं। श्रीमद्भगवद्गीता के शाश्वत ज्ञान से प्रेरित होकर, हमारा प्रत्येक प्रकल्प करुणा, सेवा और समग्र विकास के प्रति हमारी निष्ठा को दर्शाता है।"
                : "Discover meaningful initiatives that empower individuals, nurture communities, and create lasting social impact. Guided by the timeless wisdom of the Bhagavad Gita, every initiative reflects our commitment to compassion, service, and holistic development."}
            </ParagraphReveal>



            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-4">
              <a
                href="#all-initiatives"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-[#E86F1D] hover:bg-[#D25E12] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
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
      <SectionReveal className="section-py" id="all-initiatives">
        <div className="page-container">
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            {initiatives.map((item, idx) => (
              <StaggerItem key={item.id} className="h-full">
                <div
                  className="card-warm p-0 overflow-hidden flex flex-col justify-between h-full"
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
                      <h2 className="font-sans text-sm min-[380px]:text-[15px] sm:text-lg md:text-xl lg:text-[16px] xl:text-[19px] 2xl:text-[22px] font-bold text-[#E86F1D] uppercase tracking-normal sm:tracking-wide whitespace-nowrap">
                        {lang === "hi" ? item.titleHi : item.title}
                      </h2>
                      <HeadingDivider align="left" className="!py-0" />

                      {/* 4. Description */}
                      <p className="text-sm sm:text-base text-[#2B201A]/85 font-sans leading-relaxed">
                        {lang === "hi" ? item.descriptionHi : item.description}
                      </p>

                      {/* 5. Bullet Points */}
                      <ul className="space-y-3 text-sm text-[#2B201A]/85 font-sans pt-1">
                        {(lang === "hi" && item.bulletsHi ? item.bulletsHi : item.bullets).map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-[#E86F1D] shrink-0 mt-1.5" aria-hidden="true" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 6. Support Initiative and Volunteer With Us Buttons (BOTTOM) */}
                    <div className="pt-4 card-action flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 border-t border-[#E7D8C8] mt-auto">
                      <button
                        onClick={() => openDonateModal(lang === "hi" ? item.titleHi : item.title)}
                        className="btn-primary flex-1"
                      >
                        {lang === "hi" ? "सेवा में सहयोग करें" : "Support Initiative"}
                      </button>
                      <Link href="/contact" className="btn-outline flex-1 text-center">
                        {lang === "hi" ? "स्वयंसेवक बनें" : "Volunteer With Us"}
                      </Link>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SectionReveal>

      {/* PREMIUM CTA BANNER */}
      <SectionReveal className="section-py bg-[#FBF2E7]/50 border-t border-[#E7D8C8]">
        <div className="page-container max-w-5xl">
          <div className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFFFFF] to-[#FFF5EB] rounded-3xl sm:rounded-[2rem] p-8 sm:p-14 text-center border border-[#F0D5C3] shadow-xl space-y-6">
            {/* Bottom subtle warm waves matching reference design */}
            <div className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden h-20 sm:h-28 opacity-60">
              <svg
                className="absolute bottom-0 w-full h-full"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M0,80 C180,40 320,110 500,85 C680,60 850,110 1020,70 C1100,50 1160,60 1200,75 L1200,120 L0,120 Z"
                  fill="#FED7AA"
                  fillOpacity="0.45"
                />
                <path
                  d="M0,100 C150,65 350,115 550,90 C750,65 950,115 1200,85 L1200,120 L0,120 Z"
                  fill="#FDBA74"
                  fillOpacity="0.3"
                />
              </svg>
            </div>

            {/* Top Eyebrow with side accent lines */}
            <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4">
              <span className="w-8 sm:w-16 h-[1.5px] bg-[#E86F1D]/50 rounded-full" />
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#2C1810]">
                {lang === "hi" ? "पावन सेवा मिशन से जुड़ें" : "JOIN THE SEVA MISSION"}
              </p>
              <span className="w-8 sm:w-16 h-[1.5px] bg-[#E86F1D]/50 rounded-full" />
            </div>

            {/* Main Headline: Line 1 Dark Brown, Line 2 Signature Orange */}
            <TextReveal as="h2" className="relative z-10 font-editorial text-2xl sm:text-4xl md:text-[2.6rem] font-bold leading-tight">
              {lang === "hi" ? (
                <>
                  <span className="text-[#2B1810] block">हमारे साथ सेवा करें • प्रकल्प में सहयोग दें</span>
                  <span className="text-[#E86F1D] block mt-1 sm:mt-2">करुणा को प्रत्यक्ष सेवा में बदलें</span>
                </>
              ) : (
                <>
                  <span className="text-[#2B1810] block">Serve with us. Support an initiative.</span>
                  <span className="text-[#E86F1D] block mt-1 sm:mt-2">Help turn compassion into action.</span>
                </>
              )}
            </TextReveal>

            {/* Subtext description */}
            <ParagraphReveal className="relative z-10 text-sm sm:text-base text-[#5C4D44] max-w-2xl mx-auto font-sans leading-relaxed">
              {lang === "hi"
                ? "आपका प्रत्येक अंशदान सीधे चिकित्सा शिविरों, गुरुकुल शिक्षा, महिला कौशल कार्यशालाओं और जनकल्याण सेवाओं को सशक्त बनाता है।"
                : "Every contribution directly powers our health camps, Gurukul education, women skill workshops, and farmer advisory programs."}
            </ParagraphReveal>

            {/* Action Buttons: Pill-shaped Member outline & Donate solid */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/membership"
                className="w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-full border-2 border-[#E86F1D] bg-white hover:bg-[#FFF7ED] text-[#E86F1D] font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md active:scale-95 text-center"
              >
                {lang === "hi" ? "सदस्यता ग्रहण करें" : "Become a Member"}
              </Link>
              <button
                onClick={() => openDonateModal(lang === "hi" ? "सामान्य पुण्य दान" : "General Donation")}
                className="w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-full bg-[#E86F1D] hover:bg-[#D25E12] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-current text-white" />
                <span>{lang === "hi" ? "दान सहयोग करें" : "Donate Now"}</span>
              </button>
            </div>

            {/* Standard Signature HeadingDivider as requested */}
            <div className="relative z-10 pt-2 sm:pt-4">
              <HeadingDivider />
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* STRICT RULE CONFIRMED: ZERO GALLERY SECTION HERE! */}
    </div>
  );
}

