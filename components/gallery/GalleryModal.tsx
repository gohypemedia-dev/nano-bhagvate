"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Film,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { GalleryItem } from "@/data/gallery";
import { parseVideoSource } from "./galleryUtils";

interface GalleryModalProps {
  isOpen: boolean;
  item: GalleryItem | null;
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  lang: "en" | "hi";
  lastFocusedElement?: HTMLElement | null;
}

export default function GalleryModal({
  isOpen,
  item,
  items,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  lang,
  lastFocusedElement,
}: GalleryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [videoError, setVideoError] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Reset video error on item change
  useEffect(() => {
    setVideoError(false);
  }, [item?.id]);

  // Lock background body scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Set initial focus to close button
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      // Restore focus to card that triggered modal
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    };
  }, [isOpen, lastFocusedElement]);

  // Keyboard navigation & Focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
        return;
      }

      // Trap focus inside modal
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  // Touch swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    // Only swipe if horizontal displacement exceeds vertical and passes threshold
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX > 0) {
        onNext(); // swipe left -> next item
      } else {
        onPrev(); // swipe right -> prev item
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!isOpen || !item) return null;

  const title = lang === "hi" && item.titleHi ? item.titleHi : item.title;
  const event = lang === "hi" && item.eventHi ? item.eventHi : item.event;
  const parsedVideo = item.type === "video" ? parseVideoSource(item.src, item.videoProvider) : null;
  const hasMultiple = items.length > 1;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* TOP BAR */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 z-30 pb-2">
        {/* Counter & Media Type Badge */}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/95 text-xs font-semibold tracking-wide">
            {item.type === "video" ? (
              <Film className="w-3.5 h-3.5 text-[#E86F1D]" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-[#B8893E]" />
            )}
            <span>
              {currentIndex + 1} / {items.length}
            </span>
          </span>

          {event && (
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#E86F1D]/20 border border-[#E86F1D]/40 text-[#E86F1D] text-xs font-bold uppercase tracking-wider">
              {event}
            </span>
          )}
        </div>

        {/* Close Button (Min 44px for touch accessibility) */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label={lang === "hi" ? "गैलरी बंद करें" : "Close gallery viewer"}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#E86F1D] text-white flex items-center justify-center transition-all duration-200 border border-white/20 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E86F1D] cursor-pointer shrink-0"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* CENTER MEDIA VIEWER AREA */}
      <div className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-auto min-h-0 overflow-hidden">
        {/* PREVIOUS BUTTON */}
        {hasMultiple && (
          <button
            onClick={onPrev}
            aria-label={lang === "hi" ? "पिछला मीडिया" : "Previous media"}
            className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-[#E86F1D] text-white flex items-center justify-center transition-all duration-200 border border-white/25 shadow-xl hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E86F1D] cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* MAIN DISPLAY CONTAINER */}
        <div className="w-full h-full flex items-center justify-center p-1 sm:p-4">
          {item.type === "photo" ? (
            /* Complete Photo - object-fit: contain (no cropping/stretching) */
            <div className="relative w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                className="max-w-full max-h-[64vh] sm:max-h-[72vh] object-contain rounded-xl shadow-2xl border border-white/10 transition-all duration-200"
              />
            </div>
          ) : (
            /* Video Player - Loaded strictly on modal open, unloads on change */
            <div
              key={item.id}
              className={`w-full flex items-center justify-center ${
                item.aspectRatio === "9/16" ? "max-w-sm aspect-[9/16]" : "max-w-4xl aspect-video"
              }`}
            >
              {parsedVideo?.provider === "mp4" ? (
                /* Native MP4 Video Player */
                videoError ? (
                  <div className="w-full aspect-video bg-[#2B201A] rounded-xl border border-white/20 p-6 flex flex-col items-center justify-center text-center text-white space-y-3">
                    <AlertCircle className="w-10 h-10 text-[#E86F1D]" />
                    <p className="font-editorial text-lg">
                      {lang === "hi"
                        ? "वीडियो लोड करने में समस्या हुई।"
                        : "Unable to play video directly."}
                    </p>
                    <a
                      href={parsedVideo.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary min-h-[44px] text-xs"
                    >
                      <span>{lang === "hi" ? "सीधे वीडियो खोलें" : "Open Video Directly"}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <video
                    src={parsedVideo.embedUrl}
                    poster={item.thumbnail}
                    controls
                    autoPlay
                    playsInline
                    className="w-full max-h-[68vh] rounded-xl shadow-2xl bg-black border border-white/10"
                    onError={() => setVideoError(true)}
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                /* YouTube / Vimeo Responsive Privacy Embed */
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video">
                  <iframe
                    src={parsedVideo?.embedUrl}
                    title={title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* NEXT BUTTON */}
        {hasMultiple && (
          <button
            onClick={onNext}
            aria-label={lang === "hi" ? "अगला मीडिया" : "Next media"}
            className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-[#E86F1D] text-white flex items-center justify-center transition-all duration-200 border border-white/25 shadow-xl hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E86F1D] cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}
      </div>

      {/* BOTTOM CAPTION BAR */}
      <div className="w-full max-w-4xl mx-auto z-30 pt-2">
        <div className="bg-black/60 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-white text-center sm:text-left">
          <div className="space-y-0.5 min-w-0">
            {event && (
              <p className="text-[11px] font-bold text-[#E86F1D] uppercase tracking-wider truncate">
                {event}
                {item.date && <span className="text-white/60 font-normal"> • {item.date}</span>}
              </p>
            )}
            <h3 className="font-editorial text-base sm:text-lg font-semibold text-white/95 leading-tight line-clamp-2">
              {title}
            </h3>
          </div>

          {/* Action / External Link */}
          {item.type === "video" && parsedVideo && (
            <a
              href={parsedVideo.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors shrink-0 min-h-[38px] border border-white/15"
            >
              <span>{lang === "hi" ? "मूल वीडियो" : "Watch Original"}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#E86F1D]" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
