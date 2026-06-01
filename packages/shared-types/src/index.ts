// Loksewa AI — Shared Type Definitions
// Used across all services and frontends

// ============= Common =============
export type Language = "ne" | "en" | "mai" | "new" | "tdg";
export type UserRole = "student" | "teacher" | "content_reviewer" | "admin" | "service";
export type ExamTarget =
  | "section_officer"
  | "nayab_subba"
  | "kharidar"
  | "engineering_license"
  | "see"
  | "plus_two"
  | "bachelor";
export type Source = "verified_db" | "ai_rag" | "ai_only" | "cache" | "refused";
export type QuestionType = "mcq" | "truefalse" | "short" | "descriptive" | "fill_blank" | "matching";

// ============= User =============
export interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  preferred_language: Language;
  target_exam?: ExamTarget;
  role: UserRole;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  avatar_url?: string;
  bio?: string;
  district?: string;
  province?: string;
  institution?: string;
  preparation_level?: "beginner" | "intermediate" | "advanced" | "final";
  target_exam_date?: string;
  daily_study_goal_minutes: number;
  show_on_leaderboard: boolean;
  notification_preferences: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

// ============= Auth =============
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  token_type: "Bearer";
}

export interface LoginRequest {
  identifier: string;  // email or phone
  password?: string;
  otp?: string;
}

export interface RegisterRequest {
  email?: string;
  phone?: string;
  password?: string;
  full_name?: string;
  preferred_language?: Language;
  target_exam?: ExamTarget;
  signup_source?: "organic" | "google" | "apple" | "invite";
}

// ============= Question =============
export interface Question {
  id: string;
  topic: string;
  subtopic?: string;
  exam_target?: ExamTarget;
  question_type: QuestionType;
  difficulty: number; // 1-5
  question_text: string;
  question_text_ne?: string;
  options?: Record<string, string>;
  correct_answer: string;
  explanation?: string;
  explanation_ne?: string;
  tags: string[];
  language: Language;
  verified: boolean;
  source_id?: string;
  metadata?: Record<string, unknown>;
}

export interface SubmitAnswerRequest {
  question_id: string;
  selected_option: string;
  time_taken_ms: number;
  mission_id?: string;
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_answer: string;
  explanation?: string;
  skill_score_before: number;
  skill_score_after: number;
  xp_earned: number;
  next_question?: Question;
  streak_updated: boolean;
  level_up?: {
    new_level: number;
    xp_to_next_level: number;
  };
}

// ============= Learning =============
export interface UserProgress {
  user_id: string;
  topic: string;
  subtopic?: string;
  skill_score: number;
  mastery_level: "novice" | "learning" | "proficient" | "advanced" | "mastered";
  questions_attempted: number;
  questions_correct: number;
  average_time_ms: number;
  last_attempted_at?: string;
  next_review_at?: string;
  ease_factor: number;
  repetition_count: number;
  interval_days: number;
}

export interface DailyMission {
  id: string;
  mission_date: string;
  status: "pending" | "in_progress" | "completed" | "expired" | "skipped";
  total_questions: number;
  completed_questions: number;
  correct_count: number;
  estimated_minutes: number;
  actual_minutes?: number;
  composition: {
    weak_topic_questions: number;
    review_questions: number;
    new_topic_questions: number;
    mini_quiz: number;
  };
  questions: Question[];
  reward_xp: number;
  started_at?: string;
  completed_at?: string;
}

// ============= Gamification =============
export interface UserXP {
  user_id: string;
  total_xp: number;
  level: number;
  xp_in_current_level: number;
  xp_to_next_level: number;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date?: string;
  streak_freezes_available: number;
}

export interface Badge {
  id: string;
  name: string;
  name_ne?: string;
  description: string;
  icon_url?: string;
  category?: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "legendary";
  xp_reward: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  score: number;
  district?: string;
}

// ============= AI Tutor =============
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  source?: Source;
  feedback?: "up" | "down";
  created_at?: string;
}

