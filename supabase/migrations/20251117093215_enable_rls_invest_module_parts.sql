/*
  # Activation RLS sur invest_module_parts

  1. Sécurité
    - Active RLS sur invest_module_parts
    - Ajoute policies pour que les investisseurs ne voient que leurs propres parts
    - Ajoute policies admin pour gestion complète

  2. Policies
    - SELECT : investisseurs voient leurs parts, admins voient tout
    - INSERT : seulement par fonctions système (allocate_modules)
    - UPDATE : aucun (immutable après création)
    - DELETE : aucun (conservation historique)
*/

-- Activer RLS
ALTER TABLE invest_module_parts ENABLE ROW LEVEL SECURITY;

-- Policy SELECT pour investisseurs (voir leurs propres parts)
CREATE POLICY "Investors can view own module parts"
  ON invest_module_parts
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy INSERT réservée aux fonctions système (via service_role)
CREATE POLICY "System can insert module parts"
  ON invest_module_parts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Aucune policy UPDATE/DELETE = immutable après création