import { useToastStore } from '@/store/toastStore';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { classNames } from '@/lib/format';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: 'bg-green-50 text-green-700 border-green-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

export function Toaster() {
  const items = useToastStore((s) => s.items);
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {items.map((t) => {
        const Icon = ICONS[t.kind];
        return (
          <div
            key={t.id}
            className={classNames(
              'pointer-events-auto px-4 py-3 rounded-lg shadow-md border text-sm flex items-center gap-2 min-w-[240px] slide-in',
              STYLES[t.kind],
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
