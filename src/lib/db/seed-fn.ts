import { client } from './index';

const EXERCISES = [
  { slug: 'back-squat', name: 'Back Squat', modality: 'strength', movementPattern: 'squat', isCompound: 1 },
  { slug: 'front-squat', name: 'Front Squat', modality: 'strength', movementPattern: 'squat', isCompound: 1 },
  { slug: 'goblet-squat', name: 'Goblet Squat', modality: 'strength', movementPattern: 'squat', isCompound: 1 },
  { slug: 'deadlift', name: 'Deadlift', modality: 'strength', movementPattern: 'hinge', isCompound: 1 },
  { slug: 'romanian-deadlift', name: 'Romanian Deadlift', modality: 'strength', movementPattern: 'hinge', isCompound: 1 },
  { slug: 'bench-press', name: 'Bench Press', modality: 'strength', movementPattern: 'horizontal_push', isCompound: 1 },
  { slug: 'push-up', name: 'Push Up', modality: 'strength', movementPattern: 'horizontal_push', isCompound: 1 },
  { slug: 'overhead-press', name: 'Overhead Press', modality: 'strength', movementPattern: 'vertical_push', isCompound: 1 },
  { slug: 'pull-up', name: 'Pull Up', modality: 'strength', movementPattern: 'vertical_pull', isCompound: 1 },
  { slug: 'chin-up', name: 'Chin Up', modality: 'strength', movementPattern: 'vertical_pull', isCompound: 1 },
  { slug: 'lat-pulldown', name: 'Lat Pulldown', modality: 'strength', movementPattern: 'vertical_pull', isCompound: 1 },
  { slug: 'barbell-row', name: 'Barbell Row', modality: 'strength', movementPattern: 'horizontal_pull', isCompound: 1 },
  { slug: 'dumbbell-row', name: 'Dumbbell Row', modality: 'strength', movementPattern: 'horizontal_pull', isCompound: 0 },
  { slug: 'dumbbell-curl', name: 'Dumbbell Curl', modality: 'strength', movementPattern: 'isolation', isCompound: 0 },
  { slug: 'tricep-extension', name: 'Tricep Extension', modality: 'strength', movementPattern: 'isolation', isCompound: 0 },
  { slug: 'leg-press', name: 'Leg Press', modality: 'strength', movementPattern: 'squat', isCompound: 1 },
  { slug: 'leg-curl', name: 'Leg Curl', modality: 'strength', movementPattern: 'isolation', isCompound: 0 },
  { slug: 'run', name: 'Run', modality: 'endurance', movementPattern: null, isCompound: 0 },
  { slug: 'bike', name: 'Bike', modality: 'endurance', movementPattern: null, isCompound: 0 },
  { slug: 'row-erg', name: 'Row (Erg)', modality: 'endurance', movementPattern: null, isCompound: 0 },
  { slug: 'swim', name: 'Swim', modality: 'endurance', movementPattern: null, isCompound: 0 },
  { slug: 'jump-rope', name: 'Jump Rope', modality: 'endurance', movementPattern: null, isCompound: 0 },
  { slug: 'yoga', name: 'Yoga', modality: 'mobility', movementPattern: null, isCompound: 0 },
  { slug: 'stretching', name: 'Stretching', modality: 'mobility', movementPattern: null, isCompound: 0 },
  { slug: 'foam-rolling', name: 'Foam Rolling', modality: 'mobility', movementPattern: null, isCompound: 0 },
];

const QUEST_DEFS = [
  { id: 'q-vertical-pull', kind: 'weekly', templateKey: 'vertical_pull_volume', targetType: 'pattern_sessions', params: '{"pattern":"vertical_pull","count":3}', xpReward: 120, name: 'Vertical Pull Volume', description: '3 sessions with vertical pull movements' },
  { id: 'q-mobility', kind: 'weekly', templateKey: 'mobility_frequency', targetType: 'modality_count', params: '{"modality":"mobility","count":4}', xpReward: 90, name: 'Mobility 4× this week', description: '4 mobility sessions this week' },
  { id: 'q-mile', kind: 'weekly', templateKey: 'sub_9min_mile', targetType: 'endurance_pace', params: '{"distance_m":1609,"max_pace_s":540}', xpReward: 200, name: 'Sub-9:00 mile run', description: 'Run a mile in under 9 minutes' },
  { id: 'q-season-end', kind: 'season_goal', templateKey: 'reach_endurance_45', targetType: 'attribute_threshold', params: '{"attribute":"end","threshold":45}', xpReward: 2000, name: 'Reach Endurance 45', description: 'Build your Endurance attribute to 45' },
];

