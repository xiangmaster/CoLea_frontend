export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  body: string;
  authorName: string;
  authorColor: string;
  createdAt: string;
  pinned?: boolean;
}

const now = Date.now();
const ago = (h: number) => new Date(now - h * 3600 * 1000).toISOString();

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'an-1',
    courseId: 'c-se',
    title: '中期答辩安排（本周三 14:00）',
    body: '请各小组提前 15 分钟到达 J301。汇报顺序按小组名首字母，每组 8 分钟汇报 + 3 分钟提问。',
    authorName: '李教授',
    authorColor: 'bg-brand-600',
    createdAt: ago(6),
    pinned: true,
  },
  {
    id: 'an-2',
    courseId: 'c-se',
    title: '系统设计文档评分标准说明',
    body: '本次评分 35% 架构合理性 / 25% 接口规范 / 25% 数据设计 / 15% 文档质量。优秀作业将作为下学期范本。',
    authorName: '李教授',
    authorColor: 'bg-brand-600',
    createdAt: ago(28),
  },
  {
    id: 'an-3',
    courseId: 'c-db',
    title: '本周 OH 改至周四下午',
    body: '原周二 16:00 的 office hour 调整到周四 14:00-16:00，地点不变。',
    authorName: '王教授',
    authorColor: 'bg-purple-600',
    createdAt: ago(48),
  },
];
