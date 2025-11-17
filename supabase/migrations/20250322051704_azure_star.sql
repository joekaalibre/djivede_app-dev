/*
  # Fix Page Management Policies
  
  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions
    - Grant necessary access rights
    
  2. Security
    - Allow public read access to pages
    - Allow admin to manage pages
    - Maintain proper data protection
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Admin can manage pages" ON pages;

-- Create new policies
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
GRANT SELECT ON pages TO public;
GRANT ALL ON pages TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;