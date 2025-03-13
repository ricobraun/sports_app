/*
  # Add Tournament Categories and Organization

  1. Changes
    - Add tournament_type to tournaments table
    - Add region field to tournaments table
    - Add series_type for bilateral matches
    - Update format constraints
    
  2. Data Organization
    - Properly categorize existing tournaments
    - Add support for all cricket formats
    - Enable regional filtering
*/

-- Add new fields to tournaments table
DO $$ 
BEGIN
  -- Add tournament_type if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'tournament_type'
  ) THEN
    ALTER TABLE tournaments 
    ADD COLUMN tournament_type text CHECK (
      tournament_type = ANY (ARRAY[
        'league',      -- For domestic leagues like IPL, PSL, BBL
        'international', -- For international tournaments like World Cup
        'bilateral'    -- For bilateral series
      ])
    );
  END IF;

  -- Add region if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'region'
  ) THEN
    ALTER TABLE tournaments 
    ADD COLUMN region text CHECK (
      region = ANY (ARRAY[
        'global',
        'asia',
        'europe',
        'oceania',
        'africa',
        'americas'
      ])
    );
  END IF;

  -- Add series_type if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'series_type'
  ) THEN
    ALTER TABLE tournaments 
    ADD COLUMN series_type text CHECK (
      series_type = ANY (ARRAY[
        'multi_team',  -- For tournaments with 3+ teams
        'bilateral',   -- For two-team series
        'tri_series'  -- For three-team series
      ])
    );
  END IF;

  -- Update format constraint to include all formats
  ALTER TABLE tournaments
  DROP CONSTRAINT IF EXISTS tournaments_format_check;
  
  ALTER TABLE tournaments
  ADD CONSTRAINT tournaments_format_check 
  CHECK (format = ANY (ARRAY[
    'T20',
    'ODI',
    'Test',
    'T10',
    'First Class',
    'List A'
  ]));
END $$;