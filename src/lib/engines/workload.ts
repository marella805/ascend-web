// Workload computation — PRD section 6.2

const REFERENCE_PACE = 300; // 5 min/km in seconds per km

interface Set {
  weightKg?: number | null;
  reps?: number | null;
  durationS?: number | null;
  distanceM?: number | null;
  isWarmup?: boolean;
}

export function strengthWorkload(sets: Set[]): number {
  const top = Math.max(0, ...sets.map(s => s.weightKg ?? 0));
  return sets
    .filter(s => !s.isWarmup && (s.weightKg ?? 0) >= 0.6 * top)
    .reduce((acc, s) => acc + (s.weightKg ?? 0) * (s.reps ?? 0), 0);
}

export function enduranceWorkload(distanceM: number, durationS: number): number {
  if (distanceM <= 0 || durationS <= 0) return 0;
  const paceSPerM = durationS / distanceM;
  const paceSPerKm = paceSPerM * 1000;
  const paceFactor = Math.pow(REFERENCE_PACE / paceSPerKm, 1.5);
  return distanceM * paceFactor;
}

export function mobilityWorkload(durationS: number): number {
  return durationS / 60;
}

export function computeE1RM(weightKg: number, reps: number): number {
  // Epley formula, valid for reps <= 12
  if (reps > 12 || reps <= 0 || weightKg <= 0) return weightKg;
  return weightKg * (1 + reps / 30);
}
