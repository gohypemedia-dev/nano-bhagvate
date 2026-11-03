"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useTransition,
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
  const [isPending, startTransition] = useTransition();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Clear pending state when current pathname and query match the destination
  const fullCurrentPath = `${pathname}${
    searchParams?.toString() ? `?${searchParams.toString()}` : ""
  }`;

  useEffect(() => {
    if (pendingPath && fullCurrentPath === pendingPath) {
      setPendingPath(null);
    }
  }, [fullCurrentPath, pendingPath]);

  // Fallback safety: clear pending after 8 seconds if navigation stalled
  useEffect(() => {
    if (!pendingPath) return;
    const timer = setTimeout(() => {
      setPendingPath(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [pendingPath]);

  const navigate = useCallback(
    (href: string) => {
      if (href === fullCurrentPath) return;
      setPendingPath(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [fullCurrentPath, router]
  );

  const isNavigating = Boolean(pendingPath && pendingPath !== fullCurrentPath) || isPending;

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
      setProgress(20);
      timer = setTimeout(() => {
        setProgress(75);
      }, 150);
    } else {
      setProgress(100);
      timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
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
 * When navigating to a new section, immediately displays the preloader matching that section!
 */
export function AdminContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pendingPath } = useAdminNavigation();

  const fullCurrentPath = `${pathname}${
    searchParams?.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const isNavigatingToNewSection = Boolean(
    pendingPath && pendingPath !== fullCurrentPath
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

  if (cleanPath === "/admin" || cleanPath.startsWith("/admin?")) {
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

