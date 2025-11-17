/*
  # Fix User Interactions RLS Policy
  
  1. Changes
    - Update RLS policies for user_interactions table
    - Allow public inserts for non-authenticated users
    - Maintain data privacy for viewing
    
  2. Security
    - Enable RLS
    - Set up proper policies for both authenticated and anonymous users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users can view their own interactions" ON user_interactions;

-- Create new policies
CREATE POLICY "Allow public inserts"
  ON user_interactions
  FOR INSERT
  TO public
  WITH CHECK (
    user_id IS NULL OR
    auth.uid() = user_id
  );

CREATE POLICY "Users can view their own interactions"
  ON user_interactions
  FOR SELECT
  TO public
  USING (
    user_id IS NULL OR
    auth.uid() = user_id
  );

-- Ensure RLS is enabled
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;