import { create } from 'zustand';
import { persist, persistOptions } from '@/lib/persist';
import { SEED_USERS, type Role, type User } from '@/mocks/users';

interface AuthState {
  currentUserId: string | null;
  role: Role | null;
  rememberMe: boolean;
  failedAttempts: number;
  setUser: (u: User) => void;
  logout: () => void;
  loginByAccount: (account: string, password: string, role: Role) => User | null;
  registerUser: (input: { name: string; account: string; password: string; role: Role; studentNo?: string; staffNo?: string }) => User;
  resetPassword: (account: string, newPassword: string) => boolean;
  switchToUser: (id: string) => void;
}

const initialUsers = [...SEED_USERS];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      role: null,
      rememberMe: true,
      failedAttempts: 0,
      setUser: (u) => set({ currentUserId: u.id, role: u.role, failedAttempts: 0 }),
      logout: () => set({ currentUserId: null, role: null }),
      loginByAccount: (account, password, role) => {
        const candidate = initialUsers.find(
          (u) => (u.account === account || u.studentNo === account || u.staffNo === account) && u.role === role,
        );
        // 演示宽容模式：账号匹配即可登录（密码非空即可），方便答辩
        if (!candidate || !password) {
          set({ failedAttempts: get().failedAttempts + 1 });
          return null;
        }
        set({ currentUserId: candidate.id, role: candidate.role, failedAttempts: 0 });
        return candidate;
      },
      registerUser: (input) => {
        const id = `u-new-${Date.now()}`;
        const u: User = {
          id,
          name: input.name,
          role: input.role,
          account: input.account,
          password: input.password,
          studentNo: input.studentNo,
          staffNo: input.staffNo,
          avatarColor: 'bg-brand-500',
          skills: [0.5, 0.5, 0.5, 0.5, 0.5],
          courseIds: ['c-se'],
        };
        initialUsers.push(u);
        set({ currentUserId: u.id, role: u.role });
        return u;
      },
      resetPassword: (account, newPassword) => {
        const u = initialUsers.find((x) => x.account === account || x.studentNo === account || x.staffNo === account);
        if (!u) return false;
        u.password = newPassword;
        return true;
      },
      switchToUser: (id) => {
        const u = initialUsers.find((x) => x.id === id);
        if (u) set({ currentUserId: u.id, role: u.role });
      },
    }),
    persistOptions<AuthState>('auth', {
      partialize: (s) => ({
        currentUserId: s.currentUserId,
        role: s.role,
        rememberMe: s.rememberMe,
        failedAttempts: 0,
      }) as AuthState,
    }),
  ),
);

export function useCurrentUser(): User | null {
  const id = useAuthStore((s) => s.currentUserId);
  if (!id) return null;
  return initialUsers.find((u) => u.id === id) ?? null;
}

export function getUserByIdLive(id: string): User | undefined {
  return initialUsers.find((u) => u.id === id);
}

export function getAllUsers(): User[] {
  return initialUsers;
}
