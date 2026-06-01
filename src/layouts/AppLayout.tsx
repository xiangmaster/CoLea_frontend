import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/nav/Sidebar';
import { Topbar } from '@/components/nav/Topbar';
import { LivePusher } from '@/components/nav/LivePusher';
import { useAuthStore } from '@/store/authStore';

export function AppLayout({ variant }: { variant: 'student' | 'teacher' }) {
  const role = useAuthStore((s) => s.role);
  if (!role) return <Navigate to="/login" replace />;
  if (variant === 'student' && role !== 'student') return <Navigate to="/teacher/dashboard" replace />;
  if (variant === 'teacher' && role !== 'teacher') return <Navigate to="/app/dashboard" replace />;
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar variant={variant} />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Topbar />
        {/* 背景柔光：左上和右下两块浅色渐变，让内容浮在上面 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-20 w-[36rem] h-[36rem] bg-brand-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-sky-100/40 rounded-full blur-3xl" />
        </div>
        <main className="flex-1 overflow-auto relative bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
          <Outlet />
        </main>
      </div>
      <LivePusher />
    </div>
  );
}
