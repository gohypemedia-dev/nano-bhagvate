"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Sprout,
  HeartPulse,
  Trees,
  Shield,
  Medal,
  Scale,
  HeartHandshake,
  Heart,
  Sun,
  Flame,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function FounderPage() {
  const { lang, openDonateModal } = useApp();

  const commitmentAreas = [
    {
      title: "Spiritual Education and Value-Based Learning",
      titleHi: "आध्यात्मिक शिक्षा एवं मूल्य-आधारित शिक्षण",
      icon: GraduationCap,
    },
    {
      title: "Women’s Empowerment",
      titleHi: "महिला सशक्तिकरण एवं स्वावलंबन",
      icon: Users,
    },
    {
      title: "Youth Development",
      titleHi: "युवा विकास एवं मार्गदर्शन",
      icon: Flame,
    },
    {
      title: "Farmer Welfare",
      titleHi: "किसान कल्याण एवं संवर्धन",
      icon: Sprout,
    },
    {
      title: "Health Awareness and Community Well-being",
      titleHi: "स्वास्थ्य जागरूकता एवं जन कल्याण",
      icon: HeartPulse,
    },
    {
      title: "Yoga and Meditation",
      titleHi: "योग साधना एवं दैनिक ध्यान",
      icon: Sun,
    },
    {
      title: "Environmental Conservation",
      titleHi: "पर्यावरण संरक्षण एवं प्रकृति संवर्धन",
      icon: Trees,
    },
    {
      title: "Police Welfare",
      titleHi: "पुलिस परिवार कल्याण एवं सुरक्षा सहयोग",
      icon: Shield,
    },
    {
      title: "Respect and Support for Armed Forces Personnel",
      titleHi: "सशस्त्र बल के जवानों व परिवारों का सम्मान व सहयोग",
      icon: Medal,
    },
    {
      title: "Legal Awareness",
      titleHi: "विधिक जागरूकता एवं सामाजिक सहायता",
      icon: Scale,
    },
    {
      title: "Humanitarian Service for the Underprivileged",
      titleHi: "वंचित एवं निर्बल वर्ग के लिए मानवीय सेवा",
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="w-full space-y-0 text-[#2B201A] font-sans">
      {/* 1. HERO SECTION (PANORAMIC ON DESKTOP, 100VH ON MOBILE & LAPTOP) */}
      <section className="relative overflow-hidden bg-[#1F150E] md:bg-[#F7EDE1] border-b border-[#E7D8C8] min-h-[calc(100vh-68px)] sm:min-h-[calc(100vh-74px)] min-[1000px]:min-h-[calc(100vh-76px)] xl:min-h-[calc(100vh-82px)] md:flex md:items-center">
        {/* Desktop Panoramic Background Banner (hidden on mobile) */}
        <div className="hidden md:block absolute inset-0 z-0">
          <Image
            src="/images/founder-hero-banner.png"
            alt="Pujya Sadhvi Vijeshanand Saraswati Ji - Founder"
            fill
            priority
            unoptimized
            className="object-cover object-right lg:object-center"
          />
          {/* Clean Gradient on Desktop: provides solid readable text background on left while leaving Sadhvi Ji 100% crisp and clear on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7EDE1] via-[#F7EDE1] via-[40%] to-transparent to-[52%] pointer-events-none" />
        </div>

        {/* MOBILE HERO (100VH Full Viewport Height with Bottom Overlay) */}
        <div className="md:hidden relative z-1 w-full h-[calc(100vh-68px)] min-h-[540px] flex items-center justify-center overflow-hidden">
          <Image
            src="/images/founder-mobile-hero.png"
            alt="Pujya Sadhvi Vijeshanand Saraswati Ji - Founder"
            fill
            priority
            unoptimized
            className="w-full h-full object-cover object-top block select-none pointer-events-none"
          />

          {/* Mobile Overlay Action Bar */}
          <div className="absolute bottom-0 inset-x-0 z-20 w-full px-4 pt-16 pb-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col items-center gap-2 text-center pointer-events-auto">
            <h2 className="font-editorial text-sm sm:text-base font-extrabold text-white tracking-wide leading-tight drop-shadow-md">
              {lang === "hi" ? "पूज्य साध्वी विजेशानंद सरस्वती जी" : "Pujya Sadhvi Vijeshanand Saraswati Ji"}
            </h2>
            <div className="flex items-center justify-center gap-2.5 w-full max-w-xs pt-1">
              <a
                href="#founder-story"
                className="flex-1 py-2 px-3 rounded-lg bg-[#E86F1D] text-white font-bold text-xs uppercase tracking-wider text-center shadow-md active:scale-95 transition-transform"
              >
                {lang === "hi" ? "जीवन यात्रा" : "Biography"}
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
            <h1 className="font-editorial text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F1712] leading-[1.12] tracking-tight">
              {lang === "hi" ? (
                <>
                  पूज्य साध्वी विजेशानंद <br />
                  <span className="text-[#E86F1D]">सरस्वती जी</span>
                </>
              ) : (
                <>
                  Founder & Spiritual Guide <br />
                  <span className="text-[#E86F1D]">Pujya Sadhvi Vijeshanand Saraswati Ji</span>
                </>
              )}
            </h1>

            {/* Subtitle matching exact reference text */}
            <p className="text-sm sm:text-base md:text-lg text-[#3E3129] leading-relaxed font-sans font-medium">
              {lang === "hi"
                ? "निःस्वार्थ सेवा और आध्यात्मिक नेतृत्व के माध्यम से श्रीमद्भगवद्गीता के शाश्वत ज्ञान के प्रसार के लिए समर्पित। वह मानवता की सेवा करते हुए धर्म, करुणा और निःस्वार्थ कर्म अपनाने के लिए जन-जन को प्रेरित करती हैं।"
                : "Dedicated to spreading the timeless wisdom of the Bhagavad Gita through selfless service and spiritual leadership. She inspires people to embrace Dharma, compassion, and selfless action while serving humanity."}
            </p>

            {/* Trust Points / Micro Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-[#2B201A]/85 font-semibold">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white/70 backdrop-blur-xs border border-[#E7D8C8] text-[11px] sm:text-xs">
                <Sun className="w-3.5 h-3.5 text-[#E86F1D]" />
                {lang === "hi" ? "गीता ज्ञान एवं साधना" : "Bhagavad Gita Wisdom"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white/70 backdrop-blur-xs border border-[#E7D8C8] text-[11px] sm:text-xs">
                <HeartHandshake className="w-3.5 h-3.5 text-[#2F5A43]" />
                {lang === "hi" ? "मानव सेवा ही माधव सेवा" : "Selfless Seva to Humanity"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white/70 backdrop-blur-xs border border-[#E7D8C8] text-[11px] sm:text-xs">
                <Heart className="w-3.5 h-3.5 text-[#E86F1D]" />
                {lang === "hi" ? "स्थापना २०१९" : "Established in 2019"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-4">
              <a
                href="#founder-story"
                className="inline-flex items-center justify-center px-6 sm:px-7 py-3.5 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>{lang === "hi" ? "जीवन यात्रा व दर्शन जानें" : "Read Life Journey & Philosophy"}</span>
              </a>
              <button
                type="button"
                onClick={() => openDonateModal()}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-white/80 hover:bg-white text-[#2B201A] font-bold text-xs sm:text-sm uppercase tracking-wider border border-[#E7D8C8] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span>{lang === "hi" ? "सेवा मिशन में सहयोग करें" : "Support Her Mission"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUTHENTIC FOUNDER NARRATIVE: "NAMO BHAGWATE VASUDEVAYA TRUST" */}
      <section className="py-14 sm:py-20 bg-[#FBF6EE]" id="founder-story">
        <div className="page-container max-w-5xl lg:max-w-6xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider text-[#1F1712]">
              {lang === "hi" ? "नमो भगवते वासुदेवाय ट्रस्ट" : "NAMO BHAGWATE VASUDEVAYA TRUST"}
            </h2>
            <div className="w-16 h-1 bg-[#E86F1D] mx-auto rounded-full" />
          </div>

          <div className="bg-white rounded-3xl border border-[#E7D8C8] p-6 sm:p-10 md:p-12 shadow-sm space-y-6 text-sm sm:text-base md:text-lg text-[#3E3129] leading-relaxed font-normal">
            <p>
              {lang === "hi" ? (
                <>
                  <strong>पूज्य साध्वी विजेषानंद सरस्वती जी</strong> एक प्रतिष्ठित आध्यात्मिक मार्गदर्शिका, समाजसेविका और श्रीमद्भगवद्गीता की प्रेरणादायी प्रचारक हैं। उन्होंने अपना संपूर्ण जीवन भगवान श्री कृष्ण की पावन भक्ति, मानवता की सेवा और भारत के शाश्वत आध्यात्मिक ज्ञान व सांस्कृतिक धरोहर के संरक्षण एवं संवर्धन के लिए समर्पित किया है।
                </>
              ) : (
                <>
                  <strong>Pujya Sadhvi Vijeshanand Saraswati Ji</strong> is a revered spiritual teacher, humanitarian, and an inspiring exponent of the Bhagavad Gita. She has dedicated her life to the devotion of Lord Shri Krishna, the service of humanity, and the preservation and promotion of India’s timeless spiritual wisdom and cultural heritage.
                </>
              )}
            </p>

            <p>
              {lang === "hi" ? (
                <>
                  उनकी आध्यात्मिक यात्रा अत्यंत बाल्यकाल से आरंभ हुई। जब वे पाँचवीं कक्षा में थीं, तभी उन्हें पवित्र <em>“ॐ नमो भगवते वासुदेवाय”</em> महामंत्र का निरंतर जप करने की पावन प्रेरणा प्राप्त हुई। उस क्षण से लेकर आज तक यह दिव्य मंत्र उनके जीवन और साधना का मूल आधार बना हुआ है। वर्षों की अनन्य निष्ठा, भक्ति और ध्यान साधना से यह महामंत्र उनकी हर सांस में समा चुका है, जो उन्हें असीम आंतरिक शांति, आत्मबल और ईश्वरीय मार्गदर्शन प्रदान करता है।
                </>
              ) : (
                <>
                  Her spiritual journey began at a very young age. While studying in the fifth grade, she was inspired to begin chanting the sacred <em>“Om Namo Bhagwate Vasudevaya”</em> Mahamantra. Since that moment, the divine mantra has remained the foundation of her life and spiritual practice. Through years of unwavering devotion and meditation, she believes the Mahamantra has become one with every breath she takes, serving as an eternal source of inner peace, strength, and divine guidance.
                </>
              )}
            </p>

            <p>
              {lang === "hi" ? (
                <>
                  साध्वी जी अपने जीवन की प्रत्येक उपलब्धि को केवल और केवल भगवान श्री कृष्ण की असीम कृपा मानती हैं। वे कभी स्वयं को किसी कार्य का कर्ता नहीं मानतीं; अपितु स्वयं को प्रभु के पावन कार्य का एक विनम्र साधन मानती हैं। उनके शब्दों में, नमो भगवते वासुदेवाय ट्रस्ट केवल एक संस्था नहीं, बल्कि भगवान श्री कृष्ण की प्रेरणा और करुणा से स्थापित एक पवित्र वरदान है।
                </>
              ) : (
                <>
                  Sadhvi Ji attributes every achievement in her life solely to the infinite grace of Lord Shri Krishna. She never regards herself as the source of any accomplishment; instead, she considers herself a humble instrument in His divine mission. In her words, the Namo Bhagwate Vasudevaya Trust is not merely an organization, but a sacred blessing established through the inspiration and compassion of Lord Krishna.
                </>
              )}
            </p>

            <p>
              {lang === "hi" ? (
                <>
                  यह अनुभव करते हुए कि आध्यात्मिकता की सर्वोच्च अभिव्यक्ति निःस्वार्थ लोकसेवा में ही निहित है, उन्होंने अपने जीवन के मिशन को व्यक्तिगत साधना से आगे बढ़ाकर समाज के कल्याण से जोड़ा। श्रीमद्भगवद्गीता के पावन संदेशों को जन-जन तक पहुँचाने, नैतिक संस्कारों का पोषण करने और समाज के हर वर्ग की सेवा करने के पावन संकल्प के साथ उन्होंने <strong>वर्ष २०१९ में नमो भगवते वासुदेवाय ट्रस्ट</strong> की स्थापना की।
                </>
              ) : (
                <>
                  Recognizing that spirituality finds its highest expression through selfless service, she expanded her life’s mission beyond personal spiritual practice. With a vision to spread the eternal teachings of the Bhagavad Gita, promote moral values, and serve every section of society, she founded the <strong>Namo Bhagwate Vasudevaya Trust in 2019</strong>.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 3. HER PHILOSOPHY BANNER (SACRED SCRIPTURE & JAPA MALA BACKGROUND) */}
      <section className="relative overflow-hidden py-20 sm:py-28 md:py-36 border-y border-[#E7D8C8] flex items-center justify-center">
        {/* Sacred Still-Life Artwork */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/founder-philosophy-bg.jpg"
            alt="Sacred Bhagavad Gita Scripture and Rudraksha Japa Mala"
            fill
            unoptimized
            className="object-cover object-center"
          />
          {/* Subtle warm overlay for readability */}
          <div className="absolute inset-0 bg-[#2B201A]/70 backdrop-blur-[0.5px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 page-container max-w-3xl text-center px-6 text-white space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[#FFA052] text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] shadow-xs">
            {lang === "hi" ? "साध्वी जी का जीवन दर्शन" : "HER PHILOSOPHY"}
          </div>

          <p className="text-xs sm:text-sm font-medium tracking-wide text-white/80">
            {lang === "hi" ? "उनका जीवन दर्शन इन पावन शब्दों में प्रतिबिंबित होता है:" : "Her philosophy is beautifully reflected in these words:"}
          </p>

          <blockquote className="font-editorial text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed tracking-tight text-white drop-shadow-md">
            {lang === "hi"
              ? "“चिंता में मत जियो — धर्मसम्मत कर्म में जियो। प्रत्येक विचार, प्रत्येक शब्द और प्रत्येक कर्म ईश्वर की दृष्टि में है। जब हमारे कर्म निष्काम और पवित्र होते हैं, तो हमारा भविष्य स्वतः ही उज्ज्वल हो जाता है।”"
              : "“Do not live in worry — live through righteous action. Every thought, every word, and every deed is witnessed by the Divine. When our actions are pure, our future naturally becomes bright.”"}
          </blockquote>

          <div className="pt-2">
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#FFA052] uppercase">
              — {lang === "hi" ? "पूज्य साध्वी विजेशानंद सरस्वती जी" : "Pujya Sadhvi Vijeshanand Saraswati Ji"}
            </span>
          </div>
        </div>
      </section>

      {/* 4. BHAGAVAD GITA & KARMA YOGA IN PRACTICE (SACRED RIVER GHAT SEVA BANNER) */}
      <section className="relative overflow-hidden py-20 sm:py-28 md:py-36 border-b border-[#E7D8C8] flex items-center justify-center">
        {/* Sacred River Ghat Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/founder-karma-bg.jpg"
            alt="Sacred River Ghat at Sunrise - Nishkama Karma Yoga"
            fill
            unoptimized
            className="object-cover object-center"
          />
          {/* Warm Dark Scrim for Perfect Typography Legibility */}
          <div className="absolute inset-0 bg-[#1A120B]/75 backdrop-blur-[0.5px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 page-container max-w-4xl text-center px-6 text-white space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[#E86F1D]/30 border border-[#E86F1D]/50 text-[#FFA052] text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em]">
            {lang === "hi" ? "कर्मण्येवाधिकारस्ते • निष्काम सेवा" : "KARMA YOGA & NISHKAMA SEVA"}
          </div>

          <p className="font-editorial text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed tracking-tight drop-shadow-md text-[#FFFDF9]">
            {lang === "hi" ? (
              <>
                साध्वी जी जन-जन को श्रीमद्भगवद्गीता के शाश्वत सिद्धांतों—<strong>कर्मयोग</strong> (निष्काम कर्म), <strong>सेवा</strong> (बिना किसी अपेक्षा के समर्पण), भक्ति, सत्य, करुणा, विनम्रता और सार्वभौमिक प्रेम को जीवन में उतारने की प्रेरणा देती हैं। उनका विश्वास है कि जब प्रत्येक कर्म श्रद्धा और पवित्रता के साथ प्रभु को अर्पित किया जाता है, तो जीवन में स्वाभाविक रूप से शांति, संतुलन, संतोष और चिरस्थायी आनंद खिल उठता है।
              </>
            ) : (
              <>
                Sadhvi Ji encourages people to embrace the timeless principles of the Bhagavad Gita—<strong>Karma Yoga</strong> (selfless action), <strong>Nishkama Seva</strong> (service without expectation), devotion, truth, compassion, humility, and universal love. She believes that when every action is offered to God with sincerity and faith, life naturally blossoms into peace, balance, fulfillment, and lasting happiness.
              </>
            )}
          </p>

          <p className="text-sm sm:text-base text-white/85 max-w-2xl mx-auto font-sans leading-relaxed">
            {lang === "hi"
              ? "उनके दूरदर्शी नेतृत्व में नमो भगवते वासुदेवाय ट्रस्ट सार्थक सामाजिक और आध्यात्मिक परिवर्तन का एक पावन मंच बन चुका है, जिसके सेवा कार्य समाज के विभिन्न महत्वपूर्ण क्षेत्रों में सक्रिय हैं:"
              : "Under her visionary leadership, the Trust has become a platform for meaningful social and spiritual transformation. Its initiatives span a wide range of areas, including:"}
          </p>
        </div>
      </section>

      {/* 5. OUR COMMITMENT TO SOCIETY (11 SEVA AREAS EXACTLY MATCHING ORIGINAL SITE) */}
      <section className="py-16 sm:py-24 bg-[#FBF6EE]">
        <div className="page-container space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider text-[#1F1712]">
              {lang === "hi" ? "समाज के प्रति हमारा संकल्प" : "OUR COMMITMENT TO SOCIETY"}
            </h2>
            <div className="w-16 h-1 bg-[#E86F1D] mx-auto rounded-full" />
          </div>

          {/* 11 Commitment Cards Grid with Signature Saffron Circle Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {commitmentAreas.map((area, idx) => {
              const IconComp = area.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-[#E7D8C8] shadow-xs hover:shadow-md hover:border-[#E86F1D] transition-all duration-300 flex items-center gap-4 group"
                >
                  {/* Signature Orange Circle Emblem */}
                  <div className="w-12 h-12 rounded-full bg-[#E86F1D] flex items-center justify-center shrink-0 shadow-sm text-white group-hover:scale-105 transition-transform">
                    <IconComp className="w-6 h-6 stroke-[2]" />
                  </div>

                  <span className="text-sm sm:text-base font-semibold text-[#1F1712] leading-snug">
                    {lang === "hi" ? area.titleHi : area.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Concluding Founder Bio Paragraphs from Live Site */}
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E7D8C8] p-6 sm:p-10 md:p-12 space-y-5 text-sm sm:text-base md:text-lg text-[#3E3129] leading-relaxed shadow-xs">
            <p>
              {lang === "hi" ? (
                <>
                  उनका स्वयं का जीवन उन आदर्शों को जीवंत करता है जिनकी वे शिक्षा देती हैं—सरलता, अनुशासन, विनम्रता, करुणा और प्रभु में अटूट निष्ठा। वे मानती हैं कि वास्तविक समृद्धि भौतिक संपत्ति में नहीं, बल्कि चरित्र की पवित्रता, ईश्वर में दृढ़ विश्वास, निःस्वार्थ सेवा और स्नेह व करुणा से भरे हृदय में है।
                </>
              ) : (
                <>
                  Her own life reflects the ideals she teaches—simplicity, discipline, humility, compassion, and unwavering devotion. She believes that true prosperity is not measured by material possessions, but by purity of character, steadfast faith in God, selfless service, and a heart filled with kindness and love.
                </>
              )}
            </p>

            <p>
              {lang === "hi" ? (
                <>
                  आज साध्वी विजेषानंद सरस्वती जी पावन <em>“ॐ नमो भगवते वासुदेवाय”</em> महामंत्र और श्रीमद्भगवद्गीता के सार्वभौमिक ज्ञान को भारत के कोने-कोने से लेकर विश्व भर में पहुँचाने के लिए समर्पित हैं। उनका ध्येय संपूर्ण मानवता को प्रेम, शांति, सद्भाव, धर्म और निःस्वार्थ सेवा पर आधारित जीवन जीने के लिए प्रेरित करना है, जिससे एक करुणामय और आध्यात्मिक रूप से जागृत विश्व का निर्माण हो सके।
                </>
              ) : (
                <>
                  Today, Sadhvi Vijeshanand Saraswati Ji is devoted to carrying the sacred <em>“Om Namo Bhagwate Vasudevaya”</em> Mahamantra and the universal wisdom of the Bhagavad Gita from India to every corner of the world. Her vision is to inspire humanity to embrace a life founded on love, peace, harmony, righteousness, and selfless service, thereby contributing to a more compassionate and spiritually awakened global society.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 6. HER LIFE MESSAGE */}
      <section className="py-16 sm:py-24 bg-[#FAF3EA] border-t border-[#E7D8C8]">
        <div className="page-container max-w-4xl text-center space-y-6">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#E86F1D]">
            {lang === "hi" ? "उनका जीवन संदेश" : "HER LIFE MESSAGE"}
          </p>

          <blockquote className="font-editorial text-xl sm:text-2xl md:text-3xl text-[#1F1712] font-semibold leading-relaxed px-4">
            {lang === "hi"
              ? "“भगवान श्री कृष्ण में अपनी अटूट निष्ठा रखो। अपने कर्मों को पवित्र और निःस्वार्थ बनाओ। अपने माता-पिता, गुरुओं और बड़ों का सदैव आदर करो। अपने तन और मन को अनुशासन व ज्ञान से संस्कारित करो। जीवन में जहाँ भी रहो—प्रेम, करुणा, सेवा और आशा का प्रकाश फैलाओ, क्योंकि यही सनातन धर्म का सार है और यही वास्तविक आत्म-साक्षात्कार का मार्ग है।”"
              : "“Place your unwavering faith in Lord Shri Krishna. Let your actions be pure and selfless. Honor your parents, teachers, and elders. Nurture both your body and mind with discipline and wisdom. Wherever life takes you, spread love, kindness, service, and hope—for this is the essence of Dharma, and this is the path of true spiritual realization.”"}
          </blockquote>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => openDonateModal("Founder's Vision Seva")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>{lang === "hi" ? "साध्वी जी के संकल्प में सहयोग करें" : "Support Her Vision"}</span>
            </button>
            <Link
              href="/membership"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-neutral-50 text-[#2B201A] font-bold text-xs sm:text-sm uppercase tracking-wider border border-[#E7D8C8] shadow-sm active:scale-95 transition-all text-center"
            >
              <span>{lang === "hi" ? "ट्रस्ट से जुड़ें" : "Join the Mission"}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
