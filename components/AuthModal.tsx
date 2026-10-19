"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, Phone, MapPin, Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalSuccessCallback, refreshUser, lang } = useApp();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  if (!isAuthModalOpen) return null;

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
      closeAuthModal();
      if (authModalSuccessCallback) {
        authModalSuccessCallback();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const hi = lang === "hi";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFDF8] rounded-3xl border-2 border-[#B8893E] shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#2B201A] text-white p-6 text-center relative border-b-2 border-[#B8893E]">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-[#E7D8C8] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#B8893E] mb-1">
            <span>NAMO BHAGWATE VASUDEVAYA TRUST</span>
          </div>
          <h2 className="font-editorial text-2xl font-bold tracking-wide">
            {tab === "login" ? (hi ? "भक्त लॉगिन" : "Devotee Sign In") : (hi ? "नया खाता बनाएं" : "Create Devotee Account")}
          </h2>
          <p className="text-xs text-[#E7D8C8] mt-1 font-serif">
            {hi ? "पुस्तक ऑर्डर एवं खाता प्रबंधन हेतु" : "Required for book purchases & order tracking"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#E7D8C8] bg-[#FBF2E7]">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
              tab === "login"
                ? "bg-[#FFFDF8] text-[#E86F1D] border-b-2 border-[#E86F1D]"
                : "text-[#2B201A]/60 hover:text-[#2B201A]"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{hi ? "लॉग इन" : "Sign In"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
              tab === "register"
                ? "bg-[#FFFDF8] text-[#E86F1D] border-b-2 border-[#E86F1D]"
                : "text-[#2B201A]/60 hover:text-[#2B201A]"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{hi ? "रजिस्टर (नया खाता)" : "Register (New User)"}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
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
                  placeholder={hi ? "पिनकोड" : "Pincode"}
                  className="w-full px-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E86F1D] hover:bg-[#D25E12] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-warm-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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

          <p className="text-center text-[11px] text-[#2B201A]/60 pt-1">
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
  );
}
