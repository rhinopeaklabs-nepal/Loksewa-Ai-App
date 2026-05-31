export interface GenerateLessonDTO {
  userId: string;
  topicId: string;
  level: "beginner" | "intermediate" | "advanced";
}
