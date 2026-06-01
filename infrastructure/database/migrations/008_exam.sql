-- =====================================================
-- Loksewa AI — EXAM SERVICE SCHEMA
-- =====================================================
-- Mock exams, attempts, results, readiness scores

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS mock_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_ne TEXT,
  description TEXT,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('practice', 'full', 'subject_specific', 'mini', 'adaptive')),
  exam_target TEXT NOT NULL,                -- section_officer, nayab_subba, kharidar
  duration_minutes INT NOT NULL,
  total_questions INT NOT NULL,
  total_marks NUMERIC(8,2) NOT NULL,
  passing_marks NUMERIC(8,2) NOT NULL,
  marking_scheme JSONB NOT NULL DEFAULT '{"correct": 1, "wrong": 0, "unanswered": 0}'::jsonb,
  question_selection JSONB NOT NULL,        -- { topics: [...], difficulty_dist: {...}, randomize: true }
  difficulty INT NOT NULL DEFAULT 3,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  max_attempts INT,                          -- NULL = unlimited
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_exams_target ON mock_exams(exam_target, is_published);
CREATE INDEX IF NOT EXISTS idx_mock_exams_type ON mock_exams(exam_type, is_published);

-- Mock exam attempts
CREATE TABLE IF NOT EXISTS mock_exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  mock_exam_id UUID NOT NULL REFERENCES mock_exams(id),
  attempt_number INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'expired', 'abandoned', 'graded')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  server_end_time TIMESTAMPTZ NOT NULL,        -- deadline (anti-cheat)
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  time_taken_seconds INT,
  score NUMERIC(8,2),
  total_marks NUMERIC(8,2),
  percentage NUMERIC(5,2),
  is_passed BOOLEAN,
  rank INT,                                   -- within exam cohort
  total_attempted INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  total_wrong INT NOT NULL DEFAULT 0,
  total_unanswered INT NOT NULL DEFAULT 0,
  subject_wise_scores JSONB,
  topic_wise_scores JSONB,
  weak_topics TEXT[],
  strong_topics TEXT[],
  readiness_score NUMERIC(5,2),
  readiness_band TEXT,                        -- low, medium, high, exam_ready
  improvement_plan JSONB,
  ip_address INET,
  user_agent TEXT,
  UNIQUE (user_id, mock_exam_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_user ON mock_exam_attempts(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam ON mock_exam_attempts(mock_exam_id, status);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON mock_exam_attempts(status) WHERE status IN ('in_progress', 'submitted');

-- Exam attempt answers
CREATE TABLE IF NOT EXISTS exam_attempt_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES mock_exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  question_order INT NOT NULL,
  selected_option TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN,
  is_marked_for_review BOOLEAN NOT NULL DEFAULT false,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ,
  UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt ON exam_attempt_answers(attempt_id, question_order);

-- Exam readiness history
CREATE TABLE IF NOT EXISTS exam_readiness_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  exam_target TEXT NOT NULL,
  readiness_score NUMERIC(5,2) NOT NULL,
  readiness_band TEXT NOT NULL,
  components JSONB NOT NULL,                 -- {skill_avg: 45, mock_avg: 67, streak: 80, consistency: 70}
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readiness_user ON exam_readiness_history(user_id, exam_target, computed_at DESC);

-- Exam feedback
CREATE TABLE IF NOT EXISTS exam_attempt_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES mock_exam_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  feedback_type TEXT NOT NULL,                -- overall, question, topic
  target_id UUID,                              -- question_id or topic
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
