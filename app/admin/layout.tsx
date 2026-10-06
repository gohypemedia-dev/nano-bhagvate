import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donations Admin | Namo Bhagwate Vasudevaya Trust",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 w-full bg-[#FAF6F0]">{children}</div>;
}
