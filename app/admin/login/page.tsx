import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/server/auth";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white border border-[#E7D8C8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">Namo Bhagwate Vasudevaya Trust</p>
          <h1 className="font-editorial text-3xl font-bold text-[#2B201A]">Donations admin</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
