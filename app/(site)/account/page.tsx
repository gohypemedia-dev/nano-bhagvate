"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Calendar,
  Clock,
  CheckCircle2,
  Truck,
  BookOpen,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Edit2,
  Save,
  QrCode,
  Banknote,
  RotateCcw,
  XCircle,
  Award,
  Ticket,
  Download,
  Globe,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cachedFetch } from "@/lib/client-cache";
import HeadingDivider from "@/components/HeadingDivider";

interface OrderItem {
  id: string;
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
}

interface UserEventBooking {
  donationId: string;
  program: string;
  donorName: string;
  donorEmail: string;
  amountPaise: number;
  status: string;
  createdAt: string;
  verifiedAt: string | null;
  certificateKey: string;
  isCompleted: boolean;
  event: {
    id: string;
    slug: string;
    title: string;
    titleHi?: string | null;
    summary?: string | null;
    summaryHi?: string | null;
    startDate: string;
    endDate?: string | null;
    timeText?: string | null;
    location: string;
    address?: string | null;
    image?: string | null;
    contactPhone?: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: string;
  paymentMethod?: "PREPAID" | "COD" | string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  refundStatus?: "PENDING" | "COMPLETED" | null;
  refundReference?: string | null;
  refundedAt?: string | null;
  items: OrderItem[];
  createdAt: string;
}

export default function AccountPage() {
  const { user, isLoadingUser, logout, openAuthModal, lang, refreshUser } = useApp();
  const [activeTab, setActiveTab] = useState<"profile" | "membership" | "events" | "orders">("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [userEvents, setUserEvents] = useState<UserEventBooking[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsFilter, setEventsFilter] = useState<"all" | "upcoming" | "completed">("all");

  // Profile Edit State
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const fetchOrders = useCallback(async (force = false) => {
    // Only show full loading spinner if we don't have orders yet
    if (orders.length === 0) setLoadingOrders(true);
    try {
      const data = await cachedFetch<{ orders: Order[] }>("/api/orders", {
        ttlMs: 60 * 1000,
        forceRefresh: force,
      });
      setOrders(data?.orders || []);
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  }, [orders.length]);

  const fetchEvents = useCallback(async (force = false) => {
    if (userEvents.length === 0) setLoadingEvents(true);
    try {
      const data = await cachedFetch<{ events: UserEventBooking[] }>("/api/account/events", {
        ttlMs: 60 * 1000,
        forceRefresh: force,
      });
      setUserEvents(data?.events || []);
    } catch {
      // ignore
    } finally {
      setLoadingEvents(false);
    }
  }, [userEvents.length]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchEvents();
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
      setEditAddress(user.address || "");
      setEditCity(user.city || "");
      setEditState(user.state || "");
      setEditPincode(user.pincode || "");
    }
  }, [user, fetchOrders, fetchEvents]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          address: editAddress,
          city: editCity,
          state: editState,
          pincode: editPincode,
        }),
      });
      if (res.ok) {
        await refreshUser();
        setIsEditingPersonal(false);
        setIsEditingAddress(false);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3500);
      }
    } catch {
      // ignore
    } finally {
      setSavingProfile(false);
    }
  };

  const formatEventDate = (startStr: string, endStr?: string | null) => {
    const s = new Date(startStr);
    const startFmt = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(s);
    if (!endStr || endStr === startStr) return startFmt;
    const e = new Date(endStr);
    const endFmt = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(e);
    return `${startFmt} – ${endFmt}`;
  };

  const filteredEvents = userEvents.filter((booking) => {
    if (eventsFilter === "upcoming") return !booking.isCompleted;
    if (eventsFilter === "completed") return booking.isCompleted;
    return true;
  });

  const hi = lang === "hi";

  const todayFormatted = new Intl.DateTimeFormat(hi ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const getMembershipBadgeColors = (tier?: string) => {
    switch ((tier || "").toUpperCase()) {
      case "PLATINUM":
        return {
          badge: "bg-[#FAF5FF] text-[#581C87] border-[#D8B4FE]",
          icon: "text-[#581C87]",
        };
      case "GOLD":
        return {
          badge: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
          icon: "text-[#92400E]",
        };
      case "SILVER":
        return {
          badge: "bg-[#F8FAFC] text-[#334155] border-[#CBD5E1]",
          icon: "text-[#334155]",
        };
      case "BASIC":
        return {
          badge: "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]",
          icon: "text-[#166534]",
        };
      default:
        return {
          badge: "bg-[#FAF3EA] text-[#E86F1D] border-[#E7D8C8]",
          icon: "text-[#E86F1D]",
        };
    }
  };

  const getMembershipBannerGradient = (tier?: string) => {
    switch ((tier || "").toUpperCase()) {
      case "PLATINUM":
        return "bg-gradient-to-r from-[#3B0764] via-[#581C87] to-[#2E1065]";
      case "GOLD":
        return "bg-gradient-to-r from-[#78350F] via-[#92400E] to-[#A16207]";
      case "SILVER":
        return "bg-gradient-to-r from-[#1E293B] via-[#334155] to-[#475569]";
      case "BASIC":
      default:
        return "bg-gradient-to-r from-[#1A3D2F] via-[#2F5A43] to-[#143326]";
    }
  };

  const getEventBookingStatus = (status: string, isCompleted: boolean) => {
    switch (status) {
      case "VERIFIED":
        if (isCompleted) {
          return {
            label: hi ? "संपन्न (Completed)" : "Completed Event",
            color: "bg-stone-100 text-stone-700 border-stone-200",
            icon: CheckCircle2,
          };
        }
        return {
          label: hi ? "पास स्वीकृत (Confirmed)" : "Pass Confirmed",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
        };
      case "PENDING_PAYMENT":
      case "PENDING_VERIFICATION":
        return {
          label: hi ? "सत्यापन प्रक्रियाधीन (Pending)" : "Verification Pending",
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
        };
      case "REJECTED":
        return {
          label: hi ? "भुगतान अस्वीकृत (Rejected)" : "Payment Rejected",
          color: "bg-rose-50 text-rose-700 border-rose-200",
          icon: XCircle,
        };
      case "CANCELLED":
        return {
          label: hi ? "पास रद्द (Cancelled)" : "Cancelled",
          color: "bg-stone-100 text-stone-600 border-stone-300",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: "bg-stone-50 text-stone-700 border-stone-200",
          icon: Clock,
        };
    }
  };

  const formatShortDate = (value?: string | null) => {
    if (!value) return null;
    return new Intl.DateTimeFormat(hi ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(new Date(value));
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "PLACED":
        return {
          label: hi ? "स्वीकार किया गया (Placed)" : "Order Placed",
          color: "bg-[#B8893E]/10 text-[#B8893E] border-[#B8893E]/30",
        };
      case "PROCESSING":
        return {
          label: hi ? "पैकिंग जारी (Processing)" : "Processing",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "SHIPPED":
        return {
          label: hi ? "भेजा गया (Dispatched)" : "Shipped / Dispatched",
          color: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "DELIVERED":
        return {
          label: hi ? "वितरित (Delivered)" : "Delivered",
          color: "bg-green-50 text-green-700 border-green-200",
        };
      case "CANCELLED":
        return {
          label: hi ? "रद्द (Cancelled)" : "Cancelled",
          color: "bg-red-50 text-red-700 border-red-200",
        };
      default:
        return {
          label: status,
          color: "bg-stone-50 text-stone-700 border-stone-200",
        };
    }
  };

  const getTrackingTimeline = (order: Order) => {
    const currentStep =
      order.status === "DELIVERED"
        ? 4
        : order.status === "SHIPPED"
        ? 3
        : order.status === "PROCESSING"
        ? 2
        : 1;

    return [
      {
        step: 1,
        title: hi ? "ऑर्डर की पुष्टि हुई" : "Order Confirmed",
        date: formatShortDate(order.createdAt),
        done: true,
        active: currentStep === 1,
      },
      {
        step: 2,
        title: hi ? "सामग्री पैकिंग एवं तैयारी" : "Processing & Packing",
        date: "",
        done: currentStep >= 2,
        active: currentStep === 2,
      },
      {
        step: 3,
        title: hi ? "रवाना / डाक प्रेषित" : "Dispatched & In Transit",
        date: "",
        done: currentStep >= 3,
        active: currentStep === 3,
      },
      {
        step: 4,
        title: hi ? "सुपुर्दगी संपन्न" : "Out for Delivery & Delivered",
        date: "",
        done: currentStep === 4,
        active: currentStep === 4,
      },
    ];
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-[#FBF7F2]">
        <Loader2 className="w-8 h-8 text-[#E86F1D] animate-spin mb-3" />
        <p className="text-sm font-semibold text-[#2B201A]/70">
          {hi ? "खाता लोड हो रहा है..." : "Loading devotee account..."}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#FBF7F2]">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#E7D8C8] shadow-warm-md text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF9F2] text-[#E86F1D] mx-auto flex items-center justify-center border border-[#E7D8C8]">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A]">
              {hi ? "भक्त खाता पोर्टल" : "Devotee Portal"}
            </h1>
            <p className="text-sm text-[#2B201A]/70 leading-relaxed">
              {hi
                ? "अपनी सदस्यता, कार्यक्रम पास और पुस्तक आर्डर्स देखने के लिए कृपया अपने पंजीकृत खाते से लॉग इन करें।"
                : "Please sign in to view your trust membership privileges, event passes, and order history."}
            </p>
          </div>
          <button
            onClick={() => openAuthModal()}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm shadow-warm-md cursor-pointer"
          >
            <span>{hi ? "लॉग इन या रजिस्टर करें" : "Sign In or Register"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="pt-2 text-xs text-[#2B201A]/60 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2F5A43]" />
            <span>Namo Bhagwate Vasudevaya Trust Official Portal</span>
          </div>
        </div>
      </div>
    );
  }

  // Name splitting for reference display
  const nameParts = (user.name || "").trim().split(" ");
  const firstName = nameParts[0] || user.name || "Devotee";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "—";
  const userRole = user.membership?.tierName || "Devotee Member";
  const tierColors = getMembershipBadgeColors(user.membership?.tier);
  const userLocation = [user.city, user.state, "India"].filter(Boolean).join(", ");

  return (
    <div className="bg-[#F8F4EE] min-h-screen py-4 sm:py-8">
      <div className="page-container max-w-7xl mx-auto px-3 sm:px-6">
        {/* ============================================================ */}
        {/* MOBILE MENU BAR & TOP STRIP (Visible only on mobile/tablet < lg) */}
        {/* ============================================================ */}
        <div className="block lg:hidden mb-5 space-y-3">
          {/* Mobile Devotee Info & Quick Logout Strip */}
          <div className="bg-white rounded-2xl border border-[#E7D8C8] p-3.5 shadow-warm-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B] via-[#E86F1D] to-[#B45309] text-white flex items-center justify-center font-bold text-base shadow-2xs shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#1E1612] truncate capitalize leading-tight">
                  {user.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierColors.badge}`}
                  >
                    {userRole}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              title="Logout from portal"
              className="p-2 px-3 rounded-xl text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-[#E7D8C8] shrink-0 cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{hi ? "लॉगआउट" : "Logout"}</span>
            </button>
          </div>

          {/* Sticky Mobile Horizontal Tab Navigation */}
          <div className="sticky top-16 z-20 bg-[#F8F4EE]/95 backdrop-blur-md py-1">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth p-1.5 bg-white rounded-2xl border border-[#E7D8C8] shadow-warm-xs">
              {/* 1. Profile Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeTab === "profile"
                    ? "bg-[#E86F1D] text-white shadow-warm-xs"
                    : "text-[#2B201A] hover:bg-[#FAF3EA]"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{hi ? "प्रोफ़ाइल" : "Profile"}</span>
              </button>

              {/* 2. Membership Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("membership")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeTab === "membership"
                    ? "bg-[#E86F1D] text-white shadow-warm-xs"
                    : "text-[#2B201A] hover:bg-[#FAF3EA]"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{hi ? "सदस्यता" : "Membership"}</span>
                {user.membership?.tier && (
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === "membership"
                        ? "bg-white/25 text-white"
                        : tierColors.badge
                    }`}
                  >
                    {user.membership.tier}
                  </span>
                )}
              </button>

              {/* 3. Events Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeTab === "events"
                    ? "bg-[#E86F1D] text-white shadow-warm-xs"
                    : "text-[#2B201A] hover:bg-[#FAF3EA]"
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>{hi ? "कार्यक्रम पास" : "Events"}</span>
                {userEvents.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === "events"
                        ? "bg-white/25 text-white"
                        : "bg-[#FAF3EA] text-[#E86F1D] border border-[#E7D8C8]"
                    }`}
                  >
                    {userEvents.length}
                  </span>
                )}
              </button>

              {/* 4. Orders Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeTab === "orders"
                    ? "bg-[#E86F1D] text-white shadow-warm-xs"
                    : "text-[#2B201A] hover:bg-[#FAF3EA]"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{hi ? "आर्डर्स" : "Orders"}</span>
                {orders.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === "orders"
                        ? "bg-white/25 text-white"
                        : "bg-[#FAF3EA] text-[#E86F1D] border border-[#E7D8C8]"
                    }`}
                  >
                    {orders.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout (Sidebar + Content matching reference) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ============================================================ */}
          {/* LEFT SIDEBAR (Hidden on mobile, sticky on desktop) */}
          {/* ============================================================ */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 lg:sticky lg:top-[96px] self-start space-y-4">
            <div className="bg-white rounded-3xl border border-[#E7D8C8] p-5 lg:p-6 shadow-warm-xs flex flex-col space-y-5">
              {/* Trust Branding */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-[#E7D8C8]/80">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#B8893E]/40 shrink-0 bg-white shadow-2xs">
                  <Image
                    src="/images/logo.jpg"
                    alt="Trust Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="font-editorial font-bold text-lg text-[#1E1612] truncate leading-tight">
                    Namo Bhagwate
                  </h2>
                  <p className="text-[11px] font-sans text-[#E86F1D] font-bold uppercase tracking-wider">
                    Devotee Portal
                  </p>
                </div>
              </div>

              {/* Navigation Menu Links (Clean, streamlined) */}
              <nav className="flex flex-col gap-2" aria-label="Account navigation">
                {/* 1. My Profile */}
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer text-left ${
                    activeTab === "profile"
                      ? "bg-[#E86F1D] text-white shadow-warm-xs"
                      : "text-[#2B201A] hover:bg-[#FAF3EA] border border-transparent hover:border-[#E7D8C8]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === "profile"
                          ? "bg-white/20 text-white"
                          : "bg-[#FAF3EA] text-[#E86F1D] border border-[#E7D8C8]"
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm leading-tight truncate">
                      {hi ? "मेरी प्रोफ़ाइल" : "My Profile"}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 ml-2 ${
                      activeTab === "profile" ? "text-white" : "text-[#2B201A]/40"
                    }`}
                  />
                </button>

                {/* 2. Membership */}
                <button
                  type="button"
                  onClick={() => setActiveTab("membership")}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer text-left ${
                    activeTab === "membership"
                      ? "bg-[#E86F1D] text-white shadow-warm-xs"
                      : "text-[#2B201A] hover:bg-[#FAF3EA] border border-transparent hover:border-[#E7D8C8]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === "membership"
                          ? "bg-white/20 text-white"
                          : "bg-[#FAF3EA] text-[#E86F1D] border border-[#E7D8C8]"
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm leading-tight truncate">
                      {hi ? "ट्रस्ट सदस्यता" : "Membership"}
                    </span>
                  </div>
                  {user.membership?.tier ? (
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 ${
                        activeTab === "membership"
                          ? "bg-white/20 text-white"
                          : tierColors.badge
                      }`}
                    >
                      {user.membership.tier}
                    </span>
                  ) : (
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 ml-2 ${
                        activeTab === "membership" ? "text-white" : "text-[#2B201A]/40"
                      }`}
                    />
                  )}
                </button>

                {/* 3. Events & Passes */}
                <button
                  type="button"
                  onClick={() => setActiveTab("events")}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer text-left ${
                    activeTab === "events"
                      ? "bg-[#E86F1D] text-white shadow-warm-xs"
                      : "text-[#2B201A] hover:bg-[#FAF3EA] border border-transparent hover:border-[#E7D8C8]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === "events"
                          ? "bg-white/20 text-white"
                          : "bg-[#FAF3EA] text-[#E86F1D] border border-[#E7D8C8]"
                      }`}
                    >
                      <Ticket className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm leading-tight truncate">
                      {hi ? "कार्यक्रम एवं पास" : "My Events & Passes"}
                    </span>
                  </div>
                  {userEvents.length > 0 ? (
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ml-2 ${
                        activeTab === "events"
                          ? "bg-white/20 text-white"
                          : "bg-[#FAF3EA] text-[#E86F1D] border border-[#E7D8C8]"
                      }`}
                    >
                      {userEvents.length}
                    </span>
                  ) : (
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 ml-2 ${
                        activeTab === "events" ? "text-white" : "text-[#2B201A]/40"
                      }`}
                    />
                  )}
                </button>

                {/* 4. Orders */}
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer text-left ${
                    activeTab === "orders"
                      ? "bg-[#E86F1D] text-white shadow-warm-xs"
                      : "text-[#2B201A] hover:bg-[#FAF3EA] border border-transparent hover:border-[#E7D8C8]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === "orders"
                          ? "bg-white/20 text-white"
                          : "bg-[#FAF3EA] text-[#E86F1D] border border-[#E7D8C8]"
                      }`}
                    >
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm leading-tight truncate">
                      {hi ? "पुस्तक आर्डर्स" : "Store Orders"}
                    </span>
                  </div>
                  {orders.length > 0 ? (
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ml-2 ${
                        activeTab === "orders"
                          ? "bg-white/20 text-white"
                          : "bg-[#FAF3EA] text-[#E86F1D] border border-[#E7D8C8]"
                      }`}
                    >
                      {orders.length}
                    </span>
                  ) : (
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 ml-2 ${
                        activeTab === "orders" ? "text-white" : "text-[#2B201A]/40"
                      }`}
                    />
                  )}
                </button>
              </nav>

              {/* Bottom Mini User Card with Logout */}
              <div className="pt-2 border-t border-[#E7D8C8]/70">
                <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E7D8C8] flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#E86F1D] text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-2xs">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1E1612] truncate capitalize">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-[#1E1612]/60 truncate font-mono">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => logout()}
                    title="Logout from portal"
                    className="p-2.5 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* RIGHT MAIN CONTENT AREA */}
          {/* ============================================================ */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Profile Update Success Notification */}
            {profileSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{hi ? "विवरण सफलतापूर्वक सहेज लिए गए!" : "Profile details updated successfully!"}</span>
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 1: MY PROFILE (MATCHING REFERENCE CARDS 1, 2, 3) */}
            {/* ============================================================ */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                
                {/* CARD 1: PROFILE HEADER CARD (Avatar, Name, Role, Location) */}
                <div className="bg-white rounded-3xl border border-[#E7D8C8] p-5 sm:p-7 shadow-warm-xs flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#F59E0B] via-[#E86F1D] to-[#B45309] text-white flex items-center justify-center font-editorial font-bold text-3xl sm:text-4xl shadow-md border-4 border-white shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1612] truncate capitalize">
                        {user.name}
                      </h2>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-bold shadow-2xs ${tierColors.badge}`}>
                        <Award className={`w-3.5 h-3.5 ${tierColors.icon}`} />
                        <span>{userRole}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#2B201A]/60 font-medium">
                      {userRole} • ID: {user.id.slice(0, 12)}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-[#2B201A]/70 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E86F1D] shrink-0" />
                      <span className="truncate">{userLocation}</span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: PERSONAL INFORMATION CARD (Matching Reference Card 2) */}
                <div className="bg-white rounded-3xl border border-[#E7D8C8] p-5 sm:p-7 shadow-warm-xs space-y-5">
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#E7D8C8]/60">
                    <div>
                      <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#1E1612]">
                        {hi ? "व्यक्तिगत जानकारी" : "Personal Information"}
                      </h3>
                      <p className="text-xs text-[#2B201A]/60">
                        {hi ? "आपका नाम, संपर्क व सदस्यता विवरण" : "Your personal contact & member details"}
                      </p>
                    </div>

                    {!isEditingPersonal && (
                      <button
                        type="button"
                        onClick={() => setIsEditingPersonal(true)}
                        className="px-4 py-2 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{hi ? "बदलें" : "Edit"}</span>
                      </button>
                    )}
                  </div>

                  {isEditingPersonal ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-[#2B201A]/70 mb-1">
                            {hi ? "पूरा नाम" : "Full Name"} *
                          </label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7D8C8] bg-[#FAF6F0] text-sm font-medium focus:outline-none focus:border-[#E86F1D]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-[#2B201A]/70 mb-1">
                            {hi ? "मोबाइल नंबर" : "Phone Number"}
                          </label>
                          <input
                            type="tel"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7D8C8] bg-[#FAF6F0] text-sm font-medium focus:outline-none focus:border-[#E86F1D]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="px-5 py-2 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>{hi ? "सहेजें" : "Save Changes"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingPersonal(false)}
                          className="px-4 py-2 rounded-xl border border-[#E7D8C8] text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                        >
                          {hi ? "रद्द करें" : "Cancel"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Read-Only Grid (Matching reference layout) */
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider">
                          {hi ? "प्रथम नाम" : "First Name"}
                        </p>
                        <p className="font-bold text-[#1E1612] text-sm sm:text-base capitalize">
                          {firstName}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider">
                          {hi ? "अंतिम नाम" : "Last Name"}
                        </p>
                        <p className="font-bold text-[#1E1612] text-sm sm:text-base capitalize">
                          {lastName}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider">
                          {hi ? "सदस्यता तिथि" : "Member Since"}
                        </p>
                        <p className="font-bold text-[#1E1612] text-sm sm:text-base">
                          {formatShortDate(user.createdAt) || "—"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider">
                          {hi ? "ईमेल पता" : "Email Address"}
                        </p>
                        <p className="font-bold text-[#1E1612] text-xs sm:text-sm break-all font-mono">
                          {user.email}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider">
                          {hi ? "फ़ोन नंबर" : "Phone Number"}
                        </p>
                        <p className="font-bold text-[#1E1612] text-xs sm:text-sm">
                          {user.phone || "—"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider">
                          {hi ? "उपयोगकर्ता श्रेणी" : "User Role"}
                        </p>
                        <p className="font-bold text-[#E86F1D] text-xs sm:text-sm">
                          {userRole}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CARD 3: ADDRESS CARD (Matching Reference Card 3) */}
                <div className="bg-white rounded-3xl border border-[#E7D8C8] p-5 sm:p-7 shadow-warm-xs space-y-5">
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#E7D8C8]/60">
                    <div>
                      <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#1E1612]">
                        {hi ? "पता एवं स्थान" : "Address"}
                      </h3>
                      <p className="text-xs text-[#2B201A]/60">
                        {hi ? "पुस्तक डिलीवरी एवं संपर्क पता" : "Delivery address for books & prasad dispatch"}
                      </p>
                    </div>

                    {!isEditingAddress && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(true)}
                        className="px-4 py-2 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{hi ? "बदलें" : "Edit"}</span>
                      </button>
                    )}
                  </div>

                  {isEditingAddress ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#2B201A]/70 mb-1">
                          {hi ? "सड़क / मकान का पता" : "Full Street Address"}
                        </label>
                        <textarea
                          rows={2}
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="House / Flat No., Street, Landmark"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7D8C8] bg-[#FAF6F0] text-sm font-medium focus:outline-none focus:border-[#E86F1D]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-[#2B201A]/70 mb-1">
                            {hi ? "शहर" : "City"}
                          </label>
                          <input
                            type="text"
                            value={editCity}
                            onChange={(e) => setEditCity(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7D8C8] bg-[#FAF6F0] text-sm font-medium focus:outline-none focus:border-[#E86F1D]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-[#2B201A]/70 mb-1">
                            {hi ? "राज्य" : "State"}
                          </label>
                          <input
                            type="text"
                            value={editState}
                            onChange={(e) => setEditState(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7D8C8] bg-[#FAF6F0] text-sm font-medium focus:outline-none focus:border-[#E86F1D]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-[#2B201A]/70 mb-1">
                            {hi ? "पिनकोड" : "Postal Code / Pincode"}
                          </label>
                          <input
                            type="text"
                            value={editPincode}
                            onChange={(e) => setEditPincode(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7D8C8] bg-[#FAF6F0] text-sm font-medium focus:outline-none focus:border-[#E86F1D]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="px-5 py-2 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>{hi ? "सहेजें" : "Save Address"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(false)}
                          className="px-4 py-2 rounded-xl border border-[#E7D8C8] text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                        >
                          {hi ? "रद्द करें" : "Cancel"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Read-Only Grid */
                    <div className="space-y-4 text-xs sm:text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider">
                            {hi ? "देश" : "Country"}
                          </p>
                          <p className="font-bold text-[#1E1612] text-sm sm:text-base">
                            India
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider">
                            {hi ? "शहर एवं राज्य" : "City & State"}
                          </p>
                          <p className="font-bold text-[#1E1612] text-sm sm:text-base">
                            {[user.city, user.state].filter(Boolean).join(", ") || "—"}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider">
                            {hi ? "पिनकोड" : "Postal Code"}
                          </p>
                          <p className="font-bold text-[#1E1612] text-sm sm:text-base font-mono">
                            {user.pincode || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E7D8C8]/60 space-y-1">
                        <p className="text-[11px] font-bold text-[#8C6B3E] uppercase tracking-wider">
                          {hi ? "सड़क / मकान का पूरा पता" : "Street Address"}
                        </p>
                        <p className="font-medium text-[#1E1612] text-xs sm:text-sm leading-relaxed">
                          {user.address ? (
                            user.address
                          ) : (
                            <span className="text-[#2B201A]/50 italic">
                              {hi ? "कोई सड़क पता सहेजा नहीं गया है।" : "No street address saved yet."}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 2: MEMBERSHIP */}
            {/* ============================================================ */}
            {activeTab === "membership" && (
              <div className="space-y-6">
                {user.membership ? (
                  <div className="bg-white rounded-3xl border border-[#E7D8C8] shadow-warm-xs overflow-hidden">
                    {/* Header Banner */}
                    <div
                      className={`px-6 py-6 sm:px-8 sm:py-7 text-white flex items-center justify-between gap-3 ${getMembershipBannerGradient(
                        user.membership.tier
                      )}`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Award className="w-8 h-8 text-[#FBBF24] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-white/75 uppercase tracking-wider font-medium">
                            {hi ? "आपकी सदस्यता" : "Your membership"}
                          </p>
                          <h2 className="font-editorial text-xl sm:text-2xl font-bold truncate">
                            {hi && user.membership.tierNameHi
                              ? user.membership.tierNameHi
                              : user.membership.tierName?.toLowerCase() === "membership" ||
                                user.membership.tier === "BASIC"
                              ? "Basic Membership"
                              : user.membership.tierName}
                          </h2>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-emerald-800 text-xs font-bold shrink-0 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{hi ? "सक्रिय" : "Active"}</span>
                      </span>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                      {/* Details strip */}
                      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm bg-[#FAF6F0] p-4 rounded-2xl border border-[#E7D8C8]">
                        <div>
                          <dt className="text-[11px] uppercase font-bold text-[#8C6B3E]">
                            {hi ? "सदस्य" : "Member"}
                          </dt>
                          <dd className="font-bold text-[#1E1612] capitalize mt-0.5">
                            {user.name}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[11px] uppercase font-bold text-[#8C6B3E]">
                            {hi ? "सदस्यता तिथि" : "Member since"}
                          </dt>
                          <dd className="font-bold text-[#1E1612] mt-0.5">
                            {formatShortDate(user.membership.verifiedAt || user.createdAt) || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[11px] uppercase font-bold text-[#8C6B3E]">
                            {hi ? "संदर्भ ID" : "Reference ID"}
                          </dt>
                          <dd className="font-mono font-bold text-[#1E1612] mt-0.5 break-all">
                            {user.membership.donationId || "NBVT-VERIFIED"}
                          </dd>
                        </div>
                      </dl>

                      {/* Certificate & Pass Action Buttons */}
                      {user.membership.donationId && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <Link
                            href={`/certificate/${user.membership.donationId}${
                              user.membership.certificateKey
                                ? `?k=${user.membership.certificateKey}`
                                : ""
                            }`}
                            target="_blank"
                            className="btn-primary py-3 px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                          >
                            <Award className="w-4 h-4" />
                            <span>{hi ? "प्रमाणपत्र देखें" : "View Certificate"}</span>
                          </Link>
                          <Link
                            href={`/pass/${user.membership.donationId}${
                              user.membership.certificateKey
                                ? `?k=${user.membership.certificateKey}`
                                : ""
                            }`}
                            target="_blank"
                            className="btn-outline py-3 px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                          >
                            <QrCode className="w-4 h-4 text-[#E86F1D]" />
                            <span>{hi ? "डिजिटल पास देखें" : "View Digital Pass"}</span>
                          </Link>
                        </div>
                      )}

                      {/* Benefits list */}
                      <div className="pt-4 border-t border-[#E7D8C8]">
                        <h3 className="font-bold text-sm text-[#1E1612] mb-3">
                          {hi ? "आपके सदस्यता लाभ" : "Your benefits"}
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                          {(
                            user.membership.benefits || [
                              "Annual Trust Membership Certificate",
                              "Monthly Spiritual Newsletter & E-books",
                              "Invitation to Annual Spiritual Gathering",
                              "Direct Seva Participation Opportunities",
                              "Special Prasad & Blessing Card from Ashram",
                            ]
                          ).map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#2B201A]/80">
                              <CheckCircle2 className="w-4 h-4 text-[#2F5A43] shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-[#E7D8C8] p-8 sm:p-12 text-center space-y-5 shadow-warm-xs">
                    <div className="w-16 h-16 rounded-2xl bg-[#FFF9F2] text-[#E86F1D] mx-auto flex items-center justify-center border border-[#E7D8C8]">
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="space-y-2 max-w-md mx-auto">
                      <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A]">
                        {hi ? "ट्रस्ट की पावन सदस्यता प्राप्त करें" : "Become a Trust Member"}
                      </h3>
                      <p className="text-sm text-[#2B201A]/70 leading-relaxed">
                        {hi
                          ? "गुरुकुल शिक्षा, गौ सेवा, किसान कल्याण और आध्यात्मिक आयोजनों में ट्रस्ट के साथ जुड़कर पुण्य के भागी बनें।"
                          : "Join the Namo Bhagwate Vasudevaya Trust family. Support Gurukul education, Gau Seva, and community welfare programs."}
                      </p>
                    </div>
                    <Link
                      href="/membership"
                      className="btn-primary inline-flex items-center gap-2 text-sm py-3 px-8 shadow-warm-md"
                    >
                      <span>{hi ? "सदस्यता योजनाएं देखें (View Plans)" : "Explore Membership Plans"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 3: EVENTS & PASSES */}
            {/* ============================================================ */}
            {activeTab === "events" && (
              <div className="space-y-5">
                {/* Filter buttons */}
                <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3 rounded-2xl border border-[#E7D8C8] shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        { key: "all", label: hi ? "सभी पास" : "All Passes" },
                        { key: "upcoming", label: hi ? "आगामी" : "Upcoming" },
                        { key: "completed", label: hi ? "संपन्न" : "Completed" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setEventsFilter(tab.key)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          eventsFilter === tab.key
                            ? "bg-[#E86F1D] text-white shadow-2xs"
                            : "text-[#2B201A]/70 hover:bg-[#FAF3EA]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-[#2B201A]/60 font-medium">
                    {filteredEvents.length} {hi ? "पास उपलब्ध" : "passes found"}
                  </span>
                </div>

                {loadingEvents ? (
                  <div className="py-16 text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#E86F1D] mx-auto" />
                    <p className="text-xs text-[#2B201A]/60">
                      {hi ? "पास लोड हो रहे हैं..." : "Loading event passes..."}
                    </p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#E7D8C8] p-10 sm:p-14 text-center space-y-4 shadow-warm-xs">
                    <Ticket className="w-14 h-14 text-[#B8893E] mx-auto stroke-1" />
                    <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                      {hi ? "कोई कार्यक्रम पास नहीं मिला" : "No Event Passes Yet"}
                    </h3>
                    <p className="text-sm text-[#2B201A]/70 max-w-sm mx-auto leading-relaxed">
                      {hi
                        ? "आपने अभी तक किसी कार्यक्रम का पास प्राप्त नहीं किया है। आगामी सत्संग एवं कथा देखें।"
                        : "You haven't booked any event passes yet. Check out upcoming discourses and community gatherings."}
                    </p>
                    <Link
                      href="/events"
                      className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-6 shadow-warm-sm"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{hi ? "कार्यक्रम देखें (Explore Events)" : "Explore Events"}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredEvents.map((booking) => {
                      const passUrl = `/pass/${booking.donationId}${
                        booking.certificateKey ? `?k=${booking.certificateKey}` : ""
                      }`;
                      const pdfUrl = `/api/pass/${booking.donationId}${
                        booking.certificateKey ? `?k=${booking.certificateKey}` : ""
                      }`;
                      const detailsUrl = booking.event.slug ? `/events` : "/events";
                      const bookingStatus = getEventBookingStatus(booking.status, booking.isCompleted);
                      const StatusIcon = bookingStatus.icon;

                      return (
                        <div
                          key={booking.donationId}
                          className="bg-white rounded-3xl border border-[#E7D8C8] p-5 sm:p-6 shadow-warm-xs hover:border-[#E86F1D]/50 transition-all space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7D8C8]/60">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1.5 ${bookingStatus.color}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                <span>{bookingStatus.label}</span>
                              </span>
                              <span className="text-xs font-mono text-[#2B201A]/50">
                                Pass #{booking.donationId}
                              </span>
                            </div>

                            <span className="text-sm font-bold text-[#E86F1D]">
                              ₹{(booking.amountPaise / 100).toLocaleString("en-IN")} Seva
                            </span>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5 min-w-0">
                              <h4 className="font-editorial text-lg sm:text-xl font-bold text-[#1E1612]">
                                {booking.event.title}
                              </h4>
                              {booking.event.titleHi && (
                                <p className="text-xs text-[#2B201A]/70 font-medium">
                                  {booking.event.titleHi}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-[#2B201A]/70 flex-wrap pt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-[#E86F1D]" />
                                  <span>{formatEventDate(booking.event.startDate, booking.event.endDate)}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-[#E86F1D]" />
                                  <span className="truncate max-w-[200px]">{booking.event.location}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                              {booking.status === "VERIFIED" ? (
                                <>
                                  <Link
                                    href={passUrl}
                                    target="_blank"
                                    className="px-3.5 py-2 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                    <span>{hi ? "पास देखें" : "View Pass"}</span>
                                  </Link>
                                  <a
                                    href={pdfUrl}
                                    target="_blank"
                                    download
                                    className="px-3 py-2 rounded-xl border border-[#E7D8C8] bg-white hover:bg-[#FAF6F0] text-[#1E1612] text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5 text-[#E86F1D]" />
                                    <span>PDF</span>
                                  </a>
                                </>
                              ) : booking.status === "REJECTED" ? (
                                <span className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold inline-flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>{hi ? "पास अस्वीकृत" : "Pass Rejected"}</span>
                                </span>
                              ) : booking.status === "CANCELLED" ? (
                                <span className="px-3 py-2 rounded-xl bg-stone-100 text-stone-600 border border-stone-300 text-xs font-bold inline-flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5 text-stone-500" />
                                  <span>{hi ? "पास रद्द" : "Pass Cancelled"}</span>
                                </span>
                              ) : (
                                <span className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold inline-flex items-center gap-1.5" title="Admin will verify the transaction reference">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                  <span>{hi ? "सत्यापन प्रक्रियाधीन" : "Verification Pending"}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 4: STORE ORDERS */}
            {/* ============================================================ */}
            {activeTab === "orders" && (
              <div className="space-y-5">
                {loadingOrders ? (
                  <div className="py-16 text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#E86F1D] mx-auto" />
                    <p className="text-xs text-[#2B201A]/60">
                      {hi ? "आर्डर्स लोड हो रहे हैं..." : "Loading orders..."}
                    </p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#E7D8C8] p-10 sm:p-14 text-center space-y-4 shadow-warm-xs">
                    <Package className="w-14 h-14 text-[#B8893E] mx-auto stroke-1" />
                    <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                      {hi ? "कोई पुस्तक ऑर्डर नहीं मिला" : "No Orders Yet"}
                    </h3>
                    <p className="text-sm text-[#2B201A]/70 max-w-sm mx-auto leading-relaxed">
                      {hi
                        ? "आपने अभी तक कोई पुस्तक ऑर्डर नहीं की है। ट्रस्ट के आध्यात्मिक एवं कृषि साहित्य को देखें।"
                        : "You haven't ordered any publications yet. Explore our value-led books and agricultural guides."}
                    </p>
                    <Link
                      href="/books"
                      className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-6 shadow-warm-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{hi ? "पुस्तकें देखें (Explore Books)" : "Explore Publications"}</span>
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => {
                    const badge = getStatusBadge(order.status);
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-3xl border border-[#E7D8C8] p-5 sm:p-6 shadow-warm-xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7D8C8]/60">
                          <div>
                            <span className="font-mono font-bold text-sm text-[#1E1612]">
                              Order #{order.orderNumber}
                            </span>
                            <span className="text-xs text-[#2B201A]/60 ml-2 font-medium">
                              {formatShortDate(order.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[#E86F1D]">
                              ₹{order.totalAmount.toLocaleString("en-IN")}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                              <button
                                type="button"
                                onClick={() => setTrackingOrder(order)}
                                className="px-3 py-1 rounded-xl bg-[#FAF3EA] hover:bg-[#E86F1D] text-[#E86F1D] hover:text-white border border-[#E86F1D]/30 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0 ml-1"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>{hi ? "ट्रैक करें" : "Track"}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Order items */}
                        <div className="divide-y divide-[#E7D8C8]/50">
                          {order.items.map((item) => {
                            const bookImage = item.image || "/images/sugarcane-guide-book.webp";
                            return (
                              <div
                                key={item.id}
                                className="py-3 flex items-center justify-between gap-3 sm:gap-4"
                              >
                                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                                  <div className="relative w-12 h-14 sm:w-14 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-[#E7D8C8] bg-[#FAF3EA] shadow-2xs">
                                    <Image
                                      src={bookImage}
                                      alt={item.title}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 640px) 48px, 56px"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-xs sm:text-sm text-[#1E1612] leading-snug line-clamp-2">
                                      {item.title}
                                    </h4>
                                    <span className="text-[11px] text-[#2B201A]/60 font-medium">
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-mono text-xs sm:text-sm font-semibold text-[#1E1612]">
                                    {item.quantity} × ₹{item.price}
                                  </span>
                                  <p className="text-xs font-bold text-[#E86F1D]">
                                    ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Live Dispatch Tracking Status Banner (for undelivered active orders) */}
                        {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                          <div className="bg-[#FAF3EA]/80 rounded-2xl border border-[#E86F1D]/25 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2.5 text-xs text-[#2B201A]">
                              <div className="w-7 h-7 rounded-lg bg-[#E86F1D]/15 text-[#E86F1D] flex items-center justify-center shrink-0">
                                <Truck className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-[#1E1612] block sm:inline mr-1">
                                  {order.status === "SHIPPED"
                                    ? (hi ? "पारगमन में (In Transit)" : "In Transit via Courier")
                                    : (hi ? "प्रेषण प्रक्रियाधीन" : "Dispatch in Progress")}
                                </span>
                                <span className="text-[#2B201A]/70 text-[11px]">
                                  • {hi ? "अनुमानित 3-7 कार्य दिवस" : "Est. delivery within 3-7 business days"}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setTrackingOrder(order)}
                              className="px-3 py-1.5 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>{hi ? "लाइव स्थिति ट्रैक करें" : "Track Order"}</span>
                            </button>
                          </div>
                        )}

                        {/* Shipping destination */}
                        <div className="pt-2 text-xs text-[#2B201A]/60 flex items-center gap-1.5 border-t border-[#E7D8C8]/50">
                          <MapPin className="w-3.5 h-3.5 text-[#E86F1D] shrink-0" />
                          <span className="truncate">
                            Shipping to: {order.shippingAddress}, {order.shippingCity},{" "}
                            {order.shippingState} - {order.shippingPincode}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ORDER TRACKING MODAL */}
      {/* ============================================================ */}
      {trackingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setTrackingOrder(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#E7D8C8] shadow-2xl max-w-lg w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E7D8C8]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#FAF3EA] text-[#E86F1D] flex items-center justify-center border border-[#E86F1D]/20">
                    <Truck className="w-4 h-4" />
                  </span>
                  <h3 className="font-editorial text-xl font-bold text-[#1E1612]">
                    {hi ? "ऑर्डर ट्रैकिंग विवरण" : "Track Order Shipment"}
                  </h3>
                </div>
                <p className="text-xs font-mono text-[#2B201A]/60 mt-1">
                  Order #{trackingOrder.orderNumber} • {formatShortDate(trackingOrder.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Courier & Docket info pill */}
            <div className="bg-[#FAF3EA] rounded-2xl p-4 border border-[#E86F1D]/20 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[#2B201A]/70 font-medium">
                  {hi ? "कूरियर / सेवा पार्टनर:" : "Courier / Delivery Partner:"}
                </span>
                <span className="font-bold text-[#1E1612]">India Post Speed Post / Ashram Logistics</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[#2B201A]/70 font-medium">
                  {hi ? "ट्रैकिंग डॉकेट संख्या:" : "Docket / AWB No:"}
                </span>
                <span className="font-mono font-bold text-[#E86F1D]">
                  NBV-TRK-{trackingOrder.orderNumber.replace(/[^a-zA-Z0-9]/g, "").slice(-8)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[#2B201A]/70 font-medium">
                  {hi ? "वर्तमान स्थिति:" : "Current Status:"}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    getStatusBadge(trackingOrder.status).color
                  }`}
                >
                  {getStatusBadge(trackingOrder.status).label}
                </span>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2B201A]/60">
                {hi ? "प्रेषण प्रगति (Shipment Milestones)" : "Shipment Milestones"}
              </h4>
              <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E7D8C8]">
                {getTrackingTimeline(trackingOrder).map((item) => (
                  <div key={item.step} className="relative flex items-center justify-between gap-3 min-h-[28px]">
                    <div
                      className={`absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                        item.done
                          ? "bg-[#2F5A43] text-white"
                          : item.active
                          ? "bg-[#E86F1D] text-white animate-pulse"
                          : "bg-[#E7D8C8] text-[#2B201A]/50"
                      }`}
                    >
                      {item.done ? <Check className="w-3 h-3 stroke-[3]" /> : item.step}
                    </div>
                    <h5
                      className={`text-xs sm:text-sm font-bold ${
                        item.done || item.active ? "text-[#1E1612]" : "text-[#2B201A]/40"
                      }`}
                    >
                      {item.title}
                    </h5>
                    {item.date ? (
                      <span className="text-[11px] font-mono text-[#2B201A]/60 shrink-0">
                        {item.date}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Address */}
            <div className="pt-3 border-t border-[#E7D8C8] text-xs text-[#2B201A]/80 space-y-1">
              <span className="font-bold text-[#1E1612] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E86F1D]" />
                <span>{hi ? "डिलीवरी गंतव्य (Shipping Address):" : "Delivery Destination:"}</span>
              </span>
              <p className="pl-5 text-[#2B201A]/70">
                {trackingOrder.shippingName} ({trackingOrder.shippingPhone})<br />
                {trackingOrder.shippingAddress}, {trackingOrder.shippingCity},{" "}
                {trackingOrder.shippingState} - {trackingOrder.shippingPincode}
              </p>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="btn-primary text-xs py-2 px-5 cursor-pointer shadow-warm-xs"
              >
                {hi ? "बंद करें" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
