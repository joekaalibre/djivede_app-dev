/*
  # Authentication Tables Setup
  
  1. Tables
    - Creates users table with all required fields
    - Creates refresh_tokens table
    - Sets up proper constraints and defaults
    
  2. Security
    - Enables RLS
    - Creates necessary policies
    - Sets up proper permissions
*/

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  is_super_admin boolean DEFAULT false,
  role text DEFAULT 'authenticated'::text
);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  id bigserial PRIMARY KEY,
  token text UNIQUE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  revoked boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users are viewable by everyone'
  ) THEN
    CREATE POLICY "Users are viewable by everyone" ON public.users
      FOR SELECT USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can update own record'
  ) THEN
    CREATE POLICY "Users can update own record" ON public.users
      FOR UPDATE USING (
        auth.uid() = id
      );
  END IF;
END
$$;

-- Create initial admin user
INSERT INTO public.users (
  email,
  encrypted_password,
  is_super_admin,
  raw_app_meta_data,
  raw_user_meta_data,
  last_sign_in_at
) VALUES (
  'admin@djivede.com',
  crypt('admin123', gen_salt('bf')),
  true,
  '{"provider": "email"}'::jsonb,
  '{"is_admin": true}'::jsonb,
  now()
) ON CONFLICT (email) DO NOTHING;