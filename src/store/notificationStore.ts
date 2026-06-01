import { create } from 'zustand';
import { persist, persistOptions } from '@/lib/persist';
import { LIVE_NOTIFICATION_POOL, SEED_NOTIFICATIONS, type Notification } from '@/mocks/notifications';

interface NotificationState {
  items: Notification[];
  cursor: number; // index into LIVE_NOTIFICATION_POOL
  pushRandom: () => Notification | null;
  pushOne: (n: Omit<Notification, 'id' | 'createdAt'>) => Notification;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      items: SEED_NOTIFICATIONS,
      cursor: 0,
      pushRandom: () => {
        const pool = LIVE_NOTIFICATION_POOL;
        if (!pool.length) return null;
        const c = (get().cursor + Math.floor(Math.random() * 3) + 1) % pool.length;
        const base = pool[c];
        const n: Notification = { ...base, id: `n-${Date.now()}`, createdAt: new Date().toISOString() };
        set({ items: [n, ...get().items].slice(0, 50), cursor: c });
        return n;
      },
      pushOne: (n) => {
        const item: Notification = { ...n, id: `n-${Date.now()}`, createdAt: new Date().toISOString() };
        set({ items: [item, ...get().items].slice(0, 50) });
        return item;
      },
      markRead: (id) => set({ items: get().items.map((x) => (x.id === id ? { ...x, read: true } : x)) }),
      markAllRead: () => set({ items: get().items.map((x) => ({ ...x, read: true })) }),
      clear: () => set({ items: [] }),
      reset: () => set({ items: SEED_NOTIFICATIONS, cursor: 0 }),
    }),
    persistOptions<NotificationState>('notifications'),
  ),
);

export function useUnreadCount(): number {
  return useNotificationStore((s) => s.items.filter((x) => !x.read).length);
}
