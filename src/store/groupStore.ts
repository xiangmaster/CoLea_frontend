import { create } from 'zustand';
import { persist, persistOptions } from '@/lib/persist';
import { SEED_GROUPS, type Group } from '@/mocks/groups';
import { SEED_USERS } from '@/mocks/users';

export interface GroupRecommendation {
  id: string;
  memberIds: string[];
  rolesSummary: string[];
  complementarity: number;
}

interface GroupState {
  groups: Group[];
  recommendations: GroupRecommendation[];
  generating: boolean;
  generate: (params: { algorithm: string; sizePerGroup: number; courseId: string }) => Promise<void>;
  applyRecommendations: (courseId: string) => void;
  createGroup: (g: Omit<Group, 'id'>) => void;
  removeMember: (groupId: string, userId: string) => void;
  addMember: (groupId: string, userId: string) => void;
  moveMember: (userId: string, fromGroupId: string, toGroupId: string) => void;
  updateGroup: (id: string, patch: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  reset: () => void;
}

function roleLabelOfSkill(skills: [number, number, number, number, number]): string {
  const labels = ['前端', '后端', '设计', 'PM', '测试'];
  let maxI = 0;
  for (let i = 1; i < skills.length; i++) if (skills[i] > skills[maxI]) maxI = i;
  return labels[maxI];
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: SEED_GROUPS,
      recommendations: [],
      generating: false,
      generate: async ({ sizePerGroup, courseId }) => {
        set({ generating: true });
        // 假装算法跑 2.4s（K-Means 迭代 + 评分）
        await new Promise((r) => setTimeout(r, 2400));
        // 简化的"K-Means 互补匹配"：按技能向量主分量轮转分组
        const students = SEED_USERS.filter((u) => u.role === 'student' && u.courseIds?.includes(courseId));
        const buckets: Record<string, typeof students> = { 前端: [], 后端: [], 设计: [], PM: [], 测试: [] };
        students.forEach((s) => {
          const lbl = roleLabelOfSkill(s.skills ?? [0.2, 0.2, 0.2, 0.2, 0.2]);
          buckets[lbl].push(s);
        });
        const recs: GroupRecommendation[] = [];
        const groupCount = Math.max(2, Math.ceil(students.length / sizePerGroup));
        for (let gi = 0; gi < groupCount; gi++) {
          const memberIds: string[] = [];
          const rolesSummary: string[] = [];
          (['前端', '后端', '设计', 'PM', '测试'] as const).forEach((r) => {
            const pick = buckets[r][gi % Math.max(1, buckets[r].length)];
            if (pick && !memberIds.includes(pick.id) && memberIds.length < sizePerGroup) {
              memberIds.push(pick.id);
              rolesSummary.push(r);
            }
          });
          // 补足成员
          for (const s of students) {
            if (memberIds.length >= sizePerGroup) break;
            if (!memberIds.includes(s.id)) memberIds.push(s.id);
          }
          recs.push({
            id: `rec-${gi + 1}`,
            memberIds: memberIds.slice(0, sizePerGroup),
            rolesSummary: Array.from(new Set(rolesSummary)),
            complementarity: 95 - gi * 4,
          });
        }
        set({ recommendations: recs.slice(0, 3), generating: false });
      },
      applyRecommendations: (courseId) => {
        const recs = get().recommendations;
        if (!recs.length) return;
        const greekNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];
        const colors = ['blue', 'green', 'purple', 'orange', 'cyan'] as const;
        const newGroups: Group[] = recs.map((r, i) => ({
          id: `g-rec-${Date.now()}-${i}`,
          courseId,
          name: `${greekNames[i] ?? 'New'} 组`,
          memberIds: r.memberIds,
          roles: r.rolesSummary.map((label, idx) => ({ label, count: 1, color: colors[idx % colors.length] })),
          collaborationScore: 80 + Math.round(Math.random() * 10),
          activity: 'high',
          health: 'healthy',
        }));
        set({ groups: [...get().groups.filter((g) => g.courseId !== courseId), ...newGroups], recommendations: [] });
      },
      createGroup: (g) => set({ groups: [...get().groups, { ...g, id: `g-${Date.now()}` }] }),
      removeMember: (groupId, userId) =>
        set({
          groups: get().groups.map((g) =>
            g.id === groupId ? { ...g, memberIds: g.memberIds.filter((id) => id !== userId) } : g,
          ),
        }),
      addMember: (groupId, userId) =>
        set({
          groups: get().groups.map((g) =>
            g.id === groupId && !g.memberIds.includes(userId)
              ? { ...g, memberIds: [...g.memberIds, userId] }
              : g,
          ),
        }),
      moveMember: (userId, fromGroupId, toGroupId) =>
        set({
          groups: get().groups.map((g) => {
            if (g.id === fromGroupId) return { ...g, memberIds: g.memberIds.filter((id) => id !== userId) };
            if (g.id === toGroupId && !g.memberIds.includes(userId)) return { ...g, memberIds: [...g.memberIds, userId] };
            return g;
          }),
        }),
      updateGroup: (id, patch) => set({ groups: get().groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) }),
      deleteGroup: (id) => set({ groups: get().groups.filter((g) => g.id !== id) }),
      reset: () => set({ groups: SEED_GROUPS, recommendations: [] }),
    }),
    persistOptions<GroupState>('groups', {
      partialize: (s) => ({ groups: s.groups, recommendations: s.recommendations, generating: false }) as GroupState,
    }),
  ),
);
