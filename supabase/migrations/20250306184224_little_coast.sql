/*
  # Add CPL and BBL Tournaments and Matches

  1. New Data
    - Add tournament records for CPL and BBL
    - Add team records for CPL and BBL teams
    - Add match schedule records with placeholder teams for knockout stages

  2. Changes
    - Fixed not-null constraint for team IDs by using placeholder teams
    - Maintained all original data and relationships
    - Ensured proper data types and constraints

  3. Security
    - No changes to RLS policies required
    - Using existing public read access policies
*/

-- Add CPL 2025
INSERT INTO tournaments (id, name, start_date, end_date, format, category, total_matches, location, tournament_type, region, series_type)
VALUES (
  2025004,
  'Caribbean Premier League 2025',
  '2025-08-01',
  '2025-09-15',
  'T20',
  'National',
  34,
  'Caribbean',
  'league',
  'americas',
  'multi_team'
);

-- Add BBL 2025-26
INSERT INTO tournaments (id, name, start_date, end_date, format, category, total_matches, location, tournament_type, region, series_type)
VALUES (
  2025005,
  'Big Bash League 2025-26',
  '2025-12-05',
  '2026-01-25',
  'T20',
  'National',
  61,
  'Australia',
  'league',
  'oceania',
  'multi_team'
);

-- Add CPL Teams
INSERT INTO teams (id, name, code, ranking) VALUES
(401, 'Trinbago Knight Riders', 'TKR', NULL),
(402, 'Guyana Amazon Warriors', 'GAW', NULL),
(403, 'Barbados Royals', 'BR', NULL),
(404, 'St Kitts & Nevis Patriots', 'SNP', NULL),
(405, 'Saint Lucia Kings', 'SLK', NULL),
(406, 'Jamaica Tallawahs', 'JT', NULL),
-- Add placeholder teams for knockout stages
(407, 'CPL Semi-Final 1 Winner', 'SF1W', NULL),
(408, 'CPL Semi-Final 2 Winner', 'SF2W', NULL);

-- Add BBL Teams
INSERT INTO teams (id, name, code, ranking) VALUES
(501, 'Adelaide Strikers', 'ADS', NULL),
(502, 'Brisbane Heat', 'BRH', NULL),
(503, 'Hobart Hurricanes', 'HBH', NULL),
(504, 'Melbourne Renegades', 'MLR', NULL),
(505, 'Melbourne Stars', 'MLS', NULL),
(506, 'Perth Scorchers', 'PER', NULL),
(507, 'Sydney Sixers', 'SYD', NULL),
(508, 'Sydney Thunder', 'THU', NULL),
-- Add placeholder teams for knockout stages
(509, 'BBL Semi-Final 1 Winner', 'BSF1W', NULL),
(510, 'BBL Semi-Final 2 Winner', 'BSF2W', NULL);

-- Add CPL Matches
DO $$ 
BEGIN
  -- CPL Group Stage Matches
  INSERT INTO matches (id, tournament_id, name, status, date, team1_id, team2_id, format, venue, phase, match_type, group_name)
  SELECT 
    2025004000 + row_number() OVER () as id,
    2025004 as tournament_id,
    CASE 
      WHEN team1_id < team2_id THEN (SELECT name FROM teams WHERE id = team1_id) || ' vs ' || (SELECT name FROM teams WHERE id = team2_id)
      ELSE (SELECT name FROM teams WHERE id = team2_id) || ' vs ' || (SELECT name FROM teams WHERE id = team1_id)
    END as name,
    'upcoming' as status,
    date::timestamptz,
    team1_id,
    team2_id,
    'T20' as format,
    venue,
    phase,
    match_type,
    NULL as group_name
  FROM (
    VALUES
      ('2025-08-01 19:00:00+00'::text, 401, 402, 'Queen''s Park Oval, Trinidad', 'group', 'league'),
      ('2025-08-02 19:00:00+00'::text, 403, 404, 'Kensington Oval, Barbados', 'group', 'league'),
      ('2025-08-03 19:00:00+00'::text, 405, 406, 'Daren Sammy Stadium, Saint Lucia', 'group', 'league')
  ) as matches(date, team1_id, team2_id, venue, phase, match_type);

  -- CPL Knockout Matches
  INSERT INTO matches (id, tournament_id, name, status, date, team1_id, team2_id, format, venue, phase, match_type, group_name)
  VALUES
    (2025004004, 2025004, 'CPL 2025 Semi-Final 1', 'upcoming', '2025-09-10 19:00:00+00'::timestamptz, 401, 402, 'T20', 'Queen''s Park Oval, Trinidad', 'semi_final', 'knockout', NULL),
    (2025004005, 2025004, 'CPL 2025 Semi-Final 2', 'upcoming', '2025-09-12 19:00:00+00'::timestamptz, 403, 404, 'T20', 'Queen''s Park Oval, Trinidad', 'semi_final', 'knockout', NULL),
    (2025004006, 2025004, 'CPL 2025 Final', 'upcoming', '2025-09-15 19:00:00+00'::timestamptz, 407, 408, 'T20', 'Queen''s Park Oval, Trinidad', 'final', 'knockout', NULL);

  -- BBL Group Stage Matches
  INSERT INTO matches (id, tournament_id, name, status, date, team1_id, team2_id, format, venue, phase, match_type, group_name)
  SELECT 
    2025005000 + row_number() OVER () as id,
    2025005 as tournament_id,
    CASE 
      WHEN team1_id < team2_id THEN (SELECT name FROM teams WHERE id = team1_id) || ' vs ' || (SELECT name FROM teams WHERE id = team2_id)
      ELSE (SELECT name FROM teams WHERE id = team2_id) || ' vs ' || (SELECT name FROM teams WHERE id = team1_id)
    END as name,
    'upcoming' as status,
    date::timestamptz,
    team1_id,
    team2_id,
    'T20' as format,
    venue,
    phase,
    match_type,
    NULL as group_name
  FROM (
    VALUES
      ('2025-12-05 08:15:00+00'::text, 501, 502, 'Adelaide Oval', 'group', 'league'),
      ('2025-12-06 08:15:00+00'::text, 503, 504, 'Blundstone Arena', 'group', 'league'),
      ('2025-12-07 08:15:00+00'::text, 505, 506, 'MCG', 'group', 'league'),
      ('2025-12-08 08:15:00+00'::text, 507, 508, 'SCG', 'group', 'league')
  ) as matches(date, team1_id, team2_id, venue, phase, match_type);

  -- BBL Knockout Matches
  INSERT INTO matches (id, tournament_id, name, status, date, team1_id, team2_id, format, venue, phase, match_type, group_name)
  VALUES
    (2025005005, 2025005, 'BBL 2025-26 Semi-Final 1', 'upcoming', '2026-01-20 08:15:00+00'::timestamptz, 501, 502, 'T20', 'MCG', 'semi_final', 'knockout', NULL),
    (2025005006, 2025005, 'BBL 2025-26 Semi-Final 2', 'upcoming', '2026-01-22 08:15:00+00'::timestamptz, 503, 504, 'T20', 'SCG', 'semi_final', 'knockout', NULL),
    (2025005007, 2025005, 'BBL 2025-26 Final', 'upcoming', '2026-01-25 08:15:00+00'::timestamptz, 509, 510, 'T20', 'Perth Stadium', 'final', 'knockout', NULL);
END $$;