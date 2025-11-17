/*
  # Add Chatbot Tables
  
  1. New Tables
    - chat_messages: Stores all chat messages
    - chat_sessions: Tracks chat sessions
    - chat_analytics: Stores analytics data
    
  2. Security
    - Enables RLS
    - Creates necessary policies
*/

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  session_data jsonb DEFAULT '{}'::jsonb
);

-- Create chat_analytics table
CREATE TABLE IF NOT EXISTS public.chat_analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES public.chat_sessions(id),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (
    user_id IS NULL OR
    auth.uid() = user_id
  );

CREATE POLICY "Users can insert their own chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    user_id IS NULL OR
    auth.uid() = user_id
  );

CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions
  FOR SELECT
  USING (
    user_id IS NULL OR
    auth.uid() = user_id
  );

CREATE POLICY "Users can insert their own chat sessions"
  ON public.chat_sessions
  FOR INSERT
  WITH CHECK (
    user_id IS NULL OR
    auth.uid() = user_id
  );

-- Create indexes
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_analytics_session_id ON public.chat_analytics(session_id);