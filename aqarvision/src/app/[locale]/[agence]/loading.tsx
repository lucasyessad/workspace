export default function AgenceLoading() {
  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* Skeleton header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-5 py-8">
          <div className="flex items-center gap-4">
            {/* Logo circle */}
            <div className="w-16 h-16 rounded-full animate-pulse bg-muted" />
            <div className="space-y-2">
              <div className="h-6 w-48 animate-pulse bg-muted rounded" />
              <div className="h-3 w-32 animate-pulse bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton property cards */}
      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="h-5 w-40 animate-pulse bg-muted rounded mb-6" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
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
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-6 w-24 animate-pulse bg-muted rounded-full" />
                  <div className="h-6 w-16 animate-pulse bg-muted rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
