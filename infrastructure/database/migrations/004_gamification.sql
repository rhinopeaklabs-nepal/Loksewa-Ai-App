-- =====================================================
-- Loksewa AI — GAMIFICATION SERVICE SCHEMA
-- =====================================================
-- XP, streaks, levels, badges, leaderboards

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- XP totals
CREATE TABLE IF NOT EXISTS user_xp (
  user_id UUID PRIMARY KEY,
  total_xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  xp_in_current_level INT NOT NULL DEFAULT 0,
  xp_to_next_level INT NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- XP transactions (immutable ledger)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount INT NOT NULL,           -- positive for earned, negative for spent
  source TEXT NOT NULL,          -- question_correct, streak_bonus, mock_pass, etc.
  source_id UUID,                -- related entity (e.g., question_id, exam_id)
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_tx_user ON xp_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_tx_source ON xp_transactions(source, created_at DESC);

-- Streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  streak_started_at DATE,
  streak_freezes_available INT NOT NULL DEFAULT 2,
  streak_freezes_used INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Streak history (audit trail)
CREATE TABLE IF NOT EXISTS streak_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  qualifying_activities INT NOT NULL DEFAULT 0,
  streak_at_that_day INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_streak_history_user ON streak_history(user_id, date DESC);

-- Badges catalog
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ne TEXT,
  description TEXT NOT NULL,
  description_ne TEXT,
  icon_url TEXT,
  category TEXT,                 -- streak, topic_mastery, mock_exam, social, special
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'legendary')),
  trigger_type TEXT NOT NULL,    -- count, threshold, milestone
  trigger_config JSONB NOT NULL,
  xp_reward INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User earned badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  badge_id TEXT NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress_data JSONB,           -- state at time of earning
  UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id, earned_at DESC);

-- Badge progress (in-progress badges, not yet earned)
CREATE TABLE IF NOT EXISTS badge_progress (
  user_id UUID NOT NULL,
  badge_id TEXT NOT NULL REFERENCES badges(id),
  current_value INT NOT NULL DEFAULT 0,
  target_value INT NOT NULL,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Leaderboard snapshots (daily/weekly/monthly)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope TEXT NOT NULL,           -- national, district, friends, subject, institution
  scope_value TEXT,              -- district name, subject name, institution id
  period TEXT NOT NULL,          -- daily, weekly, monthly, all_time
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  rankings JSONB NOT NULL,       -- [{user_id, rank, score, display_name, avatar_url}]
  total_participants INT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_scope ON leaderboard_snapshots(scope, scope_value, period, period_start DESC);

-- Friendships (for friends leaderboard)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE (user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id, status);

-- Challenges (peer-to-peer)
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id UUID NOT NULL,
  challenged_id UUID NOT NULL,
  challenge_type TEXT NOT NULL,  -- quiz_battle, mock_exam, topic_master
  payload JSONB NOT NULL,
  challenger_score INT,
  challenged_score INT,
  winner_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'expired', 'declined')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON challenges(challenger_id, status);
CREATE INDEX IF NOT EXISTS idx_challenges_challenged ON challenges(challenged_id, status);
