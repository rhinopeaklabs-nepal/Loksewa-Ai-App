import "./env";
import { createHash, createHmac, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

type Status = "draft" | "published" | "archived";
type UserRole = "student" | "reviewer" | "admin";
type UserStatus = "active" | "disabled";

type DbRecord = { id: number; created_at: string; updated_at: string };
type Subject = DbRecord & { slug: string; title: string; description: string; icon: string; color: string; sort_order: number; status: Status };
type Course = DbRecord & {
  subject_id: number;
  slug: string;
  short_name: string;
  title: string;
  badge: string;
  description: string;
  coach_line: string;
  plan_line: string;
  teacher: string;
  lesson_count: number;
  duration: string;
  level: string;
  progress: number;
  ai_score: number;
  icon: string;
  color: string;
  background: string;
  sort_order: number;
  status: Status;
};
type CourseModule = DbRecord & { course_id: number; title: string; lessons: number; duration: string; progress: number; locked: boolean; sort_order: number };
type CourseTask = DbRecord & { course_id: number | null; title: string; subtitle: string; duration: string; icon: string; score_boost: number; next_difficulty: string; alert_title: string; alert_message: string; sort_order: number };
type CourseQuestion = DbRecord & { course_id: number; mode: string; prompt: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_option: "A" | "B" | "C" | "D"; explanation: string; hint: string; tags: string[]; sort_order: number };
type CourseMistake = DbRecord & { course_id: number; title: string; reason: string; sort_order: number };
type Syllabus = DbRecord & { title: string; content: string; category: string; source_name: string; source_year: number | null; verified_at: string | null };
type Question = DbRecord & {
  public_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  syllabus_category: string;
  source_name: string;
  source_url: string;
  source_license: string;
  source_year: number | null;
  source_page: number | null;
  exam_level: string;
  exam_type: string;
  language: string;
  verification_status: "draft" | "needs_review" | "verified" | "rejected";
  verifier: string;
  verified_at: string | null;
  deleted_at: string | null;
  data_version: number;
};
type MockTest = DbRecord & {
  title: string;
  description: string;
  exam_level: string;
  exam_type: string;
  syllabus_category: string;
  duration_minutes: number;
  total_questions: number;
  marks_per_correct: number;
  negative_marking_enabled: boolean;
  negative_marks_per_wrong: number;
  status: Status;
  question_ids: number[];
};
type MockAttemptStatus = "in_progress" | "submitted" | "expired";
type MockAttempt = DbRecord & {
  user_id: number;
  mock_test_id: number;
  started_at: string;
  ends_at: string;
  submitted_at: string | null;
  status: MockAttemptStatus;
  score: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  total_questions: number;
  total_marks: number;
};
type MockAnswer = DbRecord & {
  attempt_id: number;
  question_id: number;
  selected_option: "A" | "B" | "C" | "D" | null;
  is_correct: boolean;
  marks_awarded: number;
  answered_at: string | null;
};
type User = DbRecord & {
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  last_login_at: string | null;
  auth_provider?: "password" | "google";
  google_sub?: string | null;
  picture_url?: string | null;
};
type Report = { id: number; question_id: number | null; scanned_text: string; report_type: string; message: string; contact: string; status: string; created_at: string; device_hash?: string };
type ScraperSource = DbRecord & { name: string; start_url: string; allowed_domain: string; syllabus_category: string; max_depth: number; max_pages: number; refresh_minutes: number; status: "active" | "paused" | "archived"; last_crawled_at: string | null };
type ScraperRun = { id: number; source_id: number | null; status: "running" | "completed" | "failed"; started_at: string; finished_at: string | null; pages_seen: number; pages_saved: number; pages_skipped: number; message: string };
type ScrapedDocument = { id: number; source_id: number; syllabus_entry_id: number | null; url: string; title: string; content: string; content_hash: string; syllabus_category: string; extracted_at: string; last_seen_at: string };
type PrepTopic = DbRecord & {
  subject_id: string;
  title: string;
  content_beginner: string;
  content_intermediate: string;
  content_advanced: string;
  revision_notes: string;
  sort_order: number;
};
type PrepFlashcard = DbRecord & { topic_id: number; front: string; back: string };
type TopicProgress = DbRecord & {
  user_id: number;
  topic_id: number;
  completion_percentage: number;
  questions_attempted: number;
  questions_correct: number;
  time_spent_minutes: number;
  last_studied_at: string | null;
};

type NodeDb = {
  meta: { schema_version: string; data_version: number; next_id: Record<string, number> };
  sessions: Record<string, { user_id: number; expires_at: string }>;
  subjects: Subject[];
  courses: Course[];
  modules: CourseModule[];
  tasks: CourseTask[];
  course_questions: CourseQuestion[];
  mistakes: CourseMistake[];
  syllabus: Syllabus[];
  questions: Question[];
  mocks: MockTest[];
  mock_attempts: MockAttempt[];
  mock_answers: MockAnswer[];
  users: User[];
  reports: Report[];
  scraper_sources: ScraperSource[];
  scraper_runs: ScraperRun[];
  scraped_documents: ScrapedDocument[];
  prep_topics: PrepTopic[];
  prep_flashcards: PrepFlashcard[];
  topic_progress: TopicProgress[];
};

type CollectionKey = Exclude<keyof NodeDb, "meta" | "sessions">;

const PORT = Number(process.env.PORT ?? 8000);
const HOST = process.env.HOST ?? "127.0.0.1";
const PROJECT_ROOT = resolve(process.cwd(), "..");
const DB_PATH = resolve(process.env.NODE_BACKEND_DB_PATH ?? join(PROJECT_ROOT, "runtime", "node-backend-db.json"));
const ADMIN_DIST = resolve(process.env.ADMIN_DIST_PATH ?? join(PROJECT_ROOT, "admin-dashboard", "dist"));
const ADMIN_TOKEN = process.env.LOKSEWA_ADMIN_TOKEN ?? "dev-admin-token-change-me";
const BOOTSTRAP_ADMIN_EMAIL = (process.env.LOKSEWA_BOOTSTRAP_ADMIN_EMAIL ?? "admin@loksewa.local").toLowerCase();
const BOOTSTRAP_ADMIN_PASSWORD = process.env.LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD ?? "LoksewaAdmin@123";
const SESSION_SECRET = process.env.LOKSEWA_SESSION_SECRET ?? "dev-session-secret-change-me";
const SESSION_HOURS = Number(process.env.SESSION_TTL_HOURS ?? 168);
const NODE_ENV = process.env.LOKSEWA_ENV ?? process.env.NODE_ENV ?? "development";
const IS_PRODUCTION = NODE_ENV === "production";
const TRUST_PROXY = (process.env.LOKSEWA_TRUST_PROXY ?? "true").toLowerCase() !== "false";
const ENFORCE_HTTPS = (process.env.LOKSEWA_ENFORCE_HTTPS ?? (IS_PRODUCTION ? "true" : "false")).toLowerCase() !== "false";
const ENABLE_ARCHITECTURE_ROUTES = (process.env.LOKSEWA_ENABLE_ARCHITECTURE_ROUTES ?? (IS_PRODUCTION ? "false" : "true")).toLowerCase() === "true";
const DELTA_SIGNING_SECRET = process.env.LOKSEWA_DELTA_SIGNING_SECRET ?? "dev-delta-signing-secret-change-me";
const CORS_ORIGINS = (process.env.LOKSEWA_CORS_ORIGINS ?? process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:8000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const SCRAPER_USER_AGENT = process.env.LOKSEWA_SCRAPER_USER_AGENT ?? "LoksewaAIStudyBot/0.1 (+https://localhost; educational syllabus updater)";
const ENABLE_SCRAPER = (process.env.LOKSEWA_SCRAPER_ENABLED ?? "false").toLowerCase() !== "false";
const REQUEST_BODY_LIMIT_BYTES = Number(process.env.REQUEST_BODY_LIMIT_BYTES ?? 128 * 1024);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? (IS_PRODUCTION ? 120 : 600));
const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW ?? "1 minute";
const AUTH_RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10);
const AUTH_RATE_LIMIT_WINDOW = process.env.AUTH_RATE_LIMIT_WINDOW ?? "1 minute";
const PASSWORD_ITERATIONS = 210_000;

function now(): string {
  return new Date().toISOString();
}

