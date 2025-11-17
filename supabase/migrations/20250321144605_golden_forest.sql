/*
  # Authentication Schema Setup
  
  1. Core Setup
    - Creates auth schema and required extensions
    - Sets up users and auth tables with proper constraints
    
  2. Security
    - Enables RLS
    - Sets up auth policies if they don't exist
    - Grants necessary permissions
*/

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant schema permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Create auth.users table
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id uuid,
  email text,
  encrypted_password text,
  email_confirmed_at timestamptz,
  invited_at timestamptz,
  confirmation_token text,
  confirmation_sent_at timestamptz,
  recovery_token text,
  recovery_sent_at timestamptz,
  email_change_token text,
  email_change text,
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  is_super_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  phone text,
  phone_confirmed_at timestamptz,
  phone_change text,
  phone_change_token text,
  phone_change_sent_at timestamptz,
  email_change_confirm_status smallint DEFAULT 0,
  banned_until timestamptz,
  reauthentication_token text,
  reauthentication_sent_at timestamptz,
  is_sso_user boolean DEFAULT false,
  deleted_at timestamptz,
  role text DEFAULT 'authenticated',
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_phone_key UNIQUE (phone)
);

-- Create auth.refresh_tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  id bigserial PRIMARY KEY,
  token text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revoked boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  parent text
);

-- Create auth.audit_log_entries table
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  payload json,
  created_at timestamptz DEFAULT now(),
  ip_address text DEFAULT '',
  CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id)
);

-- Create auth.instances table
CREATE TABLE IF NOT EXISTS auth.instances (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  uuid uuid,
  raw_base_config text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT instances_pkey PRIMARY KEY (id),
  CONSTRAINT instances_uuid_key UNIQUE (uuid)
);

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'auth' 
    AND tablename = 'users' 
    AND policyname = 'Public users are viewable'
  ) THEN
    CREATE POLICY "Public users are viewable" ON auth.users
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'auth' 
    AND tablename = 'users' 
    AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data" ON auth.users
      FOR UPDATE USING (
        CASE 
          WHEN current_setting('request.jwt.claims', true)::jsonb->>'sub' IS NOT NULL 
          THEN (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid = id
          ELSE false
        END
      );
  END IF;
END
$$;

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
      email_confirmed_at,
      is_super_admin,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      'admin@djivede.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      true,
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"is_admin": true}'::jsonb
    );
  END IF;
END
$$;