# Loksewa AI — Architecture Specification
## "Nepal's AI-Powered Loksewa Learning Platform"

---

## 1. Vision & Positioning

**Product Position:**
> "Nepal's AI-Powered Loksewa Learning Platform"

**Core Value:** Not just finding answers — helping students **understand, remember, revise, and pass** Loksewa exams.

**Current Evolution:**
```
❌ OLD:  OCR → Verified Search → Answer (Question Bank)
✅ NEW:  OCR → Verified Search → Verified Answer → AI Learning Engine → Detailed Teaching Mode
```

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│   Mobile App (React Native/Flutter) │ Web App │ PWA                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│   Rate Limiting │ Auth │ Load Balancing │ Request Routing │ Caching        │
│   (Kong / NGINX / AWS API Gateway)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
   │   CORE DOMAINS   │    │   AI DOMAINS     │    │  ANALYTICS DOM.  │
   │                  │    │                  │    │                  │
   │  • Auth Service   │    │  • Learning Eng. │    │  • Analytics     │
   │  • User Service   │    │  • AI Tutor      │    │  • User Stats    │
   │  • Question Svc   │    │  • RAG Pipeline   │    │  • Progress Eng  │
   │  • Subject Svc    │    │                  │    │                  │
   │  • Scan Service   │    │                  │    │                  │
   │  • Answer Svc     │    │                  │    │                  │
   └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
            │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      ▼
   ┌──────────────────────────────────────────────────────────────────────────┐
   │                         DATA LAYER                                       │
   │                                                                          │
   │  PostgreSQL (Primary DB)  │  Redis (Cache/Queue)  │  S3 (Media)          │
   │  • Users, Questions      │  • Session, Rate      │  • OCR Images        │
   │  • Answers, Notes        │  • Leaderboard       │  • Generated Assets  │
   │  • Flashcards, Progress  │  • Job Queue          │                       │
   │                                                                          │
   │  Elasticsearch (Search)  │  Pinecone / Qdrant (Vector DB)               │
   │  • Full-text search      │  • RAG embeddings                           │
   │  • Question matching     │  • Semantic search                           │
   │                                                                          │
   └──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
   ┌──────────────────────────────────────────────────────────────────────────┐
   │                         AI/ML LAYER                                      │
   │                                                                          │
   │  • Ollama / LM Studio (Local LLM)                                       │
   │  • OpenAI / Anthropic (Cloud LLM)                                       │
   │  • Whisper (Speech-to-Text)                                             │
   │  • EasyOCR / Tesseract (OCR)                                            │
   │  • Sentence Transformers (Embeddings)                                   │
   └──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Domain Architecture (Clean Architecture)

