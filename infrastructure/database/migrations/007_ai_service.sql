-- =====================================================
-- Loksewa AI — AI SERVICE SCHEMA
-- =====================================================
-- AI conversations, messages, prompt templates, feedback

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AI conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  title TEXT,
  mode TEXT NOT NULL DEFAULT 'free_chat' CHECK (mode IN ('free_chat', 'explain_answer', 'explain_concept', 'generate_quiz', 'study_plan', 'mistake_review', 'quick_question')),
  topic TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_turns INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id, last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);

-- AI messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  turn_index INT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb,  -- [{source_id, source_type, title, snippet, score}]
  source TEXT NOT NULL DEFAULT 'ai_only' CHECK (source IN ('verified_db', 'ai_rag', 'ai_only', 'cache', 'refused')),
  model_used TEXT,
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  latency_ms INT,
  retrieval_count INT,
  retrieval_score_avg NUMERIC(3,2),
  feedback TEXT CHECK (feedback IN ('up', 'down', NULL)),
  feedback_text TEXT,
  safety_flags JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id, turn_index);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user ON ai_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_feedback ON ai_messages(feedback, created_at DESC) WHERE feedback IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_messages_source ON ai_messages(source, created_at DESC);

-- Prompt templates (versioned, A/B testable)
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  template TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,  -- list of variable names
  model_target TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ne', 'both')),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  traffic_allocation NUMERIC(3,2) NOT NULL DEFAULT 1.0,  -- 0-1, for A/B
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, version, language)
);

-- AI usage metrics (for billing & monitoring)
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  service TEXT NOT NULL,            -- ai-service
  operation TEXT NOT NULL,          -- chat, embed, generate
  model TEXT NOT NULL,
  prompt_tokens INT NOT NULL DEFAULT 0,
  completion_tokens INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  latency_ms INT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_model ON ai_usage_log(model, created_at DESC);

-- AI feedback aggregate (for quality tracking)
CREATE TABLE IF NOT EXISTS ai_quality_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  model TEXT NOT NULL,
  total_responses INT NOT NULL DEFAULT 0,
  positive_feedback INT NOT NULL DEFAULT 0,
  negative_feedback INT NOT NULL DEFAULT 0,
  no_feedback INT NOT NULL DEFAULT 0,
  refusal_count INT NOT NULL DEFAULT 0,
  average_latency_ms NUMERIC(10,2),
  average_tokens NUMERIC(10,2),
  UNIQUE (date, model)
);

-- Hallucination reports
CREATE TABLE IF NOT EXISTS hallucination_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT,
  verified_by UUID,
  is_hallucination BOOLEAN,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