export interface Citation {
  source_id: string;
  source_type: "question" | "document" | "current_affairs";
  title: string;
  snippet: string;
  score: number;
}

export interface ChatRequest {
  conversation_id?: string;
  message: string;
  language?: Language;
  stream?: boolean;
  context?: {
    topic?: string;
    question_id?: string;
    mode?: "free_chat" | "explain_answer" | "explain_concept" | "generate_quiz" | "study_plan" | "mistake_review";
  };
}

export interface ChatResponse {
  conversation_id: string;
  turn_id: string;
  response: string;
  citations: Citation[];
  source: Source;
  tokens_used: number;
  latency_ms: number;
}

// ============= Memory =============
export interface Memory {
  id: string;
  user_id: string;
  memory_type: "session" | "longterm" | "learning" | "behavioral" | "knowledge";
  fact: string;
  fact_ne?: string;
  category?: string;
  importance: number; // 1-5
  confidence: number; // 0-1
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

// ============= Mock Exam =============
export interface MockExam {
  id: string;
  title: string;
  description?: string;
  exam_type: "practice" | "full" | "subject_specific" | "mini" | "adaptive";
  exam_target: ExamTarget;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  passing_marks: number;
  marking_scheme: {
    correct: number;
    wrong: number;
    unanswered: number;
  };
  is_premium: boolean;
}

export interface MockExamAttempt {
  id: string;
  user_id: string;
  mock_exam_id: string;
  status: "in_progress" | "submitted" | "expired" | "abandoned" | "graded";
  started_at: string;
  server_end_time: string;
  submitted_at?: string;
  time_taken_seconds?: number;
  score?: number;
  total_marks?: number;
  percentage?: number;
  is_passed?: boolean;
  rank?: number;
  subject_wise_scores?: Record<string, number>;
  weak_topics?: string[];
  strong_topics?: string[];
  readiness_score?: number;
  readiness_band?: "low" | "medium" | "high" | "exam_ready";
}

export interface ExamStartResponse {
  attempt_id: string;
  mock_exam: MockExam;
  questions: Question[];
  started_at: string;
  server_end_time: string;
}

// ============= Notifications =============
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  category?: string;
  priority: "low" | "normal" | "high" | "urgent";
  title: string;
  title_ne?: string;
  body: string;
  body_ne?: string;
  image_url?: string;
  data?: Record<string, unknown>;
  read_at?: string;
  clicked_at?: string;
  created_at: string;
}

// ============= API Common =============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  message_ne?: string;
  details?: Record<string, unknown>;
  status_code: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// ============= Events (Kafka) =============
export interface BaseEvent {
  event_id: string;
  event_type: string;
  event_version: number;
  occurred_at: string;
  producer: string;
  user_id?: string;
  session_id?: string;
  payload: Record<string, unknown>;
}

export interface QuestionAnsweredEvent extends BaseEvent {
  event_type: "question.answered";
  payload: {
    question_id: string;
    topic: string;
    subtopic?: string;
    difficulty: number;
    is_correct: boolean;
    time_taken_ms: number;
    skill_score_before: number;
    skill_score_after: number;
    source: Source;
  };
}

export interface QuizCompletedEvent extends BaseEvent {
  event_type: "quiz.completed";
  payload: {
    mission_id: string;
    total_questions: number;
    correct_count: number;
    accuracy: number;
    time_taken_seconds: number;
  };
}

export interface AIConversationCreatedEvent extends BaseEvent {
  event_type: "ai.conversation.created";
  payload: {
    conversation_id: string;
    turn_id: string;
    model_used: string;
    tokens_used: number;
    latency_ms: number;
    feedback?: "up" | "down";
    source: Source;
  };
}

export type LoksewaEvent =
  | QuestionAnsweredEvent
  | QuizCompletedEvent
  | AIConversationCreatedEvent
  | (BaseEvent & { event_type: string });
