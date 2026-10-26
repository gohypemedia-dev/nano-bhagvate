"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Film,
  Maximize2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { galleryData, GalleryItem } from "@/data/gallery";
import GalleryModal from "./GalleryModal";
import GalleryVideoCard from "./GalleryVideoCard";
import {
  SectionReveal,
  TextReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animation";

export default function GallerySection() {
  const { lang } = useApp();
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  // Exactly 4 featured items for the homepage row
  const featuredItems = useMemo(() => {
    return [...galleryData]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, 4);
  }, []);

  // Open photo in full lightbox
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
    ? featuredItems.findIndex((i) => i.id === selectedItem.id)
    : -1;

  const handlePrevItem = () => {
    if (featuredItems.length === 0) return;
    const prevIdx = (currentIndex - 1 + featuredItems.length) % featuredItems.length;
    setSelectedItem(featuredItems[prevIdx]);
  };

  const handleNextItem = () => {
    if (featuredItems.length === 0) return;
    const nextIdx = (currentIndex + 1) % featuredItems.length;
    setSelectedItem(featuredItems[nextIdx]);
  };

  return (
    <SectionReveal
      id="gallery"
      className="pt-10 sm:pt-14 pb-6 sm:pb-8 bg-[#FFF9F2] border-t border-[#E7D8C8] scroll-mt-20 relative overflow-hidden"
    >
      {/* End-to-end full width container */}
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        {/* ==================================================================== */}
        {/* ORNAMENTAL HEADER: ─────── ❖ GALLERY ❖ ─────── (No false arrowheads) */}
        {/* ==================================================================== */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 text-center">
          <div className="w-full flex items-center justify-center gap-3 sm:gap-6 max-w-4xl mx-auto">
            {/* Left Decorative Filigree Line */}
            <div className="flex-1 flex items-center justify-end gap-1.5">
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#E86F1D]/50 to-[#E86F1D]" />
              <span className="text-[#E86F1D] text-xs select-none">❖</span>
            </div>

            {/* Centered Gallery Heading with TextReveal */}
            <TextReveal
              as="h2"
              className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2B201A] tracking-wider whitespace-nowrap px-2"
              text={lang === "hi" ? "गैलरी • Gallery" : "Gallery"}
            />

            {/* Right Decorative Filigree Line */}
            <div className="flex-1 flex items-center justify-start gap-1.5">
              <span className="text-[#E86F1D] text-xs select-none">❖</span>
              <div className="h-[2px] w-full bg-gradient-to-r from-[#E86F1D] via-[#E86F1D]/50 to-transparent" />
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* EXACTLY 4 DIRECT MEDIA TILES IN 1 ROW (END-TO-END WIDE GRID)         */}
        {/* ==================================================================== */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4 items-stretch">
          {featuredItems.map((item) => {
            const title = lang === "hi" && item.titleHi ? item.titleHi : item.title;
            const event = lang === "hi" && item.eventHi ? item.eventHi : item.event;
            const isVideo = item.type === "video";

            if (isVideo) {
              return (
                <StaggerItem key={item.id} className="h-full">
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
              <StaggerItem key={item.id} className="h-full">
                <div
                  className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[#181310] border border-[#E7D8C8]/70 shadow-warm-xs hover:shadow-warm-md hover:border-[#E86F1D] transition-all duration-300 group h-full"
                >
                  {/* DIRECT PHOTO TILE (CLICK TO VIEW FULLSCREEN IN LIGHTBOX) */}
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
                      loading="eager"
                      unoptimized={item.thumbnail.startsWith("http")}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover/photo:scale-105"
                      style={{ objectPosition: item.focalPoint || "center" }}
                    />

                    {/* Dark Gradient Overlay for high-contrast legible captions on all viewports */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none transition-opacity duration-300" />

                    {/* Expand Badge on Hover */}
                    <div className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md text-white opacity-0 group-hover/photo:opacity-100 transition-opacity duration-200 shadow-md">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>

                    {/* Title Caption - ALWAYS VISIBLE (Fixes PM finding 2 where captions didn't appear) */}
                    <div className="absolute bottom-0 inset-x-0 p-3.5 z-10 text-left text-white pointer-events-none space-y-1">
                      {event && (
                        <p className="text-[10px] font-bold text-[#E86F1D] uppercase tracking-wider">
                          {event}
                        </p>
                      )}
                      <h4 className="font-editorial text-xs sm:text-sm font-bold text-white line-clamp-2 drop-shadow-sm leading-snug">
                        {title}
                      </h4>
                    </div>
                  </button>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>


        {/* ==================================================================== */}
        {/* VIEW FULL GALLERY BUTTON: [ View Full Gallery → ]                     */}
        {/* ==================================================================== */}
        <div className="text-center mt-5 sm:mt-6">
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-3.5 rounded-full border-2 border-[#E86F1D] text-[#E86F1D] hover:bg-[#E86F1D] hover:text-white font-bold text-sm sm:text-base tracking-wide transition-all duration-300 shadow-warm-xs hover:shadow-warm-md hover:scale-[1.02] active:scale-[0.98] bg-white/80 backdrop-blur-xs"
          >
            <span>{lang === "hi" ? "पूरी गैलरी देखें" : "View Full Gallery"}</span>
          </Link>
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR EXPANDED PHOTOS */}
      <GalleryModal
        isOpen={isModalOpen}
        item={selectedItem}
        items={featuredItems}
        currentIndex={currentIndex}
        onClose={handleCloseModal}
        onPrev={handlePrevItem}
        onNext={handleNextItem}
        lang={lang}
        lastFocusedElement={lastTriggerRef.current}
      />
    </SectionReveal>
  );
}

