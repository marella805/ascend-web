'use client';
import { PhoneFrame, BottomNav } from '../ui/PhoneFrame';

interface HeatCell {
  local_date: string;
  session_count: number;
  xp: number;
}

interface PR {
  exercise_name: string;
  metric: string;
  value: number;
  previous_value: number | null;
  local_date: string;
  modality: string;
  verified: boolean;
}

interface HistoryProps {
  heatmap: HeatCell[];
  totalSessions: number;
  personalRecordCount: number;
  personalRecords: PR[];
}

const ATTR_COLORS: Record<string, string> = {
  strength: '#FF5A3C',
  endurance: '#3CC5FF',
  mobility: '#B57BFF',
};
const ATTR_LABELS: Record<string, string> = {
  strength: 'STR',
  endurance: 'END',
  mobility: 'MOB',
};

function heatColor(count: number): string {
  if (count === 0) return '#14181D';
  if (count === 1) return 'rgba(198,241,53,.28)';
  if (count === 2) return 'rgba(198,241,53,.52)';
  return '#C6F135';
}

function formatMetricValue(metric: string, value: number): string {
  if (metric === 'max_weight') return `${Math.round(value * 2.205)} lb`;
  if (metric === 'max_reps') return `${Math.round(value)} reps`;
  if (metric === 'best_time') {
    const s = Math.round(value);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
  if (metric === 'e1rm') return `${Math.round(value * 2.205)} lb e1RM`;
  return String(Math.round(value));
}

function formatDelta(metric: string, value: number, prev: number | null): string {
  if (!prev) return '';
  const diff = value - prev;
  if (metric === 'max_weight') return `+${Math.round(diff * 2.205)} lb over last PR`;
  if (metric === 'max_reps') return `+${Math.round(diff)} reps`;
  if (metric === 'best_time') {
    const s = Math.round(Math.abs(diff));
    return diff < 0 ? `−${s}s faster` : `+${s}s slower`;
  }
  return '';
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function History({ heatmap, totalSessions, personalRecordCount, personalRecords }: HistoryProps) {
  // Build 84-cell grid (12 weeks × 7 days)
  const dateMap = new Map(heatmap.map(h => [h.local_date, h.session_count]));
  const today = new Date('2026-07-25T00:00:00Z');
  const cells = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (83 - i));
    const ds = d.toISOString().slice(0, 10);
    return { date: ds, count: dateMap.get(ds) ?? 0 };
  });

  return (
    <PhoneFrame>
      <div style={{ padding: '6px 22px 96px', height: '100%', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
          <span className="font-oswald" style={{ letterSpacing: '.14em', fontSize: 20 }}>HISTORY</span>
          <span style={{ fontSize: 11, color: '#8A939C' }}>Last 12 weeks</span>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-end', gap: 20 }}>
          <div>
            <div className="font-oswald" style={{ fontWeight: 600, fontSize: 64, lineHeight: .82 }}>{totalSessions}</div>
            <div className="font-oswald" style={{ fontSize: 10, letterSpacing: '.18em', color: '#8A939C', marginTop: 2 }}>SESSIONS LOGGED</div>
          </div>
          <div style={{ paddingBottom: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <div className="font-oswald" style={{ fontSize: 20, color: '#C6F135' }}>{personalRecordCount}</div>
              <div style={{ fontSize: 10, color: '#8A939C' }}>personal records</div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div style={{ marginTop: 16, background: '#14181D', border: '1px solid #23282F', borderRadius: 16, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: '#8A939C' }}>CONSISTENCY</span>
            <span style={{ fontSize: 10, color: '#8A939C', display: 'flex', alignItems: 'center', gap: 4 }}>
              less
              <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2, background: '#14181D', border: '1px solid #23282F' }} />
              <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2, background: 'rgba(198,241,53,.42)' }} />
              <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2, background: '#C6F135' }} />
              more
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: 4 }}>
            {cells.map((cell, i) => (
              <div key={i} style={{ aspectRatio: '1', borderRadius: 3, background: heatColor(cell.count) }} title={`${cell.date}: ${cell.count} sessions`} />
            ))}
          </div>
        </div>

        {/* Personal records */}
        <div style={{ marginTop: 16 }}>
          <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: '#8A939C' }}>PERSONAL RECORDS</div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {personalRecords.map((pr, i) => {
              const color = ATTR_COLORS[pr.modality] ?? '#C6F135';
              const label = ATTR_LABELS[pr.modality] ?? 'ATT';
              const isLast = i === personalRecords.length - 1;
              return (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    {!isLast && <span style={{ flex: 1, width: 1, background: '#23282F', marginTop: 3 }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{pr.exercise_name} · {formatMetricValue(pr.metric, pr.value)}</div>
                    <div style={{ fontSize: 11, color: '#8A939C' }}>
                      {formatDate(pr.local_date)} · {formatDelta(pr.metric, pr.value, pr.previous_value)}
                    </div>
                  </div>
                  <span className="font-oswald" style={{ fontSize: 13, color }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav active="history" />
    </PhoneFrame>
  );
}
