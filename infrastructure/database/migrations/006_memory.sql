-- =====================================================
-- Loksewa AI — MEMORY SERVICE SCHEMA
-- =====================================================
-- Long-term memory about each user

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Memory types
CREATE TYPE memory_type AS ENUM (
  'session',         -- current session
  'longterm',        -- persistent facts
  'learning',        -- what was learned
  'behavioral',      -- study patterns
  'knowledge'        -- what the AI knows about the user
);

CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  memory_type memory_type NOT NULL,
  fact TEXT NOT NULL,
  fact_ne TEXT,                    -- Nepali version if applicable
  category TEXT,                   -- preference, weakness, strength, habit
  importance INT NOT NULL DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
  source_event_id UUID,            -- originating event
  source_event_type TEXT,          -- question.answered, ai.conversation, etc.
  embedding_id UUID,               -- reference to Qdrant vector
  is_active BOOLEAN NOT NULL DEFAULT true,
  decay_factor NUMERIC(3,2) NOT NULL DEFAULT 1.0,  -- multiplied by importance over time
  expires_at TIMESTAMPTZ,          -- NULL = permanent
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memories_user ON user_memories(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_memories_type ON user_memories(user_id, memory_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_memories_importance ON user_memories(user_id, importance DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_memories_category ON user_memories(user_id, category) WHERE is_active = true;

-- Memory links (memory graphs)
CREATE TABLE IF NOT EXISTS memory_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_memory_id UUID NOT NULL REFERENCES user_memories(id) ON DELETE CASCADE,
  to_memory_id UUID NOT NULL REFERENCES user_memories(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL,    -- related, contradicts, reinforces, derived_from
  weight NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (from_memory_id, to_memory_id, link_type),
  CHECK (from_memory_id != to_memory_id)
);

-- Memory access log (for decay calculation)
CREATE TABLE IF NOT EXISTS memory_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID NOT NULL REFERENCES user_memories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_type TEXT NOT NULL,        -- retrieval, used_in_response, decay_update
  context TEXT
);

CREATE INDEX IF NOT EXISTS idx_memory_access_log ON memory_access_log(memory_id, accessed_at DESC);
