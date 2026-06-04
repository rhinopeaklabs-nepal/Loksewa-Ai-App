// Foundation Model Engine — Training Data Collection
// Collects verified data for future RhinoPeak model fine-tuning

import { query, logger, withTransaction } from "@loksewa/shared-utils";
import { v4 as uuidv4 } from "uuid";

export type DataType = "verified_qa" | "ai_tutor" | "student_mistakes" | "teacher_notes" | "government_docs" | "behavior";

export interface TrainingExample {
  id: string;
  data_type: DataType;
  input: string;
  output: string;
  context?: string;
  metadata: Record<string, unknown>;
  quality_score: number; // 0-1
  language: string;
  source: string;
  created_at: string;
}

export interface CollectOptions {
  since?: Date;
  limit?: number;
  min_quality?: number;
}

export interface DatasetBuildConfig {
  name: string;
  description?: string;
  data_types: DataType[];
  min_quality?: number;
  format?: "jsonl" | "csv" | "parquet";
}

export interface DatasetInfo {
  id: string;
  name: string;
  description?: string;
  data_types: DataType[];
  total_examples: number;
  size_bytes: number;
  format: string;
  status: "building" | "ready" | "failed";
  location?: string;
  created_at: string;
  completed_at?: string;
}

/**
 * Collect training data from various sources
 */
export async function collectTrainingData(
  dataType: DataType,
  options: CollectOptions = {}
): Promise<{ collected: number; quality: number }> {
  const limit = options.limit ?? 1000;
  const since = options.since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days
  const minQuality = options.min_quality ?? 0.5;

  let examples: TrainingExample[] = [];

  switch (dataType) {
    case "verified_qa":
      examples = await collectVerifiedQA(since, limit, minQuality);
      break;
    case "ai_tutor":
      examples = await collectAITutorConversations(since, limit, minQuality);
      break;
    case "student_mistakes":
      examples = await collectStudentMistakes(since, limit, minQuality);
      break;
    case "teacher_notes":
      examples = await collectTeacherNotes(since, limit, minQuality);
      break;
    case "government_docs":
      examples = await collectGovernmentDocs(since, limit, minQuality);
      break;
    case "behavior":
      examples = await collectBehaviorData(since, limit, minQuality);
      break;
  }

  // Store in training data pool
  if (examples.length > 0) {
    await storeTrainingData(examples);
  }

  const avgQuality = examples.length > 0
    ? examples.reduce((sum, e) => sum + e.quality_score, 0) / examples.length
    : 0;

  logger.info({ 
    data_type: dataType, 
    collected: examples.length, 
    avg_quality: avgQuality 
  }, "Training data collected");

  return { collected: examples.length, quality: avgQuality };
}

/**
 * Collect verified Q&A from the knowledge base
 */
