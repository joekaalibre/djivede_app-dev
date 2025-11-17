/*
  # Suppression de la FK en double sur invest_subscribers
  
  1. Problème
    - Deux FK vers invest_projects causent une ambiguïté
    - fk_invest_subscribers_project (à garder)
    - fk_subscriber_project (doublon à supprimer)
*/

-- Supprimer la FK en double
ALTER TABLE invest_subscribers 
DROP CONSTRAINT IF EXISTS fk_subscriber_project;