import { useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, Download } from 'lucide-react';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { useCourseStore } from '@/store/courseStore';
import { useGroupStore } from '@/store/groupStore';
import { Heatmap } from '@/components/charts/Heatmap';
import { Donut } from '@/components/charts/Donut';
import { Radar } from '@/components/charts/Radar';
import { TrendLine } from '@/components/charts/TrendLine';
import { classNames } from '@/lib/format';
import { toast } from '@/store/toastStore';

type Range = '7d' | '30d' | 'term';

const RANGE_FACTOR: Record<Range, number> = { '7d': 1, '30d': 4.1, term: 16.5 };
const RANGE_DELTA: Record<Range, number> = { '7d': 1, '30d': 0.7, term: 0.55 };

const TREND_BY_RANGE: Record<Range, Array<{ day: string; value: number }>> = {
  '7d': [
    { day: '周一', value: 12 }, { day: '周二', value: 18 }, { day: '周三', value: 24 },
    { day: '周四', value: 16 }, { day: '周五', value: 30 }, { day: '周六', value: 22 }, { day: '周日', value: 34 },
  ],
  '30d': Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}日`, value: Math.round(10 + Math.abs(Math.sin(i * 0.7)) * 25) })),
  term: Array.from({ length: 16 }, (_, i) => ({ day: `W${i + 1}`, value: Math.round(20 + Math.abs(Math.sin(i * 0.4)) * 60) })),
};

const RADAR_BY_GROUP: Record<string, { axis: string; value: number }[]> = {
  all: [
    { axis: '代码贡献', value: 92 }, { axis: '文档审查', value: 85 }, { axis: '讨论参与', value: 78 },
    { axis: '文档撰写', value: 90 }, { axis: '测试覆盖', value: 72 },
  ],
  'g-alpha': [
    { axis: '代码贡献', value: 94 }, { axis: '文档审查', value: 88 }, { axis: '讨论参与', value: 82 },
    { axis: '文档撰写', value: 93 }, { axis: '测试覆盖', value: 78 },
  ],
  'g-beta': [
    { axis: '代码贡献', value: 86 }, { axis: '文档审查', value: 70 }, { axis: '讨论参与', value: 60 },
    { axis: '文档撰写', value: 82 }, { axis: '测试覆盖', value: 65 },
  ],
  'g-gamma': [
    { axis: '代码贡献', value: 55 }, { axis: '文档审查', value: 48 }, { axis: '讨论参与', value: 42 },
    { axis: '文档撰写', value: 58 }, { axis: '测试覆盖', value: 40 },
  ],
  'g-delta': [
    { axis: '代码贡献', value: 88 }, { axis: '文档审查', value: 90 }, { axis: '讨论参与', value: 86 },
    { axis: '文档撰写', value: 91 }, { axis: '测试覆盖', value: 82 },
  ],
};

export function AnalyticsPage() {
  const kpi = useAnalyticsStore((s) => s.kpi);
  const heatmap = useAnalyticsStore((s) => s.heatmap);
  const distribution = useAnalyticsStore((s) => s.distribution);
  const courses = useCourseStore((s) => s.courses);
  const groups = useGroupStore((s) => s.groups);
  const [range, setRange] = useState<Range>('7d');
  const [courseId, setCourseId] = useState('all');
  const [groupId, setGroupId] = useState('all');
  const [compareGroupId, setCompareGroupId] = useState<string | null>(null);

  const factor = RANGE_FACTOR[range];
  const dFactor = RANGE_DELTA[range];

  const courseGroups = useMemo(() => {
    if (courseId === 'all') return groups;
    return groups.filter((g) => g.courseId === courseId);
  }, [courseId, groups]);

  const trendData = TREND_BY_RANGE[range];
  const radarData = RADAR_BY_GROUP[groupId] ?? RADAR_BY_GROUP.all;
  const compareData = compareGroupId ? RADAR_BY_GROUP[compareGroupId] : null;

  const donutData = [
    { label: '已完成', value: distribution.done, color: '#22c55e' },
    { label: '进行中', value: distribution.inProgress, color: '#3b82f6' },
    { label: '待开始', value: distribution.pending, color: '#f59e0b' },
  ];

  const exportCsv = () => {
    const rows = [
      ['指标', '数值'],
      ['总提交次数', String(Math.round(kpi.totalSubmissions * factor))],
      ['代码行变更', kpi.codeChanges],
      ['活跃天数', String(kpi.activeDays)],
      ['协作评分', String(kpi.collaborationScore)],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `colea-analytics-${range}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('已导出 CSV 报告');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">协作数据仪表盘</h1>
          <p className="text-slate-500 text-sm mt-1">UC6 · 可视化分析 · 数据范围 {{ '7d': '近 7 天', '30d': '近 30 天', term: '整学期' }[range]}</p>
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
                {{ '7d': '近 7 天', '30d': '近 30 天', term: '整学期' }[r]}
              </button>
            ))}
          </div>
          <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setGroupId('all'); setCompareGroupId(null); }} className="px-3 py-2 text-sm border border-slate-200 rounded-lg">
            <option value="all">全部课程</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg">
            <option value="all">全部小组</option>
            {courseGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <button onClick={exportCsv} className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1">
            <Download className="w-4 h-4" /> 导出 CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Kpi label="总提交次数" value={Math.round(kpi.totalSubmissions * factor)} delta={`${(kpi.deltaSubmissionsPct * dFactor).toFixed(1)}% vs 上期`} positive />
        <Kpi label="代码行变更" value={`${(parseFloat(kpi.codeChanges) * factor).toFixed(1)}K`} delta={`${(kpi.deltaCodePct * dFactor).toFixed(1)}% vs 上期`} positive />
        <Kpi label="活跃天数" value={range === '7d' ? 6 : range === '30d' ? 23 : 76} delta={range === '7d' ? '本周共 7 天' : range === '30d' ? '本月共 30 天' : '学期共 16 周'} />
        <Kpi label="协作评分" value={kpi.collaborationScore} suffix="/100" delta={`↑ ${kpi.deltaScore} vs 上期`} positive primary />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">活动热力图</h3>
            <span className="text-xs text-slate-400">{range === '7d' ? '近 13 周' : range === '30d' ? '近 13 周' : '整学期'}</span>
          </div>
          <Heatmap cells={heatmap} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">任务分布</h3>
          <div className="flex items-center justify-center">
            <Donut data={donutData} centerValue="8" centerLabel="总任务" size={170} />
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
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">小组贡献度雷达图</h3>
            <select
              value={compareGroupId ?? 'none'}
              onChange={(e) => setCompareGroupId(e.target.value === 'none' ? null : e.target.value)}
              className="text-xs px-2 py-1 border border-slate-200 rounded"
            >
              <option value="none">对比…</option>
              {Object.keys(RADAR_BY_GROUP).filter((k) => k !== groupId && k !== 'all').map((k) => (
                <option key={k} value={k}>{groups.find((g) => g.id === k)?.name ?? k}</option>
              ))}
            </select>
          </div>
          <Radar data={radarData} />
          {compareData && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 mb-2">对比：{groups.find((g) => g.id === compareGroupId)?.name}</div>
              <div className="grid grid-cols-5 gap-2">
                {radarData.map((p, i) => {
                  const diff = p.value - compareData[i].value;
                  return (
                    <div key={p.axis} className="text-center">
                      <div className="text-[10px] text-slate-400">{p.axis}</div>
                      <div className={classNames('text-xs font-medium flex items-center justify-center gap-0.5', diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-slate-500')}>
                        {diff > 0 ? <ArrowUp className="w-3 h-3" /> : diff < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                        {Math.abs(diff)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">提交趋势</h3>
          <TrendLine data={trendData} />
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label, value, suffix, delta, positive, primary,
}: {
  label: string; value: string | number; suffix?: string; delta?: string; positive?: boolean; primary?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={primary ? 'text-2xl font-bold text-brand-600' : 'text-2xl font-bold text-slate-800'}>
        {value}
        {suffix && <span className="text-sm text-slate-400 font-normal">{suffix}</span>}
      </div>
      {delta && (
        <div className={'text-xs mt-1 ' + (positive ? 'text-green-500' : 'text-slate-400')}>
          {positive && <ArrowUp className="inline w-3 h-3 -mt-0.5" />} {delta}
        </div>
      )}
    </div>
  );
}
