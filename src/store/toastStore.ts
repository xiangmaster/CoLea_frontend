import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
  ttl: number;
}

interface ToastState {
  items: ToastItem[];
  push: (kind: ToastKind, message: string, ttl?: number) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  items: [],
  push: (kind, message, ttl = 2800) => {
    const id = `tst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set({ items: [...get().items, { id, kind, message, ttl }] });
    setTimeout(() => set({ items: get().items.filter((x) => x.id !== id) }), ttl);
  },
  dismiss: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
}));

export const toast = {
  success: (m: string) => useToastStore.getState().push('success', m),
  error: (m: string) => useToastStore.getState().push('error', m),
  info: (m: string) => useToastStore.getState().push('info', m),
};
