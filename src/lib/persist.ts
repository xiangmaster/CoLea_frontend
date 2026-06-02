import { createJSONStorage, persist as zPersist, type PersistOptions } from 'zustand/middleware';

export const STORAGE_PREFIX = 'colea:';

/**
 * 全局 persist 版本号。每次 mock 数据 schema 改动后递增，
 * zustand 会因版本不匹配而把 localStorage 旧值丢弃、回退到 seed。
 */
const SCHEMA_VERSION = 3;

export function persistOptions<T>(name: string, extra?: Partial<PersistOptions<T>>): PersistOptions<T> {
  return {
    name: `${STORAGE_PREFIX}${name}`,
    storage: createJSONStorage(() => localStorage),
    version: SCHEMA_VERSION,
    ...extra,
  };
}

export const persist = zPersist;

export function clearAllPersisted() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
