"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Package,
  CheckCircle2,
  Clock,
  Banknote,
  Search,
  MapPin,
  Phone,
  Mail,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

const PAGE_SIZE = 10;

type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PLACED: "bg-[#FAF6F0] border-[#E7D8C8] text-[#2B201A]",
  PROCESSING: "bg-blue-50 border-blue-200 text-blue-800",
  SHIPPED: "bg-violet-50 border-violet-200 text-violet-800",
  DELIVERED: "bg-emerald-50 border-emerald-300 text-emerald-800",
  CANCELLED: "bg-red-50 border-red-200 text-red-700",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

function formatMoney(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Page numbers with ellipses, e.g. 1 … 4 5 6 … 12
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

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
  status: OrderStatus;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  paymentMethod: "PREPAID" | "COD";
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  refundStatus: "PENDING" | "COMPLETED" | null;
  refundReference: string | null;
  refundedAt: string | null;
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
  const [filter, setFilter] = useState<"ALL" | "PENDING_PAYMENT" | "PAID" | "COD" | "REFUND_DUE">("ALL");
  const [refundRefs, setRefundRefs] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const changeFilter = (f: typeof filter) => {
    setFilter(f);
    setPage(1);
  };

  const goToPage = (p: number) => {
    setPage(p);
    setExpandedId(null);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Sends a change to the server and copies back the fields it may have changed
  // (the server also sets or clears the refund when an order is cancelled or restored).
  const patchOrder = async (orderId: string, body: Record<string, string>, success: (o: Order) => string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to update order.");

      const u = data.order as Order;
      const next = {
        status: u.status,
        paymentStatus: u.paymentStatus,
        refundStatus: u.refundStatus,
        refundReference: u.refundReference,
        refundedAt: u.refundedAt,
      };
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...next } : o)));
      toast.success(success(u));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error updating order");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdatePaymentStatus = (orderId: string, newPaymentStatus: "PAID" | "PENDING") =>
    patchOrder(orderId, { paymentStatus: newPaymentStatus }, (o) =>
      newPaymentStatus === "PAID"
        ? `Order ${o.orderNumber} payment approved and marked as PAID.`
        : `Order ${o.orderNumber} payment set to PENDING.`
    );

  const handleUpdateOrderStatus = (order: Order, newStatus: OrderStatus) => {
    if (
      newStatus === "CANCELLED" &&
      order.paymentStatus === "PAID" &&
      order.paymentMethod !== "COD" &&
      !window.confirm(
        `This order was paid by UPI. Cancelling it marks a refund of ${formatMoney(order.totalAmount)} as due, and the customer is emailed that a refund is in progress. Continue?`
      )
    ) {
      return;
    }
    return patchOrder(order.id, { status: newStatus }, (o) =>
      o.refundStatus === "PENDING" && order.refundStatus !== "PENDING"
        ? `Order ${o.orderNumber} cancelled. Refund of ${formatMoney(o.totalAmount)} is now due.`
        : `Order ${o.orderNumber} status updated to ${newStatus}.`
    );
  };

  const handleMarkRefunded = (orderId: string) =>
    patchOrder(orderId, { refundStatus: "COMPLETED", refundReference: refundRefs[orderId] ?? "" }, (o) =>
      `Refund for ${o.orderNumber} marked as sent. The customer has been emailed.`
    );

  const handleUndoRefund = (orderId: string) =>
    patchOrder(orderId, { refundStatus: "PENDING" }, (o) => `Refund for ${o.orderNumber} set back to pending.`);

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
    if (filter === "REFUND_DUE" && o.refundStatus !== "PENDING") {
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
  const paidCount = orders.filter((o) => o.paymentStatus === "PAID").length;
  const codCount = orders.filter((o) => o.paymentMethod === "COD").length;
  const refundDueCount = orders.filter((o) => o.refundStatus === "PENDING").length;

  // Money that is being or has been refunded is not revenue.
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID" && !o.refundStatus)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageOrders = filteredOrders.slice(pageStart, pageStart + PAGE_SIZE);

  const filters = [
    { key: "ALL" as const, label: "All", count: orders.length },
    { key: "PENDING_PAYMENT" as const, label: "Needs approval", count: pendingApprovalsCount },
    { key: "PAID" as const, label: "Paid", count: paidCount },
    { key: "COD" as const, label: "Cash on delivery", count: codCount },
    ...(refundDueCount > 0 || filter === "REFUND_DUE"
      ? [{ key: "REFUND_DUE" as const, label: "Refunds due", count: refundDueCount }]
      : []),
  ];

  const stats = [
    { label: "Total orders", value: orders.length, tone: "text-[#2B201A]" },
    { label: "Needs approval", value: pendingApprovalsCount, tone: pendingApprovalsCount > 0 ? "text-[#E86F1D]" : "text-[#2B201A]" },
    { label: "Verified revenue", value: formatMoney(totalRevenue), tone: "text-[#2F5A43]" },
    refundDueCount > 0
      ? { label: "Refunds due", value: refundDueCount, tone: "text-red-700" }
      : { label: "Cash on delivery", value: codCount, tone: "text-[#2B201A]" },
  ];

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A]">
          Publication &amp; Book Orders
        </h1>
        <p className="text-sm text-[#2B201A]/70 mt-1">
          Approve UPI payments and update shipping status. Click an order to see full details.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`px-4 py-3 rounded-2xl border shadow-xs ${
              s.label === "Needs approval" && pendingApprovalsCount > 0
                ? "bg-amber-50/70 border-amber-300"
                : s.label === "Refunds due"
                  ? "bg-red-50/70 border-red-200"
                  : "bg-white border-[#E7D8C8]"
            }`}
          >
            <p className="text-xs font-semibold text-[#2B201A]/60">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div ref={listRef} className="bg-white rounded-2xl border border-[#E7D8C8] shadow-xs overflow-hidden scroll-mt-4">
        {/* Filters and search */}
        <div className="p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-[#E7D8C8]">
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => changeFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                  filter === f.key
                    ? "bg-[#2B201A] text-white"
                    : "bg-[#FBF2E7] text-[#2B201A]/80 hover:bg-[#E7D8C8]"
                }`}
              >
                {f.label}{" "}
                <span className={filter === f.key ? "text-white/70" : "text-[#2B201A]/50"}>{f.count}</span>
              </button>
            ))}
          </div>

          <div className="relative md:w-72">
            <Search className="w-4 h-4 text-[#2B201A]/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order #, name, phone, email"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E7D8C8] rounded-xl text-sm focus:outline-hidden focus:border-[#E86F1D]"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package className="w-10 h-10 text-[#B8893E] mx-auto opacity-60" />
            <h3 className="font-editorial text-lg font-bold text-[#2B201A]">No orders found</h3>
            <p className="text-sm text-[#2B201A]/60">
              {searchQuery ? "No orders matched your search." : "No orders match the selected filter."}
            </p>
          </div>
        ) : (
          <>
            {/* Column headings (desktop) */}
            <div className="hidden md:grid grid-cols-[1.1fr_1.3fr_1.6fr_0.7fr_1.3fr_1.3fr_32px] gap-4 px-4 py-2.5 bg-[#FBF2E7]/60 text-xs font-semibold text-[#2B201A]/60 border-b border-[#E7D8C8]">
              <span>Order</span>
              <span>Customer</span>
              <span>Items</span>
              <span className="text-right">Amount</span>
              <span>Payment</span>
              <span>Shipping status</span>
              <span />
            </div>

            <ul className="divide-y divide-[#E7D8C8]">
              {pageOrders.map((order) => {
                const isUpdating = updatingId === order.id;
                const isOpen = expandedId === order.id;
                const { date, time } = formatDate(order.createdAt);
                const firstItem = order.items[0];
                const moreItems = order.items.length - 1;
                const isPaid = order.paymentStatus === "PAID";
                const isFailed = order.paymentStatus === "FAILED";
                const method = order.paymentMethod === "PREPAID" ? "UPI" : "COD";

                return (
                  <li key={order.id} className={isOpen ? "bg-[#FFFCF8]" : ""}>
                    {/* Summary row */}
                    <div
                      onClick={() => setExpandedId(isOpen ? null : order.id)}
                      className="grid grid-cols-2 md:grid-cols-[1.1fr_1.3fr_1.6fr_0.7fr_1.3fr_1.3fr_32px] gap-x-4 gap-y-2 px-4 py-3 items-center cursor-pointer hover:bg-[#FBF2E7]/40 transition-colors"
                    >
                      {/* Order */}
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-bold text-[#2B201A] truncate">{order.orderNumber}</p>
                        <p className="text-xs text-[#2B201A]/60">
                          {date}, {time}
                        </p>
                      </div>

                      {/* Amount (mobile only, top-right) */}
                      <p className="md:hidden text-right text-base font-bold text-[#2B201A]">
                        {formatMoney(order.totalAmount)}
                      </p>

                      {/* Customer */}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2B201A] truncate capitalize">{order.shippingName}</p>
                        <p className="text-xs text-[#2B201A]/60 truncate">{order.shippingPhone}</p>
                      </div>

                      {/* Items */}
                      <div className="min-w-0">
                        <p className="text-sm text-[#2B201A] truncate" title={firstItem?.title}>
                          {firstItem ? `${firstItem.title} ×${firstItem.quantity}` : "—"}
                        </p>
                        {moreItems > 0 && (
                          <p className="text-xs text-[#2B201A]/60">
                            + {moreItems} more item{moreItems > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>

                      {/* Amount (desktop) */}
                      <p className="hidden md:block text-right text-sm font-bold text-[#2B201A]">
                        {formatMoney(order.totalAmount)}
                      </p>

                      {/* Payment */}
                      <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : isFailed
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : method === "COD" ? (
                            <Banknote className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {method} · {isPaid ? "Paid" : isFailed ? "Failed" : method === "UPI" ? "Pending" : "Unpaid"}
                        </span>
                        {order.refundStatus === "PENDING" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                            <RotateCcw className="w-3 h-3" />
                            Refund due
                          </span>
                        )}
                        {order.refundStatus === "COMPLETED" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-300">
                            <RotateCcw className="w-3 h-3" />
                            Refunded
                          </span>
                        )}
                        {!isPaid && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(order.id, "PAID")}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2F5A43] hover:bg-[#234533] text-white text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {isUpdating && <Loader2 className="w-3 h-3 animate-spin" />}
                            {method === "UPI" ? "Approve" : "Mark paid"}
                          </button>
                        )}
                      </div>

                      {/* Shipping status */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => handleUpdateOrderStatus(order, e.target.value as OrderStatus)}
                          aria-label={`Shipping status for ${order.orderNumber}`}
                          className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#E86F1D] disabled:opacity-50 ${STATUS_STYLES[order.status]}`}
                        >
                          <option value="PLACED">Placed (स्वीकार किया गया)</option>
                          <option value="PROCESSING">Processing (पैकिंग जारी)</option>
                          <option value="SHIPPED">Shipped (डिस्पैच / रवाना)</option>
                          <option value="DELIVERED">Delivered (वितरित)</option>
                          <option value="CANCELLED">Cancelled (रद्द)</option>
                        </select>
                      </div>

                      {/* Expand toggle */}
                      <button
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "Hide details" : "Show details"}
                        className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-[#2B201A]/50 hover:bg-[#E7D8C8]/60"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>

                    {/* Details */}
                    {isOpen && (
                      <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {order.refundStatus === "PENDING" && (
                          <div className="md:col-span-2 p-3 rounded-xl border border-red-200 bg-red-50/70 space-y-2">
                            <p className="font-semibold text-red-800 flex items-center gap-1.5">
                              <RotateCcw className="w-4 h-4" />
                              Refund of {formatMoney(order.totalAmount)} is due
                            </p>
                            <p className="text-xs text-red-800/80">
                              Send the money back to the customer&apos;s UPI account, then enter the UPI reference / UTR
                              and mark it as refunded. The customer will be emailed and will see it on their orders page.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={refundRefs[order.id] ?? ""}
                                onChange={(e) => setRefundRefs((r) => ({ ...r, [order.id]: e.target.value }))}
                                placeholder="UPI reference / UTR (optional)"
                                maxLength={100}
                                className="flex-1 px-3 py-2 bg-white border border-red-200 rounded-lg text-sm focus:outline-hidden focus:border-[#E86F1D]"
                              />
                              <button
                                onClick={() => handleMarkRefunded(order.id)}
                                disabled={isUpdating}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#2F5A43] hover:bg-[#234533] text-white text-sm font-semibold disabled:opacity-50"
                              >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Mark as refunded
                              </button>
                            </div>
                          </div>
                        )}
                        {order.refundStatus === "COMPLETED" && (
                          <div className="md:col-span-2 p-3 rounded-xl border border-slate-300 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-slate-800">
                              <span className="font-semibold">Refunded {formatMoney(order.totalAmount)}</span>
                              {order.refundedAt && <> on {formatDate(order.refundedAt).date}</>}
                              {order.refundReference && (
                                <>
                                  {" "}· Ref <span className="font-mono">{order.refundReference}</span>
                                </>
                              )}
                            </p>
                            <button
                              onClick={() => handleUndoRefund(order.id)}
                              disabled={isUpdating}
                              className="text-xs text-slate-600 hover:text-slate-900 underline"
                            >
                              Undo (set back to due)
                            </button>
                          </div>
                        )}
                        <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E7D8C8]/60">
                          <p className="text-xs font-semibold text-[#2B201A]/60 mb-2 flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-[#E86F1D]" />
                            Items ({order.items.length})
                          </p>
                          <ul className="space-y-1.5">
                            {order.items.map((item) => (
                              <li key={item.id} className="flex justify-between gap-3">
                                <span className="text-[#2B201A]">
                                  {item.title} <span className="text-[#2B201A]/60">×{item.quantity}</span>
                                </span>
                                <span className="font-medium text-[#2B201A] whitespace-nowrap">
                                  {formatMoney(item.price * item.quantity)}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex justify-between border-t border-[#E7D8C8] mt-2 pt-2 font-bold text-[#2B201A]">
                            <span>Total</span>
                            <span>{formatMoney(order.totalAmount)}</span>
                          </div>
                        </div>

                        <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E7D8C8]/60 space-y-1.5">
                          <p className="text-xs font-semibold text-[#2B201A]/60 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#E86F1D]" />
                            Ship to
                          </p>
                          <p className="font-semibold text-[#2B201A] capitalize">{order.shippingName}</p>
                          <p className="text-[#2B201A]/80 leading-relaxed">
                            {order.shippingAddress}, {order.shippingCity}, {order.shippingState} – {order.shippingPincode}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#2B201A]/80 pt-1">
                            <a href={`tel:${order.shippingPhone}`} className="flex items-center gap-1 hover:text-[#E86F1D]">
                              <Phone className="w-3.5 h-3.5 text-[#B8893E]" />
                              {order.shippingPhone}
                            </a>
                            <a href={`mailto:${order.shippingEmail}`} className="flex items-center gap-1 hover:text-[#E86F1D]">
                              <Mail className="w-3.5 h-3.5 text-[#B8893E]" />
                              {order.shippingEmail}
                            </a>
                          </div>
                          {isPaid && (
                            <button
                              onClick={() => handleUpdatePaymentStatus(order.id, "PENDING")}
                              disabled={isUpdating}
                              className="text-xs text-[#2B201A]/60 hover:text-[#2B201A] underline pt-2"
                            >
                              Revert payment to pending
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#E7D8C8] bg-[#FBF2E7]/40">
              <p className="text-sm text-[#2B201A]/70">
                Showing <strong>{pageStart + 1}</strong>–
                <strong>{Math.min(pageStart + PAGE_SIZE, filteredOrders.length)}</strong> of{" "}
                <strong>{filteredOrders.length}</strong> orders
              </p>
              {totalPages > 1 && (
                <nav className="flex items-center gap-1" aria-label="Pagination">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#2B201A] hover:bg-[#E7D8C8] disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {pageList(currentPage, totalPages).map((p, i) =>
                    p === "…" ? (
                      <span key={`gap-${i}`} className="w-8 text-center text-[#2B201A]/50">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        aria-current={p === currentPage ? "page" : undefined}
                        className={`min-w-8 h-8 px-2 rounded-lg text-sm font-semibold ${
                          p === currentPage ? "bg-[#2B201A] text-white" : "text-[#2B201A] hover:bg-[#E7D8C8]"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#2B201A] hover:bg-[#E7D8C8] disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
