import { client } from './index';
import { getLevelFromXp } from '../engines/levels';
import { computeXp } from '../engines/xp';
import { strengthWorkload } from '../engines/workload';

const DEMO_USER_ID = 'demo-user-alex';

async function one(sql: string, args: (string | number | null)[] = []) {
  const r = await client.execute({ sql, args });
  return (r.rows[0] ?? null) as Record<string, unknown> | null;
}

async function all(sql: string, args: (string | number | null)[] = []) {
  const r = await client.execute({ sql, args });
  return r.rows as Record<string, unknown>[];
}

async function run(sql: string, args: (string | number | null)[] = []) {
  return client.execute({ sql, args });
}

export async function getCharacterSheet(userId = DEMO_USER_ID) {
  const user = await one('SELECT * FROM app_user WHERE id = ?', [userId]);
  if (!user) return null;

  const xpRow = await one('SELECT COALESCE(SUM(amount),0) as total FROM xp_ledger WHERE user_id = ?', [userId]);
  const totalXp = Number(xpRow?.total ?? 0);
  const levelData = getLevelFromXp(totalXp);

  const activeSeason = await one("SELECT * FROM season WHERE state = 'active' ORDER BY ordinal DESC LIMIT 1");
  const seasonXpRow = activeSeason
    ? await one('SELECT COALESCE(SUM(amount),0) as total FROM xp_ledger WHERE user_id = ? AND season_id = ?', [userId, activeSeason.id as string])
    : null;

  const attrs = await all('SELECT * FROM attribute_state WHERE user_id = ?', [userId]);
  const attrMap: Record<string, number> = {};
  attrs.forEach(a => { attrMap[a.attribute as string] = Number(a.value); });

  const streak = await one('SELECT * FROM streak_state WHERE user_id = ?', [userId]);
  const weekStart = getThisWeekMonday();
  const todayQuest = await one(`
    SELECT qa.*, qd.name, qd.xp_reward
    FROM quest_assignment qa
    JOIN quest_definition qd ON qa.definition_id = qd.id
    WHERE qa.user_id = ? AND qa.state = 'active' AND qa.week_start = ?
    LIMIT 1
  `, [userId, weekStart]);

  const seasonWeek = activeSeason ? getCurrentSeasonWeek(activeSeason.starts_at as string) : 1;

  return {
    user: { id: String(user.id), displayName: String(user.display_name), handle: String(user.handle) },
    level: levelData,
    totalXp,
    seasonXp: Number(seasonXpRow?.total ?? 0),
    attributes: {
      str: attrMap['str'] ?? 0,
      end: attrMap['end'] ?? 0,
      mob: attrMap['mob'] ?? 0,
      con: attrMap['con'] ?? 0,
    },
    streak: {
      length: Number(streak?.current_length ?? 0),
      longestLength: Number(streak?.longest_length ?? 0),
      restTokens: Number(streak?.rest_tokens ?? 0),
      lastActiveDate: streak?.last_active_date != null ? String(streak.last_active_date) : null,
    },
    todayQuest: todayQuest ? {
      id: String(todayQuest.id),
      name: String(todayQuest.name),
      current: Number(todayQuest.current_value),
      target: Number(todayQuest.target_value),
      xpReward: Number(todayQuest.xp_reward),
      completed: todayQuest.state === 'complete',
    } : null,
    season: {
      id: activeSeason?.id != null ? String(activeSeason.id) : null,
      ordinal: Number(activeSeason?.ordinal ?? 3),
      week: seasonWeek,
    },
  };
}

export async function getQuests(userId = DEMO_USER_ID) {
  const weekStart = getThisWeekMonday();

  const weekly = await all(`
    SELECT qa.*, qd.name, qd.description, qd.xp_reward, qd.kind
    FROM quest_assignment qa
    JOIN quest_definition qd ON qa.definition_id = qd.id
    WHERE qa.user_id = ? AND qd.kind = 'weekly' AND qa.week_start = ?
    ORDER BY qa.created_at
  `, [userId, weekStart]);

  const seasonal = await all(`
    SELECT qa.*, qd.name, qd.description, qd.xp_reward, qd.kind
    FROM quest_assignment qa
    JOIN quest_definition qd ON qa.definition_id = qd.id
    WHERE qa.user_id = ? AND qd.kind = 'season_goal'
    ORDER BY qa.created_at
  `, [userId]);

  const mapQuest = (q: Record<string, unknown>) => ({
    id: String(q.id), name: String(q.name), description: q.description != null ? String(q.description) : '',
    current_value: Number(q.current_value), target_value: Number(q.target_value),
    state: String(q.state), xp_reward: Number(q.xp_reward), kind: String(q.kind),
  });
  return { weekly: weekly.map(mapQuest), seasonal: seasonal.map(mapQuest), weekStart };
}

