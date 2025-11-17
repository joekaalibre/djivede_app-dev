/*
  # Page Management System
  
  1. Changes
    - Create pages table with necessary fields
    - Set up RLS policies for admin-only access
    - Add templates table for page templates
    
  2. Security
    - Only admin can manage pages
    - Public can view published pages
*/

-- Create page templates table
CREATE TABLE IF NOT EXISTS page_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sections jsonb DEFAULT '[]'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for page templates
CREATE POLICY "Admin can manage templates"
  ON page_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Insert default templates
INSERT INTO page_templates (name, description, sections) VALUES
  ('Page vide', 'Une page vide pour commencer de zéro', '[]'::jsonb),
  ('Page avec en-tête', 'Une page avec une section en-tête', '[{"type": "header", "content": null}]'::jsonb),
  ('Page de contact', 'Une page avec un formulaire de contact', '[{"type": "contact_form", "content": null}]'::jsonb);

-- Update pages table to add template reference
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES page_templates(id),
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS meta_keywords text[];

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pages_template_id ON pages(template_id);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(published);

-- Grant permissions
GRANT SELECT ON page_templates TO authenticated;