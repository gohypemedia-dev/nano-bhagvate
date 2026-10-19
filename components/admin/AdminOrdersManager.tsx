"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Package,
  CheckCircle2,
  Clock,
  QrCode,
  Banknote,
  Search,
  Truck,
  MapPin,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

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
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  paymentMethod: "PREPAID" | "COD";
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  createdAt: string;
  items: OrderItem[];
  user?: {
    name: string;
    email: string;
    phone?: string | null;
  } | null;
}

interface Props {
  initialOrders: Order[];
}

export default function AdminOrdersManager({ initialOrders }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<"ALL" | "PENDING_PAYMENT" | "PAID" | "COD">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: "PAID" | "PENDING") => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update payment status.");
      }

      const data = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
      );

      toast.success(
        newPaymentStatus === "PAID"
          ? `Order ${data.order.orderNumber} payment approved and marked as PAID!`
          : `Order ${data.order.orderNumber} payment set to PENDING.`
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error updating payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status.");
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      toast.success(`Order delivery status updated to ${newStatus}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error updating delivery status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    // Filter tab
    if (filter === "PENDING_PAYMENT" && (o.paymentStatus !== "PENDING" || o.paymentMethod !== "PREPAID")) {
      return false;
    }
    if (filter === "PAID" && o.paymentStatus !== "PAID") {
      return false;
    }
    if (filter === "COD" && o.paymentMethod !== "COD") {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.shippingName.toLowerCase().includes(q);
      const matchPhone = o.shippingPhone.toLowerCase().includes(q);
      const matchEmail = o.shippingEmail.toLowerCase().includes(q);
      return matchNumber || matchName || matchPhone || matchEmail;
    }

    return true;
  });

  const pendingApprovalsCount = orders.filter(
    (o) => o.paymentMethod === "PREPAID" && o.paymentStatus === "PENDING"
  ).length;

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A]">
            Publication &amp; Book Orders
          </h1>
          <p className="text-xs text-[#2B201A]/70 mt-1">
            Manage book orders, approve customer UPI payments, and track shipments.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E7D8C8] shadow-xs">
          <p className="text-xs font-bold text-[#2B201A]/60 uppercase tracking-wider">Total Orders</p>
          <p className="font-editorial text-2xl font-bold text-[#2B201A] mt-1">{orders.length}</p>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs ${
          pendingApprovalsCount > 0
            ? "bg-amber-50/70 border-amber-300 text-amber-900"
            : "bg-white border-[#E7D8C8]"
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">UPI Approvals Pending</p>
            {pendingApprovalsCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className="font-editorial text-2xl font-bold mt-1 text-[#E86F1D]">
            {pendingApprovalsCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7D8C8] shadow-xs">
          <p className="text-xs font-bold text-[#2B201A]/60 uppercase tracking-wider">Verified Revenue</p>
          <p className="font-editorial text-2xl font-bold text-[#2F5A43] mt-1">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7D8C8] shadow-xs">
          <p className="text-xs font-bold text-[#2B201A]/60 uppercase tracking-wider">Cash on Delivery</p>
          <p className="font-editorial text-2xl font-bold text-[#2B201A] mt-1">
            {orders.filter((o) => o.paymentMethod === "COD").length}
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E7D8C8] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === "ALL"
                ? "bg-[#2B201A] text-white shadow-xs"
                : "bg-[#FBF2E7] text-[#2B201A]/80 hover:bg-[#E7D8C8]"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilter("PENDING_PAYMENT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === "PENDING_PAYMENT"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending UPI ({pendingApprovalsCount})</span>
          </button>
          <button
            onClick={() => setFilter("PAID")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === "PAID"
                ? "bg-[#2F5A43] text-white shadow-xs"
                : "bg-[#2F5A43]/10 text-[#2F5A43] hover:bg-[#2F5A43]/20"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paid ({orders.filter((o) => o.paymentStatus === "PAID").length})</span>
          </button>
          <button
            onClick={() => setFilter("COD")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === "COD"
                ? "bg-[#B8893E] text-white shadow-xs"
                : "bg-[#B8893E]/10 text-[#B8893E] hover:bg-[#B8893E]/20"
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>COD ({orders.filter((o) => o.paymentMethod === "COD").length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#2B201A]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF6F0] border border-[#E7D8C8] rounded-xl text-xs focus:outline-hidden focus:border-[#E86F1D]"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E7D8C8] p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-[#B8893E] mx-auto opacity-60" />
          <h3 className="font-editorial text-lg font-bold text-[#2B201A]">No orders found</h3>
          <p className="text-xs text-[#2B201A]/60">
            {searchQuery
              ? "No orders matched your search query."
              : "No orders match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingId === order.id;
            const dateStr = new Date(order.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#E7D8C8] shadow-xs overflow-hidden divide-y divide-[#E7D8C8]"
              >
                {/* Header Row */}
                <div className="p-4 bg-[#FBF2E7]/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-[#2B201A]">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-[#2B201A]/60">• {dateStr}</span>

                    {/* Payment Method Badge */}
                    {order.paymentMethod === "PREPAID" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        <QrCode className="w-3 h-3" />
                        <span>Prepaid UPI</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        <Banknote className="w-3 h-3" />
                        <span>Cash on Delivery</span>
                      </span>
                    )}

                    {/* Payment Status Badge */}
                    {order.paymentStatus === "PAID" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Payment Verified (PAID)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                        <Clock className="w-3 h-3" />
                        <span>Pending Approval</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-editorial text-lg font-bold text-[#E86F1D]">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Content Body: Items & Customer Details */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Items */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/60 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-[#E86F1D]" />
                      <span>Items Ordered ({order.items.length})</span>
                    </p>
                    <div className="space-y-1.5 bg-[#FAF6F0] p-3 rounded-xl border border-[#E7D8C8]/60 text-xs">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-0.5">
                          <span className="font-medium text-[#2B201A] truncate max-w-[260px]">
                            {item.title} <strong className="text-[#E86F1D]">×{item.quantity}</strong>
                          </span>
                          <span className="font-mono text-[#2B201A]">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Customer & Delivery Details */}
                  <div className="space-y-2 text-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/60 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E86F1D]" />
                      <span>Shipping &amp; Contact Details</span>
                    </p>
                    <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E7D8C8]/60 space-y-1">
                      <p className="font-bold text-[#2B201A]">{order.shippingName}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[#2B201A]/80 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#B8893E]" />
                          {order.shippingPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#B8893E]" />
                          {order.shippingEmail}
                        </span>
                      </div>
                      <p className="text-[#2B201A]/70 text-[11px] pt-0.5 leading-relaxed">
                        {order.shippingAddress}, {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Footer: Approve Payment & Shipping Status */}
                <div className="p-3 sm:p-4 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Left: Quick Approve Payment Action */}
                  <div className="flex items-center gap-2">
                    {order.paymentStatus === "PENDING" ? (
                      <button
                        onClick={() => handleUpdatePaymentStatus(order.id, "PAID")}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F5A43] hover:bg-[#234533] text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Approve Payment (Mark Paid)</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Payment Approved</span>
                        </span>
                        <button
                          onClick={() => handleUpdatePaymentStatus(order.id, "PENDING")}
                          disabled={isUpdating}
                          className="text-[11px] text-gray-500 hover:text-gray-800 underline ml-2"
                        >
                          Revert to Pending
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Dispatch / Fulfillment Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#2B201A]/70 font-semibold text-xs flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#E86F1D]" />
                      <span>Fulfillment Status:</span>
                    </span>
                    <select
                      value={order.status}
                      disabled={isUpdating}
                      onChange={(e) =>
                        handleUpdateOrderStatus(
                          order.id,
                          e.target.value as "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
                        )
                      }
                      className="px-2.5 py-1.5 bg-[#FAF6F0] border border-[#E7D8C8] rounded-xl text-xs font-bold text-[#2B201A] focus:outline-hidden focus:border-[#E86F1D]"
                    >
                      <option value="PLACED">Placed (स्वीकार किया गया)</option>
                      <option value="PROCESSING">Processing (पैकिंग जारी)</option>
                      <option value="SHIPPED">Shipped (डिस्पैच / रवाना)</option>
                      <option value="DELIVERED">Delivered (वितरित)</option>
                      <option value="CANCELLED">Cancelled (रद्द)</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
