// Attribute engine — PRD section 6.1

export interface AttributeInput {
  // STR
  e1rmHistory?: { value: number; date: string }[];
  bodyweightKg?: number | null;
  // END
  bestPaceAdjustedEffort?: number | null;
  // MOB
  mobilitySessionsLast4Weeks?: { durationMin: number }[];
  // CON
  actualSessions8Wk?: number;
  weeklyTarget?: number;
}

export interface AttributeState {
  str: number;
  end: number;
  mob: number;
  con: number;
}

function percentileMap(value: number, min: number, max: number): number {
  if (max <= min) return 50;
  return Math.round(Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)));
}

export function computeStr(e1rmHistory: { value: number }[], bodyweightKg?: number | null): number {
  if (e1rmHistory.length === 0) return 0;
  const best = Math.max(...e1rmHistory.map(r => r.value));
  // Normalize to bodyweight if available
  const ratio = bodyweightKg && bodyweightKg > 0 ? best / bodyweightKg : best / 80;
  // Map to 0-100: 0.5x BW = 0, 3x BW = 100
  return percentileMap(ratio, 0.5, 3.0);
}

export function computeEnd(bestPaceAdjustedEffort: number): number {
  // percentile map against reference distribution (5km pace-adjusted meters)
  // ~1000m = 0, ~10000m = 100
  return percentileMap(bestPaceAdjustedEffort, 1000, 10000);
}

export function computeMob(sessions: { durationMin: number }[]): number {
  // PRD: min(100, sessions_4wk * avg_duration_min / 8)
  if (sessions.length === 0) return 0;
  const avgDuration = sessions.reduce((s, x) => s + x.durationMin, 0) / sessions.length;
  return Math.min(100, Math.round(sessions.length * avgDuration / 8));
}

export function computeCon(actualSessions8Wk: number, weeklyTarget: number): number {
  // PRD: round(100 * min(1, actual / (weekly_target * 8)))
  const target = weeklyTarget * 8;
  return Math.round(100 * Math.min(1, actualSessions8Wk / Math.max(1, target)));
}

export function applyDecay(
  currentValue: number,
  peakValue: number,
  daysSinceLastSession: number
): number {
  if (daysSinceLastSession <= 14) return currentValue;
  const weeks = Math.floor((daysSinceLastSession - 14) / 7);
  const floor = Math.round(0.6 * peakValue);
  return Math.max(floor, currentValue - weeks);
}