```
src/
├── core/                          # Shared, stable, no domain logic
│   ├── base/
│   │   ├── BaseEntity.ts          # Abstract entity with id, timestamps
│   │   ├── BaseRepository.ts     # Repository interface
│   │   ├── BaseService.ts         # Service base class with logging
│   │   └── BaseController.ts      # Controller with request/response helpers
│   ├── constants/
│   │   ├── HttpStatus.ts          # HTTP status codes
│   │   ├── ErrorCodes.ts          # Application error codes
│   │   └── SubjectTopics.ts        # Nepal exam subject structure
│   ├── errors/
│   │   ├── AppError.ts            # Custom application error
│   │   ├── NotFoundError.ts       # 404 errors
│   │   ├── ValidationError.ts     # 400 validation errors
│   │   └── UnauthorizedError.ts    # 401/403 errors
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT authentication
│   │   ├── rateLimit.middleware.ts # Rate limiting
│   │   ├── cache.middleware.ts    # Response caching
│   │   └── errorHandler.middleware.ts
│   ├── database/
│   │   ├── DataSource.ts          # TypeORM/Prisma config
│   │   ├── Migrations/            # Database migrations
│   │   └── Seeders/               # Seed data
│   ├── cache/
│   │   ├── RedisManager.ts        # Redis connection & operations
│   │   └── CacheKeys.ts           # Cache key patterns
│   ├── queue/
│   │   ├── BullQueue.ts           # Job queue setup (BullMQ)
│   │   └── QueueNames.ts          # Queue constants
│   ├── events/
│   │   ├── EventEmitter.ts        # Internal event bus
│   │   └── DomainEvents.ts        # Domain event definitions
│   └── utils/
│       ├── logger.ts              # Pino logger
│       ├── validator.ts           # Zod/Joi validators
│       └── helpers.ts             # Utility functions
│
├── domains/                       # Bounded contexts — each is fully encapsulated
│   │
│   ├── auth/                      # 🔐 Authentication Domain
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── RefreshToken.ts
│   │   │   └── Session.ts
│   │   ├── repositories/
│   │   │   └── UserRepository.ts
│   │   ├── services/
│   │   │   ├── AuthService.ts     # Login, register, token management
│   │   │   └── TokenService.ts    # JWT generation, refresh, validation
│   │   ├── controllers/
│   │   │   └── AuthController.ts  # POST /auth/login, /auth/register, /auth/refresh
│   │   ├── dto/
│   │   │   ├── LoginDTO.ts
│   │   │   ├── RegisterDTO.ts
│   │   │   └── TokenResponseDTO.ts
│   │   └── auth.types.ts
│   │
│   ├── user/                      # 👤 User Profile Domain
│   │   ├── entities/
│   │   │   ├── UserProfile.ts
│   │   │   ├── UserProgress.ts
│   │   │   └── UserPreferences.ts
│   │   ├── repositories/
│   │   │   └── UserProfileRepository.ts
│   │   ├── services/
│   │   │   └── UserService.ts     # Profile management, preferences
│   │   ├── controllers/
│   │   │   └── UserController.ts
│   │   └── dto/
│   │       ├── UpdateProfileDTO.ts
│   │       └── UserStatsDTO.ts
│   │
│   ├── subjects/                 # 📚 Subject & Topic Domain
│   │   ├── entities/
│   │   │   ├── Subject.ts
│   │   │   ├── Topic.ts
│   │   │   └── SubTopic.ts
│   │   ├── repositories/
│   │   │   └── SubjectRepository.ts
│   │   ├── services/
│   │   │   └── SubjectService.ts  # Subject CRUD, topic tree
│   │   ├── controllers/
│   │   │   └── SubjectController.ts
│   │   └── dto/
│   │       ├── SubjectDTO.ts
│   │       └── TopicTreeDTO.ts
│   │
│   ├── questions/                # ❓ Question Bank Domain
│   │   ├── entities/
│   │   │   ├── Question.ts
│   │   │   ├── QuestionOption.ts
│   │   │   ├── QuestionSource.ts
│   │   │   └── QuestionTag.ts
│   │   ├── repositories/
│   │   │   └── QuestionRepository.ts
│   │   ├── services/
│   │   │   ├── QuestionService.ts   # CRUD, filtering
│   │   │   └── QuestionSearchService.ts  # Elasticsearch integration
│   │   ├── controllers/
│   │   │   └── QuestionController.ts
│   │   ├── dto/
│   │   │   ├── QuestionDTO.ts
│   │   │   ├── CreateQuestionDTO.ts
│   │   │   └── QuestionSearchDTO.ts
│   │   └── mappers/
│   │       └── QuestionMapper.ts
│   │
│   ├── answers/                  # ✅ Answer Domain
│   │   ├── entities/
│   │   │   ├── Answer.ts
│   │   │   ├── VerifiedAnswer.ts
│   │   │   └── AnswerSource.ts
│   │   ├── repositories/
│   │   │   └── AnswerRepository.ts
│   │   ├── services/
│   │   │   ├── AnswerService.ts    # Answer retrieval, verification
│   │   │   └── AnswerVerificationService.ts  # Source verification
│   │   ├── controllers/
│   │   │   └── AnswerController.ts
│   │   └── dto/
│   │       ├── AnswerDTO.ts
│   │       └── VerifyAnswerDTO.ts
│   │
│   ├── scan/                     # 📷 OCR & Scan Domain
│   │   ├── entities/
│   │   │   ├── ScanJob.ts
│   │   │   └── ScanResult.ts
│   │   ├── repositories/
│   │   │   └── ScanJobRepository.ts
│   │   ├── services/
│   │   │   ├── ScanService.ts     # Scan initiation, job management
│   │   │   ├── OCRService.ts      # OCR processing (EasyOCR/Tesseract)
│   │   │   └── TextPreprocessorService.ts  # Nepali text normalization
│   │   ├── controllers/
│   │   │   └── ScanController.ts
│   │   ├── dto/
│   │   │   ├── ScanRequestDTO.ts
│   │   │   └── ScanResultDTO.ts
│   │   └── workers/
│   │       └── ScanWorker.ts     # BullMQ worker for async OCR
│   │
│   ├── learning/                 # 🧠 AI Learning Engine Domain (CORE FEATURE)
│   │   ├── entities/
│   │   │   ├── AILesson.ts
│   │   │   ├── Flashcard.ts
│   │   │   ├── StudyProgress.ts
│   │   │   ├── TopicNote.ts
│   │   │   └── LearningPath.ts
│   │   ├── repositories/
│   │   │   ├── AILessonRepository.ts
│   │   │   └── FlashcardRepository.ts
│   │   │   └── StudyProgressRepository.ts
│   │   ├── services/
│   │   │   ├── LearningEngineService.ts   # Orchestrates AI lessons
│   │   │   ├── LessonGeneratorService.ts  # Generates structured lessons
│   │   │   ├── FlashcardService.ts        # Flashcard generation & review
│   │   │   ├── ProgressTrackingService.ts # Tracks learning progress
│   │   │   └── TopicNoteService.ts        # Topic notes management
│   │   ├── controllers/
│   │   │   └── LearningController.ts
│   │   ├── dto/
│   │   │   ├── GenerateLessonDTO.ts
│   │   │   ├── LessonDTO.ts
│   │   │   ├── FlashcardDTO.ts
│   │   │   └── ProgressDTO.ts
│   │   └── ai/
│   │       ├── LessonPromptBuilder.ts     # Builds prompts for LLM
│   │       ├── LessonParser.ts            # Parses LLM output to structured lesson
│   │       └── LessonCache.ts             # Caches generated lessons
│   │
│   ├── ai-tutor/                 # 🤖 AI Tutor Domain
│   │   ├── entities/
│   │   │   ├── TutorConversation.ts
│   │   │   ├── TutorMessage.ts
│   │   │   └── TutorContext.ts
│   │   ├── repositories/
│   │   │   └── TutorConversationRepository.ts
│   │   ├── services/
│   │   │   ├── TutorService.ts           # Chat interface
│   │   │   ├── RAGPipeline.ts            # Retrieval-Augmented Generation
│   │   │   ├── ContextBuilder.ts          # Builds context from knowledge base
│   │   │   └── ResponseGenerator.ts       # Generates tutor responses
│   │   ├── controllers/
│   │   │   └── TutorController.ts
│   │   ├── dto/
│   │   │   ├── ChatMessageDTO.ts
│   │   │   └── TutorResponseDTO.ts
│   │   └── rag/
│   │       ├── VectorSearch.ts            # Pinecone/Qdrant search
│   │       ├── DocumentRetriever.ts       # Fetches relevant documents
│   │       └── KnowledgeBase.ts           # Knowledge base interface
│   │
│   ├── mock-test/                # 📝 Mock Test Domain
│   │   ├── entities/
│   │   │   ├── MockTest.ts
│   │   │   ├── TestQuestion.ts
│   │   │   ├── TestAttempt.ts
│   │   │   ├── TestAnswer.ts
│   │   │   └── TestResult.ts
│   │   ├── repositories/
│   │   │   ├── MockTestRepository.ts
│   │   │   └── TestAttemptRepository.ts
│   │   ├── services/
│   │   │   ├── MockTestService.ts     # Test creation, retrieval
│   │   │   ├── TestEngine.ts          # Generates tests, handles timing
│   │   │   ├── ScoringService.ts      # Calculates scores
│   │   │   └── AnalyticsService.ts    # Performance analytics
│   │   ├── controllers/
│   │   │   └── MockTestController.ts
│   │   └── dto/
│   │       ├── StartTestDTO.ts
│   │       └── TestResultDTO.ts
│   │
│   ├── analytics/                # 📊 Analytics Domain
│   │   ├── entities/
│   │   │   ├── DailyStats.ts
│   │   │   ├── WeaknessArea.ts
│   │   │   └── StudyStreak.ts
│   │   ├── repositories/
│   │   │   └── AnalyticsRepository.ts
│   │   ├── services/
│   │   │   ├── AnalyticsService.ts    # Aggregation, reporting
│   │   │   ├── WeaknessDetectionService.ts  # Identifies weak areas
│   │   │   └── RecommendationEngine.ts # Study recommendations
│   │   ├── controllers/
│   │   │   └── AnalyticsController.ts
│   │   └── dto/
│   │       ├── StatsDTO.ts
│   │       └── RecommendationDTO.ts
│   │
│   └── subscription/             # 💳 Subscription Domain (Premium)
│       ├── entities/
│       │   ├── Subscription.ts
│       │   ├── Plan.ts
│       │   ├── Payment.ts
│       │   └── FeatureAccess.ts
│       ├── repositories/
│       │   └── SubscriptionRepository.ts
│       ├── services/
│       │   ├── SubscriptionService.ts
│       │   ├── PaymentService.ts
│       │   └── FeatureGateService.ts   # Checks feature access
│       ├── controllers/
│       │   └── SubscriptionController.ts
│       └── dto/
│           └── PlanDTO.ts
│
├── shared/                       # Cross-domain shared code
│   ├── types/
│   │   ├── pagination.ts
│   │   ├── apiResponse.ts
│   │   └── common.ts
│   ├── decorators/
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── rateLimit.ts
│   │   └── cache.ts
│   └── enums/
│       ├── UserRole.ts
│       ├── SubscriptionPlan.ts
│       ├── QuestionDifficulty.ts
│       └── LearningLevel.ts
│
├── config/                      # Configuration
│   ├── index.ts                  # Central config (reads env)
│   ├── database.ts               # DB config
│   ├── redis.ts                  # Redis config
│   ├── ai.ts                     # LLM/AI config
│   └── storage.ts                # S3/storage config
│
├── routes/                      # Express/Koa/Fastify route definitions
│   ├── index.ts                  # Combines all route modules
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── subjects.routes.ts
│   ├── questions.routes.ts
│   ├── answers.routes.ts
│   ├── scan.routes.ts
│   ├── learning.routes.ts
│   ├── tutor.routes.ts
│   ├── mocktest.routes.ts
│   ├── analytics.routes.ts
│   └── subscription.routes.ts
│
├── workers/                     # Background job workers
│   ├── index.ts                  # Worker initialization
│   ├── ocr.worker.ts             # OCR processing
│   ├── ai-lesson.worker.ts       # AI lesson generation
│   ├── flashcard.worker.ts       # Flashcard generation
│   ├── analytics.worker.ts       # Analytics aggregation
│   └── notification.worker.ts    # Push notifications
│
└── app.ts                       # Application entry point
```

