// Baseline engine — PRD section 6.2
// Trailing 28-day rolling median with empirical Bayes shrinkage

const COHORT_PRIORS: Record<string, number> = {
  strength: 2000,    // ~2000 kg total volume typical session
  endurance: 3500,   // ~3.5km pace-adjusted
  mobility: 25,      // ~25 minutes
};

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeBaseline(
  observedWorkloads: number[],
  modality: string,
  userSegment?: string
): { baseline: number; isForming: boolean; sampleCount: number } {
  const n = observedWorkloads.length;
  const isForming = n < 5;
  const prior = COHORT_PRIORS[modality] ?? 1000;
  const w = n / (n + 5);
  const obs = median(observedWorkloads);
  const baseline = w * obs + (1 - w) * prior;

  return { baseline, isForming, sampleCount: n };
}
