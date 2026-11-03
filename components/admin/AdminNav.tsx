"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartHandshake,
  Images,
  Calendar,
  Package,
  Users,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useAdminNavigation } from "./AdminNavigationContext";

export default function AdminNav() {
  const pathname = usePathname();
  const { pendingPath, navigate } = useAdminNavigation();

  // Active state tracks optimistic pending path immediately on click
  const effectivePath = pendingPath || pathname;

  const isDonations =
    effectivePath === "/admin" || effectivePath.startsWith("/admin/donations");
  const isMembers = effectivePath.startsWith("/admin/members");
  const isOrders = effectivePath.startsWith("/admin/orders");
  const isEvents = effectivePath.startsWith("/admin/events");
  const isGallery = effectivePath.startsWith("/admin/gallery");

  const links = [
    {
      href: "/admin",
      label: "Donations",
      active: isDonations,
      icon: HeartHandshake,
    },
    {
      href: "/admin/members",
      label: "Members",
      active: isMembers,
      icon: Users,
    },
    {
      href: "/admin/orders",
      label: "Book Orders",
      active: isOrders,
      icon: Package,
    },
    {
      href: "/admin/events",
      label: "Events",
      active: isEvents,
      icon: Calendar,
    },
    {
      href: "/admin/gallery",
      label: "Gallery",
      active: isGallery,
      icon: Images,
    },
  ];

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {links.map((link) => {
        const isThisPending = Boolean(
          pendingPath &&
            (pendingPath === link.href ||
              (link.href !== "/admin" && pendingPath.startsWith(link.href)))
        );

        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch={true}
            onClick={(e) => {
              // Trigger instant optimistic section transition and preloader
              e.preventDefault();
              navigate(link.href);
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              link.active
                ? "bg-[#2B201A] text-white shadow-xs"
                : "text-[#2B201A]/70 hover:text-[#2B201A] hover:bg-[#FBF2E7]"
            }`}
          >
            {isThisPending ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-[#E86F1D]" />
            ) : (
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
