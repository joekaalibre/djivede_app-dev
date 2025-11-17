/*
  # Correction de la foreign key invest_module_parts

  1. Problème
    - La FK pointe vers users(id) au lieu de auth.users
    - Les profiles utilisent auth.users
    
  2. Solution
    - Supprimer l'ancienne FK vers users
    - Ajouter FK vers profiles (qui est lié à auth.users)
*/

-- Supprimer l'ancienne contrainte
ALTER TABLE invest_module_parts 
DROP CONSTRAINT IF EXISTS invest_module_parts_user_id_fkey;

-- Ajouter la bonne contrainte vers profiles
ALTER TABLE invest_module_parts
ADD CONSTRAINT invest_module_parts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;