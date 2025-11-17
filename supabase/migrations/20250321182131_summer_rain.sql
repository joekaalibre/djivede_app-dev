/*
  # Fix Forms RLS Policies
  
  1. Changes
    - Updates RLS policies for forms table
    - Ensures proper user access for CRUD operations
    - Fixes form duplication issue
    
  2. Security
    - Maintains proper authentication checks
    - Preserves data isolation between users
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own forms" ON forms;
DROP POLICY IF EXISTS "Users can create forms" ON forms;
DROP POLICY IF EXISTS "Users can update their own forms" ON forms;
DROP POLICY IF EXISTS "Users can delete their own forms" ON forms;
DROP POLICY IF EXISTS "Public forms are viewable by everyone" ON forms;

-- Create comprehensive policies
CREATE POLICY "Users can view their own forms"
  ON forms
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR
    published = true
  );

CREATE POLICY "Users can create forms"
  ON forms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by OR
    created_by IS NULL
  );

CREATE POLICY "Users can update their own forms"
  ON forms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own forms"
  ON forms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Update forms table to ensure created_by is set
CREATE OR REPLACE FUNCTION set_form_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_form_created_by_trigger ON forms;
CREATE TRIGGER set_form_created_by_trigger
  BEFORE INSERT ON forms
  FOR EACH ROW
  EXECUTE FUNCTION set_form_created_by();