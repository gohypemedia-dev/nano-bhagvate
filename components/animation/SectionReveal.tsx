"use client";

import React from "react";
import { motion } from "framer-motion";

interface SectionRevealProps {
  children: React.ReactNode;
  as?: "section" | "div" | "article" | "main";
  className?: string;
  id?: string;
  yOffset?: number;
  threshold?: number | "some" | "all";
  once?: boolean;
  duration?: number;
  delay?: number;
}

export default function SectionReveal({
  children,
  as = "section",
  className = "",
  id,
  yOffset = 40,
  threshold = "some",
  once = true,
  duration = 0.8,
  delay = 0,
}: SectionRevealProps) {
  const MotionComponent = as === "section" ? motion.section : motion.div;

  return (
    <MotionComponent
      id={id}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1] as const, // Luxury ease curve
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

