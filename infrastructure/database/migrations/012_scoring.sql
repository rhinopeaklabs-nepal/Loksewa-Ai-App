-- =====================================================
-- Loksewa AI — SCORING / FOUNDATION MODEL SCHEMA
-- =====================================================
-- Training data collection for future RhinoPeak model

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,                -- ai_messages, verified_qa, teacher_notes, student_mistakes
  source_id UUID NOT NULL,
  instruction TEXT NOT NULL,            -- the user query
  response TEXT NOT NULL,               -- the response
  context JSONB DEFAULT '[]'::jsonb,     -- retrieved chunks, memory
  metadata JSONB DEFAULT '{}'::jsonb,
  quality_score NUMERIC(3,2),            -- 0-1, from auto + human review
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  is_pii_redacted BOOLEAN NOT NULL DEFAULT false,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ne')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_data_source ON training_data(source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_data_quality ON training_data(quality_score DESC) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_training_data_verified ON training_data(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_training_data_unverified ON training_data(is_verified, created_at) WHERE is_verified = false;

-- Dataset versions
CREATE TABLE IF NOT EXISTS dataset_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT NOT NULL UNIQUE,         -- e.g., "v1.0", "v1.1"
  description TEXT,
  total_examples INT NOT NULL DEFAULT 0,
  train_examples INT NOT NULL DEFAULT 0,
  val_examples INT NOT NULL DEFAULT 0,
  test_examples INT NOT NULL DEFAULT 0,
  s3_path TEXT NOT NULL,                -- s3://loksewa-ai-training-data/{version}/
  config JSONB DEFAULT '{}'::jsonb,     -- hyperparameters, model version
  metrics JSONB DEFAULT '{}'::jsonb,    -- eval results
  status TEXT NOT NULL DEFAULT 'building' CHECK (status IN ('building', 'ready', 'training', 'completed', 'failed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Model training runs
CREATE TABLE IF NOT EXISTS training_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_version_id UUID REFERENCES dataset_versions(id),
  base_model TEXT NOT NULL,             -- "qwen-7b", "llama-3-8b", etc.
  method TEXT NOT NULL,                 -- lora, qlora, full
  config JSONB NOT NULL,                -- hyperparameters
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INT,
  gpu_hours NUMERIC(10,2),
  cost_usd NUMERIC(10,4),
  metrics JSONB DEFAULT '{}'::jsonb,
  model_s3_path TEXT,
  logs_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Model evaluations
CREATE TABLE IF NOT EXISTS model_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_run_id UUID REFERENCES training_runs(id),
  model_name TEXT NOT NULL,
  eval_set_name TEXT NOT NULL,
  total_questions INT NOT NULL,
  correct INT NOT NULL,
  partial_credit NUMERIC(3,2),
  in_syllabus_refusal_rate NUMERIC(3,2),
  out_of_syllabus_refusal_rate NUMERIC(3,2),
  citation_accuracy NUMERIC(3,2),
  average_latency_ms NUMERIC(10,2),
  nepal_fluency_score NUMERIC(3,2),
  details JSONB DEFAULT '{}'::jsonb,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
