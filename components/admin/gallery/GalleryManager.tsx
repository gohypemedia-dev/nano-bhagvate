"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Upload,
  Film,
  Image as ImageIcon,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  X,
  Loader2,
  Eye,
  SlidersHorizontal,
  Link as LinkIcon,
  CloudUpload,
  RefreshCw,
} from "lucide-react";

export interface AdminGalleryItem {
  id: string;
  type: "PHOTO" | "VIDEO";
  title: string;
  titleHi?: string | null;
  event?: string | null;
  eventHi?: string | null;
  src: string;
  thumbnail: string;
  alt: string;
  videoProvider?: string | null;
  focalPoint?: string | null;
  aspectRatio?: string | null;
  displayOrder: number;
  date?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface GalleryManagerProps {
  initialItems: AdminGalleryItem[];
  r2Configured: boolean;
  r2PublicUrl: string;
}

const CATEGORIES = [
  { en: "Gurukul Initiative", hi: "गुरुकुल पहल" },
  { en: "Spiritual Discourse", hi: "सत्संग एवं कथा" },
  { en: "Farmer Welfare", hi: "कृषि कल्याण" },
  { en: "Healthcare Seva", hi: "स्वास्थ्य सेवा" },
  { en: "Women Empowerment", hi: "महिला सशक्तिकरण" },
  { en: "Spiritual Utsav", hi: "आध्यात्मिक उत्सव" },
  { en: "Trust Parivar", hi: "ट्रस्ट परिवार" },
  { en: "Annadanam Seva", hi: "अन्नदान सेवा" },
];

export default function GalleryManager({
  initialItems,
  r2Configured,
  r2PublicUrl,
}: GalleryManagerProps) {
  const [items, setItems] = useState<AdminGalleryItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"all" | "PHOTO" | "VIDEO">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminGalleryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingUpload, setIsDeletingUpload] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Source selection: "link" (fetch directly from external url) vs "upload" (save to Cloudflare R2)
  const [sourceMode, setSourceMode] = useState<"link" | "upload">("upload");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    type: "PHOTO" as "PHOTO" | "VIDEO",
    title: "",
    titleHi: "",
    event: "Gurukul Initiative",
    eventHi: "गुरुकुल पहल",
    src: "",
    thumbnail: "",
    alt: "",
    videoProvider: "youtube" as "youtube" | "vimeo" | "mp4",
    focalPoint: "center",
    displayOrder: 1,
    date: "",
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (activeTab !== "all" && item.type !== activeTab) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.titleHi && item.titleHi.toLowerCase().includes(q)) ||
          (item.event && item.event.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [items, activeTab, searchQuery]);

  // Open Modal to Add
  const handleOpenAdd = () => {
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.displayOrder)) + 1 : 1;
    setEditingItem(null);
    setShowMoreFields(false);
    setSourceMode("upload");
    setFormData({
      type: "PHOTO",
      title: "",
      titleHi: "",
      event: "Gurukul Initiative",
      eventHi: "गुरुकुल पहल",
      src: "",
      thumbnail: "",
      alt: "",
      videoProvider: "youtube",
      focalPoint: "center",
      displayOrder: nextOrder,
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    });
    setIsModalOpen(true);
  };

  // Open Modal to Edit
  const handleOpenEdit = (item: AdminGalleryItem) => {
    setEditingItem(item);
    setShowMoreFields(Boolean(item.titleHi || item.date || item.focalPoint !== "center"));

    // Check if the current src is an uploaded R2 asset or a link
    const isR2Asset = item.src.includes(".r2.dev/") || item.thumbnail.includes(".r2.dev/");
    const isLinkMode = item.type === "VIDEO" ? item.videoProvider !== "mp4" && !isR2Asset : !isR2Asset && item.src.startsWith("http");

    setSourceMode(isLinkMode ? "link" : "upload");

    setFormData({
      type: item.type,
      title: item.title,
      titleHi: item.titleHi || "",
      event: item.event || "Gurukul Initiative",
      eventHi: item.eventHi || "",
      src: item.src,
      thumbnail: item.thumbnail,
      alt: item.alt,
      videoProvider: (item.videoProvider as "youtube" | "vimeo" | "mp4") || "youtube",
      focalPoint: item.focalPoint || "center",
      displayOrder: item.displayOrder,
      date: item.date || "",
    });
    setIsModalOpen(true);
  };

  // Upload file (Photo or Video) directly to Cloudflare R2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVideoFile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append("file", file);

    // Pass oldUrl to delete old upload on Cloudflare R2 when replacing
    const oldAssetUrl = isVideoFile ? formData.src : formData.thumbnail;
    if (oldAssetUrl && (oldAssetUrl.includes(".r2.dev/") || oldAssetUrl.includes("gallery/"))) {
      body.append("oldUrl", oldAssetUrl);
    }

    try {
      const res = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (isVideoFile || data.isVideo) {
        setFormData((prev) => ({
          ...prev,
          type: "VIDEO",
          src: data.url,
          videoProvider: "mp4",
          // Fallback thumbnail if none set yet
          thumbnail: prev.thumbnail || `${r2PublicUrl}/gallery/initiative-health.jpg`,
          alt: prev.alt || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "),
        }));
        showToast("Video uploaded to Cloudflare R2!");
      } else {
        setFormData((prev) => ({
          ...prev,
          src: prev.type === "PHOTO" ? data.url : prev.src,
          thumbnail: data.url,
          alt: prev.alt || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "),
        }));
        showToast("Photo uploaded to Cloudflare R2!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      showToast(msg, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    }
  };

  // Delete current upload from Cloudflare R2
  const handleDeleteCurrentUpload = async () => {
    const urlToDelete = formData.type === "VIDEO" && formData.videoProvider === "mp4" ? formData.src : formData.thumbnail;
    if (!urlToDelete) return;

    if (!confirm("Are you sure you want to delete this uploaded file?")) return;

    setIsDeletingUpload(true);
    try {
      if (urlToDelete.includes(".r2.dev/") || urlToDelete.includes("gallery/")) {
        await fetch("/api/admin/gallery/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToDelete }),
        });
      }

      setFormData((prev) => ({
        ...prev,
        src: prev.type === "PHOTO" ? "" : (prev.videoProvider === "mp4" ? "" : prev.src),
        thumbnail: "",
      }));

      showToast("Uploaded file removed. You can now add a new upload.");
    } catch {
      showToast("Failed to remove uploaded file", "error");
    } finally {
      setIsDeletingUpload(false);
    }
  };

  // Handle external video or image URL change (No R2 upload)
  const handleLinkChange = (url: string) => {
    let provider: "youtube" | "vimeo" | "mp4" = "youtube";
    let thumb = formData.thumbnail;

    if (formData.type === "VIDEO") {
      if (url.includes("vimeo.com")) {
        provider = "vimeo";
      } else if (url.endsWith(".mp4") || url.includes(".mp4?")) {
        provider = "mp4";
      } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
        provider = "youtube";
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (ytMatch && ytMatch[1] && (!thumb || thumb.includes("youtube.com"))) {
          thumb = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        }
      }

      setFormData((prev) => ({
        ...prev,
        src: url,
        videoProvider: provider,
        thumbnail: thumb || prev.thumbnail || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800",
      }));
    } else {
      // Photo link
      setFormData((prev) => ({
        ...prev,
        src: url,
        thumbnail: url,
      }));
    }
  };

  // Save Item
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please enter a title for the media.", "error");
      return;
    }
    if (!formData.thumbnail.trim() && !formData.src.trim()) {
      showToast(formData.type === "PHOTO" ? "Please upload a photo or provide a link." : "Please upload a video or provide a link.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type: formData.type,
        title: formData.title,
        titleHi: formData.titleHi || null,
        event: formData.event || null,
        eventHi: formData.eventHi || null,
        src: formData.src || formData.thumbnail,
        thumbnail: formData.thumbnail || formData.src,
        alt: formData.alt || formData.title,
        videoProvider: formData.type === "VIDEO" ? formData.videoProvider : null,
        focalPoint: formData.focalPoint || "center",
        aspectRatio: formData.type === "VIDEO" ? "16/9" : null,
        displayOrder: Number(formData.displayOrder) || 1,
        date: formData.date || null,
      };

      if (editingItem) {
        const res = await fetch(`/api/admin/gallery/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");

        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? data.item : i))
        );
        showToast("Changes saved!");
      } else {
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Creation failed");

        setItems((prev) => [...prev, data.item]);
        showToast("Added to Gallery!");
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Item
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Item deleted.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete error";
      showToast(msg, "error");
    }
  };

  // Move Order Up or Down
  const handleMoveOrder = async (item: AdminGalleryItem, direction: "up" | "down") => {
    const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex((i) => i.id === item.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetItem = sorted[targetIndex];
    const newCurrentOrder = targetItem.displayOrder;
    const newTargetOrder = item.displayOrder;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id) return { ...i, displayOrder: newCurrentOrder };
        if (i.id === targetItem.id) return { ...i, displayOrder: newTargetOrder };
        return i;
      })
    );

    try {
      await Promise.all([
        fetch(`/api/admin/gallery/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: newCurrentOrder }),
        }),
        fetch(`/api/admin/gallery/${targetItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: newTargetOrder }),
        }),
      ]);
    } catch {
      showToast("Failed to reorder", "error");
    }
  };

  const hasExistingUpload = Boolean(
    (formData.type === "PHOTO" && formData.thumbnail) ||
    (formData.type === "VIDEO" && (formData.videoProvider === "mp4" || formData.src.includes(".r2.dev/")))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* TOAST MESSAGE */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-[#2B201A] text-white border-[#E86F1D]"
              : "bg-red-600 text-white border-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4 text-[#E86F1D]" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* CLEAN TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7D8C8] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A]">
              Gallery Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloudflare R2 Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#2B201A]/65">
            {items.length} media items on the Namo Bhagwate website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#E7D8C8] hover:bg-[#FAF6F0] text-xs font-bold text-[#2B201A] transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#B8893E]" />
            <span>View Website</span>
          </a>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E86F1D] hover:bg-[#D25E12] text-white rounded-xl text-xs sm:text-sm font-bold shadow-warm-sm hover:shadow-warm-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Media</span>
          </button>
        </div>
      </div>

      {/* FILTER BUTTONS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 bg-white rounded-xl border border-[#E7D8C8] self-start">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-[#2B201A] text-white shadow-xs"
                : "text-[#2B201A]/70 hover:text-[#2B201A]"
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("PHOTO")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "PHOTO"
                ? "bg-[#2B201A] text-white shadow-xs"
                : "text-[#2B201A]/70 hover:text-[#2B201A]"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#B8893E]" />
            <span>Photos ({items.filter((i) => i.type === "PHOTO").length})</span>
          </button>
          <button
            onClick={() => setActiveTab("VIDEO")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "VIDEO"
                ? "bg-[#2B201A] text-white shadow-xs"
                : "text-[#2B201A]/70 hover:text-[#2B201A]"
            }`}
          >
            <Film className="w-3.5 h-3.5 text-[#E86F1D]" />
            <span>Videos ({items.filter((i) => i.type === "VIDEO").length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#2B201A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or category..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-[#E7D8C8] focus:border-[#E86F1D] focus:outline-none"
          />
        </div>
      </div>

      {/* GALLERY GRID */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7D8C8] p-12 text-center space-y-3">
          <ImageIcon className="w-10 h-10 text-[#B8893E]/40 mx-auto" />
          <p className="text-sm font-bold text-[#2B201A]">No media found</p>
          <p className="text-xs text-[#2B201A]/60">Click &ldquo;Add New Media&rdquo; above to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, idx) => {
            const isVideo = item.type === "VIDEO";
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E7D8C8] overflow-hidden flex flex-col justify-between hover:shadow-warm-sm transition-all group"
              >
                <div>
                  {/* Image/Video Preview with Order & Reorder Controls */}
                  <div className="relative aspect-[16/10] w-full bg-[#EFE4D6] overflow-hidden">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      unoptimized={item.thumbnail.startsWith("http")}
                      className="object-cover group-hover:scale-103 transition-transform duration-300"
                      style={{ objectPosition: item.focalPoint || "center" }}
                    />

                    {/* Order Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 text-white text-[11px] font-bold font-mono">
                      #{item.displayOrder}
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/95 text-[#2B201A] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      {isVideo ? (
                        <>
                          <Film className="w-3 h-3 text-[#E86F1D]" />
                          <span>Video</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3 text-[#B8893E]" />
                          <span>Photo</span>
                        </>
                      )}
                    </div>

                    {/* Reorder Buttons directly on preview */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1">
                      <button
                        onClick={() => handleMoveOrder(item, "up")}
                        disabled={idx === 0}
                        title="Move higher on website"
                        className="w-7 h-7 rounded-lg bg-black/75 hover:bg-black text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(item, "down")}
                        disabled={idx === filteredItems.length - 1}
                        title="Move lower on website"
                        className="w-7 h-7 rounded-lg bg-black/75 hover:bg-black text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-1.5">
                    {item.event && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#B8893E]">
                        {item.event}
                      </span>
                    )}

                    <h3 className="font-editorial text-base font-bold text-[#2B201A] line-clamp-1">
                      {item.title}
                    </h3>

                    {item.titleHi && (
                      <p className="text-xs text-[#2B201A]/70 line-clamp-1">
                        {item.titleHi}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-4 py-3 bg-[#FAF6F0] border-t border-[#E7D8C8] flex items-center justify-between">
                  <span className="text-[11px] text-[#2B201A]/50">
                    {item.src.includes(".r2.dev/") ? "Cloudflare R2" : "Web Link"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-2.5 py-1 rounded-lg border border-[#E7D8C8] text-xs font-semibold text-[#2B201A]/80 hover:text-[#E86F1D] hover:bg-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="px-2.5 py-1 rounded-lg border border-[#E7D8C8] text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT POP-UP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E7D8C8] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#FAF6F0] border-b border-[#E7D8C8] flex items-center justify-between">
              <div>
                <h2 className="font-editorial text-xl font-bold text-[#2B201A]">
                  {editingItem ? "Edit Media" : "Add to Gallery"}
                </h2>
                <p className="text-xs text-[#2B201A]/60">Choose upload to Cloudflare R2 or use an external link.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#2B201A]/60 hover:text-[#2B201A] hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              
              {/* Media Type Switcher: Photo or Video */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1.5">
                  1. Select Media Type
                </label>
                <div className="flex p-1 bg-[#FAF6F0] rounded-xl border border-[#E7D8C8]">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((p) => ({ ...p, type: "PHOTO" }));
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.type === "PHOTO"
                        ? "bg-white text-[#2B201A] shadow-xs"
                        : "text-[#2B201A]/60 hover:text-[#2B201A]"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#B8893E]" />
                    <span>Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((p) => ({ ...p, type: "VIDEO" }));
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.type === "VIDEO"
                        ? "bg-white text-[#2B201A] shadow-xs"
                        : "text-[#2B201A]/60 hover:text-[#2B201A]"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5 text-[#E86F1D]" />
                    <span>Video</span>
                  </button>
                </div>
              </div>

              {/* Source Mode: Upload to R2 vs Use External Link */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2B201A]/70 mb-1.5">
                  2. Choose Source Option
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceMode("upload")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      sourceMode === "upload"
                        ? "bg-[#2B201A] text-white border-[#2B201A] shadow-xs"
                        : "bg-white text-[#2B201A]/70 border-[#E7D8C8] hover:bg-[#FAF6F0]"
                    }`}
                  >
                    <CloudUpload className="w-3.5 h-3.5 text-[#E86F1D]" />
                    <span>Upload to Cloudflare R2</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceMode("link")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      sourceMode === "link"
                        ? "bg-[#2B201A] text-white border-[#2B201A] shadow-xs"
                        : "bg-white text-[#2B201A]/70 border-[#E7D8C8] hover:bg-[#FAF6F0]"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-[#B8893E]" />
                    <span>Use Web Link (No R2)</span>
                  </button>
                </div>
              </div>

              {/* OPTION A: UPLOAD TO CLOUDFLARE R2 */}
              {sourceMode === "upload" && (
                <div className="space-y-2 bg-[#FFF9F2] p-3.5 rounded-xl border border-[#E7D8C8]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2B201A]">
                      {formData.type === "PHOTO" ? "Photo Upload (R2)" : "Video Upload (MP4 to R2)"}
                    </span>
                    {hasExistingUpload && (
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        File active on Cloudflare
                      </span>
                    )}
                  </div>

                  {/* Hidden file inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden"
                    id="modal-upload-photo"
                  />
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={(e) => handleFileUpload(e, true)}
                    className="hidden"
                    id="modal-upload-video"
                  />

                  {/* If there is an existing uploaded file: show preview + "Delete old upload" + "Add new upload" */}
                  {formData.thumbnail ? (
                    <div className="space-y-3">
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-[#E7D8C8] bg-black">
                        {formData.type === "VIDEO" && formData.videoProvider === "mp4" ? (
                          <video src={formData.src} controls className="w-full h-full object-contain" />
                        ) : (
                          <Image
                            src={formData.thumbnail}
                            alt="Current upload preview"
                            fill
                            unoptimized={formData.thumbnail.startsWith("http")}
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* ACTION BUTTONS: Delete old upload & Add new upload */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleDeleteCurrentUpload}
                          disabled={isDeletingUpload}
                          className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {isDeletingUpload ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete Old Upload</span>
                        </button>

                        <label
                          htmlFor={formData.type === "PHOTO" ? "modal-upload-photo" : "modal-upload-video"}
                          className="px-3.5 py-1.5 rounded-lg bg-[#E86F1D] hover:bg-[#D25E12] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Replace / Add New Upload</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    /* EMPTY DROPZONE: Add new upload */
                    <label
                      htmlFor={formData.type === "PHOTO" ? "modal-upload-photo" : "modal-upload-video"}
                      className="border-2 border-dashed border-[#E7D8C8] hover:border-[#E86F1D] rounded-xl p-6 bg-white flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-7 h-7 text-[#E86F1D] animate-spin" />
                          <span className="text-xs font-bold text-[#2B201A]">
                            Uploading to Cloudflare R2...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E7D8C8] flex items-center justify-center text-[#E86F1D]">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-bold text-[#E86F1D]">
                              {formData.type === "PHOTO" ? "Click to choose Photo" : "Click to choose Video (MP4)"}
                            </span>
                            <p className="text-[11px] text-[#2B201A]/50 mt-0.5">
                              {formData.type === "PHOTO"
                                ? "JPG, PNG, or WebP. Saves to Cloudflare R2."
                                : "MP4, WebM, or MOV up to 100MB. Saves to Cloudflare R2."}
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  )}
                </div>
              )}

              {/* OPTION B: USE WEB LINK (No Cloudflare upload needed) */}
              {sourceMode === "link" && (
                <div className="space-y-2 bg-[#FAF6F0] p-3.5 rounded-xl border border-[#E7D8C8]">
                  <label className="block text-xs font-bold text-[#2B201A]">
                    {formData.type === "PHOTO" ? "Image URL Link" : "Video URL (YouTube or Vimeo Link)"}
                  </label>
                  <input
                    type="url"
                    value={formData.src}
                    onChange={(e) => handleLinkChange(e.target.value)}
                    placeholder={
                      formData.type === "PHOTO"
                        ? "https://example.com/photo.jpg"
                        : "https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#E7D8C8] focus:border-[#E86F1D] focus:outline-none"
                  />
                  <p className="text-[11px] text-[#2B201A]/60">
                    Fetched directly from this link. No storage used on Cloudflare.
                  </p>

                  {formData.thumbnail && (
                    <div className="relative aspect-[16/9] w-36 rounded-lg overflow-hidden border border-[#E7D8C8] mt-2">
                      <Image
                        src={formData.thumbnail}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TITLE */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2B201A]">
                  Title (शीर्षक) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Divine Satsang & Katha"
                  className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#E7D8C8] focus:border-[#E86F1D] focus:outline-none"
                />
              </div>

              {/* CATEGORY DROPDOWN */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2B201A]">
                  Category / Event
                </label>
                <select
                  value={formData.event || ""}
                  onChange={(e) => {
                    const selected = CATEGORIES.find((c) => c.en === e.target.value);
                    setFormData((p) => ({
                      ...p,
                      event: e.target.value,
                      eventHi: selected ? selected.hi : p.eventHi,
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#E7D8C8] focus:border-[#E86F1D] focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.en} value={cat.en}>
                      {cat.en} ({cat.hi})
                    </option>
                  ))}
                </select>
              </div>

              {/* OPTIONAL EXPANDABLE SETTINGS (Hindi title, date, order) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowMoreFields(!showMoreFields)}
                  className="text-xs font-semibold text-[#E86F1D] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{showMoreFields ? "Hide extra details" : "Add Hindi title or change date / order"}</span>
                </button>

                {showMoreFields && (
                  <div className="mt-3 p-3.5 bg-[#FAF6F0] rounded-xl border border-[#E7D8C8] space-y-3 animate-in fade-in duration-150">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#2B201A]/70">
                        Hindi Title (हिंदी शीर्षक)
                      </label>
                      <input
                        type="text"
                        value={formData.titleHi}
                        onChange={(e) => setFormData((p) => ({ ...p, titleHi: e.target.value }))}
                        placeholder="उदा. श्रीमद्भागवत कथा ज्ञान यज्ञ"
                        className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#E7D8C8] focus:border-[#E86F1D] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#2B201A]/70">
                          Date / Month
                        </label>
                        <input
                          type="text"
                          value={formData.date}
                          onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                          placeholder="e.g. October 2026"
                          className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#E7D8C8] focus:border-[#E86F1D] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#2B201A]/70">
                          Order Number
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.displayOrder}
                          onChange={(e) => setFormData((p) => ({ ...p, displayOrder: Number(e.target.value) }))}
                          className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#E7D8C8] focus:border-[#E86F1D] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 border-t border-[#E7D8C8] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E7D8C8] text-xs font-bold text-[#2B201A]/70 hover:bg-[#FAF6F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading || isDeletingUpload}
                  className="px-6 py-2 rounded-xl bg-[#E86F1D] hover:bg-[#D25E12] text-white text-xs font-bold shadow-warm-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? "Save Changes" : "Add to Gallery"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
