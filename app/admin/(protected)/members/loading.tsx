import { TableSkeleton } from "@/components/admin/AdminSkeleton";

export default function MembersLoading() {
  return <TableSkeleton label="Loading member directory & records..." stats={false} />;
}
