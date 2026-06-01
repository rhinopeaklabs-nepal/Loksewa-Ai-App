-- =====================================================
-- Loksewa AI — LEARNING SERVICE SCHEMA
-- =====================================================
-- Skill scores, daily missions, recommendations, learning paths

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Skill scores per (user, topic, subtopic)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  subtopic TEXT,
  skill_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (skill_score >= 0 AND skill_score <= 100),
  mastery_level TEXT NOT NULL DEFAULT 'novice' CHECK (mastery_level IN ('novice', 'learning', 'proficient', 'advanced', 'mastered')),
  questions_attempted INT NOT NULL DEFAULT 0,
  questions_correct INT NOT NULL DEFAULT 0,
  average_time_ms INT NOT NULL DEFAULT 0,
  last_attempted_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50,  -- SM-2
  repetition_count INT NOT NULL DEFAULT 0,
  interval_days INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, topic, subtopic)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_weak ON user_progress(user_id, skill_score) WHERE skill_score < 50;
CREATE INDEX IF NOT EXISTS idx_user_progress_review ON user_progress(user_id, next_review_at) WHERE next_review_at IS NOT NULL;

-- Topics (master catalog)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID,
  name TEXT NOT NULL,
  name_ne TEXT,
  description TEXT,
  description_ne TEXT,
  parent_topic_id UUID REFERENCES topics(id),
  order_index INT NOT NULL DEFAULT 0,
  estimated_minutes INT NOT NULL DEFAULT 60,
  difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  exam_targets TEXT[] DEFAULT '{}',  -- which exams include this topic
  metadata JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_topics_course ON topics(course_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent ON topics(parent_topic_id);
CREATE INDEX IF NOT EXISTS idx_topics_published ON topics(is_published);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_ne TEXT,
  description TEXT,
  exam_target TEXT NOT NULL,    -- e.g., 'section_officer', 'nayab_subba', 'kharidar'
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  order_index INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ne TEXT,
  content TEXT NOT NULL,
  content_ne TEXT,
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'interactive', 'pdf')),
  duration_minutes INT NOT NULL DEFAULT 5,
  order_index INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_topic ON lessons(topic_id);

-- Lesson completions
CREATE TABLE IF NOT EXISTS lesson_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  time_spent_seconds INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

-- Daily missions
CREATE TABLE IF NOT EXISTS daily_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  mission_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired', 'skipped')),
  total_questions INT NOT NULL DEFAULT 0,
  completed_questions INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  estimated_minutes INT NOT NULL DEFAULT 0,
  actual_minutes INT,
  composition JSONB NOT NULL,  -- {weak: 5, review: 3, new: 5, mini_quiz: 2}
  question_ids UUID[] NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, mission_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_missions_user ON daily_missions(user_id, mission_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_missions_status ON daily_missions(status) WHERE status IN ('pending', 'in_progress');

-- Question attempts
CREATE TABLE IF NOT EXISTS question_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL,
  mission_id UUID,
  topic TEXT NOT NULL,
  subtopic TEXT,
  difficulty INT NOT NULL,
  selected_option TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_taken_ms INT NOT NULL,
  skill_score_before NUMERIC(5,2),
  skill_score_after NUMERIC(5,2),
  source TEXT NOT NULL,    -- verified_db, ai_rag, ai_only
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_attempts_user ON question_attempts(user_id, answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_attempts_question ON question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_topic ON question_attempts(user_id, topic, answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_attempts_mission ON question_attempts(mission_id) WHERE mission_id IS NOT NULL;

-- Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('topic', 'lesson', 'mock_exam', 'revision', 'daily_mission')),
  payload JSONB NOT NULL,
  reason TEXT,
  priority INT NOT NULL DEFAULT 5,
  shown_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_active ON recommendations(user_id) WHERE clicked_at IS NULL AND dismissed_at IS NULL;

-- Learning paths (Duolingo-style progression)
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  exam_target TEXT NOT NULL,
  current_node_id UUID,
  nodes JSONB NOT NULL,    -- ordered list of topic IDs with unlock conditions
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, exam_target)
);

-- Topic unlocks
CREATE TABLE IF NOT EXISTS topic_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  topic_id UUID NOT NULL REFERENCES topics(id),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlock_reason TEXT,
  UNIQUE (user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_unlocks_user ON topic_unlocks(user_id);
