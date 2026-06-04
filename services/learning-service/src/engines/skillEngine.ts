// Learning service — Skill score engine
// Implements enhanced IRT-inspired skill score updates + spaced repetition (SM-2)

import { query, withTransaction } from "@loksewa/shared-utils";
import type { UserProgress, Question } from "@loksewa/shared-types";

export interface SkillScoreUpdate {
  user_id: string;
  topic: string;
  subtopic?: string;
  is_correct: boolean;
  difficulty: number;  // 1-5
  time_taken_ms: number;
  guess_factor?: number; // Penalty for guessing
}

export interface SkillScoreResult {
  skill_score_before: number;
  skill_score_after: number;
  mastery_level: string;
  learning_gain: number;
}

/**
 * Update skill score using enhanced IRT-inspired formula with time sensitivity
 * and guessing penalty
 */
export async function updateSkillScore(update: SkillScoreUpdate): Promise<SkillScoreResult> {
  return withTransaction(async (client) => {
    // Get current progress
    const existing = await client.query<{
      skill_score: number;
      ease_factor: number;
      repetition_count: number;
      interval_days: number;
    }>(
      `SELECT skill_score, ease_factor, repetition_count, interval_days
       FROM user_progress
       WHERE user_id = $1 AND topic = $2 AND subtopic IS NOT DISTINCT FROM $3
       FOR UPDATE`,
      [update.user_id, update.topic, update.subtopic ?? null]
    );

    const before = existing.rows[0]?.skill_score ?? 0;
    const easeFactor = existing.rows[0]?.ease_factor ?? 2.5;
    const repCount = existing.rows[0]?.repetition_count ?? 0;
    const intervalDays = existing.rows[0]?.interval_days ?? 0;

    // Dynamic learning rate based on multiple factors
    // 1. Base rate decreases with mastery
    let learningRate = before < 30 ? 8 : before < 60 ? 5 : before < 80 ? 3 : 1.5;
    
    // 2. Adjust for response time (faster correct answers = higher learning)
    if (update.is_correct && update.time_taken_ms > 0) {
      const timeFactor = Math.max(0.5, Math.min(2.0, 15000 / update.time_taken_ms)); // 15s baseline
      learningRate *= timeFactor;
    }
    
    // 3. Apply guessing penalty if enabled
    const guessPenalty = update.guess_factor ?? 0.2;
    const effectiveCorrect = update.is_correct ? (1 - guessPenalty) : 0;

    // Expected probability using 3PL IRT model (guessing, difficulty, discrimination)
    const difficulty = update.difficulty * 20; // Convert 1-5 to 20-100 scale
    const discrimination = 1.0; // Fixed discrimination parameter
    const guessing = 0.25; // 25% guessing chance for 4-option MCQ
    
    // 3PL IRT: P(correct) = guessing + (1 - guessing) / (1 + exp(-discrimination * (ability - difficulty)))
    const ability = before; // Current skill score as ability estimate
    const expected = guessing + (1 - guessing) / (1 + Math.exp(-discrimination * (ability - difficulty)));

    // Delta calculation with enhanced sensitivity
    const outcome = update.is_correct ? 1 : 0;
    let delta = learningRate * (outcome - expected);

    // Additional penalty for wrong answers on easy questions (indicates carelessness)
    if (!update.is_correct && update.difficulty <= 2) {
      delta = Math.min(delta, 0); // No positive gain for wrong on easy
    }

    // Boundary conditions
    const after = Math.max(0, Math.min(100, before + delta));
    const learningGain = after - before;

    // Enhanced SM-2 update with consistency checks
    let newEase = easeFactor;
    let newRepCount = repCount;
    let newInterval = intervalDays;
    let nextReviewDays = 1;

    if (update.is_correct) {
      newRepCount += 1;
      if (newRepCount === 1) newInterval = 1;
      else if (newRepCount === 2) newInterval = 6;
      else newInterval = Math.max(6, Math.round(intervalDays * easeFactor));
      
      // Adjust ease factor based on performance consistency
      if (learningGain > 5) {
        newEase = Math.min(3.0, easeFactor + 0.15); // Big gain -> increase ease
      } else if (learningGain < 0) {
        newEase = Math.max(1.3, easeFactor - 0.2); // Loss -> decrease ease
      } else {
        newEase = Math.max(1.3, easeFactor + 0.05); // Small gain -> slight increase
      }
      
      nextReviewDays = newInterval;
    } else {
      newRepCount = 0;
      newInterval = 1;
      // For failures, decrease ease factor more significantly for hard questions
      const failurePenalty = update.difficulty >= 4 ? 0.3 : 0.15;
      newEase = Math.max(1.3, easeFactor - failurePenalty);
      nextReviewDays = 1;
    }

    const mastery = scoreToMastery(after);
    const nextReviewAt = new Date(Date.now() + nextReviewDays * 24 * 60 * 60 * 1000);

    // Upsert with enhanced fields
    await client.query(
      `INSERT INTO user_progress (
         user_id, topic, subtopic, skill_score, mastery_level,
         questions_attempted, questions_correct, average_time_ms,
         last_attempted_at, next_review_at, ease_factor, repetition_count, interval_days
       )
       VALUES ($1, $2, $3, $4, $5, 1, $6, $7, NOW(), $8, $9, $10, $11)
       ON CONFLICT (user_id, topic, subtopic) DO UPDATE SET
         skill_score = EXCLUDED.skill_score,
         mastery_level = EXCLUDED.mastery_level,
         questions_attempted = user_progress.questions_attempted + 1,
         questions_correct = user_progress.questions_correct + $6,
         average_time_ms = (user_progress.average_time_ms * user_progress.questions_attempted + $7) / (user_progress.questions_attempted + 1),
         last_attempted_at = NOW(),
         next_review_at = EXCLUDED.next_review_at,
         ease_factor = EXCLUDED.ease_factor,
         repetition_count = EXCLUDED.repetition_count,
         interval_days = EXCLUDED.interval_days,
         updated_at = NOW()`,
      [update.user_id, update.topic, update.subtopic ?? null, after, mastery, update.is_correct ? 1 : 0, update.time_taken_ms, nextReviewAt, newEase, newRepCount, newInterval]
    );

    return {
      skill_score_before: before,
      skill_score_after: after,
      mastery_level: mastery,
      learning_gain: learningGain,
    };
  });
}

