import { useNavigate } from 'react-router-dom';
import { useActivityStore } from '@/store/activityStore';
import { ACTIVITY_DOT_COLOR } from '@/mocks/activities';
import { Avatar } from '@/components/ui/Avatar';
import { classNames, relativeTime } from '@/lib/format';
import { useEffect, useState } from 'react';

interface Props {
  limit?: number;
  title?: string;
}

export function ActivityFeed({ limit = 8, title = '实时动态' }: Props) {
  const items = useActivityStore((s) => s.items).slice(0, limit);
  const nav = useNavigate();
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 20_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          {title}
        </h3>
        <span className="text-xs text-slate-400">实时</span>
      </div>
      <div className="space-y-3">
        {items.map((a, idx) => (
          <div
            key={a.id}
            onClick={() => a.link && nav(a.link)}
            className={classNames(
              'flex items-start gap-3 text-xs',
              a.link && 'cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded-lg transition',
              idx === 0 && 'slide-in',
            )}
          >
            <div className="relative">
              <Avatar name={a.actorName} color={a.actorColor} size={28} />
              <span className={classNames('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white', ACTIVITY_DOT_COLOR[a.kind])} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-600">
                <span className="text-slate-800 font-medium">{a.actorName}</span>{' '}
                {a.text}{' '}
                {a.targetLabel && <span className="text-brand-600">{a.targetLabel}</span>}
              </div>
              <div className="text-slate-400 mt-0.5">{relativeTime(a.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
