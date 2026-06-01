import type { ReactNode } from 'react';

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">📭</div>
      <div className="mt-3 font-medium text-slate-700">{title}</div>
      {hint && <div className="text-sm text-slate-400 mt-1 max-w-xs">{hint}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
