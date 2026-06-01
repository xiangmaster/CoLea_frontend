import { createJSONStorage, persist as zPersist, type PersistOptions } from 'zustand/middleware';

export const STORAGE_PREFIX = 'colea:';

export function persistOptions<T>(name: string, extra?: Partial<PersistOptions<T>>): PersistOptions<T> {
  return {
    name: `${STORAGE_PREFIX}${name}`,
    storage: createJSONStorage(() => localStorage),
    version: 1,
    ...extra,
  };
}

export const persist = zPersist;

export function clearAllPersisted() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
