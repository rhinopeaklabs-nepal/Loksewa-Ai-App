// Exam Service — Mock exam engine
import { query, withTransaction } from "@loksewa/shared-utils";
import type { MockExam, MockExamAttempt, Question, ExamStartResponse } from "@loksewa/shared-types";

export async function getMockExam(id: string): Promise<MockExam | null> {
  const result = await query<MockExam>(
    `SELECT * FROM mock_exams WHERE id = $1 AND is_published = true`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function listMockExams(
  options: { exam_target?: string; exam_type?: string; limit?: number } = {}
): Promise<MockExam[]> {
  const params: unknown[] = [];
  const wheres: string[] = ["is_published = true"];
  if (options.exam_target) { params.push(options.exam_target); wheres.push(`exam_target = $${params.length}`); }
  if (options.exam_type) { params.push(options.exam_type); wheres.push(`exam_type = $${params.length}`); }
  const limit = options.limit ?? 20;
  const result = await query<MockExam>(
    `SELECT * FROM mock_exams WHERE ${wheres.join(" AND ")} ORDER BY created_at DESC LIMIT ${limit}`,
    params
  );
  return result.rows;
}

export async function startMockExam(userId: string, mockExamId: string): Promise<ExamStartResponse> {
  const exam = await getMockExam(mockExamId);
  if (!exam) throw new Error("Mock exam not found");

  // Get questions based on selection criteria
  const questions = await selectQuestionsForExam(exam);
  if (questions.length === 0) {
    throw new Error("No questions available for this exam");
  }

  // Create attempt with server-authoritative end time
  const durationMs = exam.duration_minutes * 60 * 1000;
  const startedAt = new Date();
  const serverEndTime = new Date(startedAt.getTime() + durationMs);

  const result = await query<MockExamAttempt>(
    `INSERT INTO mock_exam_attempts (user_id, mock_exam_id, server_end_time, status, total_attempted)
     VALUES ($1, $2, $3, 'in_progress', 0)
     RETURNING *`,
    [userId, mockExamId, serverEndTime]
  );
  const attempt = result.rows[0]!;

  // Save questions
  for (let i = 0; i < questions.length; i++) {
    await query(
      `INSERT INTO exam_attempt_answers (attempt_id, question_id, question_order)
       VALUES ($1, $2, $3)
       ON CONFLICT (attempt_id, question_id) DO NOTHING`,
      [attempt.id, questions[i]!.id, i]
    );
  }

  return {
    attempt_id: attempt.id,
    mock_exam: exam,
    questions: questions.map((q) => stripCorrectAnswer(q)),
    started_at: attempt.started_at,
    server_end_time: attempt.server_end_time,
  };
}

export async function submitAnswer(
  attemptId: string,
  userId: string,
  questionId: string,
  selectedOption: string,
  timeSpentSeconds: number
): Promise<void> {
  await query(
    `UPDATE exam_attempt_answers
     SET selected_option = $1, time_spent_seconds = $2, answered_at = NOW()
     WHERE attempt_id = $3 AND question_id = $4
       AND attempt_id IN (SELECT id FROM mock_exam_attempts WHERE user_id = $5)`,
    [selectedOption, timeSpentSeconds, attemptId, questionId, userId]
  );
}

export async function submitMockExam(attemptId: string, userId: string): Promise<MockExamAttempt> {
  return withTransaction(async (client) => {
    // Verify ownership and status
    const attemptResult = await client.query<MockExamAttempt>(
      `SELECT * FROM mock_exam_attempts
       WHERE id = $1 AND user_id = $2 AND status = 'in_progress'
       FOR UPDATE`,
      [attemptId, userId]
    );
    const attempt = attemptResult.rows[0];
    if (!attempt) throw new Error("Attempt not found or already submitted");

    // Check if time expired
    const now = new Date();
    const expired = now > new Date(attempt.server_end_time);

    // Get exam for marking scheme
    const exam = await getMockExam(attempt.mock_exam_id);
    if (!exam) throw new Error("Exam not found");

    // Get all answers
    const answers = await client.query<{ question_id: string; selected_option: string | null }>(
      `SELECT question_id, selected_option FROM exam_attempt_answers
       WHERE attempt_id = $1`,
      [attemptId]
    );

    // Get correct answers
    const questionIds = answers.rows.map((r) => r.question_id);
    const correctAnswers = await client.query<{ id: string; correct_answer: string; topic: string; subtopic: string | null }>(
      `SELECT id, correct_answer, topic, subtopic FROM questions WHERE id = ANY($1::uuid[])`,
      [questionIds]
    );

    // Grade
    const correctMap = new Map(correctAnswers.rows.map((r) => [r.id, r]));
    let correct = 0, wrong = 0, unanswered = 0;
    const subjectScores: Record<string, { correct: number; total: number }> = {};
    const topicScores: Record<string, { correct: number; total: number }> = {};

    for (const ans of answers.rows) {
      const correctAnswer = correctMap.get(ans.question_id);
      if (!correctAnswer) continue;

      const isAnswered = ans.selected_option !== null;
      if (!isAnswered) {
        unanswered++;
        continue;
      }

      const isCorrect = ans.selected_option === correctAnswer.correct_answer;
      if (isCorrect) correct++;
      else wrong++;

      // Update exam_attempt_answers
      await client.query(
        `UPDATE exam_attempt_answers SET is_correct = $1, correct_answer = $2
         WHERE attempt_id = $3 AND question_id = $4`,
        [isCorrect, correctAnswer.correct_answer, attemptId, ans.question_id]
      );
    }

    // Calculate score
    const marking = exam.marking_scheme as { correct: number; wrong: number; unanswered: number };
    const score = correct * marking.correct + wrong * marking.wrong + unanswered * marking.unanswered;
    const percentage = (score / exam.total_marks) * 100;
    const isPassed = score >= exam.passing_marks;

    // Update attempt
    const finalResult = await client.query<MockExamAttempt>(
      `UPDATE mock_exam_attempts SET
         status = $2, submitted_at = NOW(), graded_at = NOW(),
         time_taken_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::int,
         score = $3, total_marks = $4, percentage = $5, is_passed = $6,
         total_correct = $7, total_wrong = $8, total_unanswered = $9,
         subject_wise_scores = $10
       WHERE id = $1 RETURNING *`,
      [
        attemptId,
        expired ? "expired" : "graded",
        score,
        exam.total_marks,
        percentage,
        isPassed,
        correct,
        wrong,
        unanswered,
        JSON.stringify(subjectScores),
      ]
    );

    return finalResult.rows[0]!;
  });
}

type MockExamQuestionSelection = {
  topics?: string[];
  difficulty_dist?: Record<string, number>;
  randomize?: boolean;
};

type MockExamWithSelection = MockExam & {
  question_selection?: MockExamQuestionSelection;
};

async function selectQuestionsForExam(exam: MockExam): Promise<Question[]> {
  const selection = (exam as MockExamWithSelection).question_selection ?? {};
  // Call knowledge service or query directly
  const params: unknown[] = [];
  const wheres: string[] = ["is_published = true", "verified = true"];

  if (selection.topics && selection.topics.length > 0) {
    params.push(selection.topics);
    wheres.push(`topic = ANY($${params.length}::text[])`);
  }

  const result = await query<Question>(
    `SELECT * FROM questions WHERE ${wheres.join(" AND ")}
     ORDER BY ${selection.randomize ? "RANDOM()" : "created_at DESC"} LIMIT $${params.length + 1}`,
    [...params, exam.total_questions]
  );
  return result.rows;
}

function stripCorrectAnswer(q: Question): Question {
  const { correct_answer, explanation, explanation_ne, ...rest } = q;
  return rest as Question;
}

// Server
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { z } from "zod";
import { logger, loadConfig, checkHealth, closePool, authenticate, AppError } from "@loksewa/shared-utils";

loadConfig("exam-service");
const PORT = Number(process.env.SERVICE_PORT) || 3009;

const app = Fastify({ logger, trustProxy: true });
await app.register(helmet);
await app.register(cors, { origin: true, credentials: true });

app.get("/healthz", async () => ({ status: "ok", service: "exam-service" }));
app.get("/readyz", async () => ({ status: (await checkHealth()) ? "ready" : "not_ready" }));

app.get("/v1/mock-exams", async (req, reply) => {
  try {
    const q = z.object({
      exam_target: z.string().optional(),
      exam_type: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(req.query);
    const exams = await listMockExams(q);
    return reply.send({ success: true, data: { exams } });
  } catch (e) { handleErr(reply, e); }
});

app.post("/v1/mock-exams/:id/start", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const { id } = req.params as { id: string };
    const result = await startMockExam(auth.sub, id);
    return reply.send({ success: true, data: result });
  } catch (e) { handleErr(reply, e); }
});

app.post("/v1/mock-exams/attempts/:id/answer", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const { id } = req.params as { id: string };
    const body = z.object({
      question_id: z.string().uuid(),
      selected_option: z.string(),
      time_spent_seconds: z.number().int().nonnegative(),
    }).parse(req.body);
    await submitAnswer(id, auth.sub, body.question_id, body.selected_option, body.time_spent_seconds);
    return reply.send({ success: true });
  } catch (e) { handleErr(reply, e); }
});

