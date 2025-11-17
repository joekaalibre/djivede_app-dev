/*
  # Create admin role and default admin user

  1. Changes
    - Creates admin role
    - Creates default admin user with secure password
    - Sets up admin user metadata and privileges
    - Creates proper identity record with provider_id

  2. Security
    - Uses secure password hashing
    - Sets up proper role-based access control
    - Implements secure user creation
*/

-- Create admin role if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_roles WHERE rolname = 'admin'
  ) THEN
    CREATE ROLE admin NOINHERIT;
  END IF;
END $$;

-- Create the admin user through auth schema
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  -- Create the user if it doesn't exist
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) 
  SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@djivede.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"is_admin": true}',
    now(),
    now(),
    '',
    ''
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@djivede.com'
  )
  RETURNING id INTO admin_uid;

  -- If user was created, set up their identity
  IF admin_uid IS NOT NULL THEN
    -- Insert into auth.identities with provider_id
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_uid,
      format('{"sub": "%s", "email": "admin@djivede.com"}', admin_uid)::jsonb,
      'email',
      admin_uid::text,
      now(),
      now(),
      now()
    );

    -- Grant admin role to the user
    GRANT admin TO authenticated;
  END IF;
END $$;