const BADGE_DEFS = [
  { id: 'b-first', slug: 'first-session', name: 'First Blood', criteria: '{"type":"milestone","sessions":1}', tier: 1, description: 'Log your first training session' },
  { id: 'b-bwsq', slug: 'bodyweight-squat-x5', name: 'Bodyweight Squat ×5', criteria: '{"type":"strength","exercise":"back-squat","condition":"bodyweight_x5"}', tier: 2, description: 'Squat 5× your bodyweight total in one session' },
  { id: 'b-sub20', slug: 'sub-20-5k', name: 'Sub-20:00 5K', criteria: '{"type":"endurance","distance_m":5000,"max_duration_s":1200}', tier: 3, description: 'Run 5km in under 20 minutes' },
  { id: 'b-7day', slug: '7-day-streak', name: 'Iron Week', criteria: '{"type":"streak","length":7}', tier: 1, description: 'Train 7 days in a row' },
  { id: 'b-30day', slug: '30-day-streak', name: 'Unbroken', criteria: '{"type":"streak","length":30}', tier: 3, description: 'Train 30 days in a row' },
  { id: 'b-lvl10', slug: 'level-10', name: 'Level 10', criteria: '{"type":"level","level":10}', tier: 2, description: 'Reach level 10' },
  { id: 'b-dl2x', slug: 'deadlift-2x-bw', name: '2× Bodyweight Deadlift', criteria: '{"type":"strength","exercise":"deadlift","condition":"bodyweight_x2"}', tier: 2, description: 'Deadlift twice your bodyweight' },
  { id: 'b-pullup', slug: 'first-pull-up', name: 'Pull Up Club', criteria: '{"type":"strength","exercise":"pull-up","min_reps":1}', tier: 1, description: 'Log a pull-up' },
];

