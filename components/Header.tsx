"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Globe, Menu, X, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Header() {
  const pathname = usePathname();
  const { lang, setLang, cartCount, setIsCartOpen, openDonateModal } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation Links including dedicated Gallery page
  const navLinks = [
    { href: "/", label: lang === "hi" ? "मुख्य पृष्ठ" : "Home" },
    { href: "/about", label: lang === "hi" ? "हमारे बारे में" : "About Us" },
    { href: "/initiatives", label: lang === "hi" ? "हमारी पहल" : "Our Initiatives" },
    { href: "/gallery", label: lang === "hi" ? "झलकियाँ" : "Gallery" },
    { href: "/founder", label: lang === "hi" ? "संस्थापक का दृष्टिकोण" : "Founder’s Vision" },
    { href: "/membership", label: lang === "hi" ? "सदस्यता" : "Membership" },
    { href: "/books", label: lang === "hi" ? "पुस्तकें" : "Books" },
    { href: "/contact", label: lang === "hi" ? "संपर्क" : "Contact" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FFF9F2]/95 backdrop-blur-md shadow-warm-sm border-b border-[#E7D8C8]"
          : "bg-[#FFF9F2] border-b border-[#E7D8C8]/60"
      }`}
    >
      {/* DESKTOP 3-ZONE GRID LAYOUT (visible >= 1200px / xl) */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 box-border">
        {/* DESKTOP HEADER GRID */}
        <div className="hidden xl:grid grid-cols-[285px_minmax(0,1fr)_auto] items-center h-[80px] gap-7">
          
          {/* 1. LEFT: Trust Logo + Brand Name (285px width) */}
          <Link href="/" className="flex items-center gap-3 shrink-0 min-w-0 group whitespace-nowrap">
            <div className="relative w-[54px] h-[54px] rounded-full overflow-hidden border-2 border-[#B8893E] shadow-sm transition-transform group-hover:scale-105 shrink-0 bg-white">
              <Image
                src="/images/logo.jpg"
                alt="Namo Bhagwate Vasudevaya Trust Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col shrink-0 min-w-0">
              <span className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-[#2B201A] leading-tight group-hover:text-[#E86F1D] transition-colors whitespace-nowrap">
                NAMO BHAGWATE
              </span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-[#B8893E] uppercase whitespace-nowrap">
                VASUDEVAYA TRUST
              </span>
            </div>
          </Link>

          {/* 2. CENTER: Navigation Menu (Centered in middle grid column) */}
          <nav className="flex items-center justify-center gap-1.5 xl:gap-2 2xl:gap-4 min-w-0 whitespace-nowrap">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-lg text-xs 2xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                    isActive
                      ? "text-[#E86F1D] bg-[#FBF2E7] font-bold"
                      : "text-[#2B201A]/85 hover:text-[#E86F1D] hover:bg-[#FBF2E7]/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* 3. RIGHT: Language Selector + Cart + Orange Donate Button */}
          <div className="flex items-center justify-end gap-3.5 shrink-0 whitespace-nowrap">
            {/* Language Selector */}
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E7D8C8] text-xs font-bold text-[#2B201A] hover:bg-[#FBF2E7] transition-colors min-h-[44px]"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-[#B8893E]" />
              <span>{lang === "en" ? "हिन्दी" : "English"}</span>
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-[#2B201A] hover:text-[#E86F1D] rounded-xl hover:bg-[#FBF2E7] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E86F1D] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Orange Donate CTA Button */}
            <button
              onClick={() => openDonateModal("General Donation")}
              className="flex items-center gap-1.5 h-[48px] px-5 bg-[#E86F1D] hover:bg-[#D25E12] text-white text-xs font-bold uppercase tracking-wider rounded-[14px] shadow-warm-sm hover:shadow-warm-md transition-all shrink-0"
            >
              <Heart className="w-4 h-4 fill-current text-white" />
              <span>{lang === "hi" ? "दान करें" : "Donate"}</span>
            </button>
          </div>

        </div>

        {/* MOBILE / TABLET HEADER BAR (< 1200px / xl) */}
        <div className="flex xl:hidden items-center justify-between h-[72px] sm:h-[76px] gap-2">
          {/* Mobile Logo + Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 group shrink">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#B8893E] shadow-sm shrink-0 bg-white">
              <Image
                src="/images/logo.jpg"
                alt="Namo Bhagwate Vasudevaya Trust Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0 shrink">
              <span className="font-editorial text-sm sm:text-base font-bold tracking-tight text-[#2B201A] leading-tight truncate">
                NAMO BHAGWATE
              </span>
              <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider text-[#B8893E] uppercase truncate">
                VASUDEVAYA TRUST
              </span>
            </div>
          </Link>

          {/* Mobile Controls: Language + Cart + Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border border-[#E7D8C8] text-[11px] sm:text-xs font-bold text-[#2B201A] hover:bg-[#FBF2E7] transition-colors min-h-[40px]"
            >
              <Globe className="w-3.5 h-3.5 text-[#B8893E]" />
              <span>{lang === "en" ? "हिन्दी" : "EN"}</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#2B201A] rounded-xl hover:bg-[#FBF2E7] min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E86F1D] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#2B201A] rounded-xl hover:bg-[#FBF2E7] min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE / TABLET MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#FFF9F2] border-b border-[#E7D8C8] px-4 pt-3 pb-6 space-y-3 shadow-warm-md animate-in slide-in-from-top duration-200">
          <div className="grid gap-1 py-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors flex items-center min-h-[44px] ${
                  pathname === link.href
                    ? "bg-[#FBF2E7] text-[#E86F1D] font-bold"
                    : "text-[#2B201A] hover:bg-[#FBF2E7]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E7D8C8]/60">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openDonateModal("General Donation");
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#E86F1D] text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-warm-md min-h-[48px]"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>{lang === "hi" ? "दान करें (Donate Now)" : "Donate Now"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
