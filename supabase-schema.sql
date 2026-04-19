-- ============================================================
--  Thrillzone Mini Golf — Supabase Schema
--  Run this in your Supabase SQL editor (Dashboard → SQL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Holes ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS holes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_index  INTEGER NOT NULL DEFAULT 0,
  title        TEXT NOT NULL,
  description  TEXT,
  type         TEXT NOT NULL DEFAULT 'hole' CHECK (type IN ('hole', 'challenge')),
  par          INTEGER DEFAULT 3,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Sessions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_code           TEXT UNIQUE NOT NULL,
  play_style            TEXT NOT NULL CHECK (play_style IN ('casual', 'competitive', 'silly', 'fun')),
  players               JSONB NOT NULL DEFAULT '[]',
  opt_out_leaderboard   BOOLEAN DEFAULT FALSE,
  current_hole_index    INTEGER DEFAULT 0,
  started_at            TIMESTAMPTZ DEFAULT NOW(),
  completed_at          TIMESTAMPTZ,
  email                 TEXT
);

-- ── Scores ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id   UUID REFERENCES sessions(id) ON DELETE CASCADE,
  hole_id      UUID REFERENCES holes(id) ON DELETE CASCADE,
  player_name  TEXT NOT NULL,
  strokes      INTEGER NOT NULL CHECK (strokes >= 0),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, hole_id, player_name)
);

-- ── Photos ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS photos (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    UUID REFERENCES sessions(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  taken_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Spinner Effects ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spinner_effects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Admin Settings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_device_code   ON sessions (device_code);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at    ON sessions (started_at);
CREATE INDEX IF NOT EXISTS idx_scores_session_id      ON scores   (session_id);
CREATE INDEX IF NOT EXISTS idx_photos_session_id      ON photos   (session_id);

-- ── Row Level Security ─────────────────────────────────────────
ALTER TABLE holes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE spinner_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings  ENABLE ROW LEVEL SECURITY;

-- Allow anon read/write for game data (players use anon key)
CREATE POLICY "anon_all_holes"           ON holes           FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_sessions"        ON sessions        FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_scores"          ON scores          FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_photos"          ON photos          FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_spinner"        ON spinner_effects FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_admin_settings" ON admin_settings  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── Storage bucket for photos ──────────────────────────────────
-- Run in Dashboard → Storage → New bucket, or via SQL:
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anon_photos_upload" ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'photos');
CREATE POLICY "anon_photos_read"   ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'photos');

-- ── Seed: Admin password ───────────────────────────────────────
-- Change 'thrillzone2024' to your preferred password BEFORE running!
INSERT INTO admin_settings (key, value) VALUES ('admin_password', 'thrillzone2024')
ON CONFLICT (key) DO NOTHING;

-- ── Seed: Default Spinner Effects ──────────────────────────────
INSERT INTO spinner_effects (name, description) VALUES
  ('Score Swap',      'Swap your total score with any player of your choice!'),
  ('Double Trouble',  'Your score on the next hole counts double.'),
  ('Gift a Stroke',   'Give 2 penalty strokes to any other player.'),
  ('Steal a Stroke',  'Remove 1 stroke from your total. You earned it!'),
  ('Lucky Skip',      'Your score on the next hole doesn''t count at all.'),
  ('Mulligan',        'Delete your worst hole score from this game.'),
  ('Wrong Hand',      'Next hole must be played with your non-dominant hand.'),
  ('Blindfolded',     'One player must close their eyes for their first shot on the next hole.'),
  ('Free Pass',       'Nothing happens this time. Lucky you!'),
  ('Group Hug',       'Everyone must high-five before the next hole starts.')
ON CONFLICT DO NOTHING;

-- ── Seed: Placeholder Holes ────────────────────────────────────
-- Replace these with your real hole names/descriptions in the admin panel
INSERT INTO holes (order_index, title, description, type, par) VALUES
  (0,  'The Warm-Up',       'A gentle starter to get your swing going. Don''t let the easy look fool you!', 'hole', 3),
  (1,  'The Chicane',       'Navigate a tight S-bend. Stay smooth and you''ll be fine.', 'hole', 3),
  (2,  'The Island',        'Water on all sides. One wrong shot and it''s a splash landing!', 'hole', 4),
  (3,  'Speed Round',       'First player to sink it wins a free stroke credit.', 'challenge', 3),
  (4,  'The Windmill',      'Time your shot to slip past the spinning blades.', 'hole', 3),
  (5,  'Tunnel Vision',     'Thread the ball through the tunnel. Straight and true!', 'hole', 3),
  (6,  'Closest to the Pin','One shot each. Whoever is nearest wins a bonus point.', 'challenge', 1),
  (7,  'The Castle',        'A moat surrounds the green. Find the drawbridge!', 'hole', 4),
  (8,  'The Loop',          'Around the loop and onto the green. Timing is everything.', 'hole', 3),
  (9,  'Trick Shot',        'Bank shot required — use the wall to your advantage.', 'challenge', 3),
  (10, 'The Longshot',      'Our longest hole. Power and precision both required.', 'hole', 4),
  (11, 'Obstacle Course',   'Weave through moving obstacles. Good luck!', 'hole', 4),
  (12, 'Least Putts Wins',  'Fewest shots to sink it takes the hole. Quality over quantity!', 'challenge', 2),
  (13, 'The Ramp',          'Launch the ball up the ramp and land it on the elevated green.', 'hole', 3),
  (14, 'The Maze',          'Only one path through. Find it before your ball finds a dead end.', 'hole', 4),
  (15, 'Team Putt',         'Players combine for the lowest combined score on this hole.', 'challenge', 3),
  (16, 'The Finale',        'The last hole! Finish strong — everything is still to play for.', 'hole', 3)
ON CONFLICT DO NOTHING;
