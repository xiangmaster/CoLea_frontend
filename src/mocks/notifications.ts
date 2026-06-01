export type NotificationKind = 'task' | 'grade' | 'doc' | 'group' | 'system' | 'announce';

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  link?: string;
  read?: boolean;
  fromName?: string;
  fromColor?: string;
}

const now = Date.now();
const ago = (m: number) => new Date(now - m * 60 * 1000).toISOString();

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    kind: 'grade',
    title: '需求分析报告已评分',
    body: '李教授给 Alpha 组打了 92 分，并附评语 "需求分析全面…"',
    createdAt: ago(8),
    link: '/app/tasks/t-req',
    fromName: '李教授',
    fromColor: 'bg-brand-600',
  },
  {
    id: 'n-2',
    kind: 'task',
    title: '原型设计交付 已逾期',
    body: '截止时间已过 2 天，仅 1/3 组完成提交',
    createdAt: ago(45),
    link: '/app/tasks/t-proto',
  },
  {
    id: 'n-3',
    kind: 'doc',
    title: '李同学 在 需求分析报告 v2.3 添加了评论',
    body: 'UC3 的任务状态机需要补充 Overdue 状态的触发条件说明',
    createdAt: ago(90),
    link: '/app/docs/d-req-v2',
    fromName: '李同学',
    fromColor: 'bg-green-500',
  },
  {
    id: 'n-4',
    kind: 'announce',
    title: '李教授发布课程公告',
    body: '本周三课堂会演示中期答辩，请各小组提前准备 5 分钟汇报',
    createdAt: ago(180),
    link: '/app/courses/c-se',
    fromName: '李教授',
    fromColor: 'bg-brand-600',
  },
  {
    id: 'n-5',
    kind: 'group',
    title: 'Alpha 组协作评分上升',
    body: '本周 +3 分，当前 92，组排第 1',
    createdAt: ago(600),
    link: '/app/analytics',
    read: true,
  },
];

/** 用于"实时推送"：每隔几秒随机挑一条进 store */
export const LIVE_NOTIFICATION_POOL: Omit<Notification, 'id' | 'createdAt'>[] = [
  { kind: 'doc', title: '王同学 编辑了 系统设计文档 v1.0', body: '在第 2 节补充了组件交互序列图', link: '/app/docs/d-design-v1', fromName: '王同学', fromColor: 'bg-purple-500' },
  { kind: 'task', title: '编码实现 Sprint 1 距截止 6 天', body: '当前 0/5 组开始，建议尽早分工', link: '/app/tasks/t-code' },
  { kind: 'group', title: 'Beta 组新成员加入', body: '吴同学 加入 Beta 组担任 PM', link: '/app/courses/c-se/groups', fromName: '吴同学', fromColor: 'bg-indigo-500' },
  { kind: 'grade', title: '王教授给 Delta 组打了 88 分', body: '"数据建模思路清晰，建议补充范式分析章节"', fromName: '王教授', fromColor: 'bg-purple-600', link: '/app/tasks/t-design' },
  { kind: 'doc', title: '陈同学 @ 你', body: '在 需求分析报告 v2.3 评论里 @ 了你', link: '/app/docs/d-req-v2', fromName: '陈同学', fromColor: 'bg-cyan-500' },
  { kind: 'system', title: '本月协作评分已结算', body: '你的协作评分较上月 +5，进入年级前 15%', link: '/app/profile' },
  { kind: 'announce', title: '系统将在 23:00 进行例行维护', body: '预计 5 分钟，期间文档协作功能不可用', },
  { kind: 'task', title: '单元测试与集成测试 倒计时 12 天', body: 'Beta 组已开始编写测试计划', link: '/app/tasks/t-test', fromName: 'Beta 组', fromColor: 'bg-amber-500' },
];

export const NOTIFICATION_ICON: Record<NotificationKind, string> = {
  task: '📋',
  grade: '⭐',
  doc: '📝',
  group: '👥',
  system: '⚙️',
  announce: '📢',
};
