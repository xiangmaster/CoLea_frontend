interface Props {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  showDots?: boolean;
}

/** 极简内联 sparkline：纯 SVG，无依赖，足以给 KPI 卡片做"趋势条"装饰 */
export function Sparkline({ data, color = '#2563eb', width = 80, height = 26, fill = true, showDots = false }: Props) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2] as const);
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {fill && <path d={area} fill={color} opacity={0.12} />}
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {showDots && (
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r={2}
          fill={color}
        />
      )}
    </svg>
  );
}
