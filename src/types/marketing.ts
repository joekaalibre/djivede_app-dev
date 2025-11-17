export interface UserInteraction {
  id: string;
  user_id: string;
  page_url: string;
  interaction_type: string;
  interaction_data: Record<string, any>;
  session_id: string;
  created_at: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  trigger_conditions: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomatedMessage {
  id: string;
  campaign_id: string;
  subject: string;
  content: string;
  message_type: string;
  delay_minutes: number;
  conditions: Record<string, any>;
  created_at: string;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  segment_rules: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  message_id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  created_at: string;
}