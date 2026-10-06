import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import DonateModal from "@/components/DonateModal";
import { publicDonationConfig } from "@/lib/server/env";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const { minAmount } = publicDonationConfig();
  return (
    <>
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <CartDrawer />
      <DonateModal minAmount={minAmount} />
    </>
  );
}
