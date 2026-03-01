export function LoadingSkeleton() {
  const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  return (
    <div className="space-y-3">
      {/* Fill risk banner skeleton */}
      <div className={`h-20 bg-slate-100 rounded-2xl ${shimmerClass}`} />
      {/* Two-column cards skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`h-28 bg-slate-100 rounded-2xl ${shimmerClass}`} />
        <div className={`h-28 bg-slate-100 rounded-2xl ${shimmerClass}`} />
      </div>
      {/* Alternatives skeleton */}
      <div className={`h-12 bg-slate-100 rounded-2xl ${shimmerClass}`} />
    </div>
  );
}
