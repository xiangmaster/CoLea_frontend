export interface DocComment {
  id: string;
  docId: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  createdAt: string;
  body: string;
  quotedText?: string;
  resolved?: boolean;
  replies?: Array<{ id: string; authorId: string; authorName: string; body: string; createdAt: string }>;
}

export interface DocVersion {
  id: string;
  docId: string;
  label: string;
  savedAt: string;
  authorName: string;
  summary: string;
}

export interface Doc {
  id: string;
  courseId: string;
  groupId?: string;
  title: string;
  version: string;
  updatedAt: string;
  /** Tiptap JSON 序列化字符串，或 HTML 字符串（仅用于评论页面的 fallback / 字数统计） */
  contentHtml: string;
  /** OnlyOffice 编辑器加载用的真实 .docx 路径（相对 public/） */
  docxPath: string;
  /** docx 文件类型，默认 docx */
  fileType?: 'docx' | 'xlsx' | 'pptx';
}

export const DOC_INITIAL_HTML = `
<h1>CoLea 需求分析报告</h1>
<h2>1. 项目背景</h2>
<p>CoLea 是一款面向高校课程小组协作场景的协同学习平台。针对传统教学工具中"任务分配、文档共创、过程追踪、反馈评价"相互割裂的痛点，系统以"组织协作—推进任务—沉淀文档—记录过程—智能反馈"为主线。</p>
<p>系统涵盖八大用例：用户认证与权限管理（UC1）、课程与小组管理（UC2）、任务与进度管理（UC3）、多人实时文档协作（UC4）。</p>
<h2>2. 功能需求</h2>
<p>平台需要支持多角色权限管理，包括学生、教师和管理员三种角色。每种角色拥有不同的操作权限和视图范围。</p>
<ul>
  <li>学生：查看课程、加入小组、提交任务、编辑文档、查看个人分析</li>
  <li>教师：管理课程、创建任务、评价提交、查看全班分析、AI 预警</li>
  <li>管理员：系统配置、用户管理（后续扩展）</li>
</ul>
<h2>3. 非功能需求</h2>
<p>性能：登录响应 &lt; 1s；文档协作端到端延迟 &lt; 300ms；并发支持 ≥ 500。</p>
<p>可用性：核心服务 SLA ≥ 99.5%；自动保存间隔 ≤ 30s；离线编辑后可重连合并。</p>
<p>安全：密码 bcrypt 加盐存储；JWT 1h 过期；敏感操作二次验证。</p>
`.trim();

export const SEED_DOCS: Doc[] = [
  {
    id: 'd-req-v2',
    courseId: 'c-se',
    groupId: 'g-alpha',
    title: '需求分析报告 v2.3',
    version: 'v2.3',
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    contentHtml: DOC_INITIAL_HTML,
    docxPath: '/sample/colea-requirements.docx',
  },
  {
    id: 'd-design-v1',
    courseId: 'c-se',
    groupId: 'g-alpha',
    title: '系统设计文档 v1.0',
    version: 'v1.0',
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    contentHtml: '<h1>系统设计文档</h1><p>本文档定义 CoLea 的整体架构、服务拆分与数据模型。</p>',
    docxPath: '/sample/colea-system-design.docx',
  },
  {
    id: 'd-meeting',
    courseId: 'c-se',
    groupId: 'g-alpha',
    title: 'Alpha 组每周例会纪要',
    version: 'v1.2',
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    contentHtml: '<h1>例会纪要</h1><p>本周完成事项 / 下周计划 / 风险与决策。</p>',
    docxPath: '/sample/colea-meeting-notes.docx',
  },
];

export const SEED_COMMENTS: DocComment[] = [
  {
    id: 'cm-1',
    docId: 'd-req-v2',
    authorId: 'u-li',
    authorName: '李同学',
    authorColor: 'bg-green-500',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    body: 'UC3 的任务状态机需要补充 Overdue 状态的触发条件说明',
    quotedText: '任务与进度管理（UC3）',
  },
  {
    id: 'cm-2',
    docId: 'd-req-v2',
    authorId: 'u-wang',
    authorName: '王同学',
    authorColor: 'bg-purple-500',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    body: '建议增加管理员角色的权限说明，虽然本期不实现但需求层面应该预留',
    replies: [
      {
        id: 'r-1',
        authorId: 'u-zhang',
        authorName: '张同学',
        body: '同意，已补充到 2.1 节',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'cm-3',
    docId: 'd-req-v2',
    authorId: 'u-zhang',
    authorName: '张同学',
    authorColor: 'bg-blue-500',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    body: '第 3 段的表述需要修改',
    resolved: true,
  },
];

export const SEED_VERSIONS: DocVersion[] = [
  { id: 'v-1', docId: 'd-req-v2', label: 'v2.3 (当前)', savedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), authorName: '张同学', summary: '完善非功能性需求章节' },
  { id: 'v-2', docId: 'd-req-v2', label: 'v2.2', savedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), authorName: '李同学', summary: '补充 UC3 状态机说明' },
  { id: 'v-3', docId: 'd-req-v2', label: 'v2.1', savedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), authorName: '王同学', summary: '初版用户故事' },
  { id: 'v-4', docId: 'd-req-v2', label: 'v2.0', savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), authorName: '张同学', summary: '重构章节结构' },
];
