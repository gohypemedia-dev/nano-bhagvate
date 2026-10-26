import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import DonateModal from "@/components/DonateModal";
import AuthModal from "@/components/AuthModal";
import { publicDonationConfig } from "@/lib/server/env";
import SmoothScrollProvider from "@/components/animation/SmoothScrollProvider";
import Preloader from "@/components/animation/Preloader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const { minAmount } = publicDonationConfig();
  return (
    <SmoothScrollProvider>
      <Preloader />
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <CartDrawer />
      <DonateModal minAmount={minAmount} />
      <AuthModal />
    </SmoothScrollProvider>
  );
}