---

## 4. Data Models & Associations

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USERS                                      │
│  id, email, password_hash, name, phone, avatar_url,                  │
│  role, subscription_id, created_at, updated_at                      │
│                                                                      │
│  has_one → Subscription                                             │
│  has_many → Session, ScanJob, TestAttempt, StudyProgress,           │
│             TutorConversation, FlashcardReview                      │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SUBJECTS                                     │
│  id, name, name_np, icon, color, sort_order,                        │
│  is_active, created_at                                              │
│                                                                      │
│  has_many → Topics                                                  │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            TOPICS                                    │
│  id, subject_id, name, name_np, description,                         │
│  sort_order, loksewa_weight, created_at                              │
│                                                                      │
│  has_many → SubTopics, Questions, TopicNotes                        │
│  has_many → StudyProgress (via user_id + topic_id)                  │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SUBTOPICS                                   │
│  id, topic_id, name, name_np, sort_order,                           │
│  created_at                                                         │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         QUESTIONS                                    │
│  id, topic_id, subtopic_id, question_text, question_text_np,        │
│  question_image_url, difficulty, exam_year, exam_type,               │
│  source, is_verified, verified_by, verified_at,                      │
│  loksewa_frequency, created_at, updated_at                           │
│                                                                      │
│  has_many → Options, Answers, QuestionTags, AILessons               │
│  belongs_to → Topic, SubTopic                                        │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       QUESTION_OPTIONS                              │
│  id, question_id, option_label, option_text, option_text_np,        │
│  is_correct, sort_order                                             │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          ANSWERS                                     │
│  id, question_id, answer_text, explanation,                         │
│  source, source_url, is_verified, verified_by, verified_at          │
│                                                                      │
│  has_one → Answer (verified answer for question)                    │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AI_LESSONS                                   │
│  id, question_id, simple_explanation, detailed_explanation,         │
│  exam_notes, mnemonic, related_questions_json,                      │
│  topic_summary, difficulty_level, generated_at,                     │
│  cache_key, version                                                 │
│                                                                      │
│  belongs_to → Question                                              │
│  has_many → Flashcards (via question_id)                            │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FLASHCARDS                                  │
│  id, question_id, lesson_id, front, back,                           │
│  review_count, last_reviewed_at, next_review_at,                    │
│  ease_factor, interval, created_at                                  │
│                                                                      │
│  belongs_to → Question, AILesson                                    │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       STUDY_PROGRESS                                │
│  id, user_id, topic_id, completion_percentage,                     │
│  questions_attempted, questions_correct,                            │
│  time_spent_minutes, last_studied_at, streak_days,                 │
│  mastery_level, created_at, updated_at                              │
│                                                                      │
│  belongs_to → User, Topic                                           │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TUTOR_CONVERSATIONS                            │
│  id, user_id, subject_id, topic_id, title,                          │
│  context_json, message_count, last_message_at,                      │
│  created_at                                                         │
│                                                                      │
│  has_many → TutorMessages                                           │
│  belongs_to → User                                                  │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        TUTOR_MESSAGES                               │
│  id, conversation_id, role (user/assistant), content,               │
│  attachments_json, created_at                                       │
│                                                                      │
│  belongs_to → TutorConversation                                     │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         MOCK_TESTS                                  │
│  id, title, description, subject_id,                                │
│  question_count, time_limit_minutes, difficulty_mix,                │
│  is_premium, is_active, created_at                                  │
│                                                                      │
│  has_many → TestAttempts                                            │
│  belongs_to → Subject                                               │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        TEST_ATTEMPTS                                │
│  id, user_id, test_id, started_at, completed_at,                    │
│  score, total_questions, correct_answers,                           │
│  time_taken_seconds, status, results_json                          │
│                                                                      │
│  belongs_to → User, MockTest                                        │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        TOPIC_NOTES                                  │
│  id, topic_id, title, content, content_np,                          │
│  level (beginner/intermediate/advanced),                            │
│  is_verified, source, created_at, updated_at                        │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SUBSCRIPTIONS                              │
│  id, user_id, plan_id, status, started_at,                          │
│  expires_at, auto_renew, payment_id                                 │
│                                                                      │
│  belongs_to → User, Plan                                            │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                             PLANS                                   │
│  id, name, code, price, currency,                                  │
│  duration_days, features_json, is_active, created_at                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. AI Learning Engine — Detailed Flow

