/*
  # Fix RLS Policies for Users and Pages
  
  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions
    - Grant necessary access rights
    
  2. Security
    - Allow public read access to users table
    - Allow admin access to pages table
    - Maintain proper data protection
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Public users are viewable" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Admin can manage pages" ON pages;
DROP POLICY IF EXISTS "Admin can insert pages" ON pages;
DROP POLICY IF EXISTS "Admin can update pages" ON pages;
DROP POLICY IF EXISTS "Admin can delete pages" ON pages;

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