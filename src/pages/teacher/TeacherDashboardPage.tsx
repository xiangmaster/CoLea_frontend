import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PencilLine, AlertTriangle, Users as UsersIcon, Activity, Plus, BarChart3, Megaphone } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useCourseStore } from '@/store/courseStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { useGroupStore } from '@/store/groupStore';
import { useAuthStore, useCurrentUser } from '@/store/authStore';
import { Pill } from '@/components/ui/Tag';
import { ActivityFeed } from '@/components/nav/ActivityFeed';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/store/toastStore';
import { api } from '@/lib/api';
import { dateZh } from '@/lib/format';
import { Sparkline } from '@/components/charts/Sparkline';

export function TeacherDashboardPage() {
  const nav = useNavigate();
  const submissions = useTaskStore((s) => s.submissions);
  const courses = useCourseStore((s) => s.courses);
  const createCourse = useCourseStore((s) => s.create);
  const risks = useAnalyticsStore((s) => s.risks);
  const groups = useGroupStore((s) => s.groups);
  const me = useCurrentUser();
  const teacherId = useAuthStore((s) => s.currentUserId);

  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState('');
  const [term, setTerm] = useState('2026春');
  const [desc, setDesc] = useState('');

  const pendingGrading = submissions.filter((s) => s.status === 'submitted').length;
  const warnings = risks.filter((r) => r.level !== 'low').length;
  const high = risks.filter((r) => r.level === 'high').length;
  const totalStudents = 45;
  const activeStudents = 42;

  const handleCreate = async () => {
    if (!name) return toast.error('请输入课程名');
    if (!me) return;
    await api('/courses/create', () =>
      createCourse({
        name,
        teacherId: teacherId ?? me.id,
        teacherName: me.name,
        term,
        gradient: 'from-indigo-500 to-indigo-600',
        shortCode: name.slice(0, 2).toUpperCase(),
        description: desc || `${name} 课程，由 ${me.name} 主讲，本学期开课。`,
      }),
    );
    toast.success('课程已创建');
    setOpenCreate(false);
    setName(''); setDesc('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">教师工作台</h1>
          <p className="text-slate-500 text-sm mt-1">{dateZh()} · {courses.length} 门在授课程 · {submissions.length} 条提交记录</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Stat label="待评价任务" value={pendingGrading + 10} icon={<PencilLine className="w-4 h-4 text-red-500" />} bg="bg-red-50" delta="3 项即将截止" deltaTone="red" trend={[8, 10, 12, 11, 14, 12, pendingGrading + 10]} trendColor="#ef4444" />
        <Stat label="预警小组" value={warnings} icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} bg="bg-orange-50" delta={`${high} 组高风险`} deltaTone="orange" valueTone="text-orange-600" trend={[3, 3, 4, 3, 2, 2, warnings]} trendColor="#f97316" />
        <Stat label="活跃学生" value={`${activeStudents}/${totalStudents}`} icon={<UsersIcon className="w-4 h-4 text-green-500" />} bg="bg-green-50" delta={`${Math.round((activeStudents / totalStudents) * 100)}% 参与率`} deltaTone="green" trend={[38, 40, 41, 41, 42, 42, activeStudents]} trendColor="#16a34a" />
        <Stat label="课程健康度" value="91%" icon={<Activity className="w-4 h-4 text-blue-500" />} bg="bg-blue-50" delta="↑ 2% vs 上周" deltaTone="green" valueTone="text-green-600" trend={[85, 86, 87, 88, 89, 89, 91]} trendColor="#2563eb" />
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <button onClick={() => nav('/teacher/grading')} className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 text-sm font-medium hover:from-brand-700 hover:to-blue-800 flex items-center gap-2">
          <PencilLine className="w-4 h-4" /> 开始评分
        </button>
        <button onClick={() => nav('/teacher/risk')} className="px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> AI 预警面板
        </button>
        <button onClick={() => nav('/teacher/tasks/c-se')} className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> 发布任务
        </button>
        <button onClick={() => nav('/teacher/announcements')} className="px-5 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 flex items-center gap-2">
          <Megaphone className="w-4 h-4" /> 发布公告
        </button>
        <button onClick={() => nav('/teacher/analytics')} className="px-5 py-2.5 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> 查看分析
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">我的课程</h3>
            <button onClick={() => setOpenCreate(true)} className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> 创建课程
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {courses.map((c) => (
              <Link key={c.id} to={`/teacher/courses/${c.id}`} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${c.gradient} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                    {c.shortCode}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{c.name}</div>
                    <div className="text-xs text-slate-400">
                      {c.studentCount} 名学生 · {groups.filter((g) => g.courseId === c.id).length} 个小组 · {c.taskCount} 个任务
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${c.gradient}`} style={{ width: `${c.progress}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{c.progress}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">🤖 AI 预警摘要</h3>
            <div className="space-y-2.5">
              {risks.map((r) => (
                <Link to="/teacher/risk" key={r.groupId} className={`flex items-start gap-2 p-2.5 rounded-lg border ${r.level === 'high' ? 'bg-red-50 border-red-100' : r.level === 'medium' ? 'bg-yellow-50 border-yellow-100' : 'bg-green-50 border-green-100'}`}>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${r.level === 'high' ? 'bg-red-100 text-red-600' : r.level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {{ high: '高', medium: '中', low: '低' }[r.level]}
                  </span>
                  <div className="text-xs">
                    <div className="font-medium text-slate-700">{r.groupName}</div>
                    <div className="text-slate-400 mt-0.5 line-clamp-1">{r.bullets[0]}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <ActivityFeed limit={6} title="实时动态" />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">最近提交</h3>
            <div className="space-y-2.5">
              {submissions.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-700 font-medium">{s.groupName}</span>
                    <span className="text-slate-500"> 提交了 </span>
                    <span className="text-brand-600 truncate">{s.taskId}</span>
                  </div>
                  <Pill color={s.status === 'graded' ? 'green' : 'blue'}>
                    {s.status === 'graded' ? `已评 ${s.score}` : '待评分'}
                  </Pill>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="创建新课程"
        width={500}
        footer={
          <>
            <button onClick={() => setOpenCreate(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800">取消</button>
            <button onClick={handleCreate} className="px-4 py-1.5 text-sm bg-gradient-to-r from-brand-600 to-blue-700 text-white rounded-xl shadow-md shadow-brand-500/20 hover:from-brand-700 hover:to-blue-800">创建</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">课程名称</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：高级算法设计" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">学期</label>
              <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option>2026春</option>
                <option>2026秋</option>
                <option>2027春</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">课程代号</label>
              <input value={name.slice(0, 2).toUpperCase()} readOnly className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">课程简介</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="一句话介绍课程主题与教学目标…" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Stat({
  label, value, icon, bg, delta, deltaTone, valueTone = 'text-slate-800', trend, trendColor,
}: {
  label: string; value: string | number; icon: React.ReactNode; bg: string;
  delta?: string; deltaTone?: 'red' | 'orange' | 'green'; valueTone?: string;
  trend?: number[]; trendColor?: string;
}) {
  const dt = deltaTone === 'red' ? 'text-red-500' : deltaTone === 'orange' ? 'text-orange-500' : 'text-green-500';
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 card-hover">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500">{label}</span>
        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className={`text-3xl font-bold ${valueTone}`}>{value}</div>
          {delta && <div className={`text-xs mt-1 ${dt}`}>{delta}</div>}
        </div>
        {trend && trend.length > 1 && <Sparkline data={trend} color={trendColor} width={70} height={30} showDots />}
      </div>
    </div>
  );
}
