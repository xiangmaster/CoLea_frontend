import { Link, useParams } from 'react-router-dom';
import { Users, ClipboardList, BarChart3, AlertTriangle } from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import { useGroupStore } from '@/store/groupStore';
import { useTaskStore } from '@/store/taskStore';
import { Pill } from '@/components/ui/Tag';
import { formatDate } from '@/lib/format';

export function TeacherCourseDetailPage() {
  const { courseId = 'c-se' } = useParams();
  const course = useCourseStore((s) => s.courses.find((c) => c.id === courseId));
  const groups = useGroupStore((s) => s.groups.filter((g) => g.courseId === courseId));
  const tasks = useTaskStore((s) => s.tasks.filter((t) => t.courseId === courseId));

  if (!course) return <div className="p-8 text-slate-500">课程不存在</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`rounded-2xl bg-gradient-to-br ${course.gradient} p-8 text-white mb-6`}>
        <div className="text-sm opacity-80 mb-1">
          <Link to="/teacher/dashboard" className="hover:underline">仪表盘</Link>
          <span className="mx-2 opacity-50">/</span>
          课程管理
        </div>
        <h1 className="text-2xl font-bold">{course.name}</h1>
        <p className="text-white/80 text-sm mt-1">{course.studentCount} 名学生 · {course.taskCount} 个任务 · {course.docCount} 篇文档</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <QuickLink to={`/teacher/groups/${courseId}`} icon={<Users className="w-5 h-5" />} label="小组管理" />
        <QuickLink to={`/teacher/tasks/${courseId}`} icon={<ClipboardList className="w-5 h-5" />} label="任务发布" />
        <QuickLink to="/teacher/analytics" icon={<BarChart3 className="w-5 h-5" />} label="数据分析" />
        <QuickLink to="/teacher/risk" icon={<AlertTriangle className="w-5 h-5" />} label="AI 风险预警" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-800">小组状态</div>
          <div className="divide-y divide-slate-100">
            {groups.map((g) => (
              <div key={g.id} className="px-5 py-3 flex items-center justify-between">
                <div className="text-sm text-slate-700 font-medium">{g.name}</div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">协作 {g.collaborationScore}</span>
                  <Pill color={g.health === 'healthy' ? 'green' : g.health === 'medium' ? 'yellow' : 'red'}>
                    {g.health === 'healthy' ? '健康' : g.health === 'medium' ? '中等' : '预警'}
                  </Pill>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-800">课程任务</div>
          <div className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-700 font-medium">{t.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">截止 {formatDate(t.deadline)}</div>
                </div>
                <Pill color={t.status === 'done' ? 'green' : t.status === 'in_progress' ? 'blue' : t.status === 'overdue' ? 'red' : 'slate'}>
                  {t.completed}/{t.total}
                </Pill>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 card-hover flex items-center gap-3">
      <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">{icon}</div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </Link>
  );
}
