import Link from "next/link";
import { requireAdminPage } from "@/lib/server/auth";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminNav from "@/components/admin/AdminNav";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();

  return (
    <div className="min-h-[100dvh] bg-[#FAF6F0]">
      <header className="bg-white border-b border-[#E7D8C8] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/admin" className="font-editorial text-lg sm:text-xl font-bold text-[#2B201A] shrink-0">
              Namo Bhagwate <span className="text-[#E86F1D] text-xs uppercase tracking-wider font-sans font-bold ml-1 px-1.5 py-0.5 rounded bg-[#FBF2E7] border border-[#E7D8C8]">Admin</span>
            </Link>
            <AdminNav />
          </div>
          <div className="flex items-center gap-3 text-sm text-[#2B201A]/70 min-w-0">
            <span className="hidden sm:inline truncate text-xs font-semibold">{admin.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}

