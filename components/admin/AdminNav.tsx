"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, Images, ExternalLink } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();

  const isDonations = pathname === "/admin" || pathname.startsWith("/admin/donations");
  const isGallery = pathname.startsWith("/admin/gallery");

  const links = [
    {
      href: "/admin",
      label: "Donations",
      active: isDonations,
      icon: HeartHandshake,
    },
    {
      href: "/admin/gallery",
      label: "Gallery",
      active: isGallery,
      icon: Images,
    },
  ];

  return (
    <nav className="flex items-center gap-1.5 sm:gap-2">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
              link.active
                ? "bg-[#2B201A] text-white shadow-xs"
                : "text-[#2B201A]/70 hover:text-[#2B201A] hover:bg-[#FBF2E7]"
            }`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{link.label}</span>
          </Link>
        );
      })}

      <Link
        href="/gallery"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#2B201A]/60 hover:text-[#E86F1D] hover:bg-[#FBF2E7] transition-colors ml-1"
        title="View live website gallery in a new tab"
      >
        <span>View Site</span>
        <ExternalLink className="w-3 h-3" />
      </Link>
    </nav>
  );
}
