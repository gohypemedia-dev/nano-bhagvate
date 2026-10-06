"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
        router.replace("/admin/login");
        router.refresh();
      }}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2B201A]/70 hover:text-[#E86F1D] px-3 py-2 rounded-lg hover:bg-[#FBF2E7]"
    >
      <LogOut className="w-4 h-4" />
      Log out
    </button>
  );
}
