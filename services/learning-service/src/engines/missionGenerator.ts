// Learning service — Daily mission generator
import { query, withTransaction, getRedis } from "@loksewa/shared-utils";
import { getWeakTopics, getDueReviewItems, getUserProgress } from "./skillEngine.js";
import { fetchQuestionsForMission } from "./questionClient.js";
import type { DailyMission, Question, UserProgress } from "@loksewa/shared-types";

export interface MissionComposition {
  weak_topic_questions: number;
  review_questions: number;
  new_topic_questions: number;
  mini_quiz: number;
}

const DEFAULT_COMPOSITION: MissionComposition = {
  weak_topic_questions: 5,
  review_questions: 3,
  new_topic_questions: 5,
  mini_quiz: 2,
};

const TOTAL_QUESTIONS =
  DEFAULT_COMPOSITION.weak_topic_questions +
  DEFAULT_COMPOSITION.review_questions +
  DEFAULT_COMPOSITION.new_topic_questions +
  DEFAULT_COMPOSITION.mini_quiz;

const ESTIMATED_MINUTES = 25;

export async function getOrCreateTodaysMission(userId: string): Promise<DailyMission> {
  const today = new Date().toISOString().split("T")[0]!;

  // Try cache first
  const cached = await getRedis().get(`mission:${userId}:${today}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Try DB
  const existing = await query<DailyMission>(
    `SELECT * FROM daily_missions WHERE user_id = $1 AND mission_date = $2`,
    [userId, today]
  );
  if (existing.rows[0]) {
    await getRedis().set(
      `mission:${userId}:${today}`,
      JSON.stringify(existing.rows[0]),
      "EX",
      86400
    );
    return existing.rows[0]!;
  }

  // Generate
  return generateDailyMission(userId, today);
}

export async function generateDailyMission(userId: string, date: string): Promise<DailyMission> {
  // 1. Get user's weak topics (focus area)
  const weakTopics = await getWeakTopics(userId, 3);
  const reviewItems = await getDueReviewItems(userId, 3);
  const progress = await getUserProgress(userId);

  // 2. Determine next new topic (from learning path or weakest unstarted)
  const nextTopic = await pickNextNewTopic(userId, progress);

  // 3. Build question set
  const weakTopicNames = weakTopics.map((p) => ({ topic: p.topic, subtopic: p.subtopic }));
  const reviewTopicNames = reviewItems.map((p) => ({ topic: p.topic, subtopic: p.subtopic }));

  const questionRequests = [
    ...Array(DEFAULT_COMPOSITION.weak_topic_questions).fill(0).map((_, i) => ({
      ...weakTopicNames[i % Math.max(weakTopicNames.length, 1)],
      difficulty: 2,
      purpose: "weak_topic" as const,
    })),
    ...Array(DEFAULT_COMPOSITION.review_questions).fill(0).map((_, i) => ({
      ...reviewTopicNames[i % Math.max(reviewTopicNames.length, 1)],
      difficulty: 3,
      purpose: "review" as const,
    })),
    ...Array(DEFAULT_COMPOSITION.new_topic_questions).fill(0).map((_, i) => ({
      topic: nextTopic ?? "Constitution",
      difficulty: 2,
      purpose: "new" as const,
    })),
    ...Array(DEFAULT_COMPOSITION.mini_quiz).fill(0).map(() => ({
      topic: nextTopic ?? "Constitution",
      difficulty: 3,
      purpose: "mini_quiz" as const,
    })),
  ];

  const questions = await fetchQuestionsForMission(questionRequests);

  // 4. Insert mission
  const mission = await withTransaction(async (client) => {
    const result = await client.query<DailyMission>(
      `INSERT INTO daily_missions (
         user_id, mission_date, status, total_questions, completed_questions,
         correct_count, estimated_minutes, composition, question_ids
       )
       VALUES ($1, $2, 'pending', $3, 0, 0, $4, $5, $6)
       ON CONFLICT (user_id, mission_date) DO UPDATE
         SET composition = EXCLUDED.composition, question_ids = EXCLUDED.question_ids
       RETURNING *`,
      [
        userId,
        date,
        questions.length,
        ESTIMATED_MINUTES,
        JSON.stringify(DEFAULT_COMPOSITION),
        questions.map((q) => q.id),
      ]
    );
    return result.rows[0]!;
  });

  // 5. Build full mission payload
  const fullMission: DailyMission = {
    ...mission,
    questions,
  };

  // 6. Cache
  await getRedis().set(
    `mission:${userId}:${date}`,
    JSON.stringify(fullMission),
    "EX",
    86400
  );

  return fullMission;
}

async function pickNextNewTopic(
  userId: string,
  progress: UserProgress[]
): Promise<string | null> {
  // Get all topics user has not attempted yet
  const attempted = new Set(progress.map((p) => p.topic));
  const result = await query<{ name: string }>(
    `SELECT name FROM topics WHERE is_published = true AND name != ALL($1::text[])
     ORDER BY order_index ASC LIMIT 1`,
    [Array.from(attempted)]
  );
  return result.rows[0]?.name ?? null;
}

export async function startMission(userId: string, missionId: string): Promise<void> {
  await query(
    `UPDATE daily_missions
     SET status = 'in_progress', started_at = NOW()
     WHERE id = $1 AND user_id = $2 AND status = 'pending'`,
    [missionId, userId]
  );

  // Invalidate cache
  const today = new Date().toISOString().split("T")[0]!;
  await getRedis().del(`mission:${userId}:${today}`);
}

export async function completeMission(
  userId: string,
  missionId: string,
  stats: { total_completed: number; correct: number; minutes: number }
): Promise<void> {
  await query(
    `UPDATE daily_missions
     SET status = 'completed',
         completed_questions = $3,
         correct_count = $4,
         actual_minutes = $5,
         completed_at = NOW()
     WHERE id = $1 AND user_id = $2`,
    [missionId, userId, stats.total_completed, stats.correct, stats.minutes]
  );

  const today = new Date().toISOString().split("T")[0]!;
  await getRedis().del(`mission:${userId}:${today}`);
}
