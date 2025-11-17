/*
  # Add Invest in Africa Page
  
  1. Changes
    - Insert new page for investing in Africa
    - Set proper content sections
    - Enable public access
    
  2. Security
    - Maintain existing RLS policies
*/

INSERT INTO pages (title, slug, sections, settings, published)
SELECT 
  'Investir ou Entreprendre en Afrique',
  'investir-afrique',
  json_build_array(
    json_build_object(
      'id', gen_random_uuid(),
      'type', 'text',
      'content', '<h1 class="text-4xl font-bold text-center mb-6">Investissez dans l''avenir en Afrique</h1>',
      'settings', '{}'::jsonb
    ),
    json_build_object(
      'id', gen_random_uuid(),
      'type', 'text',
      'content', '<div class="max-w-3xl mx-auto"><p class="text-xl mb-8">Bonjour ! Je suis Djivédé, et je suis passionnée par le développement économique de notre continent. Fort de mon expérience et de ma connaissance du terrain, je vous propose un accompagnement personnalisé pour concrétiser vos projets au Bénin.</p></div>',
      'settings', '{}'::jsonb
    ),
    json_build_object(
      'id', gen_random_uuid(),
      'type', 'columns',
      'content', null,
      'settings', json_build_object(
        'columns', json_build_array(
          json_build_object(
            'title', 'Idées de business à fort potentiel',
            'content', '<ul class="space-y-4"><li>Découvrez des secteurs porteurs et des opportunités d''investissement adaptées à votre profil et à vos aspirations.</li><li>Bénéficiez de mon expertise pour identifier les niches de marché et les tendances émergentes en Afrique.</li></ul>'
          ),
          json_build_object(
            'title', 'Structuration et implantation de votre business',
            'content', '<ul class="space-y-4"><li>Je vous guide à chaque étape de votre projet, de l''étude de marché à la création de votre entreprise.</li><li>Profitez de mon réseau et de mes connaissances pour faciliter vos démarches administratives et juridiques au Benin.</li><li>Élaborez un business plan solide et adapté au contexte béninois.</li></ul>'
          ),
          json_build_object(
            'title', 'Investissements passifs et revenus complémentaires',
            'content', '<ul class="space-y-4"><li>Explorez des options d''investissement rentables et sécurisées pour diversifier vos revenus.</li><li>Bénéficiez de conseils personnalisés pour optimiser votre portefeuille et atteindre vos objectifs financiers.</li></ul>'
          )
        )
      )
    ),
    json_build_object(
      'id', gen_random_uuid(),
      'type', 'text',
      'content', '<div class="bg-coaching-primary/10 p-8 rounded-xl mt-12"><h2 class="text-2xl font-bold mb-4">Témoignages de réussite</h2><p class="text-lg">Découvrez les histoires d''entrepreneurs de la diaspora qui ont réussi leur implantation au Bénin grâce à mon accompagnement.</p></div>',
      'settings', '{}'::jsonb
    ),
    json_build_object(
      'id', gen_random_uuid(),
      'type', 'form',
      'content', null,
      'settings', json_build_object(
        'title', 'Contactez-moi pour une consultation personnalisée',
        'description', 'Découvrez comment je peux vous aider à réaliser vos projets.',
        'fields', json_build_array(
          json_build_object(
            'type', 'text',
            'label', 'Nom complet',
            'required', true
          ),
          json_build_object(
            'type', 'email',
            'label', 'Email',
            'required', true
          ),
          json_build_object(
            'type', 'tel',
            'label', 'Téléphone',
            'required', false
          ),
          json_build_object(
            'type', 'textarea',
            'label', 'Votre projet',
            'required', true
          )
        )
      )
    )
  ),
  '{"meta": {"title": "Investir ou Entreprendre en Afrique - DJIVÈDÉ", "description": "Découvrez des opportunités d''investissement au Bénin et bénéficiez d''un accompagnement personnalisé pour réussir vos projets en Afrique."}}'::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM pages WHERE slug = 'investir-afrique'
);

-- Add a section to the home page about investing in Africa
DO $$
DECLARE
  home_page_id uuid;
  home_sections jsonb;
BEGIN
  SELECT id, sections INTO home_page_id, home_sections
  FROM pages WHERE slug = 'accueil';
  
  IF home_sections IS NOT NULL THEN
    home_sections = home_sections || jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid(),
        'type', 'text',
        'content', '<div class="bg-gradient-to-r from-coaching-primary/10 to-coaching-secondary/10 p-12 rounded-2xl"><h2 class="text-3xl font-bold mb-4">Diaspora africaine, investissez dans votre avenir en Afrique !</h2><p class="text-xl mb-6">Vous rêvez de contribuer au développement de votre pays d''origine ? Djivédé vous offre un accompagnement personnalisé pour concrétiser vos projets au Bénin.</p><a href="/investir-afrique" class="inline-flex items-center px-6 py-3 bg-coaching-primary text-white rounded-full hover:bg-coaching-secondary transition-colors">En savoir plus</a></div>',
        'settings', '{}'::jsonb
      )
    );
    
    UPDATE pages 
    SET sections = home_sections
    WHERE id = home_page_id;
  END IF;
END $$;