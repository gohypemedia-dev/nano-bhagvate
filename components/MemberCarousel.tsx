"use client";

import React from "react";
import Image from "next/image";
import { membersData, Member } from "@/data/members";

export default function MemberCarousel() {
  // Duplicate members to create a seamless infinite loop
  const duplicatedMembers = [...membersData, ...membersData];

  return (
    <div className="relative w-full overflow-hidden select-none py-3">
      {/* Subtle edge fade gradient masks for smooth entrance/exit */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 z-10 bg-gradient-to-r from-[#FAF3EA] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 z-10 bg-gradient-to-l from-[#FAF3EA] to-transparent" />

      {/* Continuous Auto-Scrolling Row (End-to-End) */}
      <div className="flex animate-marquee gap-4 sm:gap-6 hover:[animation-play-state:paused] py-2">
        {duplicatedMembers.map((member: Member, idx: number) => (
          <div
            key={`${member.name}-${idx}`}
            className="w-[200px] sm:w-[220px] md:w-[240px] shrink-0"
          >
            {/* Portrait Member Card matching 2nd reference image */}
            <div className="h-full bg-[#FFF9F2] border border-[#E7D8C8] rounded-2xl overflow-hidden shadow-warm-sm hover:shadow-warm-md hover:-translate-y-1 transition-all duration-300 flex flex-col group">
              {/* Photo */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#E6E8EC]">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  unoptimized
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 200px, 240px"
                />
              </div>

              {/* Card Label */}
              <div className="p-3 sm:p-4 bg-[#FFF9F2] border-t border-[#E7D8C8]/60 flex flex-col items-center justify-center text-center min-h-[68px] sm:min-h-[76px]">
                <h3 className="font-bold text-xs sm:text-[13px] text-[#2B201A] uppercase tracking-wide leading-tight line-clamp-1">
                  {member.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#E86F1D] uppercase tracking-wider mt-1 line-clamp-2 px-1 leading-snug">
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
  );
}
