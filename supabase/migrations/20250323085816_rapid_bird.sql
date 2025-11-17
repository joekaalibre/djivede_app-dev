/*
  # Fix Admin Dashboard Access
  
  1. Changes
    - Updates user roles and permissions
    - Ensures proper admin access
    - Fixes dashboard visibility
    
  2. Security
    - Maintains proper authentication
    - Updates necessary user metadata
*/

-- Update jose@djivede.com to be a super admin with proper metadata
UPDATE auth.users
SET 
  is_super_admin = true,
  role = 'admin',
  raw_app_meta_data = 
    CASE 
      WHEN raw_app_meta_data IS NULL THEN 
        jsonb_build_object(
          'is_super_admin', true,
          'role', 'admin'
        )
      ELSE 
        raw_app_meta_data || 
        jsonb_build_object(
          'is_super_admin', true,
          'role', 'admin'
        )
    END,
  raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object(
          'is_admin', true
        )
      ELSE 
        raw_user_meta_data || 
        jsonb_build_object(
          'is_admin', true
        )
    END
WHERE email = 'jose@djivede.com';

-- Ensure the public.users table is updated as well
UPDATE public.users
SET 
  is_super_admin = true,
  role = 'admin'
WHERE email = 'jose@djivede.com';