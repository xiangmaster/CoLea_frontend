export interface Course {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  term: string;
  gradient: string; // tailwind gradient classes
  shortCode: string;
  progress: number; // 0..100
  studentCount: number;
  taskCount: number;
  docCount: number;
  description: string;
}

export const SEED_COURSES: Course[] = [
  {
    id: 'c-se',
    name: '软件工程',
    teacherId: 't-li',
    teacherName: '李教授',
    term: '2026春',
    gradient: 'from-blue-500 to-blue-600',
    shortCode: 'SE',
    progress: 75,
    studentCount: 45,
    taskCount: 5,
    docCount: 8,
    description:
      '面向高校学生的软件工程课程，覆盖需求分析、系统设计、实现、测试与部署全流程，配合小组项目实战。',
  },
  {
    id: 'c-db',
    name: '数据库原理',
    teacherId: 't-wang',
    teacherName: '王教授',
    term: '2026春',
    gradient: 'from-purple-500 to-purple-600',
    shortCode: 'DB',
    progress: 60,
    studentCount: 38,
    taskCount: 3,
    docCount: 5,
    description: '关系数据库理论与实践，含 SQL、范式、索引、事务、并发控制与分布式数据库基础。',
  },
  {
    id: 'c-hci',
    name: '人机交互设计',
    teacherId: 't-chen',
    teacherName: '陈教授',
    term: '2026春',
    gradient: 'from-teal-500 to-teal-600',
    shortCode: 'HCI',
    progress: 40,
    studentCount: 32,
    taskCount: 1,
    docCount: 3,
    description: 'HCI 经典理论与现代设计方法，原型工具、用户研究、可用性测试。',
  },
];

export function getCourseById(id: string): Course | undefined {
  return SEED_COURSES.find((c) => c.id === id);
}
