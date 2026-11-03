"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  Award,
  Crown,
  Medal,
  Phone,
  Mail,
  MapPin,
  Check,
  AlertTriangle,
  X,
  Loader2,
  Edit2,
  Filter,
  Eye,
  Calendar,
  Clock,
  Ticket,
  Download,
  CheckCircle2,
  Package,
  Receipt,
  FileText,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";

export type MembershipTier = "FREE" | "BASIC" | "SILVER" | "GOLD" | "PLATINUM";

export interface AdminMemberItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  tier: MembershipTier;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  role?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  photoUrl?: string | null;
  validUntil?: string | Date | null;
  createdAt: string | Date;
}

export interface MemberDetailsData {
  member: AdminMemberItem;
  linkedUser?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    createdAt?: string;
  } | null;
  stats: {
    totalContributedPaise: number;
    totalVerifiedDonationsCount: number;
    totalEventPassesCount: number;
    totalAllDonationsCount: number;
    totalOrdersCount: number;
  };
  history: {
    eventPasses: Array<{
      donationId: string;
      amountPaise: number;
      status: string;
      createdAt: string;
      verifiedAt: string | null;
      utr?: string | null;
      certificateKey: string;
      passUrl: string;
      pdfUrl: string;
      event: {
        id: string;
        title: string;
        titleHi?: string | null;
        slug: string;
        startDate: string;
        endDate?: string | null;
        location: string;
        address?: string | null;
        image?: string | null;
        timeText?: string | null;
      };
    }>;
    membershipDonations: Array<{
      donationId: string;
      program?: string | null;
      amountPaise: number;
      status: string;
      createdAt: string;
      verifiedAt?: string | null;
      utr?: string | null;
      certificateKey: string;
      certificateUrl: string;
      certificatePdfUrl: string;
      passUrl: string;
    }>;
    generalDonations: Array<{
      donationId: string;
      program: string;
      amountPaise: number;
      status: string;
      createdAt: string;
      verifiedAt?: string | null;
      utr?: string | null;
      certificateKey: string;
      certificateUrl: string;
      certificatePdfUrl: string;
    }>;
    allDonations: Array<{
      donationId: string;
      type: string;
      program?: string | null;
      amountPaise: number;
      status: string;
      createdAt: string;
      verifiedAt?: string | null;
      utr?: string | null;
    }>;
    orders: Array<{
      id: string;
      orderNumber: string;
      totalAmount: number;
      status: string;
      paymentStatus: string;
      createdAt: string;
      itemsCount: number;
      items: Array<{
        id: string;
        title: string;
        price: number;
        quantity: number;
        image?: string | null;
      }>;
    }>;
  };
}

const TIER_ORDER: MembershipTier[] = ["BASIC", "SILVER", "GOLD", "PLATINUM"];

const TIER_CONFIG: Record<
  MembershipTier,
  { label: string; badgeCls: string; color: string }
> = {
  FREE: {
    label: "Free / Registered",
    badgeCls: "bg-stone-100 text-stone-700 border-stone-300 font-medium",
    color: "#6B7280",
  },
  BASIC: {
    label: "Basic Member",
    badgeCls: "bg-orange-50 text-[#B4531A] border-[#B4531A]/30 font-medium",
    color: "#B4531A",
  },
  SILVER: {
    label: "Silver Member",
    badgeCls: "bg-slate-100 text-[#475569] border-[#475569]/30 font-medium",
    color: "#5F6B7D",
  },
  GOLD: {
    label: "Gold Member",
    badgeCls: "bg-amber-50 text-[#A8721C] border-[#A8721C]/40 font-bold",
    color: "#A8721C",
  },
  PLATINUM: {
    label: "Platinum Patron",
    badgeCls: "bg-purple-50 text-[#6B21A8] border-[#6B21A8]/40 font-bold shadow-xs",
    color: "#6B21A8",
  },
};

interface MemberManagerProps {
  initialMembers: AdminMemberItem[];
}

