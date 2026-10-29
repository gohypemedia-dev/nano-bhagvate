import Link from "next/link";
import { Toaster } from "sonner";
import { requireAdminPage } from "@/lib/server/auth";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminNav from "@/components/admin/AdminNav";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();

  return (
    <div className="min-h-[100dvh] bg-[#FAF6F0]">
      <Toaster richColors position="top-right" closeButton />
      <header className="bg-white border-b border-[#E7D8C8] sticky top-0 z-40 shadow-xs">
        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link href="/admin" className="font-editorial text-base sm:text-xl font-bold text-[#2B201A] shrink-0 flex items-center gap-1 sm:gap-1.5">
              <span>Namo Bhagwate</span>
              <span className="text-[#E86F1D] text-[10px] sm:text-xs uppercase tracking-wider font-sans font-bold px-1.5 py-0.5 rounded bg-[#FBF2E7] border border-[#E7D8C8]">
                Admin
              </span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <AdminNav />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-sm text-[#2B201A]/70 shrink-0">
            <span className="hidden sm:inline truncate text-xs font-semibold">{admin.name}</span>
            <LogoutButton />
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="lg:hidden border-t border-[#E7D8C8]/60 bg-[#FFFDF9] px-3 py-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          <AdminNav />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">{children}</main>
    </div>
  );
}
