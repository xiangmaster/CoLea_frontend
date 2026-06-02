import { useState } from 'react';
import { ArrowUp, Download, Crown, Users as UsersIcon, FileText, MessageSquare, Activity as ActivityIcon } from 'lucide-react';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { useGroupStore } from '@/store/groupStore';
import { useCurrentUser } from '@/store/authStore';
import { Heatmap } from '@/components/charts/Heatmap';
import { Donut } from '@/components/charts/Donut';
import { Radar } from '@/components/charts/Radar';
import { TrendLine } from '@/components/charts/TrendLine';
import { classNames } from '@/lib/format';
import { toast } from '@/store/toastStore';

type Range = '7d' | '30d' | 'term';
const RANGE_LABEL: Record<Range, string> = { '7d': '近 7 天', '30d': '近 30 天', term: '整学期' };

// 个人提交趋势：偏个人量级（每天 3-10 次）
const PERSONAL_TREND: Record<Range, Array<{ day: string; value: number }>> = {
  '7d': [
    { day: '周一', value: 3 }, { day: '周二', value: 5 }, { day: '周三', value: 8 },
    { day: '周四', value: 4 }, { day: '周五', value: 9 }, { day: '周六', value: 6 }, { day: '周日', value: 7 },
  ],
  '30d': Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}日`, value: Math.round(3 + Math.abs(Math.sin(i * 0.7)) * 7) })),
  term: Array.from({ length: 16 }, (_, i) => ({ day: `W${i + 1}`, value: Math.round(15 + Math.abs(Math.sin(i * 0.4)) * 15) })),
};

// 小组提交趋势：偏组聚合量级（个人 × 5）
const GROUP_TREND: Record<Range, Array<{ day: string; value: number }>> = {
  '7d': [
    { day: '周一', value: 18 }, { day: '周二', value: 24 }, { day: '周三', value: 32 },
    { day: '周四', value: 22 }, { day: '周五', value: 38 }, { day: '周六', value: 28 }, { day: '周日', value: 34 },
  ],
  '30d': Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}日`, value: Math.round(15 + Math.abs(Math.sin(i * 0.6)) * 25) })),
  term: Array.from({ length: 16 }, (_, i) => ({ day: `W${i + 1}`, value: Math.round(60 + i * 2 + Math.abs(Math.sin(i * 0.4)) * 40) })),
};

// 张同学的个人能力画像（偏内容创作 / 协作沟通 / 汇报展示）
const MY_RADAR = [
  { axis: '资料检索', value: 76 },
  { axis: '内容创作', value: 95 },
  { axis: '协作沟通', value: 92 },
  { axis: '分析归纳', value: 80 },
  { axis: '汇报展示', value: 88 },
];

// 小组各维度均值（偏均衡）
const GROUP_RADAR = [
  { axis: '资料检索', value: 88 },
  { axis: '内容创作', value: 92 },
  { axis: '协作沟通', value: 90 },
  { axis: '分析归纳', value: 86 },
  { axis: '汇报展示', value: 90 },
];

