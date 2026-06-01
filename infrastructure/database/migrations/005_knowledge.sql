-- =====================================================
-- Loksewa AI — KNOWLEDGE SERVICE SCHEMA
-- =====================================================
-- Questions, sources, documents, knowledge chunks

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Sources (where verified content comes from)
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('book', 'rajpatra', 'exam', 'teacher_notes', 'website', 'manual')),
  author TEXT,
  year INT,
  edition TEXT,
  isbn TEXT,
  url TEXT,
  license TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(type);
CREATE INDEX IF NOT EXISTS idx_sources_status ON sources(verification_status);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id),
  topic TEXT NOT NULL,
  subtopic TEXT,
  exam_target TEXT,              -- section_officer, nayab_subba, kharidar, etc.
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'truefalse', 'short', 'descriptive', 'fill_blank', 'matching')),
  difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  question_text TEXT NOT NULL,
  question_text_ne TEXT,
  options JSONB,                 -- { "A": "...", "B": "...", "C": "...", "D": "..." } for MCQ
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  explanation_ne TEXT,
  tags TEXT[] DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ne', 'both')),
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  quality_score NUMERIC(3,2),     -- 0-1, from auto + human review
  is_published BOOLEAN NOT NULL DEFAULT false,
  times_attempted INT NOT NULL DEFAULT 0,
  times_correct INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic, subtopic);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_target);
CREATE INDEX IF NOT EXISTS idx_questions_verified ON questions(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_questions_published ON questions(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_questions_text_search ON questions USING GIN(question_text gin_trgm_ops);

-- Question options (normalized for some question types)
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_key TEXT NOT NULL,      -- A, B, C, D
  option_text TEXT NOT NULL,
  option_text_ne TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL DEFAULT 0,
  UNIQUE (question_id, option_key)
);

-- Documents (PDFs, books, notes) — chunks stored in Qdrant, metadata here
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id),
  title TEXT NOT NULL,
  title_ne TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'md', 'txt', 'epub', 'html')),
  file_url TEXT NOT NULL,        -- S3 path
  file_size_bytes BIGINT,
  page_count INT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ne', 'both')),
  topics TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_chunks INT NOT NULL DEFAULT 0,
  processing_error TEXT,
  processed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_topics ON documents USING GIN(topics);

-- Document chunks (metadata for chunks; vectors in Qdrant)
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_text_ne TEXT,
  token_count INT NOT NULL,
  qdrant_point_id UUID,          -- reference to Qdrant
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);

-- Current affairs articles
CREATE TABLE IF NOT EXISTS current_affairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_ne TEXT,
  summary TEXT,
  summary_ne TEXT,
  full_text TEXT,
  category TEXT,                 -- politics, economy, international, sports, science
  source_url TEXT,
  source_name TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  importance INT NOT NULL DEFAULT 3,    -- 1-5
  is_archived BOOLEAN NOT NULL DEFAULT false,
  qdrant_point_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_current_affairs_published ON current_affairs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_current_affairs_category ON current_affairs(category, published_at DESC);

-- Question reports (user-submitted issues with questions)
CREATE TABLE IF NOT EXISTS question_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,           -- wrong_answer, typo, unclear, outdated, other
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_reports_question ON question_reports(question_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_status ON question_reports(status) WHERE status = 'pending';

-- Bulk import batches
CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  imported_by UUID NOT NULL,
  source_type TEXT NOT NULL,
  file_name TEXT,
  total_rows INT NOT NULL DEFAULT 0,
  successful_rows INT NOT NULL DEFAULT 0,
  failed_rows INT NOT NULL DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'partial')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