async function collectVerifiedQA(since: Date, limit: number, minQuality: number): Promise<TrainingExample[]> {
  const result = await query<any>(
    `SELECT id, topic, subtopic, question_text, question_text_ne, options, 
            correct_answer, explanation, explanation_ne, language, source_id, 
            verified, created_at
     FROM questions
     WHERE verified = true 
       AND is_published = true
       AND created_at > $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [since, limit]
  );

  return result.rows.map((row): TrainingExample => {
    // Build input: the question
    const input = row.question_text_ne || row.question_text;
    
    // Build output: the answer with explanation
    let output = `Correct Answer: ${row.correct_answer}\n`;
    if (row.explanation || row.explanation_ne) {
      output += `Explanation: ${row.explanation_ne || row.explanation}`;
    }
    
    // Calculate quality score
    const quality = calculateQAQuality(row);
    
    return {
      id: uuidv4(),
      data_type: "verified_qa",
      input,
      output,
      context: row.topic + (row.subtopic ? ` / ${row.subtopic}` : ""),
      metadata: {
        topic: row.topic,
        subtopic: row.subtopic,
        question_id: row.id,
        options: row.options,
        has_explanation: !!(row.explanation || row.explanation_ne),
        source_id: row.source_id
      },
      quality_score: quality,
      language: row.language || "en",
      source: "verified_db",
      created_at: new Date().toISOString()
    };
  }).filter(e => e.quality_score >= minQuality);
}

function calculateQAQuality(row: any): number {
  let score = 0.5; // Base score
  
  // Verified source
  if (row.verified) score += 0.2;
  
  // Has explanation
  if (row.explanation || row.explanation_ne) score += 0.15;
  
  // Has options (MCQ)
  if (row.options) score += 0.1;
  
  // Has Nepali translation
  if (row.question_text_ne && row.explanation_ne) score += 0.05;
  
  return Math.min(1.0, score);
}

/**
 * Collect AI tutor conversations with positive feedback
 */
async function collectAITutorConversations(since: Date, limit: number, minQuality: number): Promise<TrainingExample[]> {
  const result = await query<any>(
    `SELECT 
       m1.conversation_id, m1.content as user_message, 
       m2.content as assistant_message, m2.citations, m2.source,
       m2.feedback, m2.feedback_text, m2.created_at,
       c.mode, c.topic, c.user_id
     FROM ai_messages m1
     INNER JOIN ai_messages m2 ON m1.conversation_id = m2.conversation_id 
       AND m1.turn_index = m2.turn_index - 1
     INNER JOIN ai_conversations c ON c.id = m1.conversation_id
     WHERE m1.role = 'user' 
       AND m2.role = 'assistant'
       AND m2.created_at > $1
       AND (m2.feedback = 'up' OR m2.feedback IS NULL)
     ORDER BY m2.created_at DESC
     LIMIT $2`,
    [since, limit]
  );

  return result.rows.map((row): TrainingExample => {
    let quality = 0.6;
    
    // Positive feedback boost
    if (row.feedback === "up") quality += 0.3;
    
    // Has citations
    if (row.citations && Array.isArray(row.citations) && row.citations.length > 0) {
      quality += 0.1;
    }
    
    // RAG source is better than AI only
    if (row.source === "ai_rag") quality += 0.05;
    if (row.source === "verified_db") quality += 0.1;
    
    return {
      id: uuidv4(),
      data_type: "ai_tutor",
      input: row.user_message,
      output: row.assistant_message,
      context: row.topic || row.mode,
      metadata: {
        conversation_id: row.conversation_id,
        mode: row.mode,
        topic: row.topic,
        citations: row.citations,
        source: row.source,
        feedback: row.feedback,
        feedback_text: row.feedback_text
      },
      quality_score: Math.min(1.0, quality),
      language: "en", // Could be detected
      source: "ai_service",
      created_at: row.created_at
    };
  }).filter(e => e.quality_score >= minQuality);
}

/**
 * Collect student mistakes and corrections for learning patterns
 */
async function collectStudentMistakes(since: Date, limit: number, minQuality: number): Promise<TrainingExample[]> {
  const result = await query<any>(
    `SELECT 
       qa.user_id, qa.question_id, qa.selected_option, qa.correct_answer,
       qa.is_correct, qa.time_taken_ms, qa.topic, qa.subtopic,
       q.question_text, q.question_text_ne, q.explanation, q.explanation_ne,
       qa.answered_at
     FROM question_attempts qa
     INNER JOIN questions q ON q.id = qa.question_id
     WHERE qa.is_correct = false
       AND qa.answered_at > $1
     ORDER BY qa.answered_at DESC
     LIMIT $2`,
    [since, limit]
  );

  return result.rows.map((row): TrainingExample => {
    // Build an instructive example: wrong answer + correction
    const input = `Question: ${row.question_text || row.question_text_ne}\nStudent chose: ${row.selected_option}`;
    const output = `Correct answer: ${row.correct_answer}\nExplanation: ${row.explanation || row.explanation_ne || 'No explanation available'}`;
    
    const quality = 0.5; // Base quality for mistake data
    
    return {
      id: uuidv4(),
      data_type: "student_mistakes",
      input,
      output,
      context: row.topic + (row.subtopic ? ` / ${row.subtopic}` : ""),
      metadata: {
        user_id: row.user_id,
        question_id: row.question_id,
        topic: row.topic,
        subtopic: row.subtopic,
        time_taken_ms: row.time_taken_ms
      },
      quality_score: quality,
      language: row.question_text_ne ? "ne" : "en",
      source: "learning_service",
      created_at: row.answered_at
    };
  }).filter(e => e.quality_score >= minQuality);
}

/**
 * Collect teacher-uploaded notes
 */
async function collectTeacherNotes(since: Date, limit: number, minQuality: number): Promise<TrainingExample[]> {
  // In production, this would query a teacher_notes table
  // For now, return empty array as the table may not exist yet
  try {
    const result = await query<any>(
      `SELECT id, title, content, topic, language, created_at, author_id
       FROM teacher_notes
       WHERE created_at > $1 AND is_published = true
       ORDER BY created_at DESC
       LIMIT $2`,
      [since, limit]
    );

    return result.rows.map((row): TrainingExample => ({
      id: uuidv4(),
      data_type: "teacher_notes",
      input: row.title,
      output: row.content,
      context: row.topic,
      metadata: {
        note_id: row.id,
        author_id: row.author_id,
        topic: row.topic
      },
      quality_score: 0.8, // Teacher content is high quality
      language: row.language || "en",
      source: "teacher_contribution",
      created_at: row.created_at
    })).filter(e => e.quality_score >= minQuality);
  } catch (err) {
    // Table may not exist yet
    return [];
  }
}

/**
 * Collect government documents and official sources
 */
async function collectGovernmentDocs(since: Date, limit: number, minQuality: number): Promise<TrainingExample[]> {
  try {
    const result = await query<any>(
      `SELECT id, title, content, source_type, year, language, created_at
       FROM government_documents
       WHERE created_at > $1 AND is_processed = true
       ORDER BY created_at DESC
       LIMIT $2`,
      [since, limit]
    );

    return result.rows.map((row): TrainingExample => ({
      id: uuidv4(),
      data_type: "government_docs",
      input: row.title,
      output: row.content,
      context: row.source_type,
      metadata: {
        doc_id: row.id,
        source_type: row.source_type,
        year: row.year
      },
      quality_score: 0.95, // Government docs are highest quality
      language: row.language || "en",
      source: "government",
      created_at: row.created_at
    })).filter(e => e.quality_score >= minQuality);
  } catch (err) {
    return [];
  }
}

/**
 * Collect anonymized behavioral patterns
 */
async function collectBehaviorData(since: Date, limit: number, minQuality: number): Promise<TrainingExample[]> {
  // Anonymized learning patterns - useful for personalization model
  const result = await query<any>(
    `SELECT 
       user_id, topic, subtopic, AVG(skill_score) as avg_skill,
       COUNT(*) as attempts, AVG(time_taken_ms) as avg_time
     FROM question_attempts qa
     WHERE qa.answered_at > $1
     GROUP BY user_id, topic, subtopic
     ORDER BY attempts DESC
     LIMIT $2`,
    [since, limit]
  );

  return result.rows.map((row): TrainingExample => {
    const input = `User studied ${row.topic}${row.subtopic ? ` / ${row.subtopic}` : ''}`;
    const output = `Skill level: ${Math.round(row.avg_skill)}/100, Attempts: ${row.avg_time ? Math.round(row.avg_time/1000) + 's avg' : 'N/A'}`;
    
    return {
      id: uuidv4(),
      data_type: "behavior",
      input,
      output,
      context: "learning_pattern",
      metadata: {
        topic: row.topic,
        subtopic: row.subtopic,
        avg_skill: row.avg_skill,
        attempts: row.attempts,
        avg_time_ms: row.avg_time,
        // Note: user_id is anonymized/hashed in production
        user_hash: hashUserId(row.user_id)
      },
      quality_score: 0.6,
      language: "en",
      source: "analytics_service",
      created_at: new Date().toISOString()
    };
  }).filter(e => e.quality_score >= minQuality);
}

function hashUserId(userId: string): string {
  // Simple hash for anonymization (in production use crypto)
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return `anon_${Math.abs(hash).toString(36)}`;
}

/**
 * Store training data in the database
 */
async function storeTrainingData(examples: TrainingExample[]): Promise<void> {
  if (examples.length === 0) return;
  
  // Batch insert in chunks
  const chunkSize = 100;
  for (let i = 0; i < examples.length; i += chunkSize) {
    const chunk = examples.slice(i, i + chunkSize);
    const values: string[] = [];
    const params: unknown[] = [];
    
    chunk.forEach((ex, idx) => {
      const base = idx * 10;
      values.push(`($${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5}, $${base+6}, $${base+7}, $${base+8}, $${base+9}, $${base+10})`);
      params.push(
        ex.id,
        ex.data_type,
        ex.input,
        ex.output,
        ex.context ?? null,
        JSON.stringify(ex.metadata),
        ex.quality_score,
        ex.language,
        ex.source,
        ex.created_at
      );
    });
    
    await query(
      `INSERT INTO training_data_pool 
       (id, data_type, input_text, output_text, context, metadata, quality_score, language, source, created_at)
       VALUES ${values.join(", ")}
       ON CONFLICT (id) DO NOTHING`,
      params
    );
  }
}

/**
 * Build a training dataset from collected data
 */
export async function buildDataset(config: DatasetBuildConfig): Promise<DatasetInfo> {
  const id = uuidv4();
  const minQuality = config.min_quality ?? 0.7;
  
  // Create dataset record
  await query(
    `INSERT INTO foundation_datasets (id, name, description, data_types, min_quality, format, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'building')`,
    [id, config.name, config.description ?? null, config.data_types, minQuality, config.format ?? "jsonl"]
  );
  
  try {
    // Collect from all specified data types
    const allExamples: TrainingExample[] = [];
    for (const dataType of config.data_types) {
      const result = await collectTrainingData(dataType, { 
        since: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days
        limit: 5000,
        min_quality: minQuality
      });
      
      const examples = await getTrainingExamples(dataType, minQuality, 5000);
      allExamples.push(...examples);
    }
    
    // Deduplicate
    const unique = deduplicateExamples(allExamples);
    
    // Format output
    const format = config.format ?? "jsonl";
    const output = formatExamples(unique, format);
    const sizeBytes = Buffer.byteLength(output, "utf-8");
    
    // In production, this would save to S3/MinIO
    const location = `s3://loksewa-foundation/datasets/${id}/data.${format}`;
    
    // Update dataset record
    await query(
      `UPDATE foundation_datasets 
       SET total_examples = $2, size_bytes = $3, location = $4, status = 'ready', completed_at = NOW()
       WHERE id = $1`,
      [id, unique.length, sizeBytes, location]
    );
    
    logger.info({ id, examples: unique.length, size: sizeBytes }, "Dataset built successfully");
    
    return {
      id,
      name: config.name,
      description: config.description,
      data_types: config.data_types,
      total_examples: unique.length,
      size_bytes: sizeBytes,
      format,
      status: "ready",
      location,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };
  } catch (err) {
    await query(
      `UPDATE foundation_datasets SET status = 'failed' WHERE id = $1`,
      [id]
    );
    throw err;
  }
}

