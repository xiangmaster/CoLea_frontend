import { create } from 'zustand';
import { persist, persistOptions } from '@/lib/persist';
import { SEED_ANNOUNCEMENTS, type Announcement } from '@/mocks/announcements';

interface AnnouncementState {
  items: Announcement[];
  publish: (a: Omit<Announcement, 'id' | 'createdAt'>) => Announcement;
  remove: (id: string) => void;
  togglePin: (id: string) => void;
  reset: () => void;
}

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set, get) => ({
      items: SEED_ANNOUNCEMENTS,
      publish: (a) => {
        const item: Announcement = { ...a, id: `an-${Date.now()}`, createdAt: new Date().toISOString() };
        set({ items: [item, ...get().items] });
        return item;
      },
      remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
      togglePin: (id) => set({ items: get().items.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)) }),
      reset: () => set({ items: SEED_ANNOUNCEMENTS }),
    }),
    persistOptions<AnnouncementState>('announcements'),
  ),
);
