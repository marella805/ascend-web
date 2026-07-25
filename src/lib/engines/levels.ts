// Precomputed level table: level N requires cumulative XP of 300 * N^1.4, rounded to nearest 10
const LEVEL_TABLE: number[] = [0]; // index = level, value = cumulative XP required

for (let n = 1; n <= 200; n++) {
  LEVEL_TABLE.push(Math.round(300 * Math.pow(n, 1.4) / 10) * 10);
}

export function getLevelFromXp(cumulativeXp: number): { level: number; levelXp: number; levelXpRequired: number; xpToNext: number } {
  let level = 1;
  for (let n = 1; n < LEVEL_TABLE.length; n++) {
    if (cumulativeXp >= LEVEL_TABLE[n]) {
      level = n;
    } else {
      break;
    }
  }

  const levelStart = LEVEL_TABLE[level];
  const levelEnd = LEVEL_TABLE[level + 1] ?? LEVEL_TABLE[level] + 10000;
  const levelXp = cumulativeXp - levelStart;
  const levelXpRequired = levelEnd - levelStart;
  const xpToNext = levelEnd - cumulativeXp;

  return { level, levelXp, levelXpRequired, xpToNext };
}

export function getXpForLevel(level: number): number {
  return LEVEL_TABLE[Math.min(level, 200)] ?? 0;
}
