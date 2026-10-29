import { Loader2 } from "lucide-react";

export default function MembersLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#E86F1D]" />
      <p className="text-sm font-semibold text-[#2B201A]/60">Loading Member Management...</p>
    </div>
  );
}

