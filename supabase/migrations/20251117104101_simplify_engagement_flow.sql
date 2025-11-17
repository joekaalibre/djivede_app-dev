/*
  # Simplification du flux d'engagement

  1. Modifications
    - Rendre contract_url et contract_sent nullable (gestion manuelle)
    - Ajouter engagement_amount pour clarté
    - Simplifier le statut (en_attente, validé, rejeté)

  2. Notes
    - Les contrats seront gérés manuellement par les admins
    - Un engagement est créé automatiquement après validation paiement
*/

-- Rendre contract_url nullable
ALTER TABLE invest_engagements 
ALTER COLUMN contract_url DROP NOT NULL;

-- Rendre contract_sent nullable par défaut false
ALTER TABLE invest_engagements 
ALTER COLUMN contract_sent SET DEFAULT false;

-- Ajouter engagement_amount si pas déjà présent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invest_engagements' AND column_name = 'engagement_amount'
  ) THEN
    ALTER TABLE invest_engagements ADD COLUMN engagement_amount numeric;
    UPDATE invest_engagements SET engagement_amount = amount WHERE engagement_amount IS NULL;
  END IF;
END $$;

-- Créer index pour performance
CREATE INDEX IF NOT EXISTS idx_invest_engagements_user_id ON invest_engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_invest_engagements_project_id ON invest_engagements(project_id);
CREATE INDEX IF NOT EXISTS idx_invest_engagements_status ON invest_engagements(status);

-- Index pour project_updates
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_created_at ON project_updates(created_at DESC);