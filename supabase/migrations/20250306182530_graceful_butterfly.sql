/*
  # Add Advanced Prediction Features

  1. New Tables
    - `player_stats`
      - Tracks player performance for each match
      - Used for validating player-specific predictions
    
    - `advanced_predictions`
      - Stores detailed match predictions including:
        - Top batsman
        - Top bowler
        - Player of the match
        - Team score ranges
    
  2. Changes
    - Add `phase` column to matches table
    - Add `match_type` column to matches table
    
  3. Security
    - Enable RLS on new tables
    - Add appropriate policies for authenticated users
*/

-- Create player_stats table
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id bigint REFERENCES matches(id),
  player_id uuid NOT NULL,
  player_name text NOT NULL,
  team_id bigint REFERENCES teams(id),
  runs int DEFAULT 0,
  wickets int DEFAULT 0,
  catches int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on player_stats
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for player_stats
CREATE POLICY "Public read access for player stats"
  ON player_stats
  FOR SELECT
  TO authenticated
  USING (true);

-- Create advanced_predictions table
CREATE TABLE IF NOT EXISTS advanced_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id uuid REFERENCES predictions(id),
  match_id bigint REFERENCES matches(id),
  user_id uuid REFERENCES auth.users(id),
  top_batsman_id uuid,
  top_bowler_id uuid,
  player_of_match_id uuid,
  team1_score_min int,
  team1_score_max int,
  team2_score_min int,
  team2_score_max int,
  points int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on advanced_predictions
ALTER TABLE advanced_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for advanced_predictions
CREATE POLICY "Users can create advanced predictions"
  ON advanced_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all advanced predictions"
  ON advanced_predictions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own advanced predictions"
  ON advanced_predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add match phase and type columns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'phase'
  ) THEN
    ALTER TABLE matches 
    ADD COLUMN phase text CHECK (
      phase = ANY (ARRAY[
        'group',
        'quarter_final',
        'semi_final',
        'final'
      ])
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'match_type'
  ) THEN
    ALTER TABLE matches 
    ADD COLUMN match_type text CHECK (
      match_type = ANY (ARRAY[
        'league',
        'knockout',
        'playoff'
      ])
    );
  END IF;
END $$;

-- Create function to calculate advanced prediction points
CREATE OR REPLACE FUNCTION calculate_advanced_prediction_points(prediction_id uuid)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  points int := 0;
  pred advanced_predictions;
  stats player_stats;
BEGIN
  -- Get the prediction
  SELECT * INTO pred
  FROM advanced_predictions
  WHERE id = prediction_id;
  
  -- Get match stats
  SELECT * INTO stats
  FROM player_stats
  WHERE match_id = pred.match_id;
  
  -- Calculate points based on correct predictions
  IF pred.top_batsman_id = stats.player_id THEN
    points := points + 10;
  END IF;
  
  IF pred.top_bowler_id = stats.player_id THEN
    points := points + 10;
  END IF;
  
  IF pred.player_of_match_id = stats.player_id THEN
    points := points + 10;
  END IF;
  
  -- Update prediction points
  UPDATE advanced_predictions
  SET points = points
  WHERE id = prediction_id;
  
  RETURN points;
END;
$$;