import { useEffect, useState } from 'react';
import { classNames } from '@/lib/format';

interface FakeCursor {
  id: string;
  name: string;
  color: string;
  top: number;
  left: number;
  text?: string;
}

const COLLABORATORS = [
  { id: 'c-li', name: '李同学', color: 'bg-green-500', text: 'text-green-500', bg: 'bg-green-100' },
  { id: 'c-wang', name: '王同学', color: 'bg-purple-500', text: 'text-purple-500', bg: 'bg-purple-100' },
];

/**
 * 模拟远端协作者的光标：在 ProseMirror 文档区域内随机选段落位置闪烁，
 * 每隔 4~7 秒切换位置。
 */
export function RemoteCursors({ scrollRoot }: { scrollRoot: HTMLElement | null }) {
  const [cursors, setCursors] = useState<FakeCursor[]>([]);

  useEffect(() => {
    if (!scrollRoot) return;
    let timer: number;

    const move = () => {
      const pm = scrollRoot.querySelector('.ProseMirror') as HTMLElement | null;
      if (!pm) {
        timer = window.setTimeout(move, 1500);
        return;
      }
      const paras = pm.querySelectorAll('p, h1, h2, h3, li');
      if (!paras.length) {
        timer = window.setTimeout(move, 1500);
        return;
      }
      const rootRect = pm.getBoundingClientRect();
      const next: FakeCursor[] = COLLABORATORS.map((c, i) => {
        const el = paras[(Math.floor(Math.random() * paras.length) + i) % paras.length] as HTMLElement;
        const r = el.getBoundingClientRect();
        const top = r.top - rootRect.top + 4;
        const left = r.left - rootRect.left + Math.random() * Math.max(40, r.width - 40);
        return { id: c.id, name: c.name, color: c.color, top, left };
      });
      setCursors(next);
      timer = window.setTimeout(move, 4000 + Math.random() * 3000);
    };
    timer = window.setTimeout(move, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [scrollRoot]);

  if (!scrollRoot) return null;
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {cursors.map((c) => (
        <div key={c.id} className="absolute" style={{ top: c.top, left: c.left }}>
          <span className={classNames('absolute -top-4 left-0 text-[10px] text-white px-1.5 py-0.5 rounded whitespace-nowrap', c.color)}>
            {c.name}
          </span>
          <span className={classNames('inline-block w-0.5 h-4 cursor-blink', c.color)} />
        </div>
      ))}
    </div>
  );
}
