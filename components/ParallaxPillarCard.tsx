"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

interface ParallaxPillarCardProps {
  imageSrc: string;
  imageAlt: string;
  badgeText?: string;
  title: string;
  description: string;
  buttonText: string;
  href?: string;
  onClick?: () => void;
  isDonateButton?: boolean;
}

export default function ParallaxPillarCard({
  imageSrc,
  imageAlt,
  title,
  description,
  buttonText,
  href,
  onClick,
  isDonateButton = false,
}: ParallaxPillarCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    imgX: 0,
    imgY: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 3D Card tilt angles (mild & luxury feel)
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    // Internal image parallax shift (moves counter to cursor)
    const imgX = ((x - centerX) / centerX) * -10;
    const imgY = ((y - centerY) / centerY) * -10;

    setTransform({ rotateX, rotateY, imgX, imgY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform({ rotateX: 0, rotateY: 0, imgX: 0, imgY: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
      }}
      className="h-full"
    >
      <div
        style={{
          transform: isHovered
            ? `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translateY(-8px)`
            : "rotateX(0deg) rotateY(0deg) translateY(0px)",
          transition: isHovered
            ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
            : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
          transformStyle: "preserve-3d",
        }}
        className="relative h-full rounded-3xl bg-white border border-[#E86F1D] shadow-[0_8px_24px_-4px_rgba(43,32,26,0.06)] hover:shadow-[0_24px_48px_-10px_rgba(232,111,29,0.25)] flex flex-col justify-between overflow-hidden group will-change-transform"
      >
        <div>
          {/* Parallax Image Viewport */}
          <div className="relative h-48 w-full overflow-hidden bg-[#FBF2E7]">
            <div
              style={{
                transform: isHovered
                  ? `translate3d(${transform.imgX}px, ${transform.imgY}px, 0) scale(1.12)`
                  : "translate3d(0, 0, 0) scale(1.02)",
                transition: isHovered
                  ? "transform 0.1s ease-out"
                  : "transform 0.6s ease-out",
              }}
              className="absolute -inset-3"
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />

            {/* Title with depth */}
            <div
              style={{
                transform: isHovered ? "translateZ(25px)" : "translateZ(0px)",
                transition: "transform 0.3s ease-out",
              }}
              className="absolute bottom-3.5 left-4 right-4"
            >
              <h3 className="font-editorial text-2xl font-bold text-[#FFAE66] drop-shadow-md">
                {title}
              </h3>
            </div>
          </div>

          {/* Content Description */}
          <div className="p-6">
            <p className="text-sm text-[#5C4D43] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 pt-0">
          {isDonateButton ? (
            <button
              onClick={onClick}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#E86F1D] hover:bg-[#D25E12] text-white font-bold text-xs uppercase tracking-wider shadow-[0_4px_14px_-2px_rgba(232,111,29,0.35)] hover:shadow-[0_8px_20px_-4px_rgba(232,111,29,0.5)] transition-all duration-300 cursor-pointer group/btn"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-white" />
              <span>{buttonText}</span>
            </button>
          ) : (
            <Link
              href={href || "#"}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#E86F1D] hover:bg-[#D25E12] text-white font-bold text-xs uppercase tracking-wider shadow-[0_4px_14px_-2px_rgba(232,111,29,0.35)] hover:shadow-[0_8px_20px_-4px_rgba(232,111,29,0.5)] transition-all duration-300 group/btn"
            >
              <span>{buttonText}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