export async function getHistory(userId = DEMO_USER_ID) {
  const rollup = await all(`
    SELECT local_date, session_count, xp, volume_kg
    FROM session_daily_rollup WHERE user_id = ?
    ORDER BY local_date DESC LIMIT 84
  `, [userId]);

  const stats = await one(`
    SELECT COUNT(*) as total_sessions, COALESCE(SUM(volume_kg),0) as total_volume
    FROM session_daily_rollup WHERE user_id = ?
  `, [userId]);

  const prCount = await one('SELECT COUNT(*) as cnt FROM personal_record WHERE user_id = ?', [userId]);

  const prs = await all(`
    SELECT pr.*, e.name as exercise_name, e.modality,
           pr.value as value, pr.previous_value, pr.local_date, pr.metric
    FROM personal_record pr
    JOIN exercise e ON pr.exercise_id = e.id
    WHERE pr.user_id = ?
    ORDER BY pr.local_date DESC LIMIT 10
  `, [userId]);

  return {
    heatmap: rollup.map(r => ({
      local_date: String(r.local_date), session_count: Number(r.session_count), xp: Number(r.xp),
    })),
    totalSessions: Number(stats?.total_sessions ?? 0),
    personalRecordCount: Number(prCount?.cnt ?? 0),
    personalRecords: prs.map(r => ({
      exercise_name: String(r.exercise_name), metric: String(r.metric),
      value: Number(r.value), previous_value: r.previous_value != null ? Number(r.previous_value) : null,
      local_date: String(r.local_date), modality: String(r.modality), verified: Boolean(r.verified),
    })),
  };
}

export async function getBadges(userId = DEMO_USER_ID) {
  const awarded = await all(`
    SELECT ba.*, bd.name, bd.slug, bd.tier, bd.description
    FROM badge_award ba
    JOIN badge_definition bd ON ba.badge_id = bd.id
    WHERE ba.user_id = ? ORDER BY ba.awarded_at DESC
  `, [userId]);

  const allBadges = await all('SELECT * FROM badge_definition ORDER BY tier DESC, name');

  return { awarded, allBadges };
}

export async function getCrewLeaderboard(userId = DEMO_USER_ID) {
  const crewRow = await one('SELECT crew_id FROM crew_member WHERE user_id = ?', [userId]);
  if (!crewRow) return null;
  const crewId = crewRow.crew_id as string;

  const crewInfo = await one('SELECT * FROM crew WHERE id = ?', [crewId]);
  const activeSeason = await one("SELECT id FROM season WHERE state = 'active' LIMIT 1");

  const members = await all(`
    SELECT u.id, u.display_name, u.handle,
           COALESCE(SUM(xl.amount), 0) as season_xp, cm.role
    FROM crew_member cm
    JOIN app_user u ON cm.user_id = u.id
    LEFT JOIN xp_ledger xl ON xl.user_id = u.id AND xl.season_id = ?
    WHERE cm.crew_id = ?
    GROUP BY u.id ORDER BY season_xp DESC
  `, [activeSeason?.id as string ?? '', crewId]);

  const myRank = members.findIndex(m => m.id === userId) + 1;
  const weekStart = getThisWeekMonday();

  const myNodCount = await one(`SELECT COUNT(*) as cnt FROM crew_nod WHERE from_user_id = ? AND week_start = ?`, [userId, weekStart]);
  const noddedRows = await all(`SELECT to_user_id FROM crew_nod WHERE from_user_id = ? AND week_start = ?`, [userId, weekStart]);
  const noddedIds = noddedRows.map(r => r.to_user_id as string);

  return {
    crewId,
    crewName: crewInfo?.name != null ? String(crewInfo.name) : '',
    inviteCode: crewInfo?.invite_code != null ? String(crewInfo.invite_code) : '',
    members: members.map((m, i) => ({
      id: String(m.id), display_name: String(m.display_name), handle: String(m.handle),
      season_xp: Number(m.season_xp), role: String(m.role),
      rank: i + 1, isMe: m.id === userId,
      hasNodFromMe: noddedIds.includes(String(m.id)),
    })),
    myRank,
    nodsUsedToday: Number(myNodCount?.cnt ?? 0),
  };
}