```
USER SCANS QUESTION
        │
        ▼
┌─────────────────┐
│  VERIFIED ANSWER │
│  (from database)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│            TEACH ME BUTTON                      │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│           AI LEARNING ENGINE                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Step 1: Fetch Context                         │
│  ┌───────────────────────────────────────────┐  │
│  │ • Verified Answer                         │  │
│  │ • Topic Notes (beginner/intermediate/adv) │  │
│  │ • Related MCQs from database              │  │
│  │ • Previous Loksewa questions              │  │
│  └───────────────────────────────────────────┘  │
│                    │                            │
│                    ▼                            │
│  Step 2: RAG Pipeline                         │
│  ┌───────────────────────────────────────────┐  │
│  │ • Vector search in knowledge base         │  │
│  │ • Retrieve relevant documents             │  │
│  │ • Build context window                    │  │
│  └───────────────────────────────────────────┘  │
│                    │                            │
│                    ▼                            │
│  Step 3: Prompt Construction                   │
│  ┌───────────────────────────────────────────┐  │
│  │ System: "You are an expert Loksewa tutor" │  │
│  │ Context: [Verified facts, notes, Qs]     │  │
│  │ Task: Generate structured lesson          │  │
│  └───────────────────────────────────────────┘  │
│                    │                            │
│                    ▼                            │
│  Step 4: LLM Generation                       │
│  ┌───────────────────────────────────────────┐  │
│  │ OpenAI/Anthropic/Ollama                   │  │
│  │ Model: gpt-4o / claude-3.5 / llama3       │  │
│  └───────────────────────────────────────────┘  │
│                    │                            │
│                    ▼                            │
│  Step 5: Parse & Structure                    │
│  ┌───────────────────────────────────────────┐  │
│  │ Generate lesson object:                   │  │
│  │ {                                        │  │
│  │   simple_explanation,                    │  │
│  │   detailed_explanation,                  │  │
│  │   exam_notes,                           │  │
│  │   mnemonic,                             │  │
│  │   related_questions[],                  │  │
│  │   topic_summary,                        │  │
│  │   flashcards: [{front, back}]           │  │
│  │ }                                        │  │
│  └───────────────────────────────────────────┘  │
│                    │                            │
│                    ▼                            │
│  Step 6: Store & Cache                        │
│  ┌───────────────────────────────────────────┐  │
│  │ • Save to ai_lessons table               │  │
│  │ • Generate flashcards in db              │  │
│  │ • Cache in Redis (24h TTL)              │  │
│  └───────────────────────────────────────────┘  │
│                    │                            │
│                    ▼                            │
│  Step 7: Return Lesson                        │
│  ┌───────────────────────────────────────────┐  │
│  │ Display to user with interactive UI       │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 6. RAG Pipeline for AI Tutor

```
USER ASKS QUESTION
        │
        ▼
