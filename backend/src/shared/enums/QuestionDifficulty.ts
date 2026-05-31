/**
 * Question difficulty levels
 * Defines the difficulty classification for questions
 */
export enum QuestionDifficulty {
  /** Easy difficulty - basic recall and understanding */
  Easy = "easy",
  /** Medium difficulty - application and analysis */
  Medium = "medium",
  /** Hard difficulty - synthesis and evaluation */
  Hard = "hard"
}

/**
 * Difficulty score multipliers for scoring calculations
 */
export const DIFFICULTY_SCORES = {
  [QuestionDifficulty.Easy]: 1,
  [QuestionDifficulty.Medium]: 1.5,
  [QuestionDifficulty.Hard]: 2
} as const;

/**
 * Difficulty colors for UI display
 */
export const DIFFICULTY_COLORS: Record<QuestionDifficulty, string> = {
  [QuestionDifficulty.Easy]: "#22c55e",   // Green
  [QuestionDifficulty.Medium]: "#f59e0b", // Amber
  [QuestionDifficulty.Hard]: "#ef4444"    // Red
};

/**
 * Get difficulty from numeric score (0-100)
 */
export function getDifficultyFromScore(score: number): QuestionDifficulty {
  if (score >= 80) return QuestionDifficulty.Easy;
  if (score >= 50) return QuestionDifficulty.Medium;
  return QuestionDifficulty.Hard;
}