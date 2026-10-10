"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Heart, ArrowUp } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Footer() {
  const { lang, openDonateModal } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#FBF2E7] border-t border-[#E7D8C8] text-[#2B201A] relative pt-16 pb-12">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#E7D8C8]">
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#B8893E] bg-white">
                <Image
                  src="/images/logo.jpg"
                  alt="Namo Bhagwate Vasudevaya Trust Logo"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#2B201A]">
                  NAMO BHAGWATE
                </h3>
                <p className="text-xs font-semibold tracking-wider text-[#B8893E]">
                  VASUDEVAYA TRUST
                </p>
              </div>
            </div>
            <p className="text-sm text-[#2B201A]/85 leading-relaxed">
              {lang === "hi"
                ? "भगवद गीता के कालातीत ज्ञान से प्रेरित होकर, नमो भगवते वासुदेवाय ट्रस्ट शिक्षा, समाज सेवा और मानवीय सहायता के माध्यम से जीवन को उन्नत करने के लिए समर्पित है।"
                : "Guided by the timeless wisdom of the Bhagavad Gita, Namo Bhagwate Vasudevaya Trust works to uplift lives through spiritual education, community service, and compassionate action."}
            </p>
            <div className="pt-2">
              <button
                onClick={() => openDonateModal("General Donation")}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E86F1D] hover:bg-[#D25E12] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-warm-sm transition-all"
              >
                <Heart className="w-4 h-4 fill-current text-white" />
                <span>{lang === "hi" ? "सेवा का समर्थन करें" : "Support Our Seva"}</span>
              </button>
            </div>
          </div>

          {/* Column 1: Links */}
          <div className="space-y-3">
            <h4 className="font-editorial text-lg font-bold text-[#E86F1D] border-b border-[#E7D8C8] pb-1.5 inline-block">
              {lang === "hi" ? "त्वरित संपर्क" : "Quick Links"}
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link href="/" className="hover:text-[#E86F1D] transition-colors">
                  {lang === "hi" ? "मुख्य पृष्ठ (Home)" : "Home"}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#E86F1D] transition-colors">
                  {lang === "hi" ? "हमारे बारे में (About Us)" : "About Us"}
                </Link>
              </li>
              <li>
                <Link href="/founder" className="hover:text-[#E86F1D] transition-colors">
                  {lang === "hi" ? "संस्थापक का दृष्टिकोण (Founder's Vision)" : "Founder's Vision"}
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-[#E86F1D] transition-colors">
                  {lang === "hi" ? "सदस्यता (Membership)" : "Membership"}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#E86F1D] transition-colors">
                  {lang === "hi" ? "हमारी झलकियाँ (Gallery)" : "Gallery & Moments"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#E86F1D] transition-colors">
                  {lang === "hi" ? "संपर्क करें (Contact Us)" : "Contact Us"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Our Work (Strictly NO Gallery link!) */}
          <div className="space-y-3">
            <h4 className="font-editorial text-lg font-bold text-[#E86F1D] border-b border-[#E7D8C8] pb-1.5 inline-block">
              {lang === "hi" ? "हमारा कार्य" : "Our Work"}
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link href="/initiatives" className="hover:text-[#E86F1D] transition-colors">
                  {lang === "hi" ? "हमारी पहल (Our Initiatives)" : "Our Initiatives"}
                </Link>
              </li>
              <li>
                <Link href="/donate" className="hover:text-[#E86F1D] transition-colors">
                  {lang === "hi" ? "दान एवं सेवा (Donate)" : "Donate & Seva"}
                </Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-[#E86F1D] transition-colors">
                  {lang === "hi" ? "गन्ना खेती मार्गदर्शिका (Books)" : "Books & Publications"}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#E86F1D] transition-colors">
                  {lang === "hi" ? "गोपनीयता नीति (Privacy Policy)" : "Privacy Policy"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-3">
            <h4 className="font-editorial text-lg font-bold text-[#E86F1D] border-b border-[#E7D8C8] pb-1.5 inline-block">
              {lang === "hi" ? "संपर्क विवरण" : "Contact Details"}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#B8893E] shrink-0 mt-0.5" />
                <span className="text-[#2B201A]/85 leading-snug">
                  P6/10, 4th Floor, DLF Phase 2, Gurugram, Haryana 122008, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#B8893E] shrink-0" />
                <a href="tel:+918860665000" className="text-[#2B201A]/85 hover:text-[#E86F1D] font-semibold">
                  +91 88606 65000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#B8893E] shrink-0" />
                <a href="mailto:help@namobhagwatevasudevaya.com" className="text-[#2B201A]/85 hover:text-[#E86F1D] break-all font-semibold">
                  help@namobhagwatevasudevaya.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#2B201A]/75 font-medium text-center sm:text-left">
          <p>© {new Date().getFullYear()} Namo Bhagwate Vasudevaya Trust. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 sm:gap-4">
            <Link href="/privacy-policy" className="hover:text-[#E86F1D] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <span>Reg. No: Trust/2019/NBVT</span>
            <button
              onClick={scrollToTop}
              className="ml-1 p-2.5 bg-[#FFF9F2] hover:bg-[#E86F1D] hover:text-white rounded-xl border border-[#E7D8C8] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
