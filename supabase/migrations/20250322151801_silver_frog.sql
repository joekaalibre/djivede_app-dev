/*
  # Add Investment Section to Home Page
  
  1. Changes
    - Updates the home page sections to include investment section
    - Adds a prominent call-to-action for African diaspora
    
  2. Security
    - Maintains existing RLS policies
*/

DO $$
DECLARE
  home_page_id uuid;
  home_sections jsonb;
BEGIN
  SELECT id, sections INTO home_page_id, home_sections
  FROM pages WHERE slug = 'accueil';
  
  IF home_sections IS NOT NULL THEN
    -- Add new investment section
    home_sections = home_sections || jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid(),
        'type', 'text',
        'content', '<div class="bg-gradient-to-br from-coaching-primary/10 to-coaching-secondary/10 p-12 rounded-2xl my-16"><div class="max-w-4xl mx-auto"><h2 class="text-3xl md:text-4xl font-bold mb-6">Diaspora africaine, investissez dans votre avenir !</h2><p class="text-xl mb-8">Vous rêvez de contribuer au développement de votre pays d''origine ? Djivédé vous offre un accompagnement personnalisé pour concrétiser vos projets au Bénin.</p><div class="flex flex-wrap gap-4"><a href="/investir-afrique" class="inline-flex items-center px-8 py-4 bg-coaching-primary text-white rounded-full hover:bg-coaching-secondary transition-colors">Découvrir les opportunités</a><a href="/contact" class="inline-flex items-center px-8 py-4 border-2 border-coaching-primary text-coaching-primary rounded-full hover:bg-coaching-primary hover:text-white transition-colors">Me contacter</a></div></div></div>',
        'settings', '{}'::jsonb
      )
    );
    
    -- Update the home page with new sections
    UPDATE pages 
    SET 
      sections = home_sections,
      updated_at = now()
    WHERE id = home_page_id;
  END IF;
END $$;