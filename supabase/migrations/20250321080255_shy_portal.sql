/*
  # Schéma initial pour DJIVÈDÉ

  1. Nouvelles Tables
    - `services` : Services de coaching proposés
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `duration` (text)
      - `type` (text)
      - `created_at` (timestamp)
    
    - `service_features` : Caractéristiques des services
      - `id` (uuid, primary key)
      - `service_id` (uuid, foreign key)
      - `feature` (text)
      
    - `bookings` : Réservations de services
      - `id` (uuid, primary key)
      - `service_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `status` (text)
      - `date` (timestamp)
      - `created_at` (timestamp)
    
    - `albums` : Albums musicaux
      - `id` (uuid, primary key)
      - `title` (text)
      - `year` (text)
      - `cover_url` (text)
      - `created_at` (timestamp)
    
    - `tracks` : Pistes musicales
      - `id` (uuid, primary key)
      - `album_id` (uuid, foreign key)
      - `title` (text)
      - `duration` (text)
      - `audio_url` (text)
      - `created_at` (timestamp)
    
    - `events` : Événements
      - `id` (uuid, primary key)
      - `title` (text)
      - `date` (timestamp)
      - `location` (text)
      - `description` (text)
      - `image_url` (text)
      - `type` (text)
      - `created_at` (timestamp)
    
    - `testimonials` : Témoignages
      - `id` (uuid, primary key)
      - `content` (text)
      - `author` (text)
      - `role` (text)
      - `image_url` (text)
      - `type` (text)
      - `created_at` (timestamp)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques de lecture publique pour services, albums, tracks, events, testimonials
    - Politiques de lecture/écriture authentifiée pour bookings
*/

-- Services
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  duration text NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are viewable by everyone"
  ON services
  FOR SELECT
  TO public
  USING (true);

-- Service Features
CREATE TABLE service_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  feature text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service features are viewable by everyone"
  ON service_features
  FOR SELECT
  TO public
  USING (true);

-- Bookings
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Albums
CREATE TABLE albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  year text NOT NULL,
  cover_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Albums are viewable by everyone"
  ON albums
  FOR SELECT
  TO public
  USING (true);

-- Tracks
CREATE TABLE tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES albums(id) ON DELETE CASCADE,
  title text NOT NULL,
  duration text NOT NULL,
  audio_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tracks are viewable by everyone"
  ON tracks
  FOR SELECT
  TO public
  USING (true);

-- Events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date timestamptz NOT NULL,
  location text NOT NULL,
  description text,
  image_url text,
  type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON events
  FOR SELECT
  TO public
  USING (true);

-- Testimonials
CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author text NOT NULL,
  role text NOT NULL,
  image_url text NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are viewable by everyone"
  ON testimonials
  FOR SELECT
  TO public
  USING (true);

-- Insert initial data
INSERT INTO services (title, description, price, duration, type) VALUES
  ('Consultation Stratégique', 'Session personnalisée pour analyser votre projet et définir une stratégie adaptée', 150, '1h30', 'consultation'),
  ('Formation Leadership', 'Programme complet pour développer vos compétences de leader', 499, '4 semaines', 'course'),
  ('Coaching en ligne', 'Accompagnement à distance flexible et adapté à vos besoins', 89, '1h', 'online');

INSERT INTO service_features (service_id, feature)
SELECT id, unnest(ARRAY[
  'Analyse approfondie de votre situation',
  'Identification des opportunités',
  'Recommandations stratégiques',
  'Plan d''action détaillé'
])
FROM services
WHERE title = 'Consultation Stratégique';

INSERT INTO service_features (service_id, feature)
SELECT id, unnest(ARRAY[
  'Modules vidéo hebdomadaires',
  'Exercices pratiques',
  'Sessions de groupe',
  'Support personnalisé'
])
FROM services
WHERE title = 'Formation Leadership';

INSERT INTO service_features (service_id, feature)
SELECT id, unnest(ARRAY[
  'Session vidéo interactive',
  'Support par messagerie',
  'Ressources exclusives',
  'Suivi personnalisé'
])
FROM services
WHERE title = 'Coaching en ligne';

INSERT INTO albums (title, year, cover_url) VALUES
  ('Harmonie Africaine', '2024', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80');

INSERT INTO tracks (album_id, title, duration, audio_url)
SELECT id, unnest(ARRAY['L''Essence de la Vie', 'Rythmes d''Afrique']),
       unnest(ARRAY['4:32', '3:45']),
       unnest(ARRAY['https://example.com/track1.mp3', 'https://example.com/track2.mp3'])
FROM albums
WHERE title = 'Harmonie Africaine';

INSERT INTO events (title, date, location, description, image_url, type) VALUES
  ('Concert Live - Soul & Jazz', '2025-04-15 20:00:00+00', 'Le New Morning, Paris', 'Un voyage musical unique', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'music'),
  ('Workshop - Leadership Créatif', '2025-04-22 14:00:00+00', 'Espace Coworking, Lyon', 'Développez votre leadership', 'https://images.unsplash.com/photo-1558008258-3256797b43f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'coaching');

INSERT INTO testimonials (content, author, role, image_url, type) VALUES
  ('Le coaching de DJIVÈDÉ m''a permis de transformer complètement ma carrière. Ses conseils stratégiques sont inestimables.', 'Sophie M.', 'Entrepreneure', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', 'coaching'),
  ('Sa musique est inspirante et sa présence sur scène est captivante. Un véritable talent qui mérite d''être découvert.', 'Thomas L.', 'Producteur musical', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', 'music'),
  ('J''ai participé à un atelier de coaching et cela a complètement changé ma vision de mon entreprise. Approche inspirante et concrète.', 'Marie F.', 'Artiste-entrepreneure', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', 'coaching');