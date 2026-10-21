// Placeholder shapes shown by the admin loading.tsx files while a page's data loads.

function Bar({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-md bg-[#E7D8C8]/70 animate-pulse ${className}`} style={style} />;
}

function Header() {
  return (
    <div className="space-y-2">
      <Bar className="h-8 w-64 max-w-full" />
      <Bar className="h-4 w-96 max-w-full" />
    </div>
  );
}

function Stats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white px-4 py-3 rounded-2xl border border-[#E7D8C8] space-y-2">
          <Bar className="h-3 w-24" />
          <Bar className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

function LoadingNote({ label }: { label: string }) {
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-[#2B201A]/60">
      <span className="w-4 h-4 rounded-full border-2 border-[#E86F1D] border-t-transparent animate-spin" />
      {label}
    </p>
  );
}

export function TableSkeleton({ label, rows = 8, stats = true }: { label: string; rows?: number; stats?: boolean }) {
  return (
    <div className="space-y-5">
      <Header />
      {stats && <Stats />}
      <LoadingNote label={label} />
      <div className="bg-white rounded-2xl border border-[#E7D8C8] overflow-hidden">
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#E7D8C8]">
          <div className="flex gap-1.5">
            {[64, 110, 56, 120].map((w) => (
              <Bar key={w} className="h-8" style={{ width: w }} />
            ))}
          </div>
          <Bar className="h-9 w-72 max-w-full" />
        </div>
        <ul className="divide-y divide-[#E7D8C8]">
          {Array.from({ length: rows }, (_, i) => (
            <li key={i} className="grid grid-cols-2 md:grid-cols-6 gap-4 px-4 py-4 items-center">
              <div className="space-y-1.5">
                <Bar className="h-4 w-36" />
                <Bar className="h-3 w-24" />
              </div>
              <div className="space-y-1.5">
                <Bar className="h-4 w-28" />
                <Bar className="h-3 w-20" />
              </div>
              <Bar className="hidden md:block h-4 w-full" />
              <Bar className="hidden md:block h-4 w-16 justify-self-end" />
              <Bar className="hidden md:block h-6 w-28 rounded-full" />
              <Bar className="hidden md:block h-8 w-full rounded-lg" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ label, cards = 6 }: { label: string; cards?: number }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Header />
        <Bar className="h-10 w-36 rounded-xl" />
      </div>
      <LoadingNote label={label} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E7D8C8] overflow-hidden">
            <Bar className="h-40 w-full rounded-none" />
            <div className="p-4 space-y-2">
              <Bar className="h-5 w-3/4" />
              <Bar className="h-3 w-1/2" />
              <Bar className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-5">
      <Bar className="h-4 w-32" />
      <Header />
      <LoadingNote label={label} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E7D8C8] p-5 space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex justify-between gap-4">
              <Bar className="h-4 w-32" />
              <Bar className="h-4 w-48" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-[#E7D8C8] p-5 space-y-3">
          <Bar className="h-5 w-24" />
          <Bar className="h-10 w-full rounded-xl" />
          <Bar className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
