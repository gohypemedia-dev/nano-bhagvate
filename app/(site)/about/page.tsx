"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sprout, GraduationCap, Users, Sun, Heart, CheckCircle2 } from "lucide-react";
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


export default function AboutPage() {
  const { lang, openDonateModal } = useApp();

  const commitmentCards = [
    {
      id: "farmer-welfare",
      title: "Farmer Welfare",
      titleHi: "किसान कल्याण एवं संवर्धन",
      badge: "SEVA PILLAR I",
      badgeHi: "सेवा स्तंभ १",
      desc: "Working closely with sugarcane farmers to introduce modern agricultural techniques and knowledge that improve yield, sustainability, and livelihood.",
      descHi: "गन्ना किसानों और ग्रामीण कृषकों के साथ मिलकर आधुनिक कृषि तकनीकों, मृदा स्वास्थ्य एवं टिकाऊ पद्धतियों का प्रसार करना ताकि पैदावार और आजीविका में वास्तविक सुधार हो सके।",
      image: "/images/initiative-farmers.jpg",
      icon: Sprout,
      points: [
        { en: "Sugarcane yield & crop science guidance", hi: "गन्ना उत्पादन एवं फसल विज्ञान मार्गदर्शन" },
        { en: "Soil health & sustainable farming practices", hi: "मृदा स्वास्थ्य एवं प्राकृतिक उर्वरक प्रयोग" },
        { en: "Direct village-level farmer support workshops", hi: "ग्राम स्तर पर प्रत्यक्ष किसान परामर्श कार्यशालाएँ" },
      ],
    },
    {
      id: "womens-empowerment",
      title: "Women’s Empowerment",
      titleHi: "महिला सशक्तिकरण एवं स्वावलंबन",
      badge: "SEVA PILLAR II",
      badgeHi: "सेवा स्तंभ २",
      desc: "Equipping women with practical vocational skills, financial literacy, and entrepreneurship resources that support self-reliance and strengthen leadership within families and villages.",
      descHi: "ग्रामीण व अर्ध-शहरी महिलाओं को व्यावहारिक कौशल, वित्तीय साक्षरता और स्वरोजगार के संसाधन प्रदान करना जिससे वे आत्मनिर्भर बनकर अपने परिवार व समाज को सशक्त बना सकें।",
      image: "/images/initiative-women.jpg",
      icon: Users,
      points: [
        { en: "Vocational training & handicraft development", hi: "व्यावसायिक सिलाई, हस्तकला एवं कौशल प्रशिक्षण" },
        { en: "Financial literacy & self-help group mentoring", hi: "वित्तीय साक्षरता एवं स्वयं सहायता समूह मार्गदर्शन" },
        { en: "Healthcare & nutritional awareness drives", hi: "स्वास्थ्य, पोषण व परिवार कल्याण जागरूकता शिविर" },
      ],
    },
    {
      id: "youth-empowerment",
      title: "Youth Empowerment",
      titleHi: "युवा विकास एवं मार्गदर्शन",
      badge: "SEVA PILLAR III",
      badgeHi: "सेवा स्तंभ ३",
      desc: "Providing young people with character-building guidance, skill workshops, and mentorship so they can grow into confident and grounded contributors to society.",
      descHi: "युवाओं को चारित्रिक विकास, कौशल संवर्धन कार्यशालाएँ और नैतिक मार्गदर्शन देना ताकि वे आत्मविश्वास से परिपूर्ण होकर समाज के जिम्मेदार नागरिक बन सकें।",
      image: "/images/initiative-education.jpg",
      icon: GraduationCap,
      points: [
        { en: "Career mentorship & digital literacy programs", hi: "करियर मार्गदर्शन एवं डिजिटल कौशल विकास" },
        { en: "Leadership & teamwork development camps", hi: "नेतृत्व क्षमता एवं व्यक्तित्व विकास शिविर" },
        { en: "Value-based education grounded in Vedic ethics", hi: "वैदिक जीवन मूल्यों पर आधारित चरित्र निर्माण" },
      ],
    },
    {
      id: "spiritual-education",
      title: "Spiritual Education",
      titleHi: "आध्यात्मिक एवं नैतिक शिक्षा",
      badge: "SEVA PILLAR IV",
      badgeHi: "सेवा स्तंभ ४",
      desc: "Introducing children to Bhagavad Gita teachings, Sanskrit heritage, and meditation practices that cultivate mental focus, resilience, moral values, and inner peace.",
      descHi: "बच्चों और विद्यार्थियों को श्रीमद्भगवद्गीता के पावन श्लोक, संस्कृत धरोहर और ध्यान साधना से जोड़ना ताकि उनमें एकाग्रता, मानसिक शांति व उच्च संस्कार विकसित हों।",
      image: "/images/krishna.jpg",
      icon: Sun,
      points: [
        { en: "Bal Sanskar & Bhagavad Gita sloka chanting", hi: "बाल संस्कार शाला एवं श्रीमद्भगवद्गीता श्लोक पाठ" },
        { en: "Daily meditation & mindfulness for students", hi: "विद्यार्थियों के लिए दैनिक ध्यान एवं एकाग्रता अभ्यास" },
        { en: "Preserving ancient Sanatan Sanskrit heritage", hi: "प्राचीन सनातन संस्कृति व नैतिक जीवन मूल्यों का संरक्षण" },
      ],
    },
  ];

  return (
    <div className="w-full space-y-0 text-[#2B201A] font-sans">
      {/* 1. HERO SECTION - RECREATED FROM REFERENCE (PANORAMIC ON DESKTOP, 100VH ON MOBILE & LAPTOP) */}
      <section className="relative overflow-hidden bg-[#1F150E] md:bg-[#F7EDE1] border-b border-[#E7D8C8] min-h-[calc(100vh-68px)] sm:min-h-[calc(100vh-74px)] min-[1000px]:min-h-[calc(100vh-76px)] xl:min-h-[calc(100vh-82px)] md:flex md:items-center">
        {/* Desktop Panoramic Background Banner (hidden on mobile) */}
        <ParallaxImage offset={45} className="hidden md:block absolute inset-0 z-0">
          <Image
            src="/images/about-hero-banner.png"
            alt="Rooted in Wisdom. Driven by Service."
            fill
            priority
            unoptimized
            className="object-cover object-right lg:object-center"
          />
          {/* Clean feathered mask: completely masks baked-in text on the left while seamlessly revealing Lord Krishna on the right */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, #F7EDE1 0%, #F7EDE1 52%, rgba(247,237,225,0.98) 55%, rgba(247,237,225,0.85) 59%, rgba(247,237,225,0.45) 64%, rgba(247,237,225,0.12) 68%, rgba(247,237,225,0) 72%)",
            }}
          />
        </ParallaxImage>

        {/* MOBILE HERO (100VH Full Viewport Height with Bottom Overlay) */}
        <div className="md:hidden relative z-1 w-full h-[calc(100vh-68px)] min-h-[540px] flex items-center justify-center overflow-hidden">
          <ParallaxImage offset={30} className="absolute inset-0 w-full h-full">
            <Image
              src="/images/about-mobile-hero.png"
              alt="Lord Krishna and Children - Rooted in Wisdom. Driven by Service."
              fill
              priority
              unoptimized
              className="w-full h-full object-cover object-top block select-none pointer-events-none"
            />
          </ParallaxImage>

          {/* Mobile Overlay Action Bar */}
          <div className="absolute bottom-0 inset-x-0 z-20 w-full px-4 pt-16 pb-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col items-center gap-2 text-center pointer-events-auto">
            <TextReveal as="h2" className="font-editorial text-sm sm:text-base font-extrabold text-white tracking-wide leading-tight drop-shadow-md">
              {lang === "hi" ? "ज्ञान में निष्ठा • सेवा में समर्पण" : "Rooted in Wisdom • Driven by Service"}
            </TextReveal>
            <div className="flex items-center justify-center gap-2.5 w-full max-w-xs pt-1">
              <a
                href="#about-story"
                className="flex-1 py-2 px-3 rounded-lg bg-[#E86F1D] text-white font-bold text-xs uppercase tracking-wider text-center shadow-md active:scale-95 transition-transform"
              >
                {lang === "hi" ? "ट्रस्ट परिचय" : "Our Story"}
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
                  ज्ञान में निष्ठा।
                  <br />
                  <span className="text-[#E86F1D]">सेवा में समर्पण।</span>
                </>
              ) : (
                <>
                  Rooted in Wisdom.
                  <br />
                  <span className="text-[#E86F1D]">Driven by Service.</span>
                </>
              )}
            </TextReveal>

            {/* Subtitle matching exact reference text */}
            <ParagraphReveal className="text-sm sm:text-base md:text-lg text-[#3E3129] leading-relaxed font-sans font-medium">
              {lang === "hi"
                ? "नमो भगवते वासुदेवाय ट्रस्ट आध्यात्मिक ज्ञान के प्रसार, मानवता की सेवा और शिक्षा, स्वास्थ्य, संस्कृति व समाज कल्याण के माध्यम से जीवन उत्थान के लिए समर्पित है।"
                : "Namo Bhagwate Vasudevaya Trust is dedicated to spreading spiritual wisdom, serving humanity, and uplifting lives through selfless initiatives in education, health, culture, and community welfare."}
            </ParagraphReveal>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-4">
              <a
                href="#about-story"
                className="inline-flex items-center justify-center px-6 sm:px-7 py-3.5 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>{lang === "hi" ? "ट्रस्ट की यात्रा जानें" : "Our Story & Journey"}</span>
              </a>
              <button
                type="button"
                onClick={() => openDonateModal()}
                className="inline-flex items-center justify-center px-6 sm:px-7 py-3.5 rounded-xl bg-white/80 hover:bg-white text-[#2B201A] font-bold text-xs sm:text-sm uppercase tracking-wider border border-[#E7D8C8] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span>{lang === "hi" ? "पुण्य सेवा में सहयोग करें" : "Support Our Mission"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUTHENTIC NARRATIVE: "ABOUT US" & "OUR MISSION" */}
      <SectionReveal className="py-12 sm:py-16 md:py-20 bg-[#FBF6EE]" id="about-story">
        <div className="page-container max-w-5xl lg:max-w-6xl space-y-12 sm:space-y-16">
          {/* ABOUT US BLOCK */}
          <div className="space-y-4 sm:space-y-5 text-center sm:text-left">
            <TextReveal as="h2" className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F1712] leading-tight">
              {lang === "hi"
                ? "प्राचीन सनातन ज्ञान और आधुनिक प्रगति का पावन समन्वय"
                : "Ancient Wisdom & Modern Progress Working Hand in Hand"}
            </TextReveal>

            <ParagraphReveal className="text-sm sm:text-base md:text-lg text-[#3E3129] leading-relaxed space-y-4 pt-1 font-normal">
              <p>
                {lang === "hi" ? (
                  <>
                    <strong>नमो भगवते वासुदेवाय ट्रस्ट</strong> की स्थापना वर्ष २०१९ में <strong>पूज्य साध्वी विजेषानंद सरस्वती जी</strong> द्वारा एक पावन और सुदृढ़ विश्वास के साथ की गई थी: <em>प्राचीन ज्ञान और आधुनिक प्रगति परस्पर विरोधी नहीं, बल्कि एक सशक्त समाज के निर्माण में एक-दूसरे के पूरक हैं।</em>
                  </>
                ) : (
                  <>
                    <strong>Namo Bhagwate Vasudevaya Foundation</strong> was founded in 2019 by <strong>Pujya Sadhvi Vijeshanand Saraswati Ji</strong> with a simple but powerful belief: <em>ancient wisdom and modern progress are not opposing forces, but partners in building stronger communities.</em>
                  </>
                )}
              </p>
              <p>
                {lang === "hi" ? (
                  <>
                    हमारा नाम श्रीमद्भगवद्गीता के पावन मंगलाचरण से प्रेरित है, जो हमें सदैव यह स्मरण कराता है कि हमारा प्रत्येक कर्म स्वयं से परे, समाज और परमात्मा की सेवा में समर्पित है। यही पावन भावना हमारे चार मुख्य सेवा स्तंभों का आधार है: <strong>आध्यात्मिक शिक्षा, महिला सशक्तिकरण, युवा विकास और किसान कल्याण।</strong>
                  </>
                ) : (
                  <>
                    Our name draws from the opening invocation of the Bhagavad Gita, serving as a reminder that every action we take is offered in service of something larger than ourselves. It is this spirit that guides our work across four pillars: <strong>spiritual education, women’s empowerment, youth empowerment, and farmer welfare.</strong>
                  </>
                )}
              </p>
            </ParagraphReveal>
          </div>

          {/* OUR MISSION BLOCK */}
          <div className="space-y-4 sm:space-y-5 text-center sm:text-left">
            <TextReveal as="h2" className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F1712] leading-tight">
              {lang === "hi"
                ? "आंतरिक सामर्थ्य और व्यावहारिक अवसरों का संगम"
                : "Real Empowerment When Inner Strength Meets Real Opportunity"}
            </TextReveal>

            <ParagraphReveal className="text-sm sm:text-base md:text-lg text-[#3E3129] leading-relaxed space-y-4 pt-1 font-normal">
              <p>
                {lang === "hi" ? (
                  <>
                    हमारी यात्रा एक केंद्रित उद्देश्य के साथ आरंभ हुई: विद्यालयों व सामुदायिक कार्यक्रमों के माध्यम से नन्हे बच्चों को श्रीमद्भगवद्गीता की शिक्षाओं से जोड़ना और आजीवन मानसिक शांति व एकाग्रता के साधन के रूप में ध्यान का परिचय देना।
                  </>
                ) : (
                  <>
                    We began with a focused mission: bringing the teachings of the Bhagavad Gita to young children through schools and community programs and introducing them to meditation as a tool for lifelong wellness and clarity of mind.
                  </>
                )}
              </p>
              <p>
                {lang === "hi" ? (
                  <>
                    समय के साथ, हमारा सेवा कार्य उन समुदायों की व्यावहारिक आवश्यकताओं को पूरा करने के लिए विस्तारित हुआ जिनकी हम सेवा करते हैं। आज हम वित्तीय स्वतंत्रता प्राप्त करने वाली महिलाओं, नए कौशल व आत्मविश्वास विकसित करने वाले युवाओं, और आधुनिक कृषि ज्ञान के माध्यम से पैदावार बढ़ाने वाले गन्ना किसानों के साथ सीधे काम कर रहे हैं।
                  </>
                ) : (
                  <>
                    Over time, our work has grown to meet the practical needs of the communities we serve. Today, we work directly with women building financial independence, young people developing skills and confidence, and farmers, particularly sugarcane growers, improving yields through modern agricultural knowledge.
                  </>
                )}
              </p>
              <p className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7D8C8] shadow-xs italic text-[#2B201A] font-serif">
                {lang === "hi" ? (
                  <>
                    “जो बच्चा ध्यान के माध्यम से स्थिरता सीखता है, वह जीवन के दबावों का सामना करने में सक्षम वयस्क बनता है। जो महिला कौशल और स्वावलंबन से सम्पन्न होती है, वह अपने पूरे परिवार की संबल बनती है। और जो किसान आधुनिक तकनीकों से सशक्त होता है, वह न केवल बेहतर फसल उगाता है बल्कि उसी भूमि पर अगली पीढ़ी के लिए उज्ज्वल भविष्य भी गढ़ता है।”
                  </>
                ) : (
                  <>
                    “What connects all of this is a single conviction: real empowerment happens when inner strength meets practical opportunity. A child who learns stillness through meditation grows into an adult equipped to handle life’s pressures. A woman equipped with financial and vocational skills becomes an anchor for her family. A farmer equipped with modern techniques builds not just a better harvest, but a better future for the next generation on that same land.”
                  </>
                )}
              </p>
            </ParagraphReveal>
          </div>
        </div>
      </SectionReveal>

      {/* 3. SACRED TEMPLE BRAND STATEMENT BANNER (RECREATED DIRECTLY FROM LIVE SITE REFERENCE) */}
      <section className="relative overflow-hidden py-20 sm:py-28 md:py-36 border-y border-[#E7D8C8] flex items-center justify-center">
        {/* Divine Background Temple Landscape */}
        <ParallaxImage offset={45} className="absolute inset-0 z-0">
          <Image
            src="/images/about-temple-quote-bg.jpg"
            alt="Sacred Vedic Temple Skyline and Golden Sky"
            fill
            unoptimized
            className="object-cover object-center"
          />
          {/* Subtle warm wash for readability */}
          <div className="absolute inset-0 bg-[#FBF2E7]/30 backdrop-blur-[0.5px]" />
        </ParallaxImage>

        {/* Floating Quote Card */}
        <div className="relative z-10 page-container max-w-5xl text-center px-4 sm:px-6">
          <div className="inline-block px-3 py-1 rounded-full bg-white/80 border border-[#B8893E]/40 text-[#8C5E1A] text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-4 shadow-xs">
            {lang === "hi" ? "हमारा मूल भाव" : "FOUNDATION ETHOS"}
          </div>

          <ParagraphReveal yOffset={25}>
            <blockquote className="font-editorial text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-[#2B201A] font-bold leading-relaxed tracking-tight drop-shadow-xs max-w-5xl mx-auto">
              {lang === "hi" ? (
                <>
                  “हम हृदय से शिक्षकों, विचारकों और कर्मठ समाजसेवियों का एक परिवार हैं —<br className="hidden md:inline" />
                  जो गाँव-गाँव, विद्यालय-विद्यालय और परिवार-परिवार जाकर सेवा कार्य कर रहे हैं।”
                </>
              ) : (
                <>
                  “We are, at heart, a foundation of teachers, practitioners and community builders<br className="hidden md:inline" />
                  working village by village, school by school, and family by family.”
                </>
              )}
            </blockquote>
          </ParagraphReveal>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E86F1D]" />
            <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#3E3129]/80">
              {lang === "hi" ? "नमो भगवते वासुदेवाय ट्रस्ट" : "Namo Bhagwate Vasudevaya Foundation"}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E86F1D]" />
          </div>
        </div>
      </section>

      {/* 4. MISSION STATEMENT (CLEAN & DIGNIFIED MINIMALIST PRESENTATION) */}
      <SectionReveal className="py-14 sm:py-20 bg-[#FFFDF9] border-b border-[#E7D8C8]">
        <div className="page-container max-w-5xl text-center space-y-4">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#1F1712]">
            {lang === "hi" ? "मिशन संकल्प" : "MISSION STATEMENT"}
          </p>

          <TextReveal as="h3" className="font-editorial text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-[#E86F1D] font-bold leading-relaxed px-4 max-w-5xl mx-auto">
            {lang === "hi" ? (
              <>
                “मन को संस्कारित व सशक्त बनाना, समाज का उत्थान करना<br className="hidden md:inline" />
                और प्रत्येक कर्म को श्रीमद्भगवद्गीता के शाश्वत ज्ञान से सिंचित करना।”
              </>
            ) : (
              <>
                “To nurture the mind, uplift the community, and root every action<br className="hidden md:inline" />
                in the timeless wisdom of the Bhagavad Gita.”
              </>
            )}
          </TextReveal>

          <div className="pt-2">
            <span className="inline-block w-16 h-1 rounded-full bg-[#E86F1D]" />
          </div>
        </div>
      </SectionReveal>

      {/* 5. WE ARE COMMITTED TO (4 PILLAR MODULES FAITHFULLY MATCHING ORIGINAL SITE) */}
      <SectionReveal className="py-16 sm:py-24 bg-[#FBF6EE]">
        <div className="page-container space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <TextReveal as="h2" className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider text-[#1F1712]">
              {lang === "hi" ? "हम समर्पित हैं" : "WE ARE COMMITTED TO"}
            </TextReveal>
            <p className="text-sm sm:text-base text-[#3E3129]/80 font-medium">
              {lang === "hi"
                ? "हमारी संपूर्ण सेवा यात्रा चार मूलभूत स्तंभों पर आधारित है"
                : "Our entire community service operates through four foundational pillars"}
            </p>
          </div>

          {/* Cards Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {commitmentCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <StaggerItem key={card.id} className="h-full">
                  <div className="bg-white rounded-3xl border border-[#E7D8C8] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-full">
                    {/* Card Header & Content */}
                    <div className="p-6 sm:p-8 space-y-5">
                      {/* Saffron Emblem & Title */}
                      <div className="flex items-start gap-4">
                        {/* Signature circular saffron emblem from original site */}
                        <div className="w-12 h-12 rounded-full bg-[#E86F1D] flex items-center justify-center shrink-0 shadow-sm text-white">
                          <IconComponent className="w-6 h-6 stroke-[2]" />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#E86F1D]">
                            {lang === "hi" ? card.badgeHi : card.badge}
                          </span>
                          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1F1712] uppercase tracking-wide">
                            {lang === "hi" ? card.titleHi : card.title}
                          </h3>
                        </div>
                      </div>

                      {/* Description Paragraph */}
                      <p className="text-sm sm:text-base text-[#3E3129] leading-relaxed">
                        {lang === "hi" ? card.descHi : card.desc}
                      </p>

                      {/* Specific Action Points */}
                      <div className="pt-2 space-y-2 border-t border-[#F2E5D5]">
                        {card.points.map((pt, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2 text-xs sm:text-sm text-[#4E3E33]">
                            <CheckCircle2 className="w-4 h-4 text-[#2F5A43] shrink-0 mt-0.5" />
                            <span>{lang === "hi" ? pt.hi : pt.en}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Real Photograph at bottom (Framed cleanly) */}
                    <div className="p-4 sm:p-6 pt-0">
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[#E7D8C8]">
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          <div className="text-center pt-2">
            <Link
              href="/initiatives"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#2B201A] hover:bg-[#3D2C24] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              <span>{lang === "hi" ? "सभी सेवा प्रकल्प विस्तार से देखें" : "Explore All Trust Initiatives"}</span>
            </Link>
          </div>
        </div>
      </SectionReveal>

      {/* 6. CLOSING GOLDEN WALK LANDSCAPE BANNER */}
      <section className="relative overflow-hidden py-24 sm:py-32 border-t border-[#E7D8C8] flex items-center justify-center">
        {/* Landscape Banner Artwork */}
        <ParallaxImage offset={40} className="absolute inset-0 z-0">
          <Image
            src="/images/about-closing-walk.jpg"
            alt="Rural family and farmers walking into golden horizon"
            fill
            unoptimized
            className="object-cover object-bottom"
          />
          {/* Subtle gradient scrim for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </ParallaxImage>

        {/* Content */}
        <div className="relative z-10 page-container max-w-3xl text-center px-4 text-white space-y-6">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#F3A847]">
            {lang === "hi" ? "समग्र समाज उत्थान का संकल्प" : "WALKING TOGETHER FOR HUMANITY"}
          </p>

          <ParagraphReveal yOffset={25}>
            <p className="font-editorial text-lg sm:text-2xl md:text-3xl text-white font-medium leading-relaxed drop-shadow-md">
              {lang === "hi"
                ? "“इन निरंतर प्रयासों के माध्यम से, नमो भगवते वासुदेवाय ट्रस्ट एक ऐसे समाज के निर्माण के लिए समर्पित है जहाँ सनातन मूल्य और आधुनिक क्षमताएँ साथ-साथ आगे बढ़ें — हर बच्चे, हर महिला, हर युवा और हर किसान के जीवन को छूते हुए।”"
                : "“Through these efforts, Namo Bhagwate Vasudevaya Foundation strives to build a society where ancient values and modern capability walk hand in hand — one child, one woman, one young person, and one farmer at a time.”"}
            </p>
          </ParagraphReveal>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openDonateModal("General Seva")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>{lang === "hi" ? "सेवा में सहयोग करें" : "Support Our Seva"}</span>
            </button>
            <Link
              href="/membership"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-neutral-100 text-[#2B201A] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all text-center"
            >
              <span>{lang === "hi" ? "ट्रस्ट के सदस्य बनें" : "Become a Member"}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
