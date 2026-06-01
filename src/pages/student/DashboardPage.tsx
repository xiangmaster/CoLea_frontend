import { Link } from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  FileText,
  Star,
  ArrowUp,
  AlertTriangle,
  Megaphone,
  Pin,
  CalendarClock,
  Sparkles,
} from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import { useTaskStore } from '@/store/taskStore';
import { useDocStore } from '@/store/docStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { useAnnouncementStore } from '@/store/announcementStore';
import { useCurrentUser } from '@/store/authStore';
import { dateZh, formatDate, relativeTime, weekOfTerm } from '@/lib/format';
import { ActivityFeed } from '@/components/nav/ActivityFeed';
import { Pill } from '@/components/ui/Tag';
import { Sparkline } from '@/components/charts/Sparkline';

export function DashboardPage() {
  const user = useCurrentUser();
  const courses = useCourseStore((s) => s.courses);
  const tasks = useTaskStore((s) => s.tasks);
  const docs = useDocStore((s) => s.docs);
  const kpi = useAnalyticsStore((s) => s.kpi);
  const announcements = useAnnouncementStore((s) => s.items);

  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;
  const overdueTasks = tasks.filter((t) => t.status === 'overdue').length;
  const dueSoon = tasks
    .filter((t) => t.status !== 'done')
    .map((t) => ({ ...t, daysLeft: Math.ceil((new Date(t.deadline).getTime() - Date.now()) / (24 * 3600 * 1000)) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4);
  const topAnnouncements = [...announcements].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned)).slice(0, 3);

  const todaySchedule = [
    { time: '10:00', subject: '软件工程', topic: '设计模式 · 工厂方法', loc: 'J301' },
    { time: '14:00', subject: '数据库原理', topic: '查询优化与执行计划', loc: 'J215' },
    { time: '19:30', subject: 'Alpha 组例会', topic: '中期评审准备', loc: '腾讯会议' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">欢迎回来，{user?.name ?? '同学'} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">
            {dateZh()} · 本学期第 {weekOfTerm()} 周 · 已坚持登录 {kpi.activeDays} 天
          </p>
        </div>
        <Link
          to="/app/ai"
          className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-md hover:from-brand-600 hover:to-brand-800 flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" /> AI 导学建议
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="活跃课程"
          value={String(courses.length)}
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
          tone="blue"
          delta={<span className="text-green-500"><ArrowUp className="inline w-3 h-3" /> 本学期新增 1 门</span>}
          trend={[2, 2, 2, 2, 3, 3, 3]}
          trendColor="#2563eb"
        />
        <StatCard
          label="待完成任务"
          value={String(pendingTasks)}
          icon={<ClipboardList className="w-5 h-5 text-orange-600" />}
          tone="orange"
          delta={
            overdueTasks > 0 ? (
              <span className="text-red-500"><AlertTriangle className="inline w-3 h-3" /> {overdueTasks} 项已逾期</span>
            ) : (
              <span className="text-slate-400">本周新增 1 项</span>
            )
          }
          trend={[5, 4, 4, 6, 5, 3, pendingTasks]}
          trendColor="#f97316"
        />
        <StatCard
          label="协作文档"
          value={String(docs.length)}
          icon={<FileText className="w-5 h-5 text-green-600" />}
          tone="green"
          delta={<span className="text-slate-400">本周编辑 4 篇</span>}
          trend={[6, 8, 9, 10, 11, 11, docs.length]}
          trendColor="#16a34a"
        />
        <StatCard
          label="协作评分"
          value={String(kpi.collaborationScore)}
          icon={<Star className="w-5 h-5 text-amber-500" />}
          tone="amber"
          delta={<span className="text-green-500"><ArrowUp className="inline w-3 h-3" /> 较上周 +{kpi.deltaScore}</span>}
          trend={[78, 80, 81, 83, 85, 86, kpi.collaborationScore]}
          trendColor="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-800">我的课程</h2>
              <Link to="/app/courses/c-se" className="text-xs text-brand-600 hover:underline">全部 →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  to={`/app/courses/${c.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden card-hover cursor-pointer block"
                >
                  <div className={`h-24 bg-gradient-to-br ${c.gradient} p-4 flex flex-col justify-end`}>
                    <h3 className="text-white font-semibold text-sm">{c.name}</h3>
                    <p className="text-white/70 text-xs mt-0.5">{c.teacherName} · {c.term}</p>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span>课程进度</span>
                      <span>{c.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${c.gradient}`} style={{ width: `${c.progress}%` }} />
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                      <span>👥 {c.studentCount}</span>
                      <span>📋 {c.taskCount}</span>
                      <span>📄 {c.docCount}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-brand-600" /> 近期截止
              </h3>
              <Link to="/app/tasks" className="text-xs text-brand-600 hover:underline">全部任务 →</Link>
            </div>
            <div className="space-y-2">
              {dueSoon.map((t) => {
                const overdue = t.daysLeft < 0;
                const urgent = !overdue && t.daysLeft <= 3;
                return (
                  <Link
                    to={`/app/tasks/${t.id}`}
                    key={t.id}
                    className={`flex items-center justify-between rounded-lg px-4 py-2.5 border ${
                      overdue ? 'bg-red-50 border-red-100' : urgent ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-transparent hover:border-brand-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{t.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{t.stage} · {t.completed}/{t.total} 组</div>
                    </div>
                    <div className="text-right ml-3">
                      <div className={`text-xs font-medium ${overdue ? 'text-red-600' : urgent ? 'text-amber-600' : 'text-slate-500'}`}>
                        {overdue ? `已逾期 ${Math.abs(t.daysLeft)} 天` : `${t.daysLeft} 天后截止`}
                      </div>
                      <div className="text-[10px] text-slate-400">{formatDate(t.deadline)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-brand-600" /> 课程公告
            </h3>
            <div className="space-y-2">
              {topAnnouncements.map((a) => (
                <Link
                  key={a.id}
                  to={`/app/courses/${a.courseId}`}
                  className="block p-3 rounded-lg bg-slate-50 hover:bg-brand-50 border border-transparent hover:border-brand-100 transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {a.pinned && <Pin className="w-3 h-3 text-amber-500" />}
                    <span className="text-sm font-medium text-slate-800">{a.title}</span>
                    <span className="text-xs text-slate-400 ml-auto">{relativeTime(a.createdAt)}</span>
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-2">{a.body}</div>
                  <div className="text-[10px] text-slate-400 mt-1">— {a.authorName}</div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">今日计划</h3>
            <div className="space-y-3">
              {todaySchedule.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="text-xs font-mono text-slate-400 w-12 pt-0.5">{s.time}</div>
                  <div className="flex-1 border-l-2 border-brand-200 pl-3 -ml-1">
                    <div className="text-sm text-slate-800">{s.subject}</div>
                    <div className="text-xs text-slate-500">{s.topic}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">📍 {s.loc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <ActivityFeed limit={7} />

          <section className="bg-gradient-to-br from-brand-50 to-sky-50 rounded-xl border border-brand-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-brand-700" />
              <h3 className="font-semibold text-brand-800 text-sm">本周协作摘要</h3>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              你本周共完成 <strong className="text-brand-700">3 项</strong> 任务，参与 <strong className="text-brand-700">12 次</strong> 文档协作，提交 <strong className="text-brand-700">5 次</strong> 评审。当前协作评分进入年级 <Pill color="green">前 15%</Pill>。
            </div>
            <Link to="/app/analytics" className="mt-3 inline-flex items-center text-xs text-brand-700 hover:underline">
              查看完整分析 →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
  delta,
  trend,
  trendColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: 'blue' | 'green' | 'orange' | 'amber';
  delta?: React.ReactNode;
  trend?: number[];
  trendColor?: string;
}) {
  const bg = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
    amber: 'bg-amber-50',
  }[tone];
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 card-hover relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500">{label}</span>
        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold text-slate-800 tracking-tight">{value}</div>
          {delta && <div className="text-xs mt-1">{delta}</div>}
        </div>
        {trend && trend.length > 1 && (
          <Sparkline data={trend} color={trendColor} width={70} height={28} showDots />
        )}
      </div>
    </div>
  );
}
