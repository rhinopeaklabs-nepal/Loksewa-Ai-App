export const CacheKeys = {
  verifiedAnswer: (questionId: string) => `verified-answer:${questionId}`,
  aiLesson: (questionId: string) => `ai-lesson:${questionId}`,
  userStats: (userId: string) => `user-stats:${userId}`
};
