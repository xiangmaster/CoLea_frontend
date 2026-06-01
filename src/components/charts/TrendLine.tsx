import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  data: Array<{ day: string; value: number }>;
  color?: string;
  height?: number;
}

export function TrendLine({ data, color = '#2563eb', height = 220 }: Props) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
