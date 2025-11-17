/*
  # Fix Pages RLS Policies
  
  1. Changes
    - Drop existing policies
    - Create new policies with proper checks
    - Add WITH CHECK clauses for INSERT/UPDATE
    
  2. Security
    - Maintain proper admin access
    - Fix duplication permissions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Admin can manage pages" ON pages;

-- Create new policies with proper checks
CREATE POLICY "Pages are viewable by everyone"
  ON pages
  FOR SELECT
  TO public
  USING (
    published = true OR 
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Admin can insert pages"
  ON pages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Admin can update pages"
  ON pages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Admin can delete pages"
  ON pages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Ensure RLS is enabled
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;