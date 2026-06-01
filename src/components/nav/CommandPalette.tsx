import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  FileText,
  User as UserIcon,
  CornerDownLeft,
  Bot,
  BarChart3,
  AlertTriangle,
  Users,
  PencilLine,
  Home,
  type LucideIcon,
} from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import { useTaskStore } from '@/store/taskStore';
import { useDocStore } from '@/store/docStore';
import { useGroupStore } from '@/store/groupStore';
import { useAuthStore, getAllUsers } from '@/store/authStore';
import { classNames } from '@/lib/format';

interface CmdItem {
  id: string;
  group: '快捷跳转' | '课程' | '任务' | '文档' | '小组' | '人员';
  label: string;
  hint?: string;
  icon: LucideIcon;
  to: string;
  keywords?: string;
}

let externalOpen: (() => void) | null = null;
export function openCommandPalette() {
  externalOpen?.();
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const role = useAuthStore((s) => s.role);
  const courses = useCourseStore((s) => s.courses);
  const tasks = useTaskStore((s) => s.tasks);
  const docs = useDocStore((s) => s.docs);
  const groups = useGroupStore((s) => s.groups);
  const users = getAllUsers();
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    externalOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      externalOpen = null;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const items = useMemo<CmdItem[]>(() => {
    const isTeacher = role === 'teacher';
    const base: CmdItem[] = isTeacher
      ? [
          { id: 'q-tdash', group: '快捷跳转', label: '教师工作台', icon: Home, to: '/teacher/dashboard' },
          { id: 'q-tgrade', group: '快捷跳转', label: '评分中心', icon: PencilLine, to: '/teacher/grading' },
          { id: 'q-trisk', group: '快捷跳转', label: 'AI 风险预警', icon: AlertTriangle, to: '/teacher/risk' },
          { id: 'q-tanalytics', group: '快捷跳转', label: '数据分析', icon: BarChart3, to: '/teacher/analytics' },
        ]
      : [
          { id: 'q-dash', group: '快捷跳转', label: '仪表盘', icon: Home, to: '/app/dashboard' },
          { id: 'q-tasks', group: '快捷跳转', label: '任务列表', icon: ClipboardList, to: '/app/tasks' },
          { id: 'q-docs', group: '快捷跳转', label: '协作文档', icon: FileText, to: '/app/docs' },
          { id: 'q-analytics', group: '快捷跳转', label: '数据分析', icon: BarChart3, to: '/app/analytics' },
          { id: 'q-ai', group: '快捷跳转', label: 'AI 导学', icon: Bot, to: '/app/ai' },
          { id: 'q-profile', group: '快捷跳转', label: '个人中心', icon: UserIcon, to: '/app/profile' },
        ];
    return [
      ...base,
      ...courses.map<CmdItem>((c) => ({
        id: `c-${c.id}`,
        group: '课程',
        label: c.name,
        hint: `${c.teacherName} · ${c.term}`,
        icon: BookOpen,
        to: isTeacher ? `/teacher/courses/${c.id}` : `/app/courses/${c.id}`,
        keywords: c.shortCode,
      })),
      ...tasks.map<CmdItem>((t) => ({
        id: `t-${t.id}`,
        group: '任务',
        label: t.title,
        hint: t.description,
        icon: ClipboardList,
        to: `/app/tasks/${t.id}`,
      })),
      ...docs.map<CmdItem>((d) => ({
        id: `d-${d.id}`,
        group: '文档',
        label: d.title,
        hint: d.version,
        icon: FileText,
        to: `/app/docs/${d.id}`,
      })),
      ...groups.map<CmdItem>((g) => ({
        id: `g-${g.id}`,
        group: '小组',
        label: g.name,
        hint: `${g.memberIds.length} 位成员 · 协作评分 ${g.collaborationScore}`,
        icon: Users,
        to: isTeacher ? `/teacher/groups/${g.courseId}` : `/app/courses/${g.courseId}/groups`,
      })),
      ...users.slice(0, 12).map<CmdItem>((u) => ({
        id: `u-${u.id}`,
        group: '人员',
        label: u.name,
        hint: u.role === 'teacher' ? `教师 · ${u.staffNo}` : `学生 · ${u.studentNo}`,
        icon: UserIcon,
        to: '/app/profile',
        keywords: `${u.account} ${u.studentNo ?? ''} ${u.staffNo ?? ''}`,
      })),
    ];
  }, [role, courses, tasks, docs, groups, users]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return items;
    return items.filter((it) => {
      const hay = `${it.label} ${it.hint ?? ''} ${it.keywords ?? ''}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [q, items]);

  const grouped = useMemo(() => {
    const g: Record<string, CmdItem[]> = {};
    filtered.forEach((it) => {
      if (!g[it.group]) g[it.group] = [];
      g[it.group].push(it);
    });
    return g;
  }, [filtered]);

  useEffect(() => { setActive(0); }, [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => Math.min(filtered.length - 1, a + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const it = filtered[active];
        if (it) {
          nav(it.to);
          setOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, active, filtered, nav]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4 bg-slate-900/40" onClick={() => setOpen(false)}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <span className="text-slate-400">🔍</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索任何内容…（课程、任务、文档、小组、人员）"
            className="flex-1 outline-none text-sm bg-transparent"
          />
          <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-400 text-sm">未匹配到结果</div>
          ) : (
            Object.entries(grouped).map(([groupName, list]) => (
              <div key={groupName} className="py-2">
                <div className="px-5 py-1 text-[10px] uppercase text-slate-400 font-medium tracking-wider">
                  {groupName} · {list.length}
                </div>
                {list.map((it) => {
                  const idx = filtered.indexOf(it);
                  const isActive = idx === active;
                  return (
                    <button
                      key={it.id}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => { nav(it.to); setOpen(false); }}
                      className={classNames(
                        'w-full flex items-center gap-3 px-5 py-2 text-sm text-left transition',
                        isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50',
                      )}
                    >
                      <it.icon className={classNames('w-4 h-4 flex-shrink-0', isActive ? 'text-brand-600' : 'text-slate-400')} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{it.label}</div>
                        {it.hint && <div className="text-xs text-slate-400 truncate">{it.hint}</div>}
                      </div>
                      {isActive && <CornerDownLeft className="w-3.5 h-3.5 text-brand-500" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-white px-1.5 py-0.5 rounded shadow-sm">↑↓</kbd> 选择</span>
            <span><kbd className="bg-white px-1.5 py-0.5 rounded shadow-sm">↵</kbd> 跳转</span>
            <span><kbd className="bg-white px-1.5 py-0.5 rounded shadow-sm">ESC</kbd> 关闭</span>
          </div>
          <span>{filtered.length} 项结果</span>
        </div>
      </div>
    </div>
  );
}
