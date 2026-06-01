import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  ClipboardList,
  FileText,
  BarChart3,
  Bot,
  Users,
  AlertTriangle,
  PencilLine,
  Megaphone,
  User as UserIcon,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { classNames } from '@/lib/format';
import { useCurrentUser } from '@/store/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const STUDENT_NAV: NavItem[] = [
  { to: '/app/dashboard', label: '仪表盘', icon: Home },
  { to: '/app/courses/c-se', label: '课程', icon: BookOpen },
  { to: '/app/tasks', label: '任务', icon: ClipboardList },
  { to: '/app/docs', label: '文档', icon: FileText },
  { to: '/app/analytics', label: '数据分析', icon: BarChart3 },
  { to: '/app/ai', label: 'AI 导学', icon: Bot },
  { to: '/app/profile', label: '个人中心', icon: UserIcon },
];

const TEACHER_NAV: NavItem[] = [
  { to: '/teacher/dashboard', label: '仪表盘', icon: Home },
  { to: '/teacher/courses/c-se', label: '课程管理', icon: BookOpen },
  { to: '/teacher/groups/c-se', label: '小组', icon: Users },
  { to: '/teacher/tasks/c-se', label: '任务发布', icon: ClipboardList },
  { to: '/teacher/grading', label: '评分中心', icon: PencilLine },
  { to: '/teacher/announcements', label: '公告管理', icon: Megaphone },
  { to: '/teacher/analytics', label: '数据分析', icon: BarChart3 },
  { to: '/teacher/risk', label: 'AI 风险', icon: AlertTriangle },
];

export function Sidebar({ variant }: { variant: 'student' | 'teacher' }) {
  const items = variant === 'teacher' ? TEACHER_NAV : STUDENT_NAV;
  const user = useCurrentUser();
  return (
    <aside className="w-60 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col flex-shrink-0 relative overflow-hidden">
      {/* 顶部蓝色柔光 */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="p-5 flex items-center gap-3 border-b border-slate-700/40 relative">
        <Logo size={36} showText={false} />
        <span className="font-bold text-lg text-white">CoLea</span>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto relative">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'nav-active text-white font-medium shadow-md shadow-brand-900/30'
                  : 'text-white/60 hover:text-white/95 hover:bg-white/5',
              )
            }
          >
            <it.icon className="w-5 h-5" />
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className="p-4 border-t border-slate-700/40 relative">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-white/5">
            <Avatar name={user.name} color={user.avatarColor} size={32} />
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-white/50 truncate">
                {variant === 'teacher' ? `教师 · ${user.staffNo}` : `学生 · ${user.studentNo}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
