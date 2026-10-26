"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  /** If true, only shows once per browser tab session */
  oncePerSession?: boolean;
  /** Minimum duration in ms to complete 0-100% counter */
  minDuration?: number;
}

export default function Preloader({
  oncePerSession = true,
  minDuration = 1400,
}: PreloaderProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check session storage if oncePerSession is active (bypassed in development for easy inspection)
    if (oncePerSession && typeof window !== "undefined" && process.env.NODE_ENV !== "development") {
      const alreadyLoaded = sessionStorage.getItem("nbv_preloader_seen");
      if (alreadyLoaded) {
        setLoading(false);
        return;
      }
    }

    // Lock body scroll during preloading
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const startTime = performance.now();
    let frameId: number;

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / minDuration, 1);

      // Smooth custom easing for counter progression (fast start, gradual finish)
      const easeProgress = 1 - Math.pow(1 - rawProgress, 3);
      const currentVal = Math.floor(easeProgress * 100);

      setProgress(currentVal);

      if (rawProgress < 1) {
        frameId = requestAnimationFrame(updateCounter);
      } else {
        setProgress(100);
        // Small graceful pause at 100% before curtain rises
        setTimeout(() => {
          setLoading(false);
          document.body.style.overflow = originalOverflow;
          if (oncePerSession && typeof window !== "undefined") {
            sessionStorage.setItem("nbv_preloader_seen", "true");
          }
        }, 220);
      }
    };

    frameId = requestAnimationFrame(updateCounter);

    return () => {
      cancelAnimationFrame(frameId);
      document.body.style.overflow = originalOverflow;
    };
  }, [oncePerSession, minDuration]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="preloader-overlay"
          initial={{ y: "0%" }}
          exit={{
            y: "-100%",
            transition: {
              duration: 0.95,
              ease: [0.76, 0, 0.24, 1], // Modern luxury curtain easing curve
            },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#E86F1D] text-white select-none pointer-events-auto overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Center Brand Logo, Title & Counter Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -50,
              transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full"
          >
            {/* Official Trust Logo with Golden Aura */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-white/80 bg-white p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.22)] mb-5 flex items-center justify-center shrink-0"
            >
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/images/logo.jpg"
                  alt="Namo Bhagwate Vasudevaya Trust Logo"
                  fill
                  priority
                  unoptimized
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Trust Title Name (Hindi & English) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1 mb-4"
            >
              <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide drop-shadow-sm">
                नमो भगवते वासुदेवाय ट्रस्ट
              </h1>
              <p className="text-xs sm:text-sm font-sans tracking-[0.22em] uppercase text-white/90 font-medium">
                Namo Bhagwate Vasudevaya Trust
              </p>
            </motion.div>

            {/* Numerical Counter */}
            <div className="flex items-baseline justify-center gap-1 my-1">
              <span className="font-mono text-5xl sm:text-6xl font-light text-white tracking-tight tabular-nums drop-shadow-xs">
                {String(progress).padStart(2, "0")}
              </span>
              <span className="text-lg font-mono text-white/80 font-bold">%</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full max-w-[260px] h-[3px] bg-white/20 rounded-full overflow-hidden mt-3 relative">
              <motion.div
                className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* Bottom Luxury Footer */}
          <div className="absolute bottom-6 inset-x-0 text-center">
            <span className="text-[11px] tracking-widest text-white/50 uppercase font-mono">
              Loading Sacred Sanctuary
            </span>
          </div>

          {/* Secondary Trailing Curtain Accent Layer (Warm Cream / Deep Saffron depth) */}
          <motion.div
            initial={{ y: "0%" }}
            exit={{
              y: "-100%",
              transition: {
                duration: 0.95,
                delay: 0.08,
                ease: [0.76, 0, 0.24, 1],
              },
            }}
            className="absolute inset-0 bg-[#D45A0E] z-[-1] pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
