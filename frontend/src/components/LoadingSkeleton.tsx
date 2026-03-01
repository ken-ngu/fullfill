export function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Fill risk banner skeleton */}
      <div className="h-20 bg-slate-100 rounded-2xl" />
      {/* Two-column cards skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 bg-slate-100 rounded-2xl" />
        <div className="h-28 bg-slate-100 rounded-2xl" />
      </div>
      {/* Alternatives skeleton */}
      <div className="h-12 bg-slate-100 rounded-2xl" />
    </div>
  );
}
