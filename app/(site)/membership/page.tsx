"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Shield, Heart, Users, BookOpen, Check, ShieldCheck, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import MemberCarousel from "@/components/MemberCarousel";
import { MEMBERSHIP_PLANS, findPlan, formatINR } from "@/lib/donation-config";
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
      desc: findPlan("basic")!.description,
      features: findPlan("basic")!.benefits,
      highlight: false,
      cardStyle: "bg-[#FFF9F2] border border-[#E7D8C8] shadow-warm-sm hover:border-[#E86F1D]/40 relative",
      badgeText: null,
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
      desc: findPlan("silver")!.description,
      features: findPlan("silver")!.benefits,
      highlight: false,
      cardStyle: "bg-gradient-to-b from-[#FAFBFD] to-[#EEF1F6] border-2 border-[#C0C7D2] shadow-warm-sm hover:border-[#9AA5B5] relative",
      badgeText: findPlan("silver")!.badge,
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
      desc: findPlan("gold")!.description,
      features: findPlan("gold")!.benefits,
      highlight: true,
      cardStyle: "bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EA] to-[#FFF3D6] border-2 border-[#D4A359] shadow-warm-md hover:border-[#C68A2E] relative",
      badgeText: findPlan("gold")!.badge,
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
      desc: findPlan("platinum")!.description,
      features: findPlan("platinum")!.benefits,
      highlight: false,
      cardStyle: "bg-gradient-to-b from-[#F9FAFC] via-[#F2F4F8] to-[#E5E9F0] border-2 border-[#A3AFBF] shadow-warm-sm hover:border-[#8291A5] relative",
      badgeText: findPlan("platinum")!.badge,
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
      {/* HERO SECTION - RECREATED FROM REFERENCE (PANORAMIC SPIRITUAL UNITY HERO - FULL SCREEN) */}
      <section className="relative overflow-hidden bg-[#F6EDE2] border-b border-[#E7D8C8] min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-80px)] flex items-center">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/membership-hero-banner.png"
            alt="Together for a Better Tomorrow"
            fill
            priority
            unoptimized
            className="object-cover object-right md:object-center"
          />
          {/* Smooth Warm Mist Gradient: seamlessly masks the low-res text on the left and provides a high-contrast luxury canvas */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6EDE2] via-[#F6EDE2] via-35% sm:via-[#F6EDE2]/95 sm:via-45% md:via-50% lg:via-52% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F6EDE2] via-transparent to-transparent opacity-85 sm:hidden" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 page-container py-14 sm:py-20 md:py-24 w-full">
          <div className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-5">
            {/* Saffron Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E86F1D]/10 border border-[#E86F1D]/30 text-[#E86F1D] text-xs font-bold uppercase tracking-widest shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E86F1D]" />
              <span>{lang === "hi" ? "पावन सेवा परिवार से जुड़ें" : "Join Our Spiritual Family"}</span>
            </div>

            {/* Main Title matching reference */}
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2B201A] leading-[1.12] tracking-tight">
              {lang === "hi" ? (
                <>
                  एक बेहतर कल के लिए <span className="text-[#E86F1D]">साथ</span>
                </>
              ) : (
                <>
                  Together for a <span className="text-[#E86F1D]">Better Tomorrow</span>
                </>
              )}
            </h1>

            {/* Description matching exact reference text */}
            <p className="text-sm sm:text-base md:text-[15px] text-[#4A3B32] leading-relaxed font-sans font-medium">
              {lang === "hi"
                ? "आइए, एक ऐसे परिवार का हिस्सा बनें जो सेवा, संस्कृति और समाज के सशक्तिकरण में विश्वास रखता है। साथ मिलकर हम एक ऐसे भविष्य का निर्माण कर सकते हैं जहाँ शिक्षा, स्वास्थ्य, गौ सेवा, पर्यावरण संरक्षण और आध्यात्मिक चेतना से सभी का समग्र कल्याण और उत्थान हो सके।"
                : "Come, be a part of a family that believes in service, culture, and the empowerment of society. Together, we can create a future where education, health, cow protection, environmental conservation, and spiritual awareness bring holistic well-being and enlightened prosperity for all."}
            </p>

            {/* Trust Points / Micro Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-xs text-[#2B201A]/85 font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF3EA]/90 backdrop-blur-xs border border-[#E7D8C8]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2F5A43]" />
                {lang === "hi" ? "80G आयकर छूट" : "100% Tax Benefit (80G)"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF3EA]/90 backdrop-blur-xs border border-[#E7D8C8]">
                <Users className="w-3.5 h-3.5 text-[#E86F1D]" />
                {lang === "hi" ? "25,000+ सक्रिय सदस्य" : "25,000+ Devotee Members"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF3EA]/90 backdrop-blur-xs border border-[#E7D8C8]">
                <Heart className="w-3.5 h-3.5 text-[#E86F1D]" />
                {lang === "hi" ? "प्रत्यक्ष जनसेवा व गुरुकुल" : "Gurukul & Gau Seva"}
              </span>
            </div>

            {/* CTA Button */}
            <div className="pt-2 sm:pt-4">
              <a
                href="#membership-plans"
                className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <span>{lang === "hi" ? "सदस्यता योजनाएं देखें" : "Explore Membership Plans"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP TIERS (4 PRICING CARDS - RESPONSIVE 4-col -> 2-col -> 1-col) */}
      <section className="section-py" id="membership-plans">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto section-header space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">CHOOSE YOUR MEMBERSHIP TIER</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
              Join Our Seva Circle
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-[18px] p-6 flex flex-col justify-between transition-all duration-300 ${tier.cardStyle}`}
              >
                {tier.badgeText && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full z-10 whitespace-nowrap ${tier.badgeStyle}`}>
                    {tier.badgeText}
                  </div>
                )}

                <div className="card-body space-y-4">
                  <div>
                    <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                      {lang === "hi" ? tier.nameHi : tier.name}
                    </h3>
                    <p className="text-xs text-[#2B201A]/75 mt-1 leading-relaxed">{tier.desc}</p>
                  </div>

                  <div className="py-3 border-y border-[#2B201A]/10">
                    <span className={`font-sans text-3xl font-bold tracking-tight ${tier.priceColor}`}>
                      ₹{tier.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#2B201A]/60 ml-1.5 font-semibold">INR / {tier.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#2B201A]/85 font-sans pt-1">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tier.checkColor}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-action">
                  <button
                    onClick={() => openDonateModal(tier.name, tier.price, true)}
                    className={tier.buttonStyle}
                  >
                    Join Now — ₹{tier.price.toLocaleString("en-IN")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY BECOME A MEMBER (4 BENEFIT CARDS) */}
      <section className="section-py bg-[#FBF2E7]/50 border-t border-[#E7D8C8]">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto section-header space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">MEMBERSHIP BENEFITS</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
              Why Become a Member?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            <div className="card-warm bg-[#FFF9F2]">
              <div className="card-body space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#2B201A]">Spiritual Learning</h3>
                <p className="text-xs text-[#2B201A]/85 leading-relaxed">
                  Stay connected with value-based teachings, spiritual programs, discourses, and opportunities for deeper reflection.
                </p>
              </div>
            </div>

            <div className="card-warm bg-[#FFF9F2]">
              <div className="card-body space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#2F5A43]/10 text-[#2F5A43] flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#2B201A]">Seva Opportunities</h3>
                <p className="text-xs text-[#2B201A]/85 leading-relaxed">
                  Participate directly in service initiatives across education, welfare, medical camps, and community support.
                </p>
              </div>
            </div>

            <div className="card-warm bg-[#FFF9F2]">
              <div className="card-body space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#B8893E]/10 text-[#B8893E] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#2B201A]">Community Connection</h3>
                <p className="text-xs text-[#2B201A]/85 leading-relaxed">
                  Become part of a values-led network of members, volunteers, and supporters working toward a shared spiritual purpose.
                </p>
              </div>
            </div>

            <div className="card-warm bg-[#FFF9F2]">
              <div className="card-body space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#2B201A]">Meaningful Participation</h3>
                <p className="text-xs text-[#2B201A]/85 leading-relaxed">
                  Support a transparent mission where every contribution is directed toward practical community and spiritual initiatives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEVOTEE COMMUNITY / OUR ACTIVE MEMBERS CAROUSEL */}
      <section className="section-py">
        <div className="page-container max-w-5xl">
          <div className="text-center max-w-2xl mx-auto section-header space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">DEVOTEE COMMUNITY</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">Our Active Members</h2>
          </div>

          <MemberCarousel />
        </div>
      </section>

      {/* MEMBERSHIP REGISTRATION FORM */}
      <section className="section-py bg-[#FBF2E7]/60 border-t border-[#E7D8C8]">
        <div className="page-container max-w-3xl">
          <div className="card-warm p-8 sm:p-12 space-y-8">
            <div className="text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">REGISTRATION</p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">Membership Registration</h2>
              <p className="text-sm text-[#2B201A]/75">Choose your plan and share your details to complete your membership.</p>
            </div>

            <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
              <fieldset>
                <legend className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-2">
                  Membership Plan *
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MEMBERSHIP_PLANS.map((p) => {
                    const selected = planId === p.id;
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
                          <span className="text-sm font-semibold text-[#2B201A]">{p.name}</span>
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
                    Full Name *
                  </label>
                  <input
                    id="mem-fullname"
                    type="text"
                    required
                    maxLength={60}
                    placeholder="Enter your full name"
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
                    Email Address *
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
                    Phone Number *
                  </label>
                  <input
                    id="mem-phone"
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/\D/g, "").slice(0, 10);
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
                  Next, you&apos;ll pay by UPI to the Trust&apos;s account. Once the Trust confirms your payment, your membership
                  confirmation and certificate are emailed to you.
                </span>
              </p>

              <button type="submit" className="btn-primary w-full">
                Continue to Payment — {formatINR((MEMBERSHIP_PLANS.find((p) => p.id === planId) ?? MEMBERSHIP_PLANS[0]).price)}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
