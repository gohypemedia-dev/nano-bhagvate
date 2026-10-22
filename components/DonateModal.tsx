"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { X, Heart, ShieldCheck, Copy, Check, Loader2, CheckCircle2, Award } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MEMBERSHIP_PLANS, PRESET_AMOUNTS, formatINR } from "@/lib/donation-config";
import {
  createDonationSchema,
  sanitizeEmail,
  sanitizeMobile,
  sanitizeName,
  validateAmount,
  validateEmail,
  validateMobile,
  validateName,
} from "@/lib/validation/donation";

// SELECT → PAY (QR shown) → SUBMITTED (donor tapped "I have paid"; QR hidden, the Trust
// is emailed a link to approve) → DONE (approved by the Trust, or matched to a bank alert).
// The page polls the server while on PAY/SUBMITTED; no UTR or screenshot is needed.
type Step = "SELECT" | "PAY" | "SUBMITTED" | "DONE";

interface PaymentSession {
  donationId: string;
  submitToken: string;
  amount: number;
  upiId: string;
  upiName: string;
  accountLabel?: string | null;
  qrData: string;
  program: string;
  name: string;
  email: string;
  membership?: boolean;
}

const STORAGE_KEY = "nbvt-donation-in-progress";

function loadSaved(): { session: PaymentSession; step: Step } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const submitted = saved.step === "SUBMITTED" || saved.step === "WAITING"; // WAITING: older saves
    return { session: saved.session, step: submitted ? "SUBMITTED" : "PAY" };
  } catch {
    return null;
  }
}

function save(session: PaymentSession, step: Step) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ session, step }));
  } catch {}
}

function clearSaved() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

async function readError(res: Response) {
  const body = await res.json().catch(() => ({}));
  return {
    message: (body.error as string) || "Something went wrong. Please try again.",
    field: body.field as string | undefined,
    status: body.status as string | undefined,
  };
}

