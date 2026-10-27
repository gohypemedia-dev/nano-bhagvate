import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const poppins = Poppins({
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Namo Bhagwate Vasudevaya Trust | Dharma, Seva & Community Service",
  description:
    "Guided by the timeless wisdom of the Bhagavad Gita, Namo Bhagwate Vasudevaya Trust works to uplift lives through spiritual education, community service, women and youth empowerment, farmer welfare, and compassionate action.",
  keywords: [
    "Namo Bhagwate Vasudevaya Trust",
    "Pujya Sadhvi Vijeshanand Saraswati Ji",
    "Bhagavad Gita",
    "Seva",
    "Sugarcane Farming Guide",
    "Farmer Welfare",
    "Women Empowerment",
    "Gurukul Education",
  ],
  authors: [{ name: "Namo Bhagwate Vasudevaya Trust" }],
  openGraph: {
    title: "Namo Bhagwate Vasudevaya Trust | Rooted in Dharma, Dedicated to Seva",
    description:
      "A spiritual and charitable trust empowering communities through spiritual learning, farmer guidance, youth mentorship, and humanitarian service.",
    url: "https://namobhagwatevasudevaya.com",
    siteName: "Namo Bhagwate Vasudevaya Trust",
    images: [
      {
        url: "/images/logo.jpg",
        width: 800,
        height: 800,
        alt: "Namo Bhagwate Vasudevaya Trust Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} font-sans h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#FFF9F2] text-[#2B201A]">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
