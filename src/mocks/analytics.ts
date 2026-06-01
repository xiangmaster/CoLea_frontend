export interface KpiSet {
  totalSubmissions: number;
  codeChanges: string;
  activeDays: number;
  collaborationScore: number;
  deltaSubmissionsPct: number;
  deltaCodePct: number;
  deltaScore: number;
}

export interface HeatmapCell {
  weekday: number; // 0=一 .. 6=日
  index: number; // 0..12
  level: 0 | 1 | 2 | 3 | 4;
}

export interface RadarPoint {
  axis: string;
  value: number;
}

export interface TaskDistribution {
  done: number;
  inProgress: number;
  pending: number;
}

function genHeatmap(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  // 用确定性的伪随机，让数据"看起来真实"但不会刷新就变
  const seed = (i: number) => ((Math.sin(i * 12.9898) + 1) / 2);
  for (let w = 0; w < 7; w++) {
    for (let i = 0; i < 13; i++) {
      const v = seed(w * 13 + i + 1);
      const level = (v < 0.25 ? 0 : v < 0.45 ? 1 : v < 0.65 ? 2 : v < 0.85 ? 3 : 4) as 0 | 1 | 2 | 3 | 4;
      cells.push({ weekday: w, index: i, level });
    }
  }
  return cells;
}

export const SEED_KPI: KpiSet = {
  totalSubmissions: 156,
  codeChanges: '2.4K',
  activeDays: 23,
  collaborationScore: 87,
  deltaSubmissionsPct: 12,
  deltaCodePct: 8,
  deltaScore: 3,
};

export const SEED_HEATMAP: HeatmapCell[] = genHeatmap();

export const SEED_RADAR: RadarPoint[] = [
  { axis: '代码贡献', value: 92 },
  { axis: '文档审查', value: 85 },
  { axis: '讨论参与', value: 78 },
  { axis: '文档撰写', value: 90 },
  { axis: '测试覆盖', value: 72 },
];

export const SEED_DISTRIBUTION: TaskDistribution = { done: 60, inProgress: 25, pending: 15 };

export const HEATMAP_PALETTE = ['#e2e8f0', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'];

/** 教师端用：每个小组的多维风险数据 */
export interface GroupRiskMetrics {
  groupId: string;
  groupName: string;
  level: 'high' | 'medium' | 'low';
  bullets: string[];
  suggestion: string;
}

export const SEED_GROUP_RISKS: GroupRiskMetrics[] = [
  {
    groupId: 'g-gamma',
    groupName: 'Gamma 组',
    level: 'high',
    bullets: ['过去 7 天仅 2 次提交', '1 名成员零活动记录', '任务进度落后 45%'],
    suggestion: '建议召开组会明确分工，对零活动成员进行 1-on-1 沟通，设置每日 Stand-up 机制',
  },
  {
    groupId: 'g-beta',
    groupName: 'Beta 组',
    level: 'medium',
    bullets: ['贡献度分布不均（基尼系数 0.65）', '1 人承担 70% 工作量', '任务进度基本正常'],
    suggestion: '建议重新分配子任务，设置明确的个人交付物，鼓励 Code Review 交叉检查',
  },
  {
    groupId: 'g-alpha',
    groupName: 'Alpha 组',
    level: 'low',
    bullets: ['贡献度均衡（基尼系数 0.18）', '全员活跃，平均每日 3 次提交', '任务进度超前 15%'],
    suggestion: '团队协作健康，可考虑挑战更高难度的扩展任务',
  },
];