export function AnalyticsPage() {
  const me = useCurrentUser();
  const kpi = useAnalyticsStore((s) => s.kpi);
  const heatmap = useAnalyticsStore((s) => s.heatmap);
  const distribution = useAnalyticsStore((s) => s.distribution);
  const allGroups = useGroupStore((s) => s.groups);

  const myGroup = allGroups.find((g) => me && g.memberIds.includes(me.id));
  const [range, setRange] = useState<Range>('7d');

  const donutData = [
    { label: '已完成', value: distribution.done, color: '#22c55e' },
    { label: '进行中', value: distribution.inProgress, color: '#3b82f6' },
    { label: '待开始', value: distribution.pending, color: '#f59e0b' },
  ];

  const exportCsv = () => {
    const rows = [
      ['维度', '数值'],
      ['我的提交次数（本期）', range === '7d' ? '23' : range === '30d' ? '87' : '312'],
      ['我的活跃天数', range === '7d' ? '6' : range === '30d' ? '22' : '68'],
      ['我的协作评分', String(kpi.collaborationScore)],
      ['我的文档贡献', '5'],
      ['所在小组', myGroup?.name ?? '未分组'],
      ['小组评分', String(myGroup?.collaborationScore ?? '-')],
      ['小组累计提交', String(myGroup?.totalSubmissions ?? '-')],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `我的协作分析-${range}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('已导出 CSV 报告');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">我的协作数据</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            数据范围：{myGroup ? `${myGroup.name}` : '未分组'} · {RANGE_LABEL[range]}
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
          <button onClick={exportCsv} className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1">
            <Download className="w-4 h-4" /> 导出 CSV
          </button>
        </div>
      </div>

      {/* 我的小组概况 - 横条带 */}
      {myGroup && (
        <div className="bg-gradient-to-br from-brand-50 via-white to-sky-50 rounded-2xl border border-brand-100 p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <UsersIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-slate-500">我的小组</div>
                <div className="text-lg font-bold text-slate-800">{myGroup.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-5 text-sm flex-wrap">
              <Inline label="组协作评分" value={myGroup.collaborationScore} />
              <Inline label="组累计提交" value={myGroup.totalSubmissions ?? '—'} />
              <Inline label="成员数" value={myGroup.memberIds.length} />
              <Inline label="当前阶段" value={myGroup.stage ?? '—'} />
              <Inline label="进度" value={typeof myGroup.progress === 'number' ? `${myGroup.progress}%` : '—'} />
            </div>
          </div>
        </div>
      )}

      {/* ============ 个人数据区 ============ */}
      <SectionHeader title="个人数据" subtitle="只反映你自己的行为" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Kpi label="我的提交次数" value={range === '7d' ? 23 : range === '30d' ? 87 : 312} hint="本期累计" />
        <Kpi label="我的活跃天数" value={range === '7d' ? 6 : range === '30d' ? 22 : 68} hint={range === '7d' ? '本周满勤' : range === '30d' ? '出勤率 73%' : '出勤率 85%'} />
        <Kpi label="我的文档贡献" value={5} hint="本期编辑 5 篇文档" icon={<FileText className="w-4 h-4 text-emerald-500" />} />
        <Kpi label="我的评论数" value={range === '7d' ? 12 : range === '30d' ? 41 : 178} hint="参与讨论次数" icon={<MessageSquare className="w-4 h-4 text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">我的活动热力图</h3>
          <Heatmap cells={heatmap} />
          <div className="text-xs text-slate-400 mt-3 text-center">数据反映你每天的协作活动密度</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">我的能力雷达</h3>
          <Radar data={MY_RADAR} />
          <div className="text-xs text-slate-400 mt-3 text-center">
            优势：<span className="text-brand-700 font-medium">内容创作 95</span> · <span className="text-brand-700 font-medium">协作沟通 92</span>
          </div>
        </div>
      </div>

      <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">我的提交趋势</h3>
        <TrendLine data={PERSONAL_TREND[range]} color="#2563eb" />
      </div>

      {/* ============ 小组数据区 ============ */}
      <SectionHeader
        title="小组数据"
        subtitle={`${myGroup?.name ?? '小组'} 整体表现，由所有成员行为聚合`}
        accent="emerald"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Kpi label="组累计提交" value={myGroup?.totalSubmissions ?? '—'} hint={`本期 ${Math.round((myGroup?.totalSubmissions ?? 0) / 4)} 次`} />
        <Kpi label="组协作评分" value={myGroup?.collaborationScore ?? '—'} suffix="/100" hint="↑ 3 vs 上周" positive primary />
        <Kpi label="组内排名" value="1" suffix="/4" hint="本课程小组排名" icon={<ActivityIcon className="w-4 h-4 text-amber-500" />} />
        <Kpi label="组任务完成" value="2/5" hint="40% 已完成" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">小组任务分布</h3>
          <div className="flex items-center justify-center">
            <Donut data={donutData} centerValue="5" centerLabel="组任务" size={170} />
          </div>
          <div className="space-y-2 mt-2">
            {donutData.map((d) => (
              <div key={d.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.label}
                </span>
                <span className="font-medium text-slate-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">小组能力雷达</h3>
          <Radar data={GROUP_RADAR} />
          <div className="text-xs text-slate-400 mt-3 text-center">
            小组短板：<span className="text-amber-600 font-medium">分析归纳 86</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">小组提交趋势</h3>
          <TrendLine data={GROUP_TREND[range]} color="#16a34a" height={200} />
          <div className="text-xs text-slate-400 mt-3 text-center">峰值发生在周五（39 次）</div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, accent = 'brand' }: { title: string; subtitle: string; accent?: 'brand' | 'emerald' }) {
  const bar = accent === 'brand' ? 'bg-gradient-to-b from-brand-500 to-blue-700' : 'bg-gradient-to-b from-emerald-500 to-emerald-700';
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={classNames('w-1 h-6 rounded-full', bar)} />
      <div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Kpi({
  label, value, suffix, hint, positive, primary, icon,
}: {
  label: string; value: string | number; suffix?: string; hint?: string;
  positive?: boolean; primary?: boolean; icon?: React.ReactNode;
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
      {hint && (
        <div className={'text-xs mt-1 ' + (positive ? 'text-green-500' : 'text-slate-400')}>
          {positive && <ArrowUp className="inline w-3 h-3 -mt-0.5" />} {hint}
        </div>
      )}
    </div>
  );
}

function Inline({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-base font-bold text-slate-800">{value}</div>
    </div>
  );
}