function passwordHash(email: string, password: string): string {
  const salt = randomBytes(16).toString("hex");
  const digest = pbkdf2Sync(`${email.toLowerCase()}::${password}`, salt, PASSWORD_ITERATIONS, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$${PASSWORD_ITERATIONS}$${salt}$${digest}`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function verifyPassword(email: string, password: string, storedHash: string): boolean {
  const parts = storedHash.split("$");
  if (parts.length === 4 && parts[0] === "pbkdf2_sha256") {
    const iterations = Number(parts[1]);
    const digest = pbkdf2Sync(`${email.toLowerCase()}::${password}`, parts[2], iterations, 32, "sha256").toString("hex");
    return safeEqual(digest, parts[3]);
  }
  return safeEqual(sha256(`${email.toLowerCase()}::${password}`), storedHash);
}

function signPayload(payload: unknown): string {
  return createHmac("sha256", DELTA_SIGNING_SECRET).update(JSON.stringify(payload)).digest("hex");
}

function sessionKeyFor(token: string): string {
  return createHmac("sha256", SESSION_SECRET).update(token).digest("hex");
}

function sanitizeText(value: unknown, maxLength: number): string {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizedClientIp(request: FastifyRequest): string {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.ip;
}

function validateRuntimeConfig(): void {
  if (!IS_PRODUCTION) return;
  const insecure = [];
  if (!ADMIN_TOKEN || ADMIN_TOKEN === "dev-admin-token-change-me") insecure.push("LOKSEWA_ADMIN_TOKEN");
  if (!SESSION_SECRET || SESSION_SECRET === "dev-session-secret-change-me") insecure.push("LOKSEWA_SESSION_SECRET");
  if (!DELTA_SIGNING_SECRET || DELTA_SIGNING_SECRET === "dev-delta-signing-secret-change-me") insecure.push("LOKSEWA_DELTA_SIGNING_SECRET");
  if (!BOOTSTRAP_ADMIN_PASSWORD || BOOTSTRAP_ADMIN_PASSWORD === "LoksewaAdmin@123") insecure.push("LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD");
  if (CORS_ORIGINS.includes("*")) insecure.push("LOKSEWA_CORS_ORIGINS");
  if (insecure.length) {
    throw new Error(`Production Node backend requires secure configuration for: ${insecure.join(", ")}`);
  }
}

function idFor(db: NodeDb, bucket: CollectionKey): number {
  const key = String(bucket);
  const next = db.meta.next_id[key] ?? 1;
  db.meta.next_id[key] = next + 1;
  return next;
}

function withTimestamps<T extends object>(db: NodeDb, bucket: CollectionKey, payload: T): T & DbRecord {
  const stamp = now();
  return { ...payload, id: idFor(db, bucket), created_at: stamp, updated_at: stamp };
}

function normalizeStatus(value: unknown, fallback: Status = "published"): Status {
  return value === "draft" || value === "published" || value === "archived" ? value : fallback;
}

function defaultDb(): NodeDb {
  const stamp = now();
  const db: NodeDb = {
    meta: { schema_version: "node-1", data_version: 1, next_id: {} },
    sessions: {},
    subjects: [],
    courses: [],
    modules: [],
    tasks: [],
    course_questions: [],
    mistakes: [],
    syllabus: [],
    questions: [],
    mocks: [],
    mock_attempts: [],
    mock_answers: [],
    users: [],
    reports: [],
    scraper_sources: [],
    scraper_runs: [],
    scraped_documents: [],
    prep_topics: [],
    prep_flashcards: [],
    topic_progress: []
  };

  const subjects = [
    { slug: "gk", title: "General Knowledge", description: "Static GK, current affairs, Nepal facts, science, history, and geography.", icon: "public", color: "#635BFF", sort_order: 1, status: "published" as Status },
    { slug: "iq", title: "IQ and Reasoning", description: "Patterns, series, analogy, coding, direction, and fast elimination practice.", icon: "psychology", color: "#10AFA2", sort_order: 2, status: "published" as Status },
    { slug: "law", title: "Constitution and Law", description: "Articles, rights, duties, governance bodies, and legal keyword traps.", icon: "gavel", color: "#F59E0B", sort_order: 3, status: "published" as Status },
    { slug: "admin", title: "Public Administration", description: "Policy, accountability, ethics, service delivery, and case-based decisions.", icon: "business", color: "#3B82F6", sort_order: 4, status: "published" as Status }
  ];
  db.subjects = subjects.map((subject) => withTimestamps(db, "subjects", subject));

  const subjectId = (slug: string) => db.subjects.find((subject) => subject.slug === slug)?.id ?? 1;
  const courses = [
    { subject_id: subjectId("gk"), slug: "gk", short_name: "GK", title: "General Knowledge Mastery", badge: "Popular GK", description: "High-frequency facts, current affairs, science, geography, history, and Nepal-specific exam recall.", coach_line: "High-frequency facts, current affairs, and quick recall practice.", plan_line: "6 min fact review, 20 prediction questions, 8 flashcards, 1 mistake retry.", teacher: "Aruna Sharma", lesson_count: 45, duration: "8 weeks", level: "Officer", progress: 64, ai_score: 73, icon: "public", color: "#635BFF", background: "#EEEAFE", sort_order: 1, status: "published" as Status },
    { subject_id: subjectId("iq"), slug: "iq", short_name: "IQ", title: "IQ and Reasoning Accelerator", badge: "Speed Logic", description: "Pattern recognition, series, analogy, coding, direction, and elimination under exam timing.", coach_line: "Pattern recognition, series, analogy, and speed logic drills.", plan_line: "Warm up shortcuts, solve timed sets, explain wrong patterns, retry slow items.", teacher: "Rabin K.C.", lesson_count: 32, duration: "6 weeks", level: "Beginner", progress: 48, ai_score: 68, icon: "psychology", color: "#10AFA2", background: "#E4FAF7", sort_order: 2, status: "published" as Status },
    { subject_id: subjectId("law"), slug: "law", short_name: "Law", title: "Constitution and Law Essentials", badge: "Exam Trap", description: "Articles, rights, duties, governance structure, commissions, and negative wording traps.", coach_line: "Articles, rights, governance structure, and keyword traps.", plan_line: "Article recall, keyword trap practice, provision mapping, and mini mock.", teacher: "Maya Adhikari", lesson_count: 28, duration: "5 weeks", level: "Intermediate", progress: 42, ai_score: 61, icon: "gavel", color: "#F59E0B", background: "#FFF4D8", sort_order: 3, status: "published" as Status },
    { subject_id: subjectId("admin"), slug: "admin", short_name: "Admin", title: "Public Administration Practice", badge: "Policy Skill", description: "Administration principles, accountability, public service delivery, policy cycle, and practical cases.", coach_line: "Policy, management, accountability, and service delivery concepts.", plan_line: "Concept review, scenario selection, weak term flashcards, and case retry.", teacher: "Suman Bista", lesson_count: 24, duration: "4 weeks", level: "Officer", progress: 37, ai_score: 58, icon: "business", color: "#3B82F6", background: "#E8F1FF", sort_order: 4, status: "published" as Status }
  ];
  db.courses = courses.map((course) => withTimestamps(db, "courses", course));

  const courseId = (slug: string) => db.courses.find((course) => course.slug === slug)?.id ?? 1;
  const moduleRows: Array<[string, string, number, string, number, boolean]> = [
    ["gk", "Nepal geography and history", 12, "1 hr 45 min", 80, false], ["gk", "Current affairs recall", 10, "1 hr 20 min", 54, false], ["gk", "Science and technology facts", 11, "1 hr 30 min", 28, false], ["gk", "Mixed GK mock confirmation", 12, "2 hr", 0, true],
    ["iq", "Number and letter series", 8, "1 hr", 65, false], ["iq", "Analogy and classification", 8, "1 hr 10 min", 44, false], ["iq", "Direction and coding", 8, "1 hr 15 min", 22, false], ["iq", "Timed reasoning mock", 8, "1 hr 30 min", 0, true],
    ["law", "Fundamental rights and duties", 8, "1 hr 15 min", 58, false], ["law", "State structure and bodies", 7, "1 hr", 38, false], ["law", "Article number recall", 7, "55 min", 18, false], ["law", "Negative keyword practice", 6, "50 min", 0, true],
    ["admin", "Administration principles", 7, "1 hr", 48, false], ["admin", "Accountability and ethics", 6, "45 min", 36, false], ["admin", "Policy cycle", 5, "40 min", 18, false], ["admin", "Applied case practice", 6, "1 hr", 0, true]
  ];
  db.modules = moduleRows.map((row, index) => withTimestamps(db, "modules", { course_id: courseId(row[0]), title: row[1], lessons: row[2], duration: row[3], progress: row[4], locked: row[5], sort_order: index + 1 }));

  const taskRows: Array<[string | null, string, string, string, string, number, string, string, string]> = [
    ["gk", "Daily Prediction Set", "20 high-frequency GK questions with instant answer reasoning.", "12 min", "question_answer", 3, "Medium", "GK set ready", "AI will score recall speed and flag current affairs that need spaced revision."],
    ["gk", "Rapid Fact Flashcards", "Memorize dates, institutions, awards, geography, and science facts.", "7 min", "bookmark", 2, "Easy", "Flashcards ready", "Slow cards will be pinned to tomorrow's revision queue."],
    ["iq", "Speed Reasoning Drill", "Series, analogy, coding, direction, and odd-one-out under time.", "15 min", "timer", 4, "Hard", "Speed drill ready", "AI will mark time pressure, skipped steps, and shortcut opportunities."],
    ["law", "Article Recall Sprint", "Practice Constitution article numbers, rights, duties, and bodies.", "11 min", "gavel", 4, "Hard", "Law recall ready", "AI will detect article sequence confusion and generate a smaller recall chain."],
    ["admin", "Policy Concept Drill", "Connect administration principles with real Loksewa-style examples.", "13 min", "business", 3, "Medium", "Policy drill ready", "AI will compare theory recall against applied scenario selection."],
    [null, "Mini Mock Confirmation", "10 mixed questions to verify whether today's learning actually stuck.", "10 min", "assignment", 5, "Adaptive", "Mini mock ready", "The next mini mock mixes strong and weak topics so the score is not inflated."]
  ];
  db.tasks = taskRows.map((row, index) => withTimestamps(db, "tasks", { course_id: row[0] ? courseId(row[0]) : null, title: row[1], subtitle: row[2], duration: row[3], icon: row[4], score_boost: row[5], next_difficulty: row[6], alert_title: row[7], alert_message: row[8], sort_order: index + 1 }));

  const flowRows: Array<[string, string, string, string, string, string, string, "A" | "B" | "C" | "D", string, string, string[]]> = [
    ["gk", "Learn and Practice", "Which method gives the strongest long-term recall for static GK facts?", "Only reading the same page many times", "Spaced active recall with short flashcards", "Watching one long lecture without practice", "Solving only full mocks", "B", "Spaced active recall forces retrieval and repeats weak facts over time.", "Think active recall, not passive rereading.", ["Recall", "Flashcard"]],
    ["iq", "Speed Drill", "What is the first check in a number series question?", "Guess from the options", "Difference, ratio, alternating pattern, then position logic", "Always multiply by two", "Skip immediately", "B", "A stable check order avoids wasting time.", "Look for a repeatable checklist.", ["Shortcut", "Speed"]],
    ["law", "Keyword Trap", "What is the safest first action in a negative law question?", "Ignore the negative word", "Circle the negative keyword and eliminate true statements", "Choose the longest option", "Skip all article questions", "B", "Negative wording changes the task.", "The question asks for an exception.", ["Keyword", "Law"]],
    ["admin", "Case Practice", "How is accountability different from transparency?", "They mean exactly the same thing", "Transparency is visibility, accountability is responsibility for action and result", "Accountability only means publishing data", "Transparency only applies to private offices", "B", "AI feedback flags close-concept confusion.", "One term is about seeing action, the other about being answerable.", ["Concept", "Contrast"]]
  ];
  db.course_questions = flowRows.map((row, index) => withTimestamps(db, "course_questions", { course_id: courseId(row[0]), mode: row[1], prompt: row[2], option_a: row[3], option_b: row[4], option_c: row[5], option_d: row[6], correct_option: row[7], explanation: row[8], hint: row[9], tags: row[10], sort_order: index + 1 }));

  db.mistakes = [
    ["gk", "Federalism fact mix-up", "Province and local level powers confused"],
    ["iq", "Number series shortcut", "Used long calculation instead of pattern"],
    ["law", "Except keyword missed", "Selected true statement in negative question"],
    ["admin", "Policy cycle order", "Evaluation placed before implementation"]
  ].map((row, index) => withTimestamps(db, "mistakes", { course_id: courseId(row[0]), title: row[1], reason: row[2], sort_order: index + 1 }));

  const questionSeeds = [
    {
      public_id: "q_sample_constitution",
      question_text: "How many fundamental rights are guaranteed by the Constitution of Nepal?",
      option_a: "21", option_b: "31", option_c: "35", option_d: "45", correct_option: "B" as const,
      explanation: "Part 3 of the Constitution of Nepal guarantees 31 fundamental rights.",
      syllabus_category: "Constitution", exam_level: "General", exam_type: "MCQ"
    },
    {
      public_id: "q_sample_psc",
      question_text: "Which article of the Constitution of Nepal establishes the Public Service Commission?",
      option_a: "Article 240", option_b: "Article 242", option_c: "Article 244", option_d: "Article 246", correct_option: "B" as const,
      explanation: "Article 242 provides for the Public Service Commission.",
      syllabus_category: "Constitution", exam_level: "Officer", exam_type: "MCQ"
    },
    {
      public_id: "q_sample_everest",
      question_text: "What is the official height of Mount Everest announced jointly by Nepal and China?",
      option_a: "8,848 m", option_b: "8,848.86 m", option_c: "8,850 m", option_d: "8,846 m", correct_option: "B" as const,
      explanation: "The official height announced in 2020 is 8,848.86 meters.",
      syllabus_category: "Geography", exam_level: "General", exam_type: "MCQ"
    },
    {
      public_id: "q_sample_reasoning",
      question_text: "In a number series, what should you check first before complex calculation?",
      option_a: "Guess from longest option", option_b: "Difference, ratio, alternating pattern, and position logic", option_c: "Always multiply by two", option_d: "Skip the question", correct_option: "B" as const,
      explanation: "A stable pattern checklist saves time in reasoning questions.",
      syllabus_category: "IQ and Reasoning", exam_level: "General", exam_type: "MCQ"
    }
  ];
  db.questions = questionSeeds.map((question) => withTimestamps(db, "questions", {
    ...question,
    source_name: "Internal seed",
    source_url: "",
    source_license: "Internal sample",
    source_year: null,
    source_page: null,
    language: "en",
    verification_status: "verified" as const,
    verifier: "node-seed",
    verified_at: stamp,
    deleted_at: null,
    data_version: 1
  }));

  db.mocks = [withTimestamps(db, "mocks", { title: "Loksewa General Practice", description: "Starter practice set from the Node backend.", exam_level: "General", exam_type: "MCQ", syllabus_category: "Mixed", duration_minutes: 30, total_questions: db.questions.length, marks_per_correct: 1, negative_marking_enabled: true, negative_marks_per_wrong: 0.2, status: "published" as Status, question_ids: db.questions.map((question) => question.id) })];
  const prepTopicSeeds = [
    {
      subject_id: "Constitution",
      title: "Introduction to the Constitution of Nepal",
      content_beginner: "The Constitution of Nepal is the supreme law. It was promulgated on 20 September 2015.",
      content_intermediate: "The Constitution contains 35 Parts, 308 Articles, and 9 Schedules. It defines Nepal as a federal democratic republic.",
      content_advanced: "Loksewa questions often test dates, structure, article numbers, and the practical meaning of federalism, secularism, inclusion, and constitutional bodies.",
      revision_notes: "- Promulgation: 2072 Ashoj 3\n- Structure: 35 Parts, 308 Articles, 9 Schedules\n- Governance: federal, provincial, local",
      flashcards: [
        ["When was the current Constitution of Nepal promulgated?", "2072 Ashoj 3, September 20, 2015"],
        ["How many Articles are in the Constitution of Nepal?", "308 Articles"]
      ]
    },
    {
      subject_id: "Constitution",
      title: "Fundamental Rights",
      content_beginner: "Fundamental Rights are basic rights guaranteed by Part 3 of the Constitution.",
      content_intermediate: "There are 31 Fundamental Rights under Articles 16 to 46.",
      content_advanced: "Remember article ranges, rights with similar wording, and Article 46 for constitutional remedies.",
      revision_notes: "- Part 3\n- Articles 16 to 46\n- 31 rights",
      flashcards: [
        ["How many Fundamental Rights are guaranteed?", "31"],
        ["Which article gives constitutional remedies?", "Article 46"]
      ]
    },
    {
      subject_id: "Geography",
      title: "Mountains and Peaks of Nepal",
      content_beginner: "Nepal is home to Mount Everest and many Himalayan peaks.",
      content_intermediate: "Nepal has 8 of the world's 14 peaks above 8,000 meters.",
      content_advanced: "Questions usually compare peak height, mountain range, district, and first ascent details.",
      revision_notes: "- Everest: 8,848.86m\n- Nepal has 8 peaks above 8,000m\n- Mahalangur range includes Everest",
      flashcards: [
        ["What is Everest's official height?", "8,848.86 meters"],
        ["How many 8,000m+ peaks are in Nepal?", "8"]
      ]
    }
  ];
  prepTopicSeeds.forEach((topic, index) => {
    const created = withTimestamps(db, "prep_topics", {
      subject_id: topic.subject_id,
      title: topic.title,
      content_beginner: topic.content_beginner,
      content_intermediate: topic.content_intermediate,
      content_advanced: topic.content_advanced,
      revision_notes: topic.revision_notes,
      sort_order: index + 1
    });
    db.prep_topics.push(created);
    topic.flashcards.forEach(([front, back]) => {
      db.prep_flashcards.push(withTimestamps(db, "prep_flashcards", { topic_id: created.id, front, back }));
    });
  });
  db.users = [withTimestamps(db, "users", { email: BOOTSTRAP_ADMIN_EMAIL, password_hash: passwordHash(BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD), full_name: "Loksewa Admin", role: "admin" as UserRole, status: "active" as UserStatus, last_login_at: null })];
  db.scraper_sources = [withTimestamps(db, "scraper_sources", { name: "psc.gov.np live updates", start_url: "https://www.psc.gov.np", allowed_domain: "www.psc.gov.np", syllabus_category: "", max_depth: 1, max_pages: 25, refresh_minutes: 60, status: "active" as const, last_crawled_at: null })];
  return db;
}

function loadDb(): NodeDb {
  if (!existsSync(DB_PATH)) {
    const db = defaultDb();
    saveDb(db);
    return db;
  }
  const db = JSON.parse(readFileSync(DB_PATH, "utf-8")) as Partial<NodeDb>;
  return normalizeDb(db);
}

function saveDb(db: NodeDb): void {
  mkdirSync(resolve(DB_PATH, ".."), { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function normalizeDb(input: Partial<NodeDb>): NodeDb {
  const seeded = defaultDb();
  const db = { ...seeded, ...input, meta: { ...seeded.meta, ...input.meta } } as NodeDb;
  const collectionKeys: CollectionKey[] = [
    "subjects", "courses", "modules", "tasks", "course_questions", "mistakes", "syllabus", "questions", "mocks",
    "mock_attempts", "mock_answers", "users", "reports", "scraper_sources", "scraper_runs", "scraped_documents",
    "prep_topics", "prep_flashcards", "topic_progress"
  ];
  for (const key of collectionKeys) {
    if (!Array.isArray(db[key])) {
      (db as Record<string, unknown>)[key] = seeded[key];
    }
    const maxId = Math.max(0, ...(db[key] as Array<{ id?: number }>).map((item) => Number(item.id) || 0));
    db.meta.next_id[key] = Math.max(db.meta.next_id[key] ?? 1, maxId + 1);
  }
  db.sessions = input.sessions ?? {};
  return db;
}

validateRuntimeConfig();
const db = loadDb();

function publicUser(user: User) {
  const { password_hash: _password, ...safe } = user;
  return safe;
}

function subjectFor(course: Course): Subject | undefined {
  return db.subjects.find((subject) => subject.id === course.subject_id);
}

function courseOut(course: Course) {
  const subject = subjectFor(course);
  return { ...course, subject_slug: subject?.slug ?? "", subject_title: subject?.title ?? "" };
}

function courseDetail(identifier: string, publishedOnly = false) {
  const course = db.courses.find((item) => String(item.id) === identifier || item.slug === identifier);
  if (!course || (publishedOnly && course.status !== "published")) return null;
  return {
    course: courseOut(course),
    modules: db.modules.filter((item) => item.course_id === course.id).sort((a, b) => a.sort_order - b.sort_order),
    tasks: db.tasks.filter((item) => item.course_id === course.id || item.course_id === null).sort((a, b) => a.sort_order - b.sort_order),
    questions: db.course_questions.filter((item) => item.course_id === course.id).sort((a, b) => a.sort_order - b.sort_order),
    mistakes: db.mistakes.filter((item) => item.course_id === course.id).sort((a, b) => a.sort_order - b.sort_order)
  };
}

function tokenFor(user: User): string {
  const token = `node_${randomBytes(24).toString("hex")}`;
  const expires = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000).toISOString();
  db.sessions[sessionKeyFor(token)] = { user_id: user.id, expires_at: expires };
  saveDb(db);
  return token;
}

async function googleProfileFromBody(body: {
  id_token?: string;
  idToken?: string;
  email?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  picture?: string;
  picture_url?: string;
  pictureUrl?: string;
  sub?: string;
}) {
  const idToken = sanitizeText(body.id_token ?? body.idToken, 4096);
  const configuredClientId = sanitizeText(process.env.GOOGLE_CLIENT_ID, 256);

  if (idToken && configuredClientId) {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
      signal: AbortSignal.timeout(Number(process.env.GOOGLE_TOKENINFO_TIMEOUT_MS ?? 8000))
    });
    if (!response.ok) {
      throw new Error("Google token verification failed");
    }
    const tokenInfo = await response.json() as {
      aud?: string;
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      picture?: string;
    };
    if (tokenInfo.aud !== configuredClientId) {
      throw new Error("Google token audience does not match this backend");
    }
    if (tokenInfo.email_verified !== true && tokenInfo.email_verified !== "true") {
      throw new Error("Google account email is not verified");
    }
    return {
      email: sanitizeText(tokenInfo.email, 320).toLowerCase(),
      fullName: sanitizeText(tokenInfo.name, 160),
      pictureUrl: sanitizeText(tokenInfo.picture, 600),
      googleSub: sanitizeText(tokenInfo.sub, 160)
    };
  }

  if (IS_PRODUCTION) {
    throw new Error("Google ID token is required in production");
  }

  const email = sanitizeText(body.email, 320).toLowerCase();
  if (!email) {
    throw new Error("Google email is required for development login");
  }
  return {
    email,
    fullName: sanitizeText(body.full_name ?? body.fullName ?? body.name, 160) || "Loksewa Student",
    pictureUrl: sanitizeText(body.picture_url ?? body.pictureUrl ?? body.picture, 600),
    googleSub: sanitizeText(body.sub, 160) || `dev:${email}`
  };
}

async function handleGoogleLogin(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as Parameters<typeof googleProfileFromBody>[0];
  try {
    const profile = await googleProfileFromBody(body ?? {});
    if (!profile.email.includes("@")) {
      return reply.status(400).send({ detail: "Valid Google email is required" });
    }

    let user = db.users.find((item) => item.email.toLowerCase() === profile.email);
    if (user?.status === "disabled") {
      return reply.status(403).send({ detail: "Account is disabled" });
    }

    if (user) {
      user.full_name = profile.fullName || user.full_name || "Loksewa Student";
      user.auth_provider = "google";
      user.google_sub = profile.googleSub || user.google_sub || null;
      user.picture_url = profile.pictureUrl || user.picture_url || null;
      user.last_login_at = now();
      user.updated_at = now();
      saveDb(db);
    } else {
      user = createItem("users", {
        email: profile.email,
        password_hash: passwordHash(profile.email, randomUUID()),
        full_name: profile.fullName || "Loksewa Student",
        role: "student" as UserRole,
        status: "active" as UserStatus,
        last_login_at: now(),
        auth_provider: "google" as const,
        google_sub: profile.googleSub || null,
        picture_url: profile.pictureUrl || null
      }) as User;
    }

    const token = tokenFor(user);
    const expiresAt = sessionForToken(token)?.expires_at;
    return {
      token,
      accessToken: token,
      refreshToken: token,
      expires_at: expiresAt,
      expiresAt,
      user: publicUser(user)
    };
  } catch (error) {
    request.log.warn({ error, ip: normalizedClientIp(request) }, "Google login rejected");
    return reply.status(401).send({
      detail: error instanceof Error ? error.message : "Google login failed"
    });
  }
}

function sessionForToken(token: string): { user_id: number; expires_at: string } | null {
  const key = sessionKeyFor(token);
  const session = db.sessions[key] ?? db.sessions[token];
  if (session && db.sessions[token]) {
    db.sessions[key] = session;
    delete db.sessions[token];
    saveDb(db);
  }
  return session ?? null;
}

function currentUser(request: FastifyRequest): User | null {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
  const session = token ? sessionForToken(token) : null;
  if (!session || new Date(session.expires_at).getTime() < Date.now()) return null;
  return db.users.find((user) => user.id === session.user_id) ?? null;
}

function requireAdmin(request: FastifyRequest, reply: FastifyReply): User | null {
  if (request.headers["x-admin-token"] === ADMIN_TOKEN) {
    return db.users.find((user) => user.role === "admin") ?? null;
  }
  const user = currentUser(request);
  if (!user || user.role !== "admin") {
    reply.status(401).send({ detail: "Admin access required" });
    return null;
  }
  return user;
}

function upsertById<T extends DbRecord>(items: T[], id: number, payload: Partial<T>): T | null {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return null;
  items[index] = { ...items[index], ...payload, id, updated_at: now() };
  saveDb(db);
  return items[index];
}

function sendFile(reply: FastifyReply, filePath: string): FastifyReply {
  const mime: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon" };
  reply.header("Content-Type", mime[extname(filePath).toLowerCase()] ?? "application/octet-stream");
  return reply.send(readFileSync(filePath));
}

function createItem<T extends object>(bucket: CollectionKey, payload: T) {
  const item = withTimestamps(db, bucket, payload);
  (db[bucket] as unknown as Array<T & DbRecord>).push(item);
  saveDb(db);
  return item;
}

function applySecurityHeaders(reply: FastifyReply): void {
  reply.header("X-Content-Type-Options", "nosniff");
  reply.header("X-Frame-Options", "DENY");
  reply.header("Referrer-Policy", "no-referrer");
  reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  reply.header("Cross-Origin-Resource-Policy", "same-origin");
  if (IS_PRODUCTION) {
    reply.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    reply.header("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  }
}

function requireUser(request: FastifyRequest, reply: FastifyReply): User | null {
  const user = currentUser(request);
  if (!user || user.status !== "active") {
    reply.status(401).send({ detail: "Authentication required" });
    return null;
  }
  return user;
}

function searchQuestions(queryText: string, limit = 3) {
  const terms = queryText.toLowerCase().split(/\s+/).filter((term) => term.length > 1);
  return db.questions
    .filter((item) => !item.deleted_at && item.verification_status === "verified")
    .map((question) => {
      const haystack = `${question.question_text} ${question.syllabus_category} ${question.explanation}`.toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      return { question, score };
    })
    .filter((item) => item.score > 0 || !terms.length)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({ question: item.question, bm25_score: item.score || 1, similarity: terms.length ? item.score / terms.length : 1 }));
}

type QuestionListQuery = {
  page?: string | number;
  limit?: string | number;
  topic?: string;
  subjectId?: string;
  subject_id?: string;
  difficulty?: string;
};

function listVerifiedQuestions(query: QuestionListQuery) {
  const limit = Math.max(1, Math.min(200, Number(query.limit) || 50));
  const page = Math.max(1, Number(query.page) || 1);
  const topic = query.topic || query.subjectId || query.subject_id;
  const difficulty = query.difficulty?.toLowerCase();
  const start = (page - 1) * limit;
  return db.questions
    .filter((item) => {
      if (item.deleted_at || item.verification_status !== "verified") return false;
      if (topic && item.syllabus_category !== topic) return false;
      if (difficulty && item.exam_level?.toLowerCase() !== difficulty) return false;
      return true;
    })
    .slice(start, start + limit);
}

function findQuestion(identifier: string) {
  return db.questions.find((item) => String(item.id) === identifier || item.public_id === identifier);
}

function attemptQuestions(mock: MockTest): Question[] {
  const explicit = mock.question_ids
    .map((id) => db.questions.find((question) => question.id === id && !question.deleted_at))
    .filter((question): question is Question => Boolean(question));
  return (explicit.length ? explicit : db.questions.filter((question) => !question.deleted_at && question.verification_status === "verified"))
    .slice(0, mock.total_questions || 50);
}

function mockAttemptOut(attempt: MockAttempt) {
  const mock = db.mocks.find((item) => item.id === attempt.mock_test_id);
  const questions = mock ? attemptQuestions(mock) : [];
  const payload = {
    ...attempt,
    mock_test: mock,
    mockTest: mock,
    questions: questions.map((question, index) => ({
      id: question.id,
      position: index + 1,
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      syllabus_category: question.syllabus_category,
      correct_option: question.correct_option,
      explanation: question.explanation
    }))
  };
  return payload;
}

function recalculateAttempt(attempt: MockAttempt): MockAttempt {
  const mock = db.mocks.find((item) => item.id === attempt.mock_test_id);
  if (!mock) return attempt;
  const questions = attemptQuestions(mock);
  const answers = db.mock_answers.filter((answer) => answer.attempt_id === attempt.id);
  let correct = 0;
  let wrong = 0;
  for (const answer of answers) {
    if (!answer.selected_option) continue;
    if (answer.is_correct) correct += 1;
    else wrong += 1;
  }
  attempt.correct_count = correct;
  attempt.wrong_count = wrong;
  attempt.unanswered_count = Math.max(0, questions.length - answers.filter((answer) => answer.selected_option).length);
  attempt.score = correct * mock.marks_per_correct - wrong * (mock.negative_marking_enabled ? mock.negative_marks_per_wrong : 0);
  attempt.total_questions = questions.length;
  attempt.total_marks = questions.length * mock.marks_per_correct;
  attempt.updated_at = now();
  return attempt;
}

function userStats(userId: number) {
  const attempts = db.mock_attempts.filter((attempt) => attempt.user_id === userId);
  const completed = attempts.filter((attempt) => attempt.status === "submitted");
  const percentages = completed.map((attempt) => attempt.total_marks ? (attempt.score / attempt.total_marks) * 100 : 0);
  return {
    total_mocks_taken: attempts.length,
    total_mocks_completed: completed.length,
    average_score: percentages.length ? percentages.reduce((sum, value) => sum + value, 0) / percentages.length : 0,
    correct_rate: completed.length ? (completed.reduce((sum, attempt) => sum + attempt.correct_count, 0) / Math.max(1, completed.reduce((sum, attempt) => sum + attempt.total_questions, 0))) * 100 : 0,
    total_questions_answered: completed.reduce((sum, attempt) => sum + attempt.correct_count + attempt.wrong_count, 0),
    best_score: percentages.length ? Math.max(...percentages) : 0,
    categories_studied: [...new Set(db.questions.map((question) => question.syllabus_category).filter(Boolean))]
  };
}

function topicOut(topic: PrepTopic, userId: number) {
  const progress = db.topic_progress.find((item) => item.topic_id === topic.id && item.user_id === userId);
  return { ...topic, completion_percentage: progress?.completion_percentage ?? 0 };
}

async function runScraper(sourceId?: number, maxPages?: number): Promise<ScraperRun[]> {
  const sources = db.scraper_sources.filter((source) => source.status === "active" && (!sourceId || source.id === sourceId));
  const runs: ScraperRun[] = [];
  for (const source of sources) {
    const started = now();
    const run: ScraperRun = { id: idFor(db, "scraper_runs"), source_id: source.id, status: "running", started_at: started, finished_at: null, pages_seen: 0, pages_saved: 0, pages_skipped: 0, message: "" };
    db.scraper_runs.push(run);
    try {
      const parsed = new URL(source.start_url);
      const allowed = (source.allowed_domain || parsed.hostname).toLowerCase().replace(/^www\./, "");
      const current = parsed.hostname.toLowerCase().replace(/^www\./, "");
      if (current !== allowed && !current.endsWith(`.${allowed}`)) {
        throw new Error(`Blocked scraper source outside allowed domain: ${parsed.hostname}`);
      }
      if ((maxPages ?? source.max_pages) < 1) {
        throw new Error("Scraper max_pages must be at least 1");
      }
      const response = await fetch(source.start_url, {
        headers: { "User-Agent": SCRAPER_USER_AGENT },
        signal: AbortSignal.timeout(Number(process.env.LOKSEWA_SCRAPER_REQUEST_TIMEOUT_MS ?? 12_000))
      });
      run.pages_seen = 1;
      const html = await response.text();
      const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || source.name;
      if (response.ok && text.length > 250) {
        const category = source.syllabus_category || "Loksewa Updates";
        const content = `${text.slice(0, 30000)}\n\nSource URL: ${source.start_url}\nFetched at: ${now()}`;
        const hash = sha256(content);
        const syllabus = createItem("syllabus", { title, content, category, source_name: source.name, source_year: null, verified_at: now() }) as Syllabus;
        db.scraped_documents.push({ id: idFor(db, "scraped_documents"), source_id: source.id, syllabus_entry_id: syllabus.id, url: source.start_url, title, content, content_hash: hash, syllabus_category: category, extracted_at: now(), last_seen_at: now() });
        run.pages_saved = 1;
      } else {
        run.pages_skipped = 1;
      }
      source.last_crawled_at = now();
      source.updated_at = now();
      run.status = "completed";
      run.message = "completed";
    } catch (error) {
      run.status = "failed";
      run.message = error instanceof Error ? error.message : "Scraper failed";
    }
    run.finished_at = now();
    runs.push(run);
  }
  saveDb(db);
  return runs.slice(0, maxPages ?? runs.length);
}

export async function buildApp(): Promise<FastifyInstance> {
  validateRuntimeConfig();
  const app = Fastify({
    bodyLimit: REQUEST_BODY_LIMIT_BYTES,
    logger: { level: process.env.LOG_LEVEL ?? "info" },
    trustProxy: TRUST_PROXY,
    rewriteUrl(req) {
      const url = req.url ?? "";
      if (url.startsWith("/api/")) {
        if (url.startsWith("/api/users/me/stats")) {
          return url.replace("/api/users/me/stats", "/v1/users/me/stats");
        } else if (url.startsWith("/api/users/me")) {
          if (req.method === "GET") {
            return url.replace("/api/users/me", "/v1/auth/me");
          } else if (req.method === "PATCH") {
            return url.replace("/api/users/me", "/v1/users/me");
          }
        } else if (url.startsWith("/api/analytics/stats")) {
          return url.replace("/api/analytics/stats", "/v1/stats/me");
        } else if (url.startsWith("/api/mock-tests/published") || url.startsWith("/api/mock-tests")) {
          return url.replace("/api/mock-tests", "/v1/mock-tests");
        } else if (url.startsWith("/api/tests/") && url.includes("/results")) {
          const attemptId = url.split("/")[3];
          return `/v1/mock-attempts/${attemptId}`;
        } else if (url.startsWith("/api/lessons/")) {
          const questionId = url.split("/")[3];
          return `/v1/questions/${questionId}/ai-lesson`;
        } else if (url.startsWith("/api/questions")) {
          return url;
        } else if (!url.startsWith("/api/auth/google") &&
                   !url.startsWith("/api/subjects") &&
                   !url.startsWith("/api/questions/search") &&
                   !url.startsWith("/api/analytics/") &&
                   !url.startsWith("/api/tutor/") &&
                   !url.startsWith("/api/scan") &&
                   !url.startsWith("/api/subscription/") &&
                   !url.startsWith("/api/learning/") &&
                   !url.startsWith("/api/lessons") &&
                   !url.startsWith("/api/progress") &&
                   !url.startsWith("/api/flashcards")) {
          return url.replace("/api/", "/v1/");
        }
      }
      return url;
    }
  });
  app.addHook("onRequest", async (request, reply) => {
    const forwardedProto = request.headers["x-forwarded-proto"];
    const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
    if (IS_PRODUCTION && ENFORCE_HTTPS && proto && proto.split(",")[0].trim().toLowerCase() !== "https") {
      const host = request.headers["x-forwarded-host"] ?? request.headers.host;
      return reply.redirect(`https://${host}${request.url}`, 308);
    }
  });
  app.addHook("onSend", async (_request, reply, payload) => {
    applySecurityHeaders(reply);
    return payload;
  });
  await app.register(rateLimit, {
    global: true,
    max: RATE_LIMIT_MAX,
    timeWindow: RATE_LIMIT_WINDOW,
    keyGenerator: normalizedClientIp,
    errorResponseBuilder: () => ({ detail: "Too many requests. Please try again later." })
  });
  await app.register(cors, {
    origin: IS_PRODUCTION ? CORS_ORIGINS : true,
    credentials: true
  });
  if (!IS_PRODUCTION) {
    await app.register(swagger, { openapi: { info: { title: "Loksewa AI Node Backend", version: "1.0.0" } } });
    await app.register(swaggerUi, { routePrefix: "/docs" });
  }

  app.get("/healthz", async () => ({ status: "ok", runtime: "node", service: "loksewa-ai-fullstack" }));
  app.get("/v1/metadata", async () => ({ schema_version: db.meta.schema_version, data_version: String(db.meta.data_version), database_kind: "node_json_fullstack" }));

  app.post("/v1/auth/login", { config: { rateLimit: { max: AUTH_RATE_LIMIT_MAX, timeWindow: AUTH_RATE_LIMIT_WINDOW } } }, async (request, reply) => {
    const body = request.body as { email?: string; password?: string; client_type?: string };
    const email = sanitizeText(body.email, 320).toLowerCase();
    const user = db.users.find((item) => item.email.toLowerCase() === email);
    if (user && verifyPassword(email, body.password ?? "", user.password_hash) && !user.password_hash.startsWith("pbkdf2_sha256$")) {
      user.password_hash = passwordHash(email, body.password ?? "");
    }
    if (!user || user.status !== "active") {
      request.log.warn({ email, client_type: body.client_type, ip: normalizedClientIp(request) }, "Failed login attempt");
      return reply.status(401).send({ detail: "Invalid credentials" });
    }
    if (!verifyPassword(email, body.password ?? "", user.password_hash)) {
      request.log.warn({ email, client_type: body.client_type, ip: normalizedClientIp(request) }, "Failed login attempt");
      return reply.status(401).send({ detail: "Invalid credentials" });
    }
    if (body.client_type === "admin" && user.role !== "admin") {
      request.log.warn({ email, ip: normalizedClientIp(request) }, "Rejected non-admin dashboard login");
      return reply.status(403).send({ detail: "Admin account required" });
    }
    user.last_login_at = now();
    user.updated_at = now();
    const token = tokenFor(user);
    return { token, user: publicUser(user), expires_at: sessionForToken(token)?.expires_at };
  });

  app.post("/v1/auth/register", async (request, reply) => {
    const body = request.body as { email?: string; password?: string; full_name?: string };
    const email = sanitizeText(body.email, 320).toLowerCase();
    if (!email || !body.password) return reply.status(400).send({ detail: "Email and password are required" });
    if (db.users.some((user) => user.email.toLowerCase() === email)) return reply.status(409).send({ detail: "Email already exists" });
    const user = createItem("users", { email, password_hash: passwordHash(email, body.password), full_name: sanitizeText(body.full_name, 160), role: "student" as UserRole, status: "active" as UserStatus, last_login_at: null }) as User;
    const token = tokenFor(user);
    return reply.status(201).send({ token, user: publicUser(user), expires_at: sessionForToken(token)?.expires_at });
  });

  app.post("/v1/auth/google", { config: { rateLimit: { max: AUTH_RATE_LIMIT_MAX, timeWindow: AUTH_RATE_LIMIT_WINDOW } } }, handleGoogleLogin);
  app.post("/api/auth/google", { config: { rateLimit: { max: AUTH_RATE_LIMIT_MAX, timeWindow: AUTH_RATE_LIMIT_WINDOW } } }, handleGoogleLogin);

  app.post("/v1/auth/forgot-password", { config: { rateLimit: { max: AUTH_RATE_LIMIT_MAX, timeWindow: AUTH_RATE_LIMIT_WINDOW } } }, async (request, reply) => {
    const body = request.body as { email?: string };
    const email = sanitizeText(body.email, 320).toLowerCase();
    if (!email || !email.includes("@")) {
      return reply.status(400).send({ detail: "Valid email is required" });
    }
    request.log.info({ email }, "Password reset requested");
    return reply.status(202).send({
      detail: "If this account exists, password reset instructions will be sent."
    });
  });

  app.get("/v1/auth/me", async (request, reply) => {
    const user = currentUser(request);
    if (!user) return reply.status(401).send({ detail: "Authentication required" });
    return publicUser(user);
  });
  app.post("/v1/auth/logout", async (request, reply) => {
    const token = request.headers.authorization?.replace("Bearer ", "");
    if (token) delete db.sessions[token];
    if (token) delete db.sessions[sessionKeyFor(token)];
    saveDb(db);
    return reply.status(204).send();
  });

  app.get("/v1/subjects", async () => db.subjects.filter((item) => item.status === "published"));
  app.get("/v1/courses", async (request) => {
    const query = request.query as { subject_id?: string };
    return db.courses.filter((item) => item.status === "published" && (!query.subject_id || item.subject_id === Number(query.subject_id))).map(courseOut);
  });
  app.get("/v1/courses/:identifier", async (request, reply) => {
    const detail = courseDetail((request.params as { identifier: string }).identifier, true);
    return detail ?? reply.status(404).send({ detail: "Published course not found" });
  });

  app.get("/v1/questions", async (request) => listVerifiedQuestions(request.query as QuestionListQuery));
  app.get("/v1/questions/:id", async (request, reply) => {
    const question = findQuestion((request.params as { id: string }).id);
    return question ?? reply.status(404).send({ detail: "Question not found" });
  });
  app.get("/v1/questions/:id/ai-lesson", async (request, reply) => {
    const question = db.questions.find((item) => item.id === Number((request.params as { id: string }).id));
    if (!question) return reply.status(404).send({ detail: "Question not found" });
    const correctText = question[`option_${question.correct_option.toLowerCase()}` as keyof Question];
    return {
      lesson_simple: `The verified answer is option ${question.correct_option}: ${correctText}. ${question.explanation}`,
      lesson_detailed: `Read the question carefully, identify the syllabus area (${question.syllabus_category}), eliminate unrelated options, then match the exact constitutional or factual clue. ${question.explanation}`,
      exam_notes: `Exam pattern: this topic often repeats with changed wording. Store the key fact and practice one near-transfer question.`,
      mnemonic: `Remember: ${question.syllabus_category} first, keyword second, exact option last.`,
      flashcards: [
        { front: question.question_text, back: `Option ${question.correct_option}: ${correctText}` },
        { front: `Why is option ${question.correct_option} correct?`, back: question.explanation }
      ],
      related_mcqs: searchQuestions(question.syllabus_category, 3).map((match) => match.question)
    };
  });
  app.get("/v1/categories", async () => [...new Set(db.questions.map((item) => item.syllabus_category).filter(Boolean))]);
  app.post("/v1/search", async (request) => {
    const body = request.body as { query?: string; limit?: number };
    const matches = searchQuestions(body.query ?? "", body.limit ?? 3);
    return { answer_source: matches.length ? "verified_db" : "uncertain", threshold_reason: "Node full-stack search", query: body.query ?? "", matches };
  });

  app.get("/v1/mock-tests", async () => db.mocks.filter((item) => item.status === "published"));
  app.get("/v1/mock-tests/:id", async (request, reply) => {
    const mock = db.mocks.find((item) => item.id === Number((request.params as { id: string }).id));
    return mock ?? reply.status(404).send({ detail: "Mock test not found" });
  });
  app.post("/v1/mock-tests/:id/start", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return reply;
    const mock = db.mocks.find((item) => item.id === Number((request.params as { id: string }).id) && item.status === "published");
    if (!mock) return reply.status(404).send({ detail: "Mock test not found" });
    const questions = attemptQuestions(mock);
    const stamp = now();
    const attempt = createItem("mock_attempts", {
      user_id: user.id,
      mock_test_id: mock.id,
      started_at: stamp,
      ends_at: new Date(Date.now() + mock.duration_minutes * 60 * 1000).toISOString(),
      submitted_at: null,
      status: "in_progress" as MockAttemptStatus,
      score: 0,
      correct_count: 0,
      wrong_count: 0,
      unanswered_count: questions.length,
      total_questions: questions.length,
      total_marks: questions.length * mock.marks_per_correct
    }) as MockAttempt;
    return reply.status(201).send(mockAttemptOut(attempt));
  });
  app.get("/v1/mock-attempts/:id", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return reply;
    const attempt = db.mock_attempts.find((item) => item.id === Number((request.params as { id: string }).id) && item.user_id === user.id);
    return attempt ? mockAttemptOut(attempt) : reply.status(404).send({ detail: "Attempt not found" });
  });
  async function answerAttempt(request: FastifyRequest, reply: FastifyReply) {
    const user = requireUser(request, reply);
    if (!user) return reply;
    const attempt = db.mock_attempts.find((item) => item.id === Number((request.params as { id: string }).id) && item.user_id === user.id);
    if (!attempt || attempt.status !== "in_progress") return reply.status(404).send({ detail: "Active attempt not found" });
    const body = request.body as { question_id?: number; selected_option?: "A" | "B" | "C" | "D" };
    const question = db.questions.find((item) => item.id === Number(body.question_id));
    if (!question || !body.selected_option) return reply.status(400).send({ detail: "question_id and selected_option are required" });
    const mock = db.mocks.find((item) => item.id === attempt.mock_test_id);
    const existing = db.mock_answers.find((item) => item.attempt_id === attempt.id && item.question_id === question.id);
    const isCorrect = question.correct_option === body.selected_option;
    const marks = isCorrect ? (mock?.marks_per_correct ?? 1) : -(mock?.negative_marking_enabled ? mock.negative_marks_per_wrong : 0);
    if (existing) {
      Object.assign(existing, { selected_option: body.selected_option, is_correct: isCorrect, marks_awarded: marks, answered_at: now(), updated_at: now() });
    } else {
      db.mock_answers.push(withTimestamps(db, "mock_answers", { attempt_id: attempt.id, question_id: question.id, selected_option: body.selected_option, is_correct: isCorrect, marks_awarded: marks, answered_at: now() }));
    }
    recalculateAttempt(attempt);
    saveDb(db);
    return mockAttemptOut(attempt);
  }
  app.post("/v1/mock-attempts/:id/answers", answerAttempt);
  app.post("/v1/mock-tests/attempts/:id/answer", answerAttempt);
  async function submitAttempt(request: FastifyRequest, reply: FastifyReply) {
    const user = requireUser(request, reply);
    if (!user) return reply;
    const attempt = db.mock_attempts.find((item) => item.id === Number((request.params as { id: string }).id) && item.user_id === user.id);
    if (!attempt) return reply.status(404).send({ detail: "Attempt not found" });
    recalculateAttempt(attempt);
    attempt.status = "submitted";
    attempt.submitted_at = now();
    attempt.updated_at = now();
    saveDb(db);
    const payload = mockAttemptOut(attempt);
    return { attempt: payload, answers: db.mock_answers.filter((answer) => answer.attempt_id === attempt.id) };
  }
  app.post("/v1/mock-attempts/:id/submit", submitAttempt);
  app.post("/v1/mock-tests/attempts/:id/submit", submitAttempt);
  app.get("/v1/stats/me", async (request, reply) => {
    const user = requireUser(request, reply);
    return user ? userStats(user.id) : reply;
  });
  app.get("/v1/users/me/stats", async (request, reply) => {
    const user = requireUser(request, reply);
    return user ? userStats(user.id) : reply;
  });
  app.get("/v1/preparation/subjects", async () => [...new Set(db.prep_topics.map((topic) => topic.subject_id))]);
  app.get("/v1/preparation/subjects/:subjectId/topics", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return reply;
    const subjectId = decodeURIComponent((request.params as { subjectId: string }).subjectId);
    return db.prep_topics.filter((topic) => topic.subject_id === subjectId).sort((a, b) => a.sort_order - b.sort_order).map((topic) => topicOut(topic, user.id));
  });
  app.get("/v1/preparation/topics/:id", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return reply;
    const topic = db.prep_topics.find((item) => item.id === Number((request.params as { id: string }).id));
    if (!topic) return reply.status(404).send({ detail: "Topic not found" });
    return {
      topic: topicOut(topic, user.id),
      completion_percentage: topicOut(topic, user.id).completion_percentage,
      flashcards: db.prep_flashcards.filter((card) => card.topic_id === topic.id),
      questions: db.questions.filter((question) => question.syllabus_category === topic.subject_id && !question.deleted_at).slice(0, 5)
    };
  });
  app.post("/v1/preparation/topics/:id/progress", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return reply;
    const topicId = Number((request.params as { id: string }).id);
    const body = request.body as { completion_percentage?: number };
    const existing = db.topic_progress.find((item) => item.user_id === user.id && item.topic_id === topicId);
    if (existing) {
      existing.completion_percentage = Math.max(0, Math.min(100, Number(body.completion_percentage ?? 0)));
      existing.last_studied_at = now();
      existing.updated_at = now();
    } else {
      db.topic_progress.push(withTimestamps(db, "topic_progress", { user_id: user.id, topic_id: topicId, completion_percentage: Math.max(0, Math.min(100, Number(body.completion_percentage ?? 0))), questions_attempted: 0, questions_correct: 0, time_spent_minutes: 0, last_studied_at: now() }));
    }
    saveDb(db);
    return reply.status(204).send();
  });
  app.post("/v1/ai-tutor/ask", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return reply;
    const body = request.body as { query?: string };
    const matches = searchQuestions(body.query ?? "", 3);
    const citations = matches.map((match) => ({ source_type: "question", source_name: match.question.source_name, title: match.question.question_text, id: match.question.id }));
    const answer = matches.length
      ? `I found this in the verified question bank: ${matches[0].question.explanation}`
      : "I could not find a verified match yet. Add the topic in the admin syllabus, then rerun scraper or create verified MCQs.";
    return { answer, citations, confidence: matches.length ? "verified_db" : "uncertain" };
  });
  app.get("/v1/sync/delta", async (request) => {
    const query = request.query as { since_version?: string };
    const since = Number(query.since_version ?? 0);
    const changes = db.questions.filter((question) => question.data_version > since);
    const payload = { since_version: since, data_version: db.meta.data_version, questions: changes, deleted_question_ids: [] };
    return { ...payload, signature: signPayload(payload) };
  });
  app.post("/v1/reports", async (request, reply) => {
    const body = request.body as Partial<Report> & { device_id?: string; deviceId?: string };
    const allowedTypes = new Set(["wrong_answer", "bad_explanation", "outdated", "typo", "other"]);
    const reportType = sanitizeText(body.report_type, 64);
    const rawDeviceId = body.device_id ?? body.deviceId;
    const report: Report = {
      id: idFor(db, "reports"),
      question_id: body.question_id === undefined || body.question_id === null ? null : Number(body.question_id),
      scanned_text: sanitizeText(body.scanned_text, 4000),
      report_type: allowedTypes.has(reportType) ? reportType : "other",
      message: sanitizeText(body.message, 2000),
      contact: sanitizeText(body.contact, 320),
      status: "open",
      created_at: now(),
      ...(rawDeviceId ? { device_hash: sha256(String(rawDeviceId)) } : {})
    };
    if (!report.message && !report.scanned_text) {
      return reply.status(400).send({ detail: "Report message or scanned_text is required" });
    }
    db.reports.push(report);
    saveDb(db);
    return reply.status(201).send({ report_id: report.id, status: report.status });
  });

  app.addHook("preHandler", async (request, reply) => {
    if (request.url.startsWith("/v1/admin/")) {
      const admin = requireAdmin(request, reply);
      if (!admin) return reply;
    }
  });

  app.get("/v1/admin/subjects", async () => db.subjects);
  app.post("/v1/admin/subjects", async (request, reply) => reply.status(201).send(createItem("subjects", { ...(request.body as object), status: normalizeStatus((request.body as { status?: unknown }).status) })));
  app.put("/v1/admin/subjects/:id", async (request, reply) => upsertById(db.subjects, Number((request.params as { id: string }).id), request.body as Partial<Subject>) ?? reply.status(404).send({ detail: "Subject not found" }));
  app.delete("/v1/admin/subjects/:id", async (request, reply) => upsertById(db.subjects, Number((request.params as { id: string }).id), { status: "archived" } as Partial<Subject>) ? reply.status(204).send() : reply.status(404).send({ detail: "Subject not found" }));

  app.get("/v1/admin/courses", async () => db.courses.map(courseOut));
  app.post("/v1/admin/courses", async (request, reply) => reply.status(201).send(courseOut(createItem("courses", { ...(request.body as object), status: normalizeStatus((request.body as { status?: unknown }).status) }) as Course)));
  app.get("/v1/admin/courses/:id/detail", async (request, reply) => courseDetail((request.params as { id: string }).id) ?? reply.status(404).send({ detail: "Course not found" }));
  app.put("/v1/admin/courses/:id", async (request, reply) => {
    const course = upsertById(db.courses, Number((request.params as { id: string }).id), request.body as Partial<Course>);
    return course ? courseOut(course) : reply.status(404).send({ detail: "Course not found" });
  });
  app.delete("/v1/admin/courses/:id", async (request, reply) => upsertById(db.courses, Number((request.params as { id: string }).id), { status: "archived" } as Partial<Course>) ? reply.status(204).send() : reply.status(404).send({ detail: "Course not found" }));

  app.get("/v1/admin/courses/:id/modules", async (request) => db.modules.filter((item) => item.course_id === Number((request.params as { id: string }).id)));
  app.post("/v1/admin/courses/:id/modules", async (request, reply) => reply.status(201).send(createItem("modules", { ...(request.body as object), course_id: Number((request.params as { id: string }).id) })));
  app.put("/v1/admin/course-modules/:id", async (request, reply) => upsertById(db.modules, Number((request.params as { id: string }).id), request.body as Partial<CourseModule>) ?? reply.status(404).send({ detail: "Module not found" }));
  app.delete("/v1/admin/course-modules/:id", async (request, reply) => { const id = Number((request.params as { id: string }).id); db.modules = db.modules.filter((item) => item.id !== id); saveDb(db); return reply.status(204).send(); });

  app.get("/v1/admin/courses/:id/tasks", async (request) => db.tasks.filter((item) => item.course_id === Number((request.params as { id: string }).id) || item.course_id === null));
  app.post("/v1/admin/courses/:id/tasks", async (request, reply) => reply.status(201).send(createItem("tasks", { ...(request.body as object), course_id: Number((request.params as { id: string }).id) })));
  app.put("/v1/admin/course-tasks/:id", async (request, reply) => upsertById(db.tasks, Number((request.params as { id: string }).id), request.body as Partial<CourseTask>) ?? reply.status(404).send({ detail: "Task not found" }));
  app.delete("/v1/admin/course-tasks/:id", async (request, reply) => { const id = Number((request.params as { id: string }).id); db.tasks = db.tasks.filter((item) => item.id !== id); saveDb(db); return reply.status(204).send(); });

  app.get("/v1/admin/courses/:id/questions", async (request) => db.course_questions.filter((item) => item.course_id === Number((request.params as { id: string }).id)));
  app.post("/v1/admin/courses/:id/questions", async (request, reply) => reply.status(201).send(createItem("course_questions", { ...(request.body as object), course_id: Number((request.params as { id: string }).id) })));
  app.put("/v1/admin/course-questions/:id", async (request, reply) => upsertById(db.course_questions, Number((request.params as { id: string }).id), request.body as Partial<CourseQuestion>) ?? reply.status(404).send({ detail: "Course question not found" }));
  app.delete("/v1/admin/course-questions/:id", async (request, reply) => { const id = Number((request.params as { id: string }).id); db.course_questions = db.course_questions.filter((item) => item.id !== id); saveDb(db); return reply.status(204).send(); });

  app.get("/v1/admin/courses/:id/mistakes", async (request) => db.mistakes.filter((item) => item.course_id === Number((request.params as { id: string }).id)));
  app.post("/v1/admin/courses/:id/mistakes", async (request, reply) => reply.status(201).send(createItem("mistakes", { ...(request.body as object), course_id: Number((request.params as { id: string }).id) })));
  app.put("/v1/admin/course-mistakes/:id", async (request, reply) => upsertById(db.mistakes, Number((request.params as { id: string }).id), request.body as Partial<CourseMistake>) ?? reply.status(404).send({ detail: "Mistake not found" }));
  app.delete("/v1/admin/course-mistakes/:id", async (request, reply) => { const id = Number((request.params as { id: string }).id); db.mistakes = db.mistakes.filter((item) => item.id !== id); saveDb(db); return reply.status(204).send(); });

  app.get("/v1/admin/questions", async () => db.questions);
  app.get("/v1/admin/questions/:id", async (request, reply) => db.questions.find((item) => item.id === Number((request.params as { id: string }).id)) ?? reply.status(404).send({ detail: "Question not found" }));
  app.post("/v1/admin/questions", async (request, reply) => reply.status(201).send(createItem("questions", { public_id: `q_${randomUUID()}`, data_version: ++db.meta.data_version, ...(request.body as object) })));
  app.put("/v1/admin/questions/:id", async (request, reply) => upsertById(db.questions, Number((request.params as { id: string }).id), { ...(request.body as object), data_version: ++db.meta.data_version } as Partial<Question>) ?? reply.status(404).send({ detail: "Question not found" }));
  app.post("/v1/admin/questions/:id/review", async (request, reply) => {
    const body = request.body as Partial<Question>;
    const question = upsertById(db.questions, Number((request.params as { id: string }).id), { ...body, data_version: ++db.meta.data_version, verified_at: body.verification_status === "verified" ? now() : body.verified_at } as Partial<Question>);
    return question ?? reply.status(404).send({ detail: "Question not found" });
  });
  app.post("/v1/admin/import-batch", async (request, reply) => {
    const body = request.body as { questions?: Array<Partial<Question>>; items?: Array<Partial<Question>>; batch_name?: string };
    const imported = (body.questions ?? body.items ?? []).map((item) => createItem("questions", {
      public_id: item.public_id ?? `q_${randomUUID()}`,
      question_text: item.question_text ?? "",
      option_a: item.option_a ?? "",
      option_b: item.option_b ?? "",
      option_c: item.option_c ?? "",
      option_d: item.option_d ?? "",
      correct_option: item.correct_option ?? "A",
      explanation: item.explanation ?? "",
      syllabus_category: item.syllabus_category ?? "",
      source_name: item.source_name ?? body.batch_name ?? "Admin import",
      source_url: item.source_url ?? "",
      source_license: item.source_license ?? "",
      source_year: item.source_year ?? null,
      source_page: item.source_page ?? null,
      exam_level: item.exam_level ?? "",
      exam_type: item.exam_type ?? "",
      language: item.language ?? "en",
      verification_status: item.verification_status ?? "needs_review",
      verifier: item.verifier ?? "",
      verified_at: item.verified_at ?? null,
      deleted_at: null,
      data_version: ++db.meta.data_version
    }));
    return reply.status(201).send({ imported_count: imported.length, questions: imported });
  });
  app.delete("/v1/admin/questions/:id", async (request, reply) => upsertById(db.questions, Number((request.params as { id: string }).id), { verification_status: "rejected", deleted_at: now() } as Partial<Question>) ? reply.status(204).send() : reply.status(404).send({ detail: "Question not found" }));

  app.get("/v1/admin/syllabus", async () => db.syllabus);
  app.post("/v1/admin/syllabus", async (request, reply) => reply.status(201).send(createItem("syllabus", request.body as object)));
  app.put("/v1/admin/syllabus/:id", async (request, reply) => upsertById(db.syllabus, Number((request.params as { id: string }).id), request.body as Partial<Syllabus>) ?? reply.status(404).send({ detail: "Syllabus not found" }));
  app.delete("/v1/admin/syllabus/:id", async (request, reply) => { const id = Number((request.params as { id: string }).id); db.syllabus = db.syllabus.filter((item) => item.id !== id); saveDb(db); return reply.status(204).send(); });

  app.get("/v1/admin/mock-tests", async () => db.mocks);
  app.post("/v1/admin/mock-tests", async (request, reply) => { const body = request.body as Partial<MockTest>; return reply.status(201).send(createItem("mocks", { ...body, total_questions: body.question_ids?.length ?? 0 })); });
  app.put("/v1/admin/mock-tests/:id", async (request, reply) => upsertById(db.mocks, Number((request.params as { id: string }).id), request.body as Partial<MockTest>) ?? reply.status(404).send({ detail: "Mock not found" }));
  app.delete("/v1/admin/mock-tests/:id", async (request, reply) => upsertById(db.mocks, Number((request.params as { id: string }).id), { status: "archived" } as Partial<MockTest>) ? reply.status(204).send() : reply.status(404).send({ detail: "Mock not found" }));

  app.get("/v1/admin/users", async () => db.users.map(publicUser));
  app.post("/v1/admin/users", async (request, reply) => {
    const body = request.body as Partial<User> & { password?: string };
    const email = (body.email ?? "").toLowerCase();
    if (!email || !body.password) return reply.status(400).send({ detail: "Email and password are required for admin-created users" });
    const user = createItem("users", { email, password_hash: passwordHash(email, body.password), full_name: body.full_name ?? "", role: body.role ?? "student", status: body.status ?? "active", last_login_at: null }) as User;
    return reply.status(201).send(publicUser(user));
  });
  app.put("/v1/admin/users/:id", async (request, reply) => {
    const body = request.body as Partial<User> & { password?: string };
    const existing = db.users.find((item) => item.id === Number((request.params as { id: string }).id));
    if (!existing) return reply.status(404).send({ detail: "User not found" });
    const payload: Partial<User> = { ...body };
    if (body.password) payload.password_hash = passwordHash((body.email ?? existing.email).toLowerCase(), body.password);
    const user = upsertById(db.users, existing.id, payload);
    return user ? publicUser(user) : reply.status(404).send({ detail: "User not found" });
  });
  app.delete("/v1/admin/users/:id", async (request, reply) => { const id = Number((request.params as { id: string }).id); db.users = db.users.filter((item) => item.id !== id); saveDb(db); return reply.status(204).send(); });

  app.get("/v1/admin/reports", async () => db.reports);
  app.put("/v1/admin/reports/:id", async (request, reply) => { const id = Number((request.params as { id: string }).id); const report = db.reports.find((item) => item.id === id); if (!report) return reply.status(404).send({ detail: "Report not found" }); Object.assign(report, request.body); saveDb(db); return report; });
  app.delete("/v1/admin/reports/:id", async (request, reply) => { const id = Number((request.params as { id: string }).id); db.reports = db.reports.filter((item) => item.id !== id); saveDb(db); return reply.status(204).send(); });

  app.get("/v1/admin/scraper/sources", async () => db.scraper_sources);
  app.post("/v1/admin/scraper/sources", async (request, reply) => reply.status(201).send(createItem("scraper_sources", request.body as object)));
  app.put("/v1/admin/scraper/sources/:id", async (request, reply) => upsertById(db.scraper_sources, Number((request.params as { id: string }).id), request.body as Partial<ScraperSource>) ?? reply.status(404).send({ detail: "Source not found" }));
  app.delete("/v1/admin/scraper/sources/:id", async (request, reply) => upsertById(db.scraper_sources, Number((request.params as { id: string }).id), { status: "archived" } as Partial<ScraperSource>) ? reply.status(204).send() : reply.status(404).send({ detail: "Source not found" }));
  app.post("/v1/admin/scraper/run", async (request) => runScraper((request.body as { source_id?: number })?.source_id, (request.body as { max_pages?: number })?.max_pages));
  app.get("/v1/admin/scraper/runs", async () => db.scraper_runs);
  app.get("/v1/admin/scraper/documents", async () => db.scraped_documents);

  app.get("/api/subjects", async () => db.subjects.filter((item) => item.status === "published").map((subject) => ({ ...subject, name: subject.title })));
  app.get("/api/questions", async (request) => listVerifiedQuestions(request.query as QuestionListQuery));
  app.get("/api/questions/search", async (request) => {
    const query = request.query as { q?: string; limit?: string };
    const matches = searchQuestions(query.q ?? "", Number(query.limit ?? 3));
    return { answer_source: matches.length ? "verified_db" : "uncertain", matches };
  });
  app.get("/api/questions/:id", async (request, reply) => {
    const question = findQuestion((request.params as { id: string }).id);
    return question ?? reply.status(404).send({ detail: "Question not found" });
  });

  app.patch("/v1/users/me", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const body = request.body as { fullName?: string; avatarUrl?: string };
    if (body.fullName) user.full_name = body.fullName;
    if (body.avatarUrl) user.picture_url = body.avatarUrl;
    user.updated_at = now();
    saveDb(db);
    return { success: true, data: publicUser(user) };
  });

  app.get("/api/analytics/weaknesses", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    return {
      success: true,
      data: [
        { id: "1", subjectId: "law", name: "Constitution article numbers", progress: 0.35, count: 5 },
        { id: "2", subjectId: "gk", name: "Federalism and Local Powers", progress: 0.54, count: 3 }
      ]
    };
  });

  app.get("/api/analytics/recommendations", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    return {
      success: true,
      data: {
        id: "rec_1",
        title: "Constitution & Polity",
        suggestion: "Practice 10 Constitution MCQs",
        reason: "Based on your weak area in Polity"
      }
    };
  });

  app.post("/api/tutor/chat", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const body = request.body as { message?: string };
    const responseMsg = `I am your AI Loksewa tutor. Regarding "${body.message ?? "study"}", let me clarify that Part 3 of the Constitution guarantees 31 fundamental rights, which is a frequent exam topic!`;
    return {
      success: true,
      data: {
        id: `msg_${randomUUID()}`,
        conversationId: "conv_default",
        role: "assistant",
        content: responseMsg,
        createdAt: now()
      }
    };
  });

  app.get("/api/tutor/conversations", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    return {
      success: true,
      data: [
        { id: "conv_default", userId: user.id, title: "Constitution & Fundamental Rights Q&A", createdAt: now() }
      ]
    };
  });

  app.post("/api/scan", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const jobId = `job_${randomUUID()}`;
    return {
      success: true,
      data: {
        id: jobId,
        userId: user.id,
        status: "completed",
        extractedText: "How many fundamental rights are in the Nepal Constitution?",
        matchedQuestion: JSON.stringify(db.questions[0]),
        createdAt: now()
      }
    };
  });

  app.get("/api/scan/:id/result", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    return {
      success: true,
      data: {
        id: (request.params as { id: string }).id,
        userId: user.id,
        status: "completed",
        extractedText: "How many fundamental rights are in the Nepal Constitution?",
        matchedQuestion: JSON.stringify(db.questions[0]),
        createdAt: now()
      }
    };
  });

  app.get("/api/subscription/plans", async (request, reply) => {
    return {
      success: true,
      data: [
        { id: "plan_free", name: "Free Tier", code: "free", price: 0.0, currency: "NPR", durationDays: 9999, featuresJson: '["Daily prediction sets", "Limited AI chat"]', isActive: true },
        { id: "plan_premium", name: "Premium Pro", code: "premium", price: 500.0, currency: "NPR", durationDays: 30, featuresJson: '["Unlimited mock tests", "Spaced flashcards", "Unlimited AI chat tutor"]', isActive: true }
      ]
    };
  });

  app.post("/api/subscription/checkout", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    return {
      success: true,
      data: {
        id: `sub_${randomUUID()}`,
        userId: user.id,
        planId: "plan_premium",
        status: "active",
        startedAt: now(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  });

  app.get("/api/subscription/current", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    return {
      success: true,
      data: {
        id: `sub_current_${user.id}`,
        userId: user.id,
        planId: "plan_free",
        status: "active",
        startedAt: now(),
        expiresAt: null
      }
    };
  });

  app.get("/api/learning/lessons", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    return {
      success: true,
      data: []
    };
  });

  app.get("/api/learning/flashcards", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    return {
      success: true,
      data: [
        { id: "fc_1", front: "When was the current Constitution of Nepal promulgated?", back: "2072 Ashoj 3, September 20, 2015", reviewCount: 0 },
        { id: "fc_2", front: "How many Articles are in the Constitution of Nepal?", back: "308 Articles", reviewCount: 0 }
      ]
    };
  });

  app.get("/api/learning/progress", async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    return {
      success: true,
      data: [
        { id: "prog_1", userId: user.id, topicId: "Constitution", completionPercentage: 45.0, questionsAttempted: 15, questionsCorrect: 12, timeSpentMinutes: 45, streakDays: 5 }
      ]
    };
  });
  if (ENABLE_ARCHITECTURE_ROUTES) {
    app.get("/architecture", async (_request, reply) => {
      const filePath = join(PROJECT_ROOT, "index.html");
      return existsSync(filePath) ? sendFile(reply, filePath) : reply.status(404).send("Architecture page not found");
    });
    app.get("/architecture.md", async (_request, reply) => {
      const filePath = join(PROJECT_ROOT, "ARCHITECTURE.md");
      return existsSync(filePath) ? sendFile(reply, filePath) : reply.status(404).send("Architecture markdown not found");
    });
  }

  app.get("/", async (_request, reply) => reply.redirect("/dashboard/"));
  app.get("/admin", async (_request, reply) => reply.redirect("/dashboard/"));
  app.get("/dashboard", async (_request, reply) => reply.redirect("/dashboard/"));
  app.get("/dashboard/*", async (request, reply) => {
    const wildcard = (request.params as { "*": string })["*"] || "index.html";
    const filePath = resolve(ADMIN_DIST, wildcard);
    if (!filePath.startsWith(ADMIN_DIST) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      return sendFile(reply, join(ADMIN_DIST, "index.html"));
    }
    return sendFile(reply, filePath);
  });

  if (ENABLE_SCRAPER) {
    const scraperTimer = setInterval(() => {
      void runScraper().catch((error) => app.log.warn({ error }, "Background scraper skipped"));
    }, Number(process.env.SCRAPER_INTERVAL_MS ?? 60 * 60 * 1000));
    scraperTimer.unref?.();
  }

  return app;
}

export async function startApp(): Promise<void> {
  const app = await buildApp();
  await app.listen({ host: HOST, port: PORT });
}