export function scoreToMastery(score: number): "novice" | "learning" | "proficient" | "advanced" | "mastered" {
  if (score < 25) return "novice";
  if (score < 50) return "learning";
  if (score < 70) return "proficient";
  if (score < 85) return "advanced";
  return "mastered";
}

export async function getUserProgress(
  userId: string,
  topic?: string
): Promise<UserProgress[]> {
  const result = await query<UserProgress>(
    `SELECT user_id, topic, subtopic, skill_score, mastery_level,
            questions_attempted, questions_correct, average_time_ms,
            last_attempted_at, next_review_at, ease_factor, repetition_count, interval_days
     FROM user_progress
     WHERE user_id = $1 ${topic ? "AND topic = $2" : ""}
     ORDER BY skill_score ASC`,
    topic ? [userId, topic] : [userId]
  );
  return result.rows;
}

export async function getWeakTopics(userId: string, limit: number = 5): Promise<UserProgress[]> {
  const result = await query<UserProgress>(
    `SELECT * FROM user_progress
     WHERE user_id = $1 AND skill_score < 60 AND questions_attempted >= 3
     ORDER BY skill_score ASC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

export async function getDueReviewItems(userId: string, limit: number = 10): Promise<UserProgress[]> {
  const result = await query<UserProgress>(
    `SELECT * FROM user_progress
     WHERE user_id = $1
       AND next_review_at IS NOT NULL
       AND next_review_at <= NOW()
       AND questions_attempted >= 1
     ORDER BY next_review_at ASC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

// New function for learning velocity tracking
export async function getLearningVelocity(userId: string, days: number = 7): Promise<number> {
  const result = await query<{velocity: number}>(
    `SELECT 
       COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0), 0) as velocity
     FROM question_attempts 
     WHERE user_id = $1 
       AND answered_at >= NOW() - ($2 || ' days')::interval`,
    [userId, days]
  );
  return result.rows[0]?.velocity ?? 0;
}
