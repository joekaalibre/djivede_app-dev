/*
  # Fix RLS Policies for Users and Pages Tables
  
  1. Changes
    - Add proper RLS policies for users table
    - Fix pages table policies
    - Ensure admin access to all tables
    
  2. Security
    - Maintain proper authentication checks
    - Allow public access where needed
    - Ensure admin privileges
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Public users are viewable" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Admin can manage pages" ON pages;

-- Create new policies for users table
CREATE POLICY "Public users are viewable"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own record"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create new policies for pages table
CREATE POLICY "Pages are viewable by everyone"
  ON pages
  FOR SELECT
  TO public
  USING (
    published = true OR 
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Admin can manage pages"
  ON pages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON pages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;