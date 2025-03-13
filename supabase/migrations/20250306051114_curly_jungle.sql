/*
  # Initial Schema Setup for CrickPredict

  1. New Tables
    - `users`
      - `id` (uuid, primary key, matches auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `is_admin` (boolean)
      - `profile_picture` (text)
      - `total_predictions` (integer)
      - `correct_predictions` (integer)
      - `created_at` (timestamp)
      - `last_active` (timestamp)

    - `tournaments`
      - `id` (bigint, primary key)
      - `name` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `format` (text)
      - `category` (text)
      - `total_matches` (integer)
      - `location` (text)
      - `created_at` (timestamp)

    - `teams`
      - `id` (bigint, primary key)
      - `name` (text)
      - `code` (text)
      - `ranking` (integer)
      - `created_at` (timestamp)

    - `matches`
      - `id` (bigint, primary key)
      - `tournament_id` (bigint, references tournaments)
      - `name` (text)
      - `status` (text)
      - `date` (timestamp)
      - `team1_id` (bigint, references teams)
      - `team2_id` (bigint, references teams)
      - `format` (text)
      - `venue` (text)
      - `winner_id` (bigint, references teams)
      - `team1_score` (text)
      - `team2_score` (text)
      - `created_at` (timestamp)

    - `pools`
      - `id` (uuid, primary key)
      - `name` (text)
      - `admin_id` (uuid, references users)
      - `tournament_id` (bigint, references tournaments)
      - `invite_code` (text, unique)
      - `is_public` (boolean)
      - `created_at` (timestamp)

    - `pool_members`
      - `id` (uuid, primary key)
      - `pool_id` (uuid, references pools)
      - `user_id` (uuid, references users)
      - `points` (integer)
      - `rank` (integer)
      - `previous_rank` (integer)
      - `joined_at` (timestamp)

    - `predictions`
      - `id` (uuid, primary key)
      - `pool_id` (uuid, references pools)
      - `match_id` (bigint, references matches)
      - `user_id` (uuid, references users)
      - `prediction` (text)
      - `confidence` (integer)
      - `points` (integer)
      - `created_at` (timestamp)
      - `settled` (boolean)

    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `message` (text)
      - `type` (text)
      - `read` (boolean)
      - `related_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for pool admins

  3. Functions
    - Add function to calculate points
    - Add function to update rankings
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  is_admin boolean DEFAULT false,
  profile_picture text,
  total_predictions integer DEFAULT 0,
  correct_predictions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- Create tournaments table
CREATE TABLE tournaments (
  id bigint PRIMARY KEY,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  format text CHECK (format IN ('ODI', 'T10', 'T20', 'Test', 'Bilateral')),
  category text CHECK (category IN ('ICC', 'National', 'Bilateral')),
  total_matches integer,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Create teams table
CREATE TABLE teams (
  id bigint PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL,
  ranking integer,
  created_at timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE matches (
  id bigint PRIMARY KEY,
  tournament_id bigint REFERENCES tournaments NOT NULL,
  name text NOT NULL,
  status text CHECK (status IN ('upcoming', 'live', 'completed')) NOT NULL,
  date timestamptz NOT NULL,
  team1_id bigint REFERENCES teams NOT NULL,
  team2_id bigint REFERENCES teams NOT NULL,
  format text CHECK (format IN ('ODI', 'T10', 'T20', 'Test')),
  venue text,
  winner_id bigint REFERENCES teams,
  team1_score text,
  team2_score text,
  created_at timestamptz DEFAULT now(),
  CHECK (team1_id != team2_id)
);

-- Create pools table
CREATE TABLE pools (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  admin_id uuid REFERENCES users NOT NULL,
  tournament_id bigint REFERENCES tournaments NOT NULL,
  invite_code text UNIQUE NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create pool_members table
CREATE TABLE pool_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id uuid REFERENCES pools NOT NULL,
  user_id uuid REFERENCES users NOT NULL,
  points integer DEFAULT 0,
  rank integer,
  previous_rank integer,
  joined_at timestamptz DEFAULT now(),
  UNIQUE (pool_id, user_id)
);

-- Create predictions table
CREATE TABLE predictions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id uuid REFERENCES pools NOT NULL,
  match_id bigint REFERENCES matches NOT NULL,
  user_id uuid REFERENCES users NOT NULL,
  prediction text CHECK (prediction IN ('team1', 'team2', 'draw')) NOT NULL,
  confidence integer CHECK (confidence BETWEEN 50 AND 100) DEFAULT 100,
  points integer DEFAULT 0,
  settled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (pool_id, match_id, user_id)
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users NOT NULL,
  message text NOT NULL,
  type text CHECK (type IN ('pool_invite', 'match_result', 'bet_result', 'badge_earned')) NOT NULL,
  read boolean DEFAULT false,
  related_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Everyone can read tournaments
CREATE POLICY "Public read access"
  ON tournaments
  FOR SELECT
  TO authenticated
  USING (true);

-- Everyone can read teams
CREATE POLICY "Public read access"
  ON teams
  FOR SELECT
  TO authenticated
  USING (true);

-- Everyone can read matches
CREATE POLICY "Public read access"
  ON matches
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can read all pools
CREATE POLICY "Users can read all pools"
  ON pools
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can create pools
CREATE POLICY "Users can create pools"
  ON pools
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

-- Pool admins can update their pools
CREATE POLICY "Admins can update pools"
  ON pools
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id);

-- Users can read pool members
CREATE POLICY "Users can read pool members"
  ON pool_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can join pools
CREATE POLICY "Users can join pools"
  ON pool_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read all predictions
CREATE POLICY "Users can read all predictions"
  ON predictions
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can create predictions
CREATE POLICY "Users can create predictions"
  ON predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their predictions
CREATE POLICY "Users can update predictions"
  ON predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND NOT settled);

-- Users can read their notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their notifications
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to calculate points
CREATE OR REPLACE FUNCTION calculate_prediction_points(
  prediction_id uuid
) RETURNS integer AS $$
DECLARE
  v_points integer;
  v_prediction predictions;
  v_match matches;
BEGIN
  -- Get prediction and match details
  SELECT * INTO v_prediction FROM predictions WHERE id = prediction_id;
  SELECT * INTO v_match FROM matches WHERE id = v_prediction.match_id;
  
  -- Only calculate points for completed matches
  IF v_match.status != 'completed' OR v_match.winner_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate points based on correct prediction
  IF (v_prediction.prediction = 'team1' AND v_match.winner_id = v_match.team1_id) OR
     (v_prediction.prediction = 'team2' AND v_match.winner_id = v_match.team2_id) OR
     (v_prediction.prediction = 'draw' AND v_match.winner_id IS NULL) THEN
    -- Base points (10) multiplied by confidence level
    v_points := ROUND(10 * (v_prediction.confidence::float / 100));
  ELSE
    v_points := 0;
  END IF;
  
  RETURN v_points;
END;
$$ LANGUAGE plpgsql;