export async function finishSession(sessionId: string, userId = DEMO_USER_ID) {
  const now = new Date().toISOString();
  const today = getLocalDate();

  const session = await one('SELECT * FROM workout_session WHERE id = ? AND user_id = ?', [sessionId, userId]);
  if (!session || session.state !== 'open') return null;

  const sets = await all('SELECT * FROM session_set WHERE session_id = ?', [sessionId]);

  let workload = 0;
  let volumeKg = 0;
  if (session.modality === 'strength') {
    workload = strengthWorkload(sets.map(s => ({
      weightKg: Number(s.weight_kg), reps: Number(s.reps), isWarmup: Boolean(s.is_warmup),
    })));
    volumeKg = sets.reduce((sum, s) => sum + (Number(s.weight_kg) || 0) * (Number(s.reps) || 0), 0);
  }

  const baseline = await one('SELECT * FROM baseline_state WHERE user_id = ? AND modality = ?', [userId, session.modality as string]);
  const baselineWorkload = Number(baseline?.median_workload ?? 1000);

  const xpToday = await one(`SELECT COALESCE(SUM(amount),0) as total FROM xp_ledger WHERE user_id = ? AND local_date = ?`, [userId, today]);
  const sessionsToday = await one(`SELECT COUNT(*) as cnt FROM workout_session WHERE user_id = ? AND local_date = ? AND state = 'finished'`, [userId, today]);
  const streak = await one('SELECT * FROM streak_state WHERE user_id = ?', [userId]);
  const activeSeason = await one("SELECT * FROM season WHERE state = 'active' LIMIT 1");

  const xpResult = computeXp({
    modality: session.modality as string,
    workload: workload || baselineWorkload,
    baseline: baselineWorkload,
    durationS: Number(session.duration_s ?? 2700),
    streakLength: Number(streak?.current_length ?? 0),
    xpAlreadyToday: Number(xpToday?.total ?? 0),
    sessionsToday: Number(sessionsToday?.cnt ?? 0),
  });

  await client.batch([
    { sql: `UPDATE workout_session SET state = 'finished', finished_at = ?, ended_at = ?, duration_s = ? WHERE id = ?`, args: [now, now, Number(session.duration_s ?? 2700), sessionId] },
    { sql: `INSERT OR IGNORE INTO xp_ledger (user_id, season_id, amount, reason, source_id, local_date) VALUES (?, ?, ?, 'session', ?, ?)`, args: [userId, activeSeason?.id as string ?? null, xpResult.xp, sessionId, today] },
    { sql: `INSERT INTO session_daily_rollup (user_id, local_date, session_count, xp, volume_kg) VALUES (?, ?, 1, ?, ?) ON CONFLICT(user_id, local_date) DO UPDATE SET session_count=session_count+1, xp=xp+excluded.xp, volume_kg=volume_kg+excluded.volume_kg`, args: [userId, today, xpResult.xp, volumeKg] },
  ], 'write');

  const totalXpRow = await one('SELECT COALESCE(SUM(amount),0) as t FROM xp_ledger WHERE user_id = ?', [userId]);
  const levelData = getLevelFromXp(Number(totalXpRow?.t ?? 0));

  const attrs = await all('SELECT * FROM attribute_state WHERE user_id = ?', [userId]);
  const attrMap: Record<string, number> = {};
  attrs.forEach(a => { attrMap[a.attribute as string] = Number(a.value); });

  const weekStart = getThisWeekMonday();
  const activeQuests = await all(`
    SELECT qa.* FROM quest_assignment qa
    JOIN quest_definition qd ON qa.definition_id = qd.id
    WHERE qa.user_id = ? AND qa.state = 'active' AND qa.week_start = ?
  `, [userId, weekStart]);

  if (activeQuests.length > 0) {
    await client.batch(activeQuests.map(q => {
      const newVal = Math.min(Number(q.target_value), Number(q.current_value) + 1);
      const newState = newVal >= Number(q.target_value) ? 'complete' : 'active';
      return { sql: `UPDATE quest_assignment SET current_value = ?, state = ? WHERE id = ?`, args: [newVal, newState, q.id as string] };
    }), 'write');
  }

  const updatedQuests = await all(`
    SELECT qa.*, qd.name, qd.xp_reward FROM quest_assignment qa
    JOIN quest_definition qd ON qa.definition_id = qd.id
    WHERE qa.user_id = ? AND qa.week_start = ?
  `, [userId, weekStart]);

  return {
    session: { id: sessionId, title: session.title ?? 'Training Session', durationS: Number(session.duration_s ?? 2700), volumeKg, setCount: sets.length },
    xp: { earned: xpResult.xp, capped: xpResult.capped, level: levelData.level, levelXp: levelData.levelXp, levelXpRequired: levelData.levelXpRequired, xpToNext: levelData.xpToNext },
    baseline: { ratio: xpResult.ratio, percentVsBaseline: xpResult.percentVsBaseline, windowDays: 28, isForming: Number(baseline?.sample_count ?? 0) < 5, sampleCount: Number(baseline?.sample_count ?? 0) },
    attributes: [
      { key: 'str', before: attrMap['str'] ?? 0, after: (attrMap['str'] ?? 0) + (session.modality === 'strength' ? 2 : 0), delta: session.modality === 'strength' ? 2 : 0 },
      { key: 'end', before: attrMap['end'] ?? 0, after: (attrMap['end'] ?? 0) + (session.modality === 'endurance' ? 2 : 0), delta: session.modality === 'endurance' ? 2 : 0 },
      { key: 'mob', before: attrMap['mob'] ?? 0, after: (attrMap['mob'] ?? 0) + (session.modality === 'mobility' ? 1 : 0), delta: session.modality === 'mobility' ? 1 : 0 },
      { key: 'con', before: attrMap['con'] ?? 0, after: (attrMap['con'] ?? 0) + 1, delta: 1 },
    ],
    quests: updatedQuests.map(q => ({ id: q.id, name: q.name, current: Number(q.current_value), target: Number(q.target_value), completed: q.state === 'complete', xpReward: Number(q.xp_reward) })),
    streak: { length: Number(streak?.current_length ?? 0) + 1, restTokens: Number(streak?.rest_tokens ?? 0), tokenConsumedToday: false },
    sessionCard: { date: today, durationMin: Math.round(Number(session.duration_s ?? 2700) / 60), xp: xpResult.xp, volumeKg, sets: sets.length, vsBaselinePct: xpResult.percentVsBaseline },
  };
}

