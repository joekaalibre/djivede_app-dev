/*
  # Fix User Interactions Table Permissions
  
  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions
    - Allow public access for non-authenticated users
    
  2. Security
    - Enable RLS
    - Allow anonymous interactions
    - Maintain data privacy
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users can view their own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Allow public inserts" ON user_interactions;

-- Create new policies
CREATE POLICY "Allow all inserts"
  ON user_interactions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow viewing own interactions"
  ON user_interactions
  FOR SELECT
  TO public
  USING (
    user_id IS NULL OR
    auth.uid() = user_id
  );

-- Ensure RLS is enabled
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT ON user_interactions TO public;
GRANT SELECT, INSERT ON user_interactions TO anon;
GRANT SELECT, INSERT ON user_interactions TO authenticated;