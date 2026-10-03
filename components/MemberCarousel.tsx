"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { membersData, Member } from "@/data/members";

export default function MemberCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

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
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Autoplay functionality (5 seconds, pauses on hover/interaction)
  const startAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    autoplayTimer.current = setInterval(() => {
      if (emblaApi && !isHovered) {
        emblaApi.scrollNext();
      }
    }, 5000);
  }, [emblaApi, isHovered]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [startAutoplay]);

  return (
    <section
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative max-w-6xl mx-auto px-2 sm:px-12">
        {/* Embla Viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4 sm:-ml-6 touch-pan-y">
            {membersData.map((member: Member, idx: number) => (
              <div
                key={member.image || idx}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] pl-4 sm:pl-6 min-w-0"
              >
                {/* Vertical Portrait Member Card */}
                <div className="h-full bg-[#FFF9F2] border border-[#B8893E]/30 rounded-[20px] overflow-hidden shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col group">
                  {/* Vertical Portrait Photo */}
                  <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#E6E8EC]">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      unoptimized
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  {/* Card Bottom Label Box */}
                  <div className="p-4 sm:p-5 bg-[#FFF9F2] border-t border-[#E7D8C8]/50 flex flex-col items-center justify-center text-center space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-[#2B201A] uppercase tracking-wide leading-snug">
                      {member.name}
                    </h3>
                    
                    <p className="text-[11px] sm:text-xs font-bold text-[#E86F1D] uppercase tracking-wider">
                      {member.location
                        ? `MEMBER (${member.location})`
                        : member.role
                        ? member.role
                        : "MEMBER"}
                    </p>

                    {member.description && member.description.trim() !== "" && (
                      <p className="text-xs text-[#2B201A]/75 italic mt-1.5 leading-relaxed line-clamp-2">
                        “{member.description}”
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Prev / Next Navigation Arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-6 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFF9F2] border border-[#B8893E]/40 text-[#2B201A] hover:bg-[#E86F1D] hover:text-white hover:border-[#E86F1D] shadow-warm-sm flex items-center justify-center transition-all z-10 focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
          aria-label="Previous member"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-6 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFF9F2] border border-[#B8893E]/40 text-[#2B201A] hover:bg-[#E86F1D] hover:text-white hover:border-[#E86F1D] shadow-warm-sm flex items-center justify-center transition-all z-10 focus:outline-none focus:ring-2 focus:ring-[#E86F1D]"
          aria-label="Next member"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-2 mt-6">
        {scrollSnaps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
              selectedIndex === idx
                ? "w-7 bg-[#E86F1D]"
                : "w-2.5 bg-[#E7D8C8] hover:bg-[#B8893E]"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
