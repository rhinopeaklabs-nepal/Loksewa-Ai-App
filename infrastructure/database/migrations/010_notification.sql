-- =====================================================
-- Loksewa AI — NOTIFICATION SERVICE SCHEMA
-- =====================================================
-- Push notifications, in-app, email queue

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,                -- streak_warning, mission_ready, badge_unlocked, leaderboard_change, ai_response, system
  category TEXT,                     -- engagement, transaction, content
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  title TEXT NOT NULL,
  title_ne TEXT,
  body TEXT NOT NULL,
  body_ne TEXT,
  image_url TEXT,
  data JSONB DEFAULT '{}'::jsonb,    -- {action_url, deep_link, conversation_id, etc.}
  channels TEXT[] NOT NULL DEFAULT '{in_app}'::text[],  -- {in_app, push, email, sms}
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_at) WHERE sent_at IS NULL AND failed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type, created_at DESC);

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id TEXT PRIMARY KEY,               -- e.g., "streak.warning", "mission.ready"
  name TEXT NOT NULL,
  description TEXT,
  title_template TEXT NOT NULL,
  title_template_ne TEXT,
  body_template TEXT NOT NULL,
  body_template_ne TEXT,
  default_channels TEXT[] NOT NULL DEFAULT '{in_app}'::text[],
  default_priority TEXT NOT NULL DEFAULT 'normal',
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification preferences (per user, can override defaults)
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  category_preferences JSONB DEFAULT '{}'::jsonb,  -- {"streak": false, "mission": true}
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email queue
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email TEXT NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  template_id TEXT,
  template_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'bounced')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, created_at) WHERE status IN ('pending', 'failed');

-- SMS queue
CREATE TABLE IF NOT EXISTS sms_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_phone TEXT NOT NULL,
  body TEXT NOT NULL,
  template_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'delivered')),
  attempts INT NOT NULL DEFAULT 0,
  provider TEXT,                     -- espark, ncell, smart
  provider_message_id TEXT,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_queue_status ON sms_queue(status, created_at) WHERE status IN ('pending', 'failed');
