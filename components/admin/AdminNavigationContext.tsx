"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  TableSkeleton,
  CardGridSkeleton,
  DetailSkeleton,
} from "@/components/admin/AdminSkeleton";

interface AdminNavigationContextType {
  pendingPath: string | null;
  isNavigating: boolean;
  navigate: (href: string) => void;
}

const AdminNavigationContext = createContext<AdminNavigationContextType>({
  pendingPath: null,
  isNavigating: false,
  navigate: () => {},
});

export function useAdminNavigation() {
  return useContext(AdminNavigationContext);
}

export function AdminNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const prevPathnameRef = useRef(pathname);

  // Clear pending state as soon as the router finishes transitioning to the new route
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setPendingPath(null);
    } else if (pendingPath) {
      const cleanTarget = pendingPath.split("?")[0];
      if (pathname === cleanTarget) {
        setPendingPath(null);
      }
    }
  }, [pathname, searchParams, pendingPath]);

  // Fallback safety: clear pending after 6s in case navigation stalled
  useEffect(() => {
    if (!pendingPath) return;
    const timer = setTimeout(() => {
      setPendingPath(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [pendingPath]);

  const navigate = useCallback(
    (href: string) => {
      const currentFull = `${pathname}${
        searchParams?.toString() ? `?${searchParams.toString()}` : ""
      }`;

      // If user is already exactly on this URL, no action needed
      if (href === currentFull) return;

      // 1. Instant urgent state update: immediate 0ms UI switch
      setPendingPath(href);

      // 2. Next.js router transition in next tick so React paints active tab & preloader first
      setTimeout(() => {
        router.push(href);
      }, 0);
    },
    [pathname, searchParams, router]
  );

  const isNavigating = Boolean(pendingPath);

  return (
    <AdminNavigationContext.Provider
      value={{
        pendingPath,
        isNavigating,
        navigate,
      }}
    >
      {/* Top Indeterminate Progress Bar */}
      <AdminTopProgressBar active={isNavigating} />
      {children}
    </AdminNavigationContext.Provider>
  );
}

/**
 * Sleek top progress bar fixed to the very top edge of the window.
 */
function AdminTopProgressBar({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (active) {
      setVisible(true);
      setProgress(25);
      timer = setTimeout(() => {
        setProgress(75);
      }, 100);
    } else {
      setProgress(100);
      timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
    }
    return () => clearTimeout(timer);
  }, [active]);

  if (!visible && !active) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-200/40 pointer-events-none overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-[#E86F1D] via-[#F59E0B] to-[#E86F1D] shadow-[0_0_10px_rgba(232,111,29,0.7)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}

/**
 * Wrapper for admin content:
 * When navigating to a new section, immediately unmounts old content and shows section preloader!
 */
export function AdminContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { pendingPath } = useAdminNavigation();

  // If a pendingPath is set and destination section differs from current page:
  const isNavigatingToNewSection = Boolean(
    pendingPath && pendingPath.split("?")[0] !== pathname
  );

  if (isNavigatingToNewSection && pendingPath) {
    return <AdminSectionPreloader targetPath={pendingPath} />;
  }

  return <>{children}</>;
}

/**
 * Dedicated preloader for each section of the admin dashboard.
 */
function AdminSectionPreloader({ targetPath }: { targetPath: string }) {
  const cleanPath = targetPath.split("?")[0];

  if (cleanPath === "/admin") {
    return (
      <div className="animate-in fade-in duration-150">
        <TableSkeleton label="Loading donations & seva ledger..." rows={8} stats={true} />
      </div>
    );
  }

  if (cleanPath.startsWith("/admin/members")) {
    return (
      <div className="animate-in fade-in duration-150">
        <TableSkeleton label="Loading member directory & records..." rows={8} stats={false} />
      </div>
    );
  }

  if (cleanPath.startsWith("/admin/orders")) {
    return (
      <div className="animate-in fade-in duration-150">
        <TableSkeleton label="Loading book orders & shipments..." rows={8} stats={false} />
      </div>
    );
  }

  if (cleanPath.startsWith("/admin/events")) {
    return (
      <div className="animate-in fade-in duration-150">
        <CardGridSkeleton label="Loading events & spiritual discourses..." cards={6} />
      </div>
    );
  }

  if (cleanPath.startsWith("/admin/gallery")) {
    return (
      <div className="animate-in fade-in duration-150">
        <CardGridSkeleton label="Loading photo & video gallery..." cards={9} />
      </div>
    );
  }

  if (cleanPath.startsWith("/admin/donations/")) {
    return (
      <div className="animate-in fade-in duration-150">
        <DetailSkeleton label="Loading donation verification details..." />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-150">
      <TableSkeleton label="Loading section data..." rows={6} />
    </div>
  );
}
