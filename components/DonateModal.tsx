"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { X, Heart, ShieldCheck, Smartphone, Copy, Check, Loader2, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MEMBERSHIP_PLANS, PRESET_AMOUNTS, formatINR } from "@/lib/donation-config";
import {
  createDonationSchema,
  parseRupees,
  sanitizeEmail,
  sanitizeMobile,
  sanitizeName,
  validateAmount,
  validateEmail,
  validateMobile,
  validateName,
} from "@/lib/validation/donation";

// SELECT → PAY (QR shown) → WAITING (donor says they paid) → DONE (bank alert matched).
// The page polls the server while on PAY/WAITING; no UTR or screenshot is needed.
type Step = "SELECT" | "PAY" | "WAITING" | "DONE";

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
}

const STORAGE_KEY = "nbvt-donation-in-progress";

function loadSaved(): { session: PaymentSession; step: Step } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return { session: saved.session, step: saved.step === "WAITING" ? "WAITING" : "PAY" };
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

  const [selectedAmount, setSelectedAmount] = useState<number>(1100);
  const [customAmount, setCustomAmount] = useState("");
  const [planId, setPlanId] = useState<string>(MEMBERSHIP_PLANS[0].id);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const [slow, setSlow] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [openedFor, setOpenedFor] = useState<string | null>(null);

  const isMembership = Boolean(
    donateModal.isMembership || donateModal.program?.toLowerCase().includes("membership"),
  );
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId) ?? MEMBERSHIP_PLANS[0];
  const typedAmount = customAmount ? parseRupees(customAmount) : null;
  const currentAmount = isMembership ? plan.price : customAmount ? typedAmount ?? 0 : selectedAmount;
  // The modal body only renders after a click, so this never runs on the server.
  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // When the modal opens: resume an unfinished donation from this tab, or start fresh.
  const openKey = donateModal.isOpen ? `${donateModal.program}|${donateModal.amount}|${isMembership}` : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setError(null);
      setTouched({});
      setSubmitted(false);
      const saved = loadSaved();
      if (saved) {
        setSession(saved.session);
        setStep(saved.step);
        setResumed(true);
      } else {
        setResumed(false);
        setStep("SELECT");
        setCustomAmount("");
        if (isMembership) {
          const match = MEMBERSHIP_PLANS.find(
            (p) => p.name.toLowerCase() === donateModal.program?.toLowerCase() || p.price === donateModal.amount,
          );
          setPlanId((match ?? MEMBERSHIP_PLANS[0]).id);
        } else {
          setSelectedAmount(donateModal.amount || 1100);
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
    if (!donateModal.isOpen || !session || (step !== "PAY" && step !== "WAITING")) return;
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
        if (data.status === "VERIFIED") {
          clearSaved();
          setEmailSent(data.emailStatus === "SENT");
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
    const timer = setInterval(check, step === "WAITING" ? 5000 : 8000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [donateModal.isOpen, session, step]);

  // After a few minutes of waiting, reassure the donor that they can leave.
  useEffect(() => {
    if (step !== "WAITING") return;
    const timer = setTimeout(() => setSlow(true), 3 * 60_000);
    return () => clearTimeout(timer);
  }, [step]);

  if (!donateModal.isOpen) return null;

  function handleClose() {
    if (step === "DONE") resetAll();
    closeDonateModal();
  }

  function resetAll() {
    clearSaved();
    setSession(null);
    setStep("SELECT");
    setResumed(false);
    setSlow(false);
    setEmailSent(false);
    setError(null);
    setTouched({});
    setSubmitted(false);
  }

  function goTo(next: Step, s: PaymentSession | null = session) {
    setError(null);
    setSlow(false);
    setStep(next);
    if (s && (next === "PAY" || next === "WAITING")) save(s, next);
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
      const amt = customAmount ? parseRupees(customAmount) : selectedAmount;
      const err = validateAmount(amt, minAmount);
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
      const amt = customAmount ? parseRupees(customAmount) : selectedAmount;
      const amountErr = validateAmount(amt, minAmount);
      if (amountErr) {
        setError({ message: amountErr, field: "amount" });
        if (customAmount) {
          document.getElementById("donate-custom-amount")?.focus();
        }
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
      };
      setSession(s);
      goTo("PAY", s);
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

  const fieldError = (field: string) =>
    error?.field === field ? <p className="mt-1 text-xs font-semibold text-[#B3261E]">{error.message}</p> : null;
  const generalError = error && !["name", "email", "mobile", "amount"].includes(error.field ?? "") ? (
    <p role="alert" className="text-sm font-semibold text-[#B3261E] bg-[#B3261E]/5 border border-[#B3261E]/20 rounded-xl p-3">
      {error.message}
    </p>
  ) : null;

  const stepIndex = { SELECT: 0, PAY: 1, WAITING: 1, DONE: 2 }[step];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="donate-title">
      <div className="min-h-full flex items-center justify-center p-3 sm:p-4">
        <div className="bg-[#FFF9F2] rounded-2xl max-w-lg w-full overflow-hidden border border-[#E7D8C8] shadow-2xl relative">
          {/* Header */}
          <div className="bg-[#FBF2E7] px-5 py-4 sm:p-6 border-b border-[#E7D8C8] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#E86F1D]/10 flex items-center justify-center text-[#E86F1D]">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div className="min-w-0">
                <h3 id="donate-title" className="font-editorial text-xl font-bold text-[#2B201A] truncate">
                  {session && step !== "SELECT" ? session.program : donateModal.program || (hi ? "सेवा हेतु दान" : "Support Our Mission")}
                </h3>
                <p className="text-xs text-[#B8893E] font-semibold">Namo Bhagwate Vasudevaya Trust</p>
              </div>
            </div>
            <button onClick={handleClose} aria-label="Close" className="p-2 text-[#2B201A]/60 hover:text-[#2B201A] rounded-lg hover:bg-[#FFF9F2]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          {step !== "DONE" && (
            <ol className="flex gap-2 px-5 sm:px-6 pt-4 text-[11px] font-bold uppercase tracking-wider">
              {["Details", "Pay", "Confirmed"].map((label, i) => (
                <li key={label} className={`flex-1 border-t-2 pt-1.5 ${i <= stepIndex ? "border-[#E86F1D] text-[#E86F1D]" : "border-[#E7D8C8] text-[#2B201A]/40"}`}>
                  {i + 1}. {label}
                </li>
              ))}
            </ol>
          )}

          <div className="p-5 sm:p-6">
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
                            <span className="text-xs font-bold leading-tight">{p.name}</span>
                            <span className={`text-sm sm:text-base font-extrabold mt-1 ${selected ? "text-white" : "text-[#E86F1D]"}`}>
                              {formatINR(p.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-[#2B201A]/80 tracking-wider mb-2">
                        {hi ? "योगदान की राशि चुनें" : "Select Contribution Amount"}
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {PRESET_AMOUNTS.map((amt) => {
                          const selected = selectedAmount === amt && !customAmount;
                          return (
                            <button
                              key={amt}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => {
                                setSelectedAmount(amt);
                                setCustomAmount("");
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
                    <div>
                      <label htmlFor="donate-custom-amount" className="block text-xs font-semibold text-[#2B201A]/70 mb-1">
                        {hi ? "अथवा अपनी इच्छानुसार राशि (₹)" : "Or enter another amount (₹)"}
                      </label>
                      <input
                        id="donate-custom-amount"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={7}
                        placeholder={`Minimum ${formatINR(minAmount)}`}
                        value={customAmount}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/\D/g, "").slice(0, 7);
                          setCustomAmount(sanitized);
                          if (error?.field === "amount") setError(null);
                        }}
                        onBlur={() => handleBlurField("amount")}
                        className="input-warm"
                      />
                      {fieldError("amount")}
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="donate-name" className="block text-xs font-semibold text-[#2B201A]/80 mb-1">Full Name *</label>
                    <input
                      id="donate-name"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={60}
                      placeholder="Your full name"
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
                    <label htmlFor="donate-mobile" className="block text-xs font-semibold text-[#2B201A]/80 mb-1">Mobile Number <span className="font-normal text-[#2B201A]/50">(optional)</span></label>
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
                  <label htmlFor="donate-email" className="block text-xs font-semibold text-[#2B201A]/80 mb-1">Email Address *</label>
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
                  <p className="mt-1 text-xs text-[#2B201A]/55">Your confirmation will be sent here after we verify the payment.</p>
                </div>

                <div className="flex items-start gap-2 text-xs text-[#2B201A]/70 bg-[#FBF2E7] p-3 rounded-xl border border-[#E7D8C8]">
                  <ShieldCheck className="w-4 h-4 text-[#2F5A43] shrink-0 mt-0.5" />
                  <span>You will pay directly to the Trust&apos;s UPI account using any UPI app. No card details are collected.</span>
                </div>

                {generalError}

                <button type="submit" disabled={busy || currentAmount <= 0} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Continue to Payment · {formatINR(currentAmount)}</span>
                </button>
              </form>
            )}

            {/* STEP 2: PAY BY UPI */}
            {step === "PAY" && session && (
              <div className="space-y-4">
                {resumed && (
                  <p className="text-xs text-[#2B201A]/70 bg-[#FBF2E7] border border-[#E7D8C8] rounded-xl p-3">
                    Continuing the donation you started earlier.{" "}
                    <button type="button" onClick={resetAll} className="font-bold text-[#E86F1D] underline underline-offset-2">Start a new donation</button>
                  </p>
                )}
                {/* Payment card, styled after the Trust's printed UPI standee */}
                <div className="rounded-2xl border-[3px] border-[#C9A24B] bg-white overflow-hidden shadow-sm">
                  <div className="flex flex-col items-center text-center px-4 pt-5 pb-4">
                    <div className="relative w-22 h-22 rounded-full border-[5px] border-[#14532D] bg-white overflow-hidden shadow-md">
                      <Image src="/images/logo.jpg" alt="Namo Bhagwate Vasudevaya Trust emblem" fill sizes="88px" className="object-cover" />
                    </div>
                    <h4 className="mt-2.5 font-sans text-[1.45rem] sm:text-[1.6rem] leading-tight font-extrabold tracking-tight uppercase text-[#14532D]">
                      Namo Bhagwate Trust
                    </h4>
                    <p className="mt-1 text-sm text-[#2B201A]/75">UPI ID:</p>
                    <div className="flex items-center justify-center gap-1 max-w-full">
                      <p className="font-bold text-[15px] sm:text-base text-[#1F1A17] break-all">{session.upiId}</p>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        aria-label={copied ? "UPI ID copied" : "Copy UPI ID"}
                        className="shrink-0 p-1.5 rounded-md text-[#14532D]/70 hover:text-[#14532D] hover:bg-[#14532D]/5"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    {session.accountLabel && <p className="text-sm text-[#2B201A]/60">{session.accountLabel}</p>}

                    <div className="mt-3 w-full flex items-end justify-between gap-3 rounded-xl bg-[#14532D]/5 border border-[#14532D]/15 px-4 py-2.5 text-left">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#14532D]/70">Amount</p>
                        <p className="text-2xl font-extrabold text-[#14532D] tabular-nums leading-tight">{formatINR(session.amount)}</p>
                      </div>
                      <div className="text-right min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#14532D]/70">Donation ID</p>
                        <p className="font-mono text-xs font-bold text-[#1F1A17] truncate">{session.donationId}</p>
                      </div>
                    </div>

                    <div className="mt-3 bg-white p-1.5">
                      <QRCodeSVG value={session.qrData} size={208} level="M" marginSize={0} title={`UPI payment of ${formatINR(session.amount)} to ${session.upiName}`} />
                    </div>

                    <div className="mt-3 w-full flex items-center gap-3">
                      <span className="h-px flex-1 bg-linear-to-r from-transparent to-[#C9A24B]" />
                      <span className="font-editorial text-2xl font-bold text-[#14532D] whitespace-nowrap">Scan &amp; Support</span>
                      <span className="h-px flex-1 bg-linear-to-l from-transparent to-[#C9A24B]" />
                    </div>
                    <p className="text-sm text-[#2B201A]/80">For a Better, Kinder &amp; Healthier Society</p>
                  </div>
                  <div className="bg-[#14532D] text-[#E9D9A6] text-center py-2.5 text-[11px] font-semibold tracking-[0.35em]">
                    SEVA • SANSKAR • SAMARPAN
                  </div>
                </div>

                {isMobile && (
                  <a href={session.qrData} className="btn-secondary w-full">
                    <Smartphone className="w-4 h-4" />
                    <span>Pay {formatINR(session.amount)} using UPI app</span>
                  </a>
                )}

                <p className="flex items-start gap-2 text-xs text-[#2B201A]/70">
                  <ShieldCheck className="w-4 h-4 text-[#2F5A43] shrink-0" />
                  <span>
                    {isMobile ? "Or scan the QR from another phone. " : "Scan the QR with any UPI app (BHIM, Google Pay, PhonePe, Paytm). "}
                    Your payment goes directly to the Trust&apos;s UPI account ({session.upiName}). Please pay exactly {formatINR(session.amount)}.
                  </span>
                </p>

                <div className="border-t border-[#E7D8C8] pt-4 space-y-2">
                  <p className="text-center text-xs text-[#2B201A]/70">
                    This page confirms your payment automatically once the bank notifies us.
                  </p>
                  <button type="button" onClick={() => goTo("WAITING")} className="btn-primary w-full">
                    I Have Completed the Payment
                  </button>
                  <button type="button" onClick={resetAll} className="w-full text-xs font-semibold text-[#2B201A]/60 hover:text-[#2B201A] py-2">
                    Cancel and change amount
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: WAITING FOR THE BANK ALERT */}
            {step === "WAITING" && session && (
              <div className="text-center py-2 space-y-4">
                <Loader2 className="w-12 h-12 text-[#2F5A43] mx-auto animate-spin" aria-hidden="true" />
                <h4 className="font-editorial text-2xl font-bold text-[#2B201A]">Confirming your payment…</h4>
                <p className="text-sm text-[#2B201A]/80 leading-relaxed max-w-sm mx-auto" role="status">
                  We&apos;re waiting for the bank to confirm your payment of <strong>{formatINR(session.amount)}</strong>. This usually
                  takes under a minute, and this page updates on its own.
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm text-left bg-[#FBF2E7] border border-[#E7D8C8] rounded-xl p-4 max-w-sm mx-auto">
                  <dt className="text-[#2B201A]/60">Donation ID</dt><dd className="font-mono font-semibold text-right">{session.donationId}</dd>
                  <dt className="text-[#2B201A]/60">Amount</dt><dd className="font-semibold text-right tabular-nums">{formatINR(session.amount)}</dd>
                </dl>
                {slow && (
                  <p className="text-sm text-[#2B201A]/80 bg-[#FBF2E7] border border-[#E7D8C8] rounded-xl p-3 max-w-sm mx-auto">
                    Bank confirmations are sometimes delayed. You can safely close this window: once your payment reaches us, we&apos;ll
                    email the confirmation to <strong className="wrap-anywhere">{session.email}</strong>. Keep your Donation ID for reference.
                  </p>
                )}
                {generalError}
                <div className="flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => goTo("PAY")} className="btn-outline">Show QR code again</button>
                  <button type="button" onClick={handleClose} className="btn-outline">Close</button>
                </div>
              </div>
            )}

            {/* STEP 4: PAYMENT CONFIRMED BY THE BANK */}
            {step === "DONE" && session && (
              <div className="text-center py-4 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-[#2F5A43] mx-auto" aria-hidden="true" />
                <h4 className="font-editorial text-2xl font-bold text-[#2B201A]">{hi ? "धन्यवाद! भुगतान प्राप्त हुआ" : "Payment received. Thank you!"}</h4>
                <p className="text-sm text-[#2B201A]/80 leading-relaxed max-w-sm mx-auto">
                  The Trust has received your donation of <strong>{formatINR(session.amount)}</strong>.
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm text-left bg-[#FBF2E7] border border-[#E7D8C8] rounded-xl p-4 max-w-sm mx-auto">
                  <dt className="text-[#2B201A]/60">Donation ID</dt><dd className="font-mono font-semibold text-right">{session.donationId}</dd>
                  <dt className="text-[#2B201A]/60">Amount</dt><dd className="font-semibold text-right tabular-nums">{formatINR(session.amount)}</dd>
                </dl>
                <p className="text-sm text-[#2B201A]/80 leading-relaxed max-w-sm mx-auto">
                  {emailSent ? "A confirmation email has been sent to " : "A confirmation email will be sent to "}
                  <strong className="wrap-anywhere">{session.email}</strong>.
                </p>
                <button onClick={handleClose} className="btn-primary px-8">Close</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
