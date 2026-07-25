'use client';

interface ProgressRingProps {
  value: number; // 0-100
  color?: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({ value, color = '#C6F135', size = 44, strokeWidth = 4, label, sublabel }: ProgressRingProps) {
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(1, value / 100));
  const cx = size / 2, cy = size / 2;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#23282F" strokeWidth={strokeWidth} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        className="anim-ring"
      />
      {label && (
        <text x={cx} y={cy + (sublabel ? -4 : 5)} fill="#F2F5F7" fontFamily="Oswald" fontWeight="600" fontSize={size * 0.28} textAnchor="middle">{label}</text>
      )}
      {sublabel && (
        <text x={cx} y={cy + 10} fill="#8A939C" fontFamily="Oswald" fontSize={size * 0.09} letterSpacing="1.5" textAnchor="middle">{sublabel}</text>
      )}
    </svg>
  );
}
