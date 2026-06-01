import { classNames } from '@/lib/format';

export function Skeleton({ className, h = 16, w }: { className?: string; h?: number; w?: number | string }) {
  return (
    <div
      className={classNames('animate-pulse bg-slate-200 rounded', className)}
      style={{ height: h, width: w }}
    />
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-3">
      <Skeleton w="40%" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} w={i === rows - 1 ? '70%' : '100%'} />
      ))}
    </div>
  );
}
