import { useNavigate } from 'react-router-dom';
import { Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { NOTIFICATION_ICON } from '@/mocks/notifications';
import { Avatar } from '@/components/ui/Avatar';
import { classNames, relativeTime } from '@/lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ open, onClose }: Props) {
  const items = useNotificationStore((s) => s.items);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const clear = useNotificationStore((s) => s.clear);
  const nav = useNavigate();
  const unread = items.filter((x) => !x.read).length;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-slate-900/30" onClick={onClose} />
      <div className="w-[380px] bg-white shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800">消息中心</h3>
            {unread > 0 && (
              <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">
                {unread} 条未读
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-2 border-b border-slate-100 flex items-center gap-3 text-xs">
          <button
            onClick={markAllRead}
            disabled={unread === 0}
            className="flex items-center gap-1 text-slate-500 hover:text-brand-600 disabled:opacity-40"
          >
            <CheckCheck className="w-3.5 h-3.5" /> 全部已读
          </button>
          <button
            onClick={() => { if (confirm('清空所有消息？')) clear(); }}
            className="flex items-center gap-1 text-slate-500 hover:text-red-500"
          >
            <Trash2 className="w-3.5 h-3.5" /> 清空
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {items.length === 0 && (
            <div className="text-center text-slate-400 py-16 text-sm">暂无消息</div>
          )}
          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markRead(n.id);
                if (n.link) nav(n.link);
                if (n.link) onClose();
              }}
              className={classNames(
                'px-5 py-3 hover:bg-slate-50 cursor-pointer transition flex gap-3',
                !n.read && 'bg-brand-50/40',
              )}
            >
              {n.fromName ? (
                <Avatar name={n.fromName} color={n.fromColor ?? 'bg-slate-500'} size={32} />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-base flex-shrink-0">
                  {NOTIFICATION_ICON[n.kind]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className={classNames('text-sm', !n.read ? 'font-semibold text-slate-800' : 'text-slate-600')}>
                    {n.title}
                  </div>
                  {!n.read && <span className="w-1.5 h-1.5 bg-brand-600 rounded-full flex-shrink-0" />}
                </div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-2">{n.body}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                  <span>{relativeTime(n.createdAt)}</span>
                  {!n.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                      className="text-slate-400 hover:text-brand-600 flex items-center gap-0.5"
                    >
                      <Check className="w-3 h-3" /> 标记已读
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
