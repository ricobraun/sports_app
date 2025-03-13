/*
  # Add Featured Flag to Tournaments

  1. Schema Changes
    - Add is_featured column to tournaments table
    - Update existing 2025 tournaments to be featured

  2. Data Changes
    - Mark IPL 2025, PSL 2025, T20 Blast 2025, CPL 2025, and BBL 2025-26 as featured tournaments
*/

-- Add is_featured column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- Mark 2025 tournaments as featured
UPDATE tournaments 
SET is_featured = true 
WHERE id IN (2025001, 2025002, 2025003, 2025004, 2025005);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for reading featured status
CREATE POLICY "Anyone can read tournament featured status" ON tournaments
  FOR SELECT
  USING (true);

-- Add RLS policy for updating featured status (admin only)
CREATE POLICY "Only admins can update tournament featured status" ON tournaments
  FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));