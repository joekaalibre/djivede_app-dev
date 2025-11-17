/*
  # Fix Admin Role for Jose
  
  1. Changes
    - Updates jose@djivede.com to have super admin role
    - Sets is_super_admin to true
    - Ensures proper admin access
    
  2. Security
    - Maintains existing RLS policies
*/

-- Update jose@djivede.com to be a super admin
UPDATE auth.users
SET 
  is_super_admin = true,
  role = 'admin',
  raw_app_meta_data = raw_app_meta_data || 
    jsonb_build_object(
      'is_admin', true,
      'role', 'admin'
    )
WHERE email = 'jose@djivede.com';

-- Update the public.users table as well if it exists
UPDATE public.users
SET 
  is_super_admin = true,
  role = 'admin'
WHERE email = 'jose@djivede.com';