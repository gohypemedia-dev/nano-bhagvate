"use client";

import React, { useRef, useState, useEffect } from "react";
import { Film, Maximize2, Play } from "lucide-react";
import { GalleryItem } from "@/data/gallery";

interface GalleryVideoCardProps {
  item: GalleryItem;
  title: string;
  event?: string;
  lang: string;
  onOpen: (e: React.MouseEvent<HTMLElement>) => void;
}

export default function GalleryVideoCard({
  item,
  title,
  event,
  lang,
  onOpen,
}: GalleryVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
  }, []);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay aborted or blocked
          });
      }
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(e as any);
        }
      }}
      aria-label={`${lang === "hi" ? "वीडियो चलाएं" : "Play video"}: ${title}`}
      className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-black border border-[#E7D8C8]/70 shadow-warm-xs hover:shadow-warm-md hover:border-[#E86F1D] transition-all duration-300 group cursor-pointer select-none"
    >
      {/* Video element covering 100% of card without letterbox */}
      <video
        ref={videoRef}
        src={item.src}
        poster={item.thumbnail}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Dark Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none transition-opacity duration-300" />

      {/* Top Bar: Video Badge (Top-left) */}
      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-sm border border-white/15 pointer-events-none">
        <Film className="w-3.5 h-3.5 text-[#E86F1D]" />
        <span>{lang === "hi" ? "वीडियो" : "VIDEO"}</span>
      </div>

      {/* Expand / Lightbox Badge (Top-right) */}
      <div className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
        <Maximize2 className="w-3.5 h-3.5" />
      </div>

      {/* Center Play Icon Overlay (smoothly fades out when playing on hover) */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${
          isPlaying ? "opacity-0 scale-75" : "opacity-100 scale-100"
        }`}
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/65 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-xl group-hover:bg-[#E86F1D] group-hover:border-[#E86F1D] transition-all">
          <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5 fill-current" />
        </div>
      </div>

      {/* Bottom Caption Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-3.5 z-10 text-left text-white pointer-events-none space-y-0.5">
        {event && (
          <p className="text-[10px] font-bold text-[#E86F1D] uppercase tracking-wider">
            {event}
          </p>
        )}
        <h4 className="font-editorial text-xs sm:text-sm font-bold text-white line-clamp-1 drop-shadow-xs">
          {title}
        </h4>
        <p className="text-[10px] text-white/70 flex items-center gap-1">
          {isPlaying ? (
            <span className="text-[#E86F1D] font-medium">
              {lang === "hi" ? "▶ चल रहा है • बड़ा देखने के लिए क्लिक करें" : "▶ Playing • Click for full audio"}
            </span>
          ) : (
            <span>
              {lang === "hi" ? "होवर करें प्ले करने के लिए" : "Hover to play preview"}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
