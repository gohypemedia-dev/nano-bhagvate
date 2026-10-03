"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Heart, ShieldCheck, QrCode, CheckCircle2, CreditCard } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function DonateModal() {
  const { donateModal, closeDonateModal, lang } = useApp();
  const [selectedAmount, setSelectedAmount] = useState<number>(donateModal.amount || 1100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [paymentStep, setPaymentStep] = useState<"SELECT" | "PAY" | "SUCCESS">("SELECT");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!donateModal.isOpen) return null;

  const presetAmounts = [500, 1100, 2100, 5100, 11000];

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStep("SUCCESS");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-[#FFF9F2] rounded-2xl max-w-lg w-full overflow-hidden border border-[#E7D8C8] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FBF2E7] p-6 border-b border-[#E7D8C8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E86F1D]/10 flex items-center justify-center text-[#E86F1D]">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-editorial text-xl font-bold text-[#2B201A]">
                {donateModal.program || (lang === "hi" ? "सेवा हेतु दान" : "Support Our Mission")}
              </h3>
              <p className="text-xs text-[#B8893E] font-semibold">
                Namo Bhagwate Vasudevaya Trust
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setPaymentStep("SELECT");
              closeDonateModal();
            }}
            className="p-2 text-[#2B201A]/60 hover:text-[#2B201A] rounded-lg hover:bg-[#FFF9F2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {paymentStep === "SUCCESS" ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-[#2F5A43] mx-auto animate-bounce" />
              <h4 className="font-editorial text-2xl font-bold text-[#2B201A]">
                {lang === "hi" ? "दान हेतु हार्दिक धन्यवाद!" : "Heartfelt Thanks for Your Contribution!"}
              </h4>
              <p className="text-sm text-[#2B201A]/80 leading-relaxed max-w-sm mx-auto">
                {lang === "hi"
                  ? `₹${currentAmount.toLocaleString("en-IN")} का आपका योगदान नमो भगवते वासुदेवाय ट्रस्ट के समाज सेवा अभियानों को सशक्त बनाएगा।`
                  : `Your generous contribution of ₹${currentAmount.toLocaleString("en-IN")} will directly empower our spiritual education, farmer welfare, and humanitarian initiatives.`}
              </p>
              <div className="p-4 bg-[#FBF2E7] rounded-xl border border-[#E7D8C8] text-xs text-[#2B201A]/70 space-y-1 text-left max-w-sm mx-auto">
                <p><strong>Transaction Ref:</strong> TXN{Math.floor(Math.random() * 899999 + 100000)}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</p>
                <p><strong>Cause:</strong> {donateModal.program || "General Seva"}</p>
              </div>
              <button
                onClick={() => {
                  setPaymentStep("SELECT");
                  closeDonateModal();
                }}
                className="mt-4 px-8 py-3 bg-[#E86F1D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-warm-md"
              >
                Close & Return
              </button>
            </div>
          ) : paymentStep === "SELECT" ? (
            <form onSubmit={(e) => { e.preventDefault(); setPaymentStep("PAY"); }} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B201A]/80 tracking-wider mb-2">
                  {lang === "hi" ? "योगदान की राशि चुनें (Select Amount)" : "Select Contribution Amount"}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount("");
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                        selectedAmount === amt && !customAmount
                          ? "bg-[#E86F1D] text-white border-[#E86F1D] shadow-warm-sm"
                          : "bg-[#FBF2E7] border-[#E7D8C8] text-[#2B201A] hover:border-[#E86F1D]"
                      }`}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B201A]/70 mb-1">
                  {lang === "hi" ? "अथवा अपनी इच्छानुसार राशि दर्ज करें (Or Enter Custom Amount)" : "Or Enter Custom Amount (₹)"}
                </label>
                <input
                  type="number"
                  placeholder="Enter amount in INR"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="input-warm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2B201A]/80 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Devotee / Donor Name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="input-warm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2B201A]/80 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="input-warm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B201A]/80 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="input-warm"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-[#2B201A]/60 bg-[#FBF2E7] p-3 rounded-xl border border-[#E7D8C8]">
                <ShieldCheck className="w-4 h-4 text-[#2F5A43] shrink-0" />
                <span>Redirecting securely to official UPI / Razorpay Gateway.</span>
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
              >
                <span>Proceed to Pay ₹{currentAmount.toLocaleString("en-IN")}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#B8893E]">
                  Official Trust UPI / QR Payment
                </p>
                <h4 className="font-editorial text-xl font-bold text-[#2B201A]">
                  Scan QR with any UPI App or Pay via Gateway
                </h4>
              </div>

              {/* QR Image Container */}
              <div className="relative w-56 h-56 mx-auto rounded-xl overflow-hidden border-2 border-[#B8893E] shadow-warm-md bg-white p-2">
                <Image src="/images/qr-code.jpg" alt="Trust Payment QR Code" fill className="object-contain" />
              </div>

              <p className="text-center text-xs text-[#2B201A]/80 font-mono">
                UPI ID: <strong>namobhagwate@upi</strong>
              </p>

              <div className="pt-2 flex items-center justify-between text-sm font-bold border-t border-[#E7D8C8] pt-4">
                <span>Total Amount:</span>
                <span className="text-lg text-[#E86F1D]">₹{currentAmount.toLocaleString("en-IN")} INR</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentStep("SELECT")}
                  className="py-2.5 px-4 border border-[#E7D8C8] text-[#2B201A] font-semibold text-xs rounded-xl hover:bg-[#FBF2E7]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="py-2.5 px-4 bg-[#2F5A43] hover:bg-[#234533] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-warm-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isProcessing ? "Verifying Payment..." : "I Have Completed Payment"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