┌─────────────────────────────────────────┐
│           CONTEXT RETRIEVAL             │
├─────────────────────────────────────────┤
│                                         │
│  Query: "What is proportional          │
│  representation?"                      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Vector Embedding (Sentence Trans.)│ │
│  └──────────────┬────────────────────┘ │
│                 │                      │
│                 ▼                      │
│  ┌───────────────────────────────────┐ │
│  │ Pinecone / Qdrant Search          │ │
│  │ Top-K: 5 similar chunks           │ │
│  └──────────────┬────────────────────┘ │
│                 │                      │
│                 ▼                      │
│  ┌───────────────────────────────────┐ │
│  │ Knowledge Base Retrieval          │ │
│  │ • Subject notes                   │ │
│  │ • Topic summaries                 │ │
│  │ • Past questions                  │ │
│  │ • Syllabus content                │ │
│  └──────────────┬────────────────────┘ │
│                 │                      │
│                 ▼                      │
│  ┌───────────────────────────────────┐ │
│  │ Context Window Construction       │ │
│  │ [System prompt]                  │ │
│  │ [Syllabus rules]                 │ │
│  │ [Retrieved facts]                │ │
│  │ [User question]                  │ │
│  └───────────────────────────────────┘ │
└──────────────────────┬──────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────┐
│           LLM GENERATION                │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Claude-3.5 / GPT-4o               │  │
│  │ Temperature: 0.7                  │  │
│  │ Max tokens: 500                   │  │
│  └──────────────┬────────────────────┘  │
│                 │                       │
│                 ▼                       │
│  ┌───────────────────────────────────┐  │
│  │ Response Formatting               │  │
│  │ • Nepali + English                │  │
│  │ • Source citations                │  │
│  │ • Related questions               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 7. Technical Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  React Native (iOS/Android)  │  Next.js (Web)                  │
│  Expo                          │  TailwindCSS                    │
│  React Navigation              │  Shadcn UI                      │
│  Zustand (State)              │  TanStack Query                 │
│  Socket.io-client             │                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                                                                 │
│  Runtime: Node.js 20+ / Bun                                     │
│  Framework: Fastify (performance) or NestJS (structure)        │
│  Language: TypeScript (strict mode)                             │
│                                                                 │
│  API Style: REST + GraphQL (for complex queries)              │
│  Auth: JWT (access) + Refresh Token (rotation)                 │
│  Validation: Zod                                                │
│  ORM: Prisma (Type-safe, migrations)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│                                                                 │
│  Primary: PostgreSQL 16 (Supabase / AWS RDS)                    │
│  Cache: Redis 7 (Upstash)                                      │
│  Search: Elasticsearch 8 / Meilisearch                          │
│  Vectors: Pinecone / Qdrant (RAG)                              │
│  Object Storage: S3 / Cloudflare R2                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AI/ML                                     │
│                                                                 │
│  LLM: Claude 3.5 Sonnet / GPT-4o (primary)                     │
│      Ollama (local, offline support)                           │
│  Embeddings: sentence-transformers (local)                    │
│  OCR: EasyOCR / Tesseract                                      │
│  Speech: Whisper (voice input)                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                             │
│                                                                 │
│  Hosting: Vercel (frontend) + Railway/Render (backend)         │
│  CDN: Cloudflare                                               │
│  Queue: BullMQ (Redis-backed)                                  │
│  Monitoring: Prometheus + Grafana / Sentry                     │
│  CI/CD: GitHub Actions                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Scalability Design

