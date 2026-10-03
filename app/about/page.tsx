"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Sprout, GraduationCap, Users, Sun, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function AboutPage() {
  const { lang, openDonateModal } = useApp();

  const commitmentCards = [
    {
      title: "Farmer Welfare",
      titleHi: "किसान कल्याण एवं मार्गदर्शन",
      desc: "Working with farmers — including sugarcane growers — to share modern agricultural knowledge, soil health science, and sustainable practices that improve crop yield and rural livelihoods.",
      image: "/images/initiative-farmers.jpg",
      icon: Sprout,
    },
    {
      title: "Women’s Empowerment",
      titleHi: "महिला सशक्तिकरण एवं स्वावलंबन",
      desc: "Equipping women with practical skills, financial literacy, and entrepreneurship resources that support self-reliance and strengthen leadership within families and villages.",
      image: "/images/initiative-women.jpg",
      icon: Users,
    },
    {
      title: "Youth Empowerment",
      titleHi: "युवा विकास एवं मार्गदर्शन",
      desc: "Providing young people with character-building guidance, skill-building workshops, and mentorship so they can grow into confident and grounded contributors to society.",
      image: "/images/initiative-education.jpg",
      icon: GraduationCap,
    },
    {
      title: "Spiritual Education",
      titleHi: "आध्यात्मिक एवं नैतिक शिक्षा",
      desc: "Introducing children and young minds to Bhagavad Gita teachings, Sanskrit heritage, and meditation practices that cultivate mental focus, resilience, moral values, and inner peace.",
      image: "/images/krishna.jpg",
      icon: Sun,
    },
  ];

  return (
    <div className="w-full space-y-0">
      {/* HERO SECTION */}
      <section className="relative py-14 md:py-20 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF9F2] border border-[#B8893E]/30 text-[#E86F1D] text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-[#B8893E]" />
                <span>ABOUT NAMO BHAGWATE VASUDEVAYA TRUST</span>
              </div>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B201A] leading-[1.12]">
                Rooted in Wisdom.
                <br />
                <span className="text-[#E86F1D]">Driven by Service.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#2B201A]/85 leading-relaxed font-sans">
                Namo Bhagwate Vasudevaya Trust brings spiritual wisdom and practical service together to strengthen individuals, families, and communities across India.
              </p>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-4 border-[#FFF9F2] shadow-warm-lg aspect-[4/3]">
                <Image
                  src="/images/initiative-education.jpg"
                  alt="Gurukul Students & Heritage"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT THE TRUST STORY & MISSION JOURNEY */}
      <section className="section-py">
        <div className="page-container max-w-5xl space-y-10">
          <div className="card-warm">
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A] mb-4">
              About the Trust
            </h2>
            <div className="prose prose-lg text-[#2B201A]/85 font-sans leading-relaxed space-y-4">
              <p>
                Founded in 2019 by Pujya Sadhvi Vijeshanand Saraswati Ji, Namo Bhagwate Vasudevaya Trust was created with a simple belief: <strong>ancient wisdom and modern progress can work together seamlessly.</strong> Inspired by the teachings of the Bhagavad Gita, the Trust channels spiritual learning into meaningful action across education, empowerment, welfare, and community service.
              </p>
              <p>
                Our work is guided by four core pillars: <strong>spiritual education, women’s empowerment, youth empowerment, and farmer welfare.</strong> Each initiative is designed to strengthen inner confidence while creating practical opportunities for a more secure and dignified life.
              </p>
            </div>
          </div>

          <div className="card-warm bg-[#FFF9F2]">
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A] mb-4">
              Our Mission Journey
            </h2>
            <div className="prose prose-lg text-[#2B201A]/85 font-sans leading-relaxed space-y-4">
              <p>
                Our journey began with introducing young minds to the teachings of the Bhagavad Gita and meditation as tools for focus, resilience, and lifelong well-being. Over time, the mission expanded to serve the practical needs of communities — from women seeking financial independence and young people building skills, to farmers adopting better agricultural practices.
              </p>
              <p>
                We believe meaningful empowerment happens when inner strength meets real opportunity. A child who learns calm and discipline is better prepared for life. A woman with skills and confidence can strengthen an entire family. A farmer with practical knowledge can improve both livelihood and future resilience.
              </p>
            </div>
          </div>

          {/* BRAND STATEMENT BANNER */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#B8893E] p-8 md:p-12 text-center bg-gradient-to-r from-[#2B201A] to-[#3D2C24] text-white shadow-warm-md">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E] mb-3">BRAND STATEMENT</p>
            <blockquote className="font-editorial text-2xl sm:text-3xl italic leading-relaxed max-w-3xl mx-auto">
              “We are, at heart, a community of teachers, practitioners and service-minded people — working village by village, school by school and family by family.”
            </blockquote>
          </div>

          {/* MISSION STATEMENT BANNER */}
          <div className="card-warm text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D] mb-2">CORE PURPOSE</p>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A]">
              Mission Statement
            </h3>
            <p className="font-editorial text-xl sm:text-2xl text-[#E86F1D] italic mt-2">
              “To nurture the mind, uplift the community, and root every action in the timeless wisdom of the Bhagavad Gita.”
            </p>
          </div>
        </div>
      </section>

      {/* WE ARE COMMITTED TO (4 LARGE COMMITMENT CARDS) */}
      <section className="section-py bg-[#FBF2E7]/50 border-t border-[#E7D8C8]">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto section-header space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">Pillars of Impact</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
              We Are Dedicated To
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {commitmentCards.map((card, idx) => {
              const IconComponent = card.icon;
              return (
                <div key={idx} className="card-warm p-0 overflow-hidden">
                  <div className="relative aspect-[16/10] w-full">
                    <Image src={card.image} alt={card.title} fill className="object-cover" />
                  </div>
                  <div className="p-6 sm:p-8 card-body space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#E86F1D]/10 text-[#E86F1D] shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[#2B201A]/85 leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="p-6 sm:px-8 sm:pb-8 pt-0 card-action">
                    <Link href="/initiatives" className="btn-outline w-full">
                      <span>Learn More About Initiatives</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CLOSING LINE */}
      <section className="section-py">
        <div className="page-container max-w-4xl text-center">
          <div className="card-warm border-[#B8893E]/40 p-8 sm:p-12">
            <p className="font-editorial text-xl sm:text-2xl text-[#2B201A] font-semibold leading-relaxed">
              “Ancient values and modern capability, walking together — one child, one woman, one young person and one farmer at a time.”
            </p>
            <div className="pt-6">
              <button
                onClick={() => openDonateModal("General Donation")}
                className="btn-primary"
              >
                Support Our Work
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
