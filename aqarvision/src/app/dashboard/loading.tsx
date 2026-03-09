export default function DashboardLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 animate-pulse bg-muted rounded" />
        <div className="h-9 w-40 animate-pulse bg-muted rounded-lg" />
      </div>

      {/* Skeleton KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border bg-white"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-20 animate-pulse bg-muted rounded" />
              <div className="h-4 w-4 animate-pulse bg-muted rounded" />
            </div>
            <div className="h-7 w-16 animate-pulse bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Skeleton chart / recent list areas */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white h-64">
          <div className="px-5 py-4 border-b border-border">
            <div className="h-4 w-32 animate-pulse bg-muted rounded" />
          </div>
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3 animate-pulse bg-muted rounded" style={{ width: `${85 - i * 10}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white h-64">
          <div className="px-5 py-4 border-b border-border">
            <div className="h-4 w-28 animate-pulse bg-muted rounded" />
          </div>
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3 animate-pulse bg-muted rounded" style={{ width: `${90 - i * 12}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
