// Learning service — Question client (calls knowledge-service)
import axios from "axios";
import { getConfig } from "@loksewa/shared-utils";
import type { Question } from "@loksewa/shared-types";

let config: ReturnType<typeof getConfig>;

function getKnowledgeServiceUrl(): string {
  if (!config) config = getConfig();
  return process.env.KNOWLEDGE_SERVICE_URL || "http://localhost:3007";
}

export interface QuestionRequest {
  topic: string;
  subtopic?: string;
  difficulty: number;
  purpose: "weak_topic" | "review" | "new" | "mini_quiz";
}

export async function fetchQuestionsForMission(
  requests: QuestionRequest[]
): Promise<Question[]> {
  const url = getKnowledgeServiceUrl();

  try {
    // Call knowledge service in batch
    const response = await axios.post(
      `${url}/v1/questions/select`,
      { requests },
      {
        timeout: 5000,
        headers: { "X-Service-Name": "learning-service" },
      }
    );
    return response.data?.data?.questions ?? [];
  } catch (err) {
    // Fallback: try direct DB query (if knowledge service is down)
    console.error("Knowledge service unavailable, falling back to direct DB", err);
    return fallbackFetchQuestions(requests);
  }
}

async function fallbackFetchQuestions(requests: QuestionRequest[]): Promise<Question[]> {
  const { query } = await import("@loksewa/shared-utils");
  const questions: Question[] = [];

  for (const req of requests) {
    const result = await query<Question>(
      `SELECT id, topic, subtopic, question_type, difficulty,
              question_text, question_text_ne, options, correct_answer,
              explanation, explanation_ne, tags, language, verified, source_id
       FROM questions
       WHERE is_published = true
         AND verified = true
         AND topic = $1
         AND ($2::text IS NULL OR subtopic = $2)
         AND difficulty = $3
       ORDER BY RANDOM()
       LIMIT 1`,
      [req.topic, req.subtopic ?? null, req.difficulty]
    );
    if (result.rows[0]) questions.push(result.rows[0]);
  }

  return questions;
}
