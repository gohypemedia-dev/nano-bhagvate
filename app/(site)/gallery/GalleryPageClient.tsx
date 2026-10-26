"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Film,
  ChevronDown,
  Layers,
  Maximize2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { galleryData, GalleryItem } from "@/data/gallery";
import GalleryModal from "@/components/gallery/GalleryModal";
import GalleryVideoCard from "@/components/gallery/GalleryVideoCard";
import { StaggerContainer, StaggerItem } from "@/components/animation";

type FilterType = "all" | "photos" | "videos";

// 4 items per row grid
const INITIAL_COUNT = 16;
const LOAD_MORE_STEP = 8;

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

  // Changing filters resets visible items count to INITIAL_COUNT
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setVisibleCount(INITIAL_COUNT);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_STEP);
  };

  // Open photo in full lightbox
  const handleOpenPhoto = (item: GalleryItem, e: React.MouseEvent<HTMLElement>) => {
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
      {/* MAIN GALLERY SECTION (END-TO-END FULL WIDTH - NO NARROW WRAPPER) */}
      <section className="pt-6 sm:pt-10 pb-16 sm:pb-24 bg-[#FFF9F2] min-h-screen">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
          {/* FILTER BUTTONS - CLEAN, CENTERED & NO WRAPPING ON MOBILE */}
          <div
            role="tablist"
            aria-label={lang === "hi" ? "मीडिया फ़िल्टर" : "Media filters"}
            className="flex flex-nowrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 max-w-full overflow-x-auto scrollbar-none px-2 py-1 mx-auto"
          >
            {filters.map((filter) => {
              const isSelected = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleFilterChange(filter.key)}
                  className={`min-h-[38px] sm:min-h-[42px] px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 sm:gap-2 border select-none shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#E86F1D] focus-visible:outline-none ${
                    isSelected
                      ? "bg-[#E86F1D] text-white border-[#E86F1D] shadow-warm-sm scale-[1.02]"
                      : "bg-[#FBF2E7] text-[#2B201A]/85 border-[#E7D8C8] hover:border-[#E86F1D]/50 hover:bg-[#F3E7D7] hover:text-[#E86F1D]"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
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

          {/* RESPONSIVE MEDIA GRID: EXACTLY 4 CARDS PER ROW, FULL END-TO-END */}
          {filteredItems.length === 0 ? (
            /* EMPTY STATE */
            <div className="text-center py-12 px-6 max-w-md mx-auto my-6 space-y-4">
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
            <StaggerContainer
              key={activeFilter}
              stagger={0.05}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4 items-stretch"
            >
              {visibleItems.map((item) => {
                const title = lang === "hi" && item.titleHi ? item.titleHi : item.title;
                const event = lang === "hi" && item.eventHi ? item.eventHi : item.event;
                const isVideo = item.type === "video";

                if (isVideo) {
                  return (
                    <StaggerItem key={item.id}>
                      <GalleryVideoCard
                        item={item}
                        title={title}
                        event={event}
                        lang={lang}
                        onOpen={(e) => handleOpenPhoto(item, e)}
                      />
                    </StaggerItem>
                  );
                }

                return (
                  <StaggerItem
                    key={item.id}
                    className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[#181310] border border-[#E7D8C8]/70 shadow-warm-xs hover:shadow-warm-md hover:border-[#E86F1D] transition-all duration-300 group"
                  >
                    {/* DIRECT PHOTO TILE (CLICK TO VIEW FULL-SCREEN IN LIGHTBOX) */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenPhoto(item, e)}
                      aria-label={`${lang === "hi" ? "तस्वीर देखें" : "View photo"}: ${title}`}
                      className="relative w-full h-full block cursor-pointer group/photo focus-visible:ring-2 focus-visible:ring-[#E86F1D] focus-visible:outline-none"
                    >
                      <Image
                        src={item.thumbnail}
                        alt={item.alt}
                        fill
                        loading="lazy"
                        unoptimized={item.thumbnail.startsWith("http")}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover/photo:scale-105"
                        style={{ objectPosition: item.focalPoint || "center" }}
                      />

                      {/* Subtle Dark Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {/* Expand Icon Badge */}
                      <div className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md text-white opacity-0 group-hover/photo:opacity-100 transition-opacity duration-200 shadow-md">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>

                      {/* Caption Bar on Hover */}
                      <div className="absolute bottom-0 inset-x-0 p-3.5 z-10 text-left text-white opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 pointer-events-none space-y-0.5">
                        {event && (
                          <p className="text-[10px] font-bold text-[#E86F1D] uppercase tracking-wider">
                            {event}
                          </p>
                        )}
                        <h4 className="font-editorial text-xs sm:text-sm font-bold text-white line-clamp-1 drop-shadow-xs">
                          {title}
                        </h4>
                      </div>
                    </button>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
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

      {/* FULLSCREEN LIGHTBOX FOR PHOTOS */}
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
