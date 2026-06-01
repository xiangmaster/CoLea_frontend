import { HEATMAP_PALETTE, type HeatmapCell } from '@/mocks/analytics';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  const byWeekday: HeatmapCell[][] = WEEKDAYS.map((_, w) => cells.filter((c) => c.weekday === w));
  return (
    <div>
      <div className="space-y-1">
        {byWeekday.map((row, w) => (
          <div key={w} className="flex items-center gap-1">
            <span className="text-xs text-slate-400 w-5">{WEEKDAYS[w]}</span>
            {row.map((c) => (
              <div key={c.index} className="heatmap-cell" style={{ background: HEATMAP_PALETTE[c.level] }} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-slate-400">少</span>
        {HEATMAP_PALETTE.map((c, i) => (
          <div key={i} className="heatmap-cell" style={{ background: c }} />
        ))}
        <span className="text-xs text-slate-400">多</span>
      </div>
    </div>
  );
}