export default function DonateModal({ minAmount }: { minAmount: number }) {
  const { donateModal, closeDonateModal, lang } = useApp();
  const hi = lang === "hi";

  const [step, setStep] = useState<Step>("SELECT");
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [resumed, setResumed] = useState(false);

  const [selectedAmount, setSelectedAmount] = useState<number>(PRESET_AMOUNTS[1] ?? 999);
  const [planId, setPlanId] = useState<string>(MEMBERSHIP_PLANS[0].id);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const [emailSent, setEmailSent] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [passUrl, setPassUrl] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [openedFor, setOpenedFor] = useState<string | null>(null);

  const isMembership = Boolean(
    donateModal.isMembership || donateModal.program?.toLowerCase().includes("membership"),
  );
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId) ?? MEMBERSHIP_PLANS[0];
  const currentAmount = isMembership ? plan.price : selectedAmount;

  // When the modal opens: resume an unfinished donation from this tab, or start fresh.
  const openKey = donateModal.isOpen ? `${donateModal.program}|${donateModal.amount}|${isMembership}` : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setError(null);
      setTouched({});
      setSubmitted(false);
      const requestedPlan = isMembership
        ? MEMBERSHIP_PLANS.find(
            (p) => p.name.toLowerCase() === donateModal.program?.toLowerCase() || p.price === donateModal.amount,
          ) ?? MEMBERSHIP_PLANS[0]
        : null;
      const requestedProgram = requestedPlan ? requestedPlan.name : donateModal.program || "General Donation";
      const saved = loadSaved();
      // Resume only the same donation / plan. A different one, or details just entered in a form
      // (e.g. the membership registration form), starts fresh instead of showing an old QR.
      const resumable =
        saved &&
        !donateModal.prefill &&
        Boolean(saved.session.membership) === isMembership &&
        saved.session.program === requestedProgram;
      if (saved && !resumable) clearSaved();
      if (resumable) {
        setSession(saved.session);
        setStep(saved.step);
        setResumed(true);
      } else {
        setSession(null);
        setResumed(false);
        setStep("SELECT");
        const prefill = donateModal.prefill;
        if (prefill?.name) setDonorName(prefill.name);
        if (prefill?.email) setDonorEmail(prefill.email);
        if (prefill?.mobile) setDonorPhone(prefill.mobile);
        if (requestedPlan) {
          setPlanId(requestedPlan.id);
        } else {
          setSelectedAmount(donateModal.amount || PRESET_AMOUNTS[1] || 999);
        }
      }
    }
  }

  useEffect(() => {
    if (!donateModal.isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // While the QR is showing (and after "I have paid"), ask the server whether the
  // bank has confirmed the payment. The server checks the bank-alert inbox.
  useEffect(() => {
    if (!donateModal.isOpen || !session || (step !== "PAY" && step !== "SUBMITTED")) return;
    let stopped = false;
    const check = async () => {
      try {
        const res = await fetch(`/api/donations/${encodeURIComponent(session.donationId)}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submitToken: session.submitToken }),
        });
        if (stopped) return;
        if (res.status === 404) {
          clearSaved();
          setError({ message: "We couldn't find this donation. Please start a new one." });
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (stopped) return;
        if (data.status === "PENDING_VERIFICATION" && step === "PAY") {
          // Marked as paid from another tab: hide the QR here too.
          save(session, "SUBMITTED");
          setStep("SUBMITTED");
        } else if (data.status === "VERIFIED") {
          clearSaved();
          setEmailSent(data.emailStatus === "SENT");
          setCertificateUrl(data.certificateUrl ?? null);
          setPassUrl(data.passUrl ?? null);
          setStep("DONE");
        } else if (data.status === "CANCELLED" || data.status === "REJECTED") {
          clearSaved();
          setError({ message: "This donation was closed. Please start a new donation." });
        }
      } catch {
        // Network blip: the next poll will retry.
      }
    };
    check();
    const timer = setInterval(check, step === "SUBMITTED" ? 5000 : 8000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [donateModal.isOpen, session, step]);

  if (!donateModal.isOpen) return null;

  function handleClose() {
    // Once submitted, the Trust takes it from here (confirmation goes by email),
    // so the next "Donate" click starts a fresh donation.
    if (step === "DONE" || step === "SUBMITTED") resetAll();
    closeDonateModal();
  }

  function resetAll() {
    clearSaved();
    setSession(null);
    setStep("SELECT");
    setResumed(false);
    setEmailSent(false);
    setCertificateUrl(null);
    setPassUrl(null);
    setError(null);
    setTouched({});
    setSubmitted(false);
  }

  function goTo(next: Step, s: PaymentSession | null = session) {
    setError(null);
    setStep(next);
    if (s && (next === "PAY" || next === "SUBMITTED")) save(s, next);
  }

  function handleBlurField(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "name") {
      const err = validateName(donorName);
      if (err) setError({ message: err, field: "name" });
      else if (error?.field === "name") setError(null);
    } else if (field === "email") {
      const err = validateEmail(donorEmail);
      if (err) setError({ message: err, field: "email" });
      else if (error?.field === "email") setError(null);
    } else if (field === "mobile") {
      const err = validateMobile(donorPhone, false);
      if (err) setError({ message: err, field: "mobile" });
      else if (error?.field === "mobile") setError(null);
    } else if (field === "amount" && !isMembership) {
      const err = validateAmount(selectedAmount, minAmount);
      if (err) setError({ message: err, field: "amount" });
      else if (error?.field === "amount") setError(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setError(null);

    if (!isMembership) {
      const amountErr = validateAmount(selectedAmount, minAmount);
      if (amountErr) {
        setError({ message: amountErr, field: "amount" });
        return;
      }
    }

    const nameErr = validateName(donorName);
    if (nameErr) {
      setError({ message: nameErr, field: "name" });
      document.getElementById("donate-name")?.focus();
      return;
    }

    const mobileErr = validateMobile(donorPhone, false);
    if (mobileErr) {
      setError({ message: mobileErr, field: "mobile" });
      document.getElementById("donate-mobile")?.focus();
      return;
    }

    const emailErr = validateEmail(donorEmail);
    if (emailErr) {
      setError({ message: emailErr, field: "email" });
      document.getElementById("donate-email")?.focus();
      return;
    }

    const cleanName = sanitizeName(donorName);
    const cleanEmail = sanitizeEmail(donorEmail);
    const cleanMobile = sanitizeMobile(donorPhone);

    const payload = {
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
      program: donateModal.program || "General Donation",
      ...(isMembership ? { planId: plan.id } : { amount: currentAmount }),
    };

    const check = createDonationSchema(minAmount).safeParse(payload);
    if (!check.success) {
      const issue = check.error.issues[0];
      const field = String(issue?.path[0] ?? "");
      setError({ message: issue?.message ?? "Please check your details.", field });
      const targetId =
        field === "name"
          ? "donate-name"
          : field === "email"
          ? "donate-email"
          : field === "mobile"
          ? "donate-mobile"
          : "donate-custom-amount";
      document.getElementById(targetId)?.focus();
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errObj = await readError(res);
        setError(errObj);
        if (errObj.field) {
          const targetId =
            errObj.field === "name"
              ? "donate-name"
              : errObj.field === "email"
              ? "donate-email"
              : errObj.field === "mobile"
              ? "donate-mobile"
              : "donate-custom-amount";
          document.getElementById(targetId)?.focus();
        }
        return;
      }
      const data = await res.json();
      const s: PaymentSession = {
        donationId: data.donationId,
        submitToken: data.submitToken,
        amount: data.amount,
        upiId: data.upiId,
        upiName: data.upiName,
        accountLabel: data.accountLabel,
        qrData: data.qrData,
        program: isMembership ? plan.name : payload.program,
        name: check.data.name,
        email: check.data.email,
        membership: isMembership,
      };
      setSession(s);
      goTo("PAY", s);
    } catch {
      setError({ message: "Couldn't reach the server. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  // "I have completed the payment": tell the server (which emails the Trust for approval)
  // and swap the QR for the "submitted" screen.
  async function handlePaid() {
    if (!session) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/donations/${encodeURIComponent(session.donationId)}/paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submitToken: session.submitToken }),
      });
      if (!res.ok) {
        setError(await readError(res));
        return;
      }
      const data = await res.json();
      if (data.status === "VERIFIED") {
        clearSaved();
        setStep("DONE");
      } else if (data.status === "CANCELLED" || data.status === "REJECTED") {
        clearSaved();
        setError({ message: "This donation was closed. Please start a new donation." });
      } else {
        goTo("SUBMITTED");
      }
    } catch {
      setError({ message: "Couldn't reach the server. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  async function copyUpiId() {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

function localizeProgramName(name: string | undefined | null, isHi: boolean): string {
  if (!name) return isHi ? "सेवा हेतु दान" : "Support Our Mission";
  if (!isHi) return name;
  const lower = name.toLowerCase();
  if (lower.includes("general donation") || lower === "general donation") return "सामान्य पुण्य दान";
  if (lower.includes("founder's vision") || lower.includes("founder")) return "संस्थापक विजन सेवा";
  if (lower.includes("general seva") || lower === "general seva") return "सामान्य जनसेवा";
  if (lower.includes("health")) return "स्वास्थ्य एवं प्राकृतिक कल्याण सेवा";
  if (lower.includes("education") || lower.includes("gurukul")) return "शिक्षा एवं गुरुकुल विकास सेवा";
  if (lower.includes("women")) return "महिला सशक्तिकरण सेवा";
  if (lower.includes("welfare") || lower.includes("farmer")) return "सामाजिक कल्याण एवं सर्वजन सेवा";
  if (lower.includes("membership")) {
    if (lower.includes("silver")) return "रजत (सिल्वर) सदस्यता";
    if (lower.includes("gold")) return "स्वर्ण (गोल्ड) सदस्यता";
    if (lower.includes("platinum")) return "प्लेटिनम सदस्यता";
    return "साधारण सदस्यता";
  }
  return name;
}

function localizeError(msg: string | undefined, isHi: boolean): string {
  if (!msg || !isHi) return msg || "";
  if (msg.includes("valid name") || msg.includes("enter your name")) return "कृपया अपना पूरा नाम दर्ज करें।";
  if (msg.includes("valid email") || msg.includes("email")) return "कृपया एक मान्य ईमेल पता दर्ज करें।";
  if (msg.includes("10-digit") || msg.includes("mobile")) return "कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।";
  if (msg.includes("amount") || msg.includes("minimum")) return "कृपया एक मान्य राशि चुनें।";
  if (msg.includes("connection") || msg.includes("server")) return "सर्वर से संपर्क नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।";
  return msg;
}

  const fieldError = (field: string) =>
    error?.field === field ? <p className="mt-1 text-xs font-semibold text-[#B3261E]">{localizeError(error.message, hi)}</p> : null;
  const generalError = error && !["name", "email", "mobile", "amount"].includes(error.field ?? "") ? (
    <p role="alert" className="text-sm font-semibold text-[#B3261E] bg-[#B3261E]/5 border border-[#B3261E]/20 rounded-xl p-3">
      {localizeError(error.message, hi)}
    </p>
  ) : null;

  const stepIndex = { SELECT: 0, PAY: 1, SUBMITTED: 1, DONE: 2 }[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="donate-title">
      {/* Never taller than the screen: the body scrolls inside the card only if it really has to.
          The PAY step is wider on laptops so the QR and the actions sit side by side. */}
      <div
        className={`bg-[#FFF9F2] rounded-2xl w-full max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-32px)] border border-[#E7D8C8] shadow-2xl relative flex flex-col overflow-hidden ${
          step === "PAY" ? "max-w-md md:max-w-3xl" : "max-w-[600px]"
        }`}
      >
        {/* Header */}
        <div className="bg-[#FBF2E7] px-4 py-3.5 sm:px-6 sm:py-4 border-b border-[#E7D8C8] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#E86F1D]/10 flex items-center justify-center text-[#E86F1D]">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <h3 id="donate-title" className="font-editorial text-lg sm:text-xl font-bold text-[#2B201A] truncate">
                {localizeProgramName(session && step !== "SELECT" ? session.program : donateModal.program, hi)}
              </h3>
              <p className="text-xs text-[#B8893E] font-semibold">{hi ? "नमो भगवते वासुदेवाय ट्रस्ट" : "Namo Bhagwate Vasudevaya Trust"}</p>
            </div>
          </div>
          <button onClick={handleClose} aria-label={hi ? "बंद करें" : "Close"} className="p-2 text-[#2B201A]/60 hover:text-[#2B201A] rounded-xl hover:bg-[#FFF9F2] min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        {step !== "DONE" && (
          <ol className="flex gap-2 sm:gap-3 px-4 sm:px-6 pt-3.5 pb-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0 bg-[#FFF9F2] border-b border-[#E7D8C8]/40">
            {(hi ? ["विवरण", "भुगतान", "पुष्टि"] : ["Details", "Pay", "Confirmed"]).map((label, i) => (
              <li key={label} className={`flex-1 border-t-2 pt-1.5 transition-colors whitespace-nowrap text-center sm:text-left ${i <= stepIndex ? "border-[#E86F1D] text-[#E86F1D]" : "border-[#E7D8C8] text-[#2B201A]/40"}`}>
                {i + 1}. {label}
              </li>
            ))}
          </ol>
        )}

        <div className="p-4 sm:p-6 min-h-0 overflow-y-auto overscroll-contain flex-1 space-y-4">
            {/* STEP 1: AMOUNT + DETAILS */}
            {step === "SELECT" && (
              <form onSubmit={handleCreate} noValidate className="space-y-5">
                {isMembership ? (
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#2B201A]/80 tracking-wider mb-2.5">
                      {hi ? "सदस्यता योजना चुनें" : "Select Membership Plan"}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {MEMBERSHIP_PLANS.map((p) => {
                        const selected = planId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPlanId(p.id)}
                            aria-pressed={selected}
                            className={`p-3 sm:p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all min-h-18 cursor-pointer ${
                              selected
                                ? "bg-[#E86F1D] text-white border-[#E86F1D] shadow-warm-sm"
                                : "bg-[#FBF2E7] border-[#E7D8C8] text-[#2B201A] hover:border-[#E86F1D] hover:bg-[#FFF9F2]"
                            }`}
                          >
                            <span className="text-xs font-bold leading-tight">{localizeProgramName(p.name, hi)}</span>
                            <span className={`text-sm sm:text-base font-extrabold mt-1 ${selected ? "text-white" : "text-[#E86F1D]"}`}>
                              {formatINR(p.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#2B201A]/80 tracking-wider mb-2">
                      {hi ? "योगदान की राशि चुनें" : "Select Contribution Amount"}
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {PRESET_AMOUNTS.map((amt) => {
                        const selected = selectedAmount === amt;
                        return (
                          <button
                            key={amt}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => {
                              setSelectedAmount(amt);
                              if (error?.field === "amount") setError(null);
                            }}
                            className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                              selected
                                ? "bg-[#E86F1D] text-white border-[#E86F1D] shadow-warm-sm"
                                : "bg-[#FBF2E7] border-[#E7D8C8] text-[#2B201A] hover:border-[#E86F1D]"
                            }`}
                          >
                            {formatINR(amt)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="donate-name" className="block text-xs font-semibold text-[#2B201A]/80 mb-1">
                      {hi ? "पूरा नाम *" : "Full Name *"}
                    </label>
                    <input
                      id="donate-name"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={60}
                      placeholder={hi ? "आपका पूरा नाम" : "Your full name"}
                      value={donorName}
                      onChange={(e) => {
                        setDonorName(e.target.value);
                        if (error?.field === "name" && validateName(e.target.value) === null) setError(null);
                      }}
                      onBlur={() => handleBlurField("name")}
                      className="input-warm"
                    />
                    {fieldError("name")}
                  </div>
                  <div>
                    <label htmlFor="donate-mobile" className="block text-xs font-semibold text-[#2B201A]/80 mb-1">
                      {hi ? "मोबाइल नंबर " : "Mobile Number "}
                      <span className="font-normal text-[#2B201A]/50">({hi ? "वैकल्पिक" : "optional"})</span>
                    </label>
                    <input
                      id="donate-mobile"
                      type="tel"
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="9876543210"
                      value={donorPhone}
                      onChange={(e) => {
                        const sanitized = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setDonorPhone(sanitized);
                        if (error?.field === "mobile" && validateMobile(sanitized, false) === null) setError(null);
                      }}
                      onBlur={() => handleBlurField("mobile")}
                      className="input-warm"
                    />
                    {fieldError("mobile")}
                  </div>
                </div>

                <div>
                  <label htmlFor="donate-email" className="block text-xs font-semibold text-[#2B201A]/80 mb-1">
                    {hi ? "ईमेल पता *" : "Email Address *"}
                  </label>
                  <input
                    id="donate-email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="email@example.com"
                    value={donorEmail}
                    onChange={(e) => {
                      setDonorEmail(e.target.value);
                      if (error?.field === "email" && validateEmail(e.target.value) === null) setError(null);
                    }}
                    onBlur={() => handleBlurField("email")}
                    className="input-warm"
                  />
                  {fieldError("email")}
                  <p className="mt-1 text-xs text-[#2B201A]/55">
                    {hi ? "भुगतान सत्यापन के बाद आपकी पावती और रसीद यहाँ भेजी जाएगी।" : "Your confirmation will be sent here after we verify the payment."}
                  </p>
                </div>

                <div className="flex items-start gap-2 text-xs text-[#2B201A]/70 bg-[#FBF2E7] p-3 rounded-xl border border-[#E7D8C8]">
                  <ShieldCheck className="w-4 h-4 text-[#2F5A43] shrink-0 mt-0.5" />
                  <span>
                    {hi
                      ? "आप किसी भी UPI ऐप से सीधे ट्रस्ट के आधिकारिक खाते में भुगतान करेंगे। कोई कार्ड विवरण नहीं लिया जाता।"
                      : "You will pay directly to the Trust's UPI account using any UPI app. No card details are collected."}
                  </span>
                </div>

                {generalError}

                <button type="submit" disabled={busy || currentAmount <= 0} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>
                    {hi ? `भुगतान के लिए आगे बढ़ें · ${formatINR(currentAmount)}` : `Continue to Payment · ${formatINR(currentAmount)}`}
                  </span>
                </button>
              </form>
            )}

            {/* STEP 2: PAY BY UPI */}
            {step === "PAY" && session && (
              // Phones: one compact column. Laptops (md+): QR card left, details and actions right,
              // so the whole step fits on screen without scrolling.
              <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-6 md:items-center">
                {/* Payment card, styled after the Trust's printed UPI standee */}
                <div className="rounded-2xl border-[3px] border-[#C9A24B] bg-white overflow-hidden shadow-sm">
                  <div className="flex flex-col items-center text-center px-3 pt-3 pb-2.5 md:px-4 md:pt-4 md:pb-3">
                    <div className="w-full flex items-center justify-center gap-2.5">
                      <div className="relative w-11 h-11 md:w-14 md:h-14 shrink-0 rounded-full border-[3px] md:border-4 border-[#14532D] bg-white overflow-hidden shadow">
                        <Image src="/images/logo.jpg" alt="Namo Bhagwate Vasudevaya Trust emblem" fill sizes="56px" className="object-cover" />
                      </div>
                      <h4 className="font-sans text-lg md:text-xl leading-tight font-extrabold tracking-tight uppercase text-[#14532D] text-left">
                        {hi ? "नमो भगवते ट्रस्ट" : "Namo Bhagwate Trust"}
                      </h4>
                    </div>

                    <div className="mt-2.5 bg-white">
                      <QRCodeSVG
                        value={session.qrData}
                        size={224}
                        level="M"
                        marginSize={0}
                        className="w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52"
                        title={`UPI payment of ${formatINR(session.amount)} to ${session.upiName}`}
                      />
                    </div>

                    <div className="mt-2 w-full flex items-center gap-3">
                      <span className="h-px flex-1 bg-linear-to-r from-transparent to-[#C9A24B]" />
                      <span className="font-editorial text-lg md:text-xl font-bold text-[#14532D] whitespace-nowrap">
                        {hi ? "स्कैन कर सहयोग करें" : "Scan & Support"}
                      </span>
                      <span className="h-px flex-1 bg-linear-to-l from-transparent to-[#C9A24B]" />
                    </div>
                    <p className="hidden md:block text-xs text-[#2B201A]/75">
                      {hi ? "एक बेहतर, संवेदनशील और स्वस्थ समाज के लिए" : "For a Better, Kinder & Healthier Society"}
                    </p>
                  </div>
                  <div className="bg-[#14532D] text-[#E9D9A6] text-center py-1.5 text-[10px] font-semibold tracking-[0.3em]">
                    {hi ? "सेवा • संस्कार • समर्पण" : "SEVA • SANSKAR • SAMARPAN"}
                  </div>
                </div>

                <div className="space-y-3">
                  {resumed && (
                    <p className="text-xs text-[#2B201A]/70 bg-[#FBF2E7] border border-[#E7D8C8] rounded-xl p-2.5">
                      {hi ? "पहले शुरू किए गए दान को जारी रख रहे हैं।" : "Continuing the donation you started earlier."}{" "}
                      <button type="button" onClick={resetAll} className="font-bold text-[#E86F1D] underline underline-offset-2">
                        {hi ? "नया दान शुरू करें" : "Start a new donation"}
                      </button>
                    </p>
                  )}

                  {session.membership && (
                    <p className="text-xs text-[#2B201A]/75">
                      <strong>{localizeProgramName(session.program, hi)}</strong>:{" "}
                      {hi
                        ? "ट्रस्ट द्वारा भुगतान की पुष्टि होते ही आपका सदस्यता प्रमाणपत्र आपको ईमेल किया जाएगा।"
                        : "your membership certificate is emailed to you once the Trust confirms the payment."}
                    </p>
                  )}
                  <div className="rounded-xl bg-[#14532D]/5 border border-[#14532D]/15 px-3.5 py-2.5 space-y-2">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#14532D]/70">
                          {hi ? "राशि" : "Amount"}
                        </p>
                        <p className="text-2xl font-extrabold text-[#14532D] tabular-nums leading-tight">{formatINR(session.amount)}</p>
                      </div>
                      <div className="text-right min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#14532D]/70">
                          {session.membership ? (hi ? "सदस्यता आईडी" : "Membership ID") : (hi ? "दान आईडी" : "Donation ID")}
                        </p>
                        <p className="font-mono text-xs font-bold text-[#1F1A17] truncate">{session.donationId}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-[#14532D]/10 pt-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#14532D]/70">
                          {hi ? "यूपीआई आईडी" : "UPI ID"}
                        </p>
                        <p className="font-bold text-sm text-[#1F1A17] break-all">{session.upiId}</p>
                        {session.accountLabel && <p className="text-xs text-[#2B201A]/60">{session.accountLabel}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        aria-label={copied ? (hi ? "UPI आईडी कॉपी हो गई" : "UPI ID copied") : (hi ? "UPI आईडी कॉपी करें" : "Copy UPI ID")}
                        className="shrink-0 p-1.5 rounded-md text-[#14532D]/70 hover:text-[#14532D] hover:bg-[#14532D]/5"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="flex items-start gap-2 text-xs text-[#2B201A]/70">
                    <ShieldCheck className="w-4 h-4 text-[#2F5A43] shrink-0" />
                    <span>
                      {hi ? (
                        <>
                          किसी भी UPI ऐप (BHIM, Google Pay, PhonePe, Paytm) से QR स्कैन करें, या ऊपर दी गई UPI ID पर भेजें।{" "}
                          <strong>{session.upiName}</strong> को ठीक <strong>{formatINR(session.amount)}</strong> का भुगतान करें, फिर नीचे दिए बटन पर टैप करें। स्क्रीनशॉट या UTR की आवश्यकता नहीं है।
                        </>
                      ) : (
                        <>
                          Scan the QR with any UPI app (BHIM, Google Pay, PhonePe, Paytm), or send to the UPI ID above.{" "}
                          Pay exactly {formatINR(session.amount)} to {session.upiName}, then tap the button below. No screenshot or UTR needed.
                        </>
                      )}
                    </span>
                  </p>

                  {generalError}
                  <button type="button" onClick={handlePaid} disabled={busy} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>{hi ? "मैंने भुगतान पूरा कर लिया है" : "I Have Completed the Payment"}</span>
                  </button>
                  <button type="button" onClick={resetAll} className="w-full text-xs font-semibold text-[#2B201A]/60 hover:text-[#2B201A] py-1">
                    {hi ? "रद्द करें और राशि बदलें" : "Cancel and change amount"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUBMITTED, WAITING FOR THE TRUST TO APPROVE */}
            {step === "SUBMITTED" && session && (
              <div className="text-center py-2 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-[#2F5A43] mx-auto" aria-hidden="true" />
                <h4 className="font-editorial text-2xl font-bold text-[#2B201A]">
                  {hi ? "भुगतान सफलतापूर्वक सबमिट हुआ" : "Payment submitted successfully"}
                </h4>
                <p className="text-sm text-[#2B201A]/80 leading-relaxed max-w-sm mx-auto" role="status">
                  {hi ? (
                    <>
                      धन्यवाद, <strong>{session.name}</strong>! ट्रस्ट को आपके <strong>{formatINR(session.amount)}</strong> के भुगतान की सूचना मिल गई है।
                      खाते में सत्यापन होते ही आपकी पावती रसीद <strong className="wrap-anywhere">{session.email}</strong> पर भेज दी जाएगी।
                    </>
                  ) : (
                    <>
                      Thank you, {session.name}! The Trust has been notified of your payment of <strong>{formatINR(session.amount)}</strong>.
                      Once they confirm it has reached their UPI account, we&apos;ll email your confirmation to{" "}
                      <strong className="wrap-anywhere">{session.email}</strong>.
                    </>
                  )}
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm text-left bg-[#FBF2E7] border border-[#E7D8C8] rounded-xl p-4 max-w-sm mx-auto">
                  <dt className="text-[#2B201A]/60">{session.membership ? (hi ? "सदस्यता आईडी" : "Membership ID") : (hi ? "दान आईडी" : "Donation ID")}</dt>
                  <dd className="font-mono font-semibold text-right">{session.donationId}</dd>
                  {session.membership && (
                    <>
                      <dt className="text-[#2B201A]/60">{hi ? "योजना" : "Plan"}</dt>
                      <dd className="font-semibold text-right">{localizeProgramName(session.program, hi)}</dd>
                    </>
                  )}
                  <dt className="text-[#2B201A]/60">{hi ? "राशि" : "Amount"}</dt>
                  <dd className="font-semibold text-right tabular-nums">{formatINR(session.amount)}</dd>
                  <dt className="text-[#2B201A]/60">{hi ? "स्थिति" : "Status"}</dt>
                  <dd className="font-semibold text-right text-[#B8893E]">{hi ? "पुष्टि की प्रतीक्षा" : "Awaiting confirmation"}</dd>
                </dl>
                <p className="text-xs text-[#2B201A]/60 max-w-sm mx-auto">
                  {hi
                    ? `आप यह विंडो बंद कर सकते हैं। संदर्भ हेतु अपनी ${session.membership ? "सदस्यता आईडी" : "दान आईडी"} सुरक्षित रखें।`
                    : `You can close this window. Keep your ${session.membership ? "Membership ID" : "Donation ID"} for reference.`}
                </p>
                {generalError}
                <button type="button" onClick={handleClose} className="btn-primary px-8">
                  {hi ? "बंद करें" : "Close"}
                </button>
              </div>
            )}

            {/* STEP 4: PAYMENT APPROVED BY THE TRUST */}
            {step === "DONE" && session && (
              <div className="text-center py-4 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-[#2F5A43] mx-auto" aria-hidden="true" />
                <h4 className="font-editorial text-2xl font-bold text-[#2B201A]">
                  {hi ? "धन्यवाद! भुगतान प्राप्त हुआ" : "Payment received. Thank you!"}
                </h4>
                <p className="text-sm text-[#2B201A]/80 leading-relaxed max-w-sm mx-auto">
                  {hi ? (
                    session.membership ? (
                      <>ट्रस्ट में आपका स्वागत है! आपका <strong>{localizeProgramName(session.program, hi)}</strong> का <strong>{formatINR(session.amount)}</strong> का भुगतान प्राप्त हो गया है।</>
                    ) : (
                      <>ट्रस्ट को आपका <strong>{formatINR(session.amount)}</strong> का पावन दान प्राप्त हो गया है।</>
                    )
                  ) : (
                    session.membership ? (
                      <>Welcome to the Trust! Your <strong>{session.program}</strong> payment of <strong>{formatINR(session.amount)}</strong> has been received.</>
                    ) : (
                      <>The Trust has received your donation of <strong>{formatINR(session.amount)}</strong>.</>
                    )
                  )}
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm text-left bg-[#FBF2E7] border border-[#E7D8C8] rounded-xl p-4 max-w-sm mx-auto">
                  <dt className="text-[#2B201A]/60">{session.membership ? (hi ? "सदस्यता आईडी" : "Membership ID") : (hi ? "दान आईडी" : "Donation ID")}</dt>
                  <dd className="font-mono font-semibold text-right">{session.donationId}</dd>
                  <dt className="text-[#2B201A]/60">{hi ? "राशि" : "Amount"}</dt>
                  <dd className="font-semibold text-right tabular-nums">{formatINR(session.amount)}</dd>
                </dl>
                <p className="text-sm text-[#2B201A]/80 leading-relaxed max-w-sm mx-auto">
                  {hi ? (
                    session.membership
                      ? emailSent ? "आपकी सदस्यता पावती और प्रमाणपत्र ईमेल कर दिए गए हैं: " : "आपकी सदस्यता पावती और प्रमाणपत्र ईमेल पर भेजे जाएंगे: "
                      : emailSent ? "आपकी पावती और प्रमाणपत्र ईमेल कर दिए गए हैं: " : "आपकी पावती और प्रमाणपत्र ईमेल पर भेजे जाएंगे: "
                  ) : (
                    session.membership
                      ? emailSent ? "Your membership confirmation and certificate have been emailed to " : "Your membership confirmation and certificate will be emailed to "
                      : emailSent ? "Your confirmation and certificate have been emailed to " : "Your confirmation and certificate will be emailed to "
                  )}
                  <strong className="wrap-anywhere">{session.email}</strong>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {certificateUrl && (
                    <a href={certificateUrl} target="_blank" rel="noopener" className="btn-secondary">
                      <Award className="w-4 h-4" />
                      <span>{hi ? "प्रमाणपत्र देखें" : "View certificate"}</span>
                    </a>
                  )}
                  {passUrl && (
                    <a href={passUrl} target="_blank" rel="noopener" className="btn-secondary">
                      <Award className="w-4 h-4" />
                      <span>{hi ? "प्रवेश पास देखें" : "View entry pass"}</span>
                    </a>
                  )}
                  <button onClick={handleClose} className="btn-primary px-8">
                    {hi ? "बंद करें" : "Close"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
