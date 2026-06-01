import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: DonutDatum[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
}

export function Donut({ data, centerLabel, centerValue, size = 180 }: Props) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={size * 0.32} outerRadius={size * 0.45} paddingAngle={2}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number, n) => [`${v}`, n]} />
        </PieChart>
      </ResponsiveContainer>
      {centerValue !== undefined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold text-slate-800">{centerValue}</div>
          {centerLabel && <div className="text-xs text-slate-400 mt-0.5">{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}
