"use client";

import React, { useEffect, useRef, useState } from "react";

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number; // milliseconds
  suffix?: string;
  prefix?: string;
  className?: string;
  locale?: string;
}

export default function CountUp({
  end,
  start = 0,
  duration = 2000,
  suffix = "",
  prefix = "",
  className = "",
  locale = "en-IN",
}: CountUpProps) {
  // Initial SSR value is the verified target number, so Google, link previews and page source match the final count
  const [count, setCount] = useState(end);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          setCount(start);

          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic: starts briskly and decelerates smoothly into the final number
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(start + (end - start) * easeOutProgress);

            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [end, start, duration]);

  const formattedCount = count.toLocaleString(locale);

  return (
    <span ref={elementRef} className={`tabular-nums ${className}`}>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
}
