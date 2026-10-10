import type { Metadata } from "next";
import { prisma } from "@/lib/server/prisma";
import { galleryData, GalleryItem } from "@/data/gallery";
import GalleryPageClient from "./GalleryPageClient";

export const dynamic = "force-dynamic";

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

export default async function GalleryPage() {
  let items: GalleryItem[] = galleryData;

  try {
    const dbItems = await prisma.galleryItem.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    if (dbItems.length > 0) {
      items = dbItems.map((item) => ({
        id: item.id,
        type: item.type === "PHOTO" ? "photo" : "video",
        title: item.title,
        titleHi: item.titleHi ?? undefined,
        event: item.event ?? undefined,
        eventHi: item.eventHi ?? undefined,
        src: item.src,
        thumbnail: item.thumbnail,
        alt: item.alt,
        videoProvider: (item.videoProvider as "youtube" | "vimeo" | "mp4" | null) ?? undefined,
        focalPoint: item.focalPoint ?? undefined,
        aspectRatio: item.aspectRatio ?? undefined,
        displayOrder: item.displayOrder,
        date: item.date ?? undefined,
      }));
    }
  } catch (error) {
    console.error("Error fetching gallery items for site:", error);
    items = galleryData;
  }

  return <GalleryPageClient initialItems={items} />;
}
