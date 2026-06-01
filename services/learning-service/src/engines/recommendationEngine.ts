// Learning service — Recommendation engine
import { query } from "@loksewa/shared-utils";
import { getWeakTopics, getDueReviewItems, getUserProgress } from "./skillEngine.js";
import type { UserProgress } from "@loksewa/shared-types";

export interface Recommendation {
  type: "topic" | "lesson" | "mock_exam" | "revision" | "daily_mission";
  payload: Record<string, unknown>;
  reason: string;
  priority: number; // 1-10
}

export async function generateRecommendations(userId: string): Promise<Recommendation[]> {
  const recs: Recommendation[] = [];

  const [weakTopics, reviewItems, allProgress] = await Promise.all([
    getWeakTopics(userId, 3),
    getDueReviewItems(userId, 5),
    getUserProgress(userId),
  ]);

  // 1. Weak topic recommendation (highest priority)
  if (weakTopics.length > 0) {
    const weakest = weakTopics[0]!;
    recs.push({
      type: "topic",
      payload: { topic: weakest.topic, subtopic: weakest.subtopic, current_score: weakest.skill_score },
      reason: `You're at ${Math.round(weakest.skill_score)}% in ${weakest.topic}. A focused practice session could help.`,
      priority: 9,
    });
  }

  // 2. Review items due
  if (reviewItems.length > 0) {
    recs.push({
      type: "revision",
      payload: { topics: reviewItems.map((r) => ({ topic: r.topic, subtopic: r.subtopic })) },
      reason: `${reviewItems.length} topic${reviewItems.length > 1 ? "s" : ""} due for review to maintain memory.`,
      priority: 7,
    });
  }

  // 3. Mock exam if user is ready
  const examDate = await getTargetExamDate(userId);
  if (examDate) {
    const daysToExam = Math.floor((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const avgScore = allProgress.length > 0
      ? allProgress.reduce((s, p) => s + p.skill_score, 0) / allProgress.length
      : 0;

    if (daysToExam <= 30 && daysToExam > 0) {
      recs.push({
        type: "mock_exam",
        payload: { exam_type: "full", duration_minutes: 120 },
        reason: `${daysToExam} days to your exam. Take a full mock to assess readiness.`,
        priority: 10,
      });
    } else if (avgScore >= 70) {
      recs.push({
        type: "mock_exam",
        payload: { exam_type: "subject_specific", subject: weakTopics[0]?.topic },
        reason: "Your average score is high — try a subject-specific mock to push further.",
        priority: 6,
      });
    }
  }

  // 4. New topic exploration
  const newTopic = await pickNewTopic(userId, allProgress);
  if (newTopic) {
    recs.push({
      type: "topic",
      payload: { topic: newTopic, is_new: true },
      reason: `Ready to start ${newTopic}? Your foundation topics are solid.`,
      priority: 5,
    });
  }

  // Sort by priority descending
  recs.sort((a, b) => b.priority - a.priority);

  // Persist
  for (const rec of recs.slice(0, 5)) {
    await query(
      `INSERT INTO recommendations (user_id, recommendation_type, payload, reason, priority)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, rec.type, JSON.stringify(rec.payload), rec.reason, rec.priority]
    );
  }

  return recs.slice(0, 5);
}

async function getTargetExamDate(userId: string): Promise<Date | null> {
  const result = await query<{ target_exam_date: Date | null }>(
    `SELECT target_exam_date FROM user_profiles WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0]?.target_exam_date ?? null;
}

async function pickNewTopic(userId: string, progress: UserProgress[]): Promise<string | null> {
  const attempted = new Set(progress.map((p) => p.topic));
  const result = await query<{ name: string }>(
    `SELECT name FROM topics
     WHERE is_published = true AND name != ALL($1::text[])
     ORDER BY order_index ASC LIMIT 1`,
    [Array.from(attempted)]
  );
  return result.rows[0]?.name ?? null;
}
