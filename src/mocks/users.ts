export type Role = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  role: Role;
  account: string;
  password: string;
  studentNo?: string;
  staffNo?: string;
  avatarColor: string;
  /** 技能向量：用于 K-Means 智能分组（前端/后端/设计/PM/测试） */
  skills?: [number, number, number, number, number];
  /** 学生所属课程 ID 列表 */
  courseIds?: string[];
}

export const SEED_USERS: User[] = [
  {
    id: 'u-zhang',
    name: '张同学',
    role: 'student',
    account: 'student@colea',
    password: '123456',
    studentNo: '2024001',
    avatarColor: 'bg-blue-500',
    skills: [0.9, 0.3, 0.5, 0.4, 0.2],
    courseIds: ['c-se', 'c-db', 'c-hci'],
  },
  {
    id: 'u-li',
    name: '李同学',
    role: 'student',
    account: 'li@colea',
    password: '123456',
    studentNo: '2024002',
    avatarColor: 'bg-green-500',
    skills: [0.4, 0.9, 0.2, 0.3, 0.5],
    courseIds: ['c-se', 'c-db'],
  },
  {
    id: 'u-wang',
    name: '王同学',
    role: 'student',
    account: 'wang@colea',
    password: '123456',
    studentNo: '2024003',
    avatarColor: 'bg-purple-500',
    skills: [0.3, 0.4, 0.9, 0.5, 0.4],
    courseIds: ['c-se', 'c-hci'],
  },
  {
    id: 'u-zhao',
    name: '赵同学',
    role: 'student',
    account: 'zhao@colea',
    password: '123456',
    studentNo: '2024004',
    avatarColor: 'bg-orange-500',
    skills: [0.5, 0.5, 0.3, 0.9, 0.4],
    courseIds: ['c-se'],
  },
  {
    id: 'u-liu',
    name: '刘同学',
    role: 'student',
    account: 'liu@colea',
    password: '123456',
    studentNo: '2024005',
    avatarColor: 'bg-rose-500',
    skills: [0.4, 0.6, 0.4, 0.5, 0.9],
    courseIds: ['c-se', 'c-db'],
  },
  {
    id: 'u-chen',
    name: '陈同学',
    role: 'student',
    account: 'chen@colea',
    password: '123456',
    studentNo: '2024006',
    avatarColor: 'bg-cyan-500',
    skills: [0.6, 0.7, 0.5, 0.4, 0.6],
    courseIds: ['c-se', 'c-hci'],
  },
  {
    id: 'u-zhou',
    name: '周同学',
    role: 'student',
    account: 'zhou@colea',
    password: '123456',
    studentNo: '2024007',
    avatarColor: 'bg-amber-500',
    skills: [0.3, 0.8, 0.4, 0.6, 0.5],
    courseIds: ['c-se'],
  },
  {
    id: 'u-wu',
    name: '吴同学',
    role: 'student',
    account: 'wu@colea',
    password: '123456',
    studentNo: '2024008',
    avatarColor: 'bg-indigo-500',
    skills: [0.7, 0.4, 0.6, 0.5, 0.3],
    courseIds: ['c-db'],
  },
  {
    id: 'u-sun',
    name: '孙同学',
    role: 'student',
    account: 'sun@colea',
    password: '123456',
    studentNo: '2024009',
    avatarColor: 'bg-teal-500',
    skills: [0.5, 0.8, 0.3, 0.4, 0.6],
    courseIds: ['c-se'],
  },
  {
    id: 'u-zheng',
    name: '郑同学',
    role: 'student',
    account: 'zheng@colea',
    password: '123456',
    studentNo: '2024010',
    avatarColor: 'bg-pink-500',
    skills: [0.4, 0.7, 0.5, 0.6, 0.4],
    courseIds: ['c-se'],
  },
  {
    id: 'u-huang',
    name: '黄同学',
    role: 'student',
    account: 'huang@colea',
    password: '123456',
    studentNo: '2024011',
    avatarColor: 'bg-lime-600',
    skills: [0.5, 0.7, 0.4, 0.5, 0.7],
    courseIds: ['c-se'],
  },
  {
    id: 'u-yang',
    name: '杨同学',
    role: 'student',
    account: 'yang@colea',
    password: '123456',
    studentNo: '2024012',
    avatarColor: 'bg-violet-500',
    skills: [0.8, 0.3, 0.5, 0.7, 0.4],
    courseIds: ['c-se', 'c-db'],
  },
  // 教师
  {
    id: 't-li',
    name: '李教授',
    role: 'teacher',
    account: 'teacher@colea',
    password: '123456',
    staffNo: 'T2018003',
    avatarColor: 'bg-brand-600',
    courseIds: ['c-se'],
  },
  {
    id: 't-wang',
    name: '王教授',
    role: 'teacher',
    account: 'wangprof@colea',
    password: '123456',
    staffNo: 'T2017005',
    avatarColor: 'bg-purple-600',
    courseIds: ['c-db'],
  },
  {
    id: 't-chen',
    name: '陈教授',
    role: 'teacher',
    account: 'chenprof@colea',
    password: '123456',
    staffNo: 'T2019008',
    avatarColor: 'bg-teal-600',
    courseIds: ['c-hci'],
  },
];

export function getUserById(id: string): User | undefined {
  return SEED_USERS.find((u) => u.id === id);
}
