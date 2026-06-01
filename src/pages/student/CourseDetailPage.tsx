import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCourseStore } from '@/store/courseStore';
import { useGroupStore } from '@/store/groupStore';
import { useTaskStore } from '@/store/taskStore';
import { useDocStore } from '@/store/docStore';
import { classNames, formatDate } from '@/lib/format';
import { Pill } from '@/components/ui/Tag';
import { AvatarGroup } from '@/components/ui/Avatar';
import { getAllUsers } from '@/store/authStore';
import { GroupsPage } from './GroupsPage';
import { ClipboardList, FileText, Users, Info } from 'lucide-react';

const TABS = [
  { id: 'overview', label: '概览', icon: Info },
  { id: 'groups', label: '小组', icon: Users },
  { id: 'tasks', label: '任务', icon: ClipboardList },
  { id: 'docs', label: '文档', icon: FileText },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function CourseDetailPage() {
  const { courseId = 'c-se' } = useParams();
  const course = useCourseStore((s) => s.courses.find((c) => c.id === courseId));
  const [tab, setTab] = useState<TabId>('overview');

  if (!course) {
    return <div className="p-8 text-slate-500">课程不存在</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`rounded-2xl bg-gradient-to-br ${course.gradient} p-8 text-white mb-6`}>
        <div className="text-sm opacity-80 mb-1">
          <Link to="/app/dashboard" className="hover:underline">仪表盘</Link>
          <span className="mx-2 opacity-50">/</span>
          课程
        </div>
        <h1 className="text-2xl font-bold">{course.name}</h1>
        <p className="text-white/80 text-sm mt-1">{course.teacherName} · {course.term} · {course.studentCount} 名学生</p>
        <p className="text-white/70 text-sm mt-3 max-w-2xl">{course.description}</p>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <span>课程进度 {course.progress}%</span>
          <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${course.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden">
        <div className="px-6 border-b border-slate-100 flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={classNames(
                'py-3 text-sm flex items-center gap-2',
                tab === t.id ? 'tab-active' : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab courseId={courseId} />}
        {tab === 'groups' && (
          <div className="p-6">
            <GroupsPage courseId={courseId} embedded />
          </div>
        )}
        {tab === 'tasks' && <TasksTab courseId={courseId} />}
        {tab === 'docs' && <DocsTab courseId={courseId} />}
      </div>
    </div>
  );
}

function OverviewTab({ courseId }: { courseId: string }) {
  const groups = useGroupStore((s) => s.groups.filter((g) => g.courseId === courseId));
  const tasks = useTaskStore((s) => s.tasks.filter((t) => t.courseId === courseId));
  const users = getAllUsers();
  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">近期任务</h3>
        {tasks.slice(0, 3).map((t) => (
          <Link
            key={t.id}
            to={`/app/tasks/${t.id}`}
            className="block bg-slate-50 hover:bg-brand-50 rounded-xl p-4 border border-transparent hover:border-brand-100 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800 text-sm">{t.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{t.description}</div>
              </div>
              <div className="text-xs text-slate-500">截止 {formatDate(t.deadline)}</div>
            </div>
          </Link>
        ))}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">活跃小组</h3>
        <div className="space-y-2">
          {groups.slice(0, 4).map((g) => (
            <div key={g.id} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">{g.name}</div>
                <div className="mt-1">
                  <AvatarGroup
                    users={g.memberIds
                      .map((id) => users.find((u) => u.id === id))
                      .filter((u): u is NonNullable<typeof u> => !!u)
                      .map((u) => ({ name: u.name, color: u.avatarColor }))}
                    size={22}
                    max={4}
                  />
                </div>
              </div>
              <Pill color={g.health === 'healthy' ? 'green' : g.health === 'medium' ? 'yellow' : 'red'}>
                {g.health === 'healthy' ? '健康' : g.health === 'medium' ? '中等' : '预警'}
              </Pill>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksTab({ courseId }: { courseId: string }) {
  const tasks = useTaskStore((s) => s.tasks.filter((t) => t.courseId === courseId));
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-3 font-medium">任务名称</th>
            <th className="px-6 py-3 font-medium">截止时间</th>
            <th className="px-6 py-3 font-medium">状态</th>
            <th className="px-6 py-3 font-medium">阶段</th>
            <th className="px-6 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((t) => {
            const overdue = t.status === 'overdue';
            return (
              <tr key={t.id} className={classNames('hover:bg-slate-50', overdue && 'bg-red-50/30')}>
                <td className="px-6 py-4">
                  <div className={classNames('font-medium text-sm', overdue ? 'text-red-700' : 'text-slate-800')}>
                    {t.title}{overdue && ' ⚠'}
                  </div>
                  <div className={classNames('text-xs mt-0.5', overdue ? 'text-red-400' : 'text-slate-400')}>{t.description}</div>
                </td>
                <td className={classNames('px-6 py-4 text-sm', overdue ? 'text-red-500 font-medium' : 'text-slate-500')}>
                  {formatDate(t.deadline)} {overdue && '(已逾期)'}
                </td>
                <td className="px-6 py-4">
                  <Pill color={t.status === 'done' ? 'green' : t.status === 'in_progress' ? 'blue' : t.status === 'overdue' ? 'red' : 'slate'}>
                    {{ done: '已完成', in_progress: '进行中', overdue: '已逾期', pending: '待开始' }[t.status]}
                  </Pill>
                </td>
                <td className={classNames('px-6 py-4 text-sm', overdue ? 'text-red-500' : 'text-slate-500')}>
                  {t.completed}/{t.total}
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
  );
}

function DocsTab({ courseId }: { courseId: string }) {
  const docs = useDocStore((s) => s.docs.filter((d) => d.courseId === courseId));
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {docs.map((d) => (
        <Link
          key={d.id}
          to={`/app/docs/${d.id}`}
          className="bg-slate-50 hover:bg-brand-50 rounded-xl p-4 border border-transparent hover:border-brand-100 transition flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm text-slate-800">{d.title}</div>
            <div className="text-xs text-slate-400 mt-0.5">上次更新 {formatDate(d.updatedAt)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
