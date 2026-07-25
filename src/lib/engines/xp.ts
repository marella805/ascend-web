// XP engine — implements PRD section 6.3 exactly

const BASE_XP: Record<string, number> = {
  strength: 300,
  endurance: 350,
  mobility: 150,
};

const DAILY_XP_CAP = 1200;
const SESSION_CAP = 3;
const EPSILON = 0.001;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function durationFactor(durationS: number): number {
  // Scale from 0.5 (10 min) to 1.5 (90+ min), plateau
  const minutes = durationS / 60;
  if (minutes < 10) return 0.4;
  if (minutes >= 90) return 1.5;
  return 0.5 + (minutes - 10) / 80;
}

interface ComputeXpArgs {
  modality: string;
  workload: number;
  baseline: number;
  durationS: number;
  questMultiplier?: number;
  streakLength?: number;
  xpAlreadyToday?: number;
  sessionsToday?: number;
}

export interface XpResult {
  xp: number;
  capped: boolean;
  ratio: number;
  performanceMultiplier: number;
  percentVsBaseline: number;
}

export function computeXp(args: ComputeXpArgs): XpResult {
  const {
    modality,
    workload,
    baseline,
    durationS,
    questMultiplier = 1.0,
    streakLength = 0,
    xpAlreadyToday = 0,
    sessionsToday = 0,
  } = args;

  if (sessionsToday >= SESSION_CAP) {
    return { xp: 0, capped: true, ratio: 1, performanceMultiplier: 1, percentVsBaseline: 0 };
  }

  const ratio = workload / Math.max(baseline, EPSILON);
  const performance = clamp(1 + 0.6 * Math.log2(Math.max(ratio, 0.25)), 0.40, 1.80);
  const streakMultiplier = Math.min(1 + 0.01 * streakLength, 1.15);
  const base = (BASE_XP[modality] ?? 300) * durationFactor(durationS);
  let xp = Math.round(base * performance * questMultiplier * streakMultiplier);

  const headroom = DAILY_XP_CAP - xpAlreadyToday;
  const capped = xp > headroom;
  xp = Math.min(xp, headroom);

  return {
    xp: Math.max(0, xp),
    capped,
    ratio,
    performanceMultiplier: performance,
    percentVsBaseline: Math.round((ratio - 1) * 100),
  };
}
