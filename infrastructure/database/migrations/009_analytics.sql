-- =====================================================
-- Loksewa AI — ANALYTICS SERVICE SCHEMA
-- =====================================================
-- Events, funnels, BI tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Raw events (append-only, partitioned)
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_version INT NOT NULL DEFAULT 1,
  user_id UUID,
  session_id UUID,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  producer TEXT NOT NULL,
  payload JSONB NOT NULL,
  context JSONB,                                -- {app_version, platform, locale, ...}
  ip_address INET,
  PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

-- Create partitions for current and next 3 months
DO $$
DECLARE
  start_date DATE := date_trunc('month', CURRENT_DATE);
  i INT;
BEGIN
  FOR i IN 0..3 LOOP
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS events_%s PARTITION OF events FOR VALUES FROM (%L) TO (%L)',
      to_char(start_date + (i || ' month')::interval, 'YYYY_MM'),
      start_date + (i || ' month')::interval,
      start_date + ((i+1) || ' month')::interval
    );
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_user_type ON events(user_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type_time ON events(event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id) WHERE session_id IS NOT NULL;

-- Daily active user aggregates
CREATE TABLE IF NOT EXISTS daily_active_users (
  date DATE NOT NULL,
  user_id UUID NOT NULL,
  sessions INT NOT NULL DEFAULT 1,
  total_events INT NOT NULL DEFAULT 1,
  minutes_active INT NOT NULL DEFAULT 0,
  platform TEXT,
  PRIMARY KEY (date, user_id)
);

-- Daily metrics (materialized)
CREATE TABLE IF NOT EXISTS daily_metrics (
  date DATE PRIMARY KEY,
  dau INT NOT NULL DEFAULT 0,
  new_users INT NOT NULL DEFAULT 0,
  total_sessions INT NOT NULL DEFAULT 0,
  total_questions_answered INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  total_ai_messages INT NOT NULL DEFAULT 0,
  total_mock_exams_started INT NOT NULL DEFAULT 0,
  total_mock_exams_completed INT NOT NULL DEFAULT 0,
  total_minutes_studied INT NOT NULL DEFAULT 0,
  average_session_minutes NUMERIC(8,2),
  retention_d1 NUMERIC(5,2),
  retention_d7 NUMERIC(5,2),
  retention_d30 NUMERIC(5,2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Topic performance aggregates
CREATE TABLE IF NOT EXISTS topic_global_stats (
  topic TEXT NOT NULL,
  subtopic TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  total_attempts INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  unique_users INT NOT NULL DEFAULT 0,
  average_time_ms INT,
  difficulty_rating NUMERIC(3,2),
  PRIMARY KEY (topic, subtopic, date)
);

-- Funnel tracking
CREATE TABLE IF NOT EXISTS funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  steps TEXT[] NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funnel_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id),
  user_id UUID NOT NULL,
  step_name TEXT NOT NULL,
  step_index INT NOT NULL,
  event_data JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funnel_events_user ON funnel_events(funnel_id, user_id, step_index);
