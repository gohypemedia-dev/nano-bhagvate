import Link from "next/link";
import { requireAdminPage } from "@/lib/server/auth";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();

  return (
    <div className="min-h-[100dvh]">
      <header className="bg-white border-b border-[#E7D8C8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/admin" className="font-editorial text-xl font-bold text-[#2B201A]">
            Donations admin
          </Link>
          <div className="flex items-center gap-2 text-sm text-[#2B201A]/70 min-w-0">
            <span className="hidden sm:inline truncate">{admin.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}