```
                         ┌─────────────────┐
                         │   Cloudflare    │
                         │   (CDN + WAF)   │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │   API Gateway   │
                         │  (Rate Limit)   │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
     ┌────────▼────────┐ ┌───────▼───────┐ ┌───────▼───────┐
     │  API Instance 1  │ │  API Instance 2  │ │  API Instance N  │
     │  (Auto-scale)    │ │  (Auto-scale)    │ │  (Auto-scale)    │
     └────────┬────────┘ └───────┬───────┘ └───────┬───────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                         ┌────────▼────────┐
                         │     Redis       │
                         │  (Cache/Session)│
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
     ┌────────▼────────┐ ┌───────▼───────┐ ┌───────▼───────┐
     │  PostgreSQL     │ │ Elasticsearch │ │   Pinecone    │
     │  (Primary)      │ │               │ │  (Vectors)    │
     │  + Read Replica │ │               │ │               │
     └─────────────────┘ └───────────────┘ └───────────────┘

AI Processing (Async):
     ┌──────────────┐      ┌──────────────┐
     │  OCR Queue   │      │ AI Lesson Q  │
     │  (BullMQ)    │      │  (BullMQ)    │
     └──────┬───────┘      └──────┬───────┘
            │                     │
     ┌──────▼───────┐      ┌──────▼───────┐
     │  OCR Worker  │      │Lesson Worker │
     │  (GPU)       │      │  (LLM API)   │
     └──────────────┘      └──────────────┘
```

