/*
  # Ajout de la publication des formulaires
  
  1. Changements
    - Ajoute le champ published à la table forms
    - Ajoute le champ public_url pour les formulaires publiés
    - Met à jour les politiques de sécurité pour les formulaires publiés
    
  2. Sécurité
    - Permet l'accès public aux formulaires publiés
    - Maintient la sécurité des formulaires non publiés
*/

-- Ajouter les colonnes published et public_url
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS public_url text UNIQUE;

-- Créer un index sur published pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_forms_published ON forms(published);

-- Mettre à jour les politiques
CREATE POLICY "Public forms are viewable by everyone"
  ON forms
  FOR SELECT
  TO public
  USING (published = true);

-- Fonction pour générer une URL publique unique
CREATE OR REPLACE FUNCTION generate_public_url()
RETURNS trigger AS $$
BEGIN
  IF NEW.published = true AND NEW.public_url IS NULL THEN
    NEW.public_url = 'form_' || encode(gen_random_bytes(8), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement l'URL publique
CREATE TRIGGER generate_form_public_url
  BEFORE INSERT OR UPDATE ON forms
  FOR EACH ROW
  EXECUTE FUNCTION generate_public_url();