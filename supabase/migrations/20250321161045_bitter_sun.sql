/*
  # Add Content Management Tables
  
  1. New Tables
    - content_blocks: Stores editable content sections
    - content_revisions: Stores content history
    - content_media: Stores media assets
    
  2. Security
    - Enables RLS
    - Creates necessary policies
*/

-- Create content_blocks table
CREATE TABLE IF NOT EXISTS public.content_blocks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier text NOT NULL UNIQUE,
  title text NOT NULL,
  content jsonb NOT NULL,
  type text NOT NULL,
  page text NOT NULL,
  section text NOT NULL,
  published boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create content_revisions table
CREATE TABLE IF NOT EXISTS public.content_revisions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id uuid REFERENCES public.content_blocks(id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create content_media table
CREATE TABLE IF NOT EXISTS public.content_media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename text NOT NULL,
  url text NOT NULL,
  type text NOT NULL,
  size integer NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_media ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Content blocks are viewable by everyone"
  ON public.content_blocks FOR SELECT
  USING (true);

CREATE POLICY "Only admin can create content blocks"
  ON public.content_blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Only admin can update content blocks"
  ON public.content_blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Content revisions are viewable by admin"
  ON public.content_revisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Only admin can create content revisions"
  ON public.content_revisions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Content media is viewable by everyone"
  ON public.content_media FOR SELECT
  USING (true);

CREATE POLICY "Only admin can upload media"
  ON public.content_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Create indexes
CREATE INDEX idx_content_blocks_page ON public.content_blocks(page);
CREATE INDEX idx_content_blocks_section ON public.content_blocks(section);
CREATE INDEX idx_content_revisions_block_id ON public.content_revisions(block_id);
CREATE INDEX idx_content_media_type ON public.content_media(type);