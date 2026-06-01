import { useEffect, useState } from 'react';
import { Activity, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { clearTraces, subscribeTraces, type ApiTraceEntry } from '@/lib/api';
import { classNames } from '@/lib/format';
import { showDemoToolbar } from '@/lib/demo';

const METHOD_COLOR: Record<string, string> = {
  GET: 'text-emerald-600 bg-emerald-50',
  POST: 'text-blue-600 bg-blue-50',
  PATCH: 'text-amber-600 bg-amber-50',
  DELETE: 'text-red-600 bg-red-50',
};

export function ApiTracePanel() {
  const [entries, setEntries] = useState<ApiTraceEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => subscribeTraces(setEntries), []);

  if (!showDemoToolbar() || collapsed) {
    return collapsed ? (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed left-3 bottom-3 z-50 w-9 h-9 rounded-full bg-slate-800 text-white shadow-lg flex items-center justify-center"
        title="展开 API 追踪"
      >
        <Activity className="w-4 h-4" />
      </button>
    ) : null;
  }

  const errorCount = entries.filter((e) => !e.ok).length;
  const avgMs = entries.length ? Math.round(entries.reduce((s, e) => s + e.durationMs, 0) / entries.length) : 0;

  return (
    <div className="fixed left-3 bottom-3 z-50 select-none">
      <div className={classNames('w-[360px] bg-slate-900/95 backdrop-blur text-slate-200 rounded-xl shadow-2xl border border-slate-700 overflow-hidden transition-all', !open && 'h-10')}>
        <div className="px-3 h-10 flex items-center justify-between border-b border-slate-700/60">
          <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">API Trace</span>
            <span className="text-slate-400">· {entries.length} 条</span>
            {avgMs > 0 && <span className="text-slate-500">· {avgMs}ms avg</span>}
            {errorCount > 0 && <span className="text-red-400">· {errorCount} 错误</span>}
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={clearTraces}
              className="w-6 h-6 rounded hover:bg-slate-700 flex items-center justify-center"
              title="清空"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="w-6 h-6 rounded hover:bg-slate-700 flex items-center justify-center"
              title="最小化"
            >
              −
            </button>
          </div>
        </div>
        {open && (
          <div className="max-h-72 overflow-y-auto text-[11px] font-mono">
            {entries.length === 0 && <div className="px-3 py-6 text-slate-500 text-center">还没有请求</div>}
            {entries.map((e) => (
              <div key={e.id} className="px-3 py-1.5 border-b border-slate-800/80 hover:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className={classNames('px-1.5 py-0.5 rounded text-[10px] font-semibold', METHOD_COLOR[e.method] ?? 'text-slate-300 bg-slate-700')}>
                    {e.method}
                  </span>
                  <span className="truncate flex-1 text-slate-200">{e.path}</span>
                  <span className={classNames(e.ok ? 'text-emerald-400' : 'text-red-400')}>{e.status}</span>
                  <span className="text-slate-400">{e.durationMs}ms</span>
                </div>
                <div className="text-slate-500 text-[10px] mt-0.5">trace: {e.traceId}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
