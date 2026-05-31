import "dotenv/config";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
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
type User = DbRecord & { email: string; password_hash: string; full_name: string; role: UserRole; status: UserStatus; last_login_at: string | null };
type Report = { id: number; question_id: number | null; scanned_text: string; report_type: string; message: string; contact: string; status: string; created_at: string };
type ScraperSource = DbRecord & { name: string; start_url: string; allowed_domain: string; syllabus_category: string; max_depth: number; max_pages: number; refresh_minutes: number; status: "active" | "paused" | "archived"; last_crawled_at: string | null };
type ScraperRun = { id: number; source_id: number | null; status: "running" | "completed" | "failed"; started_at: string; finished_at: string | null; pages_seen: number; pages_saved: number; pages_skipped: number; message: string };
type ScrapedDocument = { id: number; source_id: number; syllabus_entry_id: number | null; url: string; title: string; content: string; content_hash: string; syllabus_category: string; extracted_at: string; last_seen_at: string };

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
  users: User[];
  reports: Report[];
  scraper_sources: ScraperSource[];
  scraper_runs: ScraperRun[];
  scraped_documents: ScrapedDocument[];
};

type CollectionKey = Exclude<keyof NodeDb, "meta" | "sessions">;

const PORT = Number(process.env.PORT ?? 8000);
const HOST = process.env.HOST ?? "127.0.0.1";
const PROJECT_ROOT = resolve(process.cwd(), "..");
const DB_PATH = resolve(process.env.NODE_BACKEND_DB_PATH ?? join(PROJECT_ROOT, "runtime", "node-backend-db.json"));
const ADMIN_DIST = resolve(process.env.ADMIN_DIST_PATH ?? join(PROJECT_ROOT, "admin-dashboard", "dist"));
const ADMIN_TOKEN = process.env.LOKSEWA_ADMIN_TOKEN ?? "dev-admin-token-change-me";
const SESSION_HOURS = Number(process.env.SESSION_TTL_HOURS ?? 168);

