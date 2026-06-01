/**
 * AI 离线兜底回复：当 .env.local 没填 yunwu key 时使用。
 * 每条返回结构与真实流式返回 onDelta(text) 一致，模拟逐字打字效果由调用方控制。
 */

export const STUDENT_SUBTASK_FALLBACK = [
  '梳理核心功能模块的类结构与接口定义',
  '绘制系统架构图和部署视图',
  '编写数据库 ER 图和建表 DDL',
  '完成非功能性设计章节',
];

export const STUDENT_RESOURCES_FALLBACK = [
  { icon: '📖', title: 'gRPC 官方文档', desc: '适配你当前的接口设计任务' },
  { icon: '🎥', title: 'DDD 实战教程', desc: '帮助理解领域驱动设计模式' },
  { icon: '📝', title: 'K8s 部署最佳实践', desc: '物理架构设计参考' },
];

export const STUDENT_TIMELINE_FALLBACK = [
  { range: '6/02 - 6/05', text: '完成认证 + 课程模块前端联调' },
  { range: '6/06 - 6/12', text: '推进任务模块 + 子任务拆分' },
  { range: '6/13 - 6/18', text: '集成测试与提交前自检' },
];

export const TEACHER_RISK_SUGGESTIONS: Record<string, string> = {
  'g-gamma': '建议召开组会明确分工，对零活动成员进行 1-on-1 沟通，设置每日 Stand-up 机制',
  'g-beta': '建议重新分配子任务，设置明确的个人交付物，鼓励 Code Review 交叉检查',
  'g-alpha': '团队协作健康，可考虑挑战更高难度的扩展任务',
};
