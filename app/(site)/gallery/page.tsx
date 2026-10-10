import type { Metadata } from "next";
import GalleryPageClient from "./GalleryPageClient";

export const metadata: Metadata = {
  title: "हमारी झलकियाँ | Photos & Videos Gallery - Namo Bhagwate Vasudevaya Trust",
  description:
    "हमारे आयोजनों, सेवा कार्यों और यादगार पलों की खूबसूरत झलकियाँ। Browse photos and videos of spiritual gatherings, farmer workshops, Gurukul education, and humanitarian seva initiatives.",
  openGraph: {
    title: "हमारी झलकियाँ | Photos & Videos Gallery - Namo Bhagwate Vasudevaya Trust",
    description:
      "हमारे आयोजनों, सेवा कार्यों और यादगार पलों की खूबसूरत झलकियाँ। Browse our sacred moments, satsang gatherings, and community seva initiatives.",
    url: "https://namobhagwatevasudevaya.com/gallery",
    siteName: "Namo Bhagwate Vasudevaya Trust",
    images: [
      {
        url: "/images/founder-hero-card.jpg",
        width: 1200,
        height: 630,
        alt: "Namo Bhagwate Vasudevaya Trust Gallery",
      },
    ],
  },
};

export default function GalleryPage() {
  return <GalleryPageClient />;
}
