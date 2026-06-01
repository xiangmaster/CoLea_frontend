import { Bell, LogOut, Search, Command as CommandIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore, useCurrentUser } from '@/store/authStore';
import { useUnreadCount } from '@/store/notificationStore';
import { NotificationsDrawer } from '@/components/nav/NotificationsDrawer';
import { openCommandPalette } from '@/components/nav/CommandPalette';
import { toast } from '@/store/toastStore';

export function Topbar({ subtitle }: { subtitle?: string }) {
  const user = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const nav = useNavigate();
  const unread = useUnreadCount();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPod|iPad/.test(navigator.platform));
  }, []);

  return (
    <>
      <div className="h-14 px-6 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div className="text-sm text-slate-500">{subtitle ?? ' '}</div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCommandPalette}
            className="hidden md:flex items-center gap-2 pl-3 pr-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl w-80 text-slate-400 hover:text-slate-600 hover:border-brand-300 hover:bg-white transition"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">搜索课程 / 任务 / 文档 / 用户</span>
            <kbd className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              {isMac ? '⌘' : 'Ctrl'} K
            </kbd>
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 relative"
            title="消息中心"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {user && (
            <button
              onClick={() => nav(user.role === 'teacher' ? '/teacher/dashboard' : '/app/profile')}
              className="flex items-center gap-2"
            >
              <Avatar name={user.name} color={user.avatarColor} size={32} />
              <div className="hidden md:block text-left">
                <div className="text-xs text-slate-700 leading-none">{user.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {user.role === 'teacher' ? '教师' : '学生'} · {user.studentNo ?? user.staffNo}
                </div>
              </div>
            </button>
          )}
          <button
            onClick={() => setConfirmOpen(true)}
            className="text-slate-400 hover:text-slate-700 text-sm flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" /> 退出
          </button>
          <button
            onClick={openCommandPalette}
            className="md:hidden w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
            title="搜索"
          >
            <CommandIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <NotificationsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="退出登录"
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800">
              取消
            </button>
            <button
              onClick={() => {
                logout();
                toast.success('已退出登录');
                nav('/login');
              }}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              确认退出
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">确认要退出当前账号吗？本地草稿与未保存的更改将会保留。</p>
      </Modal>
    </>
  );
}
