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
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import HeadingDivider from "@/components/HeadingDivider";

interface OrderItem {
  id: string;
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
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
  const [activeTab, setActiveTab] = useState<"orders" | "membership" | "profile">("membership");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
      setEditAddress(user.address || "");
      setEditCity(user.city || "");
      setEditState(user.state || "");
      setEditPincode(user.pincode || "");
    }
  }, [user, fetchOrders]);

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
        setIsEditing(false);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setSavingProfile(false);
    }
  };

  const hi = lang === "hi";

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
          color: "bg-[#E86F1D]/10 text-[#E86F1D] border-[#E86F1D]/30",
        };
      case "DELIVERED":
        return {
          label: hi ? "वितरित (Delivered)" : "Delivered",
          color: "bg-[#2F5A43]/10 text-[#2F5A43] border-[#2F5A43]/30",
        };
      case "CANCELLED":
        return {
          label: hi ? "रद्द (Cancelled)" : "Cancelled",
          color: "bg-red-50 text-red-700 border-red-200",
        };
      default:
        return { label: status, color: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FFF9F2]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E86F1D] mx-auto" />
          <p className="text-sm font-semibold text-[#2B201A]/70">
            {hi ? "भक्त विवरण लोड हो रहा है..." : "Loading account details..."}
          </p>
        </div>
      </div>
    );
  }

  // Guest State - Prompt to Login
  if (!user) {
    return (
      <div className="bg-[#FFF9F2] min-h-[75vh] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7D8C8] shadow-warm-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FBF2E7] text-[#E86F1D] mx-auto flex items-center justify-center border border-[#E7D8C8]">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-editorial text-3xl font-bold text-[#E86F1D]">
              {hi ? "भक्त खाता एवं आर्डर विवरण" : "Devotee Account & Orders"}
            </h1>
            <HeadingDivider className="my-1.5" />
            <p className="text-sm text-[#2B201A]/70 leading-relaxed">
              {hi
                ? "अपनी खरीदी गई पुस्तकों के ऑर्डर और विवरण देखने के लिए कृपया अपने खाते में लॉग इन करें।"
                : "Sign in to view your purchased publications, order status, and delivery addresses."}
            </p>
          </div>
          <button
            onClick={() => openAuthModal()}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm shadow-warm-md"
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

  return (
    <div className="bg-[#FFF9F2] min-h-screen py-6 sm:py-14">
      <div className="page-container max-w-5xl mx-auto space-y-6 sm:space-y-8 px-3 sm:px-6">
        {/* Profile Banner Card */}
        <div className="bg-[#2B201A] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 border-[#B8893E] shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#FFFDF8] text-[#2B201A] flex items-center justify-center font-editorial font-bold text-xl sm:text-2xl border-2 border-[#B8893E] shadow-md shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#B8893E]">
                    {hi ? "पंजीकृत भक्त" : "Verified Devotee Account"}
                  </span>
                  {user.membership && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E86F1D] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      <Award className="w-3 h-3" />
                      <span>{hi ? user.membership.tierNameHi : user.membership.tierName}</span>
                    </span>
                  )}
                </div>
                <h1 className="font-editorial text-xl sm:text-3xl font-bold tracking-tight truncate">
                  {user.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#E7D8C8]">
                  <span className="flex items-center gap-1 min-w-0 max-w-full">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{user.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#E7D8C8] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/10 w-full sm:w-auto self-stretch sm:self-center"
            >
              <LogOut className="w-4 h-4" />
              <span>{hi ? "लॉग आउट" : "Logout"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 sm:gap-2 border-b border-[#E7D8C8] pb-1.5 -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors ${
              activeTab === "orders"
                ? "bg-[#E86F1D] text-white shadow-warm-sm"
                : "text-[#2B201A]/70 hover:text-[#2B201A] hover:bg-[#FBF2E7]"
            }`}
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{hi ? "मेरे आर्डर्स" : "My Orders"}</span>
            {orders.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-white/25">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("membership")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors ${
              activeTab === "membership"
                ? "bg-[#E86F1D] text-white shadow-warm-sm"
                : "text-[#2B201A]/70 hover:text-[#2B201A] hover:bg-[#FBF2E7]"
            }`}
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{hi ? "मेरी सदस्यता" : "My Membership"}</span>
            {user.membership && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-white/25 font-bold">
                {user.membership.tier}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors ${
              activeTab === "profile"
                ? "bg-[#E86F1D] text-white shadow-warm-sm"
                : "text-[#2B201A]/70 hover:text-[#2B201A] hover:bg-[#FBF2E7]"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{hi ? "प्रोफ़ाइल एवं पता" : "Profile & Address"}</span>
          </button>
        </div>

        {/* TAB: MEMBERSHIP */}
        {activeTab === "membership" && (
          <div className="space-y-6">
            {user.membership ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E7D8C8] shadow-warm-md overflow-hidden">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#F97316] via-[#E86F1D] to-[#C2410C] p-4 sm:p-8 text-white relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1">
                      <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider">
                        {hi ? "सक्रिय ट्रस्ट सदस्यता" : "Official Trust Membership"}
                      </span>
                      <h2 className="font-editorial text-2xl sm:text-4xl font-bold tracking-tight">
                        {hi && user.membership.tierNameHi ? user.membership.tierNameHi : user.membership.tierName}
                      </h2>
                      <p className="text-white/85 text-xs sm:text-sm font-medium">
                        Namo Bhagwate Vasudevaya Trust • Devotee Member Roll
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-xl bg-white text-[#2B201A] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{hi ? "सक्रिय (Active)" : "Active Status"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
                  {/* Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#FFF9F2] border border-[#E7D8C8]">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/60">
                        {hi ? "सदस्य का नाम" : "Member Name"}
                      </p>
                      <p className="font-bold text-[#2B201A] text-sm mt-0.5">{user.name}</p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/60">
                        {hi ? "सदस्यता श्रेणी" : "Membership Plan"}
                      </p>
                      <p className="font-bold text-[#E86F1D] text-sm mt-0.5">
                        {user.membership.tierName}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/60">
                        {hi ? "सदस्यता संदर्भ / ID" : "Donation / Reference ID"}
                      </p>
                      <p className="font-mono font-bold text-[#2B201A] text-sm mt-0.5">
                        {user.membership.donationId || "NBVT-VERIFIED"}
                      </p>
                    </div>
                  </div>

                  {/* Certificate & Digital Pass Links */}
                  {user.membership.donationId && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
                      <Link
                        href={`/certificate/${user.membership.donationId}${user.membership.certificateKey ? `?k=${user.membership.certificateKey}` : ""}`}
                        target="_blank"
                        className="btn-primary py-3 px-6 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-warm-md w-full sm:w-auto text-center"
                      >
                        <Award className="w-4 h-4" />
                        <span>{hi ? "ट्रस्ट सदस्यता प्रमाणपत्र देखें" : "View Membership Certificate"}</span>
                      </Link>

                      <Link
                        href={`/pass/${user.membership.donationId}${user.membership.certificateKey ? `?k=${user.membership.certificateKey}` : ""}`}
                        target="_blank"
                        className="btn-outline py-3 px-6 text-xs sm:text-sm flex items-center justify-center gap-2 w-full sm:w-auto text-center"
                      >
                        <QrCode className="w-4 h-4 text-[#E86F1D]" />
                        <span>{hi ? "डिजिटल भक्त पास देखें" : "View Devotee Digital Pass"}</span>
                      </Link>
                    </div>
                  )}

                  {/* Benefits */}
                  <div className="space-y-3 pt-4 border-t border-[#E7D8C8]">
                    <h3 className="font-editorial text-lg font-bold text-[#2B201A]">
                      {hi ? "सदस्यता के अंतर्गत प्राप्त पावन सेवा लाभ" : "Included Membership Seva Privileges"}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(user.membership.benefits || [
                        "Annual Trust Membership Certificate",
                        "Monthly Spiritual Newsletter & E-books",
                        "Invitation to Annual Spiritual Gathering",
                        "Direct Seva Participation Opportunities",
                        "Special Prasad & Blessing Card from Ashram",
                      ]).map((b, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-[#2B201A]/85">
                          <CheckCircle2 className="w-4 h-4 text-[#2F5A43] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#E7D8C8] p-8 sm:p-12 text-center space-y-5 shadow-sm">
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

        {/* TAB 1: ORDERS LIST */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#E86F1D] mx-auto" />
                <p className="text-xs text-[#2B201A]/60">
                  {hi ? "आर्डर्स लोड हो रहे हैं..." : "Loading orders..."}
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7D8C8] p-10 sm:p-14 text-center space-y-4 shadow-sm">
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
                const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-[#E7D8C8] shadow-sm overflow-hidden divide-y divide-[#E7D8C8]"
                  >
                    {/* Order Header */}
                    <div className="p-4 sm:p-6 bg-[#FBF2E7]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#2B201A]">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                          >
                            {badge.label}
                          </span>

                          {/* Payment Method Tag */}
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-[#FAF6F0] text-[#6B5B4E] border-[#E7D8C8] inline-flex items-center gap-1">
                            {order.paymentMethod === "COD" ? (
                              <>
                                <Banknote className="w-3 h-3 text-[#2F5A43]" />
                                <span>{hi ? "कैश ऑन डिलीवरी" : "Cash on Delivery"}</span>
                              </>
                            ) : (
                              <>
                                <QrCode className="w-3 h-3 text-[#E86F1D]" />
                                <span>{hi ? "प्रीपेड UPI" : "Prepaid UPI"}</span>
                              </>
                            )}
                          </span>

                          {/* Payment Status Badge */}
                          {order.refundStatus === "COMPLETED" ? (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-300 inline-flex items-center gap-1">
                              <RotateCcw className="w-3 h-3 text-emerald-600" />
                              <span>{hi ? "रिफंड हो गया (Refunded)" : "Refunded"}</span>
                            </span>
                          ) : order.refundStatus === "PENDING" ? (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-900 border-amber-300 inline-flex items-center gap-1">
                              <RotateCcw className="w-3 h-3 text-amber-700" />
                              <span>{hi ? "रिफंड प्रक्रिया में (Refund in progress)" : "Refund in progress"}</span>
                            </span>
                          ) : order.status === "CANCELLED" && order.paymentStatus !== "PAID" ? (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-[#FAF6F0] text-[#6B5B4E] border-[#E7D8C8]">
                              <span>{hi ? "कोई भुगतान देय नहीं (No payment due)" : "No payment due"}</span>
                            </span>
                          ) : order.paymentStatus === "PAID" ? (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-300 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{hi ? "भुगतान स्वीकृत (Paid)" : "Payment Verified (Paid)"}</span>
                            </span>
                          ) : order.paymentStatus === "FAILED" ? (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                              <span>{hi ? "✗ भुगतान अस्वीकृत (Failed)" : "✗ Payment Failed"}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-900 border-amber-300 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-700 animate-pulse" />
                              <span>
                                {order.paymentMethod === "COD"
                                  ? hi ? "डिलीवरी पर देय (Pending)" : "Pending on Delivery"
                                  : hi ? "भुगतान लंबित (Approval Pending)" : "Payment Pending Approval"}
                              </span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#2B201A]/60 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{orderDate}</span>
                          <span>•</span>
                          <span>{order.items.length} {order.items.length === 1 ? "Item" : "Items"}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:block sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E7D8C8]/60">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/60">
                          {hi ? "कुल राशि" : "Total Amount"}
                        </p>
                        <p className="font-editorial text-xl font-bold text-[#E86F1D]">
                          ₹{order.totalAmount.toFixed(2)} INR
                        </p>
                      </div>
                    </div>

                    {/* Refund notice for cancelled orders paid online */}
                    {order.refundStatus === "PENDING" && (
                      <div className="mx-4 sm:mx-6 my-3 p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                        <RotateCcw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold">
                            {hi
                              ? `₹${order.totalAmount.toFixed(2)} का रिफंड प्रक्रिया में है`
                              : `Refund of ₹${order.totalAmount.toFixed(2)} in progress`}
                          </p>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            {hi
                              ? "यह ऑर्डर रद्द कर दिया गया है। राशि उसी UPI खाते में वापस भेजी जाएगी जिससे आपने भुगतान किया था। रिफंड भेजे जाने पर आपको ईमेल मिलेगा और यहाँ स्थिति अपडेट होगी।"
                              : "This order was cancelled. The amount will be sent back to the UPI account you paid from. You'll get an email and this page will update once the refund is sent."}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.refundStatus === "COMPLETED" && (
                      <div className="mx-4 sm:mx-6 my-3 p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold">
                            {hi
                              ? `₹${order.totalAmount.toFixed(2)} का रिफंड भेज दिया गया`
                              : `Refund of ₹${order.totalAmount.toFixed(2)} sent`}
                          </p>
                          <p className="text-[11px] text-emerald-800 leading-relaxed">
                            {hi ? "आपके UPI खाते में भेजा गया" : "Sent to the UPI account you paid from"}
                            {order.refundedAt &&
                              ` ${hi ? "दिनांक" : "on"} ${new Date(order.refundedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}`}
                            .
                            {order.refundReference && (
                              <>
                                {" "}
                                {hi ? "UPI संदर्भ:" : "UPI reference:"}{" "}
                                <span className="font-mono font-bold">{order.refundReference}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Notice when UPI Payment is pending admin approval */}
                    {order.status !== "CANCELLED" && order.paymentStatus === "PENDING" && order.paymentMethod === "PREPAID" && (
                      <div className="mx-4 sm:mx-6 my-3 p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-0.5">
                          <p className="font-bold">
                            {hi ? "UPI भुगतान सत्यापन लंबित (Pending Admin Verification)" : "UPI Payment Pending Admin Approval"}
                          </p>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            {hi
                              ? "आपका भुगतान अनुरोध दर्ज हो चुका है। ट्रस्ट एडमिन द्वारा बैंक खाते से पुष्टि (Approve) होते ही यहाँ 'Paid' शो होगा।"
                              : "Your payment has been submitted. Once approved by the Trust admin, this order will update to Paid."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Order Items List */}
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-[#E7D8C8] bg-[#FBF2E7] shrink-0">
                            <Image
                              src={item.image || "/images/sugarcane-guide-book.webp"}
                              alt={item.title}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-[#2B201A] truncate">{item.title}</h4>
                            <p className="text-xs text-[#2B201A]/70 mt-0.5">
                              Quantity: <strong className="text-[#2B201A]">{item.quantity}</strong> × ₹{item.price.toFixed(2)}
                            </p>
                          </div>
                          <span className="font-bold text-sm text-[#2B201A]">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address Footer */}
                    <div className="p-4 sm:p-6 bg-[#FFFDF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-[#6B5B4E] uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#E86F1D]" />
                          <span>{hi ? "डिलीवरी का पता" : "Shipping Address"}</span>
                        </p>
                        <p className="text-[#2B201A] font-medium leading-relaxed">
                          <strong>{order.shippingName}</strong> ({order.shippingPhone})<br />
                          {order.shippingAddress}, {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                        </p>
                      </div>

                      {order.status === "CANCELLED" ? (
                        <div className="flex items-center gap-2 text-red-700 font-bold bg-red-50 px-3.5 py-2 rounded-xl self-start sm:self-center">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>{hi ? "ऑर्डर रद्द — भेजा नहीं जाएगा" : "Order cancelled — will not be shipped"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#2F5A43] font-bold bg-[#2F5A43]/10 px-3.5 py-2 rounded-xl self-start sm:self-center">
                          <Truck className="w-4 h-4 shrink-0" />
                          <span>{hi ? "स्पीड पोस्ट / कूरियर द्वारा प्रेषित" : "Pan-India Courier Dispatch"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: PROFILE & ADDRESS */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E7D8C8] p-4 sm:p-10 shadow-sm space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E7D8C8] pb-4">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                  {hi ? "व्यक्तिगत विवरण एवं पता" : "Personal Details & Shipping Address"}
                </h3>
                <p className="text-xs text-[#2B201A]/70 mt-0.5">
                  {hi ? "यह पता भविष्य के सभी पुस्तक आर्डर्स पर स्वतः भर जाएगा।" : "Saved for fast checkout on your future book purchases."}
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E7D8C8] text-xs font-bold text-[#E86F1D] hover:bg-[#FBF2E7] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{hi ? "बदलें" : "Edit Details"}</span>
                </button>
              )}
            </div>

            {profileSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{hi ? "विवरण सफलतापूर्वक सहेज लिए गए!" : "Profile details saved successfully!"}</span>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                      {hi ? "पूरा नाम" : "Full Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E7D8C8] rounded-xl text-sm focus:outline-hidden focus:border-[#E86F1D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                      {hi ? "मोबाइल नंबर" : "Phone Number"}
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E7D8C8] rounded-xl text-sm focus:outline-hidden focus:border-[#E86F1D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                    {hi ? "सड़क / मकान का पता" : "Street Address / House No."}
                  </label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7D8C8] rounded-xl text-sm focus:outline-hidden focus:border-[#E86F1D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                      {hi ? "शहर" : "City"}
                    </label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E7D8C8] rounded-xl text-sm focus:outline-hidden focus:border-[#E86F1D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                      {hi ? "राज्य" : "State"}
                    </label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E7D8C8] rounded-xl text-sm focus:outline-hidden focus:border-[#E86F1D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1">
                      {hi ? "पिनकोड" : "Pincode"}
                    </label>
                    <input
                      type="text"
                      value={editPincode}
                      onChange={(e) => setEditPincode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E7D8C8] rounded-xl text-sm focus:outline-hidden focus:border-[#E86F1D]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-primary text-xs py-2.5 px-6 inline-flex items-center gap-2 shadow-warm-sm"
                  >
                    {savingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{hi ? "सहेजें" : "Save Changes"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 border border-[#E7D8C8] text-xs font-bold rounded-xl text-[#2B201A]/70 hover:bg-[#FBF2E7]"
                  >
                    {hi ? "रद्द करें" : "Cancel"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="space-y-1 bg-[#FBF2E7] p-4 rounded-2xl border border-[#E7D8C8]">
                  <p className="text-[11px] font-bold text-[#6B5B4E] uppercase tracking-wider">
                    {hi ? "ईमेल आईडी" : "Registered Email"}
                  </p>
                  <p className="font-bold text-[#2B201A]">{user.email}</p>
                </div>

                <div className="space-y-1 bg-[#FBF2E7] p-4 rounded-2xl border border-[#E7D8C8]">
                  <p className="text-[11px] font-bold text-[#6B5B4E] uppercase tracking-wider">
                    {hi ? "मोबाइल नंबर" : "Phone Number"}
                  </p>
                  <p className="font-bold text-[#2B201A]">{user.phone || "Not set"}</p>
                </div>

                <div className="sm:col-span-2 space-y-1 bg-[#FBF2E7] p-4 rounded-2xl border border-[#E7D8C8]">
                  <p className="text-[11px] font-bold text-[#6B5B4E] uppercase tracking-wider">
                    {hi ? "डिफ़ॉल्ट डिलीवरी पता" : "Default Delivery Address"}
                  </p>
                  <p className="font-bold text-[#2B201A] leading-relaxed">
                    {user.address ? (
                      `${user.address}, ${user.city || ""}, ${user.state || ""} - ${user.pincode || ""}`
                    ) : (
                      <span className="text-[#2B201A]/60 italic font-normal">
                        {hi ? "कोई पता सहेजा नहीं गया है।" : "No delivery address saved yet."}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
