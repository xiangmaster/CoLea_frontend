import { create } from 'zustand';
import { persist, persistOptions } from '@/lib/persist';
import { LIVE_ACTIVITY_POOL, SEED_ACTIVITIES, type Activity } from '@/mocks/activities';

interface ActivityState {
  items: Activity[];
  pushRandom: () => Activity | null;
  push: (a: Omit<Activity, 'id' | 'createdAt'>) => Activity;
  reset: () => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      items: SEED_ACTIVITIES,
      pushRandom: () => {
        const i = Math.floor(Math.random() * LIVE_ACTIVITY_POOL.length);
        const base = LIVE_ACTIVITY_POOL[i];
        const a: Activity = { ...base, id: `a-${Date.now()}`, createdAt: new Date().toISOString() };
        set({ items: [a, ...get().items].slice(0, 80) });
        return a;
      },
      push: (a) => {
        const item: Activity = { ...a, id: `a-${Date.now()}`, createdAt: new Date().toISOString() };
        set({ items: [item, ...get().items].slice(0, 80) });
        return item;
      },
      reset: () => set({ items: SEED_ACTIVITIES }),
    }),
    persistOptions<ActivityState>('activities'),
  ),
);
