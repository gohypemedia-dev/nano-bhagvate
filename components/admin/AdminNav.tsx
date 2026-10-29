"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, Images, Calendar, Package, Users, Loader2, type LucideIcon } from "lucide-react";

// Swaps the tab icon for a spinner (same size, so no layout shift) while the clicked page loads.
function NavIcon({ icon: Icon }: { icon: LucideIcon }) {
  const { pending } = useLinkStatus();
  const cls = "w-3.5 h-3.5 sm:w-4 sm:h-4";
  return pending ? <Loader2 className={`${cls} animate-spin`} aria-label="Loading" /> : <Icon className={cls} />;
}

export default function AdminNav() {
  const pathname = usePathname();

  const isDonations = pathname === "/admin" || pathname.startsWith("/admin/donations");
  const isMembers = pathname.startsWith("/admin/members");
  const isOrders = pathname.startsWith("/admin/orders");
  const isEvents = pathname.startsWith("/admin/events");
  const isGallery = pathname.startsWith("/admin/gallery");

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
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
              link.active
                ? "bg-[#2B201A] text-white shadow-xs"
                : "text-[#2B201A]/70 hover:text-[#2B201A] hover:bg-[#FBF2E7]"
            }`}
          >
            <NavIcon icon={link.icon} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
