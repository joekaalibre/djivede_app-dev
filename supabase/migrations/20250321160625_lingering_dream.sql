/*
  # Add Forms and Marketing Tables
  
  1. New Tables
    - forms: Stores form templates
    - form_submissions: Stores form responses
    - marketing_messages: Stores AI-generated marketing messages
    - message_templates: Stores message templates
    
  2. Security
    - Enables RLS
    - Creates necessary policies
*/

-- Create forms table
CREATE TABLE IF NOT EXISTS public.forms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  fields jsonb NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id uuid REFERENCES public.forms(id) ON DELETE CASCADE,
  submitted_by uuid REFERENCES auth.users(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create marketing_messages table
CREATE TABLE IF NOT EXISTS public.marketing_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  target_audience text,
  campaign_id uuid REFERENCES public.marketing_campaigns(id),
  ai_generated boolean DEFAULT false,
  ai_prompt text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create message_templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  content text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  category text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Forms are viewable by everyone"
  ON public.forms FOR SELECT
  USING (true);

CREATE POLICY "Users can create forms"
  ON public.forms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own forms"
  ON public.forms FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view form submissions"
  ON public.form_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = form_submissions.form_id
      AND forms.created_by = auth.uid()
    )
    OR submitted_by = auth.uid()
  );

CREATE POLICY "Users can submit forms"
  ON public.form_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view marketing messages"
  ON public.marketing_messages FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create marketing messages"
  ON public.marketing_messages FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own marketing messages"
  ON public.marketing_messages FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view message templates"
  ON public.message_templates FOR SELECT
  USING (true);

CREATE POLICY "Users can create message templates"
  ON public.message_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own message templates"
  ON public.message_templates FOR UPDATE
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_forms_created_by ON public.forms(created_by);
CREATE INDEX idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX idx_marketing_messages_campaign_id ON public.marketing_messages(campaign_id);
CREATE INDEX idx_message_templates_category ON public.message_templates(category);