function daysAgo(n: number): string {
  const d = new Date('2026-07-25T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function getThisWeekMonday(): string {
  const d = new Date('2026-07-25T00:00:00Z');
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export async function seedDb() {
  const existing = (await client.execute({ sql: 'SELECT id FROM app_user WHERE id = ?', args: ['demo-user-alex'] })).rows[0];
  if (existing) return;

  // Phase 1: exercises, definitions, season, users
  await client.batch([
    ...EXERCISES.map(e => ({
      sql: `INSERT OR IGNORE INTO exercise (id, slug, name, modality, movement_pattern, is_compound, default_unit, active) VALUES (?, ?, ?, ?, ?, ?, 'lb', 1)`,
      args: [crypto.randomUUID(), e.slug, e.name, e.modality, e.movementPattern, e.isCompound],
    })),
    ...QUEST_DEFS.map(q => ({
      sql: `INSERT OR IGNORE INTO quest_definition (id, kind, template_key, target_type, params, xp_reward, name, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [q.id, q.kind, q.templateKey, q.targetType, q.params, q.xpReward, q.name, q.description],
    })),
    ...BADGE_DEFS.map(b => ({
      sql: `INSERT OR IGNORE INTO badge_definition (id, slug, name, criteria, tier, description) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [b.id, b.slug, b.name, b.criteria, b.tier, b.description],
    })),
    { sql: `INSERT OR IGNORE INTO season (id, ordinal, starts_at, ends_at, state) VALUES ('season-3', 3, '2026-05-05T00:00:00Z', '2026-07-28T00:00:00Z', 'active')`, args: [] },
    { sql: `INSERT OR IGNORE INTO app_user (id, handle, display_name, timezone, units, weekly_target, age_verified, status, bodyweight_kg) VALUES ('demo-user-alex', 'alex_r', 'Alex Rivera', 'America/New_York', 'imperial', 4, 1, 'active', 83.9)`, args: [] },
    { sql: `INSERT OR IGNORE INTO app_user (id, handle, display_name, timezone, units, weekly_target, age_verified, status) VALUES ('u-sam', 'sam_d', 'Sam D.', 'America/New_York', 'imperial', 4, 1, 'active')`, args: [] },
    { sql: `INSERT OR IGNORE INTO app_user (id, handle, display_name, timezone, units, weekly_target, age_verified, status) VALUES ('u-jordan', 'jordan_k', 'Jordan K.', 'America/New_York', 'imperial', 4, 1, 'active')`, args: [] },
    { sql: `INSERT OR IGNORE INTO app_user (id, handle, display_name, timezone, units, weekly_target, age_verified, status) VALUES ('u-priya', 'priya_s', 'Priya S.', 'America/New_York', 'imperial', 4, 1, 'active')`, args: [] },
    { sql: `INSERT OR IGNORE INTO app_user (id, handle, display_name, timezone, units, weekly_target, age_verified, status) VALUES ('u-maya', 'maya_t', 'Maya T.', 'America/New_York', 'imperial', 4, 1, 'active')`, args: [] },
    { sql: `INSERT OR IGNORE INTO app_user (id, handle, display_name, timezone, units, weekly_target, age_verified, status) VALUES ('u-chris', 'chris_b', 'Chris B.', 'America/New_York', 'imperial', 4, 1, 'active')`, args: [] },
    { sql: `INSERT OR IGNORE INTO crew (id, name, owner_id, invite_code, max_members) VALUES ('crew-iron6', 'Iron Six', 'demo-user-alex', 'IRON6X', 8)`, args: [] },
    { sql: `INSERT OR IGNORE INTO crew_member (crew_id, user_id, role) VALUES ('crew-iron6', 'demo-user-alex', 'owner')`, args: [] },
    { sql: `INSERT OR IGNORE INTO crew_member (crew_id, user_id, role) VALUES ('crew-iron6', 'u-sam', 'member')`, args: [] },
    { sql: `INSERT OR IGNORE INTO crew_member (crew_id, user_id, role) VALUES ('crew-iron6', 'u-jordan', 'member')`, args: [] },
    { sql: `INSERT OR IGNORE INTO crew_member (crew_id, user_id, role) VALUES ('crew-iron6', 'u-priya', 'member')`, args: [] },
    { sql: `INSERT OR IGNORE INTO crew_member (crew_id, user_id, role) VALUES ('crew-iron6', 'u-maya', 'member')`, args: [] },
    { sql: `INSERT OR IGNORE INTO crew_member (crew_id, user_id, role) VALUES ('crew-iron6', 'u-chris', 'member')`, args: [] },
  ], 'write');

  // Phase 2: fetch exercise IDs for history
  const [bsRow, dlRow, puRow] = await Promise.all([
    client.execute({ sql: "SELECT id FROM exercise WHERE slug = 'back-squat'", args: [] }),
    client.execute({ sql: "SELECT id FROM exercise WHERE slug = 'deadlift'", args: [] }),
    client.execute({ sql: "SELECT id FROM exercise WHERE slug = 'pull-up'", args: [] }),
  ]);
  const backSquatId = bsRow.rows[0]?.id as string | undefined;
  const deadliftId = dlRow.rows[0]?.id as string | undefined;
  const pullUpId = puRow.rows[0]?.id as string | undefined;

  // Phase 3: historical sessions + sets + XP + rollup
  const sessionDays = [0,2,4,6,8,10,12,15,17,19,21,24,26,28,30,33,35,37,39,42,44,46,48,51,53,55,57,60,62,64,66,69,71,73,75,78,80,82,84,85];
  const modalityRot = ['strength','strength','endurance','mobility'];
  const titleRot = ['Back & Legs','Upper Body','5K Run','Yoga & Stretch'];

  const historyStatements: { sql: string; args: (string | number | null)[] }[] = [];
  sessionDays.forEach((d, i) => {
    const sid = crypto.randomUUID();
    const mod = modalityRot[i % 4];
    const date = daysAgo(d);
    const dur = 2700 + (i * 60 % 1800);
    historyStatements.push({
      sql: `INSERT OR IGNORE INTO workout_session (id, user_id, modality, started_at, ended_at, duration_s, local_date, tz_at_write, title, state, finished_at, created_at) VALUES (?, 'demo-user-alex', ?, ?, ?, ?, ?, 'America/New_York', ?, 'finished', ?, ?)`,
      args: [sid, mod, `${date}T09:00:00Z`, `${date}T10:00:00Z`, dur, date, titleRot[i%4], `${date}T10:00:00Z`, `${date}T09:00:00Z`],
    });
    if (mod === 'strength' && backSquatId && deadliftId) {
      const weight = 75 + i * 0.5;
      for (let s = 0; s < 3; s++) {
        historyStatements.push({ sql: `INSERT OR IGNORE INTO session_set (id, session_id, exercise_id, set_index, weight_kg, reps, is_warmup, logged_at) VALUES (?, ?, ?, ?, ?, 5, 0, ?)`, args: [crypto.randomUUID(), sid, backSquatId, s, weight, `${date}T09:10:00Z`] });
      }
      historyStatements.push({ sql: `INSERT OR IGNORE INTO session_set (id, session_id, exercise_id, set_index, weight_kg, reps, is_warmup, logged_at) VALUES (?, ?, ?, 3, ?, 3, 0, ?)`, args: [crypto.randomUUID(), sid, deadliftId, 110 + i * 0.5, `${date}T09:30:00Z`] });
      if (pullUpId) {
        historyStatements.push({ sql: `INSERT OR IGNORE INTO session_set (id, session_id, exercise_id, set_index, weight_kg, reps, is_warmup, logged_at) VALUES (?, ?, ?, 4, 0, ?, 0, ?)`, args: [crypto.randomUUID(), sid, pullUpId, 8 + (i % 5), `${date}T09:45:00Z`] });
      }
    }
    const xp = 150 + 100 + i * 2;
    historyStatements.push({ sql: `INSERT OR IGNORE INTO xp_ledger (user_id, season_id, amount, reason, source_id, local_date) VALUES ('demo-user-alex', 'season-3', ?, 'session', ?, ?)`, args: [xp, sid, date] });
    const vol = mod === 'strength' ? 83.9 * 5 * 3 + 110 * 3 : 0;
    historyStatements.push({ sql: `INSERT INTO session_daily_rollup (user_id, local_date, session_count, xp, volume_kg) VALUES ('demo-user-alex', ?, 1, ?, ?) ON CONFLICT(user_id, local_date) DO UPDATE SET session_count=session_count+1, xp=xp+excluded.xp, volume_kg=volume_kg+excluded.volume_kg`, args: [date, xp, vol] });
  });

  // Crew XP
  const crewXps: [string, number][] = [['u-sam',11200],['u-jordan',9800],['u-priya',7100],['u-maya',4300],['u-chris',3900]];
  crewXps.forEach(([uid, xp]) => {
    historyStatements.push({ sql: `INSERT OR IGNORE INTO xp_ledger (user_id, season_id, amount, reason, source_id, local_date) VALUES (?, 'season-3', ?, 'session', ?, '2026-07-01')`, args: [uid, xp, uid + '-seed'] });
  });

  await client.batch(historyStatements, 'write');

  // Phase 4: attributes, baseline, streak, PRs, quests, badges
  const weekStart = getThisWeekMonday();
  const attrs: [string, number, number][] = [['str',42,43],['end',38,40],['mob',27,29],['con',55,58]];
  const attrBase = [36, 32, 22, 45];
  const attrFinal = [42, 38, 27, 55];
  const attrHistStatements: { sql: string; args: (string | number)[] }[] = [];
  Array.from({length: 84}, (_, i) => daysAgo(83 - i)).forEach((date, i) => {
    attrs.forEach(([attr], ai) => {
      const val = Math.round(attrBase[ai] + (attrFinal[ai] - attrBase[ai]) * (i / 83));
      attrHistStatements.push({ sql: `INSERT OR IGNORE INTO attribute_history (user_id, attribute, local_date, value) VALUES ('demo-user-alex', ?, ?, ?)`, args: [attr, date, val] });
    });
  });

  await client.batch([
    ...attrs.map(([attr, val, peak]) => ({ sql: `INSERT OR IGNORE INTO attribute_state (user_id, attribute, value, peak_value, computed_at) VALUES ('demo-user-alex', ?, ?, ?, datetime('now'))`, args: [attr, val, peak] })),
    ...attrHistStatements,
    { sql: `INSERT OR IGNORE INTO baseline_state (user_id, modality, median_workload, sample_count, window_start, window_end, computed_at) VALUES ('demo-user-alex', 'strength', 5300, 22, ?, ?, datetime('now'))`, args: [daysAgo(28), daysAgo(0)] },
    { sql: `INSERT OR IGNORE INTO baseline_state (user_id, modality, median_workload, sample_count, window_start, window_end, computed_at) VALUES ('demo-user-alex', 'endurance', 4200, 8, ?, ?, datetime('now'))`, args: [daysAgo(28), daysAgo(0)] },
    { sql: `INSERT OR IGNORE INTO baseline_state (user_id, modality, median_workload, sample_count, window_start, window_end, computed_at) VALUES ('demo-user-alex', 'mobility', 28, 10, ?, ?, datetime('now'))`, args: [daysAgo(28), daysAgo(0)] },
    { sql: `INSERT OR IGNORE INTO streak_state (user_id, current_length, longest_length, last_active_date, rest_tokens, tokens_earned_at_len, computed_through) VALUES ('demo-user-alex', 12, 21, ?, 2, 12, ?)`, args: [daysAgo(0), daysAgo(0)] },
    ...(backSquatId ? [{ sql: `INSERT OR IGNORE INTO personal_record (id, user_id, exercise_id, metric, value, previous_value, local_date, verified) VALUES (?, 'demo-user-alex', ?, 'max_weight', 83.9, 79.4, ?, 1)`, args: [crypto.randomUUID(), backSquatId, daysAgo(7)] }] : []),
    ...(deadliftId ? [{ sql: `INSERT OR IGNORE INTO personal_record (id, user_id, exercise_id, metric, value, previous_value, local_date, verified) VALUES (?, 'demo-user-alex', ?, 'max_weight', 124.7, 117.9, ?, 1)`, args: [crypto.randomUUID(), deadliftId, daysAgo(16)] }] : []),
    ...(pullUpId ? [{ sql: `INSERT OR IGNORE INTO personal_record (id, user_id, exercise_id, metric, value, previous_value, local_date, verified) VALUES (?, 'demo-user-alex', ?, 'max_reps', 12, 10, ?, 1)`, args: [crypto.randomUUID(), pullUpId, daysAgo(40)] }] : []),
    { sql: `INSERT OR IGNORE INTO quest_assignment (id, user_id, definition_id, season_id, week_start, target_value, current_value, state) VALUES (?, 'demo-user-alex', 'q-vertical-pull', 'season-3', ?, 3, 2, 'active')`, args: [crypto.randomUUID(), weekStart] },
    { sql: `INSERT OR IGNORE INTO quest_assignment (id, user_id, definition_id, season_id, week_start, target_value, current_value, state) VALUES (?, 'demo-user-alex', 'q-mobility', 'season-3', ?, 4, 3, 'active')`, args: [crypto.randomUUID(), weekStart] },
    { sql: `INSERT OR IGNORE INTO quest_assignment (id, user_id, definition_id, season_id, week_start, target_value, current_value, state) VALUES (?, 'demo-user-alex', 'q-mile', 'season-3', ?, 1, 0, 'active')`, args: [crypto.randomUUID(), weekStart] },
    { sql: `INSERT OR IGNORE INTO quest_assignment (id, user_id, definition_id, season_id, week_start, target_value, current_value, state) VALUES (?, 'demo-user-alex', 'q-season-end', 'season-3', null, 45, 38, 'active')`, args: [crypto.randomUUID()] },
    { sql: `INSERT OR IGNORE INTO badge_award (user_id, badge_id, session_id) VALUES ('demo-user-alex', 'b-first', null)`, args: [] },
    { sql: `INSERT OR IGNORE INTO badge_award (user_id, badge_id, session_id) VALUES ('demo-user-alex', 'b-bwsq', null)`, args: [] },
    { sql: `INSERT OR IGNORE INTO badge_award (user_id, badge_id, session_id) VALUES ('demo-user-alex', 'b-7day', null)`, args: [] },
    { sql: `INSERT OR IGNORE INTO badge_award (user_id, badge_id, session_id) VALUES ('demo-user-alex', 'b-pullup', null)`, args: [] },
  ], 'write');
}
