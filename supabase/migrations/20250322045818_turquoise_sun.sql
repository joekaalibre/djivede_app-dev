-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  sections jsonb DEFAULT '[]'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Pages are viewable by everyone"
  ON pages
  FOR SELECT
  USING (published = true OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
    AND users.is_super_admin = true
  ));

CREATE POLICY "Admin can manage pages"
  ON pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Create indexes
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(published);