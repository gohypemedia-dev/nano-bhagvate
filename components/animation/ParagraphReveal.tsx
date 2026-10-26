"use client";

import React from "react";
import { motion } from "framer-motion";

interface ParagraphRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  once?: boolean;
  threshold?: number | "some" | "all";
}

export default function ParagraphReveal({
  children,
  className = "",
  delay = 0.1,
  duration = 0.8,
  yOffset = 24,
  once = true,
  threshold = "some",
}: ParagraphRevealProps) {
  return (
    <motion.div
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
    </motion.div>
  );
}

