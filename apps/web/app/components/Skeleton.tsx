export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-4 w-20 rounded bg-slate-200" />
      <div className="mb-3 h-6 w-3/4 rounded bg-slate-200" />
      <div className="mb-2 h-4 w-full rounded bg-slate-200" />
      <div className="mb-2 h-4 w-5/6 rounded bg-slate-200" />
      <div className="mt-4 h-4 w-24 rounded bg-slate-200" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <div className="h-5 w-48 rounded bg-slate-200" />
        <div className="h-4 w-32 rounded bg-slate-200" />
      </div>
      <div className="h-8 w-20 rounded bg-slate-200" />
    </div>
  );
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
