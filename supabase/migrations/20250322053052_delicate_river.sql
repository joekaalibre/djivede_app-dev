/*
  # Fix Page Templates Permissions
  
  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions
    - Grant necessary permissions to authenticated users
    
  2. Security
    - Allow public read access to templates
    - Restrict management to admin users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage templates" ON page_templates;

-- Create new policies
CREATE POLICY "Templates are viewable by everyone"
  ON page_templates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can manage templates"
  ON page_templates
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
GRANT SELECT ON page_templates TO public;
GRANT ALL ON page_templates TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;