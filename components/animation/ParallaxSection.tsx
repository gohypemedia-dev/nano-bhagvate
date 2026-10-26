"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Distance to shift in px: defaults to 50 -> [-50px, 50px] */
  offset?: number;
  /** Optional custom range e.g. [-100, 100] */
  range?: [number, number];
  /** Whether to apply a spring for extra smooth inertia */
  useSmoothSpring?: boolean;
}

export default function ParallaxSection({
  children,
  className = "",
  offset = 50,
  range,
  useSmoothSpring = true,
}: ParallaxSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const targetRange: [number, number] = range || [-offset, offset];
  const rawY = useTransform(scrollYProgress, [0, 1], targetRange);
  const smoothY = useSpring(rawY, { stiffness: 120, damping: 30 });

  const y = useSmoothSpring ? smoothY : rawY;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className.includes("absolute") ? "" : "relative"} ${className}`}
    >
      <motion.div style={{ y }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  );
}
