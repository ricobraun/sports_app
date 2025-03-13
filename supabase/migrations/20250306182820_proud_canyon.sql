/*
  # Add T20 Blast Tournament Support

  1. New Tables
    - `match_phases`
      - Stores match phase information (group, quarter-final, semi-final, final)
      - Links matches to their respective tournament phases
    
    - `player_predictions`
      - Stores player-specific predictions for matches
      - Includes top batsman, bowler, and player of match predictions
    
  2. Changes
    - Add group information to matches table
    - Add phase-specific scoring rules
    
  3. Security
    - Enable RLS on new tables
    - Add appropriate policies for authenticated users
*/

-- Create match_phases table
CREATE TABLE IF NOT EXISTS match_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id bigint REFERENCES matches(id),
  phase text NOT NULL CHECK (
    phase = ANY (ARRAY[
      'group_north',
      'group_south',
      'quarter_final',
      'semi_final',
      'final'
    ])
  ),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on match_phases
ALTER TABLE match_phases ENABLE ROW LEVEL SECURITY;

-- Create policy for match_phases
CREATE POLICY "Public read access for match phases"
  ON match_phases
  FOR SELECT
  TO authenticated
  USING (true);

-- Create player_predictions table
CREATE TABLE IF NOT EXISTS player_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id uuid REFERENCES predictions(id),
  match_id bigint REFERENCES matches(id),
  user_id uuid REFERENCES auth.users(id),
  top_batsman_prediction jsonb,
  top_bowler_prediction jsonb,
  player_of_match_prediction jsonb,
  points int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on player_predictions
ALTER TABLE player_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for player_predictions
CREATE POLICY "Users can create player predictions"
  ON player_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all player predictions"
  ON player_predictions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own player predictions"
  ON player_predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add group information to matches
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'group_name'
  ) THEN
    ALTER TABLE matches 
    ADD COLUMN group_name text CHECK (
      group_name = ANY (ARRAY[
        'North Group',
        'South Group'
      ])
    );
  END IF;
END $$;

-- Create function to calculate player prediction points
CREATE OR REPLACE FUNCTION calculate_player_prediction_points(prediction_id uuid)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  points int := 0;
  pred player_predictions;
  match_phase text;
BEGIN
  -- Get the prediction
  SELECT * INTO pred
  FROM player_predictions
  WHERE id = prediction_id;
  
  -- Get match phase
  SELECT phase INTO match_phase
  FROM match_phases
  WHERE match_id = pred.match_id;
  
  -- Calculate points based on phase and correct predictions
  -- Base points for correct predictions
  IF pred.top_batsman_prediction->>'correct' = 'true' THEN
    points := points + 10;
  END IF;
  
  IF pred.top_bowler_prediction->>'correct' = 'true' THEN
    points := points + 10;
  END IF;
  
  IF pred.player_of_match_prediction->>'correct' = 'true' THEN
    points := points + 10;
  END IF;
  
  -- Bonus points for knockout stage predictions
  IF match_phase = 'quarter_final' THEN
    points := points * 2;
  ELSIF match_phase = 'semi_final' THEN
    points := points * 3;
  ELSIF match_phase = 'final' THEN
    points := points * 4;
  END IF;
  
  -- Update prediction points
  UPDATE player_predictions
  SET points = points,
      updated_at = now()
  WHERE id = prediction_id;
  
  RETURN points;
END;
$$;