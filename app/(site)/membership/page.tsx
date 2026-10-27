"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Shield, Heart, Users, BookOpen, Check, ShieldCheck, ArrowRight, HandHeart, Award, CheckCircle2, Scroll } from "lucide-react";
import { useApp } from "@/context/AppContext";
import MemberCarousel from "@/components/MemberCarousel";
import { MEMBERSHIP_PLANS, findPlan, formatINR } from "@/lib/donation-config";
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
import {
  sanitizeEmail,
  sanitizeMobile,
  sanitizeName,
  validateEmail,
  validateMobile,
  validateName,
} from "@/lib/validation/donation";

export default function MembershipPage() {
  const { lang, openDonateModal } = useApp();
  const [planId, setPlanId] = useState<string>(MEMBERSHIP_PLANS[0].id);
  const [activeFlipCard, setActiveFlipCard] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const tiers = [
    {
      name: "Membership",
      nameHi: "साधारण सदस्यता",
      price: 1100,
      period: findPlan("basic")!.period,
      periodHi: "प्रति वर्ष",
      desc: findPlan("basic")!.description,
      descHi: "सेवा और आध्यात्मिक ज्ञान की पावन यात्रा शुरू करने वाले भक्तों के लिए आदर्श।",
      features: findPlan("basic")!.benefits,
      featuresHi: [
        "वार्षिक ट्रस्ट सदस्यता प्रमाणपत्र",
        "मासिक आध्यात्मिक समाचार पत्र एवं ई-पुस्तकें",
        "वार्षिक आध्यात्मिक सम्मेलन में आमंत्रण",
        "प्रत्यक्ष सेवा में सहभागिता के अवसर",
      ],
      highlight: false,
      cardStyle: "bg-[#FFF9F2] border border-[#E7D8C8] shadow-warm-sm hover:border-[#E86F1D]/40 relative",
      badgeText: null,
      badgeTextHi: null,
      badgeStyle: "",
      priceColor: "text-[#E86F1D]",
      checkColor: "text-[#2F5A43]",
      buttonStyle: "btn-outline w-full",
    },
    {
      name: "Silver Membership",
      nameHi: "रजत (सिल्वर) सदस्यता",
      price: 5100,
      period: findPlan("silver")!.period,
      periodHi: "प्रति वर्ष",
      desc: findPlan("silver")!.description,
      descHi: "शिक्षा और स्वास्थ्य शिविरों को प्रायोजित करने के इच्छुक समर्पित भक्तों के लिए।",
      features: findPlan("silver")!.benefits,
      featuresHi: [
        "साधारण सदस्यता के सभी लाभ",
        "१ गुरुकुल विद्यार्थी की शिक्षा का संपूर्ण प्रायोजन",
        "आश्रम से विशेष प्रसाद एवं आशीर्वाद पत्र",
        "भागवत कथा आयोजनों में प्राथमिकता सीटिंग",
      ],
      highlight: false,
      cardStyle: "bg-gradient-to-b from-[#FAFBFD] to-[#EEF1F6] border-2 border-[#C0C7D2] shadow-warm-sm hover:border-[#9AA5B5] relative",
      badgeText: findPlan("silver")!.badge,
      badgeTextHi: "सिल्वर श्रेणी",
      badgeStyle: "bg-[#E2E6ED] text-[#4A5568] border border-[#CBD2DC]",
      priceColor: "text-[#3B4656]",
      checkColor: "text-[#4A5E6D]",
      buttonStyle: "w-full min-h-[48px] px-6 bg-[#E2E6ED] hover:bg-[#D4DAE4] text-[#2D3748] font-bold text-xs uppercase tracking-wider rounded-xl border border-[#CBD2DC] transition-all shadow-sm hover:shadow flex items-center justify-center cursor-pointer",
    },
    {
      name: "Gold Membership",
      nameHi: "स्वर्ण (गोल्ड) सदस्यता",
      price: 11000,
      period: findPlan("gold")!.period,
      periodHi: "प्रति वर्ष",
      desc: findPlan("gold")!.description,
      descHi: "महिला कौशल कार्यशालाओं और किसान मार्गदर्शन को सशक्त बनाने हेतु।",
      features: findPlan("gold")!.benefits,
      featuresHi: [
        "रजत सदस्यता के सभी लाभ",
        "महिला कौशल प्रशिक्षण किट का प्रायोजन",
        "ट्रस्ट सदस्य नामावली में विशेष सम्मान",
        "ट्रस्ट बोर्ड से प्रत्यक्ष सेवा प्रगति अपडेट",
      ],
      highlight: true,
      cardStyle: "bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EA] to-[#FFF3D6] border-2 border-[#D4A359] shadow-warm-md hover:border-[#C68A2E] relative",
      badgeText: findPlan("gold")!.badge,
      badgeTextHi: "सर्वाधिक लोकप्रिय",
      badgeStyle: "bg-gradient-to-r from-[#D48820] to-[#E86F1D] text-white shadow-warm-sm",
      priceColor: "text-[#C67A18]",
      checkColor: "text-[#2F5A43]",
      buttonStyle: "btn-primary w-full",
    },
    {
      name: "Platinum Membership",
      nameHi: "प्लेटिनम सदस्यता",
      price: 51000,
      period: findPlan("platinum")!.period,
      periodHi: "आजीवन / संरक्षक",
      desc: findPlan("platinum")!.description,
      descHi: "ट्रस्ट के वृहद स्वास्थ्य शिविरों व आधारभूत सेवा प्रकल्पों के लिए संरक्षक स्तर।",
      features: findPlan("platinum")!.benefits,
      featuresHi: [
        "आजीवन ट्रस्टी सम्मान एवं सुसज्जित प्रशस्ति पत्र",
        "ग्रामीण स्वास्थ्य शिविर का संपूर्ण प्रायोजन",
        "मंच पर विशिष्ट सम्मान एवं वीआईपी स्थान",
        "आश्रम परिसर में स्थायी नाम पट्टिका",
      ],
      highlight: false,
      cardStyle: "bg-gradient-to-b from-[#F9FAFC] via-[#F2F4F8] to-[#E5E9F0] border-2 border-[#A3AFBF] shadow-warm-sm hover:border-[#8291A5] relative",
      badgeText: findPlan("platinum")!.badge,
      badgeTextHi: "संरक्षक श्रेणी",
      badgeStyle: "bg-[#2B3545] text-white shadow-sm",
      priceColor: "text-[#242C37]",
      checkColor: "text-[#3B4856]",
      buttonStyle: "w-full min-h-[48px] px-6 bg-[#2B3545] hover:bg-[#1E2633] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-warm-sm hover:shadow flex items-center justify-center cursor-pointer",
    },
  ];

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "fullName") {
      const err = validateName(formData.fullName);
      setErrors((prev) => ({ ...prev, fullName: err || undefined }));
    } else if (field === "email") {
      const err = validateEmail(formData.email);
      setErrors((prev) => ({ ...prev, email: err || undefined }));
    } else if (field === "phone") {
      const err = validateMobile(formData.phone, true);
      setErrors((prev) => ({ ...prev, phone: err || undefined }));
    }
  };

  // Registration goes through the same UPI payment flow as the "Join Now" buttons, so the
  // membership is recorded, approved by the Trust and confirmed by email with a certificate.
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = validateName(formData.fullName);
    const emailErr = validateEmail(formData.email);
    const phoneErr = validateMobile(formData.phone, true);

    if (nameErr || emailErr || phoneErr) {
      setErrors({
        fullName: nameErr || undefined,
        email: emailErr || undefined,
        phone: phoneErr || undefined,
      });
      if (nameErr) document.getElementById("mem-fullname")?.focus();
      else if (emailErr) document.getElementById("mem-email")?.focus();
      else if (phoneErr) document.getElementById("mem-phone")?.focus();
      return;
    }

    const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId) ?? MEMBERSHIP_PLANS[0];
    openDonateModal(plan.name, plan.price, true, {
      name: sanitizeName(formData.fullName),
      email: sanitizeEmail(formData.email),
      mobile: sanitizeMobile(formData.phone),
    });
    // The payment popup now holds the details, so clear the form for the next registration.
    setFormData({ fullName: "", email: "", phone: "" });
    setErrors({});
    setTouched({});
  };

  return (
    <div className="w-full space-y-0">
      {/* HERO SECTION - RECREATED FROM REFERENCE (PANORAMIC ON DESKTOP, 100VH ON MOBILE & LAPTOP) */}
      <section className="relative overflow-hidden bg-[#1F150E] md:bg-[#F6EDE2] border-b border-[#E7D8C8] min-h-[calc(100vh-68px)] sm:min-h-[calc(100vh-74px)] min-[1000px]:min-h-[calc(100vh-76px)] xl:min-h-[calc(100vh-82px)] md:flex md:items-center">
        {/* Desktop Panoramic Background Banner (hidden on mobile) */}
        <ParallaxImage offset={45} className="hidden md:block absolute inset-0 z-0">
          <Image
            src="/images/membership-hero-banner.png"
            alt="Together for a Better Tomorrow"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
          {/* Clean Gradient on Desktop: leaves joined hands & temple completely crisp and clear on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6EDE2] via-[#F6EDE2] via-[35%] to-transparent to-[48%] pointer-events-none" />
        </ParallaxImage>

        {/* MOBILE HERO (100VH Full Viewport Height with Bottom Overlay) */}
        <div className="md:hidden relative z-1 w-full h-[calc(100vh-68px)] min-h-[540px] flex items-center justify-center overflow-hidden">
          <ParallaxImage offset={30} className="absolute inset-0 w-full h-full">
            <Image
              src="/images/membership-mobile-hero.png"
              alt="Together for a Better Tomorrow - Namo Bhagwate Vasudevaya"
              fill
              priority
              unoptimized
              className="w-full h-full object-cover object-top block select-none pointer-events-none"
            />
          </ParallaxImage>

          {/* Mobile Overlay Action Bar (Clean gradient at bottom of mobile banner) */}
          <div className="absolute bottom-0 inset-x-0 z-20 w-full px-4 pt-16 pb-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col items-center gap-2 text-center pointer-events-auto">
            <TextReveal as="h2" className="font-editorial text-sm sm:text-base font-extrabold text-white tracking-wide leading-tight drop-shadow-md">
              {lang === "hi" ? "एक बेहतर कल के लिए साथ" : "Together for a Better Tomorrow"}
            </TextReveal>
            <div className="flex items-center justify-center gap-2.5 w-full max-w-xs pt-1">
              <a
                href="#membership-plans"
                className="flex-1 py-2 px-3 rounded-lg bg-[#E86F1D] text-white font-bold text-xs uppercase tracking-wider text-center shadow-md active:scale-95 transition-transform"
              >
                {lang === "hi" ? "योजनाएं देखें" : "View Plans"}
              </a>
              <button
                onClick={() => {
                  const el = document.getElementById("membership-plans");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-white text-[#2B201A] font-bold text-xs uppercase tracking-wider text-center shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <Heart className="w-3 h-3 text-[#E86F1D] fill-current" />
                <span>{lang === "hi" ? "जुड़ें" : "Join Now"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Hero Content (hidden on mobile) */}
        <div className="hidden md:block relative z-10 page-container py-8 sm:py-12 md:py-24 w-full">
          <div className="max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-4 sm:space-y-5">
            {/* Main Title */}
            <TextReveal as="h1" className="font-editorial text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2B201A] leading-[1.18] tracking-tight">
              {lang === "hi" ? (
                <>
                  एक बेहतर कल के लिए <span className="text-[#E86F1D]">साथ</span>
                </>
              ) : (
                <>
                  Together for a <span className="text-[#E86F1D]">Better Tomorrow</span>
                </>
              )}
            </TextReveal>

            {/* Description matching exact reference text */}
            <ParagraphReveal className="text-sm sm:text-base md:text-[15px] text-[#4A3B32] leading-relaxed font-sans font-medium">
              {lang === "hi"
                ? "आइए, एक ऐसे परिवार का हिस्सा बनें जो सेवा, संस्कृति और समाज के सशक्तिकरण में विश्वास रखता है। साथ मिलकर हम एक ऐसे भविष्य का निर्माण कर सकते हैं जहाँ शिक्षा, स्वास्थ्य, गौ सेवा, पर्यावरण संरक्षण और आध्यात्मिक चेतना से सभी का समग्र कल्याण और उत्थान हो सके।"
                : "Come, be a part of a family that believes in service, culture, and the empowerment of society. Together, we can create a future where education, health, cow protection, environmental conservation, and spiritual awareness bring holistic well-being and enlightened prosperity for all."}
            </ParagraphReveal>



            {/* CTA Button */}
            <div className="pt-2 sm:pt-4">
              <a
                href="#membership-plans"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-7 py-3.5 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>{lang === "hi" ? "सदस्यता योजनाएं देखें" : "Explore Membership Plans"}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP TIERS (4 PRICING CARDS - RESPONSIVE 4-col -> 2-col -> 1-col) */}
      <SectionReveal className="section-py" id="membership-plans">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto section-header space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">
              {lang === "hi" ? "सदस्यता श्रेणी चुनें" : "CHOOSE YOUR MEMBERSHIP TIER"}
            </p>
            <TextReveal as="h2" className="font-editorial text-3xl sm:text-4xl font-bold text-[#E86F1D]">
              {lang === "hi" ? "हमारे सेवा परिवार से जुड़ें" : "Join Our Seva Circle"}
            </TextReveal>
            <HeadingDivider className="mt-2" />
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {tiers.map((tier) => (
              <StaggerItem key={tier.name} className="h-full">
                <div
                  className={`rounded-[18px] p-6 flex flex-col justify-between transition-all duration-300 h-full ${tier.cardStyle}`}
                >
                  {tier.badgeText && (
                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full z-10 whitespace-nowrap ${tier.badgeStyle}`}>
                      {lang === "hi" && tier.badgeTextHi ? tier.badgeTextHi : tier.badgeText}
                    </div>
                  )}

                  <div className="card-body space-y-4">
                    <div>
                      <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                        {lang === "hi" ? tier.nameHi : tier.name}
                      </h3>
                      <p className="text-xs text-[#2B201A]/75 mt-1 leading-relaxed">
                        {lang === "hi" && tier.descHi ? tier.descHi : tier.desc}
                      </p>
                    </div>

                    <div className="py-3 border-y border-[#2B201A]/10">
                      <span className={`font-sans text-3xl font-bold tracking-tight ${tier.priceColor}`}>
                        ₹{tier.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-[#2B201A]/60 ml-1.5 font-semibold">
                        INR / {lang === "hi" && tier.periodHi ? tier.periodHi : tier.period}
                      </span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-[#2B201A]/85 font-sans pt-1">
                      {(lang === "hi" && tier.featuresHi ? tier.featuresHi : tier.features).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tier.checkColor}`} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card-action">
                    <button
                      onClick={() => openDonateModal(lang === "hi" ? tier.nameHi : tier.name, tier.price, true)}
                      className={tier.buttonStyle}
                    >
                      {lang === "hi" ? `सदस्यता लें — ₹${tier.price.toLocaleString("en-IN")}` : `Join Now — ₹${tier.price.toLocaleString("en-IN")}`}
                    </button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SectionReveal>

      {/* WHY BECOME A MEMBER (HUMAN-CRAFTED AUTHENTIC DEVOTIONAL DESIGN) */}
      <SectionReveal className="section-py bg-gradient-to-b from-[#FAF3EA] via-[#F7EDE0] to-[#FAF3EA] border-t border-[#E7D8C8] relative">
        {/* Subtle decorative background glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(212,163,89,0.08),transparent_60%)]" />

        <div className="page-container relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto section-header space-y-2 mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E86F1D]/10 border border-[#E86F1D]/20 text-[#D45A0E] text-[11px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E86F1D]" />
              {lang === "hi" ? "आध्यात्मिक संकल्प एवं सेवा" : "SACRED CALLING & SERVICE"}
            </div>
            <TextReveal as="h2" className="font-editorial text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#E86F1D] tracking-tight">
              {lang === "hi" ? "ट्रस्ट की सदस्यता क्यों ग्रहण करें?" : "Why Join Our Seva Parivar?"}
            </TextReveal>
          </div>

          {/* 4 3D FLIP CARDS (MOBILE OPTIMIZED: TAP ON MOBILE / HOVER ON DESKTOP, BALANCED BACK FACE) */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
            {[
              {
                num: "01",
                category: lang === "hi" ? "ज्ञान" : "GNANA",
                badgeColor: "text-[#B8893E]",
                iconBg: "bg-[#E86F1D]/15 text-[#E86F1D]",
                borderColor: "border-[#D4A359]",
                topLine: "bg-gradient-to-r from-[#D48820] to-[#E86F1D]",
                icon: BookOpen,
                image: "/images/card-spiritual-thought.jpg",
                title: lang === "hi" ? "आध्यात्मिक ज्ञान एवं सत्संग" : "Spiritual Enlightenment",
                desc: lang === "hi"
                  ? "पूज्य संतों के सान्निध्य में नियमित श्रीमद्भगवद्गीता स्वाध्याय, वैदिक अनुष्ठान और ऑनलाइन सत्संग से जुड़ें।"
                  : "Deepen your inner journey through live spiritual discourses, Vedic wisdom sessions, and divine satsangs.",
                points: [
                  lang === "hi" ? "मासिक विशेष ऑनलाइन सत्संग" : "Monthly Live Satsangs",
                  lang === "hi" ? "दैनिक वैदिक विचार एवं प्रेरणा" : "Daily Spiritual Guidance",
                  lang === "hi" ? "वार्षिक मंदिर पूजा संकल्प" : "Personal Puja Sankalp",
                  lang === "hi" ? "वैदिक साहित्य व प्रेरणा" : "Vedic Spiritual Wisdom",
                ],
              },
              {
                num: "02",
                category: lang === "hi" ? "सेवा" : "SEVA",
                badgeColor: "text-[#2F5A43]",
                iconBg: "bg-[#2F5A43]/15 text-[#2F5A43]",
                borderColor: "border-[#2F5A43]",
                topLine: "bg-gradient-to-r from-[#2F5A43] to-[#4D8C69]",
                icon: HandHeart,
                image: "/images/card-seva-real.webp",
                title: lang === "hi" ? "प्रत्यक्ष जनसेवा व अन्नक्षेत्र" : "Hands-On Ground Seva",
                desc: lang === "hi"
                  ? "दैनिक अन्नक्षेत्र भंडारा, निःशुल्क गौशाला सेवा और जरूरतमंद बच्चों की शिक्षा में प्रत्यक्ष भागीदारी निभाएं।"
                  : "Directly participate in daily Annakshetra community kitchens, Desi Gaushala care, and rural child schooling.",
                points: [
                  lang === "hi" ? "दैनिक अन्नक्षेत्र भंडारा सेवा" : "Daily Bhandara Seva",
                  lang === "hi" ? "देसी गोवंश संरक्षण व चारा" : "Desi Cow & Gaushala Care",
                  lang === "hi" ? "निःशुल्क स्वास्थ्य व राहत शिविर" : "Free Health & Relief Camps",
                  lang === "hi" ? "प्रत्यक्ष सेवा सहभागिता" : "Direct Volunteer Seva",
                ],
              },
              {
                num: "03",
                category: lang === "hi" ? "संग" : "SANGHA",
                badgeColor: "text-[#B8893E]",
                iconBg: "bg-[#B8893E]/15 text-[#B8893E]",
                borderColor: "border-[#B8893E]",
                topLine: "bg-gradient-to-r from-[#B8893E] to-[#D4A359]",
                icon: Users,
                image: "/images/membership-hero-unity.jpg",
                title: lang === "hi" ? "25,000+ पावन भक्त संग" : "Devotee Sangha & Yatras",
                desc: lang === "hi"
                  ? "देश भर के समर्पित सनातन भक्तों के विशाल परिवार का हिस्सा बनें और विशेष तीर्थ यात्राओं में साथ चलें।"
                  : "Connect with a compassionate national fraternity of 25,000+ devotees and join guided spiritual yatras.",
                points: [
                  lang === "hi" ? "देशव्यापी भक्त नेटवर्क" : "Pan-India Member Network",
                  lang === "hi" ? "वार्षिक तीर्थ यात्रा में प्राथमिकता" : "Priority Teerth Yatra Access",
                  lang === "hi" ? "ट्रस्ट धर्मशालाओं में सत्कार" : "Trust Dharamshala Hospitality",
                  lang === "hi" ? "वार्षिक भक्त परिवार सम्मेलन" : "Annual Devotee Sammelan",
                ],
              },
              {
                num: "04",
                category: lang === "hi" ? "ट्रस्ट" : "TRUST",
                badgeColor: "text-[#D45A0E]",
                iconBg: "bg-[#E86F1D]/15 text-[#E86F1D]",
                borderColor: "border-[#D48820]",
                topLine: "bg-gradient-to-r from-[#D48820] to-[#E86F1D]",
                icon: ShieldCheck,
                image: "/images/card-vedic-books.jpg",
                title: lang === "hi" ? "पारदर्शिता, प्रमाणपत्र व 80G" : "Purity, Certificate & 80G",
                desc: lang === "hi"
                  ? "प्रत्येक दान का 100% सदुपयोग। आधिकारिक सदस्यता प्रमाणपत्र, मंदिर का पावन प्रसाद और 80G रसीद प्राप्त करें।"
                  : "100% fiscal integrity. Receive your framed Member Certificate, blessed temple prasad, and 80G tax receipt.",
                points: [
                  lang === "hi" ? "100% आयकर छूट (धारा 80G)" : "100% Tax Exemption (80G)",
                  lang === "hi" ? "आधिकारिक सदस्यता प्रमाणपत्र" : "Official Member Certificate",
                  lang === "hi" ? "मंदिर का पावन प्रसाद" : "Blessed Temple Prasad Delivery",
                  lang === "hi" ? "पारदर्शी वार्षिक सेवा रिपोर्ट" : "Verified Annual Audit Report",
                ],
              },
            ].map((card, idx) => {
              const isFlipped = activeFlipCard === idx;
              return (
                <StaggerItem key={idx}>
                  <div
                    onClick={() => setActiveFlipCard(isFlipped ? null : idx)}
                    className="perspective-1000 w-full max-w-[340px] sm:max-w-none mx-auto h-[310px] sm:h-[325px] group cursor-pointer select-none"
                  >
                    <div className={`relative w-full h-full flip-card-inner group-hover-flip ${isFlipped ? "is-flipped" : ""}`}>
                      {/* FRONT FACE - IMAGE & TITLE */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border border-[#E7D8C8] shadow-warm-xs group-hover:shadow-warm-md flex flex-col justify-end p-4 sm:p-5">
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1610]/95 via-[#1F1610]/35 to-transparent z-10" />

                        {/* Bottom Info on Front */}
                        <div className="relative z-20 text-white">
                          <h3 className="font-editorial text-xl sm:text-2xl font-bold leading-snug drop-shadow-sm">
                            {card.title}
                          </h3>
                          <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#E8A246] uppercase tracking-wider">
                            <span>{lang === "hi" ? "टैप करें" : "Tap / Hover to explore"}</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>

                      {/* BACK FACE - TIGHT BALANCED DESIGN (NO MIDDLE GAP) */}
                      <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#FFFDF9] via-[#FFF8EE] to-[#FAF2E6] border-2 ${card.borderColor} shadow-warm-lg flex flex-col justify-start overflow-hidden`}>
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${card.topLine}`} />

                        {/* Top Header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest ${card.badgeColor}`}>
                            {card.num} • {card.category}
                          </span>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                            <card.icon className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#2B201A] leading-snug">
                          {card.title}
                        </h3>
                        <p className="text-xs text-[#2B201A]/80 mt-1.5 leading-relaxed">
                          {card.desc}
                        </p>

                        {/* Bullet Points immediately under description (zero middle gap) */}
                        <div className="mt-3 pt-2.5 border-t border-[#E7D8C8] space-y-1.5 sm:space-y-2">
                          {card.points.map((pt, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-2 text-xs text-[#2B201A]/85">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2F5A43] shrink-0" />
                              <span className="leading-tight">{pt}</span>
                            </div>
                          ))}
                        </div>

                        {/* Footer Touch Hint */}
                        <div className="mt-auto pt-1 flex items-center justify-end text-[10px] font-bold text-[#B8893E] uppercase tracking-wider">
                          <span className="inline-flex items-center gap-1 opacity-80">
                            <span>{lang === "hi" ? "वापस जाएँ" : "Tap to flip back"}</span>
                            <ArrowRight className="w-3 h-3 rotate-180" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Bottom Trust & Devotional Seal Banner */}
          <div className="mt-10 sm:mt-12 rounded-2xl bg-[#FFF9F2] border border-[#E7D8C8] p-5 sm:p-6 shadow-warm-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#E86F1D]/15 text-[#E86F1D] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2B201A] uppercase tracking-wide">
                    {lang === "hi" ? "विश्वसनीय व पंजीकृत धार्मिक न्यास" : "Government Registered Religious Trust"}
                  </h4>
                  <p className="text-xs text-[#2B201A]/70 mt-0.5">
                    {lang === "hi"
                      ? "धारा 12A एवं 80G के अंतर्गत पंजीकृत • समस्त दान आयकर छूट हेतु मान्य"
                      : "Registered under Section 12A & 80G • Zero administrative leakage • Complete annual reporting"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 shrink-0 flex-wrap justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF3EA] border border-[#E7D8C8] text-[11px] font-bold text-[#2B201A]">
                  <Scroll className="w-3.5 h-3.5 text-[#B8893E]" />
                  {lang === "hi" ? "सदस्यता पत्र" : "Seva Certificate"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF3EA] border border-[#E7D8C8] text-[11px] font-bold text-[#2B201A]">
                  <Heart className="w-3.5 h-3.5 text-[#E86F1D]" />
                  {lang === "hi" ? "वार्षिक संकल्प" : "Annual Sankalp"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF3EA] border border-[#E7D8C8] text-[11px] font-bold text-[#2F5A43]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2F5A43]" />
                  {lang === "hi" ? "80G रसीद" : "80G Tax Benefit"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* DEVOTEE COMMUNITY / OUR ACTIVE MEMBERS TICKER (END TO END AUTO SCROLL) */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 overflow-hidden">
        <div className="page-container mb-6 sm:mb-8">
          <div className="text-center max-w-2xl mx-auto section-header space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">
              {lang === "hi" ? "भक्त समुदाय" : "DEVOTEE COMMUNITY"}
            </p>
            <TextReveal as="h2" className="font-editorial text-3xl sm:text-4xl font-bold text-[#E86F1D]">
              {lang === "hi" ? "हमारे सक्रिय सदस्य" : "Our Active Members"}
            </TextReveal>
          </div>
        </div>

        {/* Full width edge-to-edge auto scroll strip */}
        <div className="w-full">
          <MemberCarousel />
        </div>
      </SectionReveal>

      {/* MEMBERSHIP REGISTRATION FORM */}
      <section className="section-py bg-[#FBF2E7]/60 border-t border-[#E7D8C8]">
        <div className="page-container max-w-3xl">
          <div className="card-warm p-8 sm:p-12 space-y-8">
            <div className="text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">
                {lang === "hi" ? "पंजीकरण" : "REGISTRATION"}
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#E86F1D]">
                {lang === "hi" ? "सदस्यता पंजीकरण" : "Membership Registration"}
              </h2>
              <HeadingDivider className="my-1.5" />
              <p className="text-sm text-[#2B201A]/75">
                {lang === "hi"
                  ? "अपनी सदस्यता योजना चुनें और सदस्यता पूर्ण करने के लिए अपना विवरण साझा करें।"
                  : "Choose your plan and share your details to complete your membership."}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
              <fieldset>
                <legend className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-2">
                  {lang === "hi" ? "सदस्यता योजना चुनें *" : "Membership Plan *"}
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MEMBERSHIP_PLANS.map((p) => {
                    const selected = planId === p.id;
                    const tierMatch = tiers.find((t) => t.price === p.price);
                    const displayName = lang === "hi" && tierMatch?.nameHi ? tierMatch.nameHi : p.name;
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                          selected ? "border-[#E86F1D] bg-[#E86F1D]/5" : "border-[#E7D8C8] bg-[#FFF9F2] hover:border-[#E86F1D]/40"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="mem-plan"
                            value={p.id}
                            checked={selected}
                            onChange={() => setPlanId(p.id)}
                            className="accent-[#E86F1D]"
                          />
                          <span className="text-sm font-semibold text-[#2B201A]">{displayName}</span>
                        </span>
                        <span className="text-sm font-bold text-[#E86F1D] tabular-nums">{formatINR(p.price)}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mem-fullname" className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                    {lang === "hi" ? "पूरा नाम *" : "Full Name *"}
                  </label>
                  <input
                    id="mem-fullname"
                    type="text"
                    required
                    maxLength={60}
                    placeholder={lang === "hi" ? "अपना पूरा नाम दर्ज करें" : "Enter your full name"}
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName && validateName(e.target.value) === null) {
                        setErrors((prev) => ({ ...prev, fullName: undefined }));
                      }
                    }}
                    onBlur={() => handleBlur("fullName")}
                    className="input-warm"
                  />
                  {errors.fullName && (touched.fullName || errors.fullName) && (
                    <p className="mt-1 text-xs font-semibold text-[#B3261E]">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mem-email" className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                    {lang === "hi" ? "ईमेल पता *" : "Email Address *"}
                  </label>
                  <input
                    id="mem-email"
                    type="email"
                    required
                    maxLength={254}
                    placeholder="email@domain.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email && validateEmail(e.target.value) === null) {
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    onBlur={() => handleBlur("email")}
                    className="input-warm"
                  />
                  {errors.email && (touched.email || errors.email) && (
                    <p className="mt-1 text-xs font-semibold text-[#B3261E]">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mem-phone" className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                    {lang === "hi" ? "मोबाइल नंबर *" : "Phone Number *"}
                  </label>
                  <input
                    id="mem-phone"
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={14}
                    placeholder="+91"
                    value={formData.phone}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 10 && val.startsWith("91")) {
                        val = val.slice(2);
                      }
                      const sanitized = val.slice(0, 10);
                      setFormData({ ...formData, phone: sanitized });
                      if (errors.phone && validateMobile(sanitized, true) === null) {
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                    onBlur={() => handleBlur("phone")}
                    className="input-warm"
                  />
                  {errors.phone && (touched.phone || errors.phone) && (
                    <p className="mt-1 text-xs font-semibold text-[#B3261E]">{errors.phone}</p>
                  )}
                </div>
              </div>

              <p className="flex items-start gap-2 text-xs text-[#2B201A]/70 bg-[#FFF9F2] border border-[#E7D8C8] rounded-xl p-3">
                <ShieldCheck className="w-4 h-4 text-[#2F5A43] shrink-0" />
                <span>
                  {lang === "hi"
                    ? "इसके बाद, आप ट्रस्ट के आधिकारिक खाते में UPI द्वारा भुगतान करेंगे। भुगतान की पुष्टि होते ही, आपकी सदस्यता पावती और प्रमाणपत्र आपके ईमेल पर भेज दिया जाएगा।"
                    : "Next, you'll pay by UPI to the Trust's account. Once the Trust confirms your payment, your membership confirmation and certificate are emailed to you."}
                </span>
              </p>

              <button type="submit" className="btn-primary w-full">
                {lang === "hi" ? "भुगतान के लिए आगे बढ़ें — " : "Continue to Payment — "}
                {formatINR((MEMBERSHIP_PLANS.find((p) => p.id === planId) ?? MEMBERSHIP_PLANS[0]).price)}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
