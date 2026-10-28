"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Shield, Heart, Users, BookOpen, Check, ShieldCheck, ArrowRight, HandHeart, Award, CheckCircle2, Scroll, Copy, CheckCheck, QrCode } from "lucide-react";
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
  const [formData, setFormData] = useState({
    fullName: "",
    guardianName: "",
    gender: "",
    caste: "",
    gotra: "",
    email: "",
    phone: "",
    dob: "",
    state: "Haryana",
    district: "",
    address: "",
    wardNumber: "",
    pincode: "",
    occupation: "",
    occupationDetails: "",
    photoName: "",
  });
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("yespay.smessi49188@yesbankltd");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = validateName(formData.fullName);
    const emailErr = formData.email ? validateEmail(formData.email) : null;
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

    // Scroll to the QR payment card smoothly
    const qrSection = document.getElementById("payment-qr");
    if (qrSection) {
      qrSection.scrollIntoView({ behavior: "smooth" });
    }

    openDonateModal(plan.name, plan.price, true, {
      name: sanitizeName(formData.fullName),
      email: formData.email ? sanitizeEmail(formData.email) : undefined,
      mobile: sanitizeMobile(formData.phone),
    });
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
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-7 py-3.5 rounded-xl bg-[#E86F1D] hover:bg-[#D25E12] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
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
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="text-[#1F1712]">
                {lang === "hi" ? "ट्रस्ट की सदस्यता " : "Why Join Our "}
              </span>
              <span className="text-[#E86F1D]">
                {lang === "hi" ? "क्यों ग्रहण करें?" : "Seva Parivar?"}
              </span>
            </h2>
          </div>

          {/* 4 ACTION & PURPOSE CARDS (CLEAN HORIZONTAL SPLIT MATCHING INITIATIVES STYLE) */}
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7 items-stretch">
            {[
              {
                category: lang === "hi" ? "ज्ञान" : "GNANA",
                image: "/images/gurukul-real.webp",
                title: lang === "hi" ? "आध्यात्मिक ज्ञान एवं सत्संग" : "Spiritual Enlightenment",
                desc: lang === "hi"
                  ? "पूज्य संतों के सान्निध्य में नियमित श्रीमद्भगवद्गीता स्वाध्याय, वैदिक अनुष्ठान और ऑनलाइन सत्संग से जुड़ें।"
                  : "Deepen your inner journey through live spiritual discourses, Vedic wisdom sessions, and divine satsangs.",
                points: [
                  lang === "hi" ? "मासिक विशेष ऑनलाइन सत्संग" : "Monthly Live Satsangs",
                  lang === "hi" ? "दैनिक वैदिक विचार एवं प्रेरणा" : "Daily Spiritual Guidance",
                  lang === "hi" ? "वार्षिक मंदिर पूजा संकल्प" : "Personal Puja Sankalp",
                ],
                btnText: lang === "hi" ? "सत्संग से जुड़ें" : "EXPLORE SATSANG",
              },
              {
                category: lang === "hi" ? "सेवा" : "SEVA",
                image: "/images/card-seva-real.webp",
                title: lang === "hi" ? "प्रत्यक्ष जनसेवा व अन्नक्षेत्र" : "Hands-On Ground Seva",
                desc: lang === "hi"
                  ? "दैनिक अन्नक्षेत्र भंडारा, निःशुल्क गौशाला सेवा और जरूरतमंद बच्चों की शिक्षा में प्रत्यक्ष भागीदारी निभाएं।"
                  : "Directly participate in daily Annakshetra community kitchens, Desi Gaushala care, and rural child schooling.",
                points: [
                  lang === "hi" ? "दैनिक अन्नक्षेत्र भंडारा सेवा" : "Daily Bhandara Seva",
                  lang === "hi" ? "देसी गोवंश संरक्षण व चारा" : "Desi Cow & Gaushala Care",
                  lang === "hi" ? "निःशुल्क स्वास्थ्य व राहत शिविर" : "Free Health & Relief Camps",
                ],
                btnText: lang === "hi" ? "सेवा से जुड़ें" : "JOIN SEVA",
              },
              {
                category: lang === "hi" ? "संग" : "SANGHA",
                image: "/images/card-join-real.webp",
                title: lang === "hi" ? "25,000+ पावन भक्त संग" : "Devotee Sangha & Yatras",
                desc: lang === "hi"
                  ? "देश भर के समर्पित सनातन भक्तों के विशाल परिवार का हिस्सा बनें और विशेष तीर्थ यात्राओं में साथ चलें।"
                  : "Connect with a compassionate national fraternity of 25,000+ devotees and join guided spiritual yatras.",
                points: [
                  lang === "hi" ? "देशव्यापी भक्त नेटवर्क" : "Pan-India Member Network",
                  lang === "hi" ? "वार्षिक तीर्थ यात्रा में प्राथमिकता" : "Priority Teerth Yatra Access",
                  lang === "hi" ? "ट्रस्ट धर्मशालाओं में सत्कार" : "Trust Dharamshala Hospitality",
                ],
                btnText: lang === "hi" ? "परिवार से जुड़ें" : "JOIN SANGHA",
              },
              {
                category: lang === "hi" ? "ट्रस्ट" : "TRUST",
                image: "/images/founder.jpg",
                title: lang === "hi" ? "पारदर्शिता, प्रमाणपत्र व 80G" : "Purity, Certificate & 80G",
                desc: lang === "hi"
                  ? "प्रत्येक दान का 100% सदुपयोग। आधिकारिक सदस्यता प्रमाणपत्र, मंदिर का पावन प्रसाद और 80G रसीद प्राप्त करें।"
                  : "100% fiscal integrity. Receive your framed Member Certificate, blessed temple prasad, and 80G tax receipt.",
                points: [
                  lang === "hi" ? "100% आयकर छूट (धारा 80G)" : "100% Tax Exemption (80G)",
                  lang === "hi" ? "आधिकारिक सदस्यता प्रमाणपत्र" : "Official Member Certificate",
                  lang === "hi" ? "मंदिर का पावन प्रसाद" : "Blessed Temple Prasad Delivery",
                ],
                btnText: lang === "hi" ? "सदस्यता लें" : "BECOME A MEMBER",
              },
            ].map((card, idx) => (
              <StaggerItem key={idx} className="h-full">
                <div className="bg-white rounded-[20px] sm:rounded-[24px] border border-[#E7D8C8] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row h-full group">
                  {/* Left Image */}
                  <div className="relative w-full sm:w-[38%] md:w-[40%] shrink-0 min-h-[200px] sm:min-h-[230px] overflow-hidden bg-[#FAF3EC]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Right Content */}
                  <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <span className="text-[11px] font-bold text-[#E86F1D] uppercase tracking-wider block">
                        {card.category}
                      </span>
                      <h3 className="font-editorial font-bold text-lg sm:text-xl text-[#1F1712] leading-snug mt-1">
                        {card.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#5C6B73] leading-relaxed mt-2 line-clamp-3">
                        {card.desc}
                      </p>

                      {/* Benefits / Points */}
                      <div className="mt-3.5 pt-3 border-t border-[#F0E4D8] space-y-1.5 sm:space-y-2">
                        {card.points.map((pt, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 text-xs text-[#2B201A]/85">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E86F1D] shrink-0" />
                            <span className="leading-tight">{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-2">
                      <button
                        onClick={() => openDonateModal(card.title, undefined, true)}
                        className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <span>{card.btnText}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

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
        <div className="page-container max-w-4xl space-y-8">
          {/* Form Card (White Background) */}
          <div className="p-6 sm:p-10 space-y-8 bg-white border border-[#E7D8C8] rounded-[24px] shadow-sm">
            <div className="text-center space-y-2">
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#E86F1D]">
                {lang === "hi" ? "सदस्यता पंजीकरण" : "Membership Registration"}
              </h2>
              <HeadingDivider className="my-1.5" />
              <p className="text-sm text-[#4B5563]">
                {lang === "hi"
                  ? "अपनी सदस्यता योजना चुनें और सदस्यता पूर्ण करने के लिए अपना विवरण साझा करें।"
                  : "Choose your plan and share your details to complete your membership."}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} noValidate className="space-y-8">
              {/* Membership Plan Selection */}
              <fieldset>
                <legend className="block text-xs font-bold uppercase tracking-wider text-[#1F1712] mb-2.5">
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
                          selected
                            ? "border-[#E86F1D] bg-[#FFF8F2] shadow-xs"
                            : "border-[#E5E7EB] bg-white hover:border-[#E86F1D]/40"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="mem-plan"
                            value={p.id}
                            checked={selected}
                            onChange={() => setPlanId(p.id)}
                            className="accent-[#E86F1D] w-4 h-4"
                          />
                          <span className="text-sm font-semibold text-[#1F1712]">{displayName}</span>
                        </span>
                        <span className="text-sm font-bold text-[#E86F1D] tabular-nums">{formatINR(p.price)}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* SECTION 1: PERSONAL DETAILS */}
              <div className="space-y-5 pt-4 border-t border-[#F3F4F6]">
                <h3 className="font-editorial text-xl font-bold text-[#E86F1D]">
                  {lang === "hi" ? "व्यक्तिगत विवरण" : "Personal Details"}
                </h3>

                {/* Photo Upload */}
                <div>
                  <label className="block text-xs font-bold text-[#1F1712] mb-1.5">
                    {lang === "hi" ? "फोटो" : "Photo"}
                  </label>
                  <div className="border border-dashed border-[#E86F1D] rounded-md px-3 py-2 bg-white inline-flex items-center gap-2.5">
                    <label className="inline-flex items-center px-3 py-1 rounded border border-[#D1D5DB] bg-[#F9FAFB] hover:bg-[#F3F4F6] text-xs font-semibold text-[#1F1712] cursor-pointer transition-colors">
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFormData({ ...formData, photoName: e.target.files[0].name });
                          }
                        }}
                      />
                    </label>
                    <span className="text-xs text-[#6B7280]">
                      {formData.photoName || "No file chosen"}
                    </span>
                  </div>
                </div>

                {/* Row 1: Full Name, S/o W/o D/o, Gender (3 Equal Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="mem-fullname" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "पूरा नाम" : "Full Name"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="mem-fullname"
                      type="text"
                      required
                      maxLength={60}
                      placeholder={lang === "hi" ? "पूरा नाम" : "Full Name"}
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName && validateName(e.target.value) === null) {
                          setErrors((prev) => ({ ...prev, fullName: undefined }));
                        }
                      }}
                      onBlur={() => handleBlur("fullName")}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] placeholder:text-[#9CA3AF] outline-none transition-all"
                    />
                    {errors.fullName && (touched.fullName || errors.fullName) && (
                      <p className="mt-1 text-xs font-semibold text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="mem-guardian" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "पिता / पति का नाम" : "S/o, W/o, D/o"}
                    </label>
                    <input
                      id="mem-guardian"
                      type="text"
                      maxLength={60}
                      placeholder={lang === "hi" ? "पिता / पति का नाम" : "S/o, W/o, D/o Name"}
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] placeholder:text-[#9CA3AF] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="mem-gender" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "लिंग" : "Gender"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="mem-gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] outline-none transition-all cursor-pointer"
                    >
                      <option value="">{lang === "hi" ? "--लिंग चुनें--" : "--Select Gender--"}</option>
                      <option value="Male">{lang === "hi" ? "पुरुष (Male)" : "Male"}</option>
                      <option value="Female">{lang === "hi" ? "महिला (Female)" : "Female"}</option>
                      <option value="Other">{lang === "hi" ? "अन्य (Other)" : "Other"}</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Caste, Gotra, Email (3 Equal Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="mem-caste" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "जाति" : "Caste"}
                    </label>
                    <input
                      id="mem-caste"
                      type="text"
                      maxLength={40}
                      placeholder={lang === "hi" ? "जाति" : "Caste"}
                      value={formData.caste}
                      onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] placeholder:text-[#9CA3AF] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="mem-gotra" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "गोत्र" : "Gotra"}
                    </label>
                    <input
                      id="mem-gotra"
                      type="text"
                      maxLength={40}
                      placeholder={lang === "hi" ? "गोत्र" : "Gotra"}
                      value={formData.gotra}
                      onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] placeholder:text-[#9CA3AF] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="mem-email" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "ईमेल" : "Email"}
                    </label>
                    <input
                      id="mem-email"
                      type="email"
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
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] placeholder:text-[#9CA3AF] outline-none transition-all"
                    />
                    {errors.email && (touched.email || errors.email) && (
                      <p className="mt-1 text-xs font-semibold text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: Phone Number, Date of Birth, Empty Col (3 Equal Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="mem-phone" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "मोबाइल नंबर" : "Phone Number"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs text-[#4B5563] font-medium select-none flex items-center gap-1.5">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </span>
                      <input
                        id="mem-phone"
                        type="tel"
                        inputMode="numeric"
                        required
                        maxLength={10}
                        placeholder=""
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
                        className="w-full h-11 !pl-16 pr-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] outline-none transition-all"
                      />
                    </div>
                    {errors.phone && (touched.phone || errors.phone) && (
                      <p className="mt-1 text-xs font-semibold text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="mem-dob" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "जन्म तिथि" : "Date of Birth"}
                    </label>
                    <input
                      id="mem-dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] outline-none transition-all cursor-pointer"
                    />
                  </div>

                  {/* Empty 3rd Column for exact 3-col alignment */}
                  <div className="hidden sm:block" />
                </div>
              </div>

              {/* SECTION 2: ADDRESS DETAILS */}
              <div className="space-y-5 pt-4 border-t border-[#F3F4F6]">
                <h3 className="font-editorial text-xl font-bold text-[#E86F1D]">
                  {lang === "hi" ? "पते का विवरण" : "Address Details"}
                </h3>

                {/* Row 1: State, District, Address (3 Equal Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="mem-state" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "राज्य" : "State"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="mem-state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] outline-none transition-all cursor-pointer"
                    >
                      <option value="Haryana">Haryana (हरियाणा)</option>
                      <option value="Delhi">Delhi (दिल्ली)</option>
                      <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                      <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                      <option value="Punjab">Punjab (पंजाब)</option>
                      <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                      <option value="Bihar">Bihar (बिहार)</option>
                      <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                      <option value="Gujarat">Gujarat (गुजरात)</option>
                      <option value="Other">Other State (अन्य)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="mem-district" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "जिला" : "District"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="mem-district"
                      type="text"
                      placeholder={lang === "hi" ? "--जिला चुनें--" : "--Select District--"}
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] placeholder:text-[#9CA3AF] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="mem-address" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "वर्तमान पता" : "Address"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="mem-address"
                      type="text"
                      placeholder={lang === "hi" ? "वर्तमान पता" : "Current Address"}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] placeholder:text-[#9CA3AF] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Ward Number, Pincode, Empty Col (3 Equal Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="mem-ward" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "वार्ड नंबर" : "Ward Number"}
                    </label>
                    <input
                      id="mem-ward"
                      type="text"
                      maxLength={20}
                      placeholder={lang === "hi" ? "वार्ड नंबर" : "Ward Number"}
                      value={formData.wardNumber}
                      onChange={(e) => setFormData({ ...formData, wardNumber: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] placeholder:text-[#9CA3AF] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="mem-pincode" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "पिनकोड" : "Pincode"}
                    </label>
                    <input
                      id="mem-pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder={lang === "hi" ? "पिनकोड" : "Pincode"}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] placeholder:text-[#9CA3AF] outline-none transition-all"
                    />
                  </div>

                  {/* Empty 3rd Column for exact 3-col alignment */}
                  <div className="hidden sm:block" />
                </div>

                {/* Row 3: Occupation, Occupation Details, Empty Col (3 Equal Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="mem-occupation" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "व्यवसाय" : "Occupation"}
                    </label>
                    <select
                      id="mem-occupation"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] outline-none transition-all cursor-pointer"
                    >
                      <option value="">{lang === "hi" ? "--व्यवसाय चुनें--" : "--Select Occupation--"}</option>
                      <option value="Business">{lang === "hi" ? "व्यवसाय (Business)" : "Business"}</option>
                      <option value="Private Job">{lang === "hi" ? "निजी सेवा (Private Job)" : "Private Job"}</option>
                      <option value="Government Job">{lang === "hi" ? "सरकारी सेवा (Govt Job)" : "Government Job"}</option>
                      <option value="Agriculture">{lang === "hi" ? "कृषि (Agriculture)" : "Agriculture"}</option>
                      <option value="Social Work">{lang === "hi" ? "समाज सेवा (Social Work)" : "Social Work"}</option>
                      <option value="Self Employed">{lang === "hi" ? "स्वरोजगार (Self Employed)" : "Self Employed"}</option>
                      <option value="Student">{lang === "hi" ? "विद्यार्थी (Student)" : "Student"}</option>
                      <option value="Homemaker">{lang === "hi" ? "गृहिणी (Homemaker)" : "Homemaker"}</option>
                      <option value="Other">{lang === "hi" ? "अन्य (Other)" : "Other"}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="mem-occ-details" className="block text-xs font-bold text-[#1F1712] mb-1.5">
                      {lang === "hi" ? "व्यवसाय का विवरण" : "Occupation Details"}
                    </label>
                    <input
                      id="mem-occ-details"
                      type="text"
                      placeholder={lang === "hi" ? "विवरण दर्ज करें" : "Mention Details"}
                      value={formData.occupationDetails}
                      onChange={(e) => setFormData({ ...formData, occupationDetails: e.target.value })}
                      className="w-full h-11 px-3.5 bg-white border border-[#D1D5DB] focus:border-[#E86F1D] focus:ring-1 focus:ring-[#E86F1D] rounded-lg text-sm text-[#1F1712] placeholder:text-[#9CA3AF] outline-none transition-all"
                    />
                  </div>

                  {/* Empty 3rd Column for exact 3-col alignment */}
                  <div className="hidden sm:block" />
                </div>
              </div>

              {/* SECTION 3: MEMBERSHIP PAYMENT & QR CODE */}
              <div id="payment-qr" className="pt-8 border-t border-[#F3F4F6] space-y-6">
                {/* Header & Instructions */}
                <div className="space-y-1.5 text-left">
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#E86F1D]">
                    {lang === "hi" ? "सदस्यता भुगतान" : "Membership Payment"}
                  </h3>
                  <HeadingDivider align="left" className="!py-0.5" />
                  <p className="text-xs sm:text-sm text-[#4B5563] pt-0.5">
                    {lang === "hi"
                      ? "कृपया नीचे दिए गए QR कोड को स्कैन करके अपना सदस्यता सहयोग पूरा करें।"
                      : "Please complete your membership payment by scanning the QR code below."}
                  </p>
                </div>

                {/* 2-Column Side-by-Side: QR on Left, Details & Instructions on Right */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start pt-2">
                  {/* LEFT COLUMN: QR Code Stand & UPI Copy Badge */}
                  <div className="md:col-span-5 flex flex-col items-center text-center space-y-3.5">
                    <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/5] rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm bg-white">
                      <Image
                        src="/images/trust-payment-qr.png"
                        alt="Namo Bhagwate Trust UPI QR Code"
                        fill
                        priority
                        unoptimized
                        className="object-contain"
                      />
                    </div>

                    {/* UPI ID Badge & Copy Button */}
                    <div className="w-full max-w-[280px] sm:max-w-[320px] flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                      <span className="text-xs font-mono font-bold text-[#1F1712] truncate">
                        yespay.smessi49188@yesbankltd
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#E86F1D] hover:text-[#D45A0E] cursor-pointer shrink-0"
                      >
                        {copiedUpi ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">{lang === "hi" ? "कॉपी हुआ!" : "Copied!"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{lang === "hi" ? "कॉपी" : "Copy"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: 4-Step Instructions, Trust Notice & Continue CTA */}
                  <div className="md:col-span-7 flex flex-col space-y-4">
                    {/* 4-Step Instructions List */}
                    <ol className="text-xs sm:text-sm text-[#374151] space-y-3 list-decimal list-inside bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 leading-relaxed">
                      <li className="font-medium">
                        <span>
                          {lang === "hi"
                            ? "अपने पसंदीदा UPI ऐप (GPay, PhonePe, Paytm, BHIM) से QR कोड स्कैन करें।"
                            : "Scan the QR code using your preferred UPI app."}
                        </span>
                      </li>
                      <li className="font-medium">
                        <span>
                          {lang === "hi"
                            ? `लागू सदस्यता राशि का भुगतान करें: ${formatINR(
                                (MEMBERSHIP_PLANS.find((p) => p.id === planId) ?? MEMBERSHIP_PLANS[0]).price
                              )}`
                            : `Pay the applicable membership amount: ${formatINR(
                                (MEMBERSHIP_PLANS.find((p) => p.id === planId) ?? MEMBERSHIP_PLANS[0]).price
                              )}`}
                        </span>
                      </li>
                      <li className="font-medium">
                        <span>
                          {lang === "hi"
                            ? "भुगतान का स्क्रीनशॉट ट्रस्ट कार्यालय को व्हाट्सएप पर भेजें: +91 9910762692 / +91 88606 65000"
                            : "Share the screenshot over WhatsApp with Trust Office Incharge at +91 9910762692 or +91 88606 65000."}
                        </span>
                      </li>
                      <li className="font-medium">
                        <span>
                          {lang === "hi"
                            ? "हमारी टीम भुगतान का सत्यापन करके आपके खाते की सदस्यता सक्रिय करेगी और प्रमाणपत्र जारी करेगी।"
                            : "Our team will verify the payment and activate the appropriate membership for your account."}
                        </span>
                      </li>
                    </ol>

                    {/* Trust Confirmation Notice Box */}
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs sm:text-sm text-[#374151] flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-[#2F5A43] shrink-0" />
                      <span>
                        {lang === "hi"
                          ? "इसके बाद, आप ट्रस्ट के खाते में UPI द्वारा भुगतान करेंगे। ट्रस्ट द्वारा पुष्टि होने पर, सदस्यता पुष्टि और प्रमाणपत्र आपको ईमेल कर दिया जाएगा।"
                          : "Next, you'll pay by UPI to the Trust's account. Once the Trust confirms your payment, your membership confirmation and certificate are emailed to you."}
                      </span>
                    </div>

                    {/* Continue Button */}
                    <button
                      type="submit"
                      className="w-full py-4 px-6 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-sm sm:text-base uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                    >
                      {lang === "hi" ? "भुगतान जारी रखें — " : "CONTINUE TO PAYMENT — "}
                      {formatINR((MEMBERSHIP_PLANS.find((p) => p.id === planId) ?? MEMBERSHIP_PLANS[0]).price)}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
