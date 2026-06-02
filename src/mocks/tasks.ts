export type TaskStatus = 'done' | 'in_progress' | 'overdue' | 'pending';

export interface SubmissionFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  uploader: string;
  /** 若提供，可在线用 OnlyOffice 预览（对应 public/ 下的 .docx 路径） */
  docxPath?: string;
}

export interface Submission {
  id: string;
  groupId: string;
  groupName: string;
  taskId: string;
  content: string;
  files: SubmissionFile[];
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface Task {
  id: string;
  courseId: string;
  title: string;
  description: string;
  deadline: string; // yyyy-mm-dd
  status: TaskStatus;
  completed: number; // x of total groups
  total: number;
  stage: string;
  attachments: SubmissionFile[];
  rubric: string[];
}

// 时间基线：今天是 2026-06-01（第 15 周）
// 需求 → 已完成；系统设计 → 已完成；原型 → 逾期；编码 Sprint 1 → 进行中；测试 → 待开始
export const SEED_TASKS: Task[] = [
  {
    id: 't-req',
    courseId: 'c-se',
    title: '需求分析报告',
    description: '撰写完整的需求分析文档，包括用户画像、用例图、功能/非功能性需求。',
    deadline: '2026-04-15',
    status: 'done',
    completed: 3,
    total: 3,
    stage: '需求阶段',
    attachments: [
      { id: 'f-tmpl1', name: '需求模板.docx', size: '128 KB', uploadedAt: '2026-04-01T09:00:00', uploader: '李教授' },
    ],
    rubric: ['完整性 30%', '清晰度 25%', '可行性 25%', '排版 20%'],
  },
  {
    id: 't-design',
    courseId: 'c-se',
    title: '系统设计文档',
    description: '完成架构设计、接口定义、数据库 ER 图与部署视图。',
    deadline: '2026-05-15',
    status: 'done',
    completed: 4,
    total: 4,
    stage: '设计阶段',
    attachments: [
      { id: 'f-arch', name: '架构模板.pptx', size: '512 KB', uploadedAt: '2026-04-25T10:00:00', uploader: '李教授' },
    ],
    rubric: ['架构合理性 35%', '接口规范 25%', '数据设计 25%', '文档质量 15%'],
  },
  {
    id: 't-proto',
    courseId: 'c-se',
    title: '原型设计交付',
    description: '完成高保真原型与交互说明文档，至少覆盖 8 个核心页面。',
    deadline: '2026-05-25',
    status: 'overdue',
    completed: 1,
    total: 3,
    stage: '设计阶段',
    attachments: [],
    rubric: ['完成度 40%', '视觉效果 30%', '交互合理 30%'],
  },
  {
    id: 't-code',
    courseId: 'c-se',
    title: '编码实现 Sprint 1',
    description: '完成核心功能模块开发，包括认证、课程、任务三大模块。',
    deadline: '2026-06-20',
    status: 'in_progress',
    completed: 2,
    total: 5,
    stage: '实现阶段',
    attachments: [
      { id: 'f-codeplan', name: 'Sprint1 任务拆分.xlsx', size: '64 KB', uploadedAt: '2026-05-26T14:00:00', uploader: '李教授' },
    ],
    rubric: ['功能完整 40%', '代码质量 30%', '测试覆盖 30%'],
  },
  {
    id: 't-test',
    courseId: 'c-se',
    title: '单元测试与集成测试',
    description: '编写测试用例并执行，提交测试报告与覆盖率分析。',
    deadline: '2026-07-05',
    status: 'pending',
    completed: 0,
    total: 3,
    stage: '测试阶段',
    attachments: [],
    rubric: ['覆盖率 50%', '用例设计 30%', '报告 20%'],
  },
];

export const SEED_SUBMISSIONS: Submission[] = [
  {
    id: 's-req-alpha',
    groupId: 'g-alpha',
    groupName: 'Alpha 组',
    taskId: 't-req',
    content: 'Alpha 组完成的需求分析报告，含 4 个核心用户故事、12 项功能性需求、6 项非功能性需求。',
    files: [{ id: 'f1', name: 'Alpha-需求分析v1.0.docx', size: '1.2 MB', uploadedAt: '2026-04-14T16:30:00', uploader: '张同学', docxPath: '/sample/colea-requirements.docx' }],
    submittedAt: '2026-04-14T16:30:00',
    score: 92,
    feedback: '需求分析全面、用例图清晰，建议补充非功能性需求的量化指标。',
    status: 'graded',
  },
  {
    id: 's-design-alpha',
    groupId: 'g-alpha',
    groupName: 'Alpha 组',
    taskId: 't-design',
    content: 'Alpha 组系统设计文档 v1.2，含微服务边界、gRPC 接口契约、数据库 ER 图、Kubernetes 部署视图。',
    files: [{ id: 'f-sd-alpha', name: 'Alpha-系统设计v1.2.docx', size: '3.1 MB', uploadedAt: '2026-05-14T11:20:00', uploader: '张同学', docxPath: '/sample/colea-system-design.docx' }],
    submittedAt: '2026-05-14T11:20:00',
    score: 89,
    feedback: '架构层次清晰，服务边界划分合理；接口文档可再补充错误码规范。',
    status: 'graded',
  },
  {
    id: 's-design-beta',
    groupId: 'g-beta',
    groupName: 'Beta 组',
    taskId: 't-design',
    content: 'Beta 组提交系统设计 v0.9，含微服务架构、接口契约与数据库 ER 图。',
    files: [{ id: 'f2', name: 'Beta-系统设计v0.9.docx', size: '2.3 MB', uploadedAt: '2026-05-13T20:10:00', uploader: '刘同学', docxPath: '/sample/colea-system-design.docx' }],
    submittedAt: '2026-05-13T20:10:00',
    score: 88,
    feedback: '数据建模思路清晰，建议补充范式分析章节。',
    status: 'graded',
  },
  {
    id: 's-code-delta',
    groupId: 'g-delta',
    groupName: 'Delta 组',
    taskId: 't-code',
    content: 'Delta 组 Sprint 1 阶段性提交：完成认证模块 + 课程列表 API + 前端联调。',
    files: [{ id: 'f-code1', name: 'Delta-Sprint1阶段交付报告.docx', size: '1.8 MB', uploadedAt: '2026-05-29T17:40:00', uploader: '杨同学', docxPath: '/sample/colea-meeting-notes.docx' }],
    submittedAt: '2026-05-29T17:40:00',
    status: 'submitted',
  },
  {
    id: 's-code-alpha',
    groupId: 'g-alpha',
    groupName: 'Alpha 组',
    taskId: 't-code',
    content: 'Alpha 组 Sprint 1 阶段性提交：张同学完成 JWT 中间件 + 单元测试（覆盖率 82%），李同学完成课程列表 API 与前端联调，本周末同步推进任务模块。',
    files: [{ id: 'f-code2', name: 'Alpha-Sprint1阶段交付.docx', size: '2.1 MB', uploadedAt: '2026-05-30T20:15:00', uploader: '张同学', docxPath: '/sample/colea-meeting-notes.docx' }],
    submittedAt: '2026-05-30T20:15:00',
    status: 'submitted',
  },
];
