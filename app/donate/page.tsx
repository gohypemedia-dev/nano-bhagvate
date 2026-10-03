"use client";

import React from "react";
import Image from "next/image";
import { Heart, BookOpen, Sprout, GraduationCap, Sun, ShieldCheck, QrCode } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function DonatePage() {
  const { lang, openDonateModal } = useApp();

  const programs = [
    {
      id: "general",
      title: "General Donation",
      titleHi: "सामान्य सेवा अंशदान",
      desc: "Support the Trust’s daily activities, social welfare initiatives, spiritual discourses, and emergency community development programs.",
      icon: Heart,
      color: "text-[#E86F1D]",
      bg: "bg-[#E86F1D]/10",
    },
    {
      id: "gita",
      title: "Bhagavad Gita Program",
      titleHi: "भगवद गीता प्रचार एवं शिक्षा",
      desc: "Help share the teachings, moral values, and wisdom of the Bhagavad Gita through spiritual education and distribution of sacred texts to youth.",
      icon: BookOpen,
      color: "text-[#B8893E]",
      bg: "bg-[#B8893E]/10",
    },
    {
      id: "farmers",
      title: "Farmers Program",
      titleHi: "किसान जागरूकता एवं मार्गदर्शन",
      desc: "Support rural development, farmer awareness camps, sugarcane soil science guidance, and initiatives that strengthen sustainable livelihoods.",
      icon: Sprout,
      color: "text-[#2F5A43]",
      bg: "bg-[#2F5A43]/10",
    },
    {
      id: "girls-education",
      title: "Girls Education Program",
      titleHi: "कन्या शिक्षा एवं स्वावलंबन",
      desc: "Help girls in underserved rural communities access quality education, books, digital learning tools, and opportunities for a self-reliant future.",
      icon: GraduationCap,
      color: "text-[#E86F1D]",
      bg: "bg-[#E86F1D]/10",
    },
    {
      id: "spirituality",
      title: "Spirituality Program",
      titleHi: "आध्यात्मिक शिविर एवं योग सेवा",
      desc: "Support meditation retreats, devotional discourses, Ayurvedic workshops, and programs that encourage inner balance and cultural values.",
      icon: Sun,
      color: "text-[#B8893E]",
      bg: "bg-[#B8893E]/10",
    },
  ];

  return (
    <div className="w-full space-y-0">
      {/* HERO SECTION */}
      <section className="relative py-14 md:py-20 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container text-center space-y-4 max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">SEVA & CHARITY</p>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B201A]">
            Be the Reason Someone Smiles
          </h1>
          <p className="text-base sm:text-lg text-[#2B201A]/85 leading-relaxed font-sans max-w-2xl mx-auto">
            Your contribution helps bring hope, dignity, learning, and support to communities through the Trust’s spiritual, educational, and humanitarian initiatives.
          </p>
        </div>
      </section>

      {/* 5 DONATION PROGRAM CARDS */}
      <section className="section-py">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto section-header space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">CHOOSE A CAUSE</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
              Direct Your Seva Contribution
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {programs.map((prog) => {
              const IconComp = prog.icon;
              return (
                <div key={prog.id} className="card-warm">
                  <div className="card-body space-y-4">
                    <div className={`w-12 h-12 rounded-2xl ${prog.bg} ${prog.color} flex items-center justify-center`}>
                      <IconComp className="w-6 h-6 stroke-[2]" />
                    </div>
                    <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                      {lang === "hi" ? prog.titleHi : prog.title}
                    </h3>
                    <p className="text-sm text-[#2B201A]/85 leading-relaxed font-sans">
                      {prog.desc}
                    </p>
                  </div>

                  <div className="card-action">
                    <button
                      onClick={() => openDonateModal(prog.title)}
                      className="btn-primary w-full"
                    >
                      <Heart className="w-4 h-4 fill-current text-white" />
                      <span>Donate Now</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CENTERED SCAN & SUPPORT PANEL */}
      <section className="section-py bg-[#FBF2E7]/60 border-t border-[#E7D8C8]">
        <div className="page-container max-w-4xl">
          <div className="card-warm border-2 border-[#B8893E]/50 text-center p-8 sm:p-12 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FFF9F2] border border-[#B8893E]/30 rounded-full text-xs font-bold uppercase tracking-widest text-[#B8893E] mx-auto">
              <QrCode className="w-4 h-4" />
              <span>OFFICIAL UPI QR CODE</span>
            </div>

            <h2 className="font-editorial text-3xl font-bold text-[#2B201A]">Scan & Support</h2>
            <p className="text-sm text-[#2B201A]/85 max-w-lg mx-auto">
              Scan the official Trust QR code below using any UPI app (BHIM, Google Pay, PhonePe, Paytm) to contribute instantly and securely.
            </p>

            {/* QR Container */}
            <div className="relative w-60 h-60 mx-auto rounded-2xl overflow-hidden border-4 border-[#B8893E] p-2 bg-white shadow-2xl">
              <Image src="/images/qr-code.jpg" alt="Official Trust Payment QR" fill className="object-contain" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-[#2B201A]">Namo Bhagwate Vasudevaya Trust</p>
              <p className="text-xs font-mono text-[#E86F1D] font-bold">UPI ID: namobhagwate@upi</p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-[#2B201A]/75 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#2F5A43]" />
              <span>All contributions are securely processed and receipts issued via email.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