app.post("/v1/mock-exams/attempts/:id/submit", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const { id } = req.params as { id: string };
    const result = await submitMockExam(id, auth.sub);
    return reply.send({ success: true, data: { attempt: result } });
  } catch (e) { handleErr(reply, e); }
});

app.get("/v1/mock-exams/attempts/:id", async (req, reply) => {
  try {
    const auth = await authenticate(req);
    const { id } = req.params as { id: string };
    const result = await query(
      `SELECT * FROM mock_exam_attempts WHERE id = $1 AND user_id = $2`,
      [id, auth.sub]
    );
    if (!result.rows[0]) return reply.status(404).send({ success: false, error: { code: "NOT_FOUND" } });
    return reply.send({ success: true, data: { attempt: result.rows[0] } });
  } catch (e) { handleErr(reply, e); }
});

function handleErr(reply: any, err: unknown) {
  if (err instanceof AppError) return reply.status(err.statusCode).send({ success: false, error: err.toJSON() });
  if (err instanceof z.ZodError) return reply.status(400).send({ success: false, error: { code: "VALIDATION_ERROR" } });
  reply.log.error({ err }, "Unhandled");
  return reply.status(500).send({ success: false });
}

const shutdown = async () => { await app.close(); await closePool(); process.exit(0); };
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
await app.listen({ port: PORT, host: "0.0.0.0" });
logger.info({ port: PORT }, "📝 exam-service listening");
