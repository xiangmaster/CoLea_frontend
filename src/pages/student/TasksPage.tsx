import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useCourseStore } from '@/store/courseStore';
import { Pill } from '@/components/ui/Tag';
import { classNames, formatDate } from '@/lib/format';

const STATUS_TABS = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待开始' },
  { id: 'in_progress', label: '进行中' },
  { id: 'overdue', label: '已逾期' },
  { id: 'done', label: '已完成' },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]['id'];
type SortField = 'deadline' | 'status' | 'progress' | 'title';
type SortDir = 'asc' | 'desc';

const STATUS_RANK = { overdue: 0, in_progress: 1, pending: 2, done: 3 } as const;

export function TasksPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const courses = useCourseStore((s) => s.courses);
  const [tab, setTab] = useState<StatusTab>('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [q, setQ] = useState('');
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const filtered = useMemo(() => {
    const arr = tasks.filter((t) => {
      if (tab !== 'all' && t.status !== tab) return false;
      if (courseFilter !== 'all' && t.courseId !== courseFilter) return false;
      if (q && !`${t.title} ${t.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    const mul = sortDir === 'asc' ? 1 : -1;
    return [...arr].sort((a, b) => {
      switch (sortField) {
        case 'deadline': return mul * (new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        case 'status': return mul * (STATUS_RANK[a.status] - STATUS_RANK[b.status]);
        case 'progress': return mul * (a.completed / Math.max(1, a.total) - b.completed / Math.max(1, b.total));
        case 'title': return mul * a.title.localeCompare(b.title, 'zh-CN');
        default: return 0;
      }
    });
  }, [tasks, tab, courseFilter, q, sortField, sortDir]);

  const onSort = (f: SortField) => {
    if (sortField === f) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(f); setSortDir('asc'); }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tasks.length };
    STATUS_TABS.forEach((s) => { c[s.id] = tasks.filter((t) => s.id === 'all' || t.status === s.id).length; });
    return c;
  }, [tasks]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">任务列表</h1>
          <p className="text-slate-500 text-sm mt-1">UC3 · 任务与进度管理 · 共 {filtered.length} 项</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索任务标题、描述…"
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={classNames(
                  'px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5',
                  tab === t.id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-500 hover:bg-slate-50',
                )}
              >
                {t.label}
                <span className={classNames('text-[10px] px-1.5 py-0.5 rounded-full', tab === t.id ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500')}>
                  {counts[t.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
          >
            <option value="all">全部课程</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                <Th label="任务名称" field="title" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                <th className="px-6 py-3 font-medium">课程</th>
                <Th label="截止时间" field="deadline" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                <Th label="状态" field="status" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                <Th label="完成度" field="progress" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                <th className="px-6 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">没有匹配的任务</td></tr>
              )}
              {filtered.map((t) => {
                const c = courses.find((x) => x.id === t.courseId);
                const overdue = t.status === 'overdue';
                const pct = Math.round((t.completed / Math.max(1, t.total)) * 100);
                return (
                  <tr key={t.id} className={classNames('hover:bg-slate-50', overdue && 'bg-red-50/30')}>
                    <td className="px-6 py-4">
                      <div className={classNames('font-medium text-sm', overdue ? 'text-red-700' : 'text-slate-800')}>{t.title}{overdue && ' ⚠'}</div>
                      <div className={classNames('text-xs mt-0.5 line-clamp-1', overdue ? 'text-red-400' : 'text-slate-400')}>{t.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{c?.name}</td>
                    <td className={classNames('px-6 py-4 text-sm', overdue ? 'text-red-500 font-medium' : 'text-slate-500')}>
                      {formatDate(t.deadline)} {overdue && '(已逾期)'}
                    </td>
                    <td className="px-6 py-4">
                      <Pill color={t.status === 'done' ? 'green' : t.status === 'in_progress' ? 'blue' : t.status === 'overdue' ? 'red' : 'slate'}>
                        {{ done: '已完成', in_progress: '进行中', overdue: '已逾期', pending: '待开始' }[t.status]}
                      </Pill>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={classNames('h-full', t.status === 'done' ? 'bg-green-500' : overdue ? 'bg-red-500' : 'bg-brand-500')} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{t.completed}/{t.total}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/app/tasks/${t.id}`}
                        className={classNames('text-sm hover:underline', overdue ? 'text-red-600 font-medium' : 'text-brand-600')}
                      >
                        {overdue ? '立即提交' : '查看详情'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ label, field, sortField, sortDir, onSort }: { label: string; field: SortField; sortField: SortField; sortDir: SortDir; onSort: (f: SortField) => void }) {
  const active = sortField === field;
  return (
    <th className="px-6 py-3 font-medium">
      <button onClick={() => onSort(field)} className={classNames('flex items-center gap-1 hover:text-brand-600', active && 'text-brand-600')}>
        {label}
        {active && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
      </button>
    </th>
  );
}
