/*
  # Add Default Pages
  
  1. Changes
    - Insert default pages (Home, Story, Coaching, Music, Contact)
    - Set proper slugs and titles
    - Initialize with empty sections
    
  2. Security
    - Maintain existing RLS policies
*/

-- Insert default pages if they don't exist
INSERT INTO pages (title, slug, sections, settings, published)
SELECT 'Accueil', 'accueil', '[]'::jsonb, '{}'::jsonb, true
WHERE NOT EXISTS (
  SELECT 1 FROM pages WHERE slug = 'accueil'
);

INSERT INTO pages (title, slug, sections, settings, published)
SELECT 'Mon Histoire', 'story', '[]'::jsonb, '{}'::jsonb, true
WHERE NOT EXISTS (
  SELECT 1 FROM pages WHERE slug = 'story'
);

INSERT INTO pages (title, slug, sections, settings, published)
SELECT 'Coaching', 'coaching', '[]'::jsonb, '{}'::jsonb, true
WHERE NOT EXISTS (
  SELECT 1 FROM pages WHERE slug = 'coaching'
);

INSERT INTO pages (title, slug, sections, settings, published)
SELECT 'Ma Musique', 'music', '[]'::jsonb, '{}'::jsonb, true
WHERE NOT EXISTS (
  SELECT 1 FROM pages WHERE slug = 'music'
);

INSERT INTO pages (title, slug, sections, settings, published)
SELECT 'Contact', 'contact', '[]'::jsonb, '{}'::jsonb, true
WHERE NOT EXISTS (
  SELECT 1 FROM pages WHERE slug = 'contact'
);