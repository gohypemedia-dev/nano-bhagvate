"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { Play } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { galleryData, GalleryItem } from "@/data/gallery";
import GalleryModal from "./GalleryModal";
import HeadingDivider from "@/components/HeadingDivider";
import { TextReveal } from "@/components/animation";

function GalleryCarouselTile({
  item,
  title,
  onOpen,
  lang,
}: {
  item: GalleryItem;
  title: string;
  onOpen: (e: React.MouseEvent<HTMLElement>) => void;
  lang: string;
}) {
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
          .catch(() => {
            // Autoplay aborted or blocked
          });
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
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`${lang === "hi" ? "तस्वीर देखें" : "View photo"}: ${title}`}
      className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#E7D8C8]/40 border border-[#E7D8C8] shadow-[0_4px_16px_-4px_rgba(43,32,26,0.1)] hover:shadow-[0_12px_28px_-6px_rgba(232,111,29,0.25)] hover:border-[#E86F1D] transition-all duration-300 block cursor-pointer focus-visible:ring-2 focus-visible:ring-[#E86F1D] focus-visible:outline-none"
    >
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
          {/* Ambient overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300 pointer-events-none" />

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
        <>
          <Image
            src={item.thumbnail}
            alt={item.alt || title}
            fill
            loading="lazy"
            unoptimized={item.thumbnail.startsWith("http")}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-106"
            style={{ objectPosition: item.focalPoint || "center" }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 pointer-events-none" />
        </>
      )}
    </button>
  );
}

export default function GallerySection({ initialItems }: { initialItems?: GalleryItem[] }) {
  const { lang } = useApp();
  const [items, setItems] = useState<GalleryItem[]>(
    initialItems && initialItems.length > 0 ? initialItems : galleryData
  );
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  // Fetch live Cloudflare R2 gallery items from database
  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch((err) => console.warn("Could not fetch live gallery items:", err));
  }, []);

  // Curate 10 top-quality landscape photos and videos for the carousel
  const carouselItems = useMemo(() => {
    return [...items]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, 10);
  }, [items]);

  // Embla Carousel Setup (4 cards per view on desktop, matching reference design)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Autoplay slider every 3 SECONDS (3000ms) when not hovered
  useEffect(() => {
    if (!emblaApi || isHovered) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [emblaApi, isHovered]);

  // Open photo/video in full lightbox
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
    ? carouselItems.findIndex((i) => i.id === selectedItem.id)
    : -1;

  const handlePrevItem = () => {
    if (carouselItems.length === 0) return;
    const prevIdx = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
    setSelectedItem(carouselItems[prevIdx]);
  };

  const handleNextItem = () => {
    if (carouselItems.length === 0) return;
    const nextIdx = (currentIndex + 1) % carouselItems.length;
    setSelectedItem(carouselItems[nextIdx]);
  };

  return (
    <section
      id="gallery"
      className="py-20 sm:py-24 lg:py-32 bg-[#FFF9F2] border-t border-[#E7D8C8] scroll-mt-20 relative overflow-hidden"
    >
      <div
        className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ==================================================================== */}
        {/* SECTION HEADER: Gallery with line-dot-line divider                    */}
        {/* ==================================================================== */}
        <div className="flex flex-col items-center justify-center mb-10 sm:mb-12 text-center">
          <TextReveal
            as="h2"
            className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#E86F1D] tracking-wider whitespace-nowrap px-2"
            text={lang === "hi" ? "गैलरी" : "Gallery"}
          />
          <HeadingDivider className="mt-2.5" />
        </div>

        {/* ==================================================================== */}
        {/* 4 LANDSCAPE PHOTOS PER VIEW CAROUSEL (Matching avsharyana.com)        */}
        {/* ==================================================================== */}
        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-3 sm:-ml-4 md:-ml-5 touch-pan-y">
            {carouselItems.map((item) => {
              const title = lang === "hi" && item.titleHi ? item.titleHi : item.title;

              return (
                <div
                  key={item.id}
                  className="flex-[0_0_88%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-3 sm:pl-4 md:pl-5 min-w-0"
                >
                  <GalleryCarouselTile
                    item={item}
                    title={title}
                    lang={lang}
                    onOpen={(e) => handleOpenPhoto(item, e)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* CAROUSEL PAGINATION DOTS: ○ ○ ○ ○ ○ ○ ● ○ ○ (Matching Picture 2)      */}
        {/* ==================================================================== */}
        <div className="flex items-center justify-center gap-2 mt-8 sm:mt-9">
          {carouselItems.map((_, index) => {
            const isActive = index === selectedIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#1E1612] scale-110 shadow-xs"
                    : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-transparent border-[1.5px] border-[#8C6B3E]/50 hover:border-[#EA580C] hover:scale-110"
                }`}
              />
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* VIEW ALL BUTTON: [ View All ] (Matching Picture 2)                   */}
        {/* ==================================================================== */}
        <div className="text-center mt-7 sm:mt-8">
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center px-7 py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#D45A0E] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>{lang === "hi" ? "सभी देखें" : "View All"}</span>
          </Link>
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR FULLSCREEN PHOTO/VIDEO VIEWING */}
      <GalleryModal
        isOpen={isModalOpen}
        item={selectedItem}
        items={carouselItems}
        currentIndex={currentIndex}
        onClose={handleCloseModal}
        onPrev={handlePrevItem}
        onNext={handleNextItem}
        lang={lang}
        lastFocusedElement={lastTriggerRef.current}
      />
    </section>
  );
}
