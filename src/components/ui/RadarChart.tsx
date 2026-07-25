'use client';

interface RadarChartProps {
  str: number;
  end: number;
  mob: number;
  con: number;
  size?: number;
  light?: boolean;
}

export function RadarChart({ str, end, mob, con, size = 220, light }: RadarChartProps) {
  const cx = size / 2, cy = size / 2, r = size * 0.45;
  // top=str, right=end, bottom=mob, left=con
  const norm = (v: number) => Math.min(100, Math.max(0, v)) / 100;
  const points = [
    [cx, cy - r * norm(str)],       // top (STR)
    [cx + r * norm(end), cy],        // right (END)
    [cx, cy + r * norm(mob)],        // bottom (MOB)
    [cx - r * norm(con), cy],        // left (CON)
  ];
  const polyPts = points.map(([x, y]) => `${x},${y}`).join(' ');

  const gridColor = light ? '#DDE2E4' : '#20252B';
  const innerGrid = light ? '#E7EBEC' : '#191E24';
  const fillColor = light ? 'rgba(122,168,0,.15)' : 'rgba(198,241,53,.13)';
  const strokeColor = light ? '#5B7A00' : '#C6F135';
  const labelStr = light ? '#D8452B' : '#FF5A3C';
  const labelEnd = light ? '#1E86C7' : '#3CC5FF';
  const labelMob = light ? '#7C43D6' : '#B57BFF';
  const labelCon = light ? '#B8860B' : '#FFC53C';
  const dotStr = labelStr, dotEnd = labelEnd, dotMob = labelMob, dotCon = labelCon;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: size * 0.84, display: 'block' }}>
      {/* Grid */}
      {[1, 0.75, 0.5, 0.25].map((f, i) => (
        <polygon key={i}
          points={`${cx},${cy-r*f} ${cx+r*f},${cy} ${cx},${cy+r*f} ${cx-r*f},${cy}`}
          fill="none" stroke={i === 0 ? gridColor : innerGrid}
        />
      ))}
      <line x1={cx} y1={cy-r} x2={cx} y2={cy+r} stroke={innerGrid} />
      <line x1={cx-r} y1={cy} x2={cx+r} y2={cy} stroke={innerGrid} />
      {/* Data */}
      <polygon points={polyPts} fill={fillColor} stroke={strokeColor} strokeWidth="2" className="anim-pop" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      {/* Dots */}
      <circle cx={points[0][0]} cy={points[0][1]} r="4.5" fill={dotStr} />
      <circle cx={points[1][0]} cy={points[1][1]} r="4.5" fill={dotEnd} />
      <circle cx={points[2][0]} cy={points[2][1]} r="4.5" fill={dotMob} />
      <circle cx={points[3][0]} cy={points[3][1]} r="4.5" fill={dotCon} />
      {/* Labels */}
      <text x={cx} y={12} fill={labelStr} fontFamily="Oswald" fontSize="11" letterSpacing="1.5" textAnchor="middle">STR</text>
      <text x={size - 2} y={cy + 4} fill={labelEnd} fontFamily="Oswald" fontSize="11" letterSpacing="1" textAnchor="middle">END</text>
      <text x={cx} y={size - 1} fill={labelMob} fontFamily="Oswald" fontSize="11" letterSpacing="1" textAnchor="middle">MOB</text>
      <text x={2} y={cy + 4} fill={labelCon} fontFamily="Oswald" fontSize="11" letterSpacing="1" textAnchor="middle">CON</text>
    </svg>
  );
}
