export default function SkeletonCard() {
  return (
    <div className="bg-[#0D1424]/80 rounded-2xl border border-slate-800/80 overflow-hidden" aria-hidden="true">
      {/* Image skeleton */}
      <div className="aspect-[4/3] skeleton-shimmer bg-slate-800/60" />
      {/* Content skeleton */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="h-4 skeleton-shimmer rounded-full w-3/4 bg-slate-800/60" />
        <div className="h-3 skeleton-shimmer rounded-full w-1/2 bg-slate-800/50" />
        <div className="space-y-2 pt-2">
          <div className="h-3 skeleton-shimmer rounded-full w-full bg-slate-800/50" />
          <div className="h-3 skeleton-shimmer rounded-full w-4/5 bg-slate-800/50" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-5 skeleton-shimmer rounded-md w-14 bg-slate-800/60" />
          <div className="h-5 skeleton-shimmer rounded-md w-16 bg-slate-800/60" />
          <div className="h-5 skeleton-shimmer rounded-md w-12 bg-slate-800/60" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <div className="h-5 skeleton-shimmer rounded-md w-20 bg-slate-800/60" />
          <div className="h-8 skeleton-shimmer rounded-xl w-20 bg-slate-800/60" />
        </div>
      </div>
    </div>
  );
}
