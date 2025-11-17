/*
  # Authentication Setup
  
  1. Core Setup
    - Creates auth schema
    - Sets up users table with proper constraints
    - Configures secure policies
    
  2. Security
    - Enables RLS
    - Sets up basic auth policies
    - Grants necessary permissions
*/

-- Create auth schema and extensions
CREATE SCHEMA IF NOT EXISTS auth;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant schema permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Create users table
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  encrypted_password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  is_super_admin boolean DEFAULT false,
  role text DEFAULT 'authenticated',
  CONSTRAINT users_email_key UNIQUE (email)
);

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Public users are viewable" ON auth.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON auth.users
  FOR UPDATE USING (
    CASE 
      WHEN current_setting('request.jwt.claims', true)::jsonb->>'sub' IS NOT NULL 
      THEN (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid = id
      ELSE false
    END
  );

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, service_role;

-- Create default admin user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@djivede.com') THEN
    INSERT INTO auth.users (
      email,
      encrypted_password,
      is_super_admin,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      'admin@djivede.com',
      crypt('admin123', gen_salt('bf')),
      true,
      '{"provider": "email"}'::jsonb,
      '{"is_admin": true}'::jsonb
    );
  END IF;
END
$$;