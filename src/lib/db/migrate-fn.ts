import { client } from './index';

const TABLES = [
`CREATE TABLE IF NOT EXISTS app_user (
  id TEXT PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  locale TEXT NOT NULL DEFAULT 'en-US',
  units TEXT NOT NULL DEFAULT 'imperial',
  weekly_target INTEGER DEFAULT 4,
  age_verified INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  bodyweight_kg REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  deleted_at TEXT
)`,
`CREATE TABLE IF NOT EXISTS exercise (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  modality TEXT NOT NULL,
  movement_pattern TEXT,
  is_compound INTEGER NOT NULL DEFAULT 0,
  default_unit TEXT NOT NULL DEFAULT 'lb',
  active INTEGER NOT NULL DEFAULT 1
)`,
`CREATE TABLE IF NOT EXISTS season (
  id TEXT PRIMARY KEY,
  ordinal INTEGER UNIQUE NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'upcoming'
)`,
`CREATE TABLE IF NOT EXISTS workout_session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_user(id),
  modality TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_s INTEGER,
  local_date TEXT NOT NULL,
  tz_at_write TEXT NOT NULL,
  title TEXT,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  state TEXT NOT NULL DEFAULT 'open',
  client_seq INTEGER,
  finished_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
)`,
`CREATE INDEX IF NOT EXISTS session_user_date ON workout_session(user_id, local_date)`,
`CREATE INDEX IF NOT EXISTS session_user_started ON workout_session(user_id, started_at)`,
`CREATE TABLE IF NOT EXISTS session_set (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES workout_session(id),
  exercise_id TEXT NOT NULL REFERENCES exercise(id),
  set_index INTEGER NOT NULL,
  weight_kg REAL,
  reps INTEGER,
  duration_s INTEGER,
  distance_m REAL,
  rpe REAL,
  is_warmup INTEGER NOT NULL DEFAULT 0,
  logged_at TEXT NOT NULL,
  UNIQUE(session_id, exercise_id, set_index)
)`,
`CREATE TABLE IF NOT EXISTS xp_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES app_user(id),
  season_id TEXT,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_id TEXT,
  local_date TEXT NOT NULL,
  meta TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, reason, source_id)
)`,
`CREATE INDEX IF NOT EXISTS xp_ledger_user_season ON xp_ledger(user_id, season_id)`,
`CREATE INDEX IF NOT EXISTS xp_ledger_user_date ON xp_ledger(user_id, local_date)`,
`CREATE TABLE IF NOT EXISTS attribute_state (
  user_id TEXT NOT NULL REFERENCES app_user(id),
  attribute TEXT NOT NULL,
  value INTEGER NOT NULL,
  peak_value INTEGER NOT NULL,
  computed_at TEXT NOT NULL,
  PRIMARY KEY(user_id, attribute)
)`,
`CREATE TABLE IF NOT EXISTS attribute_history (
  user_id TEXT NOT NULL,
  attribute TEXT NOT NULL,
  local_date TEXT NOT NULL,
  value INTEGER NOT NULL,
  PRIMARY KEY(user_id, attribute, local_date)
)`,
`CREATE TABLE IF NOT EXISTS baseline_state (
  user_id TEXT NOT NULL REFERENCES app_user(id),
  modality TEXT NOT NULL,
  median_workload REAL NOT NULL,
  sample_count INTEGER NOT NULL,
  window_start TEXT NOT NULL,
  window_end TEXT NOT NULL,
  computed_at TEXT NOT NULL,
  PRIMARY KEY(user_id, modality)
)`,
`CREATE TABLE IF NOT EXISTS personal_record (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_user(id),
  exercise_id TEXT NOT NULL REFERENCES exercise(id),
  metric TEXT NOT NULL,
  value REAL NOT NULL,
  previous_value REAL,
  session_id TEXT,
  local_date TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, exercise_id, metric, local_date)
)`,
`CREATE TABLE IF NOT EXISTS streak_state (
  user_id TEXT PRIMARY KEY REFERENCES app_user(id),
  current_length INTEGER NOT NULL DEFAULT 0,
  longest_length INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,
  rest_tokens INTEGER NOT NULL DEFAULT 0,
  tokens_earned_at_len INTEGER NOT NULL DEFAULT 0,
  computed_through TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
`CREATE TABLE IF NOT EXISTS rest_token_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES app_user(id),
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  local_date TEXT NOT NULL,
  UNIQUE(user_id, reason, local_date)
)`,
`CREATE TABLE IF NOT EXISTS quest_definition (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  template_key TEXT NOT NULL,
  target_type TEXT NOT NULL,
  params TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT
)`,
`CREATE TABLE IF NOT EXISTS quest_assignment (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_user(id),
  definition_id TEXT NOT NULL REFERENCES quest_definition(id),
  season_id TEXT,
  week_start TEXT,
  target_value REAL NOT NULL,
  current_value REAL NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'active',
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, definition_id, week_start)
)`,
`CREATE TABLE IF NOT EXISTS badge_definition (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  criteria TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 1,
  description TEXT
)`,
`CREATE TABLE IF NOT EXISTS badge_award (
  user_id TEXT NOT NULL REFERENCES app_user(id),
  badge_id TEXT NOT NULL REFERENCES badge_definition(id),
  session_id TEXT,
  awarded_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(user_id, badge_id)
)`,
`CREATE TABLE IF NOT EXISTS crew (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES app_user(id),
  invite_code TEXT UNIQUE NOT NULL,
  max_members INTEGER NOT NULL DEFAULT 8,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
`CREATE TABLE IF NOT EXISTS crew_member (
  crew_id TEXT NOT NULL REFERENCES crew(id),
  user_id TEXT NOT NULL REFERENCES app_user(id),
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(crew_id, user_id),
  UNIQUE(user_id)
)`,
`CREATE TABLE IF NOT EXISTS crew_nod (
  from_user_id TEXT NOT NULL REFERENCES app_user(id),
  to_user_id TEXT NOT NULL REFERENCES app_user(id),
  week_start TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(from_user_id, to_user_id, week_start)
)`,
`CREATE TABLE IF NOT EXISTS session_daily_rollup (
  user_id TEXT NOT NULL REFERENCES app_user(id),
  local_date TEXT NOT NULL,
  session_count INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  volume_kg REAL NOT NULL DEFAULT 0,
  PRIMARY KEY(user_id, local_date)
)`,
];

export async function runMigrations() {
  await client.batch(TABLES.map(sql => ({ sql, args: [] })), 'write');
}
