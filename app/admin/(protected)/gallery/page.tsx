import { requireAdminPage } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { isR2Configured, getR2PublicBaseUrl } from "@/lib/server/r2";
import GalleryManager, { AdminGalleryItem } from "@/components/admin/gallery/GalleryManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gallery Management | Namo Bhagwate Admin",
};

export default async function AdminGalleryPage() {
  await requireAdminPage();

  const rawItems = await prisma.galleryItem.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  const formattedItems: AdminGalleryItem[] = rawItems.map((item) => ({
    id: item.id,
    type: item.type === "PHOTO" ? "PHOTO" : "VIDEO",
    title: item.title,
    titleHi: item.titleHi,
    event: item.event,
    eventHi: item.eventHi,
    src: item.src,
    thumbnail: item.thumbnail,
    alt: item.alt,
    videoProvider: item.videoProvider,
    focalPoint: item.focalPoint,
    aspectRatio: item.aspectRatio,
    displayOrder: item.displayOrder,
    date: item.date,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const r2Configured = isR2Configured();
  const r2PublicUrl = getR2PublicBaseUrl();

  return (
    <GalleryManager
      initialItems={formattedItems}
      r2Configured={r2Configured}
      r2PublicUrl={r2PublicUrl}
    />
  );
}
