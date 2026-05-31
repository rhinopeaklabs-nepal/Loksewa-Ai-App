/**
 * Learning level types
 * Defines user proficiency levels for adaptive learning
 */
import { QuestionDifficulty } from "./QuestionDifficulty";
export enum LearningLevel {
  /** Beginner - fundamental concepts */
  Beginner = "beginner",
  /** Intermediate - practical application */
  Intermediate = "intermediate",
  /** Advanced - complex problem solving */
  Advanced = "advanced"
}

/**
 * Learning level progression weights
 */
export const LEVEL_WEIGHTS = {
  [LearningLevel.Beginner]: 1.0,
  [LearningLevel.Intermediate]: 1.5,
  [LearningLevel.Advanced]: 2.0
} as const;

/**
 * Level descriptions for UI display
 */
export const LEVEL_DESCRIPTIONS: Record<LearningLevel, string> = {
  [LearningLevel.Beginner]: "Starting out - learning fundamental concepts",
  [LearningLevel.Intermediate]: "Building knowledge - applying concepts to practice",
  [LearningLevel.Advanced]: "Mastering skills - solving complex problems"
};

/**
 * Suggested question counts per level for practice sessions
 */
export const LEVEL_QUESTION_COUNTS: Record<LearningLevel, { min: number; max: number }> = {
  [LearningLevel.Beginner]: { min: 5, max: 15 },
  [LearningLevel.Intermediate]: { min: 10, max: 25 },
  [LearningLevel.Advanced]: { min: 15, max: 40 }
};

/**
 * Get recommended difficulty distribution based on level
 */
export function getRecommendedDifficultyDistribution(
  level: LearningLevel
): Record<QuestionDifficulty, number> {
  switch (level) {
    case LearningLevel.Beginner:
      return {
        [QuestionDifficulty.Easy]: 0.7,
        [QuestionDifficulty.Medium]: 0.25,
        [QuestionDifficulty.Hard]: 0.05
      };
    case LearningLevel.Intermediate:
      return {
        [QuestionDifficulty.Easy]: 0.3,
        [QuestionDifficulty.Medium]: 0.5,
        [QuestionDifficulty.Hard]: 0.2
      };
    case LearningLevel.Advanced:
      return {
        [QuestionDifficulty.Easy]: 0.1,
        [QuestionDifficulty.Medium]: 0.4,
        [QuestionDifficulty.Hard]: 0.5
      };
  }
}