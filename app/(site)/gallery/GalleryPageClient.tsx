"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Search,
  Play,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Film,
  Camera,
  Layers,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { galleryData, GalleryItem } from "@/data/gallery";
import GalleryModal from "@/components/gallery/GalleryModal";
import HeadingDivider from "@/components/HeadingDivider";

type MediaFilter = "all" | "photos" | "videos";

interface GalleryCardProps {
  item: GalleryItem;
  title: string;
  onOpen: (e: React.MouseEvent<HTMLElement>) => void;
  lang: string;
}

function GalleryCard({ item, title, onOpen, lang }: GalleryCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isVideo = item.type === "video";

  const handleMouseEnter = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  };

  const handleMouseLeave = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div
      onClick={onOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(e as any);
        }
      }}
      aria-label={`${lang === "hi" ? "देखें" : "View"}: ${title}`}
      className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#E7D8C8]/30 border border-[#E7D8C8] shadow-[0_4px_16px_-4px_rgba(43,32,26,0.1)] hover:shadow-[0_12px_28px_-6px_rgba(232,111,29,0.25)] hover:border-[#E86F1D] transition-all duration-300 block cursor-pointer select-none"
    >
      {/* Media: Video or Photo */}
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            src={item.src}
            poster={item.thumbnail}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-106"
          />

          {/* Centered Play Button (fades out when video plays on hover) */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${
              isPlaying ? "opacity-0 scale-75" : "opacity-100 scale-100"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#E86F1D]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#E86F1D] transition-transform duration-300">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        </>
      ) : (
        <Image
          src={item.thumbnail}
          alt={item.alt || title}
          fill
          loading="lazy"
          unoptimized={item.thumbnail.startsWith("http")}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-106"
          style={{ objectPosition: item.focalPoint || "center" }}
        />
      )}

      {/* Top subtle badge indicating type */}
      <div className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/55 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
        <Maximize2 className="w-3.5 h-3.5" />
      </div>

      {/* Bottom Translucent Frosted Glass Title Banner (Matching avsharyana.com photo gallery exactly) */}
      <div className="absolute bottom-0 inset-x-0 z-10 bg-black/65 backdrop-blur-xs py-2 sm:py-2.5 px-3 text-center border-t border-white/10 transition-colors duration-300 group-hover:bg-black/75">
        <p className="font-sans font-semibold italic text-xs sm:text-sm text-white drop-shadow-sm truncate tracking-wide">
          {title}
        </p>
      </div>
    </div>
  );
}

interface CuratedCategory {
  key: string;
  labelEn: string;
  labelHi: string;
  match: (item: GalleryItem) => boolean;
}

const CURATED_CATEGORIES: CuratedCategory[] = [
  {
    key: "spiritual-discourse",
    labelEn: "Spiritual Discourse & Satsang",
    labelHi: "कथा एवं पावन सत्संग",
    match: (i) =>
      /spiritual|satsang|gita|katha|aarti|darshan/i.test(i.event || "") ||
      /spiritual|satsang|gita|katha|discourse|aarti/i.test(i.title || ""),
  },
  {
    key: "community-seva",
    labelEn: "Community & Annadanam Seva",
    labelHi: "समाज सेवा एवं अन्नदान",
    match: (i) =>
      /community|annadanam|healthcare|parivar|seva/i.test(i.event || "") ||
      /community|annadanam|bhandara|healthcare|seva/i.test(i.title || ""),
  },
  {
    key: "vedic-gurukul",
    labelEn: "Vedic Gurukul & Sanskar",
    labelHi: "गुरुकुल एवं बाल संस्कार",
    match: (i) =>
      /gurukul|vedic|culture|sanskar/i.test(i.event || "") ||
      /gurukul|vedic|sanskar/i.test(i.title || ""),
  },
  {
    key: "bhakti-sankirtan",
    labelEn: "Bhakti Sankirtan & Utsav",
    labelHi: "भक्ति संकीर्तन एवं उत्सव",
    match: (i) =>
      /sankirtan|bhakti|harinaam|utsav/i.test(i.event || "") ||
      /sankirtan|bhakti|harinaam/i.test(i.title || ""),
  },
  {
    key: "gau-farmer-seva",
    labelEn: "Gau Seva & Farmer Welfare",
    labelHi: "गौ सेवा एवं किसान कल्याण",
    match: (i) =>
      /go seva|gau|farmer/i.test(i.event || "") ||
      /gau|cow|farmer|kisan/i.test(i.title || ""),
  },
  {
    key: "youth-women",
    labelEn: "Youth & Women Empowerment",
    labelHi: "महिला एवं युवा स्वावलंबन",
    match: (i) =>
      /youth|women|guidance|empowerment/i.test(i.event || "") ||
      /youth|women|swavalamban/i.test(i.title || ""),
  },
];

