/*
  # T20 Blast 2025 Schedule Migration

  1. Schema Changes
    - Add group_name column to match_phases table
    - Add phase enum values for T20 Blast phases
    - Add group_name enum values for North/South groups

  2. Data Changes
    - Insert tournament record
    - Insert match phases for T20 Blast matches
    - Set prediction deadlines
    - Add tiebreaker rules
*/

-- Add group_name to match_phases if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'match_phases' AND column_name = 'group_name'
  ) THEN
    ALTER TABLE match_phases ADD COLUMN group_name text;
  END IF;
END $$;

-- Add group_name check constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'match_phases' AND constraint_name = 'match_phases_group_name_check'
  ) THEN
    ALTER TABLE match_phases 
    ADD CONSTRAINT match_phases_group_name_check 
    CHECK (group_name = ANY (ARRAY['North Group'::text, 'South Group'::text]));
  END IF;
END $$;

-- Insert tournament if it doesn't exist
INSERT INTO tournaments (
  id,
  name,
  start_date,
  end_date,
  format,
  category,
  total_matches,
  location,
  tournament_type,
  region,
  series_type
)
VALUES (
  2025003,
  'T20 Blast 2025',
  '2025-05-30',
  '2025-09-21',
  'T20',
  'National',
  133,
  'England',
  'league',
  'europe',
  'multi_team'
)
ON CONFLICT (id) DO NOTHING;

-- Delete existing data for this tournament to avoid duplicates
DELETE FROM match_phases WHERE match_id IN (
  SELECT id FROM matches WHERE tournament_id = 2025003
);

DELETE FROM prediction_deadlines WHERE match_id IN (
  SELECT id FROM matches WHERE tournament_id = 2025003
);

DELETE FROM tiebreakers WHERE tournament_id = 2025003;

-- Add match phases for group stages
INSERT INTO match_phases (match_id, phase, group_name)
SELECT 
  m.id,
  CASE 
    WHEN m.date < '2025-09-06' THEN 'group'
    WHEN m.date < '2025-09-21' THEN 'quarter_final' 
    WHEN m.date = '2025-09-21' AND m.name LIKE '%Semi%' THEN 'semi_final'
    ELSE 'final'
  END as phase,
  CASE
    WHEN t1.id IN (301, 302, 303, 309, 310, 312, 313, 318) THEN 'North Group'
    WHEN t1.id IN (304, 305, 306, 307, 308, 311, 314, 315, 316) THEN 'South Group'
    ELSE NULL
  END as group_name
FROM matches m
JOIN teams t1 ON m.team1_id = t1.id
WHERE m.tournament_id = 2025003;

-- Set prediction deadlines 1 hour before each match
INSERT INTO prediction_deadlines (match_id, deadline)
SELECT 
  id,
  date - INTERVAL '1 hour'
FROM matches 
WHERE tournament_id = 2025003;

-- Add tiebreaker rules
INSERT INTO tiebreakers (tournament_id, priority, criteria, description)
VALUES
  (2025003, 1, 'points', 'Total points earned in group stage'),
  (2025003, 2, 'net_run_rate', 'Net run rate across all matches'),
  (2025003, 3, 'head_to_head', 'Head-to-head record between tied teams'),
  (2025003, 4, 'wins', 'Total number of wins');