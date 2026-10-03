"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Shield, Heart, Users, BookOpen, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import MemberCarousel from "@/components/MemberCarousel";

export default function MembershipPage() {
  const { lang, openDonateModal } = useApp();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    city: "",
    state: "",
    message: "",
  });

  const tiers = [
    {
      name: "Membership",
      nameHi: "साधारण सदस्यता",
      price: 1100,
      period: "per year",
      desc: "Ideal for devotees starting their journey of seva and spiritual learning.",
      features: [
        "Annual Trust Membership Certificate",
        "Monthly Spiritual Newsletter & E-books",
        "Invitation to Annual Spiritual Gathering",
        "Direct Seva Participation Opportunities",
      ],
      highlight: false,
    },
    {
      name: "Silver Membership",
      nameHi: "रजत (सिल्वर) सदस्यता",
      price: 5100,
      period: "per year",
      desc: "For dedicated supporters wishing to sponsor education and health camps.",
      features: [
        "All Basic Membership Benefits",
        "Sponsorship of 1 Gurukul Student Education",
        "Special Prasad & Blessing Card from Ashram",
        "Priority Seat Booking at Bhagwat Katha Events",
      ],
      highlight: false,
    },
    {
      name: "Gold Membership",
      nameHi: "स्वर्ण (गोल्ड) सदस्यता",
      price: 11000,
      period: "per year",
      desc: "Empowering women skill workshops and farmer advisory guidance.",
      features: [
        "All Silver Membership Benefits",
        "Sponsorship of Women Skill Training Kit",
        "Special Recognition on Trust Member Roll",
        "Direct Advisory Updates from Trust Board",
      ],
      highlight: true,
    },
    {
      name: "Platinum Membership",
      nameHi: "प्लेटिनम सदस्यता",
      price: 51000,
      period: "lifetime / patron",
      desc: "Patron level partnership supporting major infrastructure & medical camps.",
      features: [
        "Lifetime Trustee Honor & Framed Scroll",
        "Full Sponsorship of Rural Health Camp",
        "VIP Seating & Stage Felicitation",
        "Permanent Inscription at Ashram Wall",
      ],
      highlight: false,
    },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="w-full space-y-0">
      {/* HERO SECTION */}
      <section className="relative py-14 md:py-20 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container text-center space-y-4 max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">JOIN OUR SPIRITUAL FAMILY</p>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B201A]">
            Together for a Better Tomorrow
          </h1>
          <p className="text-base sm:text-lg text-[#2B201A]/85 leading-relaxed font-sans max-w-2xl mx-auto">
            Become part of a spiritual family committed to Dharma, education, community service, and humanitarian welfare. Every membership strengthens the Trust’s ability to serve with greater consistency and reach.
          </p>
        </div>
      </section>

      {/* MEMBERSHIP TIERS (4 PRICING CARDS - RESPONSIVE 4-col -> 2-col -> 1-col) */}
      <section className="section-py">
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
                className={`card-warm ${
                  tier.highlight ? "card-warm-highlight relative border-2 border-[#E86F1D]" : ""
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#E86F1D] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-warm-sm">
                    MOST POPULAR TIER
                  </div>
                )}

                <div className="card-body space-y-4">
                  <div>
                    <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                      {lang === "hi" ? tier.nameHi : tier.name}
                    </h3>
                    <p className="text-xs text-[#2B201A]/75 mt-1 leading-relaxed">{tier.desc}</p>
                  </div>

                  <div className="py-3 border-y border-[#E7D8C8]">
                    <span className="font-editorial text-3xl font-bold text-[#E86F1D]">
                      ₹{tier.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#2B201A]/60 ml-1.5 font-semibold">INR / {tier.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#2B201A]/85 font-sans pt-1">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2F5A43] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-action">
                  <button
                    onClick={() => openDonateModal(tier.name, tier.price)}
                    className={tier.highlight ? "btn-primary w-full" : "btn-outline w-full"}
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
              <p className="text-sm text-[#2B201A]/75">Please share your details to complete your membership registration.</p>
            </div>

            {formSubmitted ? (
              <div className="p-8 bg-[#FFF9F2] rounded-2xl text-center space-y-4 border border-[#2F5A43]">
                <CheckCircle2 className="w-12 h-12 text-[#2F5A43] mx-auto" />
                <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">Registration Submitted!</h3>
                <p className="text-sm text-[#2B201A]/85">
                  Thank you, <strong>{formData.fullName}</strong>. Our team will contact you shortly to complete your membership certificate issuance.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="btn-primary"
                >
                  Submit Another Registration
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="input-warm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-warm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-warm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Your age"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="input-warm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input-warm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="Your state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="input-warm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                    Message / Seva Interest
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share any special interest in education, health, or farmer welfare seva..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-warm"
                  />
                </div>

                {/* AUTHENTIC PAYMENT QR CODE PANEL */}
                <div className="p-6 bg-[#FFF9F2] rounded-2xl border border-[#B8893E]/40 text-center space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">OFFICIAL TRUST PAYMENT QR</p>
                  <div className="relative w-44 h-44 mx-auto border-2 border-[#B8893E] rounded-xl overflow-hidden p-1 bg-white shadow-warm-sm">
                    <Image src="/images/qr-code.jpg" alt="Official Payment QR" fill className="object-contain" />
                  </div>
                  <p className="text-xs text-[#2B201A]/80">
                    Scan to transfer contribution directly or click Submit below to initiate gateway payment.
                  </p>
                </div>

                <button type="submit" className="btn-primary w-full">
                  Submit Registration
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
