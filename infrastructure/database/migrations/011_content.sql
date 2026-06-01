-- =====================================================
-- Loksewa AI — CONTENT SERVICE SCHEMA
-- =====================================================
-- Courses, topics, lessons, syllabus (some overlap with learning — separated for service boundaries)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_ne TEXT,
  subtitle TEXT,
  description TEXT,
  description_ne TEXT,
  exam_target TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all')),
  order_index INT NOT NULL DEFAULT 0,
  estimated_hours INT NOT NULL DEFAULT 0,
  cover_image_url TEXT,
  icon_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  total_topics INT NOT NULL DEFAULT 0,
  total_lessons INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_target ON courses(exam_target, is_published);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- Learning path nodes (Duolingo-style)
CREATE TABLE IF NOT EXISTS learning_path_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  topic_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  node_type TEXT NOT NULL DEFAULT 'topic' CHECK (node_type IN ('topic', 'milestone', 'mock_exam', 'review', 'final')),
  order_index INT NOT NULL,
  unlock_condition JSONB,           -- e.g., {"type": "mastery", "topic_id": "...", "min_score": 80}
  reward_xp INT NOT NULL DEFAULT 0,
  reward_badge_id TEXT,
  icon_url TEXT,
  color TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_path_nodes_course ON learning_path_nodes(course_id, order_index);

-- User path progress
CREATE TABLE IF NOT EXISTS user_path_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id),
  node_id UUID NOT NULL REFERENCES learning_path_nodes(id),
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'in_progress', 'completed', 'mastered')),
  progress_percent INT NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_user_path_progress ON user_path_progress(user_id, course_id, status);

-- Content reviews
CREATE TABLE IF NOT EXISTS content_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL,        -- course, topic, lesson, question
  content_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_changes')),
  notes TEXT,
  changes_requested JSONB,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_reviews ON content_reviews(content_type, content_id, status);
