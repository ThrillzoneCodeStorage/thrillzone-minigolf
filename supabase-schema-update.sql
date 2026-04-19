-- ============================================================
--  Thrillzone Mini Golf — Schema Update
--  Run this in Supabase SQL Editor if you already ran the
--  original supabase-schema.sql. New installs: run the full
--  supabase-schema.sql instead (already includes this).
-- ============================================================

-- Game mode rules (editable per mode in admin panel)
CREATE TABLE IF NOT EXISTS game_mode_rules (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mode        TEXT NOT NULL CHECK (mode IN ('casual','competitive','silly','fun')),
  rule_text   TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_mode_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_rules" ON game_mode_rules FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_rules_mode ON game_mode_rules (mode, order_index);

-- Seed default rules (only inserts if table is empty)
INSERT INTO game_mode_rules (mode, rule_text, order_index) VALUES
  ('casual', 'Count every stroke honestly.', 0),
  ('casual', 'Your ball must come to a stop before you take your next shot.', 1),
  ('casual', 'If your ball leaves the course, add one penalty stroke and place it back.', 2),
  ('casual', 'Lowest total strokes at the end wins!', 3),

  ('competitive', 'One player takes their full turn before the next person goes.', 0),
  ('competitive', 'You are allowed to nudge other players'' balls out of your path.', 1),
  ('competitive', 'The ball must come to a complete stop before the next player goes.', 2),
  ('competitive', 'Winner of each hole gets to go first on the next one.', 3),

  ('silly', 'Normal scoring applies — every stroke counts.', 0),
  ('silly', 'After completing each hole, someone spins the wheel.', 1),
  ('silly', 'Whatever the wheel lands on must be carried out — no exceptions!', 2),
  ('silly', 'Lowest total strokes still wins, even with all the chaos.', 3),

  ('fun', 'No scores are tracked — there is no winner or loser.', 0),
  ('fun', 'Read each hole''s description and story as you go.', 1),
  ('fun', 'Take as many shots as you like on each hole.', 2),
  ('fun', 'The only goal is to have a great time with your group.', 3)
ON CONFLICT DO NOTHING;
