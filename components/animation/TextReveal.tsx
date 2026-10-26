"use client";

import React from "react";
import { motion, TargetAndTransition, Variant } from "framer-motion";

interface TextRevealProps {
  /** The text string to animate (or passed as children if string) */
  text?: string;
  children?: React.ReactNode;
  /** HTML Tag to render (h1, h2, h3, h4, p, span, div) */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  className?: string;
  /** Duration per word in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Stagger time between words in seconds */
  stagger?: number;
  /** Animate by words (default) or characters */
  mode?: "words" | "chars";
  /** Trigger once or every time it enters viewport */
  once?: boolean;
  /** Viewport visibility threshold (0 to 1) */
  threshold?: number | "some" | "all";
}

export default function TextReveal({
  text,
  children,
  as: Component = "h2",
  className = "",
  duration = 0.8,
  delay = 0,
  stagger = 0.04,
  mode = "words",
  once = true,
  threshold = "some", // "some" ensures immediate trigger on page load without requiring scrolling
}: TextRevealProps) {
  const content = text || (typeof children === "string" ? children : "");

  // If complex children is passed instead of raw string, animate container
  if (!content && children) {
    return (
      <Component className={className}>
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          whileInView={{ y: "0%", opacity: 1 }}
          viewport={{ once, amount: threshold }}
          transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] as const }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      </Component>
    );
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: "100%",
      opacity: 0,
    },
    visible: {
      y: "0%",
      opacity: 1,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1] as const, // Modern luxury easing curve requested
      },
    },
  };

  const elements = mode === "words" ? content.split(/\s+/) : content.split("");

  return (
    <Component className={className}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: threshold }}
        className="inline"
      >
        {elements.map((item, index) => (
          <React.Fragment key={`rev-${index}-${item}`}>
            <span className="inline-block overflow-hidden pb-1 -mb-1 align-top">
              <motion.span
                variants={itemVariants}
                className="inline-block"
              >
                {item}
              </motion.span>
            </span>
            {index < elements.length - 1 && " "}
          </React.Fragment>
        ))}
      </motion.span>
    </Component>
  );
}

