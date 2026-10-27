"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import HeadingDivider from "@/components/HeadingDivider";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const { user, refreshUser, lang } = useApp();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(urlError || null);

  useEffect(() => {
    if (urlError) setError(urlError);
  }, [urlError]);

  const [sacredImage, setSacredImage] = useState<"gurukul" | "vasudeva" | "krishna">("gurukul");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const returnUrlParam = searchParams.get("redirect") || searchParams.get("returnUrl");

  const getDestinationUrl = () => {
    if (returnUrlParam) return returnUrlParam;
    try {
      const saved = localStorage.getItem("nbvt_cart");
      if (saved && JSON.parse(saved).length > 0) {
        return "/books";
      }
    } catch {
      // ignore
    }
    return "/account";
  };

  // If already logged in, redirect appropriately
  useEffect(() => {
    if (user) {
      router.replace(getDestinationUrl());
    }
  }, [user, router, returnUrlParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Login failed. Please check your credentials.");
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            phone,
            address,
            city,
            state,
            pincode,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration failed. Please check your details.");
        }
      }

      await refreshUser();
      router.push(getDestinationUrl());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const hi = lang === "hi";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#FFF9F2] py-10 sm:py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch relative">
        {/* ================= LEFT CARD: VEDIC GURUKUL & SACRED VISUAL BRANDING ================= */}
        <div className="relative md:col-span-6 bg-[#FCF9F2] rounded-3xl border-2 border-[#C9A24B] shadow-xl overflow-hidden pt-5 pb-5 px-4 sm:p-7 flex flex-col justify-between min-h-[420px] md:min-h-[580px]">
          {/* Sacred Divine Art: Vedic Gurukul / Vasudeva / Krishna */}
          <Image
            src={
              sacredImage === "gurukul"
                ? "/images/vedic-gurukul-hd.jpg?v=6"
                : sacredImage === "vasudeva"
                ? "/images/divine-vasudeva.jpg?v=6"
                : "/images/divine-krishna-portrait.jpg?v=6"
            }
            alt="Namo Bhagwate Vasudevaya - Vedic Gurukul"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />

          {/* Top Bar: Luminous White & Gold Trust Badge & Art Switcher */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#B8893E]/50 shadow-md">
              <div className="relative w-8 h-8 rounded-full border-2 border-[#B8893E] bg-white overflow-hidden shrink-0">
                <Image
                  src="/images/logo.jpg"
                  alt="Namo Bhagwate Vasudevaya Trust Logo"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col shrink-0 min-w-0 pr-1">
                <span className="font-editorial text-xs sm:text-sm font-bold tracking-tight text-[#2B201A] leading-tight whitespace-nowrap">
                  NAMO BHAGWATE
                </span>
                <span className="text-[7.5px] sm:text-[8px] font-semibold tracking-wider text-[#B8893E] uppercase whitespace-nowrap">
                  VASUDEVAYA TRUST
                </span>
              </div>
            </div>

            {/* Art Toggle Switch (Bright Glassmorphism) */}
            <div className="flex items-center bg-white/90 backdrop-blur-md p-1 rounded-full border border-[#C9A24B]/50 shadow-md text-[9px] sm:text-[10px]">
              <button
                type="button"
                onClick={() => setSacredImage("gurukul")}
                className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                  sacredImage === "gurukul"
                    ? "bg-[#E86F1D] text-white shadow-sm"
                    : "text-[#2B201A]/75 hover:text-[#E86F1D]"
                }`}
                title="वैदिक गुरुकुल (Vedic Gurukul)"
              >
                गुरुकुल
              </button>
              <button
                type="button"
                onClick={() => setSacredImage("vasudeva")}
                className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                  sacredImage === "vasudeva"
                    ? "bg-[#E86F1D] text-white shadow-sm"
                    : "text-[#2B201A]/75 hover:text-[#E86F1D]"
                }`}
                title="भगवान वासुदेव (Vishnu)"
              >
                वासुदेव
              </button>
              <button
                type="button"
                onClick={() => setSacredImage("krishna")}
                className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                  sacredImage === "krishna"
                    ? "bg-[#E86F1D] text-white shadow-sm"
                    : "text-[#2B201A]/75 hover:text-[#E86F1D]"
                }`}
                title="श्री कृष्ण (Sri Krishna)"
              >
                कृष्ण
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT CARD: SIGN IN / REGISTER FORM ================= */}
        <div className="relative md:col-span-6 bg-[#FFFDF8] rounded-3xl border-2 border-[#C9A24B] shadow-xl p-6 sm:p-10 flex flex-col justify-between">
          {/* Back to Home Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#2B201A]/60 hover:text-[#E86F1D] font-bold mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{hi ? "मुख्य पृष्ठ पर लौटें" : "Back to Home"}</span>
          </Link>

          {/* Form Header */}
          <div className="space-y-1 mb-5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B8893E]">
              {hi ? "भक्त सेवा पोर्टल" : "DEVOTEE SECURE ACCESS"}
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#E86F1D] tracking-tight">
              {tab === "login"
                ? hi ? "भक्त लॉगिन (Sign In)" : "Devotee Sign In"
                : hi ? "नया खाता बनाएं (Register)" : "Create Devotee Account"}
            </h2>
            <HeadingDivider align="left" className="!py-0.5" />
            <p className="text-xs text-[#2B201A]/70">
              {tab === "login"
                ? hi ? "अपनी पुस्तकों के ऑर्डर एवं पते देखने हेतु लॉगिन करें" : "Sign in to manage your orders & delivery details"
                : hi ? "नया भक्त खाता जोड़ें (कुछ ही सेकंड्स में)" : "Register as a verified devotee in just a few seconds"}
            </p>
          </div>

          {/* Tab Toggle Switch */}
          <div className="flex p-1 bg-[#F5ECE0] rounded-2xl mb-4 border border-[#E7D8C8]">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
              }}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                tab === "login"
                  ? "bg-white text-[#E86F1D] shadow-xs"
                  : "text-[#2B201A]/70 hover:text-[#2B201A]"
              }`}
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>{hi ? "लॉग इन" : "Sign In"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
              }}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                tab === "register"
                  ? "bg-white text-[#E86F1D] shadow-xs"
                  : "text-[#2B201A]/70 hover:text-[#2B201A]"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>{hi ? "रजिस्टर" : "Register"}</span>
              <span className="hidden sm:inline font-normal lowercase text-[10px] opacity-75">({hi ? "नया" : "new"})</span>
            </button>
          </div>

          {/* Google Sign In Quick Button */}
          <div className="mb-4 space-y-3">
            <a
              href={`/api/auth/google?returnUrl=${encodeURIComponent(getDestinationUrl())}`}
              className="w-full py-2.5 px-4 rounded-xl border border-[#E7D8C8] bg-white hover:bg-[#FBF2E7] text-[#2B201A] font-bold text-xs uppercase tracking-wider shadow-2xs flex items-center justify-center gap-2.5 transition-all hover:border-[#B8893E]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{hi ? "Google से जारी रखें" : "Continue with Google"}</span>
            </a>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E7D8C8]" />
              </div>
              <span className="relative bg-[#FFFDF8] px-3 text-[10px] uppercase font-bold tracking-widest text-[#2B201A]/50">
                {hi ? "या ईमेल व पासवर्ड से" : "OR WITH EMAIL"}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-in fade-in">
                {error}
              </div>
            )}

            {tab === "register" && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                    {hi ? "पूरा नाम" : "Full Name"} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#B8893E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={hi ? "उदा. रमेश शर्मा" : "e.g. Ramesh Sharma"}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E7D8C8] rounded-xl text-sm focus:outline-hidden focus:border-[#E86F1D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                    {hi ? "मोबाइल नंबर" : "Mobile Phone"} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#B8893E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E7D8C8] rounded-xl text-sm focus:outline-hidden focus:border-[#E86F1D]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                {hi ? "ईमेल पता" : "Email Address"} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#B8893E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E7D8C8] rounded-xl text-sm focus:outline-hidden focus:border-[#E86F1D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                {hi ? "पासवर्ड" : "Password"} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B8893E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={hi ? "न्यूनतम 6 अक्षर" : "At least 6 characters"}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E7D8C8] rounded-xl text-sm focus:outline-hidden focus:border-[#E86F1D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2B201A]/50 hover:text-[#2B201A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {tab === "register" && (
              <div className="pt-2 border-t border-[#E7D8C8] space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#B8893E] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{hi ? "डिलीवरी पता (वैकल्पिक - बाद में भी भर सकते हैं)" : "Shipping Address (Optional)"}</span>
                </p>
                <div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={hi ? "मकान नं, गली / मोहल्ला" : "Flat / House No., Street, Colony"}
                    className="w-full px-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={hi ? "शहर" : "City"}
                    className="w-full px-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder={hi ? "राज्य" : "State"}
                    className="w-full px-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                  />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder={hi ? "पिनकोड" : "PIN"}
                    className="w-full px-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#E86F1D] hover:bg-[#D25E12] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-warm-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{hi ? "प्रक्रिया जारी है..." : "Processing..."}</span>
                  </>
                ) : (
                  <span>
                    {tab === "login"
                      ? hi
                        ? "लॉग इन करें एवं आगे बढ़ें"
                        : "Sign In & Continue"
                      : hi
                      ? "खाता बनाएं एवं आगे बढ़ें"
                      : "Create Account & Continue"}
                  </span>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-[#2B201A]/70 pt-2">
              {tab === "login" ? (
                <>
                  {hi ? "नया खाता चाहिए? " : "New to the Trust? "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("register");
                      setError(null);
                    }}
                    className="text-[#E86F1D] font-bold hover:underline"
                  >
                    {hi ? "यहाँ रजिस्टर करें" : "Create an account"}
                  </button>
                </>
              ) : (
                <>
                  {hi ? "पहले से खाता है? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("login");
                      setError(null);
                    }}
                    className="text-[#E86F1D] font-bold hover:underline"
                  >
                    {hi ? "यहाँ लॉग इन करें" : "Sign In here"}
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#E86F1D]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
