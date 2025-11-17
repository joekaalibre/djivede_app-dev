/*
  # Add Events and Campaign Pages
  
  1. Changes
    - Insert events and campaign pages
    - Set proper slugs and titles
    - Initialize with empty sections
    
  2. Security
    - Maintain existing RLS policies
*/

-- Insert events and campaign pages if they don't exist
INSERT INTO pages (title, slug, sections, settings, published)
SELECT 'Événements', 'events', '[]'::jsonb, '{}'::jsonb, true
WHERE NOT EXISTS (
  SELECT 1 FROM pages WHERE slug = 'events'
);

INSERT INTO pages (title, slug, sections, settings, published)
SELECT 'Campagne', 'campaign', '[]'::jsonb, '{}'::jsonb, true
WHERE NOT EXISTS (
  SELECT 1 FROM pages WHERE slug = 'campaign'
);