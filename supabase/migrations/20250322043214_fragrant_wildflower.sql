-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_campaign_analytics_campaign_id;
DROP INDEX IF EXISTS idx_campaign_submissions_user_id;
DROP INDEX IF EXISTS idx_campaign_submissions_status;
DROP INDEX IF EXISTS idx_campaign_alerts_type;

-- Campaign Submissions Table
CREATE TABLE IF NOT EXISTS campaign_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  form_data jsonb NOT NULL,
  analytics_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Campaign Analytics Table
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaign_submissions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Campaign Alerts Table
CREATE TABLE IF NOT EXISTS campaign_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  conditions jsonb NOT NULL,
  actions jsonb NOT NULL,
  active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE campaign_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own submissions"
  ON campaign_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all submissions"
  ON campaign_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Admin can update submissions"
  ON campaign_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Admin can view analytics"
  ON campaign_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Admin can manage alerts"
  ON campaign_alerts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Create new indexes with IF NOT EXISTS
CREATE INDEX IF NOT EXISTS campaign_submissions_user_id_idx ON campaign_submissions(user_id);
CREATE INDEX IF NOT EXISTS campaign_submissions_status_idx ON campaign_submissions(status);
CREATE INDEX IF NOT EXISTS campaign_analytics_campaign_id_idx ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_alerts_type_idx ON campaign_alerts(type);