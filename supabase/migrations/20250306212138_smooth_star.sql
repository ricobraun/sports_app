/*
  # Add Prediction Schema Components
  
  This migration adds the remaining components needed for the prediction system,
  assuming the predictions table already exists.

  1. New Tables
    - prediction_deadlines: Stores match prediction cutoff times
    - prediction_stats: Stores user prediction statistics
    - tiebreakers: Stores tiebreaker rules
    
  2. Functions & Triggers
    - Automatic deadline setting
    - Stats calculation
    - Rank updates
    
  3. Security
    - RLS policies for all tables
    - Access control for authenticated users
*/

-- Create prediction_deadlines table
CREATE TABLE prediction_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id bigint NOT NULL REFERENCES matches(id),
  deadline timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create prediction_stats table
CREATE TABLE prediction_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  tournament_id bigint NOT NULL REFERENCES tournaments(id),
  total_predictions integer DEFAULT 0,
  correct_predictions integer DEFAULT 0,
  total_points integer DEFAULT 0,
  accuracy numeric(5,2) DEFAULT 0.0,
  current_rank integer,
  previous_rank integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_stats CHECK (
    total_predictions >= 0 AND
    correct_predictions >= 0 AND
    correct_predictions <= total_predictions AND
    accuracy >= 0 AND
    accuracy <= 100
  ),
  UNIQUE (user_id, tournament_id)
);

-- Create tiebreakers table
CREATE TABLE tiebreakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id bigint NOT NULL REFERENCES tournaments(id),
  priority integer NOT NULL,
  criteria text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tournament_id, priority),
  CONSTRAINT valid_priority CHECK (priority > 0)
);

-- Insert default tiebreaker rules
INSERT INTO tiebreakers (tournament_id, priority, criteria, description) 
SELECT 
  t.id,
  priority,
  criteria,
  description
FROM tournaments t
CROSS JOIN (
  VALUES 
    (1, 'correct_predictions', 'Most correct predictions'),
    (2, 'prediction_accuracy', 'Highest prediction accuracy percentage'),
    (3, 'early_predictions', 'Earlier predictions across matches')
) AS rules(priority, criteria, description)
WHERE t.id IN (2025001, 2025002); -- IPL and PSL IDs

-- Create function to automatically set prediction deadline
CREATE OR REPLACE FUNCTION set_prediction_deadline()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO prediction_deadlines (match_id, deadline)
  VALUES (
    NEW.id,
    NEW.date - interval '1 hour'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set deadline when match is created
CREATE TRIGGER set_match_prediction_deadline
AFTER INSERT ON matches
FOR EACH ROW
EXECUTE FUNCTION set_prediction_deadline();

-- Create function to enforce prediction deadline
CREATE OR REPLACE FUNCTION enforce_prediction_deadline()
RETURNS TRIGGER AS $$
DECLARE
  deadline_time timestamptz;
BEGIN
  SELECT deadline INTO deadline_time
  FROM prediction_deadlines
  WHERE match_id = NEW.match_id;

  IF NEW.created_at > deadline_time THEN
    RAISE EXCEPTION 'Prediction deadline has passed';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce deadline
CREATE TRIGGER check_prediction_deadline
BEFORE INSERT ON predictions
FOR EACH ROW
EXECUTE FUNCTION enforce_prediction_deadline();

-- Create function to update prediction stats
CREATE OR REPLACE FUNCTION update_prediction_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update prediction stats for the user
  INSERT INTO prediction_stats (user_id, tournament_id, total_predictions, correct_predictions)
  VALUES (
    NEW.user_id,
    (SELECT tournament_id FROM matches WHERE id = NEW.match_id),
    1,
    CASE WHEN NEW.points > 0 THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, tournament_id) DO UPDATE
  SET 
    total_predictions = prediction_stats.total_predictions + 1,
    correct_predictions = prediction_stats.correct_predictions + 
      CASE WHEN NEW.points > 0 THEN 1 ELSE 0 END,
    total_points = prediction_stats.total_points + NEW.points,
    accuracy = ROUND(
      (prediction_stats.correct_predictions + CASE WHEN NEW.points > 0 THEN 1 ELSE 0 END)::numeric /
      (prediction_stats.total_predictions + 1) * 100,
      2
    ),
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats when prediction is made
CREATE TRIGGER update_user_prediction_stats
AFTER INSERT ON predictions
FOR EACH ROW
EXECUTE FUNCTION update_prediction_stats();

-- Create function to calculate ranks
CREATE OR REPLACE FUNCTION calculate_ranks()
RETURNS TRIGGER AS $$
BEGIN
  -- Store previous ranks
  UPDATE prediction_stats
  SET previous_rank = current_rank
  WHERE tournament_id = (
    SELECT tournament_id 
    FROM matches 
    WHERE id = NEW.match_id
  );
  
  -- Calculate new ranks
  WITH ranked_stats AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY tournament_id
        ORDER BY 
          total_points DESC,
          correct_predictions DESC,
          accuracy DESC,
          created_at ASC
      ) as new_rank
    FROM prediction_stats
    WHERE tournament_id = (
      SELECT tournament_id 
      FROM matches 
      WHERE id = NEW.match_id
    )
  )
  UPDATE prediction_stats ps
  SET 
    current_rank = rs.new_rank,
    updated_at = now()
  FROM ranked_stats rs
  WHERE ps.id = rs.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update ranks when stats change
CREATE TRIGGER update_prediction_ranks
AFTER INSERT OR UPDATE ON prediction_stats
FOR EACH ROW
EXECUTE FUNCTION calculate_ranks();

-- Enable RLS
ALTER TABLE prediction_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiebreakers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all prediction stats"
  ON prediction_stats
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can update prediction stats"
  ON prediction_stats
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view prediction deadlines"
  ON prediction_deadlines
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view tiebreaker rules"
  ON tiebreakers
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_prediction_stats_tournament ON prediction_stats(tournament_id, total_points DESC);
CREATE INDEX idx_prediction_stats_user ON prediction_stats(user_id);
CREATE INDEX idx_prediction_deadlines_match ON prediction_deadlines(match_id);