export default function GalleryPageClient({ initialItems }: { initialItems?: GalleryItem[] } = {}) {
  const { lang } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeMediaFilter, setActiveMediaFilter] = useState<MediaFilter>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const currentData = initialItems && initialItems.length > 0 ? initialItems : galleryData;

  // Sort and filter items using curated categories
  const filteredItems = useMemo(() => {
    let list = [...currentData].sort((a, b) => a.displayOrder - b.displayOrder);

    // Filter by curated category
    if (selectedCategory !== "all") {
      const activeCat = CURATED_CATEGORIES.find((c) => c.key === selectedCategory);
      if (activeCat) {
        list = list.filter(activeCat.match);
      }
    }

    // Filter by media type
    if (activeMediaFilter === "photos") {
      list = list.filter((i) => i.type === "photo");
    } else if (activeMediaFilter === "videos") {
      list = list.filter((i) => i.type === "video");
    }

    return list;
  }, [currentData, selectedCategory, activeMediaFilter]);

  // Pagination calculation
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, safeCurrentPage, pageSize]);

  const handleOpenPhoto = (item: GalleryItem, e: React.MouseEvent<HTMLElement>) => {
    lastTriggerRef.current = e.currentTarget;
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const currentIndex = selectedItem
    ? filteredItems.findIndex((i) => i.id === selectedItem.id)
    : -1;

  const handlePrevItem = () => {
    if (filteredItems.length === 0) return;
    const prevIdx = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedItem(filteredItems[prevIdx]);
  };

  const handleNextItem = () => {
    if (filteredItems.length === 0) return;
    const nextIdx = (currentIndex + 1) % filteredItems.length;
    setSelectedItem(filteredItems[nextIdx]);
  };

  // Generate page numbers array (with ellipsis for large page counts)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("...");
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (safeCurrentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="w-full bg-[#FFF9F2] min-h-screen py-10 sm:py-16">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* ==================================================================== */}
        {/* TWO-TONE HEADER: Our Gallery (Matching avsharyana.com photo gallery) */}
        {/* ==================================================================== */}
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-[#1E1612]">
              {lang === "hi" ? "हमारी " : "Our "}
            </span>
            <span className="text-[#E86F1D]">
              {lang === "hi" ? "गैलरी" : "Gallery"}
            </span>
          </h1>
          <HeadingDivider className="!py-1" />
          <p className="text-sm sm:text-base text-[#5C4D43] leading-relaxed font-sans">
            {lang === "hi"
              ? "हमारे पावन आयोजनों, सत्संग, गुरुकुल शिक्षा एवं जनकल्याणकारी सेवा कार्यों की दिव्य झलकियाँ।"
              : "A glimpse into the cherished moments, celebrations, and milestones that reflect the spirit and unity of our community."}
          </p>
        </div>

        {/* ==================================================================== */}
        {/* FILTER & SEARCH BAR (Matching avsharyana.com dropdown + search btn)  */}
        {/* ==================================================================== */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/70 p-4 sm:p-5 rounded-2xl border border-[#E7D8C8] shadow-xs">
          {/* Left: Category Dropdown & Search Button */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-72 min-w-[220px]">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-11 px-3.5 py-2 rounded-lg border border-[#E7D8C8] bg-white text-xs sm:text-sm font-medium text-[#1E1612] focus:border-[#E86F1D] focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="all">
                  {lang === "hi" ? "सभी श्रेणियां (All Categories)" : "Select Category / Title"}
                </option>
                {CURATED_CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {lang === "hi" ? cat.labelHi : cat.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="h-11 px-6 rounded-lg bg-[#EA580C] hover:bg-[#D45A0E] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{lang === "hi" ? "खोजें" : "Search"}</span>
            </button>
          </div>

          {/* Right: Media Type Filter Tabs (All / Photos / Videos) */}
          <div className="flex items-center gap-1 bg-[#FBF2E7] p-1 rounded-xl border border-[#E7D8C8]/80 w-full md:w-auto justify-center">
            <button
              type="button"
              onClick={() => {
                setActiveMediaFilter("all");
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMediaFilter === "all"
                  ? "bg-[#EA580C] text-white shadow-xs"
                  : "text-[#5C4D43] hover:text-[#1E1612] hover:bg-white/60"
              }`}
            >
              {lang === "hi" ? "सभी" : "All"} ({currentData.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMediaFilter("photos");
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMediaFilter === "photos"
                  ? "bg-[#EA580C] text-white shadow-xs"
                  : "text-[#5C4D43] hover:text-[#1E1612] hover:bg-white/60"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "तस्वीरें" : "Photos"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMediaFilter("videos");
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMediaFilter === "videos"
                  ? "bg-[#EA580C] text-white shadow-xs"
                  : "text-[#5C4D43] hover:text-[#1E1612] hover:bg-white/60"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "वीडियो" : "Videos"}</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 4-COLUMN LANDSCAPE PHOTO/VIDEO GRID (Matching avsharyana.com)        */}
        {/* ==================================================================== */}
        {totalItems === 0 ? (
          <div className="text-center py-16 px-6 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E7D8C8] text-[#B8893E] flex items-center justify-center mx-auto shadow-xs">
              <Layers className="w-8 h-8 opacity-70" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-editorial text-xl font-bold text-[#1E1612]">
                {lang === "hi" ? "कोई मीडिया उपलब्ध नहीं है" : "No Media Found"}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4D43] leading-relaxed">
                {lang === "hi"
                  ? "इस श्रेणी में अभी कोई फ़ोटो या वीडियो नहीं मिला।"
                  : "There is currently no media available under this filter."}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setActiveMediaFilter("all");
                setCurrentPage(1);
              }}
              className="px-6 py-2 rounded-lg bg-[#EA580C] text-white font-bold text-xs"
            >
              {lang === "hi" ? "सभी देखें" : "View All"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
            {paginatedItems.map((item) => {
              const title =
                lang === "hi" && item.titleHi
                  ? item.titleHi
                  : item.event && item.event.length > 0
                  ? item.event
                  : item.title;

              return (
                <GalleryCard
                  key={item.id}
                  item={item}
                  title={title}
                  lang={lang}
                  onOpen={(e) => handleOpenPhoto(item, e)}
                />
              );
            })}
          </div>
        )}

        {/* ==================================================================== */}
        {/* BOTTOM PAGINATION BAR: Total X items | < 1 2 3 ... 9 > | X / page    */}
        {/* ==================================================================== */}
        {totalItems > 0 && (
          <div className="pt-6 sm:pt-8 border-t border-[#E7D8C8] flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Total items counter */}
            <p className="text-xs sm:text-sm font-semibold text-[#5C4D43]">
              {lang === "hi"
                ? `कुल ${totalItems} आइटम`
                : `Total ${totalItems} items`}
            </p>

            {/* Numeric page navigation buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                aria-label="Previous Page"
                className="w-8 h-8 rounded-md bg-white border border-[#E7D8C8] text-[#1E1612] hover:bg-[#FFF5EA] hover:border-[#EA580C] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((p, idx) => {
                if (typeof p === "string") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-xs text-[#8C6B3E] font-bold select-none"
                    >
                      ...
                    </span>
                  );
                }

                const isActive = p === safeCurrentPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    aria-current={isActive ? "page" : undefined}
                    className={`w-8 h-8 rounded-md font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#EA580C] text-white shadow-xs"
                        : "bg-white border border-[#E7D8C8] text-[#1E1612] hover:bg-[#FFF5EA] hover:border-[#EA580C]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                aria-label="Next Page"
                className="w-8 h-8 rounded-md bg-white border border-[#E7D8C8] text-[#1E1612] hover:bg-[#FFF5EA] hover:border-[#EA580C] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-md border border-[#E7D8C8] bg-white text-xs font-semibold text-[#1E1612] focus:border-[#EA580C] focus:outline-none cursor-pointer"
              >
                <option value="12">12 / page</option>
                <option value="16">16 / page</option>
                <option value="24">24 / page</option>
                <option value="32">32 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      <GalleryModal
        isOpen={isModalOpen}
        item={selectedItem}
        items={filteredItems}
        currentIndex={currentIndex}
        onClose={handleCloseModal}
        onPrev={handlePrevItem}
        onNext={handleNextItem}
        lang={lang}
        lastFocusedElement={lastTriggerRef.current}
      />
    </div>
  );
}