export async function createSession(userId = DEMO_USER_ID, modality: string, title?: string) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const localDate = getLocalDate();
  const user = await one('SELECT timezone FROM app_user WHERE id = ?', [userId]);
  await run(`INSERT INTO workout_session (id, user_id, modality, started_at, local_date, tz_at_write, title, state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)`,
    [id, userId, modality, now, localDate, user?.timezone as string ?? 'America/New_York', title ?? null, now]);
  return id;
}

export async function addSet(sessionId: string, exerciseId: string, weightKg: number | null, reps: number | null, isWarmup = false) {
  const id = crypto.randomUUID();
  const countRow = await one('SELECT COUNT(*) as cnt FROM session_set WHERE session_id = ?', [sessionId]);
  const setIndex = Number(countRow?.cnt ?? 0);
  await run(`INSERT INTO session_set (id, session_id, exercise_id, set_index, weight_kg, reps, is_warmup, logged_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, sessionId, exerciseId, setIndex, weightKg, reps, isWarmup ? 1 : 0, new Date().toISOString()]);
  return id;
}

export async function getExercises(modality?: string) {
  if (modality) return all('SELECT * FROM exercise WHERE modality = ? AND active = 1 ORDER BY name', [modality]);
  return all('SELECT * FROM exercise WHERE active = 1 ORDER BY modality, name');
}

export async function sendNod(fromUserId: string, toUserId: string) {
  const weekStart = getThisWeekMonday();
  const nodCount = await one(`SELECT COUNT(*) as cnt FROM crew_nod WHERE from_user_id = ? AND week_start = ?`, [fromUserId, weekStart]);
  if (Number(nodCount?.cnt ?? 0) >= 5) return { error: 'Rate limit: max 5 nods per week' };
  try {
    await run(`INSERT INTO crew_nod (from_user_id, to_user_id, week_start) VALUES (?, ?, ?)`, [fromUserId, toUserId, weekStart]);
    return { success: true };
  } catch {
    return { error: 'Already nodded this week' };
  }
}

function getLocalDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getThisWeekMonday(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() + diff);
  return mon.toISOString().slice(0, 10);
}

function getCurrentSeasonWeek(startsAt: string): number {
  const start = new Date(startsAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.min(12, Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000))));
}
