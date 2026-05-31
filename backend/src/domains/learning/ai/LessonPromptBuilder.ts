import type { GenerateLessonDTO } from "../dto/GenerateLessonDTO";

export interface LessonContext {
  questionText: string;
  correctOption: string;
  explanation: string;
  topicName: string;
  subjectName: string;
  relatedQuestions: Array<{
    question: string;
    correctOption: string;
    explanation: string;
  }>;
  beginnerNote: string;
  intermediateNote: string;
  advancedNote: string;
  loksewaFrequency?: number;
  examNotes?: string;
}

export class LessonPromptBuilder {
  buildSystemPrompt(): string {
    return `You are an expert Loksewa (Nepal Civil Service Exam) tutor.
Your role is to generate comprehensive, structured learning lessons for Nepalese exam candidates.

You MUST:
- Use verified facts from the provided context
- Include Loksewa-specific exam tips and patterns
- Generate practical mnemonics for memorization
- Create flashcards that test understanding, not just recall
- Follow the exact JSON output format specified

You MUST NOT:
- Fabricate exam-related facts
- Provide answers without context backing
- Generate content that contradicts verified sources`;

  }

  buildUserPrompt(input: GenerateLessonDTO, context: LessonContext): string {
    const levelInstructions = this.getLevelInstructions(input.level);

    return `## CONTEXT (Verified Information)
Topic: ${context.topicName}
Subject: ${context.subjectName}

Question: ${context.questionText}
Correct Answer: ${context.correctOption}
Explanation: ${context.explanation}
${context.examNotes ? `Exam Notes: ${context.examNotes}` : ""}
${context.loksewaFrequency ? `Loksewa Frequency: ${context.loksewaFrequency}x asked in past exams` : ""}

## TOPIC NOTES
Beginner: ${context.beginnerNote}
Intermediate: ${context.intermediateNote}
Advanced: ${context.advancedNote}

## RELATED MCQs (from verified question bank)
${context.relatedQuestions
  .map((q, i) => `${i + 1}. Q: ${q.question}\n   A: ${q.correctOption}\n   Note: ${q.explanation}`)
  .join("\n")}

## INSTRUCTIONS
Generate a structured lesson at the "${input.level}" level.

${levelInstructions}

## OUTPUT FORMAT
Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "Lesson title for this topic",
  "summary": "2-3 sentence overview",
  "content": "Detailed lesson content (use markdown formatting, 500-1000 words)",
  "examNotes": "Key Loksewa-specific tips and patterns",
  "mnemonic": "Memory aid or acronym for this topic",
  "relatedQuestions": [
    {"question": "related MCQ", "correctOption": "X", "explanation": "why X"}
  ],
  "flashcards": [
    {"front": "question on front", "back": "answer on back"},
    {"front": "concept test", "back": "explanation"}
  ],
  "revisionSummary": "Bullet points for quick revision"
}`;
  }

  private getLevelInstructions(level: string): string {
    switch (level) {
      case "beginner":
        return `Beginner Level Instructions:
- Explain concepts from first principles
- Use simple, clear language (suitable for students with no prior knowledge)
- Include everyday examples familiar to Nepali students
- Break down complex topics into digestible parts
- Focus on building foundational understanding
- Include pronunciation guides for Nepali terms
- Minimum 5 flashcards covering basic definitions`;
      case "intermediate":
        return `Intermediate Level Instructions:
- Build on foundational knowledge
- Connect concepts to exam patterns
- Include comparison tables and diagrams (text-based)
- Provide Loksewa-specific insights
- Medium complexity with practical applications
- Include 7-8 flashcards covering both definitions and applications`;
      case "advanced":
        return `Advanced Level Instructions:
- Assume solid foundational knowledge
- Focus on exam strategy and time-saving techniques
- Include comparison of similar topics
- Reference past Loksewa exam trends
- Challenge the student with case-based scenarios
- Minimum 10 flashcards including edge cases and traps`;
      default:
        return `Generate a comprehensive lesson for this topic.`;
    }
  }

  buildCacheKey(input: GenerateLessonDTO): string {
    return `lesson:${input.topicId}:${input.questionId ?? "general"}:${input.level}`;
  }
}