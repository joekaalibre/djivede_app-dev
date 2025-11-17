/*
  # Marketing Automation System

  1. New Tables
    - `user_interactions`
      - Tracks user behavior and interactions
      - Stores engagement metrics and page views
    - `marketing_campaigns`
      - Stores campaign configurations
      - Manages automation rules and triggers
    - `automated_messages`
      - Stores message templates
      - Tracks message delivery and performance
    - `user_segments`
      - Defines user segments based on behavior
      - Manages targeting rules
    - `campaign_analytics`
      - Tracks campaign performance metrics
      - Stores A/B testing results

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated access
*/

-- User Interactions Table
CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  page_url text NOT NULL,
  interaction_type text NOT NULL,
  interaction_data jsonb DEFAULT '{}',
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own interactions"
  ON user_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions"
  ON user_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Marketing Campaigns Table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_conditions jsonb NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing campaigns are viewable by everyone"
  ON marketing_campaigns
  FOR SELECT
  TO authenticated
  USING (true);

-- Automated Messages Table
CREATE TABLE IF NOT EXISTS automated_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  subject text NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL,
  delay_minutes integer DEFAULT 0,
  conditions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE automated_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Automated messages are viewable by everyone"
  ON automated_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- User Segments Table
CREATE TABLE IF NOT EXISTS user_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  segment_rules jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User segments are viewable by everyone"
  ON user_segments
  FOR SELECT
  TO authenticated
  USING (true);

-- Campaign Analytics Table
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  message_id uuid REFERENCES automated_messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON campaign_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_automated_messages_campaign_id ON automated_messages(campaign_id);