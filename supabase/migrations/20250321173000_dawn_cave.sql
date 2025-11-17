/*
  # Fix Forms RLS Policies
  
  1. Changes
    - Add created_by column if missing
    - Drop and recreate policies with proper checks
    
  2. Security
    - Enable RLS
    - Set up proper ownership-based policies
*/

-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE forms ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for forms
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Forms are viewable by everyone" ON forms;
  DROP POLICY IF EXISTS "Users can view their own forms" ON forms;
  DROP POLICY IF EXISTS "Users can create forms" ON forms;
  DROP POLICY IF EXISTS "Users can update their own forms" ON forms;
  DROP POLICY IF EXISTS "Users can delete their own forms" ON forms;
END $$;

-- Create new policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'forms' 
    AND policyname = 'Users can view their own forms'
  ) THEN
    CREATE POLICY "Users can view their own forms"
      ON forms
      FOR SELECT
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'forms' 
    AND policyname = 'Users can create forms'
  ) THEN
    CREATE POLICY "Users can create forms"
      ON forms
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'forms' 
    AND policyname = 'Users can update their own forms'
  ) THEN
    CREATE POLICY "Users can update their own forms"
      ON forms
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'forms' 
    AND policyname = 'Users can delete their own forms'
  ) THEN
    CREATE POLICY "Users can delete their own forms"
      ON forms
      FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;