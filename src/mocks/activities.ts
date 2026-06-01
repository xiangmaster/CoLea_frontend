export type ActivityKind = 'attach' | 'submit' | 'comment' | 'grade' | 'join' | 'edit';

export interface Activity {
  id: string;
  kind: ActivityKind;
  actorName: string;
  actorColor: string;
  text: string;
  targetLabel?: string;
  link?: string;
  createdAt: string;
}

const now = Date.now();
const ago = (m: number) => new Date(now - m * 60 * 1000).toISOString();

export const SEED_ACTIVITIES: Activity[] = [
  { id: 'a-1', kind: 'submit', actorName: '张同学', actorColor: 'bg-blue-500', text: '提交了', targetLabel: '系统设计文档', link: '/app/tasks/t-design', createdAt: ago(2) },
  { id: 'a-2', kind: 'edit', actorName: '李同学', actorColor: 'bg-green-500', text: '编辑了', targetLabel: '需求分析报告', link: '/app/docs/d-req-v2', createdAt: ago(15) },
  { id: 'a-3', kind: 'join', actorName: '王同学', actorColor: 'bg-purple-500', text: '加入了', targetLabel: 'Alpha 组', link: '/app/courses/c-se/groups', createdAt: ago(60) },
  { id: 'a-4', kind: 'grade', actorName: '李教授', actorColor: 'bg-brand-600', text: '评分了', targetLabel: '需求分析报告 (Alpha 组 92)', link: '/teacher/grading', createdAt: ago(120) },
  { id: 'a-5', kind: 'comment', actorName: '陈同学', actorColor: 'bg-cyan-500', text: '评论了', targetLabel: '系统设计文档', link: '/app/docs/d-design-v1', createdAt: ago(200) },
  { id: 'a-6', kind: 'attach', actorName: '杨同学', actorColor: 'bg-violet-500', text: '在任务中上传了附件', targetLabel: '原型设计 — 高保真 v2.zip', link: '/app/tasks/t-proto', createdAt: ago(420) },
];

export const LIVE_ACTIVITY_POOL: Omit<Activity, 'id' | 'createdAt'>[] = [
  { kind: 'edit', actorName: '王同学', actorColor: 'bg-purple-500', text: '编辑了', targetLabel: '系统设计文档', link: '/app/docs/d-design-v1' },
  { kind: 'comment', actorName: '李同学', actorColor: 'bg-green-500', text: '在文档中评论', targetLabel: '需求分析报告 §2.1', link: '/app/docs/d-req-v2' },
  { kind: 'submit', actorName: 'Delta 组', actorColor: 'bg-violet-500', text: '提交了任务作业', targetLabel: '编码实现 Sprint 1', link: '/app/tasks/t-code' },
  { kind: 'attach', actorName: '吴同学', actorColor: 'bg-indigo-500', text: '上传了附件', targetLabel: '小组贡献度评测.xlsx', link: '/app/docs' },
  { kind: 'join', actorName: '黄同学', actorColor: 'bg-lime-600', text: '加入了', targetLabel: 'Gamma 组', link: '/app/courses/c-se/groups' },
  { kind: 'edit', actorName: '陈同学', actorColor: 'bg-cyan-500', text: '修改了', targetLabel: '原型设计说明 — 文档协作页', link: '/app/docs/d-req-v2' },
  { kind: 'grade', actorName: '李教授', actorColor: 'bg-brand-600', text: '评分了', targetLabel: 'Beta 组 系统设计 (88)', link: '/teacher/grading' },
  { kind: 'comment', actorName: '周同学', actorColor: 'bg-amber-500', text: '回复了评论', targetLabel: '需求分析报告 §3.2', link: '/app/docs/d-req-v2' },
  { kind: 'edit', actorName: '赵同学', actorColor: 'bg-orange-500', text: '新建了文档', targetLabel: 'Alpha 组 测试用例汇总', link: '/app/docs' },
  { kind: 'submit', actorName: 'Alpha 组', actorColor: 'bg-blue-500', text: '提交了任务作业', targetLabel: '系统设计文档', link: '/app/tasks/t-design' },
];

export const ACTIVITY_DOT_COLOR: Record<ActivityKind, string> = {
  attach: 'bg-emerald-500',
  submit: 'bg-blue-500',
  comment: 'bg-amber-500',
  grade: 'bg-brand-600',
  join: 'bg-indigo-500',
  edit: 'bg-cyan-500',
};
