/*
  # Add 2025 Tournaments and Schedule

  1. New Tables
    - tournament_schedule table to store schedule information
    - Adds tournament phases and prediction deadlines

  2. Data
    - Inserts 2025 tournament data
    - Adds complete schedule information
    - Sets up prediction deadlines
*/

-- First, create the tournaments
INSERT INTO tournaments (id, name, start_date, end_date, format, category, total_matches, location, is_featured)
VALUES
  (2025001, 'Indian Premier League 2025', '2025-03-22', '2025-05-24', 'T20', 'National', 74, 'India', true),
  (2025002, 'Pakistan Super League 2025', '2025-02-15', '2025-03-15', 'T20', 'National', 34, 'Pakistan', true),
  (2025003, 'T20 Blast 2025', '2025-05-30', '2025-09-21', 'T20', 'National', 133, 'England', true),
  (2025004, 'Caribbean Premier League 2025', '2025-08-01', '2025-09-15', 'T20', 'National', 34, 'Caribbean', true),
  (2025005, 'Big Bash League 2025-26', '2025-12-05', '2026-01-25', 'T20', 'National', 61, 'Australia', true)
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  format = EXCLUDED.format,
  category = EXCLUDED.category,
  total_matches = EXCLUDED.total_matches,
  location = EXCLUDED.location,
  is_featured = EXCLUDED.is_featured;

-- Create tournament_schedule table
CREATE TABLE IF NOT EXISTS tournament_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id bigint REFERENCES tournaments(id),
  phase text NOT NULL CHECK (phase = ANY (ARRAY['group', 'quarter_final', 'semi_final', 'final'])),
  start_date date NOT NULL,
  end_date date NOT NULL,
  venue text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tournament_schedule ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for reading schedule
CREATE POLICY "Anyone can read tournament schedule" ON tournament_schedule
  FOR SELECT USING (true);

-- Insert schedule data
INSERT INTO tournament_schedule (tournament_id, phase, start_date, end_date, venue, description)
VALUES
-- PSL 2025
(2025002, 'group', '2025-02-14', '2025-03-05', 'Multiple venues, Pakistan', 'Group Stage'),
(2025002, 'quarter_final', '2025-03-07', '2025-03-08', 'TBD', 'Quarter Finals'),
(2025002, 'semi_final', '2025-03-10', '2025-03-11', 'TBD', 'Semi Finals'),
(2025002, 'final', '2025-03-14', '2025-03-14', 'National Stadium, Karachi', 'Final'),

-- IPL 2025
(2025001, 'group', '2025-03-21', '2025-05-12', 'Multiple venues, India', 'Group Stage'),
(2025001, 'quarter_final', '2025-05-14', '2025-05-17', 'TBD', 'Playoffs'),
(2025001, 'semi_final', '2025-05-19', '2025-05-20', 'TBD', 'Qualifiers'),
(2025001, 'final', '2025-05-23', '2025-05-23', 'Narendra Modi Stadium, Ahmedabad', 'Final'),

-- T20 Blast 2025
(2025003, 'group', '2025-05-30', '2025-09-01', 'Multiple venues, England', 'North & South Group Stages'),
(2025003, 'quarter_final', '2025-09-06', '2025-09-09', 'TBD', 'Quarter Finals'),
(2025003, 'semi_final', '2025-09-21', '2025-09-21', 'Edgbaston, Birmingham', 'Semi Finals'),
(2025003, 'final', '2025-09-21', '2025-09-21', 'Edgbaston, Birmingham', 'Final'),

-- CPL 2025
(2025004, 'group', '2025-08-01', '2025-09-05', 'Multiple venues, Caribbean', 'Group Stage'),
(2025004, 'semi_final', '2025-09-10', '2025-09-11', 'TBD', 'Semi Finals'),
(2025004, 'final', '2025-09-15', '2025-09-15', 'Brian Lara Stadium, Trinidad', 'Final'),

-- BBL 2025-26
(2025005, 'group', '2025-12-05', '2026-01-14', 'Multiple venues, Australia', 'Group Stage'),
(2025005, 'semi_final', '2025-01-16', '2025-01-17', 'TBD', 'Semi Finals'),
(2025005, 'final', '2025-01-25', '2025-01-25', 'TBD', 'Final');