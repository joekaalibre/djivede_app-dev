/*
  # Basic Authentication Setup
  
  1. Setup
    - Creates basic auth tables
    - Sets up minimal required structure
    
  2. Security
    - Enables RLS
    - Sets up basic auth policies
*/

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create basic auth table
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
  role text DEFAULT 'authenticated'
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public users are viewable" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (
    auth.uid() = id
  );

-- Create default admin user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@djivede.com') THEN
    INSERT INTO public.users (
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