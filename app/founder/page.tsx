"use client";

import React from "react";
import Image from "next/image";
import { Quote, Sparkles, Sun, Feather, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function FounderPage() {
  const { lang, openDonateModal } = useApp();

  const commitmentAreas = [
    "Spiritual Education and Value-Based Learning",
    "Women’s Empowerment & Financial Independence",
    "Youth Mentorship and Leadership Development",
    "Farmer Welfare & Sustainable Agriculture",
    "Health Awareness and Community Well-being",
    "Yoga, Meditation and Ayurvedic Lifestyle",
    "Environmental Conservation and Tree Plantation",
    "Police Welfare & Community Safety Support",
    "Support for Armed Forces Personnel & Families",
    "Legal Awareness & Social Assistance",
    "Humanitarian Service for Underprivileged Citizens",
  ];

  return (
    <div className="w-full space-y-0">
      {/* HERO SECTION */}
      <section className="relative py-14 md:py-20 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF9F2] border border-[#B8893E]/30 text-[#E86F1D] text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-[#B8893E]" />
                <span>FOUNDER'S VISION</span>
              </div>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B201A] leading-[1.12]">
                A Life Guided by Faith.
                <br />
                <span className="text-[#E86F1D]">A Mission Expressed Through Seva.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#2B201A]/85 leading-relaxed font-sans">
                Pujya Sadhvi Vijeshanand Saraswati Ji has dedicated her spiritual journey to the teachings of the Bhagavad Gita, devotion to Lord Shri Krishna, and selfless service to humanity.
              </p>
            </div>

            {/* Right photo card */}
            <div className="lg:col-span-5 relative w-full">
              <div className="relative rounded-[28px] overflow-hidden border-4 border-[#FFF9F2] shadow-2xl aspect-[1.58/1]">
                <Image
                  src="/images/founder-hero-card.jpg"
                  alt="Pujya Sadhvi Vijeshanand Saraswati Ji - Founder"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
                />
                {/* Reduced Height & Intensity Dark Gradient Overlay at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-[32%] bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />
                
                {/* Lower-left Clean Text Overlay */}
                <div className="founder-text-overlay">
                  <div className="founder-label">FOUNDER</div>
                  <div className="founder-name">
                    Pujya Sadhvi Vijeshanand Saraswati Ji
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER PROFILE & PHILOSOPHY */}
      <section className="section-py">
        <div className="page-container max-w-5xl space-y-10">
          <div className="card-warm bg-[#FFF9F2]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#E86F1D]/10 text-[#E86F1D] rounded-xl shrink-0">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">BIOGRAPHY</p>
                <h2 className="font-editorial text-3xl font-bold text-[#2B201A]">Founder Profile</h2>
              </div>
            </div>
            <div className="prose prose-lg text-[#2B201A]/85 font-sans leading-relaxed space-y-4">
              <p>
                <strong>Pujya Sadhvi Vijeshanand Saraswati Ji</strong> is a revered spiritual teacher and humanitarian whose work centers on Bhagavad Gita teachings, selfless service, moral values, and community upliftment. From a young age, the sacred <em>“Om Namo Bhagwate Vasudevaya”</em> Mahamantra became an integral part of her spiritual practice and continues to guide her life and work.
              </p>
              <p>
                She describes the Trust not merely as an organization, but as a platform for seva — a way to turn devotion, compassion, and spiritual discipline into practical service for society. In 2019, this vision took institutional form through the establishment of <strong>Namo Bhagwate Vasudevaya Trust</strong>.
              </p>
            </div>
          </div>

          {/* PHILOSOPHY QUOTE CARD */}
          <div className="card-warm border-2 border-[#B8893E]/50 text-center relative overflow-hidden p-8 sm:p-12 space-y-4">
            <Quote className="w-16 h-16 text-[#B8893E]/20 mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">FOUNDER'S PHILOSOPHY</p>
            <blockquote className="font-editorial text-2xl sm:text-3xl text-[#2B201A] italic leading-relaxed max-w-3xl mx-auto">
              “Do not live in worry — live through righteous action. Let every thought, word and deed be guided by purity, responsibility and faith.”
            </blockquote>
            <p className="text-xs font-bold text-[#B8893E] uppercase tracking-wider">
              — Pujya Sadhvi Vijeshanand Saraswati Ji
            </p>
          </div>

          {/* HER VISION IN PRACTICE */}
          <div className="card-warm bg-[#FFF9F2]">
            <h2 className="font-editorial text-3xl font-bold text-[#2B201A] mb-4">Her Vision in Practice</h2>
            <p className="text-base sm:text-lg text-[#2B201A]/85 leading-relaxed font-sans">
              Her approach brings together <strong>Karma Yoga</strong> (selfless action), <strong>Nishkama Seva</strong> (service without expectation), devotion, truth, compassion, humility, and universal goodwill. Through the Trust, these spiritual principles are directly translated into educational scholarships, Gurukuls, farmer training, women empowerment centers, and emergency humanitarian relief.
            </p>
          </div>
        </div>
      </section>

      {/* OUR COMMITMENT TO SOCIETY (ELEGANT AUTO-FIT GRID) */}
      <section className="section-py bg-[#FBF2E7]/60 border-t border-[#E7D8C8]">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto section-header space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">SOCIAL SPECTRUM</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
              Our Commitment to Society
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {commitmentAreas.map((area, idx) => (
              <div
                key={idx}
                className="bg-[#FFF9F2] p-5 rounded-2xl border border-[#E7D8C8] flex items-center gap-3 shadow-warm-sm hover:border-[#E86F1D] transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-[#2F5A43] shrink-0" />
                <span className="text-sm font-medium text-[#2B201A]">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HER LIFE MESSAGE */}
      <section className="section-py">
        <div className="page-container max-w-4xl">
          <div className="bg-gradient-to-r from-[#2B201A] to-[#3D2C24] text-white rounded-3xl p-8 sm:p-12 border-2 border-[#B8893E] shadow-2xl text-center space-y-6">
            <Feather className="w-10 h-10 text-[#B8893E] mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">HER LIFE MESSAGE</p>
            <blockquote className="font-editorial text-xl sm:text-2xl italic leading-relaxed text-white/95 max-w-2xl mx-auto">
              “Place your faith in Lord Shri Krishna. Let your actions be pure and selfless. Honor your parents, teachers and elders. Nurture body and mind with discipline and wisdom. Wherever life takes you, spread love, kindness, service and hope.”
            </blockquote>
            <div className="pt-2">
              <button
                onClick={() => openDonateModal("Founder's Vision Seva")}
                className="btn-primary"
              >
                Support Her Vision
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
