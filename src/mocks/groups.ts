export type GroupHealth = 'healthy' | 'medium' | 'warning';

export interface Group {
  id: string;
  courseId: string;
  name: string;
  memberIds: string[];
  collaborationScore: number;
  activity: 'high' | 'medium' | 'low';
  health: GroupHealth;
  /** 本组当前所处的协作阶段（任何课程都适用） */
  stage?: string;
  /** 本组任务完成进度（0-100） */
  progress?: number;
  /** 一句话描述本组最近的动态，让每个组看起来都不一样 */
  recentHighlight?: string;
  /** 本组累计提交次数 */
  totalSubmissions?: number;
  /** 上次活动距今小时（用于"上次活动 X 前"显示） */
  lastActiveHoursAgo?: number;
}

export const SEED_GROUPS: Group[] = [
  {
    id: 'g-alpha',
    courseId: 'c-se',
    name: 'Alpha 组',
    memberIds: ['u-zhang', 'u-li', 'u-wang', 'u-zhao', 'u-chen'],
    collaborationScore: 92,
    activity: 'high',
    health: 'healthy',
    stage: '编码实现 Sprint 1',
    progress: 78,
    totalSubmissions: 42,
    lastActiveHoursAgo: 0.3,
    recentHighlight: '刚刚提交了 Sprint 1 阶段交付报告',
  },
  {
    id: 'g-beta',
    courseId: 'c-se',
    name: 'Beta 组',
    memberIds: ['u-liu', 'u-chen', 'u-zhou', 'u-wu', 'u-yang'],
    collaborationScore: 78,
    activity: 'medium',
    health: 'medium',
    stage: '系统设计 → 实现',
    progress: 55,
    totalSubmissions: 26,
    lastActiveHoursAgo: 14,
    recentHighlight: '刘同学昨天补充了数据库 ER 图',
  },
  {
    id: 'g-gamma',
    courseId: 'c-se',
    name: 'Gamma 组',
    memberIds: ['u-sun', 'u-zheng', 'u-huang'],
    collaborationScore: 52,
    activity: 'low',
    health: 'warning',
    stage: '需求分析（落后）',
    progress: 22,
    totalSubmissions: 9,
    lastActiveHoursAgo: 96,
    recentHighlight: '过去 4 天没有协作记录，AI 已发出预警',
  },
  {
    id: 'g-delta',
    courseId: 'c-se',
    name: 'Delta 组',
    memberIds: ['u-yang', 'u-li', 'u-wang', 'u-zhao', 'u-zhou'],
    collaborationScore: 89,
    activity: 'high',
    health: 'healthy',
    stage: '编码实现 Sprint 1',
    progress: 65,
    totalSubmissions: 38,
    lastActiveHoursAgo: 6,
    recentHighlight: '杨同学今天提交了认证模块代码',
  },
];
