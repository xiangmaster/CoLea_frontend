export function classNames(...xs: Array<string | undefined | null | false>): string {
  return xs.filter(Boolean).join(' ');
}

export function relativeTime(iso: string | number | Date, now = Date.now()): string {
  const ts = new Date(iso).getTime();
  const diff = Math.max(0, now - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s 前`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m 前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h 前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} 天前`;
  return new Date(iso).toLocaleDateString('zh-CN');
}

export function formatDate(iso: string | number | Date): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dateZh(d: Date = new Date()): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function weekOfTerm(now: Date = new Date()): number {
  // 学期假定从 2026-02-23 周一开始
  const termStart = new Date(2026, 1, 23).getTime();
  const diff = now.getTime() - termStart;
  return Math.max(1, Math.floor(diff / (7 * 24 * 3600 * 1000)) + 1);
}

export function initialOf(name: string): string {
  return name?.[0] ?? '?';
}