export default function MemberManager({ initialMembers }: MemberManagerProps) {
  const router = useRouter();
  const [members, setMembers] = useState<AdminMemberItem[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminMemberItem | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<AdminMemberItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Member Details & History Modal State
  const [viewingMember, setViewingMember] = useState<AdminMemberItem | null>(null);
  const [memberDetailsData, setMemberDetailsData] = useState<MemberDetailsData | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [historyTab, setHistoryTab] = useState<"all" | "events" | "donations" | "memberships" | "orders">("all");
  const [detailsCache, setDetailsCache] = useState<Record<string, MemberDetailsData>>({});

  const prefetchDetails = (memberId: string) => {
    if (detailsCache[memberId]) return;
    fetch(`/api/admin/members/${memberId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setDetailsCache((prev) => ({ ...prev, [memberId]: data }));
        }
      })
      .catch(() => {});
  };

  const handleOpenDetails = async (member: AdminMemberItem) => {
    setViewingMember(member);
    setHistoryTab("all");

    if (detailsCache[member.id]) {
      setMemberDetailsData(detailsCache[member.id]);
      setLoadingDetails(false);
      return;
    }

    setLoadingDetails(true);
    setMemberDetailsData(null);

    try {
      const res = await fetch(`/api/admin/members/${member.id}`);
      const data = await res.json();
      if (res.ok) {
        setMemberDetailsData(data);
        setDetailsCache((prev) => ({ ...prev, [member.id]: data }));
      } else {
        toast.error(data.error || "Failed to load member history");
      }
    } catch {
      toast.error("Failed to load member history");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tier: "BASIC" as MembershipTier,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "EXPIRED",
    role: "Devotee Member",
    city: "",
    state: "",
    address: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      tier: "BASIC",
      status: "ACTIVE",
      role: "Devotee Member",
      city: "",
      state: "",
      address: "",
    });
    setEditingMember(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (member: AdminMemberItem) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email || "",
      phone: member.phone || "",
      tier: member.tier,
      status: member.status,
      role: member.role || "Devotee Member",
      city: member.city || "",
      state: member.state || "",
      address: member.address || "",
    });
    setIsEditModalOpen(true);
  };

  // Submit Add Member
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Member name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create member");

      setMembers((prev) => [data.member, ...prev]);
      toast.success(`Member ${data.member.name} added successfully!`);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating member";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Member
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!formData.name.trim()) {
      toast.error("Member name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/members/${editingMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update member");

      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? data.member : m))
      );
      toast.success(`Member ${data.member.name} updated successfully!`);
      setIsEditModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating member";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upgrade or Downgrade Membership Tier
  const handleTierChange = async (member: AdminMemberItem, newTier: MembershipTier) => {
    if (member.tier === newTier) return;
    const isUpgrade = TIER_ORDER.indexOf(newTier) > TIER_ORDER.indexOf(member.tier);

    setActionLoadingId(member.id);
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: newTier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change membership tier");

      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, tier: newTier } : m))
      );
      toast.success(
        isUpgrade
          ? `${member.name} upgraded to ${TIER_CONFIG[newTier].label}! 🚀`
          : `${member.name} downgraded to ${TIER_CONFIG[newTier].label}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating membership";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete / Remove Member
  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/members/${memberToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove member");

      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      router.refresh();
      toast.success(`Member ${memberToDelete.name} has been removed.`);
      setMemberToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting member";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered members list
  const filteredMembers = members.filter((member) => {
    const matchesTier = tierFilter === "ALL" || member.tier === tierFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      member.name.toLowerCase().includes(q) ||
      (member.email && member.email.toLowerCase().includes(q)) ||
      (member.phone && member.phone.toLowerCase().includes(q)) ||
      (member.city && member.city.toLowerCase().includes(q)) ||
      (member.role && member.role.toLowerCase().includes(q));

    return matchesTier && matchesSearch;
  });

  // Tier counts
  const countByTier = {
    ALL: members.length,
    BASIC: members.filter((m) => m.tier === "BASIC").length,
    SILVER: members.filter((m) => m.tier === "SILVER").length,
    GOLD: members.filter((m) => m.tier === "GOLD").length,
    PLATINUM: members.filter((m) => m.tier === "PLATINUM").length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E7D8C8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A]">
              Member Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E86F1D]/10 text-[#E86F1D]">
              {members.length} Members
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#2B201A]/70 mt-1">
            Manage trust members, remove members, and upgrade or downgrade membership plans.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E86F1D] hover:bg-[#D45A0E] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer w-full sm:w-auto text-center shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Tier Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E7D8C8] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B4531A] uppercase tracking-wider">Basic</span>
            <Shield className="w-4 h-4 text-[#B4531A]" />
          </div>
          <p className="text-2xl font-black text-[#2B201A] mt-2">{countByTier.BASIC}</p>
          <p className="text-[11px] text-[#2B201A]/60 mt-0.5">₹1,100 / yr tier</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7D8C8] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Silver</span>
            <Award className="w-4 h-4 text-[#475569]" />
          </div>
          <p className="text-2xl font-black text-[#2B201A] mt-2">{countByTier.SILVER}</p>
          <p className="text-[11px] text-[#2B201A]/60 mt-0.5">₹5,100 / yr tier</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7D8C8] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A8721C] uppercase tracking-wider">Gold</span>
            <Medal className="w-4 h-4 text-[#A8721C]" />
          </div>
          <p className="text-2xl font-black text-[#2B201A] mt-2">{countByTier.GOLD}</p>
          <p className="text-[11px] text-[#2B201A]/60 mt-0.5">₹11,000 / yr tier</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7D8C8] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B21A8] uppercase tracking-wider">Platinum</span>
            <Crown className="w-4 h-4 text-[#6B21A8]" />
          </div>
          <p className="text-2xl font-black text-[#2B201A] mt-2">{countByTier.PLATINUM}</p>
          <p className="text-[11px] text-[#2B201A]/60 mt-0.5">Lifetime Patron tier</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white p-3 sm:p-4 rounded-xl border border-[#E7D8C8]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2B201A]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, city..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
          />
        </div>

        {/* Tier Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-1 sm:pb-0">
          {(["ALL", "BASIC", "SILVER", "GOLD", "PLATINUM"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                tierFilter === t
                  ? "bg-[#2B201A] text-white"
                  : "bg-[#FAF6F0] text-[#2B201A]/70 hover:bg-[#FBF2E7] hover:text-[#2B201A]"
              }`}
            >
              {t === "ALL" ? `All (${members.length})` : t}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-[#E7D8C8] shadow-xs overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-[#2B201A]/60">
            <Users className="w-10 h-10 mx-auto text-[#2B201A]/30 mb-2" />
            <p className="text-sm font-semibold">No members found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[720px]">
              <thead className="bg-[#FAF6F0] border-b border-[#E7D8C8] text-[#2B201A]/70 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4 sm:px-5">Member Name & Role</th>
                  <th className="py-3 px-3">Contact Info</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Membership Plan & Tier</th>
                  <th className="py-3 px-4 sm:px-5 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7D8C8]/60">
                {filteredMembers.map((member) => {
                  const currTierIdx = TIER_ORDER.indexOf(member.tier);
                  const canUpgrade = currTierIdx < TIER_ORDER.length - 1;
                  const canDowngrade = currTierIdx > 0;
                  const nextTier = canUpgrade ? TIER_ORDER[currTierIdx + 1] : null;
                  const prevTier = canDowngrade ? TIER_ORDER[currTierIdx - 1] : null;
                  const isLoading = actionLoadingId === member.id;

                  // Clean text badge without AI icons

                  return (
                    <tr
                      key={member.id}
                      onMouseEnter={() => prefetchDetails(member.id)}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (
                          target.closest("button") ||
                          target.closest("select") ||
                          target.closest("input") ||
                          target.closest("a")
                        ) {
                          return;
                        }
                        handleOpenDetails(member);
                      }}
                      className="hover:bg-[#FAF3EA]/50 transition-colors cursor-pointer group"
                      title="Click to view full profile & pass/donation history"
                    >
                      {/* Name & Role */}
                      <td className="py-3 px-4 sm:px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FAF3EA] border border-[#E7D8C8] text-[#E86F1D] flex items-center justify-center font-bold text-xs uppercase shrink-0 group-hover:scale-105 transition-transform">
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-[#2B201A] text-xs sm:text-sm truncate group-hover:text-[#E86F1D] transition-colors">
                                {member.name}
                              </p>
                              <Eye className="w-3.5 h-3.5 text-[#E86F1D] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>
                            <p className="text-[11px] text-[#2B201A]/60 truncate">
                              {member.role || "Devotee Member"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5 text-xs max-w-[210px]">
                          {member.email && (
                            <div className="flex items-center gap-1.5 text-[#2B201A]/80 truncate">
                              <Mail className="w-3 h-3 text-[#E86F1D] shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-1.5 text-[#2B201A]/80 truncate">
                              <Phone className="w-3 h-3 text-[#E86F1D] shrink-0" />
                              <span className="truncate">{member.phone}</span>
                            </div>
                          )}
                          {!member.email && !member.phone && (
                            <span className="text-[#2B201A]/40 italic">—</span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-xs text-[#2B201A]/70 max-w-[130px] truncate">
                          {member.city || member.state ? (
                            <>
                              <MapPin className="w-3 h-3 text-[#E86F1D] shrink-0" />
                              <span className="truncate">
                                {[member.city, member.state].filter(Boolean).join(", ")}
                              </span>
                            </>
                          ) : (
                            <span className="text-[#2B201A]/40">—</span>
                          )}
                        </div>
                      </td>

                      {/* Membership Plan & Tier with direct select + Upgrade / Downgrade */}
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-2">
                          {/* Styled Tier Selector Dropdown */}
                          <select
                            value={member.tier}
                            onChange={(e) =>
                              handleTierChange(member, e.target.value as MembershipTier)
                            }
                            disabled={isLoading}
                            className={`text-xs font-bold rounded-lg border px-2.5 py-1.5 cursor-pointer focus:outline-none transition-colors shadow-2xs ${
                              TIER_CONFIG[member.tier].badgeCls
                            }`}
                            title="Directly select membership tier"
                          >
                            <option value="BASIC">Basic Member</option>
                            <option value="SILVER">Silver Member</option>
                            <option value="GOLD">Gold Member</option>
                            <option value="PLATINUM">Platinum Patron</option>
                          </select>

                          {/* Quick Upgrade & Downgrade icon buttons */}
                          <div className="inline-flex items-center gap-1 bg-[#FAF6F0] p-0.5 rounded-md border border-[#E7D8C8]">
                            <button
                              type="button"
                              disabled={!canUpgrade || isLoading}
                              onClick={() => nextTier && handleTierChange(member, nextTier)}
                              title={
                                nextTier
                                  ? `Upgrade to ${TIER_CONFIG[nextTier].label}`
                                  : "Highest tier reached"
                              }
                              className={`p-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                canUpgrade
                                  ? "bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 shadow-2xs active:scale-95"
                                  : "text-stone-300 cursor-not-allowed opacity-30"
                              }`}
                            >
                              <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </button>

                            <button
                              type="button"
                              disabled={!canDowngrade || isLoading}
                              onClick={() => prevTier && handleTierChange(member, prevTier)}
                              title={
                                prevTier
                                  ? `Downgrade to ${TIER_CONFIG[prevTier].label}`
                                  : "Lowest tier reached"
                              }
                              className={`p-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                canDowngrade
                                  ? "bg-white text-amber-700 hover:bg-amber-50 border border-amber-200 shadow-2xs active:scale-95"
                                  : "text-stone-300 cursor-not-allowed opacity-30"
                              }`}
                            >
                              <ArrowDownCircle className="w-3.5 h-3.5 text-amber-600" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* View Details, Edit & Remove Actions */}
                      <td className="py-3 px-4 sm:px-5 text-right w-28">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Full History & Details */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetails(member);
                            }}
                            className="p-1.5 rounded-lg text-[#2B201A]/70 hover:text-[#E86F1D] hover:bg-[#FAF3EA] transition-colors cursor-pointer"
                            title="View member passes, donations & history"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(member);
                            }}
                            className="p-1.5 rounded-lg text-[#2B201A]/60 hover:text-[#E86F1D] hover:bg-[#FAF3EA] transition-colors cursor-pointer"
                            title="Edit member details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Remove Member */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMemberToDelete(member);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD NEW MEMBER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-[#E7D8C8] shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#E7D8C8] flex items-center justify-between">
              <h3 className="font-editorial text-lg font-bold text-[#2B201A]">Add New Member</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Chandra Sharma"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                    Membership Tier *
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) =>
                      setFormData({ ...formData, tier: e.target.value as MembershipTier })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  >
                    <option value="BASIC">Basic (₹1,100 / yr)</option>
                    <option value="SILVER">Silver (₹5,100 / yr)</option>
                    <option value="GOLD">Gold (₹11,000 / yr)</option>
                    <option value="PLATINUM">Platinum (Lifetime Patron)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Devotee Member"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Gurugram"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Haryana"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7D8C8] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#E86F1D] hover:bg-[#D45A0E] text-white rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEMBER */}
      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-[#E7D8C8] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#E7D8C8] flex items-center justify-between">
              <h3 className="font-editorial text-lg font-bold text-[#2B201A]">Edit Member Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                    Membership Tier
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) =>
                      setFormData({ ...formData, tier: e.target.value as MembershipTier })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  >
                    <option value="BASIC">Basic (₹1,100 / yr)</option>
                    <option value="SILVER">Silver (₹5,100 / yr)</option>
                    <option value="GOLD">Gold (₹11,000 / yr)</option>
                    <option value="PLATINUM">Platinum (Lifetime Patron)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "ACTIVE" | "INACTIVE" | "EXPIRED",
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B201A] uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[#FAF6F0] border border-[#E7D8C8] focus:outline-none focus:border-[#E86F1D]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7D8C8] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#E86F1D] hover:bg-[#D45A0E] text-white rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MEMBER DETAILS & HISTORY */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-[#E7D8C8] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#FAF6F0] px-5 sm:px-6 py-4 border-b border-[#E7D8C8] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FAF3EA] to-[#F1E5D5] border border-[#E7D8C8] text-[#E86F1D] flex items-center justify-center font-bold text-lg uppercase shrink-0 shadow-2xs">
                  {viewingMember.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#2B201A] truncate">
                      {viewingMember.name}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${
                        TIER_CONFIG[viewingMember.tier].badgeCls
                      }`}
                    >
                      {TIER_CONFIG[viewingMember.tier].label}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {viewingMember.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#2B201A]/60 truncate">
                    {viewingMember.role || "Devotee Member"} • ID: {viewingMember.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#E7D8C8] text-[#2B201A]/60 hover:text-[#2B201A] hover:bg-[#FAF6F0] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Member Contact & Location Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#FAF6F0]/60 p-3.5 rounded-2xl border border-[#E7D8C8]">
                <div className="flex items-center gap-2 min-w-0 text-xs text-[#2B201A]">
                  <Mail className="w-4 h-4 text-[#E86F1D] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#2B201A]/50">Email</p>
                    <p className="truncate font-medium">{viewingMember.email || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-0 text-xs text-[#2B201A]">
                  <Phone className="w-4 h-4 text-[#E86F1D] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#2B201A]/50">Phone</p>
                    <p className="truncate font-medium">{viewingMember.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-0 text-xs text-[#2B201A]">
                  <MapPin className="w-4 h-4 text-[#E86F1D] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#2B201A]/50">Location</p>
                    <p className="truncate font-medium">
                      {[viewingMember.city, viewingMember.state].filter(Boolean).join(", ") ||
                        "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-0 text-xs text-[#2B201A]">
                  <Calendar className="w-4 h-4 text-[#E86F1D] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#2B201A]/50">Joined On</p>
                    <p className="truncate font-medium">
                      {new Date(viewingMember.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              {loadingDetails ? (
                <div className="py-12 flex flex-col items-center justify-center text-[#2B201A]/60 space-y-2">
                  <Loader2 className="w-8 h-8 text-[#E86F1D] animate-spin" />
                  <p className="text-xs font-semibold">Loading member seva & event history...</p>
                </div>
              ) : memberDetailsData ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-orange-200/80 rounded-2xl p-3.5">
                      <p className="text-[10px] font-bold text-amber-900/70 uppercase">
                        Lifetime Seva Given
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-[#E86F1D]">
                        ₹
                        {(
                          (memberDetailsData.stats.totalContributedPaise || 0) / 100
                        ).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-amber-900/60 mt-0.5">
                        {memberDetailsData.stats.totalVerifiedDonationsCount} verified transactions
                      </p>
                    </div>

                    <div className="bg-white border border-[#E7D8C8] rounded-2xl p-3.5 shadow-2xs">
                      <p className="text-[10px] font-bold text-[#2B201A]/60 uppercase">
                        Event Passes
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-[#2B201A]">
                        {memberDetailsData.stats.totalEventPassesCount}
                      </p>
                      <p className="text-[10px] text-[#2B201A]/50 mt-0.5">Purchased & verified</p>
                    </div>

                    <div className="bg-white border border-[#E7D8C8] rounded-2xl p-3.5 shadow-2xs">
                      <p className="text-[10px] font-bold text-[#2B201A]/60 uppercase">
                        General Donations
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-[#2B201A]">
                        {memberDetailsData.history.generalDonations.length}
                      </p>
                      <p className="text-[10px] text-[#2B201A]/50 mt-0.5">Seva contributions</p>
                    </div>

                    <div className="bg-white border border-[#E7D8C8] rounded-2xl p-3.5 shadow-2xs">
                      <p className="text-[10px] font-bold text-[#2B201A]/60 uppercase">
                        Book Store Orders
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-[#2B201A]">
                        {memberDetailsData.stats.totalOrdersCount}
                      </p>
                      <p className="text-[10px] text-[#2B201A]/50 mt-0.5">Purchased items</p>
                    </div>
                  </div>

                  {/* History Tabs */}
                  <div className="flex items-center gap-1.5 border-b border-[#E7D8C8] pb-1 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setHistoryTab("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        historyTab === "all"
                          ? "bg-[#E86F1D] text-white shadow-2xs"
                          : "text-[#2B201A]/70 hover:bg-[#FAF6F0]"
                      }`}
                    >
                      All Records (
                      {memberDetailsData.history.eventPasses.length +
                        memberDetailsData.history.generalDonations.length +
                        memberDetailsData.history.membershipDonations.length +
                        memberDetailsData.history.orders.length}
                      )
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryTab("events")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        historyTab === "events"
                          ? "bg-[#E86F1D] text-white shadow-2xs"
                          : "text-[#2B201A]/70 hover:bg-[#FAF6F0]"
                      }`}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Event Passes ({memberDetailsData.history.eventPasses.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryTab("donations")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        historyTab === "donations"
                          ? "bg-[#E86F1D] text-white shadow-2xs"
                          : "text-[#2B201A]/70 hover:bg-[#FAF6F0]"
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>General Seva ({memberDetailsData.history.generalDonations.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryTab("memberships")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        historyTab === "memberships"
                          ? "bg-[#E86F1D] text-white shadow-2xs"
                          : "text-[#2B201A]/70 hover:bg-[#FAF6F0]"
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>
                        Membership Seva ({memberDetailsData.history.membershipDonations.length})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryTab("orders")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        historyTab === "orders"
                          ? "bg-[#E86F1D] text-white shadow-2xs"
                          : "text-[#2B201A]/70 hover:bg-[#FAF6F0]"
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Store Orders ({memberDetailsData.history.orders.length})</span>
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-3">
                    {/* EVENT PASSES */}
                    {(historyTab === "all" || historyTab === "events") &&
                      memberDetailsData.history.eventPasses.length > 0 && (
                        <div className="space-y-2">
                          {historyTab === "all" && (
                            <h4 className="text-xs font-bold text-[#2B201A]/80 uppercase tracking-wider flex items-center gap-1.5">
                              <Ticket className="w-3.5 h-3.5 text-[#E86F1D]" />
                              <span>Event Passes ({memberDetailsData.history.eventPasses.length})</span>
                            </h4>
                          )}
                          <div className="grid grid-cols-1 gap-2.5">
                            {memberDetailsData.history.eventPasses.map((pass) => (
                              <div
                                key={pass.donationId}
                                className="bg-[#FAF6F0]/40 border border-[#E7D8C8] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#E86F1D]/40 transition-colors"
                              >
                                <div className="space-y-1.5 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-bold text-[#2B201A] text-sm sm:text-base">
                                      {pass.event.title}
                                    </h5>
                                    {pass.event.titleHi && (
                                      <span className="text-xs text-[#2B201A]/60 font-medium">
                                        ({pass.event.titleHi})
                                      </span>
                                    )}
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                        pass.status === "VERIFIED"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-amber-50 text-amber-700 border-amber-200"
                                      }`}
                                    >
                                      {pass.status}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 text-xs text-[#2B201A]/70 flex-wrap">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5 text-[#E86F1D]" />
                                      <span>
                                        {new Date(pass.event.startDate).toLocaleDateString("en-IN", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-[#E86F1D]" />
                                      <span className="truncate max-w-[200px]">
                                        {pass.event.location}
                                      </span>
                                    </div>
                                    <span className="text-[#2B201A]/40">•</span>
                                    <span className="font-bold text-[#E86F1D]">
                                      ₹{(pass.amountPaise / 100).toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-[#2B201A]/40">•</span>
                                    <span className="text-[11px] font-mono text-[#2B201A]/60">
                                      ID: {pass.donationId}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E7D8C8]/60">
                                  <a
                                    href={pass.passUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-[#E86F1D] hover:bg-[#D45A0E] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                                  >
                                    <Ticket className="w-3.5 h-3.5" />
                                    <span>View Pass</span>
                                  </a>
                                  <a
                                    href={pass.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="px-3 py-1.5 rounded-lg bg-white border border-[#E7D8C8] hover:bg-[#FAF6F0] text-[#2B201A] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5 text-[#E86F1D]" />
                                    <span>PDF</span>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* GENERAL DONATIONS */}
                    {(historyTab === "all" || historyTab === "donations") &&
                      memberDetailsData.history.generalDonations.length > 0 && (
                        <div className="space-y-2">
                          {historyTab === "all" && (
                            <h4 className="text-xs font-bold text-[#2B201A]/80 uppercase tracking-wider flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-[#E86F1D]" />
                              <span>
                                General Donations ({memberDetailsData.history.generalDonations.length})
                              </span>
                            </h4>
                          )}
                          <div className="grid grid-cols-1 gap-2.5">
                            {memberDetailsData.history.generalDonations.map((don) => (
                              <div
                                key={don.donationId}
                                className="bg-[#FAF6F0]/40 border border-[#E7D8C8] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#E86F1D]/40 transition-colors"
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-bold text-[#2B201A] text-sm">
                                      {don.program}
                                    </h5>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                        don.status === "VERIFIED"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-amber-50 text-amber-700 border-amber-200"
                                      }`}
                                    >
                                      {don.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-[#2B201A]/70 flex-wrap">
                                    <span className="font-bold text-[#E86F1D]">
                                      ₹{(don.amountPaise / 100).toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-[#2B201A]/40">•</span>
                                    <span>
                                      {new Date(don.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                    {don.utr && (
                                      <>
                                        <span className="text-[#2B201A]/40">•</span>
                                        <span className="font-mono text-[11px]">UTR: {don.utr}</span>
                                      </>
                                    )}
                                    <span className="text-[#2B201A]/40">•</span>
                                    <span className="font-mono text-[11px] text-[#2B201A]/50">
                                      Ref: {don.donationId}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E7D8C8]/60">
                                  <a
                                    href={don.certificateUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-white border border-[#E7D8C8] hover:bg-[#FAF6F0] text-[#2B201A] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#E86F1D]" />
                                    <span>Certificate</span>
                                  </a>
                                  <a
                                    href={don.certificatePdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="px-3 py-1.5 rounded-lg bg-white border border-[#E7D8C8] hover:bg-[#FAF6F0] text-[#2B201A] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5 text-[#E86F1D]" />
                                    <span>PDF</span>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* MEMBERSHIP TRANSACTIONS */}
                    {(historyTab === "all" || historyTab === "memberships") &&
                      memberDetailsData.history.membershipDonations.length > 0 && (
                        <div className="space-y-2">
                          {historyTab === "all" && (
                            <h4 className="text-xs font-bold text-[#2B201A]/80 uppercase tracking-wider flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-[#E86F1D]" />
                              <span>
                                Membership Subscriptions (
                                {memberDetailsData.history.membershipDonations.length})
                              </span>
                            </h4>
                          )}
                          <div className="grid grid-cols-1 gap-2.5">
                            {memberDetailsData.history.membershipDonations.map((mDon) => (
                              <div
                                key={mDon.donationId}
                                className="bg-[#FAF6F0]/40 border border-[#E7D8C8] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#E86F1D]/40 transition-colors"
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-bold text-[#2B201A] text-sm">
                                      {mDon.program || "Trust Membership Plan"}
                                    </h5>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                        mDon.status === "VERIFIED"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-amber-50 text-amber-700 border-amber-200"
                                      }`}
                                    >
                                      {mDon.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-[#2B201A]/70 flex-wrap">
                                    <span className="font-bold text-[#E86F1D]">
                                      ₹{(mDon.amountPaise / 100).toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-[#2B201A]/40">•</span>
                                    <span>
                                      {new Date(mDon.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                    {mDon.utr && (
                                      <>
                                        <span className="text-[#2B201A]/40">•</span>
                                        <span className="font-mono text-[11px]">UTR: {mDon.utr}</span>
                                      </>
                                    )}
                                    <span className="text-[#2B201A]/40">•</span>
                                    <span className="font-mono text-[11px] text-[#2B201A]/50">
                                      Ref: {mDon.donationId}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E7D8C8]/60">
                                  <a
                                    href={mDon.passUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-[#E86F1D] hover:bg-[#D45A0E] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                                  >
                                    <Ticket className="w-3.5 h-3.5" />
                                    <span>Devotee Pass</span>
                                  </a>
                                  <a
                                    href={mDon.certificateUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-white border border-[#E7D8C8] hover:bg-[#FAF6F0] text-[#2B201A] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#E86F1D]" />
                                    <span>Certificate</span>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* ORDERS */}
                    {(historyTab === "all" || historyTab === "orders") &&
                      memberDetailsData.history.orders.length > 0 && (
                        <div className="space-y-2">
                          {historyTab === "all" && (
                            <h4 className="text-xs font-bold text-[#2B201A]/80 uppercase tracking-wider flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-[#E86F1D]" />
                              <span>Store Orders ({memberDetailsData.history.orders.length})</span>
                            </h4>
                          )}
                          <div className="grid grid-cols-1 gap-2.5">
                            {memberDetailsData.history.orders.map((ord) => (
                              <div
                                key={ord.id}
                                className="bg-[#FAF6F0]/40 border border-[#E7D8C8] rounded-2xl p-4 space-y-2"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <span className="font-mono font-bold text-xs text-[#2B201A]">
                                      Order #{ord.orderNumber}
                                    </span>
                                    <span className="text-xs text-[#2B201A]/60 ml-2">
                                      {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#E86F1D]">
                                      ₹{ord.totalAmount.toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                                      {ord.status}
                                    </span>
                                  </div>
                                </div>
                                {ord.items.length > 0 && (
                                  <div className="text-xs text-[#2B201A]/70 divide-y divide-[#E7D8C8]/40 border-t border-[#E7D8C8]/60 pt-2">
                                    {ord.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="py-1 flex items-center justify-between gap-2"
                                      >
                                        <span className="truncate">{item.title}</span>
                                        <span className="font-mono text-[#2B201A]/60 shrink-0">
                                          qty {item.quantity} × ₹{item.price}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* EMPTY STATE */}
                    {memberDetailsData.history.eventPasses.length === 0 &&
                      memberDetailsData.history.generalDonations.length === 0 &&
                      memberDetailsData.history.membershipDonations.length === 0 &&
                      memberDetailsData.history.orders.length === 0 && (
                        <div className="py-10 text-center text-[#2B201A]/60 bg-[#FAF6F0]/50 rounded-2xl border border-dashed border-[#E7D8C8]">
                          <Award className="w-8 h-8 mx-auto text-[#2B201A]/30 mb-2" />
                          <p className="text-xs font-bold text-[#2B201A]">No activity found yet</p>
                          <p className="text-[11px] text-[#2B201A]/60 mt-0.5">
                            This member has not purchased any event passes or donations under this email/phone.
                          </p>
                        </div>
                      )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAF6F0] px-5 sm:px-6 py-3 border-t border-[#E7D8C8] flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const m = viewingMember;
                  setViewingMember(null);
                  handleOpenEdit(m);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-[#E7D8C8] bg-white hover:bg-[#FAF6F0] text-[#2B201A] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#E86F1D]" />
                <span>Edit Member Details</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="px-4 py-1.5 rounded-xl bg-[#2B201A] hover:bg-[#3D2D24] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: REMOVE MEMBER */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto border border-[#E7D8C8] shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-editorial text-xl font-bold text-[#2B201A]">
                Remove Member?
              </h3>
              <p className="text-xs sm:text-sm text-[#2B201A]/70">
                Are you sure you want to remove{" "}
                <span className="font-bold text-[#2B201A]">{memberToDelete.name}</span>?
                Their membership record, active tier privileges, and admin dashboard membership entry will be permanently removed. The devotee will become a normal user and can apply again anytime.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E7D8C8] text-xs font-bold text-[#2B201A]/80 hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteMember}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Yes, Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