**Millions of Traffic Handling:**

1. **Horizontal Scaling** — API instances auto-scale based on CPU/traffic
2. **Read Replicas** — Database read replicas for query-heavy operations
3. **Redis Caching** — Cache verified answers, AI lessons, user sessions
4. **CDN** — Static assets served from edge
5. **Queue Workers** — AI processing offloaded to async workers
6. **Connection Pooling** — PgBouncer for database connection management
7. **Rate Limiting** — Per-user, per-IP rate limits at gateway
8. **Image Optimization** — Lazy loading, WebP/AVIF, responsive images

---

## 9. Security

- **JWT with short expiry** (15 min) + **refresh token rotation**
- **Password hashing** — Argon2id (not bcrypt)
- **Input validation** — Zod schemas on all endpoints
- **SQL Injection** — Prisma parameterized queries
- **XSS** — Content sanitization, CSP headers
- **Rate limiting** — 100 req/min per user, 1000 req/min per IP
- **CORS** — Strict origin whitelist
- **Secrets management** — Env vars + secret manager (AWS Secrets Manager)
- **Audit logging** — All auth events logged

---

## 10. Testing Strategy

```
Unit Tests          → Jest / Vitest (fast, isolated)
  └── Per service, per utility function

Integration Tests   → Supertest + Testcontainers
  └── API endpoints, DB operations

E2E Tests           → Playwright
  └── Critical user flows

AI Tests            → Golden dataset + regression
  └── Lesson quality, tutor accuracy

Load Tests          → k6
  └── Simulate millions of requests

Security Tests      → OWASP ZAP + code scanning
  └── Dependency vulnerabilities
```

