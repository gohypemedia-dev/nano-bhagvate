"use client";

import React from "react";
import { motion } from "framer-motion";

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  threshold?: number | "some" | "all";
  once?: boolean;
}

export function StaggerContainer({
  children,
  className = "",
  stagger = 0.1,
  delay = 0,
  threshold = "some",
  once = true,
}: StaggerContainerProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
  duration?: number;
}

export function StaggerItem({
  children,
  className = "",
  yOffset = 30,
  duration = 0.7,
}: StaggerItemProps) {
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: yOffset,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };


  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
