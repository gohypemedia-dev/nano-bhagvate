"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Re-fetches the server-rendered admin page periodically while the tab is visible,
// throttled so it doesn't freeze the UI while navigating or switching tabs.
export default function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  const lastRefreshRef = useRef(Date.now());

  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      // Throttle: don't refresh if it already refreshed within the last 15 seconds
      if (document.visibilityState === "visible" && now - lastRefreshRef.current >= 15000) {
        lastRefreshRef.current = now;
        router.refresh();
      }
    };
    const timer = setInterval(refresh, seconds * 1000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, seconds]);

  return null;
}