async function getTrainingExamples(dataType: DataType, minQuality: number, limit: number): Promise<TrainingExample[]> {
  const result = await query<any>(
    `SELECT id, data_type, input_text as input, output_text as output, context, 
            metadata, quality_score, language, source, created_at
     FROM training_data_pool
     WHERE data_type = $1 AND quality_score >= $2
     ORDER BY quality_score DESC, created_at DESC
     LIMIT $3`,
    [dataType, minQuality, limit]
  );
  
  return result.rows.map(r => ({
    id: r.id,
    data_type: r.data_type,
    input: r.input,
    output: r.output,
    context: r.context,
    metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata,
    quality_score: parseFloat(r.quality_score),
    language: r.language,
    source: r.source,
    created_at: r.created_at
  }));
}

function deduplicateExamples(examples: TrainingExample[]): TrainingExample[] {
  const seen = new Set<string>();
  const unique: TrainingExample[] = [];
  
  for (const ex of examples) {
    const key = `${ex.data_type}:${ex.input.slice(0, 100)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(ex);
    }
  }
  
  return unique;
}

function formatExamples(examples: TrainingExample[], format: "jsonl" | "csv" | "parquet"): string {
  if (format === "jsonl") {
    return examples.map(ex => JSON.stringify({
      input: ex.input,
      output: ex.output,
      context: ex.context,
      metadata: ex.metadata
    })).join("\n");
  }
  
  if (format === "csv") {
    const header = "input,output,context,language,quality_score,source\n";
    const rows = examples.map(ex => 
      `"${ex.input.replace(/"/g, '""')}","${ex.output.replace(/"/g, '""')}","${ex.context ?? ''}",${ex.language},${ex.quality_score},${ex.source}`
    ).join("\n");
    return header + rows;
  }
  
  // Parquet would require a library in production
  return examples.map(ex => JSON.stringify(ex)).join("\n");
}

/**
 * Get training data statistics
 */
export async function getTrainingStats(): Promise<{
  total_examples: number;
  by_type: Record<string, number>;
  by_language: Record<string, number>;
  avg_quality: number;
  datasets_count: number;
  total_dataset_size_bytes: number;
}> {
  const [byType, byLang, totals, datasets] = await Promise.all([
    query<{ data_type: string; count: number }>(
      `SELECT data_type, COUNT(*) as count FROM training_data_pool GROUP BY data_type`
    ),
    query<{ language: string; count: number }>(
      `SELECT language, COUNT(*) as count FROM training_data_pool GROUP BY language`
    ),
    query<{ total: number; avg_quality: number }>(
      `SELECT COUNT(*) as total, AVG(quality_score) as avg_quality FROM training_data_pool`
    ),
    query<{ count: number; total_size: number }>(
      `SELECT COUNT(*) as count, COALESCE(SUM(size_bytes), 0) as total_size 
       FROM foundation_datasets WHERE status = 'ready'`
    )
  ]);
  
  return {
    total_examples: Number(totals.rows[0]?.total ?? 0),
    by_type: Object.fromEntries(byType.rows.map(r => [r.data_type, Number(r.count)])),
    by_language: Object.fromEntries(byLang.rows.map(r => [r.language, Number(r.count)])),
    avg_quality: Number(totals.rows[0]?.avg_quality ?? 0),
    datasets_count: Number(datasets.rows[0]?.count ?? 0),
    total_dataset_size_bytes: Number(datasets.rows[0]?.total_size ?? 0)
  };
}
