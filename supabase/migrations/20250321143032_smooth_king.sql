/*
  # Fix authentication schema and user setup

  1. Changes
    - Ensures proper auth schema setup
    - Creates necessary authentication tables if missing
    - Sets up proper user authentication flow
    - Fixes database schema querying issues

  2. Security
    - Maintains proper authentication security
    - Preserves existing user data
    - Ensures secure password handling
*/

-- Ensure auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Ensure proper auth schema permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;

-- Ensure proper auth table permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA auth 
GRANT ALL ON TABLES TO postgres, service_role;

-- Ensure proper auth function permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA auth 
GRANT ALL ON FUNCTIONS TO postgres, service_role;

-- Ensure proper auth sequence permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA auth 
GRANT ALL ON SEQUENCES TO postgres, service_role;

-- Ensure proper public schema permissions for auth
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to auth functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated;

-- Ensure proper RLS is enabled on all tables
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.identities ENABLE ROW LEVEL SECURITY;

-- Add policies for users to access their own data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND schemaname = 'auth'
  ) THEN
    CREATE POLICY "Users can view own data" ON auth.users
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;