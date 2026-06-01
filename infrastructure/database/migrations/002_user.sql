-- =====================================================
-- Loksewa AI — USER SERVICE SCHEMA
-- =====================================================
-- User profile, preferences, district, institution, goals

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY,
  avatar_url TEXT,
  bio TEXT,
  district TEXT,
  province TEXT,
  institution TEXT,
  preparation_level TEXT CHECK (preparation_level IN ('beginner', 'intermediate', 'advanced', 'final')),
  target_exam_date DATE,
  daily_study_goal_minutes INT NOT NULL DEFAULT 30,
  show_on_leaderboard BOOLEAN NOT NULL DEFAULT true,
  notification_preferences JSONB NOT NULL DEFAULT '{"push": true, "email": true, "sms": false}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_district ON user_profiles(district);
CREATE INDEX IF NOT EXISTS idx_user_profiles_institution ON user_profiles(institution);

-- Districts reference table (Nepal)
CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  province TEXT NOT NULL
);

-- Institutions
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,                  -- school, college, university, training_center
  district TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User goals
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL,    -- exam, topic, daily_minutes, weekly_questions
  target_value TEXT NOT NULL,
  deadline DATE,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_active ON user_goals(user_id) WHERE achieved_at IS NULL;

-- User devices (for push notifications)
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_model TEXT,
  os_version TEXT,
  app_version TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (platform, device_token)
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices(user_id) WHERE is_active = true;
