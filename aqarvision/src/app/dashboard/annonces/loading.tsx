export default function AnnoncesLoading() {
  return (
    <div>
      {/* Header area */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-36 animate-pulse bg-muted rounded" />
        <div className="h-9 w-40 animate-pulse bg-muted rounded-lg" />
      </div>

      {/* Skeleton card grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-white overflow-hidden"
          >
            {/* Skeleton image */}
            <div className="h-48 bg-muted animate-pulse" />

            {/* Skeleton content */}
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 animate-pulse bg-muted rounded" />
              <div className="h-3 w-1/2 animate-pulse bg-muted rounded" />
              <div className="h-3 w-2/3 animate-pulse bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
