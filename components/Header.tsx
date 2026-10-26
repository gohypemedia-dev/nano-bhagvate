"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Globe, Menu, X, Heart, User } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Header() {
  const pathname = usePathname();
  const { lang, setLang, cartCount, setIsCartOpen, openDonateModal, user, isLoadingUser, openAuthModal } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


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
      {/* DESKTOP 3-ZONE GRID LAYOUT (visible >= 1024px / lg) */}
      <div className="max-w-[1560px] w-full mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 2xl:px-10 box-border">
        {/* DESKTOP HEADER (visible >= 1000px) */}
        <div className="hidden min-[1000px]:flex items-center justify-between h-[76px] xl:h-[82px] gap-2 lg:gap-3 xl:gap-6">
          
          {/* 1. LEFT: Trust Logo + Brand Name (Enlarged for readability per PM Audit) */}
          <Link href="/" className="flex items-center gap-2 xl:gap-3 shrink-0 min-w-0 group whitespace-nowrap">
            <div className="relative w-[48px] h-[48px] xl:w-[56px] xl:h-[56px] 2xl:w-[62px] 2xl:h-[62px] rounded-full overflow-hidden border-2 border-[#B8893E] shadow-sm transition-transform group-hover:scale-105 shrink-0 bg-white">
              <Image
                src="/images/logo.jpg"
                alt="Namo Bhagwate Vasudevaya Trust Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col shrink-0 min-w-0 justify-center">
              <span className="font-editorial text-[14px] xl:text-[17px] 2xl:text-xl font-bold tracking-tight text-[#2B201A] leading-tight group-hover:text-[#E86F1D] transition-colors whitespace-nowrap">
                NAMO BHAGWATE
              </span>
              <span className="text-[9px] xl:text-[10.5px] 2xl:text-xs font-extrabold tracking-[0.14em] text-[#B8893E] uppercase whitespace-nowrap">
                VASUDEVAYA TRUST
              </span>
            </div>
          </Link>

          {/* 2. CENTER: Navigation Menu (Active down to 1024px per PM Audit) */}
          <nav className="flex items-center justify-center gap-0.5 xl:gap-1.5 2xl:gap-2.5 min-w-0 whitespace-nowrap px-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-1.5 lg:px-2 xl:px-2.5 py-1.5 rounded-lg text-[11px] xl:text-[12.5px] 2xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                    isActive
                      ? "text-[#E86F1D] bg-[#FBF2E7] font-bold shadow-xs"
                      : "text-[#2B201A]/85 hover:text-[#E86F1D] hover:bg-[#FBF2E7]/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* 3. RIGHT: Language Selector + Cart + Account + Orange Donate Button */}
          <div className="flex items-center justify-end gap-1.5 xl:gap-2.5 2xl:gap-3.5 shrink-0 whitespace-nowrap">
            {/* Language Selector */}
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1 xl:gap-1.5 px-2 xl:px-3 py-1.5 rounded-xl border border-[#E7D8C8] text-xs font-bold text-[#2B201A] hover:bg-[#FBF2E7] transition-colors min-h-[40px] xl:min-h-[44px]"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#B8893E]" />
              <span>{lang === "en" ? "हिन्दी" : "English"}</span>
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 xl:p-2 text-[#2B201A] hover:text-[#E86F1D] rounded-xl hover:bg-[#FBF2E7] transition-colors min-h-[40px] min-w-[40px] xl:min-h-[44px] xl:min-w-[44px] flex items-center justify-center border border-transparent hover:border-[#E7D8C8]"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 xl:w-5 xl:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E86F1D] text-white text-[10px] font-bold w-4 h-4 xl:w-5 xl:h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account Icon (Shown when logged in, or on xl+ screens) */}
            {isLoadingUser ? (
              <span className="min-h-[40px] min-w-[40px]" aria-hidden />
            ) : !user ? (
              <button
                onClick={() => openAuthModal()}
                className="hidden xl:flex p-2 text-[#2B201A] hover:text-[#E86F1D] rounded-xl border border-[#E7D8C8] hover:bg-[#FBF2E7] transition-colors min-h-[40px] min-w-[40px] xl:min-h-[44px] xl:min-w-[44px] items-center justify-center"
                aria-label={lang === "hi" ? "साइन इन करें" : "Sign in"}
                title={lang === "hi" ? "साइन इन करें" : "Sign in"}
              >
                <User className="w-4 h-4 xl:w-5 xl:h-5" />
              </button>
            ) : (
              <Link
                href="/account"
                className="relative p-2 text-[#E86F1D] hover:text-[#D25E12] rounded-xl border border-[#B8893E] bg-[#FBF2E7] hover:bg-[#E7D8C8]/60 transition-colors min-h-[40px] min-w-[40px] xl:min-h-[44px] xl:min-w-[44px] flex items-center justify-center"
                aria-label="My Account & Orders"
                title={`Signed in as ${user.name}`}
              >
                <User className="w-4 h-4 xl:w-5 xl:h-5" />
              </Link>
            )}

            {/* Orange Donate CTA Button (Desktop >= 1000px) */}
            <button
              onClick={() => openDonateModal("General Donation")}
              className="flex items-center gap-1.5 h-[40px] xl:h-[44px] 2xl:h-[48px] px-3 xl:px-4 2xl:px-5 bg-[#E86F1D] hover:bg-[#D25E12] text-white text-[11px] xl:text-xs font-bold uppercase tracking-wider rounded-[14px] shadow-warm-sm hover:shadow-warm-md transition-all shrink-0 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 xl:w-4 xl:h-4 fill-current text-white" />
              <span>{lang === "hi" ? "दान करें" : "Donate"}</span>
            </button>
          </div>

        </div>

        {/* MOBILE / TABLET HEADER BAR (< 1000px) */}
        <div className="flex min-[1000px]:hidden items-center justify-between h-[68px] sm:h-[74px] gap-2">
          {/* Mobile Logo + Brand (Enlarged for readability per PM Audit) */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 group shrink">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#B8893E] shadow-sm shrink-0 bg-white">
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
              <span className="text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.12em] text-[#B8893E] uppercase truncate">
                VASUDEVAYA TRUST
              </span>
            </div>
          </Link>

          {/* Mobile Controls: Orange Donate Button (ALWAYS VISIBLE per PM Audit) + Language + Cart + Account + Hamburger */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Always visible orange donate button on mobile/tablet */}
            <button
              onClick={() => openDonateModal("General Donation")}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-[#E86F1D] hover:bg-[#D25E12] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xs:inline sm:inline">{lang === "hi" ? "दान" : "Donate"}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg border border-[#E7D8C8] text-[11px] font-bold text-[#2B201A] hover:bg-[#FBF2E7] transition-colors min-h-[36px]"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#B8893E]" />
              <span>{lang === "en" ? "हिन्दी" : "EN"}</span>
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:p-2 text-[#2B201A] rounded-lg hover:bg-[#FBF2E7] min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#E86F1D] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account Icon */}
            {isLoadingUser ? (
              <span className="min-h-[36px] min-w-[36px]" aria-hidden />
            ) : !user ? (
              <button
                onClick={() => openAuthModal()}
                className="p-1.5 sm:p-2 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#E7D8C8] text-[#2B201A]"
                aria-label={lang === "hi" ? "साइन इन करें" : "Sign in"}
              >
                <User className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/account"
                className="p-1.5 sm:p-2 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#B8893E] bg-[#FBF2E7] text-[#E86F1D]"
                aria-label="Account"
                title={user.name}
              >
                <User className="w-4 h-4" />
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-[#2B201A] rounded-lg hover:bg-[#FBF2E7] min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE / TABLET MENU DRAWER (< 1000px) - PORTAL SLIDE-OVER DRAWER (Fixes PM Finding 8) */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="min-[1000px]:hidden fixed inset-0 z-[9999]">
          {/* Dimmed Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Narrow Slide-Over Drawer on Right Edge (Max 340px) */}
          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-[#FFF9F2] shadow-2xl flex flex-col justify-between p-5 border-l border-[#E7D8C8] animate-in slide-in-from-right duration-250 z-10 overflow-y-auto">
            <div>
              {/* Drawer Top Header: Logo + Close */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E7D8C8]/70 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#B8893E] bg-white shadow-xs shrink-0">
                    <Image
                      src="/images/logo.jpg"
                      alt="Trust Logo"
                      fill
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div>
                    <h3 className="font-editorial text-xs font-bold text-[#2B201A] leading-tight">
                      NAMO BHAGWATE
                    </h3>
                    <p className="text-[8px] font-bold tracking-widest text-[#B8893E] uppercase">
                      VASUDEVAYA TRUST
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-[#E7D8C8] text-[#2B201A] hover:bg-[#FBF2E7] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="grid gap-1 py-1" aria-label="Mobile Navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center min-h-[42px] ${
                      pathname === link.href
                        ? "bg-[#FBF2E7] text-[#E86F1D] font-bold border border-[#E86F1D]/20 shadow-xs"
                        : "text-[#2B201A] hover:bg-[#FBF2E7]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {!user && !isLoadingUser && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 min-h-[42px] text-[#2B201A] hover:bg-[#FBF2E7] text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#E86F1D]" />
                    <span>{lang === "hi" ? "साइन इन करें" : "Sign in"}</span>
                  </button>
                )}
                {user && (
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 min-h-[42px] ${
                      pathname === "/account"
                        ? "bg-[#FBF2E7] text-[#E86F1D] font-bold border border-[#E86F1D]/20 shadow-xs"
                        : "text-[#2B201A] hover:bg-[#FBF2E7]"
                    }`}
                  >
                    <User className="w-4 h-4 text-[#E86F1D]" />
                    <span>{lang === "hi" ? "मेरा खाता एवं आर्डर्स" : "My Account & Orders"}</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Drawer Bottom Actions: Donate CTA */}
            <div className="pt-4 border-t border-[#E7D8C8]/70 space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openDonateModal("General Donation");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#E86F1D] hover:bg-[#D25E12] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-warm-sm active:scale-95 transition-all min-h-[44px] cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>{lang === "hi" ? "दान करें" : "Donate Now"}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </header>
  );
}
