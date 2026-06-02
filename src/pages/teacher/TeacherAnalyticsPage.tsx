import { useMemo, useState } from 'react';
import { ArrowUp, Download, TrendingUp, Users as UsersIcon, AlertTriangle, BookOpen } from 'lucide-react';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { useCourseStore } from '@/store/courseStore';
import { useGroupStore } from '@/store/groupStore';
import { useTaskStore } from '@/store/taskStore';
import { Heatmap } from '@/components/charts/Heatmap';
import { TrendLine } from '@/components/charts/TrendLine';
import { Donut } from '@/components/charts/Donut';
import { classNames } from '@/lib/format';
import { toast } from '@/store/toastStore';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar as RadarShape,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Range = '7d' | '30d' | 'term';

const RANGE_LABEL: Record<Range, string> = { '7d': '近 7 天', '30d': '近 30 天', term: '整学期' };

const TREND_BY_RANGE: Record<Range, Array<{ day: string; value: number }>> = {
  '7d': [
    { day: '周一', value: 84 }, { day: '周二', value: 86 }, { day: '周三', value: 85 },
    { day: '周四', value: 87 }, { day: '周五', value: 89 }, { day: '周六', value: 88 }, { day: '周日', value: 91 },
  ],
  '30d': Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}日`, value: Math.round(80 + Math.abs(Math.sin(i * 0.5)) * 12) })),
  term: Array.from({ length: 16 }, (_, i) => ({ day: `W${i + 1}`, value: Math.round(72 + i * 1.2 + Math.abs(Math.sin(i * 0.4)) * 6) })),
};

const DIMENSIONS = ['资料检索', '内容创作', '协作沟通', '分析归纳', '汇报展示'];

// 各小组在 5 个维度上的归一化分（用 useGroupStore 拿不到这些数据，这里用 mock 派生）
const GROUP_DIM_MAP: Record<string, number[]> = {
  'g-alpha': [88, 92, 90, 86, 90],
  'g-beta':  [72, 80, 70, 78, 65],
  'g-gamma': [45, 48, 50, 42, 40],
  'g-delta': [85, 88, 86, 84, 89],
};

export function TeacherAnalyticsPage() {
  const kpi = useAnalyticsStore((s) => s.kpi);
  const heatmap = useAnalyticsStore((s) => s.heatmap);
  const courses = useCourseStore((s) => s.courses);
  const allGroups = useGroupStore((s) => s.groups);
  const tasks = useTaskStore((s) => s.tasks);
  const [courseId, setCourseId] = useState<string>(courses[0]?.id ?? 'c-se');
  const [range, setRange] = useState<Range>('7d');

  const course = courses.find((c) => c.id === courseId);
  const groups = allGroups.filter((g) => g.courseId === courseId);
  const courseTasks = tasks.filter((t) => t.courseId === courseId);

  const totalGroups = groups.length;
  const highRisk = groups.filter((g) => g.health === 'warning').length;
  const avgScore = groups.length
    ? Math.round(groups.reduce((s, g) => s + g.collaborationScore, 0) / groups.length)
    : 0;
  const activeRate = '93%';
  const completedTasks = courseTasks.filter((t) => t.status === 'done').length;
  const totalTaskRecord = courseTasks.length;

  // 小组排行
  const leaderboard = useMemo(
    () => [...groups].sort((a, b) => b.collaborationScore - a.collaborationScore),
    [groups],
  );

  // 任务完成情况：每个任务的完成 / 进行中 / 逾期 / 待开始
  const taskBars = useMemo(
    () =>
      courseTasks.map((t) => {
        const done = t.completed;
        const remaining = Math.max(0, t.total - t.completed);
        const overdue = t.status === 'overdue' ? Math.max(1, Math.floor(remaining * 0.6)) : 0;
        return {
          name: t.title.slice(0, 8),
          已完成: done,
          逾期: overdue,
          进行中: Math.max(0, remaining - overdue),
        };
      }),
    [courseTasks],
  );

  // 小组横向对比雷达：4 组叠加显示
  const radarData = useMemo(
    () =>
      DIMENSIONS.map((axis, i) => {
        const row: Record<string, number | string> = { axis };
        groups.forEach((g) => {
          row[g.name] = GROUP_DIM_MAP[g.id]?.[i] ?? 60;
        });
        return row;
      }),
    [groups],
  );

  // 提交 vs 协作评分分布（散点-> 这里用饼图表达健康度分布）
  const healthDist = [
    { label: '健康', value: groups.filter((g) => g.health === 'healthy').length, color: '#22c55e' },
    { label: '中等', value: groups.filter((g) => g.health === 'medium').length, color: '#f59e0b' },
    { label: '预警', value: groups.filter((g) => g.health === 'warning').length, color: '#ef4444' },
  ];

  const trendData = TREND_BY_RANGE[range];

  const GROUP_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2'];

  const exportCsv = () => {
    const rows = [
      ['小组', '协作评分', '组员数', '活跃度', '健康度'],
      ...leaderboard.map((g) => [
        g.name,
        String(g.collaborationScore),
        String(g.memberIds.length),
        { high: '高', medium: '中', low: '低' }[g.activity],
        { healthy: '健康', medium: '中等', warning: '预警' }[g.health],
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${course?.name ?? 'course'}-分析报告.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('已导出 CSV 报告');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">班级协作数据分析</h1>
          <p className="text-slate-500 text-sm mt-1">
            <BookOpen className="inline w-3.5 h-3.5 mr-1" />
            {course?.name} · {course?.studentCount} 名学生 · {totalGroups} 个小组 · 数据范围 {RANGE_LABEL[range]}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 rounded-lg p-0.5 text-sm">
            {(['7d', '30d', 'term'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={classNames(
                  'px-3 py-1.5 rounded-md transition',
                  range === r ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {RANGE_LABEL[r]}
              </button>
            ))}
          </div>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white">
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={exportCsv} className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1">
            <Download className="w-4 h-4" /> 导出 CSV
          </button>
        </div>
      </div>

      {/* 班级 KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Kpi label="班级平均协作评分" value={`${avgScore}`} suffix="/100" delta="↑ 3 vs 上周" positive primary />
        <Kpi label="累计提交次数" value={Math.round(kpi.totalSubmissions * 1.2)} delta={`${kpi.deltaSubmissionsPct}% vs 上期`} positive />
        <Kpi label="任务完成情况" value={`${completedTasks}/${totalTaskRecord}`} delta={`${Math.round((completedTasks / Math.max(1, totalTaskRecord)) * 100)}% 已完成`} icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
        <Kpi label="预警小组" value={highRisk} suffix={`/${totalGroups}`} delta={highRisk > 0 ? `需要重点关注` : '全部健康'} negative={highRisk > 0} icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 小组排行榜 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-brand-600" /> 小组协作评分排行
            </h3>
            <span className="text-xs text-slate-400">{leaderboard.length} 组</span>
          </div>
          <div className="space-y-2.5">
            {leaderboard.map((g, i) => {
              const tone = g.health === 'healthy' ? 'bg-emerald-500' : g.health === 'medium' ? 'bg-amber-500' : 'bg-red-500';
              const max = leaderboard[0]?.collaborationScore || 100;
              const pct = (g.collaborationScore / max) * 100;
              return (
                <div key={g.id} className="flex items-center gap-3">
                  <div className={classNames(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500',
                  )}>
                    {i + 1}
                  </div>
                  <div className="w-20 text-sm text-slate-700 truncate flex-shrink-0">{g.name}</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={classNames('h-full', tone)} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-12 text-right text-sm font-semibold text-slate-700 flex-shrink-0">{g.collaborationScore}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 小组健康度分布 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">小组健康度分布</h3>
          <div className="flex items-center justify-center">
            <Donut data={healthDist} centerValue={totalGroups} centerLabel="个小组" size={180} />
          </div>
          <div className="space-y-2 mt-3">
            {healthDist.map((h) => (
              <div key={h.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: h.color }} />
                  {h.label}
                </span>
                <span className="font-medium text-slate-700">{h.value} 组</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 任务完成情况堆叠柱状 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">任务完成情况</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={taskBars} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="已完成" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="进行中" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="逾期" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 班级协作评分趋势 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">班级平均协作评分趋势</h3>
          <TrendLine data={trendData} color="#2563eb" height={260} />
          <div className="text-xs text-slate-400 text-center mt-2">参与率 {activeRate} · 数据来自各小组聚合</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 班级活动热力图 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">全班活动热力图（按周-星期聚合）</h3>
          <Heatmap cells={heatmap} />
        </div>

        {/* 小组多维对比雷达 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">小组多维对比</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Tooltip />
                {groups.map((g, i) => (
                  <RadarShape key={g.id} name={g.name} dataKey={g.name} stroke={GROUP_COLORS[i % GROUP_COLORS.length]} fill={GROUP_COLORS[i % GROUP_COLORS.length]} fillOpacity={0.12} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            {groups.map((g, i) => (
              <span key={g.id} className="flex items-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ background: GROUP_COLORS[i % GROUP_COLORS.length] }} />
                {g.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 学生维度的概览（聚合，但不再让教师切学生视角） */}
      <div className="mt-6 bg-gradient-to-br from-brand-50/50 via-white to-sky-50/40 rounded-2xl p-6 border border-brand-100/60">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">参与度概览</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="活跃天数" value={kpi.activeDays} hint="本月" />
          <Stat label="活跃学生" value={`${Math.round(course!.studentCount * 0.93)}/${course?.studentCount}`} hint="参与率 93%" />
          <Stat label="累计文档协作" value="312" hint={`本周编辑 48 篇`} />
          <Stat label="累计评论数" value="186" hint={`本周新增 27 条`} />
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label, value, suffix, delta, positive, negative, primary, icon,
}: {
  label: string; value: string | number; suffix?: string; delta?: string;
  positive?: boolean; negative?: boolean; primary?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        {icon}
      </div>
      <div className={primary ? 'text-2xl font-bold text-brand-600' : 'text-2xl font-bold text-slate-800'}>
        {value}
        {suffix && <span className="text-sm text-slate-400 font-normal">{suffix}</span>}
      </div>
      {delta && (
        <div className={classNames('text-xs mt-1', positive ? 'text-green-500' : negative ? 'text-orange-500' : 'text-slate-400')}>
          {positive && <ArrowUp className="inline w-3 h-3 -mt-0.5" />} {delta}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-white/70 rounded-xl px-4 py-3 border border-slate-100/80">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-800 mt-1">{value}</div>
      {hint && <div className="text-[10px] text-slate-400 mt-0.5">{hint}</div>}
    </div>
  );
}
