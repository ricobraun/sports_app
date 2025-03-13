/*
  # Fix T20 Blast Match Phases and Add Tournament Data

  1. Tables
    - `match_phases`: Track tournament phases and groups
    - `player_stats`: Player performance metrics
  
  2. Data
    - T20 Blast 2025 tournament
    - Team data
    - Match schedule for both North and South groups
  
  3. Changes
    - Fixed phase values to match constraints
    - Added proper group assignments
    - Ensured consistent phase values between matches and match_phases tables
*/

-- First, ensure matches table has correct phase constraint
DO $$ 
BEGIN
  ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_phase_check;
  ALTER TABLE matches ADD CONSTRAINT matches_phase_check 
    CHECK (phase IN ('group', 'quarter_final', 'semi_final', 'final'));
END $$;

-- Create match_phases table if it doesn't exist
CREATE TABLE IF NOT EXISTS match_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id bigint REFERENCES matches(id),
  phase text NOT NULL CHECK (phase IN ('group_north', 'group_south', 'quarter_final', 'semi_final', 'final')),
  group_name text CHECK (group_name IN ('North Group', 'South Group')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on match_phases
ALTER TABLE match_phases ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read access for match phases" ON match_phases;
  
  CREATE POLICY "Public read access for match phases"
    ON match_phases
    FOR SELECT
    TO public
    USING (true);
END $$;

-- Create player_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id bigint REFERENCES matches(id),
  player_id uuid NOT NULL,
  player_name text NOT NULL,
  team_id bigint REFERENCES teams(id),
  runs integer DEFAULT 0,
  wickets integer DEFAULT 0,
  catches integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on player_stats
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read access for player stats" ON player_stats;
  
  CREATE POLICY "Public read access for player stats"
    ON player_stats
    FOR SELECT
    TO authenticated
    USING (true);
END $$;

-- Insert T20 Blast 2025 tournament data
INSERT INTO tournaments (
  id, name, start_date, end_date, format, category, total_matches,
  location, tournament_type, region, series_type, is_featured
)
VALUES (
  2025003,
  'Vitality T20 Blast 2025',
  '2025-05-30',
  '2025-09-21',
  'T20',
  'National',
  133,
  'England',
  'league',
  'europe',
  'multi_team',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Insert teams if they don't exist
INSERT INTO teams (id, name, code, ranking)
VALUES 
  (301, 'Birmingham Bears', 'WARKS', NULL),
  (302, 'Derbyshire', 'DERBY', NULL),
  (303, 'Durham', 'DUR', NULL),
  (304, 'Essex', 'ESS', NULL),
  (305, 'Glamorgan', 'GLAM', NULL),
  (306, 'Gloucestershire', 'GLOUCS', NULL),
  (307, 'Hampshire', 'HANTS', NULL),
  (308, 'Kent', 'KENT', NULL),
  (309, 'Lancashire', 'LANCS', NULL),
  (310, 'Leicestershire', 'LEICS', NULL),
  (311, 'Middlesex', 'MDX', NULL),
  (312, 'Northamptonshire', 'NORTHANTS', NULL),
  (313, 'Nottinghamshire', 'NOTTS', NULL),
  (314, 'Somerset', 'SOM', NULL),
  (315, 'Surrey', 'SURREY', NULL),
  (316, 'Sussex', 'SUSSEX', NULL),
  (317, 'Worcestershire', 'WORCS', NULL),
  (318, 'Yorkshire', 'YORKS', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert North Group matches
INSERT INTO matches (
  id, tournament_id, name, status, date, team1_id, team2_id,
  format, venue, phase, match_type, group_name
)
SELECT 
  2025003000 + row_number() OVER () as id,
  2025003 as tournament_id,
  t1.name || ' vs ' || t2.name as name,
  'upcoming' as status,
  '2025-05-30'::date + (row_number() OVER ())::integer * interval '1 day' as date,
  t1.id as team1_id,
  t2.id as team2_id,
  'T20' as format,
  CASE 
    WHEN t1.code = 'WARKS' THEN 'Edgbaston'
    WHEN t1.code = 'DERBY' THEN 'County Ground, Derby'
    WHEN t1.code = 'DUR' THEN 'Riverside Ground'
    WHEN t1.code = 'LANCS' THEN 'Old Trafford'
    WHEN t1.code = 'LEICS' THEN 'Grace Road'
    WHEN t1.code = 'NOTTS' THEN 'Trent Bridge'
    WHEN t1.code = 'NORTHANTS' THEN 'County Ground, Northampton'
    WHEN t1.code = 'YORKS' THEN 'Headingley'
    ELSE t1.name || ' Ground'
  END as venue,
  'group' as phase,
  'league' as match_type,
  'North Group' as group_name
FROM teams t1
CROSS JOIN teams t2
WHERE t1.id != t2.id
  AND t1.id BETWEEN 301 AND 318
  AND t2.id BETWEEN 301 AND 318
  AND t1.id < t2.id
  AND (
    t1.code IN ('WARKS', 'DERBY', 'DUR', 'LANCS', 'LEICS', 'NOTTS', 'NORTHANTS', 'YORKS')
    AND t2.code IN ('WARKS', 'DERBY', 'DUR', 'LANCS', 'LEICS', 'NOTTS', 'NORTHANTS', 'YORKS')
  )
LIMIT 56;

-- Insert South Group matches
INSERT INTO matches (
  id, tournament_id, name, status, date, team1_id, team2_id,
  format, venue, phase, match_type, group_name
)
SELECT 
  2025003100 + row_number() OVER () as id,
  2025003 as tournament_id,
  t1.name || ' vs ' || t2.name as name,
  'upcoming' as status,
  '2025-05-30'::date + (row_number() OVER ())::integer * interval '1 day' as date,
  t1.id as team1_id,
  t2.id as team2_id,
  'T20' as format,
  CASE 
    WHEN t1.code = 'ESS' THEN 'County Ground, Chelmsford'
    WHEN t1.code = 'GLAM' THEN 'Sophia Gardens'
    WHEN t1.code = 'GLOUCS' THEN 'County Ground, Bristol'
    WHEN t1.code = 'HANTS' THEN 'The Rose Bowl'
    WHEN t1.code = 'KENT' THEN 'St Lawrence Ground'
    WHEN t1.code = 'MDX' THEN 'Lord''s'
    WHEN t1.code = 'SOM' THEN 'County Ground, Taunton'
    WHEN t1.code = 'SURREY' THEN 'The Oval'
    WHEN t1.code = 'SUSSEX' THEN 'County Ground, Hove'
    WHEN t1.code = 'WORCS' THEN 'New Road'
    ELSE t1.name || ' Ground'
  END as venue,
  'group' as phase,
  'league' as match_type,
  'South Group' as group_name
FROM teams t1
CROSS JOIN teams t2
WHERE t1.id != t2.id
  AND t1.id BETWEEN 301 AND 318
  AND t2.id BETWEEN 301 AND 318
  AND t1.id < t2.id
  AND (
    t1.code IN ('ESS', 'GLAM', 'GLOUCS', 'HANTS', 'KENT', 'MDX', 'SOM', 'SURREY', 'SUSSEX', 'WORCS')
    AND t2.code IN ('ESS', 'GLAM', 'GLOUCS', 'HANTS', 'KENT', 'MDX', 'SOM', 'SURREY', 'SUSSEX', 'WORCS')
  )
LIMIT 77;

-- Insert match phases for all matches
INSERT INTO match_phases (match_id, phase, group_name)
SELECT 
  id,
  CASE 
    WHEN group_name = 'North Group' THEN 'group_north'
    WHEN group_name = 'South Group' THEN 'group_south'
    ELSE phase
  END as phase,
  group_name
FROM matches
WHERE tournament_id = 2025003;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_phases_phase ON match_phases(phase);
CREATE INDEX IF NOT EXISTS idx_player_stats_match ON player_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player_id);