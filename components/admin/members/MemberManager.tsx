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
                  <th className="py-3 px-4 sm:px-5 text-right w-24">Actions</th>
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
                    <tr key={member.id} className="hover:bg-[#FFFDF9] transition-colors">
                      {/* Name & Role */}
                      <td className="py-3 px-4 sm:px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FAF3EA] border border-[#E7D8C8] text-[#E86F1D] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#2B201A] text-xs sm:text-sm truncate">{member.name}</p>
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

                      {/* Edit & Remove Actions */}
                      <td className="py-3 px-4 sm:px-5 text-right w-24">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 rounded-lg text-[#2B201A]/60 hover:text-[#E86F1D] hover:bg-[#FAF3EA] transition-colors cursor-pointer"
                            title="Edit member details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Remove Member */}
                          <button
                            type="button"
                            onClick={() => setMemberToDelete(member)}
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

