"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface ParallaxImageProps {
  children: React.ReactNode;
  className?: string;
  /** Distance to translate vertically in pixels during scroll. Defaults to 50 ([-50px, 50px]) */
  offset?: number;
  /** Scale factor to prevent clipping during parallax translation. Defaults to 1.15 */
  scale?: number;
}

export default function ParallaxImage({
  children,
  className = "",
  offset = 50,
  scale = 1.15,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  const smoothY = useSpring(rawY, { stiffness: 120, damping: 30 });

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className.includes("absolute") ? "" : "relative"} ${className}`}
    >
      <motion.div
        style={{
          y: smoothY,
          scale,
        }}
        className="w-full h-full relative will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
