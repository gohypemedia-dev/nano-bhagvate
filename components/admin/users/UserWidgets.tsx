import Link from "next/link";

export const panelClass = "rounded-2xl border border-[#E7D8C8] bg-white overflow-hidden";
export const cellClass = "px-4 py-3 text-left align-top";

export function UserStatus({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full bg-[#FBF2E7] px-2.5 py-1 text-xs font-semibold text-[#704522]">{children}</span>;
}

export function UserStats({ stats }: { stats: { label: string; value: React.ReactNode }[] }) {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{stats.map((stat) => (
    <div key={stat.label} className={`${panelClass} p-4`}>
      <p className="text-xs font-semibold text-[#2B201A]/60">{stat.label}</p>
      <p className="mt-2 text-xl sm:text-2xl font-bold text-[#2B201A]">{stat.value}</p>
    </div>
  ))}</div>;
}

export function UserPagination({ page, total, pageSize, href }: {
  page: number; total: number; pageSize: number; href: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const cls = "rounded-lg border border-[#E7D8C8] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#FBF2E7]";
  return <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#2B201A]/70">
    <p>{total.toLocaleString("en-IN")} records · Page {page} of {pages}</p>
    <div className="flex gap-2">
      {page > 1 && <Link className={cls} href={href(page - 1)}>Previous</Link>}
      {page < pages && <Link className={cls} href={href(page + 1)}>Next</Link>}
    </div>
  </nav>;
}

export function UserEmpty({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-12 text-center text-sm text-[#2B201A]/60">{children}</p>;
}
