export type GroupHealth = 'healthy' | 'medium' | 'warning';

export interface Group {
  id: string;
  courseId: string;
  name: string;
  memberIds: string[];
  /** 角色构成 */
  roles: Array<{ label: string; count: number; color: string }>;
  collaborationScore: number;
  activity: 'high' | 'medium' | 'low';
  health: GroupHealth;
}

export const SEED_GROUPS: Group[] = [
  {
    id: 'g-alpha',
    courseId: 'c-se',
    name: 'Alpha 组',
    memberIds: ['u-zhang', 'u-li', 'u-wang', 'u-zhao', 'u-chen'],
    roles: [
      { label: '前端×2', count: 2, color: 'blue' },
      { label: '后端×2', count: 2, color: 'green' },
      { label: '设计×1', count: 1, color: 'purple' },
    ],
    collaborationScore: 92,
    activity: 'high',
    health: 'healthy',
  },
  {
    id: 'g-beta',
    courseId: 'c-se',
    name: 'Beta 组',
    memberIds: ['u-liu', 'u-chen', 'u-zhou', 'u-wu', 'u-yang'],
    roles: [
      { label: '前端×1', count: 1, color: 'blue' },
      { label: '后端×3', count: 3, color: 'green' },
      { label: 'PM×1', count: 1, color: 'orange' },
    ],
    collaborationScore: 78,
    activity: 'medium',
    health: 'medium',
  },
  {
    id: 'g-gamma',
    courseId: 'c-se',
    name: 'Gamma 组',
    memberIds: ['u-sun', 'u-zheng', 'u-huang'],
    roles: [
      { label: '后端×2', count: 2, color: 'green' },
      { label: 'PM×1', count: 1, color: 'orange' },
    ],
    collaborationScore: 52,
    activity: 'low',
    health: 'warning',
  },
  {
    id: 'g-delta',
    courseId: 'c-se',
    name: 'Delta 组',
    memberIds: ['u-yang', 'u-li', 'u-wang', 'u-zhao', 'u-zhou'],
    roles: [
      { label: '前端×1', count: 1, color: 'blue' },
      { label: '后端×1', count: 1, color: 'green' },
      { label: '设计×2', count: 2, color: 'purple' },
      { label: 'PM×1', count: 1, color: 'orange' },
    ],
    collaborationScore: 89,
    activity: 'high',
    health: 'healthy',
  },
];

export const ROLE_COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  cyan: 'bg-cyan-50 text-cyan-600',
};
