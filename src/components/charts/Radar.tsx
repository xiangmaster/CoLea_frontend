import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar as RadarShape, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { RadarPoint } from '@/mocks/analytics';

export function Radar({ data, height = 260 }: { data: RadarPoint[]; height?: number }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: '#64748b' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip />
          <RadarShape dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.32} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
