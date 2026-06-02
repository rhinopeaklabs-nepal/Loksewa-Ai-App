// Database seeding orchestrator for Loksewa AI
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import seed modules
import { subjects } from './seed-data/subjects.mjs';
import { syllabus } from './seed-data/syllabus.mjs';
import { mockTests } from './seed-data/mock-tests.mjs';
import { prepTopics } from './seed-data/prep-topics.mjs';
import { generateAllQuestions } from './generate-questions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../runtime/node-backend-dev.json');

function seed() {
  console.log(`Starting database seeding...`);
  console.log(`Target database: ${dbPath}`);

  if (!fs.existsSync(dbPath)) {
    console.error(`Database file not found at: ${dbPath}`);
    process.exit(1);
  }

  // 1. Read existing database
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(dbContent);

  console.log(`Existing database loaded.`);
  console.log(`- Existing users: ${db.users ? db.users.length : 0}`);
  console.log(`- Existing sessions: ${Object.keys(db.sessions || {}).length}`);
  console.log(`- Existing questions to replace: ${db.questions ? db.questions.length : 0}`);

  // Create backup
  const backupPath = `${dbPath}.bak-${Date.now()}`;
  fs.writeFileSync(backupPath, dbContent);
  console.log(`Created database backup at: ${backupPath}`);

  const nowStr = new Date().toISOString();

  // 2. Load and seed subjects
  console.log(`Seeding subjects...`);
  db.subjects = subjects.map((sub, idx) => ({
    ...sub,
    id: idx + 1,
    created_at: nowStr,
    updated_at: nowStr
  }));
  console.log(`- Seeded ${db.subjects.length} subjects.`);

  // 3. Load and seed syllabus
  console.log(`Seeding syllabus...`);
  db.syllabus = syllabus.map((sylItem, idx) => ({
    ...sylItem,
    id: idx + 1,
    created_at: nowStr,
    updated_at: nowStr
  }));
  console.log(`- Seeded ${db.syllabus.length} syllabus entries.`);

  // 4. Generate and seed questions
  console.log(`Generating 10,000+ MCQs procedurally...`);
  const rawQuestions = generateAllQuestions();
  console.log(`- Generated ${rawQuestions.length} raw questions.`);

  db.questions = rawQuestions.map((qItem, idx) => ({
    ...qItem,
    id: idx + 1,
    created_at: nowStr,
    updated_at: nowStr
  }));
  console.log(`- Seeded ${db.questions.length} questions.`);

  // 5. Seed prep topics and flashcards
  console.log(`Seeding prep topics and flashcards...`);
  db.prep_topics = [];
  db.prep_flashcards = [];

  let topicId = 1;
  let flashcardId = 1;

  prepTopics.forEach(item => {
    const createdTopic = {
      ...item.topic,
      id: topicId++,
      created_at: nowStr,
      updated_at: nowStr
    };
    db.prep_topics.push(createdTopic);

    // Seed its flashcards
    item.flashcards.forEach(fc => {
      db.prep_flashcards.push({
        ...fc,
        topic_id: createdTopic.id,
        id: flashcardId++,
        created_at: nowStr,
        updated_at: nowStr
      });
    });
  });
  console.log(`- Seeded ${db.prep_topics.length} prep topics.`);
  console.log(`- Seeded ${db.prep_flashcards.length} prep flashcards.`);

  // 6. Seed mock tests and map questions
  console.log(`Seeding mock tests and mapping questions...`);
  db.mocks = mockTests.map((mock, idx) => {
    const mockId = idx + 1;
    let selectedQIds = [];

    if (mock.syllabus_category === "Mixed") {
      // Pick randomly or sequentially across all categories
      const targetCount = mock.total_questions;
      // Let's sample questions across various indices
      const step = Math.floor(db.questions.length / targetCount);
      for (let i = 0; i < targetCount; i++) {
        const qIdx = (i * step) % db.questions.length;
        selectedQIds.push(db.questions[qIdx].id);
      }
    } else {
      // Filter questions by this category
      const categoryQuestions = db.questions.filter(q => q.syllabus_category === mock.syllabus_category);
      const targetCount = Math.min(mock.total_questions, categoryQuestions.length);
      
      if (categoryQuestions.length === 0) {
        console.warn(`Warning: No questions found for category "${mock.syllabus_category}" in mock test "${mock.title}"`);
      }

      for (let i = 0; i < targetCount; i++) {
        selectedQIds.push(categoryQuestions[i].id);
      }

      // If we didn't get enough questions, fill in with any general questions
      if (selectedQIds.length < mock.total_questions) {
        const diff = mock.total_questions - selectedQIds.length;
        for (let i = 0; i < diff; i++) {
          const qIdx = (i * 13) % db.questions.length;
          selectedQIds.push(db.questions[qIdx].id);
        }
      }
    }

    return {
      ...mock,
      id: mockId,
      question_ids: selectedQIds,
      total_questions: selectedQIds.length,
      created_at: nowStr,
      updated_at: nowStr
    };
  });
  console.log(`- Seeded ${db.mocks.length} mock tests with mapped questions.`);

  // 7. Update meta.next_id counters
  db.meta.next_id.subjects = db.subjects.length + 1;
  db.meta.next_id.questions = db.questions.length + 1;
  db.meta.next_id.syllabus = db.syllabus.length + 1;
  db.meta.next_id.mocks = db.mocks.length + 1;
  db.meta.next_id.prep_topics = db.prep_topics.length + 1;
  db.meta.next_id.prep_flashcards = db.prep_flashcards.length + 1;

  db.meta.data_version = (db.meta.data_version || 1) + 1;

  console.log(`Updated meta next_id counters:`, db.meta.next_id);

  // 8. Write updated database back to file
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Database successfully written and saved to ${dbPath}!`);
  console.log(`Seeding process complete! Total database size: ${(fs.statSync(dbPath).size / 1024 / 1024).toFixed(2)} MB`);
}

try {
  seed();
} catch (error) {
  console.error(`Error during seeding:`, error);
  process.exit(1);
}
