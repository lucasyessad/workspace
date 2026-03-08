"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

function SkeletonBase({ className = "" }: { className?: string }) {
  return (
    <div
      className={`shimmer rounded-lg bg-[var(--color-surface-active)] ${className}`}
      role="status"
      aria-label="Chargement..."
    />
  );
}

export default function Skeleton({ className = "", variant = "text", width, height, lines = 1 }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  if (variant === "circular") {
    return <SkeletonBase className={`!rounded-full aspect-square ${className}`} />;
  }

  if (variant === "card") {
    return (
      <div className={`surface-card p-5 space-y-4 animate-pulse ${className}`} role="status" aria-label="Chargement...">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg shimmer bg-[var(--color-surface-active)]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 shimmer rounded bg-[var(--color-surface-active)]" />
            <div className="h-2 w-1/3 shimmer rounded bg-[var(--color-surface-active)]" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 shimmer rounded bg-[var(--color-surface-active)]" />
          <div className="h-2 w-4/5 shimmer rounded bg-[var(--color-surface-active)]" />
        </div>
      </div>
    );
  }

  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} role="status" aria-label="Chargement...">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBase
            key={i}
            className={`h-3 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
          />
        ))}
      </div>
    );
  }

  return <SkeletonBase className={className} />;
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" role="status" aria-label="Chargement du tableau de bord...">
      {/* Topbar skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg shimmer bg-[var(--color-surface-active)]" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 shimmer rounded bg-[var(--color-surface-active)]" />
            <div className="h-2.5 w-48 shimmer rounded bg-[var(--color-surface-active)]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 shimmer rounded-xl bg-[var(--color-surface-active)]" />
          <div className="h-9 w-9 shimmer rounded-xl bg-[var(--color-surface-active)]" />
        </div>
      </div>

      {/* Score skeleton */}
      <div className="surface-card p-6 mb-8">
        <div className="h-4 w-52 shimmer rounded bg-[var(--color-surface-active)] mb-4" />
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="w-36 h-36 rounded-full shimmer bg-[var(--color-surface-active)]" />
          <div className="flex-1 w-full space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2.5 w-24 shimmer rounded bg-[var(--color-surface-active)]" />
                <div className="h-1.5 rounded-full shimmer bg-[var(--color-surface-active)]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress skeleton */}
      <div className="mb-10">
        <div className="flex justify-between mb-2">
          <div className="h-3 w-32 shimmer rounded bg-[var(--color-surface-active)]" />
          <div className="h-3 w-20 shimmer rounded bg-[var(--color-surface-active)]" />
        </div>
        <div className="h-2 shimmer rounded-full bg-[var(--color-surface-active)]" />
      </div>

      {/* Module grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    </div>
  );
}

export function ModulePageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-fade-in" role="status" aria-label="Chargement du module...">
      <div className="h-8 w-28 shimmer rounded-xl bg-[var(--color-surface-active)] mb-6" />
      <div className="flex items-start gap-4 mb-8">
        <div className="w-10 h-10 shimmer rounded-lg bg-[var(--color-surface-active)]" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-32 shimmer rounded bg-[var(--color-surface-active)]" />
          <div className="h-5 w-64 shimmer rounded bg-[var(--color-surface-active)]" />
          <div className="h-3 w-96 shimmer rounded bg-[var(--color-surface-active)]" />
        </div>
      </div>
      <div className="space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-40 shimmer rounded bg-[var(--color-surface-active)]" />
            <div className="h-10 shimmer rounded-xl bg-[var(--color-surface-active)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
