import { useState } from 'react';
import { Wand2, RefreshCcw, Zap, ZapOff, UserCog, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { SEED_USERS } from '@/mocks/users';
import { resetAllDemoData, showDemoToolbar } from '@/lib/demo';
import { getDemoFlags, setDemoFlags } from '@/lib/api';
import { llmStatus } from '@/lib/llm';
import { toast } from '@/store/toastStore';
import { classNames } from '@/lib/format';

export function DemoToolbar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [flags, setFlagsState] = useState(getDemoFlags());
  const switchUser = useAuthStore((s) => s.switchToUser);
  const nav = useNavigate();
  const llm = llmStatus();

  if (!showDemoToolbar() || collapsed) {
    return collapsed ? (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-3 bottom-3 z-50 w-9 h-9 rounded-full bg-slate-800 text-white shadow-lg flex items-center justify-center"
        title="展开演示工具条"
      >
        <Wand2 className="w-4 h-4" />
      </button>
    ) : null;
  }

  const toggleLatency = () => {
    const next = { ...flags, latency: !flags.latency };
    setDemoFlags(next);
    setFlagsState(next);
    toast.info(next.latency ? '已开启模拟延迟' : '已关闭模拟延迟（极速模式）');
  };

  const goAs = (uid: string) => {
    switchUser(uid);
    const u = SEED_USERS.find((x) => x.id === uid);
    if (!u) return;
    nav(u.role === 'teacher' ? '/teacher/dashboard' : '/app/dashboard');
    toast.success(`已切换为 ${u.name}`);
    setOpen(false);
  };

  return (
    <div className="fixed right-3 bottom-3 z-50 select-none">
      {open && (
        <div className="mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 slide-in">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              <Wand2 className="w-4 h-4 text-brand-600" /> 演示工具
            </div>
            <span className={classNames('text-xs px-2 py-0.5 rounded-full', llm === 'online' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500')}>
              AI {llm === 'online' ? '在线' : '离线'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-slate-400">切换角色</div>
            <div className="flex flex-wrap gap-1.5">
              {SEED_USERS.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => goAs(u.id)}
                  className="text-xs px-2 py-1 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 rounded-md text-slate-600"
                >
                  {u.name}
                </button>
              ))}
              <button
                onClick={() => goAs('t-li')}
                className="text-xs px-2 py-1 bg-brand-50 hover:bg-brand-100 rounded-md text-brand-700"
              >
                李教授
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={toggleLatency}
              className="w-full flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              <span className="flex items-center gap-2 text-slate-600">
                {flags.latency ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                {flags.latency ? '模拟网络延迟（开）' : '极速模式（关）'}
              </span>
            </button>
            <button
              onClick={() => {
                if (!confirm('重置所有数据？登录态也会清除')) return;
                resetAllDemoData();
              }}
              className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
            >
              <RefreshCcw className="w-4 h-4" /> 一键重置演示数据
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-3 py-2 rounded-full bg-slate-800 hover:bg-slate-900 text-white shadow-lg flex items-center gap-1.5 text-sm"
        >
          <UserCog className="w-4 h-4" />
          演示工具
        </button>
        <button
          onClick={() => setCollapsed(true)}
          className="w-9 h-9 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 flex items-center justify-center"
          title="收起"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
