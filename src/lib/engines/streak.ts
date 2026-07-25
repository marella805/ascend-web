// Streak engine — PRD section 6.5
// Derive from session log; never increment

export interface StreakResult {
  length: number;
  longestLength: number;
  restTokens: number;
  tokensConsumedToday: number;
  lastActiveDate: string | null;
}

export function evaluateStreak(
  activeDates: Set<string>, // local_date strings where finished session >= 10 min exists
  throughDate: string,
  currentRestTokens: number,
  tokensEarnedAtLen: number,
  currentLongest: number
): StreakResult {
  // Walk backward from throughDate, consuming rest tokens for gaps
  const parseDate = (s: string) => new Date(s + 'T00:00:00Z');
  const formatDate = (d: Date) => d.toISOString().slice(0, 10);
  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setUTCDate(r.getUTCDate() + n);
    return r;
  };

  let date = parseDate(throughDate);
  let streakLen = 0;
  let tokens = currentRestTokens;
  let tokensConsumed = 0;
  let lastActiveDate: string | null = null;

  // Walk up to 400 days back
  for (let i = 0; i < 400; i++) {
    const ds = formatDate(date);
    if (activeDates.has(ds)) {
      streakLen++;
      if (!lastActiveDate) lastActiveDate = ds;
    } else if (tokens > 0) {
      tokens--;
      tokensConsumed++;
      // streak continues but day wasn't active
    } else {
      break;
    }
    date = addDays(date, -1);
  }

  // Accrue tokens: 1 per 7 consecutive active days
  const accrualPoints = Math.floor(streakLen / 7);
  const alreadyEarned = Math.floor(tokensEarnedAtLen / 7);
  const newTokens = Math.max(0, accrualPoints - alreadyEarned);
  const finalTokens = Math.min(3, tokens + newTokens);

  const longest = Math.max(currentLongest, streakLen);

  return {
    length: streakLen,
    longestLength: longest,
    restTokens: finalTokens,
    tokensConsumedToday: tokensConsumed,
    lastActiveDate,
  };
}
