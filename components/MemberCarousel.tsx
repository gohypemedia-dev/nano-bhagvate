"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { membersData, Member } from "@/data/members";

export default function MemberCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);

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

  // Image-wise auto-scroll every 3 seconds (pauses on hover)
  useEffect(() => {
    if (!emblaApi || isHovered) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [emblaApi, isHovered]);

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Viewport (Fractional basis so exact cards fit without right cutoff) */}
      <div className="overflow-hidden py-1" ref={emblaRef}>
        <div className="flex -ml-3 sm:-ml-4 touch-pan-y">
          {membersData.map((member: Member, idx: number) => (
            <div
              key={`${member.name}-${idx}`}
              className="pl-3 sm:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 min-w-0 shrink-0"
            >
              {/* White Member Card matching reference */}
              <div className="h-full bg-white border border-[#E7D8C8]/60 hover:border-[#E86F1D] rounded-2xl p-2.5 sm:p-3 shadow-[0_4px_16px_-4px_rgba(43,32,26,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(232,111,29,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
                {/* Photo */}
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#FAF3EC]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    unoptimized
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  />
                </div>

                {/* Name & Designation */}
                <div className="pt-2.5 pb-0.5 w-full flex flex-col items-center justify-center min-h-[50px]">
                  <h3 className="font-sans font-bold text-[11px] sm:text-xs md:text-[13px] text-[#1E1612] uppercase tracking-wide leading-tight line-clamp-1 group-hover:text-[#E86F1D] transition-colors">
                    {member.name}
                  </h3>
                  <p className="font-sans text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-[#8C6B3E] uppercase tracking-wider mt-0.5 line-clamp-1 px-0.5 leading-snug">
                    {member.subtitle ||
                      (member.location
                        ? `MEMBER (${member.location})`
                        : member.role || "MEMBER")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots (Matching reference) */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {scrollSnaps.slice(0, 6).map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              index === selectedIndex % 6
                ? "w-5 h-2 bg-[#E86F1D]"
                : "w-2 h-2 bg-[#E7D8C8] hover:bg-[#E86F1D]/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
