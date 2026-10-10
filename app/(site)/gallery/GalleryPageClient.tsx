"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Play,
  Film,
  Image as ImageIcon,
  ChevronDown,
  Layers,
  ChevronRight,
  Home,
  Maximize2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { galleryData, GalleryItem } from "@/data/gallery";
import GalleryModal from "@/components/gallery/GalleryModal";

type FilterType = "all" | "photos" | "videos";

const INITIAL_COUNT = 9;
const LOAD_MORE_STEP = 6;

export default function GalleryPageClient({ initialItems }: { initialItems?: GalleryItem[] } = {}) {
  const { lang } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_COUNT);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const currentData = initialItems && initialItems.length > 0 ? initialItems : galleryData;

  // Sort items by displayOrder ascending
  const sortedItems = useMemo(() => {
    return [...currentData].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [currentData]);


  // Filter items based on active tab
  const filteredItems = useMemo(() => {
    if (activeFilter === "photos") {
      return sortedItems.filter((item) => item.type === "photo");
    }
    if (activeFilter === "videos") {
      return sortedItems.filter((item) => item.type === "video");
    }
    return sortedItems;
  }, [sortedItems, activeFilter]);

  // Counts for badge labels
  const allCount = sortedItems.length;
  const photosCount = useMemo(
    () => sortedItems.filter((i) => i.type === "photo").length,
    [sortedItems]
  );
  const videosCount = useMemo(
    () => sortedItems.filter((i) => i.type === "video").length,
    [sortedItems]
  );

  const filters: { key: FilterType; label: string; count: number }[] = [
    {
      key: "all",
      label: lang === "hi" ? "सभी" : "All",
      count: allCount,
    },
    {
      key: "photos",
      label: lang === "hi" ? "तस्वीरें" : "Photos",
      count: photosCount,
    },
    {
      key: "videos",
      label: lang === "hi" ? "वीडियो" : "Videos",
      count: videosCount,
    },
  ];

  // Changing filters resets visible items count to INITIAL_COUNT (9)
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setVisibleCount(INITIAL_COUNT);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_STEP);
  };

  // Open modal
  const handleOpenItem = (item: GalleryItem, e: React.MouseEvent<HTMLButtonElement>) => {
    lastTriggerRef.current = e.currentTarget;
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Lightbox index within currently filtered list
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

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;
  const remainingCount = filteredItems.length - visibleCount;

  return (
    <div className="w-full">
      {/* COMPACT PAGE INTRODUCTION WITH BREADCRUMB */}
      <section className="relative py-8 sm:py-12 md:py-16 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container">
          {/* BREADCRUMB: Home → Gallery */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5">
            <ol className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-[#6B5B52]">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-[#2B201A]/80 hover:text-[#E86F1D] transition-colors"
                >
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B8893E]" />
                  <span>{lang === "hi" ? "मुख्य पृष्ठ" : "Home"}</span>
                </Link>
              </li>
              <li className="flex items-center gap-1.5 sm:gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#B8893E]/60" />
                <span className="text-[#E86F1D] font-bold">
                  {lang === "hi" ? "झलकियाँ" : "Gallery"}
                </span>
              </li>
            </ol>
          </nav>

          {/* Heading & Subtitle */}
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF9F2] border border-[#B8893E]/35 text-[#E86F1D] text-xs font-bold uppercase tracking-widest shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B8893E]" />
              <span>{lang === "hi" ? "दर्शन एवं सेवा • GLIMPSES" : "GLIMPSES & MEMORIES"}</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2B201A] leading-tight">
              {lang === "hi" ? "हमारी झलकियाँ" : "Our Glimpses & Moments"}
            </h1>

            <p className="text-base sm:text-lg text-[#2B201A]/85 leading-relaxed font-sans max-w-2xl">
              {lang === "hi"
                ? "हमारे आयोजनों, सेवा कार्यों और यादगार पलों की खूबसूरत झलकियाँ।"
                : "Beautiful glimpses of our sacred gatherings, seva initiatives, and memorable milestones."}
            </p>
          </div>
        </div>
      </section>

      {/* MAIN GALLERY SECTION */}
      <section className="section-py bg-[#FFF9F2]">
        <div className="page-container">
          {/* WORKING FILTER BUTTONS */}
          <div
            role="tablist"
            aria-label={lang === "hi" ? "मीडिया फ़िल्टर" : "Media filters"}
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-8 sm:mb-10 max-w-lg mx-auto"
          >
            {filters.map((filter) => {
              const isSelected = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleFilterChange(filter.key)}
                  className={`min-h-[44px] px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-2 border select-none focus-visible:ring-2 focus-visible:ring-[#E86F1D] focus-visible:outline-none ${
                    isSelected
                      ? "bg-[#E86F1D] text-white border-[#E86F1D] shadow-warm-sm scale-[1.02]"
                      : "bg-[#FBF2E7] text-[#2B201A]/85 border-[#E7D8C8] hover:border-[#E86F1D]/50 hover:bg-[#F3E7D7] hover:text-[#E86F1D]"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                      isSelected
                        ? "bg-white/25 text-white"
                        : "bg-[#E7D8C8]/60 text-[#6B5B52]"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* RESPONSIVE MEDIA GRID */}
          {filteredItems.length === 0 ? (
            /* FRIENDLY EMPTY STATE */
            <div className="card-warm text-center py-12 px-6 max-w-md mx-auto my-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF9F2] border border-[#E7D8C8] text-[#B8893E] flex items-center justify-center mx-auto shadow-xs">
                <Layers className="w-8 h-8 opacity-70" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-editorial text-xl font-bold text-[#2B201A]">
                  {lang === "hi" ? "कोई मीडिया उपलब्ध नहीं है" : "No Media Found"}
                </h3>
                <p className="text-sm text-[#2B201A]/80 leading-relaxed font-sans">
                  {lang === "hi"
                    ? "इस श्रेणी में अभी कोई फ़ोटो या वीडियो नहीं मिला।"
                    : "There is currently no media available under this filter."}
                </p>
              </div>
              <button
                onClick={() => handleFilterChange("all")}
                className="btn-outline min-h-[44px] text-xs"
              >
                <span>{lang === "hi" ? "सभी मीडिया देखें" : "View All Media"}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
              {visibleItems.map((item) => {
                const title = lang === "hi" && item.titleHi ? item.titleHi : item.title;
                const event = lang === "hi" && item.eventHi ? item.eventHi : item.event;
                const isVideo = item.type === "video";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => handleOpenItem(item, e)}
                    aria-label={`${
                      isVideo
                        ? lang === "hi"
                          ? "वीडियो देखें"
                          : "Watch video"
                        : lang === "hi"
                        ? "फ़ोटो देखें"
                        : "View photo"
                    }: ${title}`}
                    className="card-warm p-3 sm:p-4 text-left group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-md hover:border-[#E86F1D]/40 focus-visible:ring-2 focus-visible:ring-[#E86F1D] focus-visible:outline-none flex flex-col h-full bg-[#FBF2E7] rounded-[18px] border border-[#E7D8C8]/80 select-none motion-reduce:hover:translate-none"
                  >
                    {/* 4:3 THUMBNAIL CONTAINER - RESERVED PROPORTIONS PREVENT LAYOUT SHIFTS */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-[#EFE4D6] border border-[#E7D8C8]/60 shadow-2xs shrink-0">
                      <Image
                        src={item.thumbnail}
                        alt={item.alt}
                        fill
                        loading="lazy"
                        unoptimized={item.thumbnail.startsWith("http")}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
                        style={{ objectPosition: item.focalPoint || "center" }}
                      />

                      {/* VIDEO OVERLAYS */}
                      {isVideo ? (
                        <>
                          {/* Video Badge (Top-left) */}
                          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-md border border-white/10">
                            <Film className="w-3 h-3 text-[#E86F1D]" />
                            <span>{lang === "hi" ? "वीडियो" : "VIDEO"}</span>
                          </div>

                          {/* Subtle Bottom Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

                          {/* Clear Centered Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#E86F1D]/90 group-hover:bg-[#E86F1D] group-hover:scale-110 motion-reduce:group-hover:scale-100 text-white flex items-center justify-center shadow-lg backdrop-blur-xs transition-all duration-300 border-2 border-white/80 pl-0.5">
                              <Play className="w-6 h-6 fill-current text-white" />
                            </div>
                          </div>
                        </>
                      ) : (
                        /* PHOTO HOVER BADGE */
                        <div className="absolute bottom-2.5 right-2.5 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md pointer-events-none">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* CARD TEXT CONTENT */}
                    <div className="pt-3.5 pb-1 px-1 flex flex-col flex-1 justify-between gap-1.5">
                      <div>
                        {/* Event / Category Pill */}
                        {event && (
                          <p className="text-xs font-bold text-[#B8893E] uppercase tracking-wider line-clamp-1 mb-1">
                            {event}
                          </p>
                        )}

                        {/* Title */}
                        <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#2B201A] leading-snug group-hover:text-[#E86F1D] transition-colors line-clamp-2">
                          {title}
                        </h3>
                      </div>

                      {/* Metadata strip */}
                      <div className="pt-2 mt-auto border-t border-[#E7D8C8]/60 flex items-center justify-between text-[11px] text-[#6B5B52] font-semibold">
                        <span className="flex items-center gap-1">
                          {isVideo ? (
                            <>
                              <Play className="w-3 h-3 text-[#E86F1D]" />
                              <span>{lang === "hi" ? "वीडियो चलाएं" : "Play Video"}</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3 h-3 text-[#B8893E]" />
                              <span>{lang === "hi" ? "तस्वीर देखें" : "View Photo"}</span>
                            </>
                          )}
                        </span>
                        {item.date && <span>{item.date}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* LOAD MORE BUTTON */}
          {hasMore && (
            <div className="mt-10 sm:mt-12 text-center">
              <button
                onClick={handleLoadMore}
                className="btn-outline min-h-[48px] px-8 py-3 rounded-xl inline-flex items-center gap-2 group cursor-pointer hover:border-[#E86F1D] hover:bg-[#FBF2E7]"
              >
                <span>
                  {lang === "hi"
                    ? `और देखें (${remainingCount} और उपलब्ध)`
                    : `Load More (${remainingCount} Remaining)`}
                </span>
                <ChevronDown className="w-4 h-4 text-[#E86F1D] group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FULLSCREEN LIGHTBOX & VIDEO MODAL */}
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