---

## 11. Deployment & DevOps

```
GitHub Actions CI/CD:

push → lint → test → build → deploy(staging) → manual approve → deploy(prod)

Environments:
  • dev     → local / ngrok
  • staging → railway.app
  • prod    → railway + managed DB
```

---

## 12. API Design (Sample Endpoints)

```
AUTH
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/refresh
  POST   /api/auth/logout

SUBJECTS
  GET    /api/subjects
  GET    /api/subjects/:id/topics
  GET    /api/topics/:id

QUESTIONS
  GET    /api/questions?subject=&topic=&difficulty=
  GET    /api/questions/:id
  GET    /api/questions/search?q=

SCAN
  POST   /api/scan
  GET    /api/scan/:id/result

LEARNING
  POST   /api/lessons/generate
  GET    /api/lessons/:questionId
  GET    /api/flashcards?topic=
  POST   /api/flashcards/:id/review
  GET    /api/progress
  PUT    /api/progress/:topicId

TUTOR
  POST   /api/tutor/chat
  GET    /api/tutor/conversations
  GET    /api/tutor/conversations/:id/messages

MOCK TESTS
  GET    /api/tests
  POST   /api/tests/start
  POST   /api/tests/:id/submit
  GET    /api/tests/:id/results

ANALYTICS
  GET    /api/analytics/stats
  GET    /api/analytics/weaknesses
  GET    /api/analytics/recommendations
```

---

## 13. Key Metrics & Success Indicators

| Metric | Target |
|--------|--------|
| DAU (Daily Active Users) | 100K+ |
| MAU (Monthly Active Users) | 500K+ |
| Question searches/day | 1M+ |
| AI lessons generated/day | 100K+ |
| API response time (p99) | < 200ms |
| AI lesson generation time | < 5s |
| System uptime | 99.9% |
| Scan accuracy | > 95% |

---

*This architecture positions Loksewa AI as Nepal's definitive AI-powered exam preparation platform — scalable, maintainable, and built for the next decade.*