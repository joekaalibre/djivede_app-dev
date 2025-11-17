/*
  # Fix Users RLS Policies
  
  1. Changes
    - Drop existing policies
    - Create new policies with proper checks
    - Add proper permissions for authenticated users
    
  2. Security
    - Allow public read access to users table
    - Maintain proper user data protection
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public users are viewable" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;

-- Create new policies
CREATE POLICY "Users are viewable by everyone"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT ON users TO public;
GRANT SELECT, UPDATE ON users TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;