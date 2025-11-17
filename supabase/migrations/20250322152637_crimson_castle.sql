/*
  # Fix Investment Section on Home Page
  
  1. Changes
    - Ensures proper section structure
    - Updates existing home page content
    - Maintains proper ordering
    
  2. Security
    - Maintains existing RLS policies
*/

-- First, let's get the current home page content
DO $$
DECLARE
  home_page_id uuid;
  current_sections jsonb;
BEGIN
  -- Get the home page ID and current sections
  SELECT id, COALESCE(sections, '[]'::jsonb) 
  INTO home_page_id, current_sections
  FROM pages 
  WHERE slug = 'accueil';

  IF home_page_id IS NOT NULL THEN
    -- Create the investment section
    current_sections = current_sections || jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid(),
        'type', 'text',
        'content', '<section class="py-16 px-4 bg-gradient-to-br from-coaching-primary/5 to-coaching-secondary/5"><div class="max-w-7xl mx-auto"><div class="bg-white rounded-2xl shadow-lg overflow-hidden"><div class="p-12"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-coaching-primary to-coaching-secondary bg-clip-text text-transparent">Diaspora africaine, investissez dans votre avenir !</h2><p class="text-xl mb-8 text-gray-700">Vous rêvez de contribuer au développement de votre pays d''origine ? Djivédé vous offre un accompagnement personnalisé pour concrétiser vos projets au Bénin.</p><div class="flex flex-wrap justify-center gap-4"><a href="/investir-afrique" class="inline-flex items-center px-8 py-4 bg-coaching-primary text-white rounded-full hover:bg-coaching-secondary transition-colors">Découvrir les opportunités</a><a href="/contact" class="inline-flex items-center px-8 py-4 border-2 border-coaching-primary text-coaching-primary rounded-full hover:bg-coaching-primary hover:text-white transition-colors">Me contacter</a></div></div></div></div></div></section>',
        'settings', jsonb_build_object(
          'position', 'after_hero',
          'background', 'gradient',
          'spacing', 'large'
        )
      )
    );

    -- Update the home page with the new sections
    UPDATE pages 
    SET 
      sections = current_sections,
      updated_at = now()
    WHERE id = home_page_id;
  END IF;
END $$;