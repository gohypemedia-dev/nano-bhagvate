import { CardGridSkeleton } from "@/components/admin/AdminSkeleton";

export default function Loading() {
  return <CardGridSkeleton label="Loading gallery…" cards={9} />;
}
