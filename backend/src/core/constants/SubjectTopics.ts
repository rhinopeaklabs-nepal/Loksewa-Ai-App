/**
 * Nepal Loksewa Exam Subject Topics
 * Constants representing the structure of Nepal civil service exams
 */

// Main subjects for Nepal civil service examination
export const Subjects = {
  CONSTITUTION: "Constitution",
  GEOGRAPHY: "Geography",
  HISTORY: "History",
  GOVERNANCE: "Governance & Public Administration",
  SCIENCE: "Science & Technology",
  ECONOMICS: "Economics",
  GENERAL_KNOWLEDGE: "General Knowledge",
  MATHEMATICS: "Mathematics",
  ENGLISH: "English",
  NEPALI: "Nepali"
} as const;

export type SubjectName = (typeof Subjects)[keyof typeof Subjects];

// Topic categories for each subject
export const SubjectTopics = {
  [Subjects.CONSTITUTION]: [
    "Constitution of Nepal 2015",
    "Fundamental Rights",
    "Directive Principles of State Policy",
    "Federal Structure",
    "Legislature",
    "Executive",
    "Judiciary",
    "Constitutional Bodies",
    "Emergency Provisions",
    "Amendment Process"
  ] as const,

  [Subjects.GEOGRAPHY]: [
    "Physical Geography of Nepal",
    "Climate and Weather",
    "Rivers and Water Resources",
    "Mountain Region",
    "Terai Region",
    "Hill Region",
    "Natural Vegetation",
    "Biodiversity",
    "Environmental Issues",
    "World Geography"
  ] as const,

  [Subjects.HISTORY]: [
    "Ancient Nepal",
    "Kirant Period",
    "Licchavi Period",
    "Malla Period",
    "Shah Dynasty",
    "Rana Period",
    "Democracy Movement",
    "People's War",
    "Nepal's Foreign Relations",
    "Modern Nepal"
  ] as const,

  [Subjects.GOVERNANCE]: [
    "Public Administration",
    "Local Government",
    "Good Governance",
    "Public Policy",
    "Public Personnel System",
    "Financial Management",
    "Corruption and Anti-corruption",
    "Decentralization",
    "E-governance",
    "International Organizations"
  ] as const,

  [Subjects.SCIENCE]: [
    "Physics Fundamentals",
    "Chemistry Fundamentals",
    "Biology and Life Sciences",
    "Information Technology",
    "Environmental Science",
    "Health and Nutrition",
    "Agriculture",
    "Communication Technology",
    "Energy Resources",
    "Scientific Research Methods"
  ] as const,

  [Subjects.ECONOMICS]: [
    "Microeconomics",
    "Macroeconomics",
    "Economic Development",
    "Public Finance",
    "Money and Banking",
    "International Trade",
    "Nepalese Economy",
    "Agriculture Economy",
    "Industrial Economy",
    "Economic Planning"
  ] as const,

  [Subjects.GENERAL_KNOWLEDGE]: [
    "Current Affairs",
    "Nepalese Society",
    "Culture and Heritage",
    "International Relations",
    "Sports and Games",
    "Awards and Honors",
    "Important Days",
    "International Organizations",
    "World Affairs",
    "GK of Nepal"
  ] as const,

  [Subjects.MATHEMATICS]: [
    "Arithmetic",
    "Algebra",
    "Geometry",
    "Statistics",
    "Percentage",
    "Ratio and Proportion",
    "Profit and Loss",
    "Time and Work",
    "Number System",
    "Data Interpretation"
  ] as const,

  [Subjects.ENGLISH]: [
    "Grammar",
    "Vocabulary",
    "Reading Comprehension",
    "Writing Skills",
    "Antonyms and Synonyms",
    "Idioms and Phrases",
    "Prepositions",
    "Tenses",
    "Active and Passive Voice",
    "Direct and Indirect Speech"
  ] as const,

  [Subjects.NEPALI]: [
    "Nepali Grammar",
    "Literature",
    "Sanskrit Origin Words",
    "Sentence Structure",
    "Poetry",
    "Prose",
    "Drama",
    "Nepali Culture",
    "Language History",
    "Writing Skills"
  ] as const
} as const;

// Exam types in Nepal civil service
export const ExamTypes = {
  LOKSEWA: "Loksewa",
  GAUTH: "Gautam",
  KHALTI: "Khalti",
  SAMANYA: "Samanya",
  BICHAYA: "Bichaya",
  PRATHAM: "Pratham"
} as const;

export type ExamType = (typeof ExamTypes)[keyof typeof ExamTypes];

// Difficulty levels for questions
export const DifficultyLevels = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  EXPERT: "expert"
} as const;

export type DifficultyLevel = (typeof DifficultyLevels)[keyof typeof DifficultyLevels];

// Question types
export const QuestionTypes = {
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
  FILL_BLANK: "fill_blank",
  SHORT_ANSWER: "short_answer",
  LONG_ANSWER: "long_answer"
} as const;

export type QuestionType = (typeof QuestionTypes)[keyof typeof QuestionTypes];

// Weightage for Loksewa exam topics
export const TopicWeightage = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
} as const;

// Source types for questions
export const QuestionSources = {
  OFFICIAL_LOKSEWA: "Official Loksewa",
  PREVIOUS_YEAR: "Previous Year",
  PRACTICE_SET: "Practice Set",
  MODEL_QUESTION: "Model Question",
  EXPERT_PREPARED: "Expert Prepared"
} as const;

export type QuestionSource = (typeof QuestionSources)[keyof typeof QuestionSources];

// Helper to get all topics for a subject
export function getSubjectTopics(subject: SubjectName): readonly string[] {
  return SubjectTopics[subject] || [];
}

// Helper to get all subjects
export function getAllSubjects(): readonly string[] {
  return Object.values(Subjects);
}

// Helper to check if topic exists in subject
export function topicExists(subject: SubjectName, topic: string): boolean {
  const topics = SubjectTopics[subject];
  return topics ? topics.includes(topic as never) : false;
}