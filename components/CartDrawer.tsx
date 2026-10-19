"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Lock,
  User,
  Phone,
  Mail,
  Loader2,
  ArrowLeft,
  Package,
  Copy,
  Check,
  ShieldCheck,
  Banknote,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    user,
    openAuthModal,
    lang,
  } = useApp();

  const [step, setStep] = useState<"CART" | "SHIPPING" | "PAY_UPI" | "SUCCESS">("CART");
  const [paymentMethod, setPaymentMethod] = useState<"PREPAID" | "COD">("PREPAID");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Trust UPI payment config (matching donation system)
  const upiId = "9910762692@ybl";
  const upiName = "AANIKET";
  const upiUri = `upi://pay?mc=0000&pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${cartTotal.toFixed(2)}&cu=INR&tn=BOOK-ORDER`;

  // Shipping Form State
  const [shippingName, setShippingName] = useState("");
  const [shippingEmail, setShippingEmail] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");

  // Auto-fill from user profile when user logs in
  useEffect(() => {
    if (user) {
      setShippingName((prev) => prev || user.name || "");
      setShippingEmail((prev) => prev || user.email || "");
      setShippingPhone((prev) => prev || user.phone || "");
      setShippingAddress((prev) => prev || user.address || "");
      setShippingCity((prev) => prev || user.city || "");
      setShippingState((prev) => prev || user.state || "");
      setShippingPincode((prev) => prev || user.pincode || "");
    }
  }, [user]);

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    if (!user) {
      // User must log in or register first
      openAuthModal(() => {
        setStep("SHIPPING");
      });
      return;
    }
    setStep("SHIPPING");
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateShippingForm = () => {
    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim() || !shippingCity.trim() || !shippingState.trim() || !shippingPincode.trim()) {
      setOrderError(lang === "hi" ? "कृपया सभी आवश्यक डिलीवरी विवरण भरें।" : "Please fill all required delivery details.");
      return false;
    }
    setOrderError(null);
    return true;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateShippingForm()) return;

    if (paymentMethod === "PREPAID") {
      setStep("PAY_UPI");
    } else {
      executePlaceOrder("COD");
    }
  };

  const executePlaceOrder = async (chosenMethod: "PREPAID" | "COD") => {
    setOrderError(null);
    setIsPlacingOrder(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingName,
          shippingEmail,
          shippingPhone,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingPincode,
          paymentMethod: chosenMethod,
          items: cart.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      setCreatedOrderNumber(data.order.orderNumber);
      clearCart();
      setStep("SUCCESS");
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : "Error placing order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const hi = lang === "hi";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-[#FFF9F2] shadow-2xl flex flex-col border-l border-[#E7D8C8]">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#FBF2E7] border-b border-[#E7D8C8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step === "SHIPPING" && (
                <button
                  onClick={() => setStep("CART")}
                  className="p-1 text-[#2B201A]/60 hover:text-[#2B201A] rounded-lg mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              {step === "PAY_UPI" && (
                <button
                  onClick={() => setStep("SHIPPING")}
                  className="p-1 text-[#2B201A]/60 hover:text-[#2B201A] rounded-lg mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <ShoppingBag className="w-5 h-5 text-[#E86F1D]" />
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#2B201A]">
                {step === "CART"
                  ? hi ? "आपकी कार्ट" : "Your Shopping Cart"
                  : step === "SHIPPING"
                  ? hi ? "डिलीवरी एवं भुगतान विकल्प" : "Delivery & Payment Option"
                  : step === "PAY_UPI"
                  ? hi ? "UPI QR भुगतान" : "Pay via UPI QR Code"
                  : hi ? "ऑर्डर पुष्टिकरण" : "Order Confirmation"}
              </h2>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                if (step === "SUCCESS") setStep("CART");
              }}
              className="p-2 text-[#2B201A]/60 hover:text-[#2B201A] rounded-lg hover:bg-[#FFF9F2]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* STEP 4: SUCCESS VIEW */}
            {step === "SUCCESS" ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-[#2F5A43] mx-auto animate-bounce" />
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-[#2F5A43]/10 text-[#2F5A43] text-xs font-bold rounded-full">
                    {hi ? "ऑर्डर सफलतापूर्वक दर्ज हुआ" : "Order Placed Successfully"}
                  </span>
                  <h3 className="font-editorial text-2xl font-bold text-[#2B201A] pt-2">
                    {hi ? "जय श्री कृष्ण!" : "Thank You For Your Support"}
                  </h3>
                  {createdOrderNumber && (
                    <p className="text-xs font-mono font-bold text-[#B8893E] bg-[#FBF2E7] py-1.5 px-3 rounded-lg border border-[#E7D8C8] inline-block">
                      ORDER ID: {createdOrderNumber}
                    </p>
                  )}
                </div>

                <div className="bg-[#FBF2E7] p-3.5 rounded-xl border border-[#E7D8C8] text-xs text-left space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#2B201A]/70">{hi ? "भुगतान विधि:" : "Payment Mode:"}</span>
                    <strong className="text-[#2B201A]">
                      {paymentMethod === "COD" ? (hi ? "Cash on Delivery (पे ऑन डिलीवरी)" : "Cash on Delivery (COD)") : (hi ? "Prepaid (ऑनलाइन UPI QR)" : "Prepaid UPI")}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#2B201A]/70">{hi ? "भुगतान स्थिति:" : "Payment Status:"}</span>
                    <strong className="text-[#B8893E] bg-[#B8893E]/10 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      {paymentMethod === "COD"
                        ? (hi ? "डिलीवरी पर देय (Pending)" : "Pending on Delivery")
                        : (hi ? "लंबित (एडमिन सत्यापन प्रतीक्षित)" : "Pending Admin Verification")}
                    </strong>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#2B201A]/80 max-w-sm mx-auto leading-relaxed">
                  {paymentMethod === "PREPAID"
                    ? hi
                      ? "आपका UPI भुगतान अनुरोध प्राप्त हो गया है। ट्रस्ट एडमिन द्वारा बैंक सत्यापन (Approve) के पश्चात आपके एकाउंट में 'Paid' अपडेट हो जाएगा।"
                      : "Your UPI payment has been received for verification. Once approved by the Trust admin, it will update to 'Paid' in your account."
                    : hi
                      ? "आपकी पुस्तक की प्रति सुरक्षित रूप से पैक कर शीघ्र ही आपके पते पर डिस्पैच कर दी जाएगी।"
                      : "Your publication will be securely packed and dispatched to your registered delivery address."}
                </p>

                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    href="/account"
                    onClick={() => {
                      setIsCartOpen(false);
                      setStep("CART");
                    }}
                    className="w-full py-3 bg-[#E86F1D] hover:bg-[#D25E12] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-warm-md flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>{hi ? "मेरे आर्डर्स देखें (View My Orders)" : "View My Orders & Account"}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setStep("CART");
                    }}
                    className="w-full py-2.5 border border-[#E7D8C8] text-[#2B201A]/80 hover:bg-[#FBF2E7] text-xs font-bold uppercase tracking-wider rounded-xl"
                  >
                    {hi ? "बंद करें" : "Close"}
                  </button>
                </div>
              </div>
            ) : step === "PAY_UPI" ? (
              /* STEP 3: PREPAID UPI QR CODE PAYMENT SCREEN (MATCHING STANDEE DESIGN) */
              <div className="space-y-4">
                {/* Standee Payment Card */}
                <div className="rounded-2xl border-[3px] border-[#C9A24B] bg-white overflow-hidden shadow-sm">
                  <div className="flex flex-col items-center text-center p-3 sm:p-4">
                    {/* Header */}
                    <div className="w-full flex items-center justify-center gap-2">
                      <div className="relative w-11 h-11 shrink-0 rounded-full border-[3px] border-[#14532D] bg-white overflow-hidden shadow">
                        <Image
                          src="/images/logo.jpg"
                          alt="Namo Bhagwate Vasudevaya Trust emblem"
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <h4 className="font-sans text-base sm:text-lg leading-tight font-extrabold tracking-tight uppercase text-[#14532D] text-left">
                        Namo Bhagwate Trust
                      </h4>
                    </div>

                    {/* QR Code */}
                    <div className="mt-3 p-2 bg-white rounded-xl border border-[#E7D8C8] shadow-xs">
                      <QRCodeSVG
                        value={upiUri}
                        size={190}
                        level="M"
                        marginSize={0}
                        title={`UPI payment of ₹${cartTotal.toFixed(2)} to ${upiName}`}
                      />
                    </div>

                    {/* Banner */}
                    <div className="mt-2.5 w-full flex items-center gap-2">
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C9A24B]" />
                      <span className="font-editorial text-base sm:text-lg font-bold text-[#14532D] whitespace-nowrap">
                        Scan &amp; Support
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C9A24B]" />
                    </div>
                    <p className="text-[11px] text-[#2B201A]/75 mt-0.5">
                      For a Better, Kinder &amp; Healthier Society
                    </p>
                  </div>
                  <div className="bg-[#14532D] text-[#E9D9A6] text-center py-1.5 text-[9px] font-semibold tracking-[0.3em]">
                    SEVA • SANSKAR • SAMARPAN
                  </div>
                </div>

                {/* Amount & UPI Details */}
                <div className="rounded-xl bg-[#14532D]/5 border border-[#14532D]/15 p-3.5 space-y-2">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#14532D]/70">
                        {hi ? "कुल देय राशि" : "Amount to Pay"}
                      </p>
                      <p className="text-2xl font-extrabold text-[#14532D] tabular-nums leading-tight">
                        ₹{cartTotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E86F1D] text-white uppercase">
                        Book Order
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-[#14532D]/10 pt-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#14532D]/70">
                        UPI ID
                      </p>
                      <p className="font-bold text-sm text-[#1F1A17] truncate">{upiId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="shrink-0 p-1.5 rounded-md text-[#14532D]/80 hover:text-[#14532D] hover:bg-[#14532D]/10 flex items-center gap-1 text-xs font-semibold"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-[#2F5A43]" />
                          <span className="text-[11px] text-[#2F5A43] font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Direct UPI App link on mobile devices */}
                <div className="sm:hidden">
                  <a
                    href={upiUri}
                    className="w-full py-2.5 bg-[#FFFDF8] border-2 border-[#14532D] text-[#14532D] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:bg-[#14532D]/5 shadow-xs"
                  >
                    <span>Pay using UPI App (GPay / PhonePe / Paytm)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Instructions */}
                <div className="flex items-start gap-2 text-xs text-[#2B201A]/75 bg-[#FBF2E7] p-3 rounded-xl border border-[#E7D8C8]">
                  <ShieldCheck className="w-4 h-4 text-[#2F5A43] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {hi
                      ? `किसी भी UPI ऐप (BHIM, Google Pay, PhonePe, Paytm) से ऊपर दिए गए QR कोड को स्कैन करें। ठीक ₹${cartTotal.toFixed(2)} का भुगतान करने के बाद नीचे दिए गए बटन पर टैप करें।`
                      : `Scan the QR with any UPI app (BHIM, Google Pay, PhonePe, Paytm). Pay exactly ₹${cartTotal.toFixed(2)} to ${upiName}, then tap the button below. No screenshot or UTR needed.`}
                  </span>
                </div>

                {orderError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                    {orderError}
                  </div>
                )}

                {/* Payment Completed Button */}
                <button
                  type="button"
                  onClick={() => executePlaceOrder("PREPAID")}
                  disabled={isPlacingOrder}
                  className="w-full py-3.5 bg-[#E86F1D] hover:bg-[#D25E12] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-warm-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{hi ? "ऑर्डर दर्ज हो रहा है..." : "Processing Order..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{hi ? "मैंने भुगतान कर दिया है (I Have Paid)" : "I Have Completed The Payment"}</span>
                    </>
                  )}
                </button>
              </div>
            ) : step === "SHIPPING" ? (
              /* STEP 2: SHIPPING DETAILS & PAYMENT METHOD SELECTION */
              <form id="shipping-form" onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="p-3 bg-[#FBF2E7] rounded-xl border border-[#E7D8C8] text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#2B201A]">
                    <span>{hi ? "लॉग-इन भक्त:" : "Signed in as:"}</span>
                    <span className="text-[#E86F1D]">{user?.name}</span>
                  </div>
                  <p className="text-[11px] text-[#2B201A]/70">{user?.email}</p>
                </div>

                {orderError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                    {orderError}
                  </div>
                )}

                {/* PAYMENT METHOD CHOOSER: PREPAID vs COD */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#B8893E]">
                    {hi ? "भुगतान का विकल्प चुनें" : "Select Payment Method"} *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* PREPAID OPTION */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("PREPAID")}
                      className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all ${
                        paymentMethod === "PREPAID"
                          ? "border-[#E86F1D] bg-[#FFF9F2] shadow-xs"
                          : "border-[#E7D8C8] bg-white hover:bg-[#FBF2E7]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#2B201A] flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-[#E86F1D]" />
                          <span>{hi ? "ऑनलाइन UPI QR" : "Prepaid UPI QR"}</span>
                        </span>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-[#E86F1D] flex items-center justify-center p-0.5">
                          {paymentMethod === "PREPAID" && (
                            <span className="w-full h-full bg-[#E86F1D] rounded-full" />
                          )}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#2B201A]/60 mt-1">
                        {hi ? "QR कोड स्कैन कर तुरंत भुगतान" : "Scan UPI QR Code & Pay"}
                      </p>
                    </button>

                    {/* COD OPTION */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("COD")}
                      className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all ${
                        paymentMethod === "COD"
                          ? "border-[#E86F1D] bg-[#FFF9F2] shadow-xs"
                          : "border-[#E7D8C8] bg-white hover:bg-[#FBF2E7]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#2B201A] flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-[#2F5A43]" />
                          <span>{hi ? "कैश ऑन डिलीवरी" : "Cash on Delivery"}</span>
                        </span>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-[#E86F1D] flex items-center justify-center p-0.5">
                          {paymentMethod === "COD" && (
                            <span className="w-full h-full bg-[#E86F1D] rounded-full" />
                          )}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#2B201A]/60 mt-1">
                        {hi ? "किताब मिलने पर नकद या UPI दें" : "Pay in cash or UPI at delivery"}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#B8893E] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{hi ? "डिलीवरी का पता भरें" : "Delivery & Shipping Address"}</span>
                  </p>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                      {hi ? "प्राप्तकर्ता का नाम" : "Recipient Name"} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#B8893E] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                        {hi ? "मोबाइल नंबर" : "Phone"} *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#B8893E] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(e.target.value)}
                          placeholder="+91..."
                          className="w-full pl-9 pr-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                        {hi ? "ईमेल" : "Email"} *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#B8893E] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={shippingEmail}
                          onChange={(e) => setShippingEmail(e.target.value)}
                          placeholder="Email"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                      {hi ? "पूरा पता" : "Street Address / House No."} *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder={hi ? "मकान नं, भवन, गली, मोहल्ला" : "Flat / House No., Landmark, Street"}
                      className="w-full px-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                        {hi ? "शहर" : "City"} *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        placeholder="City"
                        className="w-full px-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                        {hi ? "राज्य" : "State"} *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingState}
                        onChange={(e) => setShippingState(e.target.value)}
                        placeholder="State"
                        className="w-full px-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                        {hi ? "पिनकोड" : "Pincode"} *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingPincode}
                        onChange={(e) => setShippingPincode(e.target.value)}
                        placeholder="PIN"
                        className="w-full px-3 py-2 bg-white border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
                      />
                    </div>
                  </div>
                </div>

                {/* Items Summary in Shipping step */}
                <div className="pt-2 border-t border-[#E7D8C8] space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2B201A]/70">
                    {hi ? "ऑर्डर सारांश" : "Order Summary"} ({cart.length} {cart.length === 1 ? "item" : "items"})
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-[#E7D8C8]/50">
                        <span className="truncate max-w-[200px] text-[#2B201A]">
                          {item.title} <strong className="text-[#E86F1D]">×{item.quantity}</strong>
                        </span>
                        <span className="font-bold text-[#2B201A]">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            ) : cart.length === 0 ? (
              /* STEP 1: EMPTY CART VIEW */
              <div className="text-center py-16 space-y-4 text-[#2B201A]/60">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-[#B8893E]" />
                <p className="text-base font-medium">
                  {hi ? "आपकी कार्ट खाली है।" : "Your cart is currently empty."}
                </p>
                <p className="text-xs">
                  {hi
                    ? "पुस्तकों का संग्रह देखने के लिए नीचे दिए गए बटन पर क्लिक करें।"
                    : "Explore our agricultural & spiritual publications."}
                </p>
                <Link
                  href="/books"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block mt-2 px-5 py-2 bg-[#E86F1D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-warm-sm"
                >
                  {hi ? "पुस्तकें देखें" : "Explore Books"}
                </Link>
              </div>
            ) : (
              /* STEP 1: CART ITEMS LIST */
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-[#FBF2E7] rounded-xl border border-[#E7D8C8] shadow-warm-sm"
                >
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border border-[#E7D8C8]">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#2B201A] line-clamp-2">{item.title}</h4>
                      <p className="text-sm font-semibold text-[#E86F1D] mt-1">₹{item.price.toFixed(2)} INR</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#E7D8C8] bg-[#FFF9F2] rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:text-[#E86F1D]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:text-[#E86F1D]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action Bars */}
          {step === "CART" && cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#FBF2E7] border-t border-[#E7D8C8] space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-[#2B201A]/80">{hi ? "उप-योग (Subtotal)" : "Subtotal"}</span>
                <span className="font-bold text-lg text-[#2B201A]">₹{cartTotal.toFixed(2)} INR</span>
              </div>
              <p className="text-xs text-[#2B201A]/60">
                {hi
                  ? "चेकआउट के लिए लॉगिन या पंजीकरण अनिवार्य है।"
                  : "Login or registration is required to complete book purchase."}
              </p>
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 bg-[#E86F1D] hover:bg-[#D25E12] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-warm-md flex items-center justify-center gap-2 transition-all"
              >
                {!user ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{hi ? "लॉगिन कर चेकआउट करें" : "Login & Proceed to Checkout"}</span>
                  </>
                ) : (
                  <>
                    <span>{hi ? "चेकआउट करें (Proceed to Checkout)" : "Proceed to Checkout"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === "SHIPPING" && (
            <div className="p-4 sm:p-5 bg-[#FBF2E7] border-t border-[#E7D8C8] space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#2B201A]/80">{hi ? "कुल देय राशि" : "Total Payable Amount"}</span>
                <span className="font-bold text-lg text-[#E86F1D]">₹{cartTotal.toFixed(2)} INR</span>
              </div>
              <button
                type="submit"
                form="shipping-form"
                disabled={isPlacingOrder}
                className={`w-full py-3.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-warm-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                  paymentMethod === "PREPAID"
                    ? "bg-[#E86F1D] hover:bg-[#D25E12]"
                    : "bg-[#2F5A43] hover:bg-[#234533]"
                }`}
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{hi ? "ऑर्डर दर्ज हो रहा है..." : "Processing Order..."}</span>
                  </>
                ) : paymentMethod === "PREPAID" ? (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>{hi ? `UPI QR से भुगतान करें · ₹${cartTotal.toFixed(2)}` : `Proceed to UPI QR Payment · ₹${cartTotal.toFixed(2)}`}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{hi ? "ऑर्डर कन्फर्म करें (Cash on Delivery)" : "Confirm Order (Cash on Delivery)"}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
