"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export interface AdminEventItem {
  id: string;
  slug: string;
  title: string;
  titleHi?: string | null;
  summary: string;
  summaryHi?: string | null;
  description: string;
  startDate: string;
  endDate?: string | null;
  timeText?: string | null;
  location: string;
  address?: string | null;
  mapUrl?: string | null;
  image?: string | null;
  contactPhone?: string | null;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface EventManagerProps {
  initialEvents: AdminEventItem[];
}

export default function EventManager({ initialEvents }: EventManagerProps) {
  const [events, setEvents] = useState<AdminEventItem[]>(initialEvents);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEventItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    titleHi: "",
    slug: "",
    summary: "",
    summaryHi: "",
    description: "",
    startDate: "",
    endDate: "",
    timeText: "",
    location: "",
    address: "",
    mapUrl: "",
    contactPhone: "",
    isPublished: true,
  });

  const openAddModal = () => {
    setEditingEvent(null);
    setFormError(null);
    setFormData({
      title: "",
      titleHi: "",
      slug: "",
      summary: "Join us for sacred discourses, divine bhajans, and community seva.",
      summaryHi: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      timeText: "4:00 PM – 7:30 PM IST Daily",
      location: "",
      address: "",
      mapUrl: "",
      contactPhone: "+91 9910762692",
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (event: AdminEventItem) => {
    setEditingEvent(event);
    setFormError(null);
    setFormData({
      title: event.title,
      titleHi: event.titleHi || "",
      slug: event.slug,
      summary: event.summary,
      summaryHi: event.summaryHi || "",
      description: event.description || "",
      startDate: event.startDate ? event.startDate.split("T")[0] : "",
      endDate: event.endDate ? event.endDate.split("T")[0] : "",
      timeText: event.timeText || "",
      location: event.location,
      address: event.address || "",
      mapUrl: event.mapUrl || "",
      contactPhone: event.contactPhone || "",
      isPublished: event.isPublished,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const titleTrimmed = formData.title.trim();
    if (!titleTrimmed) {
      setFormError("Please enter an event title.");
      toast.error("Please enter an event title");
      return;
    }
    if (!formData.startDate) {
      setFormError("Please select an event start date.");
      toast.error("Please enter an event start date");
      return;
    }
    const locationTrimmed = formData.location.trim();
    if (!locationTrimmed) {
      setFormError("Please enter an event venue / location.");
      toast.error("Please enter a location");
      return;
    }
    const summaryTrimmed = formData.summary.trim() || titleTrimmed;

    // Clean map URL
    let cleanedMapUrl = formData.mapUrl.trim();
    if (cleanedMapUrl && !/^https?:\/\//i.test(cleanedMapUrl)) {
      cleanedMapUrl = `https://${cleanedMapUrl}`;
    }

    const payload = {
      ...formData,
      slug: formData.slug?.trim() ? formData.slug.trim() : undefined,
      title: titleTrimmed,
      location: locationTrimmed,
      summary: summaryTrimmed,
      mapUrl: cleanedMapUrl,
    };

    setSaving(true);
    try {
      if (editingEvent) {
        // Update existing
        const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to update event");

        const updated: AdminEventItem = {
          ...result.event,
          startDate: new Date(result.event.startDate).toISOString(),
          endDate: result.event.endDate ? new Date(result.event.endDate).toISOString() : null,
        };

        setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)));
        toast.success("Event updated successfully!");
      } else {
        // Create new
        const res = await fetch(`/api/admin/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to create event");

        const created: AdminEventItem = {
          ...result.event,
          startDate: new Date(result.event.startDate).toISOString(),
          endDate: result.event.endDate ? new Date(result.event.endDate).toISOString() : null,
        };

        setEvents((prev) => [created, ...prev]);
        toast.success("Event created successfully!");
      }
      closeModal();
    } catch (err: any) {
      const msg = err.message || "Failed to save event";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the event "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete event");
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      toast.success("Event deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (event: AdminEventItem) => {
    const nextState = !event.isPublished;
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextState }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setEvents((prev) =>
        prev.map((ev) => (ev.id === event.id ? { ...ev, isPublished: nextState } : ev))
      );
      toast.success(nextState ? "Event published!" : "Event marked as draft!");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.titleHi && ev.titleHi.includes(searchQuery)) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.summary.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterPublished === "published") return ev.isPublished;
    if (filterPublished === "draft") return !ev.isPublished;
    return true;
  });

  const formatDateLabel = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7D8C8] shadow-xs">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A]">
            Event Management
          </h1>
          <p className="text-xs sm:text-sm text-[#2B201A]/70 mt-0.5">
            Manage upcoming spiritual discourses, camps, and celebrations shown on the website.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E7D8C8]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2B201A]/40" />
          <input
            type="text"
            placeholder="Search events by title, location, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-[#FFF9F2] focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {(["all", "published", "draft"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterPublished(mode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                filterPublished === mode
                  ? "bg-[#2B201A] text-white"
                  : "bg-[#FBF2E7] text-[#2B201A]/70 hover:bg-[#E7D8C8]"
              }`}
            >
              {mode} ({events.filter((e) => (mode === "all" ? true : mode === "published" ? e.isPublished : !e.isPublished)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E7D8C8] space-y-3">
          <Calendar className="w-10 h-10 mx-auto text-[#2B201A]/30" />
          <h3 className="text-base font-bold text-[#2B201A]">No events found</h3>
          <p className="text-xs text-[#2B201A]/60 max-w-sm mx-auto">
            {searchQuery ? "Try refining your search terms." : "Click 'Add New Event' to create your first event."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-[#E7D8C8] shadow-xs flex flex-col justify-between overflow-hidden hover:border-[#E86F1D]/50 transition-colors"
            >
              <div className="p-5 space-y-3.5">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block px-2.5 py-1 bg-[#E86F1D] text-white text-xs font-bold rounded-md">
                    {formatDateLabel(event.startDate)}
                  </span>
                  <button
                    onClick={() => handleTogglePublish(event)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
                      event.isPublished
                        ? "bg-[#2F5A43]/10 text-[#2F5A43] hover:bg-[#2F5A43]/20"
                        : "bg-[#B3261E]/10 text-[#B3261E] hover:bg-[#B3261E]/20"
                    }`}
                    title="Click to toggle publish status"
                  >
                    {event.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{event.isPublished ? "Published" : "Draft"}</span>
                  </button>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#2B201A] leading-snug">
                    {event.title}
                  </h3>
                  {event.titleHi && (
                    <p className="text-xs font-medium text-[#B8893E] mt-0.5">{event.titleHi}</p>
                  )}
                </div>

                {/* Location & Time */}
                <div className="space-y-1 text-xs text-[#2B201A]/80">
                  <p className="flex items-center gap-1.5 font-semibold text-[#B8893E]">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </p>
                  {event.timeText && (
                    <p className="flex items-center gap-1.5 text-[#2B201A]/70">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{event.timeText}</span>
                    </p>
                  )}
                </div>

                {/* Summary */}
                <p className="text-xs text-[#2B201A]/80 line-clamp-3 leading-relaxed">
                  {event.summary}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-[#FBF2E7]/60 border-t border-[#E7D8C8] flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(event)}
                  className="btn-outline text-xs py-1.5 px-3 flex-1 inline-flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(event.id, event.title)}
                  disabled={deletingId === event.id}
                  className="p-2 text-[#B3261E] hover:bg-[#B3261E]/10 rounded-lg transition-colors"
                  title="Delete event"
                >
                  {deletingId === event.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FFF9F2] rounded-2xl w-full max-h-[calc(100dvh-28px)] sm:max-h-[calc(100dvh-36px)] border border-[#E7D8C8] shadow-2xl relative flex flex-col overflow-hidden max-w-[640px]">
            {/* Modal Header */}
            <div className="bg-[#FBF2E7] px-5 py-4 border-b border-[#E7D8C8] flex items-center justify-between shrink-0">
              <h2 className="font-editorial text-xl font-bold text-[#2B201A]">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#2B201A]/60 hover:text-[#2B201A] hover:bg-[#2B201A]/5 rounded-full p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} noValidate className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3.5 bg-[#B3261E]/10 border border-[#B3261E]/20 text-[#B3261E] rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A] mb-1">
                    Event Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formError) setFormError(null);
                    }}
                    placeholder="e.g. Shrimad Bhagwat Katha"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-white focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A] mb-1">
                    Event Title (Hindi)
                  </label>
                  <input
                    type="text"
                    value={formData.titleHi}
                    onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                    placeholder="उदा. श्रीमद्भागवत कथा ज्ञान यज्ञ"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-white focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A] mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value });
                      if (formError) setFormError(null);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-white focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A] mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-white focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A] mb-1">
                    Timing / Daily Hours
                  </label>
                  <input
                    type="text"
                    value={formData.timeText}
                    onChange={(e) => setFormData({ ...formData, timeText: e.target.value })}
                    placeholder="e.g. 4:00 PM – 7:30 PM IST Daily"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-white focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A] mb-1">
                    Helpline / Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+91 9910762692"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-white focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A] mb-1">
                    Venue / Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      if (formError) setFormError(null);
                    }}
                    placeholder="e.g. Gurugram Ashram & Live Stream"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-white focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A] mb-1">
                    Google Maps Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.mapUrl}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-white focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A] mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State, Pincode"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-white focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A] mb-1">
                  Short Summary (Shown on Cards) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => {
                    setFormData({ ...formData, summary: e.target.value });
                    if (formError) setFormError(null);
                  }}
                  placeholder="Short description displayed on the homepage event card..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-white focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A] mb-1">
                  Detailed Description (Shown inside Popup)
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed schedule, discourse highlights, daily prasadam details..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E7D8C8] bg-white focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isPublishedCheck"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E7D8C8] text-[#E86F1D] focus:ring-[#E86F1D]"
                />
                <label htmlFor="isPublishedCheck" className="text-xs font-bold text-[#2B201A] cursor-pointer">
                  Publish to website immediately (Uncheck to save as Draft)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E7D8C8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingEvent ? "Update Event" : "Create Event"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
