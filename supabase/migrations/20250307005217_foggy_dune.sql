/*
  # Add T20 Blast Tournament and Related Data

  1. New Data
    - Adds T20 Blast 2025 tournament
    - Sets up match phases for group stages and playoffs
    - Configures prediction deadlines
    - Adds tiebreaker rules

  2. Structure
    - First ensures tournament exists
    - Then adds match phases and other related data
    - Adds appropriate policies and constraints
*/

-- First ensure the tournament exists
INSERT INTO tournaments (
  id, name, start_date, end_date, format, category, 
  total_matches, location, tournament_type, is_featured
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
  true
)
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  format = EXCLUDED.format,
  category = EXCLUDED.category,
  total_matches = EXCLUDED.total_matches,
  location = EXCLUDED.location,
  tournament_type = EXCLUDED.tournament_type,
  is_featured = EXCLUDED.is_featured;

-- Create match_phases table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS match_phases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id bigint REFERENCES matches(id),
    phase text NOT NULL CHECK (phase = ANY (ARRAY['group', 'quarter_final', 'semi_final', 'final'])),
    group_name text CHECK (group_name = ANY (ARRAY['North Group', 'South Group'])),
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS on match_phases if not already enabled
ALTER TABLE match_phases ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read access for match phases" ON match_phases;
  CREATE POLICY "Public read access for match phases" ON match_phases
    FOR SELECT USING (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create prediction_deadlines table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS prediction_deadlines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id bigint REFERENCES matches(id),
    deadline timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS on prediction_deadlines if not already enabled
ALTER TABLE prediction_deadlines ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view prediction deadlines" ON prediction_deadlines;
  CREATE POLICY "Users can view prediction deadlines" ON prediction_deadlines
    FOR SELECT USING (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create tiebreakers table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS tiebreakers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id bigint REFERENCES tournaments(id),
    priority integer NOT NULL CHECK (priority > 0),
    criteria text NOT NULL,
    description text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (tournament_id, priority)
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS on tiebreakers if not already enabled
ALTER TABLE tiebreakers ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view tiebreaker rules" ON tiebreakers;
  CREATE POLICY "Users can view tiebreaker rules" ON tiebreakers
    FOR SELECT USING (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;