function now(): string {
  return new Date().toISOString();
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function passwordHash(email: string, password: string): string {
  return sha256(`${email.toLowerCase()}::${password}`);
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
    users: [],
    reports: [],
    scraper_sources: [],
    scraper_runs: [],
    scraped_documents: []
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

  db.questions = [withTimestamps(db, "questions", {
    public_id: "q_sample_constitution",
    question_text: "How many fundamental rights are guaranteed by the Constitution of Nepal?",
    option_a: "21", option_b: "31", option_c: "35", option_d: "45", correct_option: "B" as const,
    explanation: "Part 3 of the Constitution of Nepal guarantees 31 fundamental rights.",
    syllabus_category: "Constitution and Law", source_name: "Internal seed", source_url: "", source_license: "Internal sample", source_year: null, source_page: null,
    exam_level: "General", exam_type: "MCQ", language: "en", verification_status: "verified" as const, verifier: "node-seed", verified_at: stamp, deleted_at: null, data_version: 1
  })];

  db.mocks = [withTimestamps(db, "mocks", { title: "Loksewa General Practice", description: "Starter practice set from the Node backend.", exam_level: "General", exam_type: "MCQ", syllabus_category: "Mixed", duration_minutes: 30, total_questions: 1, marks_per_correct: 1, negative_marking_enabled: true, negative_marks_per_wrong: 0.2, status: "published" as Status, question_ids: [1] })];
  db.users = [withTimestamps(db, "users", { email: "admin@loksewa.local", password_hash: passwordHash("admin@loksewa.local", "LoksewaAdmin@123"), full_name: "Loksewa Admin", role: "admin" as UserRole, status: "active" as UserStatus, last_login_at: null })];
  db.scraper_sources = [withTimestamps(db, "scraper_sources", { name: "psc.gov.np live updates", start_url: "https://www.psc.gov.np", allowed_domain: "www.psc.gov.np", syllabus_category: "", max_depth: 1, max_pages: 25, refresh_minutes: 60, status: "active" as const, last_crawled_at: null })];
  return db;
}

function loadDb(): NodeDb {
  if (!existsSync(DB_PATH)) {
    const db = defaultDb();
    saveDb(db);
    return db;
  }
  return JSON.parse(readFileSync(DB_PATH, "utf-8")) as NodeDb;
}

function saveDb(db: NodeDb): void {
  mkdirSync(resolve(DB_PATH, ".."), { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

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
  db.sessions[token] = { user_id: user.id, expires_at: expires };
  saveDb(db);
  return token;
}

function currentUser(request: FastifyRequest): User | null {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
  const session = token ? db.sessions[token] : null;
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

async function runScraper(sourceId?: number, maxPages?: number): Promise<ScraperRun[]> {
  const sources = db.scraper_sources.filter((source) => source.status === "active" && (!sourceId || source.id === sourceId));
  const runs: ScraperRun[] = [];
  for (const source of sources) {
    const started = now();
    const run: ScraperRun = { id: idFor(db, "scraper_runs"), source_id: source.id, status: "running", started_at: started, finished_at: null, pages_seen: 0, pages_saved: 0, pages_skipped: 0, message: "" };
    db.scraper_runs.push(run);
    try {
      const response = await fetch(source.start_url, { headers: { "User-Agent": "LoksewaAIStudyBot/0.1" } });
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
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" } });
  await app.register(cors, { origin: true, credentials: true });
  await app.register(swagger, { openapi: { info: { title: "Loksewa AI Node Backend", version: "1.0.0" } } });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.get("/healthz", async () => ({ status: "ok", runtime: "node", service: "loksewa-ai-fullstack" }));
  app.get("/v1/metadata", async () => ({ schema_version: db.meta.schema_version, data_version: String(db.meta.data_version), database_kind: "node_json_fullstack" }));

  app.post("/v1/auth/login", async (request, reply) => {
    const body = request.body as { email?: string; password?: string; client_type?: string };
    const email = (body.email ?? "").toLowerCase();
    const user = db.users.find((item) => item.email.toLowerCase() === email && item.password_hash === passwordHash(email, body.password ?? ""));
    if (!user || user.status !== "active") return reply.status(401).send({ detail: "Invalid credentials" });
    user.last_login_at = now();
    user.updated_at = now();
    const token = tokenFor(user);
    return { token, user: publicUser(user), expires_at: db.sessions[token].expires_at };
  });

  app.post("/v1/auth/register", async (request, reply) => {
    const body = request.body as { email?: string; password?: string; full_name?: string };
    const email = (body.email ?? "").toLowerCase();
    if (!email || !body.password) return reply.status(400).send({ detail: "Email and password are required" });
    if (db.users.some((user) => user.email.toLowerCase() === email)) return reply.status(409).send({ detail: "Email already exists" });
    const user = createItem("users", { email, password_hash: passwordHash(email, body.password), full_name: body.full_name ?? "", role: "student" as UserRole, status: "active" as UserStatus, last_login_at: null }) as User;
    const token = tokenFor(user);
    return reply.status(201).send({ token, user: publicUser(user), expires_at: db.sessions[token].expires_at });
  });

  app.get("/v1/auth/me", async (request, reply) => {
    const user = currentUser(request);
    if (!user) return reply.status(401).send({ detail: "Authentication required" });
    return publicUser(user);
  });
  app.post("/v1/auth/logout", async (request, reply) => {
    const token = request.headers.authorization?.replace("Bearer ", "");
    if (token) delete db.sessions[token];
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

  app.get("/v1/questions", async () => db.questions.filter((item) => !item.deleted_at && item.verification_status === "verified"));
  app.get("/v1/questions/:id", async (request, reply) => {
    const question = db.questions.find((item) => item.id === Number((request.params as { id: string }).id));
    return question ?? reply.status(404).send({ detail: "Question not found" });
  });
  app.get("/v1/categories", async () => [...new Set(db.questions.map((item) => item.syllabus_category).filter(Boolean))]);
  app.post("/v1/search", async (request) => {
    const body = request.body as { query?: string; limit?: number };
    const query = (body.query ?? "").toLowerCase();
    const matches = db.questions.filter((item) => item.question_text.toLowerCase().includes(query)).slice(0, body.limit ?? 3).map((question) => ({ question, bm25_score: 1, similarity: 1 }));
    return { answer_source: matches.length ? "verified_db" : "uncertain", threshold_reason: "Node full-stack search", query: body.query ?? "", matches };
  });

  app.get("/v1/mock-tests", async () => db.mocks.filter((item) => item.status === "published"));
  app.post("/v1/reports", async (request, reply) => {
    const body = request.body as Partial<Report>;
    const report: Report = { id: idFor(db, "reports"), question_id: body.question_id ?? null, scanned_text: body.scanned_text ?? "", report_type: body.report_type ?? "other", message: body.message ?? "", contact: body.contact ?? "", status: "open", created_at: now() };
    db.reports.push(report);
    saveDb(db);
    return reply.status(201).send({ report_id: report.id, status: report.status });
  });

  app.addHook("preHandler", async (request, reply) => {
    if (request.url.startsWith("/v1/admin/")) {
      requireAdmin(request, reply);
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
  app.post("/v1/admin/questions", async (request, reply) => reply.status(201).send(createItem("questions", { public_id: `q_${randomUUID()}`, data_version: ++db.meta.data_version, ...(request.body as object) })));
  app.put("/v1/admin/questions/:id", async (request, reply) => upsertById(db.questions, Number((request.params as { id: string }).id), { ...(request.body as object), data_version: ++db.meta.data_version } as Partial<Question>) ?? reply.status(404).send({ detail: "Question not found" }));
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
  app.post("/v1/admin/users", async (request, reply) => { const body = request.body as Partial<User> & { password?: string }; const email = (body.email ?? "").toLowerCase(); const user = createItem("users", { email, password_hash: passwordHash(email, body.password ?? "LoksewaAdmin@123"), full_name: body.full_name ?? "", role: body.role ?? "student", status: body.status ?? "active", last_login_at: null }) as User; return reply.status(201).send(publicUser(user)); });
  app.put("/v1/admin/users/:id", async (request, reply) => { const body = request.body as Partial<User> & { password?: string }; const payload: Partial<User> = { ...body }; if (body.password && body.email) payload.password_hash = passwordHash(body.email, body.password); const user = upsertById(db.users, Number((request.params as { id: string }).id), payload); return user ? publicUser(user) : reply.status(404).send({ detail: "User not found" }); });
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

  setInterval(() => {
    void runScraper().catch((error) => app.log.warn({ error }, "Background scraper skipped"));
  }, Number(process.env.SCRAPER_INTERVAL_MS ?? 60 * 60 * 1000));

  return app;
}

export async function startApp(): Promise<void> {
  const app = await buildApp();
  await app.listen({ host: HOST, port: PORT });
}
