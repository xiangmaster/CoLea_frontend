import { useDocStore } from '@/store/docStore';
import { Avatar } from '@/components/ui/Avatar';
import { relativeTime } from '@/lib/format';
import { History, X, RotateCcw } from 'lucide-react';
import { toast } from '@/store/toastStore';

interface Props {
  docId: string;
  open: boolean;
  onClose: () => void;
}

export function VersionHistoryDrawer({ docId, open, onClose }: Props) {
  const versions = useDocStore((s) => s.versions.filter((v) => v.docId === docId));
  const restore = useDocStore((s) => s.restoreVersion);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-slate-900/30" onClick={onClose} />
      <div className="w-[360px] bg-white shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-600" />
            <h3 className="font-semibold text-slate-800">版本历史</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {versions.map((v, i) => (
            <div key={v.id} className="border border-slate-100 rounded-lg p-3 hover:border-brand-200 transition">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-800">{v.label}</div>
                <span className="text-xs text-slate-400">{relativeTime(v.savedAt)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Avatar name={v.authorName} color="bg-slate-500" size={20} />
                <span className="text-xs text-slate-500">{v.authorName}</span>
              </div>
              <div className="text-xs text-slate-500 mt-2 italic">"{v.summary}"</div>
              {i > 0 && (
                <button
                  onClick={() => {
                    restore(v.id);
                    toast.success(`已恢复到 ${v.label}`);
                    onClose();
                  }}
                  className="mt-3 text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> 恢复此版本
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
