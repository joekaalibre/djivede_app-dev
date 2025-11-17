/*
  # Fix RLS Policies for Users and Pages
  
  1. Changes
    - Drop existing conflicting policies
    - Create proper RLS policies for users and pages tables
    - Grant necessary permissions
    
  2. Security
    - Ensure proper access control
    - Fix permission denied errors
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Admin can manage pages" ON pages;

-- Create policies for users table
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

-- Create policies for pages table
CREATE POLICY "Pages are viewable by everyone"
  ON pages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can manage pages"
  ON pages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Grant necessary permissions
GRANT SELECT ON users TO public;
GRANT SELECT, UPDATE ON users TO authenticated;
GRANT SELECT ON pages TO public;
GRANT ALL ON pages TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;