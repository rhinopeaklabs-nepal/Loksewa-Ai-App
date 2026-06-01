# Loksewa AI — Software Architecture Specification (SAS)
## Master Vision Document for AI Agents, Engineers, and Stakeholders

> **"Build the Duolingo + ChatGPT + Adaptive Learning Platform for Nepal."**

| Field | Value |
| --- | --- |
| Company | RhinoPeak Labs Nepal |
| Product | Loksewa AI |
| Document Type | Software Architecture Specification (SAS) |
| Version | 1.0 (Vision) |
| Status | Living Document — Source of Truth |
| Audience | AI Agents, Engineers, Product Managers, Founders, Reviewers |
| Repository | https://github.com/rhinopeaklabs-nepal/Loksewa-Ai-App |
| Last Updated | 2026-06-01 |

---

## How to Read This Document

This is the **canonical source of truth** for what Loksewa AI is, what it must do, and how it must be built. It is intentionally exhaustive so that an AI agent or engineer with no prior context can read it once and understand the system end-to-end.

**Reading guide:**

- **Part I — Foundation** — what the product is, who it serves, the terms you will see.
- **Part II — Product** — user-facing behavior, the six core engines, functional requirements.
- **Part III — Architecture** — system structure, data flow, every engine broken down.
- **Part IV — Cross-Cutting** — APIs, auth, i18n, performance, security, DevOps.
- **Part V — Operations** — deployment, roadmap, cost, risks.
- **Part VI — Appendices** — concrete schemas, prompt templates, repository layout.

If you are an **AI agent implementing a feature**, jump to Part II (functional requirements for that feature) and Part III (the engine that owns it). If you are a **founder or reviewer**, read Part I and Part II.

---

# PART I — FOUNDATION

---

## 1. Executive Summary

Loksewa AI is not a traditional LMS. It is not a question bank. It is not a chatbot.

**Loksewa AI is the AI Learning Operating System for Nepal.**

It combines, in one product:

- The **gamified learning loop** of Duolingo (XP, streaks, daily missions, progressive unlocking).
- The **conversational intelligence** of ChatGPT (a personal AI tutor that knows you).
- The **spaced repetition** of Anki (long-term memory of what you know and forget).
- The **structured courses** of Coursera (syllabus-aligned learning paths).
- The **adaptive testing** of modern assessment systems.
- A **verified knowledge engine** purpose-built for Nepal's Loksewa (civil service) syllabus.

Every student gets a unique learning experience. Every interaction strengthens the system. Over time, the platform becomes the **default AI learning platform for Nepal** and the foundation for a future Nepal-focused educational AI model — **RhinoPeak Loksewa**.

---

## 2. Vision, Mission, Philosophy

### 2.1 Vision Statement

> Help every Nepali student prepare smarter, faster, and more efficiently for Loksewa and other competitive exams — by building an AI-native learning ecosystem that understands each student, remembers their journey, and gets smarter with every interaction.

### 2.2 Mission

Build an intelligent adaptive learning system that:

1. **Understands** student weaknesses and strengths.
2. **Remembers** learning behavior across sessions and years.
3. **Generates** personalized learning paths and daily missions.
4. **Explains** mistakes in the student's own language (Nepali or English).
5. **Adapts** difficulty and topic priority in real time.
6. **Builds** long-term memory through spaced repetition.
7. **Continuously improves** by learning from every interaction.

### 2.3 Core Philosophy

Traditional Loksewa apps follow the same dead pattern:

```
Watch video → Read notes → Take test → Forget everything
```

Loksewa AI follows a living loop:

```
Learn → Practice → Analyze → Adapt → Improve → Repeat
```

The platform is a **mentor**, not a **content library**. It does not just deliver information — it coaches the student.

### 2.4 Product Identity

> **Loksewa AI = Duolingo + ChatGPT + Anki + Coursera + Nepal Knowledge Engine**

The product must feel:
- **Personalized** — every screen is tuned to this student.
- **Gamified** — XP, streaks, badges, leaderboards make learning addictive.
- **Intelligent** — answers adapt to your level and explain why.
- **Motivational** — like Duolingo's owl, but smarter.
- **Human-like** — the AI tutor feels like a real Nepali teacher.
- **Fast** — verified answers in < 200 ms, AI answers in < 3 s.

### 2.5 Differentiation

| What competitors offer | What Loksewa AI offers |
| --- | --- |
| PDFs and notes | Adaptive learning engine |
| Recorded video classes | Personal AI tutor |
| Static MCQ banks | Memory engine that tracks every weakness |
| One-size-fits-all mock tests | AI-generated daily missions |
| Limited analytics | Exam readiness score, weak-area prediction |
| No personalization | Full personalization from day one |
| No memory across sessions | Permanent memory of every student |
| English only | Nepali-first, English-supported |
| No foundation model | Future RhinoPeak Nepal model |

---

## 3. Scope and Boundaries

### 3.1 In Scope

- Loksewa preparation (Nepal civil service) — primary use case.
- Engineering license preparation — secondary.
- AI tutoring in Nepali and English.
- Verified question bank with RAG-based explanations.
- Adaptive learning, gamification, leaderboards.
- Future: SEE, +2, Bachelor-level students.

### 3.2 Out of Scope (v1)

- Live tutoring or human coaching.
- Job placement or recruitment.
- Government form-filling or application submission.
- Payments to government (we are a learning product, not a payment processor).

### 3.3 Repository Purpose

The repository is the **central codebase for an AI-native educational ecosystem**, not a single-feature app. Every module added should serve one of the six core engines. New features that do not strengthen the engines should be questioned.

---

## 4. Stakeholders and Users

### 4.1 Primary Stakeholders

| Stakeholder | Role | Primary Interest |
| --- | --- | --- |
| RhinoPeak Labs Nepal | Owner | Product success, technical excellence |
| Engineering team | Builder | Clear architecture, maintainable code |
| AI/ML team | Builder | Data pipeline, model quality |
| Product team | Designer | User outcomes, retention |
| Content team | Curator | Verified questions, syllabus accuracy |
| Investors | Funder | Scalability, defensibility, market fit |
| Reviewers / regulators | Oversight | Data privacy, content accuracy |

### 4.2 Primary Users

| User Segment | Description | Key Need |
| --- | --- | --- |
| **Loksewa aspirant (Nayab Subba, Kharidar)** | Recent bachelor graduate, 22-28 y/o | Daily practice, syllabus coverage, mock tests |
| **Officer-level candidate** | Senior aspirant, 28-40 y/o | Deep explanations, weak-area diagnosis |
| **Engineering license student** | Technical track | Subject-specific questions, calculations |
| **SEE student (future)** | School-level | Foundation building (future phase) |
| **+2 / Bachelor student (future)** | Pre-university | Concept clarity (future phase) |
| **Teacher / content creator** | Contributor | Uploading questions, reviewing answers |
| **Admin (internal)** | Operator | Content moderation, user support, analytics |

### 4.3 Success Metrics

- **D1 retention** ≥ 40%.
- **D7 retention** ≥ 20%.
- **D30 retention** ≥ 10%.
- **Daily active users / monthly active users** ≥ 25%.
- **Average session length** ≥ 15 minutes.
- **Mock exam pass rate** (students who improve ≥ 20% over 30 days) ≥ 35%.
- **AI tutor helpfulness rating** ≥ 4.2/5.
- **Verified answer accuracy** = 100% (non-negotiable).

---

## 5. Glossary

| Term | Definition |
| --- | --- |
| **Loksewa** | Nepal's Public Service Commission (Lok Sewa Ayog) competitive examinations for civil service jobs. |
| **MCQ** | Multiple Choice Question. |
| **Mock Exam** | Full-length simulated exam. |
| **RAG** | Retrieval-Augmented Generation — an AI pattern where retrieved context is fed to an LLM to ground its answer. |
| **Embedding** | A vector representation of text, used for semantic search. |
| **Vector Database** | A database optimized for similarity search over embeddings (e.g., Qdrant). |
| **XP** | Experience Points — gamification reward for actions. |
| **Streak** | Consecutive days of activity. |
| **Skill Score** | A 0-100 number representing mastery of a topic. |
| **Daily Mission** | A personalized set of practice questions generated each day. |
| **Memory** | A long-term fact about a student (preference, weakness, behavior). |
| **Knowledge Atom** | The smallest verified unit of educational content (a question, a fact, a definition). |
| **RhinoPeak** | The future Nepal-focused foundation model trained on Loksewa AI's verified data. |
| **Event** | An immutable record of something that happened (e.g., `question.answered`). |
| **Saga** | A long-running distributed transaction across services. |
| **AI Tutor** | The conversational AI assistant inside the app. |
| **Adaptive Engine** | The system that adjusts difficulty, topic priority, and review frequency. |
| **Verified Answer** | An answer retrieved from the curated, source-cited knowledge base — displayed with a "Verified" badge. |
| **AI Answer** | An answer generated by an LLM — displayed with a disclaimer. |

---

# PART II — PRODUCT

---

## 6. Six Core Engines

The product is built around **six engines**. Every feature in the app should map to one or more of these.

```
                    ┌─────────────────────────────┐
                    │       LOKSEWA AI CORE        │
                    └─────────────────────────────┘
                                    │
       ┌────────────┬───────────────┼───────────────┬────────────┐
       ▼            ▼               ▼               ▼            ▼
  ┌─────────┐ ┌──────────┐   ┌──────────┐    ┌──────────┐  ┌──────────────┐
  │Learning │ │  Memory  │   │Knowledge │    │AI Tutor  │  │ Gamification │
  │ Engine  │ │  Engine  │   │ Engine   │    │ Engine   │  │   Engine     │
  └─────────┘ └──────────┘   └──────────┘    └──────────┘  └──────────────┘
                                              │
                                              ▼
                                  ┌──────────────────────┐
                                  │ Future Foundation    │
                                  │ Model Engine         │
                                  └──────────────────────┘
```

### 6.1 Learning Engine

**Purpose:** Generate personalized learning experiences.

**Owns:**
- Learning path generation.
- Daily mission composition.
- Topic recommendations.
- Progress tracking.
- Skill score calculation.
- Difficulty adaptation.

**Inputs:** User performance history, memory, time available, exam target.

**Outputs:** Daily mission, next lesson, mock exam schedule.

### 6.2 Memory Engine

**Purpose:** Remember everything about the student, forever.

**Owns:**
- Session memory (current session context).
- Long-term memory (preferences, weaknesses, strengths).
- Learning memory (what was learned, when, how well).
- Behavioral memory (study time, frequency, patterns).
- Knowledge memory (what the AI tutor knows about this user).

**Storage:** PostgreSQL (structured facts) + Qdrant (semantic memory embeddings).

### 6.3 Knowledge Engine

**Purpose:** Store, retrieve, and serve verified educational knowledge.

**Owns:**
- Verified question bank.
- Government publications.
- Books and notes.
- Current affairs feed.
- Teacher-uploaded content.
- RAG pipeline (chunking, embedding, retrieval).

**Storage:** PostgreSQL (metadata) + Qdrant (vectors) + S3 (original documents).

### 6.4 AI Tutor Engine

**Purpose:** Act as a personal mentor for every student.

**Owns:**
- Conversational AI interface.
- Concept explanation.
- Mistake analysis.
- Quiz generation.
- Study plan creation.
- Nepali/English bilingual support.

**Powered by:** Qwen / Llama / future RhinoPeak model + RAG over knowledge engine.

### 6.5 Gamification Engine

**Purpose:** Make learning addictive and rewarding.

**Owns:**
- XP calculation and award.
- Streak tracking and rewards.
- Level progression.
- Badges and achievements.
- Leaderboards (national, district, friends, subject).
- Challenges and missions.

### 6.6 Future Foundation Model Engine

**Purpose:** Collect verified training data to eventually fine-tune **RhinoPeak**, a Nepal-focused educational AI model.

**Owns:**
- Data validation pipeline.
- Training dataset builder.
- Fine-tuning orchestration.
- Model evaluation harness.
- (Future) Inference serving.

**Sources of training data:**
- Verified questions and answers.
- AI tutor explanations (filtered for quality).
- Student mistakes and corrections.
- Teacher notes.
- Government documents.
- Anonymized learning behavior.

> This engine does **not** affect users in v1. It runs silently in the background, accumulating the dataset that will one day power a Nepal-specific LLM. This is the long-term moat.

---

## 7. Core User Journeys

### 7.1 Journey 1 — First-time student

```
Sign up (Google/email/phone)
   → Onboarding quiz (10 questions to baseline skill levels)
   → Personalized welcome ("You scored 32% in Geography — let's start there")
   → First daily mission generated
   → First XP earned
   → First streak begun
```

### 7.2 Journey 2 — Daily returning student

```
Open app
   → Push notification: "🔥 Your 7-day streak is on the line! Today's mission: 15 Geography MCQs"
   → See today's mission card
   → Start mission
   → Answer questions
   → For wrong answers, AI tutor explains in Nepali
   → Earn XP, maintain streak
   → See updated skill scores
   → Check leaderboard rank
```

### 7.3 Journey 3 — Struggling with a topic

```
Student keeps failing Geography questions
   → Adaptive engine detects pattern (5 failures in 24h)
   → System generates focused Geography mission
   → AI tutor proactively offers: "Want me to explain the federalism chapter?"
   → Student accepts
   → AI tutor explains using RAG-retrieved verified content
   → Generates mini practice quiz
   → Student re-attempts; passes
   → Skill score updates; Geography rises from 32% to 41%
```

### 7.4 Journey 4 — Mock exam flow

```
Student registers for mock exam
   → System generates full-length timed exam (100 questions, 2 hours)
   → Timer starts
   → Student answers, can flag for review
   → Auto-submit at end (or manual submit)
   → Instant auto-grading
   → Detailed performance report
   → Weak-area identification
   → AI-generated improvement plan
   → Readiness score: "78% — high probability of passing"
```

### 7.5 Journey 5 — Quick Scan (existing offline feature)

```
Student photographs a printed question
   → OCR extracts text (offline, on-device)
   → Verified DB search (offline)
   → High match → verified answer with source
   → Low match → online AI tutor explains with RAG context
   → Result saved to scan history
   → Question becomes part of student's practice queue
```

---

## 8. Functional Requirements (FR)

Requirements are numbered **FR-X.Y** for traceability. Every feature implementation should map to one or more FRs.

### 8.1 Authentication & Profile (FR-AUTH)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-AUTH-1 | Users can sign up with email, phone, Google, or Apple. | P0 |
| FR-AUTH-2 | Users receive a unique user_id on first sign-in. | P0 |
| FR-AUTH-3 | Users can set their target exam (Section Officer, Nayab Subba, Kharidar, etc.). | P0 |
| FR-AUTH-4 | Users can set their preferred language (Nepali, English). | P0 |
| FR-AUTH-5 | Users can edit profile, avatar, and exam preferences. | P1 |
| FR-AUTH-6 | Future: Nepal citizen verification, government ID linkage. | P3 |
| FR-AUTH-7 | Sessions are JWT-based, refresh-token rotation, 30-day expiry. | P0 |

### 8.2 Learning Engine (FR-LEARN)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-LEARN-1 | On first login, system generates a baseline skill profile from an onboarding quiz. | P0 |
| FR-LEARN-2 | System maintains a skill score (0-100) per (user, topic, subtopic). | P0 |
| FR-LEARN-3 | Every answered question updates the relevant skill score using an IRT-like model. | P0 |
| FR-LEARN-4 | System generates a daily mission every midnight (Nepal time) tailored to user. | P0 |
| FR-LEARN-5 | Daily mission includes a mix of weak-topic, revision, and new questions. | P0 |
| FR-LEARN-6 | Topics are unlocked progressively based on prerequisite mastery. | P1 |
| FR-LEARN-7 | The learning path is a tree (Duolingo-style) with locked/unlocked nodes. | P1 |
| FR-LEARN-8 | System adapts question difficulty in real time (within 3-question sliding window). | P0 |
| FR-LEARN-9 | Spaced repetition: questions are re-shown based on forgetting curve. | P1 |
| FR-LEARN-10 | System can generate a study plan for the next N days given an exam date. | P1 |

### 8.3 Memory Engine (FR-MEM)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-MEM-1 | Every user event creates a memory record (immutable, append-only). | P0 |
| FR-MEM-2 | System extracts structured facts (weak in Geography, studies at night, etc.) from events. | P0 |
| FR-MEM-3 | Memories are embedded and stored in vector DB for semantic recall. | P0 |
| FR-MEM-4 | AI tutor retrieves relevant memories before every response. | P0 |
| FR-MEM-5 | User can view and delete their memories (GDPR-style). | P1 |
| FR-MEM-6 | Memory privacy: memories are never shared across users. | P0 |
| FR-MEM-7 | System has separate memory scopes: session, long-term, knowledge, behavioral. | P0 |
| FR-MEM-8 | Memory decay: stale memories lose weight over time. | P2 |

### 8.4 Knowledge Engine (FR-KNOW)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-KNOW-1 | Admin can upload verified questions in bulk (CSV/JSON). | P0 |
| FR-KNOW-2 | Each verified question must have: question, options, answer, explanation, source, exam year, difficulty, topic, subtopic, tags. | P0 |
| FR-KNOW-3 | System chunks, embeds, and indexes content into vector DB within 5 minutes of upload. | P0 |
| FR-KNOW-4 | RAG retrieval: AI tutor retrieves top-K (default 5) context chunks per query. | P0 |
| FR-KNOW-5 | AI responses cite the source of retrieved content (no hallucinated sources). | P0 |
| FR-KNOW-6 | System supports both Nepali (Devanagari) and English content. | P0 |
| FR-KNOW-7 | Future: live current-affairs ingestion from RSS/news APIs. | P2 |

### 8.5 AI Tutor Engine (FR-TUTOR)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-TUTOR-1 | Student can open an AI chat and ask any question. | P0 |
| FR-TUTOR-2 | AI tutor responds in the user's preferred language. | P0 |
| FR-TUTOR-3 | AI tutor explains why an answer is correct AND why other options are wrong. | P0 |
| FR-TUTOR-4 | AI tutor can simplify a concept to a 12-year-old level if asked. | P1 |
| FR-TUTOR-5 | AI tutor can generate practice questions on any topic. | P1 |
| FR-TUTOR-6 | AI tutor references verified sources whenever possible. | P0 |
| FR-TUTOR-7 | AI tutor cites up to 3 sources per response with a "Verified" badge. | P0 |
| FR-TUTOR-8 | Every AI response is logged for quality and future training. | P0 |
| FR-TUTOR-9 | FAQ route: common questions are served from cache without calling LLM. | P1 |
| FR-TUTOR-10 | AI tutor respects the student's memory context. | P0 |
| FR-TUTOR-11 | Long responses are streamed (chunked). | P0 |
| FR-TUTOR-12 | AI tutor never gives legal/medical advice. | P0 |

### 8.6 Gamification Engine (FR-GAME)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-GAME-1 | Student earns XP for every correct action (see XP table in §13.3). | P0 |
| FR-GAME-2 | Student has a streak counter that resets if a day is missed. | P0 |
| FR-GAME-3 | Streaks grant bonus XP (e.g., 7-day = +100 XP). | P0 |
| FR-GAME-4 | Student has a level derived from total XP (e.g., Level = floor(sqrt(XP/50))). | P0 |
| FR-GAME-5 | Badges are awarded for milestones (first mock pass, 30-day streak, etc.). | P1 |
| FR-GAME-6 | Leaderboards: national, district, friends, subject-wise, institution-wise. | P1 |
| FR-GAME-7 | Daily mission completion grants a completion bonus. | P0 |
| FR-GAME-8 | Push notification fires at user's local 8 PM if mission not started. | P1 |

### 8.7 Mock Exam Engine (FR-EXAM)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-EXAM-1 | Admin can create a mock exam with N questions, time limit, marking scheme. | P0 |
| FR-EXAM-2 | System supports random, topic-balanced, and adaptive question selection. | P0 |
| FR-EXAM-3 | Timer is server-authoritative (anti-cheat). | P0 |
| FR-EXAM-4 | Auto-grading on submit. | P0 |
| FR-EXAM-5 | Detailed performance report: subject-wise score, weak topics, time analysis. | P0 |
| FR-EXAM-6 | AI-generated improvement plan after each mock. | P1 |
| FR-EXAM-7 | Exam readiness score (0-100) based on performance trends. | P1 |
| FR-EXAM-8 | Practice exam mode (un-timed, immediate feedback) and exam mode (timed, hidden answers). | P0 |

### 8.8 Quick Scan (FR-SCAN)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-SCAN-1 | Student can capture a photo of a printed question. | P0 |
| FR-SCAN-2 | On-device OCR extracts text. | P0 |
| FR-SCAN-3 | Local verified DB search (offline). | P0 |
| FR-SCAN-4 | High-confidence match → verified answer with source. | P0 |
| FR-SCAN-5 | Low-confidence match → online AI tutor with RAG context. | P0 |
| FR-SCAN-6 | Result UI clearly labels source: Verified / AI-Assisted / AI-Only / Uncertain. | P0 |
| FR-SCAN-7 | Scan history is stored locally and synced to cloud. | P1 |

### 8.9 Frontend (FR-FE)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-FE-1 | Mobile app on iOS and Android (Flutter). | P0 |
| FR-FE-2 | Web app (Next.js) for desktop users. | P0 |
| FR-FE-3 | Admin dashboard (React) for internal team. | P0 |
| FR-FE-4 | Offline-first: core features (scan, search, browse) work without internet. | P0 |
| FR-FE-5 | Real-time updates for leaderboards, missions, AI chat. | P0 |
| FR-FE-6 | Accessibility: WCAG 2.1 AA compliance. | P1 |
| FR-FE-7 | Dark mode. | P1 |
| FR-FE-8 | Push notifications for streaks, missions, leaderboard changes. | P1 |

---

# PART III — ARCHITECTURE

---

## 9. System Architecture Overview

### 9.1 High-Level Diagram

```
                         ┌──────────────────────┐
                         │      USERS           │
                         │  Students | Admins   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │   Cloudflare CDN/WAF   │
                       └────────────┬───────────┘
                                    ▼
                       ┌────────────────────────┐
                       │      Load Balancer     │
                       │  (HAProxy / ALB)       │
                       └────────────┬───────────┘
                                    ▼
                       ┌────────────────────────┐
                       │      API Gateway       │
                       │  Auth | Rate | Route   │
                       └────────────┬───────────┘
                                    │
       ┌──────────────┬─────────────┼──────────────┬──────────────┐
       ▼              ▼             ▼              ▼              ▼
  ┌─────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  Auth   │  │  Learning  │  │   AI     │  │  Admin   │  │ Analytics│
  │ Service │  │  Service   │  │ Service  │  │ Service  │  │ Service  │
  └────┬────┘  └─────┬──────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘
       │              │              │              │              │
       └──────────────┴──────┬───────┴──────────────┴──────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Event Bus (Kafka)  │
                  └──────────┬───────────┘
                             │
       ┌──────────────┬──────┴───────┬──────────────┐
       ▼              ▼              ▼              ▼
  ┌─────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐
  │Postgres │  │   Redis    │  │  Qdrant  │  │   S3     │
  │ Cluster │  │  Cluster   │  │ Cluster  │  │  Bucket  │
  └─────────┘  └────────────┘  └──────────┘  └──────────┘
                                                │
                                                ▼
                                       ┌──────────────────┐
                                       │   AI Cluster     │
                                       │ Qwen / Llama /   │
                                       │ (future) RhinoPk │
                                       └──────────────────┘
```

### 9.2 Architectural Principles

1. **Microservices** — each engine and bounded context is its own service.
2. **Event-driven** — services communicate via Kafka; the system is reactive.
3. **API-first** — every service exposes a versioned HTTP/gRPC API; OpenAPI specs are the contract.
4. **CQRS for read-heavy paths** — leaderboards, analytics, and dashboards have separate read models.
5. **Polyglot persistence** — pick the right store per workload (Postgres, Redis, Qdrant, S3).
6. **Stateless services** — all state lives in the data layer; services scale horizontally.
7. **Retrieval-first AI** — never let the LLM answer without grounding in verified knowledge.
8. **Privacy by design** — user data is encrypted, scoped, and exportable.

### 9.3 Service Catalog

| Service | Domain | Owns | Tech |
| --- | --- | --- | --- |
| `auth-service` | Identity | Sign-up, login, sessions, OAuth, roles | Node.js + Postgres + Redis |
| `user-service` | Profile | User profile, exam target, preferences | Node.js + Postgres |
| `learning-service` | Learning Engine | Skill scores, missions, learning paths, recommendations | Node.js + Postgres + Redis |
| `gamification-service` | Gamification Engine | XP, streaks, levels, badges, leaderboards | Node.js + Redis + Postgres |
| `knowledge-service` | Knowledge Engine | Questions, RAG, document processing, embeddings | Python (FastAPI) + Postgres + Qdrant |
| `ai-service` | AI Tutor Engine | LLM orchestration, prompts, RAG, memory recall | Python (FastAPI) + GPU cluster + Qdrant |
| `memory-service` | Memory Engine | Memory collection, extraction, embedding, retrieval | Python + Postgres + Qdrant |
| `exam-service` | Mock Exam | Exam generation, timing, grading, reports | Node.js + Postgres |
| `analytics-service` | Analytics | Events, dashboards, funnels, BI | Python + ClickHouse / Postgres |
| `notification-service` | Comms | Push, email, SMS, in-app | Node.js + Redis + FCM |
| `content-service` | Content | Topics, lessons, courses, syllabus | Node.js + Postgres |
| `admin-service` | Admin | Internal admin API, moderation, imports | Node.js + Postgres |
| `scoring-service` | AI Foundation | Training data collection, dataset build, fine-tuning jobs | Python + GPU cluster + S3 |

---

## 10. AI Brain Architecture (most important)

The AI Brain is the heart of the product. Every user question flows through it.

### 10.1 AI Brain Flow

```
   Student Question (text or voice)
            │
            ▼
   ┌────────────────────┐
   │  Question Router   │   ← routes based on intent + complexity
   └─────────┬──────────┘
             │
   ┌─────────┴──────────┐
   ▼                    ▼
┌─────────┐        ┌────────────┐
│  FAQ    │        │   AI       │
│ Route   │        │   Route    │
└────┬────┘        └──────┬─────┘
     │                    │
     ▼                    ▼
┌──────────┐        ┌──────────────────┐
│  Redis   │        │  Context Builder │
│  Cache   │        └────────┬─────────┘
└────┬─────┘                 │
     │              ┌────────┼────────┐
     │              ▼        ▼        ▼
     │        ┌────────┐ ┌──────┐ ┌──────┐
     │        │ User   │ │Know- │ │Live  │
     │        │Memory  │ │ledge │ │Lok-  │
     │        │Search  │ │Search│ │sewa  │
     │        │(Qdrant)│ │(Qdr.)│ │Tools │
     │        └────┬───┘ └──┬───┘ └──┬───┘
     │             │        │        │
     │             └────────┼────────┘
     │                      ▼
     │             ┌──────────────────┐
     │             │  Prompt Assembly │
     │             └────────┬─────────┘
     │                      ▼
     │             ┌──────────────────┐
     │             │   LLM (Qwen /    │
     │             │   Llama / future │
     │             │   RhinoPeak)     │
     │             └────────┬─────────┘
     │                      ▼
     │             ┌──────────────────┐
     │             │  Post-processor  │
     │             │  - Citations     │
     │             │  - Disclaimer    │
     │             │  - Source badge  │
     │             └────────┬─────────┘
     │                      ▼
     │             ┌──────────────────┐
     │             │   AI Response    │
     │             └────────┬─────────┘
     │                      ▼
     ▼             ┌──────────────────┐
┌─────────┐        │   Cache + Log    │
│Verified │        │   to memory      │
│Answer   │        └────────┬─────────┘
└────┬────┘                 │
     │                      ▼
     └──────────┬───────────┘
                ▼
       ┌──────────────────┐
       │  Return to user  │
       └──────────────────┘
```

### 10.2 Question Router Logic

The router decides which path a question takes:

| Signal | Route |
| --- | --- |
| Exact match in Redis FAQ cache | FAQ Route (cached) |
| FTS5 high-confidence match in verified DB | Verified Answer (no LLM) |
| Standard question, needs explanation | AI Route with RAG |
| Complex, multi-part, or "explain" / "why" | AI Route with full context |
| User explicitly asks for quiz | AI Route + quiz generator |
| Out of syllabus | Politely redirect to syllabus topics |

### 10.3 Context Builder

The context builder assembles the prompt sent to the LLM:

```python
context = {
  "system_prompt": SYSTEM_PROMPT_NEPALI,        # role + safety
  "user_profile": {
    "name": "Sita",
    "target_exam": "Section Officer",
    "weak_subjects": ["Geography", "Current Affairs"],
    "strong_subjects": ["English"],
  },
  "relevant_memories": retrieve_memories(query, k=3),  # from Qdrant
  "verified_knowledge": retrieve_knowledge(query, k=5), # from Qdrant
  "user_history": last_5_turns,                  # recent conversation
  "live_data": live_loksewa_data,                # exam dates, syllabus, etc.
  "user_query": query,
}
```

### 10.4 LLM Choice & Routing

| Model | Use | Latency Target | Cost |
| --- | --- | --- | --- |
| **Qwen 7B / 14B (self-hosted)** | Default AI tutor | < 3 s | Low (GPU on-prem) |
| **Qwen 72B (self-hosted)** | Complex explanations, study plans | < 6 s | High (GPU on-prem) |
| **Llama 3 70B (cloud)** | Fallback / overflow | < 5 s | Medium (API) |
| **Future RhinoPeak** | All workloads | < 2 s | Lowest (fine-tuned) |
| **Embedding model** (BGE / mE5) | All retrieval | < 200 ms | Low |

### 10.5 Streaming & Latency

- Responses stream via Server-Sent Events (SSE) or WebSocket.
- First token latency: < 800 ms.
- Full response: < 4 s for typical tutor replies.
- Verified answers: < 200 ms (no LLM).

### 10.6 Hallucination Control

Hard rules:

1. **Retrieval-first** — every AI tutor response includes ≥ 1 retrieved chunk (when knowledge exists).
2. **Citation enforcement** — the LLM is prompted to cite `[source_id]` and a post-processor verifies citations exist in the retrieved set.
3. **Disclaimer badge** — all AI answers display "AI-Generated — verify with official sources."
4. **Refusal policy** — if no relevant knowledge is found AND the question is factual, the AI says "I'm not sure — please check Rajpatra or your textbook."
5. **Out-of-syllabus filter** — questions unrelated to Loksewa are politely declined.
6. **Quality loop** — every AI response is logged with a user feedback signal (👍 / 👎) for future model evaluation.

---

## 11. Memory Engine Architecture

### 11.1 Memory Types

| Type | Example | Storage | Lifetime |
| --- | --- | --- | --- |
| **Session Memory** | "Currently in Geography mission" | Redis | Session |
| **Long-term Memory** | "Weak in Geography, strong in English" | Postgres + Qdrant | Years |
| **Learning Memory** | "Scored 32% in Geography on 2026-05-12" | Postgres | Permanent |
| **Behavioral Memory** | "Studies at night, prefers MCQs" | Qdrant | Years |
| **Knowledge Memory** | "Asked about federalism 3 times" | Qdrant | Years |

### 11.2 Memory Pipeline

```
  User Action
      │
      ▼
  ┌──────────────────┐
  │ Memory Collector │  ← Listens to all user events
  └────────┬─────────┘
           ▼
  ┌──────────────────┐
  │ Memory Processor │  ← Extracts facts using rules + LLM
  └────────┬─────────┘
           │
           ├──> Structured facts → Postgres (e.g., `user_memories` table)
           │
           └──> Semantic embeddings → Qdrant (per-user collection)
                       │
                       ▼
              Stored for life; retrieved by AI tutor
```

### 11.3 Memory Extraction Rules

| Event | Extracted Memory |
| --- | --- |
| User fails 5+ Geography questions in a row | "User struggles with Geography" |
| User studies between 8 PM and 11 PM | "User studies at night" |
| User sets target = Section Officer | "User preparing for Section Officer" |
| User explicitly asks "explain in Nepali" | "User prefers Nepali" |
| User bookmarks a question | "User interested in [topic]" |
| User starts mock exam | "User attempting mock exam" |

### 11.4 Memory Retrieval

Before every AI tutor response:

```python
relevant_memories = qdrant.search(
    collection_name=f"user_{user_id}_memories",
    query_vector=embed(query),
    limit=5,
    score_threshold=0.7,
)
```

Memories are included in the prompt context, prefixed with `[USER MEMORY]`.

### 11.5 Memory Privacy

- Memories are **per-user** and never shared.
- A user can view, edit, or delete memories in Settings.
- Deleting a memory removes it from both Postgres and Qdrant.
- Aggregated, anonymized memory patterns may be used for the Foundation Model Engine (with opt-in).

---

## 12. Knowledge Engine Architecture

### 12.1 Knowledge Sources

| Source | Format | Ingestion | Update Frequency |
| --- | --- | --- | --- |
| Verified question bank | JSON/CSV bulk | Admin API | Weekly |
| Government publications (Rajpatra) | PDF | Doc processor | Monthly |
| Reference books | PDF | Doc processor | Quarterly |
| Current affairs | RSS / API | Auto-ingest | Daily |
| Teacher notes | Markdown | Admin upload | Continuous |
| Student-uploaded notes | PDF/image | OCR + doc processor | Continuous |

### 12.2 Knowledge Pipeline

```
   Documents (PDF, MD, JSON)
            │
            ▼
   ┌──────────────────┐
   │ Document         │  ← OCR (Tesseract/ML Kit), PDF parsing, MD cleaning
   │ Processor        │
   └────────┬─────────┘
            ▼
   ┌──────────────────┐
   │ Chunking         │  ← Sliding window: 500 tokens, 50 overlap
   │ Engine           │  ← Splits on headings, paragraphs
   └────────┬─────────┘
            ▼
   ┌──────────────────┐
   │ Embedding        │  ← BGE-m3 (multilingual incl. Nepali) or mE5
   │ Generator        │
   └────────┬─────────┘
            ▼
   ┌──────────────────┐
   │ Qdrant Vector DB │  ← Collection: `knowledge_chunks`
   └────────┬─────────┘     Metadata: source_id, source_type, year, topic, language
            ▼
   At query time: top-K semantic search → context for LLM
```

### 12.3 Qdrant Collections

| Collection | Vector Dim | Payload Schema |
| --- | --- | --- |
| `knowledge_chunks` | 1024 (BGE-m3) | `source_id`, `source_type`, `topic`, `subtopic`, `year`, `language`, `chunk_text`, `chunk_index` |
| `verified_questions` | 1024 | `question_id`, `topic`, `difficulty`, `language`, `text` |
| `user_{user_id}_memories` | 1024 | `memory_type`, `fact`, `created_at`, `importance` |
| `ai_conversations` | 1024 | `user_id`, `turn_id`, `role`, `text`, `feedback` |
| `current_affairs` | 1024 | `date`, `category`, `text`, `source_url` |

### 12.4 RAG Query Flow

```python
def answer_with_rag(user_query, user_id, k=5):
    # 1. Embed the query
    query_vector = embed(user_query)

    # 2. Retrieve top-K from knowledge
    knowledge = qdrant.search(
        collection_name="knowledge_chunks",
        query_vector=query_vector,
        limit=k,
        score_threshold=0.65,
    )

    # 3. Retrieve user memories
    memories = qdrant.search(
        collection_name=f"user_{user_id}_memories",
        query_vector=query_vector,
        limit=3,
        score_threshold=0.70,
    )

    # 4. Assemble context
    context = build_context(knowledge, memories, user_profile)

    # 5. Call LLM
    response = llm.stream(
        system=SYSTEM_PROMPT,
        context=context,
        user_query=user_query,
    )

    # 6. Post-process: attach citations, disclaimers
    return post_process(response, knowledge)
```

### 12.5 Verified vs AI Answers

| Source | UI Badge | Trust | Use Case |
| --- | --- | --- | --- |
| Verified DB match | "✓ Verified Source" | High | Factual MCQ answers |
| AI + RAG | "📚 AI Tutor — Citations included" | Medium-High | Concept explanation |
| AI only | "🤖 AI — verify with official source" | Medium | Discussion / opinion |
| Uncertain | "Not in our database" | None | Refusal |

---

## 13. Gamification Engine Architecture

### 13.1 XP Rules

| Action | XP |
| --- | --- |
| Correct MCQ answer (easy) | +10 |
| Correct MCQ answer (medium) | +15 |
| Correct MCQ answer (hard) | +25 |
| Wrong MCQ answer | +2 (effort) |
| Perfect quiz (10/10) | +50 bonus |
| 3-day streak | +30 |
| 7-day streak | +100 |
| 30-day streak | +500 |
| Mock exam pass | +200 |
| Mock exam top 10% | +300 |
| Daily mission complete | +50 |
| AI tutor helpful 👍 | +5 |
| First question of the day | +10 |
| Review a topic | +20 |
| Share a question with friend | +15 |

### 13.2 Level Formula

```
Level = floor(sqrt(total_xp / 50))
```

| Level | XP Required | Title |
| --- | --- | --- |
| 1 | 0 | Beginner |
| 5 | 1,250 | Apprentice |
| 10 | 5,000 | Scholar |
| 15 | 11,250 | Specialist |
| 20 | 20,000 | Expert |
| 30 | 45,000 | Master |
| 50 | 125,000 | Grandmaster |
| 100 | 500,000 | Legend |

### 13.3 Streak Rules

- A "day" is from midnight to midnight in the user's local timezone (Asia/Katmandu default).
- One qualifying activity per day = streak +1.
- Qualifying activities: answer ≥ 1 question, complete daily mission, or finish a lesson.
- Missing a day = streak resets to 0 (with a "streak freeze" item available, P2).
- Streak milestones grant badge + bonus XP.

### 13.4 Leaderboard Scopes

| Scope | Time | Size Limit |
| --- | --- | --- |
| National | Daily / Weekly / Monthly | Top 10,000 |
| District | Weekly | Top 1,000 |
| Friends | Daily | All |
| Subject (Geography, etc.) | Weekly | Top 500 |
| Institution | Weekly | Top 100 |

Leaderboards are computed via Redis Sorted Sets for O(log N) updates and O(log N) rank queries.

### 13.5 Badges

| Badge | Trigger |
| --- | --- |
| First Step | First question answered |
| 7-Day Streak | 7 consecutive days |
| Geography Master | 90%+ in Geography |
| Mock Champion | Pass 5 mock exams |
| Night Owl | Study after 10 PM for 30 days |
| AI Whisperer | 50+ helpful AI tutor chats |
| Constitution Pro | Master 100 constitution questions |
| Early Bird | Sign up within first 1,000 users |

---

## 14. Adaptive Learning Engine Architecture

### 14.1 Skill Score Model

The adaptive engine maintains a skill score per `(user, topic, subtopic)` in the range 0-100.

**Update rule (simplified IRT):**

```
new_score = old_score + learning_rate * (is_correct - expected_correctness)
```

Where:
- `learning_rate` = 2-5 depending on mastery stage.
- `expected_correctness` is a function of `old_score` and question difficulty.

When `new_score >= 90`, the topic is "mastered."
When `new_score < 50`, the topic is "weak" — gets higher weight in daily mission.

### 14.2 Difficulty Adaptation

For each new question to present:

```
difficulty_target = base_difficulty + adaptive_offset
where:
  base_difficulty = 0.5 (medium)
  adaptive_offset = (target_skill_score - current_skill_score) / 100
```

This pushes harder questions when the user is doing well, and easier ones when struggling.

### 14.3 Daily Mission Composition

```
mission = {
  "weak_topic_questions":   5,   # from user's 3 weakest topics
  "review_questions":       3,   # spaced-repetition due items
  "new_topic_questions":    5,   # from next topic in path
  "mock_quiz_questions":    2,   # mini mock (1 subject)
}
```

### 14.4 Spaced Repetition (SRS)

Each answered question has a "next review date" computed by a simplified SM-2 algorithm:

```
if correct:   interval *= ease_factor (default 2.5)
if wrong:     interval = 1 day
ease_factor  adjusts based on quality of recall (0-5)
```

### 14.5 Recommendation Engine

The recommendation engine is rule-based + LLM-enhanced.

**Inputs:**
- User skill profile.
- User memory (preferences, weak areas).
- Last 30 days of activity.
- Upcoming exam date.
- Time of day.

**Outputs:**
- Next lesson suggestion.
- Daily mission composition.
- Mock exam schedule.
- Revision priority list.

**Heuristic example:**

```python
def recommend(user):
    weak = top_3_weakest_topics(user)
    upcoming = user.exam_date - today()
    if upcoming < 30:
        return mock_exam_heavy_plan(user)
    elif len(weak) >= 2:
        return mission(focus=weak, mock=False)
    else:
        return balanced_plan(user)
```

---

## 15. AI Tutor Engine Architecture

### 15.1 AI Tutor Modes

| Mode | Trigger | Behavior |
| --- | --- | --- |
| **Free Chat** | User opens AI tab | Conversational Q&A |
| **Explain Answer** | User taps "Why?" on a wrong answer | Targeted explanation of one question |
| **Explain Concept** | User taps "Teach me this topic" | Mini-lesson generation |
| **Generate Quiz** | User asks "Quiz me on X" | Custom quiz generation |
| **Study Plan** | User asks "Make me a plan" | Multi-day study plan |
| **Mistake Review** | End-of-session summary | Review of all wrong answers |

### 15.2 Prompt Library (templates)

See Appendix E for full templates. Each prompt is:

- Versioned (e.g., `TUTOR_EXPLAIN_v3`).
- A/B tested.
- Logged with feedback.
- Backed by evaluation dataset.

### 15.3 Multi-turn Conversation Memory

Conversations are short-lived in Redis (per session), but key facts are extracted to long-term memory (Postgres + Qdrant) by the Memory Engine.

```
Session: [turn 1, turn 2, turn 3, ...]   →  Redis (TTL: 24h)
                       │
                       ▼
              Memory Processor
                       │
                       ▼
         Long-term fact: "user weak in X"  →  Postgres + Qdrant
```

### 15.4 Nepali / English Support

- All prompts are bilingual templates.
- BGE-m3 embedding model handles Devanagari natively.
- User language preference is part of the system prompt.
- Future: Maithili, Newari, Tamang.

### 15.5 Safety

- Refusal list: medical, legal, financial advice, harassment.
- Content filter for inappropriate user input.
- All conversations logged for safety review (anonymized).

---

## 16. Event-Driven Architecture (Kafka)

### 16.1 Why Kafka

Loksewa AI has many independent event flows (learning, gamification, memory, analytics, AI logging). A central event bus decouples producers from consumers and enables event sourcing for the analytics engine.

### 16.2 Event Topics

| Topic | Producer | Consumers | Retention |
| --- | --- | --- | --- |
| `user.events` | All services | Analytics, Memory, Gamification | 30 days |
| `question.answered` | learning-service | gamification, memory, analytics, foundation | 90 days |
| `quiz.completed` | learning-service | gamification, memory | 90 days |
| `xp.earned` | gamification-service | leaderboard, analytics, push | 30 days |
| `streak.broken` | gamification-service | push, analytics | 30 days |
| `level.up` | gamification-service | push, analytics | 30 days |
| `badge.unlocked` | gamification-service | push, analytics | 30 days |
| `memory.created` | memory-service | analytics | Permanent (compacted) |
| `ai.conversation.created` | ai-service | analytics, foundation | Permanent |
| `ai.feedback` | ai-service | foundation, analytics | Permanent |
| `mock.exam.submitted` | exam-service | analytics, memory, learning | Permanent |
| `document.ingested` | knowledge-service | search index, analytics | 30 days |
| `scan.completed` | scan-service | memory, analytics | 30 days |
| `leaderboard.changed` | gamification-service | push | 7 days |

### 16.3 Event Schema (Avro)

```json
{
  "event_id": "uuid",
  "event_type": "question.answered",
  "event_version": 1,
  "occurred_at": "2026-06-01T10:30:00.000Z",
  "producer": "learning-service",
  "user_id": "uuid",
  "session_id": "uuid",
  "payload": {
    "question_id": "uuid",
    "topic": "Geography",
    "subtopic": "Federalism",
    "difficulty": "medium",
    "is_correct": true,
    "time_taken_ms": 12500,
    "skill_score_before": 32.0,
    "skill_score_after": 33.5
  }
}
```

### 16.4 Outbox Pattern

Services write events to an outbox table in Postgres within the same transaction as the state change. A CDC connector (Debezium) tails the outbox and publishes to Kafka. This guarantees at-least-once delivery.

---

## 17. Database Architecture

### 17.1 PostgreSQL Schema (Core Tables)

> See Appendix A for full DDL. Highlights below.

```sql
-- Users
users (
  id UUID PK,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  full_name TEXT,
  preferred_language TEXT DEFAULT 'ne',
  target_exam TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- User profile (1:1 with users)
user_profiles (
  user_id UUID PK REFERENCES users(id),
  avatar_url TEXT,
  bio TEXT,
  district TEXT,
  institution TEXT,
  preparation_level TEXT,
  daily_study_goal_minutes INT DEFAULT 30
)

-- Skill scores (per topic, per user)
user_progress (
  user_id UUID,
  topic TEXT,
  subtopic TEXT,
  skill_score NUMERIC(5,2) DEFAULT 0,
  questions_attempted INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  last_attempted_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, topic, subtopic)
)

-- XP
user_xp (
  user_id UUID,
  total_xp INT DEFAULT 0,
  level INT DEFAULT 1,
  updated_at TIMESTAMPTZ
)

-- Streaks
user_streaks (
  user_id UUID PK,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  streak_freezes_available INT DEFAULT 0
)

-- Badges
user_badges (
  user_id UUID,
  badge_id TEXT,
  earned_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, badge_id)
)

-- Courses / Topics / Lessons
courses (id, title, description, exam_target, order_index)
topics (id, course_id, name, description, order_index, prerequisite_topic_id)
lessons (id, topic_id, title, content, duration_minutes, order_index)

-- Questions & Answers
questions (
  id UUID PK,
  topic TEXT,
  subtopic TEXT,
  question_type TEXT,        -- mcq, truefalse, short, descriptive
  difficulty INT,            -- 1-5
  question_text TEXT,
  question_text_ne TEXT,     -- Nepali version
  explanation TEXT,
  source_id UUID,
  verified BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ
)
answers (
  id UUID PK,
  question_id UUID,
  user_id UUID,
  selected_option TEXT,
  is_correct BOOLEAN,
  time_taken_ms INT,
  answered_at TIMESTAMPTZ
)

-- Mock Exams
mock_exams (
  id UUID PK,
  title TEXT,
  exam_type TEXT,            -- practice, full, subject
  duration_minutes INT,
  total_questions INT,
  marking_scheme JSONB,
  is_published BOOLEAN
)
mock_exam_attempts (
  id UUID PK,
  user_id UUID,
  mock_exam_id UUID,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  score NUMERIC,
  total_marks NUMERIC,
  status TEXT                -- in_progress, submitted, expired
)

-- AI Conversations
ai_conversations (
  id UUID PK,
  user_id UUID,
  session_id UUID,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  total_turns INT
)
ai_messages (
  id UUID PK,
  conversation_id UUID,
  role TEXT,                 -- user, assistant, system
  content TEXT,
  citations JSONB,
  source TEXT,               -- verified, ai_rag, ai_only
  feedback TEXT,             -- up, down, none
  tokens_used INT,
  latency_ms INT,
  created_at TIMESTAMPTZ
)

-- Memories
user_memories (
  id UUID PK,
  user_id UUID,
  memory_type TEXT,          -- session, longterm, learning, behavioral, knowledge
  fact TEXT,
  importance INT,            -- 1-5
  source_event_id UUID,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)

-- Recommendations
recommendations (
  id UUID PK,
  user_id UUID,
  recommendation_type TEXT,  -- topic, mock, revision, lesson
  payload JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
)

-- Notifications
notifications (
  id UUID PK,
  user_id UUID,
  type TEXT,                 -- streak, mission, badge, leaderboard
  title TEXT,
  body TEXT,
  payload JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)

-- Payments / Subscriptions
subscriptions (
  id UUID PK,
  user_id UUID,
  plan TEXT,                 -- free, pro, premium
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT,
  payment_provider TEXT,
  external_id TEXT
)

-- Certificates
certificates (
  id UUID PK,
  user_id UUID,
  exam_id UUID,
  score NUMERIC,
  issued_at TIMESTAMPTZ,
  certificate_url TEXT
)
```

### 17.2 Read Models (CQRS)

For high-read paths, we maintain denormalized read models:

- `leaderboard_national_daily` (materialized view)
- `user_stats_dashboard` (materialized from events)
- `topic_global_stats` (computed nightly)
- `mock_exam_leaderboard` (materialized)

### 17.3 Partitioning Strategy

- `answers`, `ai_messages`, `notifications`, `user_events` are **partitioned by month**.
- Old partitions are moved to cold storage after 1 year.

### 17.4 Vector Database (Qdrant)

See §12.3 for collections.

**Indexing parameters:**
- HNSW with `m=16`, `ef_construct=128`.
- Quantization: scalar int8 for memory efficiency.
- Replication factor: 2.
- Shards: 4 per collection (at 1M+ users).

### 17.5 Cache (Redis)

**Data structures:**
- Sorted sets → leaderboards.
- Hashes → user sessions.
- Streams → event queues.
- Strings → FAQ cache, daily challenge.
- Sets → active user IDs, online presence.

**TTL policy:**
- Sessions: 30 days.
- FAQ cache: 7 days.
- Leaderboards: 5 minutes.
- Daily challenges: 24 hours.

### 17.6 Object Storage (S3 / R2)

- `s3://loksewa-ai/verified-questions/` — raw JSON/CSV imports.
- `s3://loksewa-ai/documents/` — PDFs, books, notes.
- `s3://loksewa-ai/avatars/` — user-uploaded avatars.
- `s3://loksewa-ai/certificates/` — generated PDFs.
- `s3://loksewa-ai/training-data/` — anonymized AI conversation exports.
- `s3://loksewa-ai/scan-images/` — captured scan images (TTL: 30 days).

---

## 18. AI Foundation Model Pipeline (Future — RhinoPeak)

### 18.1 Data Collection

Every AI tutor interaction produces potential training data:

```
ai_messages
  ├── user_query
  ├── assistant_response
  ├── citations (verified sources used)
  ├── feedback (👍 / 👎)
  └── quality_score (from evaluator)
```

Filter criteria for training set:
- Response is grounded in ≥ 1 verified source.
- User feedback is positive (or neutral with no complaint).
- Response passes automated quality checks (no hallucination, no refusal).
- Question is in-syllabus.

### 18.2 Dataset Builder

```
Raw conversations (Postgres ai_messages)
   │
   ▼
Quality filter (LLM-as-judge + heuristic)
   │
   ▼
PII removal (regex + NER for Nepali names/phones)
   │
   ▼
Deduplication (semantic dedup via embeddings)
   │
   ▼
Format conversion (instruction / chat / completion)
   │
   ▼
Train / val / test split (80/10/10)
   │
   ▼
S3: s3://loksewa-ai/training-data/v1/
```

### 18.3 Fine-Tuning Pipeline

- Base model: Qwen 7B (or Llama 3 8B).
- Method: LoRA / QLoRA for cost efficiency.
- Hardware: 4-8x A100 80GB or H100.
- Training time: ~24-48 hours.
- Eval: held-out Nepali Loksewa Q&A set.

### 18.4 Evaluation Harness

- **In-syllawa accuracy**: 95%+ target.
- **Out-of-syllabus refusal rate**: 99%+.
- **Citation accuracy**: 90%+.
- **Nepali fluency**: native-speaker evaluation.
- **Latency**: < 2 s per response.

### 18.5 Deployment

- Self-hosted on Kubernetes with GPU node pools.
- Autoscaling based on request volume.
- Canary deployment with traffic mirroring from Qwen.

---

# PART IV — CROSS-CUTTING

---

## 19. API Specifications

### 19.1 API Style

- **REST** for client-facing APIs (mobile/web).
- **gRPC** for service-to-service communication.
- **WebSocket / SSE** for real-time (chat, leaderboard updates).

### 19.2 Versioning

- URL versioned: `/v1/`, `/v2/`.
- Breaking changes: new major version.
- Backwards-compatible additions: minor version.

### 19.3 Authentication

- All APIs require `Authorization: Bearer <jwt>` except `/v1/auth/*` and `/healthz`.
- JWT contains: `user_id`, `role`, `iat`, `exp`.
- Refresh tokens rotate every 30 days.

### 19.4 Key Endpoints (REST)

> See Appendix D for full OpenAPI. Highlights below.

**Auth**
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `POST /v1/auth/oauth/google`

**User**
- `GET /v1/users/me`
- `PATCH /v1/users/me`
- `GET /v1/users/me/profile`
- `PATCH /v1/users/me/preferences`
- `GET /v1/users/me/memories`
- `DELETE /v1/users/me/memories/{id}`

**Learning**
- `GET /v1/missions/today`
- `POST /v1/missions/{mission_id}/start`
- `POST /v1/missions/{mission_id}/complete`
- `GET /v1/questions/next?topic=X&difficulty=Y`
- `POST /v1/answers`
- `GET /v1/topics`
- `GET /v1/topics/{topic}/progress`
- `GET /v1/learning-path`
- `POST /v1/study-plan/generate`

**Mock Exam**
- `GET /v1/mock-exams`
- `POST /v1/mock-exams/{id}/start`
- `POST /v1/mock-exams/attempts/{id}/answer`
- `POST /v1/mock-exams/attempts/{id}/submit`
- `GET /v1/mock-exams/attempts/{id}/report`

**AI Tutor**
- `POST /v1/tutor/chat` (SSE)
- `POST /v1/tutor/explain-answer`
- `POST /v1/tutor/generate-quiz`
- `POST /v1/tutor/study-plan`
- `POST /v1/tutor/feedback`

**Gamification**
- `GET /v1/leaderboards?scope=national&period=daily`
- `GET /v1/users/me/xp`
- `GET /v1/users/me/streak`
- `GET /v1/users/me/badges`
- `GET /v1/users/me/level`

**Knowledge**
- `POST /v1/search/verified` (offline-style, server-side)
- `GET /v1/questions/{id}`
- `GET /v1/topics/{topic}/syllabus`

**Quick Scan**
- `POST /v1/scan` (multipart: image)
- `GET /v1/scan/history`

**Notifications**
- `GET /v1/notifications`
- `POST /v1/notifications/{id}/read`

**Admin**
- `POST /v1/admin/questions/bulk-import`
- `POST /v1/admin/documents/upload`
- `GET /v1/admin/analytics/dashboard`
- `GET /v1/admin/users`

### 19.5 Real-time Endpoints (WebSocket / SSE)

- `WS /v1/chat` — AI tutor streaming.
- `WS /v1/leaderboard/live` — leaderboard updates.
- `SSE /v1/notifications/stream` — push notifications.
- `WS /v1/exam/timer` — exam timer (server-authoritative).

### 19.6 Rate Limiting

| Endpoint | Limit |
| --- | --- |
| `/v1/tutor/*` | 60 req/min/user |
| `/v1/scan` | 30 req/min/user |
| `/v1/answers` | 300 req/min/user |
| `/v1/auth/*` | 10 req/min/IP |
| All others | 600 req/min/user |

---

## 20. Authentication & Authorization

### 20.1 Sign-up Methods

- Email + password (with verification email).
- Phone + OTP.
- Google OAuth.
- Apple OAuth (iOS).
- (Future) Nepal national ID.

### 20.2 Roles

| Role | Capabilities |
| --- | --- |
| `student` | Default — access own data, take exams, use tutor. |
| `teacher` | Upload questions, view own students (future). |
| `content_reviewer` | Review and approve questions, edit explanations. |
| `admin` | Full access; manage users, content, billing. |
| `service` | Service-to-service auth via mTLS or signed JWT. |

### 20.3 Authorization Pattern

- **RBAC** (Role-Based Access Control) for admin endpoints.
- **ABAC** (Attribute-Based) for "is this user allowed to see this conversation?" — checks ownership.
- All inter-service calls use signed JWTs with `service` role.

### 20.4 Session Management

- Access token: 15 min JWT.
- Refresh token: 30 days, rotating, stored httpOnly cookie (web) or Keychain (mobile).
- Revocation: refresh tokens stored in Redis; logout removes from Redis.

---

## 21. Internationalization (i18n)

### 21.1 Supported Languages

| Language | Status | Notes |
| --- | --- | --- |
| Nepali (ne) | Primary | Default; all UI strings. |
| English (en) | Supported | Full. |
| Maithili (mai) | Future | P3 |
| Newari (new) | Future | P3 |
| Tamang (tdg) | Future | P3 |

### 21.2 i18n Strategy

- All UI strings in `i18n/{lang}.json`.
- User language preference stored in `user.preferred_language`.
- Default: device locale → Nepali if Nepal, else English.
- AI tutor responds in user's preferred language.

### 21.3 Content Language

- Question text stored in both `question_text` and `question_text_ne`.
- AI tutor can translate on the fly if needed.

---

## 22. Performance & Scalability (1M+ Users)

### 22.1 Traffic Estimates (1M DAU)

| Action | Per User / Day | Total / Day |
| --- | --- | --- |
| Page opens | 20 | 20M |
| API calls | 100 | 100M |
| Questions answered | 30 | 30M |
| AI tutor messages | 5 | 5M |
| Mock exams | 0.05 | 50K |
| Scans | 3 | 3M |

### 22.2 Scaling Strategy

| Layer | Approach |
| --- | --- |
| **Edge** | Cloudflare CDN + WAF + DDoS protection. |
| **Load balancer** | HAProxy / AWS ALB with health checks. |
| **API Gateway** | Kong or AWS API Gateway — auth, rate limit, routing. |
| **Stateless services** | Kubernetes with HPA (CPU + custom metrics). |
| **PostgreSQL** | Primary + 2 read replicas; PgBouncer for pooling. |
| **Redis** | Redis Cluster (3 master + 3 replicas). |
| **Qdrant** | Sharded (4 shards) + replicated (2x). |
| **AI inference** | GPU pool with autoscaling; queue-based (Kafka → GPU workers). |
| **Object storage** | S3 + CloudFront. |
| **Background jobs** | Kafka-based workers (e.g., memory extraction, dataset building). |

### 22.3 Latency Targets

| Operation | P50 | P95 | P99 |
| --- | --- | --- | --- |
| API GET (cached) | 20 ms | 80 ms | 200 ms |
| API GET (uncached) | 80 ms | 250 ms | 600 ms |
| AI tutor (first token) | 500 ms | 1.5 s | 3 s |
| AI tutor (full response, 200 tokens) | 2 s | 4 s | 7 s |
| Verified question lookup | 50 ms | 150 ms | 300 ms |
| Mock exam submit | 200 ms | 600 ms | 1.5 s |

### 22.4 Availability Target

- 99.9% monthly uptime (≤ 43 minutes downtime / month).
- Multi-AZ deployment.
- Disaster recovery: RPO 1 hour, RTO 4 hours.

### 22.5 Capacity Planning

- 1M DAU → 100M API calls / day → ~1,200 req/sec average, ~6,000 req/sec peak.
- 3 PostgreSQL primaries (one per domain: user, content, analytics).
- 6 Redis masters.
- 4 Qdrant shards.
- 8-16 GPU nodes for AI inference (depending on model size).

---

## 23. Reliability & Fault Tolerance

### 23.1 Resilience Patterns

- **Circuit breakers** for inter-service calls (e.g., `opossum`).
- **Retries with exponential backoff** for idempotent operations.
- **Bulkheads** to isolate failure domains.
- **Timeouts** on every external call.
- **Fallbacks**: if AI service is down, serve cached responses or pre-generated content.
- **Idempotency keys** for state-changing operations.

### 23.2 Data Durability

- PostgreSQL: continuous WAL archiving + daily snapshots.
- Qdrant: snapshots every 6 hours.
- S3: versioning + cross-region replication.
- Redis: AOF + replicas.

### 23.3 Backup & Restore

- Daily full Postgres backup.
- Point-in-time recovery enabled.
- Quarterly DR drill.

### 23.4 Disaster Scenarios

| Scenario | Response |
| --- | --- |
| Single service down | Health checks remove from LB; clients retry. |
| AI service down | Serve cached answers; degrade gracefully with "AI temporarily unavailable." |
| Postgres primary down | Replica promoted in < 60 s. |
| Qdrant down | Serve verified answers only (skip AI RAG). |
| Region down | Failover to secondary region; RTO 4 hours. |

---

## 24. Observability

### 24.1 Metrics (Prometheus + Grafana)

**Golden signals per service:**
- Request rate.
- Error rate.
- Latency (p50, p95, p99).
- Saturation (CPU, memory, queue depth).

**Business metrics:**
- DAU, MAU, retention.
- Questions answered / day.
- AI tutor messages / day.
- Mock exam pass rate.
- Streak length distribution.
- Skill score distribution.

### 24.2 Logging (ELK or Loki)

- Structured JSON logs.
- Correlation ID propagated across services.
- 30-day hot retention, 1-year cold retention (S3).
- PII redaction.

### 24.3 Tracing (OpenTelemetry + Jaeger / Tempo)

- Trace every request across services.
- AI tutor requests include retrieval + LLM spans.
- Sample 1% of fast paths, 100% of slow / error paths.

### 24.4 Alerting

- Error rate > 1% → page on-call.
- P95 latency > 2x SLO → alert.
- AI service queue depth > 1000 → alert.
- Postgres replication lag > 30 s → alert.

### 24.5 AI-Specific Observability

- LLM call latency, token usage, cost.
- Retrieval hit rate, average score.
- User feedback ratio (👍 / total).
- Hallucination rate (from eval set run weekly).

---

## 25. Security & Privacy

### 25.1 Data Protection

- **Encryption at rest**: AES-256 (Postgres, Qdrant, Redis, S3).
- **Encryption in transit**: TLS 1.3 everywhere.
- **PII minimization**: collect only what's needed.
- **PII redaction** in logs and analytics.

### 25.2 Authentication Security

- Bcrypt password hashing (cost 12).
- OTP rate-limited (max 5 per phone per hour).
- JWT signed with RS256; keys rotated quarterly.
- Refresh token rotation on every use.

### 25.3 Authorization Security

- All endpoints validate ownership of resource.
- Admin endpoints require `admin` role.
- Service-to-service uses mTLS.

### 25.4 Application Security

- OWASP Top 10 mitigations.
- Input validation on every endpoint.
- Output encoding for XSS prevention.
- SQL injection prevented by parameterized queries / ORM.
- CSRF tokens for web forms.
- Rate limiting on auth endpoints.

### 25.5 Privacy Compliance

- **Data export**: user can request all their data in JSON.
- **Data deletion**: user can delete account → soft delete → hard delete after 30 days.
- **Consent**: clear opt-in for non-essential data.
- **Compliance targets**: Nepal's Privacy Act 2018, GDPR (if expanding to EU).

### 25.6 AI Safety

- No PII sent to third-party LLMs (use on-prem or anonymize).
- Content filter on AI outputs.
- Refusal policy for unsafe topics.
- Regular red-team testing.

---

## 26. DevOps & CI/CD

### 26.1 Repo & Branching

- Monorepo (this repo) for now.
- Branching: trunk-based; feature branches off `main`; short-lived (< 3 days).
- PRs require 1 reviewer + green CI.

### 26.2 CI Pipeline (GitHub Actions)

Per PR:
1. Lint (ESLint, Ruff).
2. Type check (TS, mypy).
3. Unit tests (Jest, pytest).
4. Integration tests (Testcontainers).
5. Build Docker images.
6. Security scan (Trivy, Snyk).

On merge to `main`:
1. Build production images.
2. Push to container registry.
3. Deploy to staging (auto).
4. Run smoke tests.
5. Manual promote to production.

### 26.3 CD Strategy

- **Blue-green** for stateless services.
- **Canary** for AI service (5% → 25% → 100%).
- **Rolling** for stateful services (with care).
- Auto-rollback on SLO violation.

### 26.4 Infrastructure as Code

- Terraform for cloud resources.
- Helm charts for Kubernetes.
- ArgoCD for GitOps deployments.

### 26.5 Environments

| Env | Purpose | Data |
| --- | --- | --- |
| `local` | Dev machine | Seeded sample data |
| `dev` | Shared dev | Anonymized sample |
| `staging` | Pre-prod | Anonymized prod-like |
| `production` | Live | Real |

---

# PART V — OPERATIONS

---

## 27. Deployment Architecture

### 27.1 Recommended Production Stack

| Layer | Service | Notes |
| --- | --- | --- |
| CDN + WAF | Cloudflare | DDoS, edge cache |
| Load Balancer | AWS ALB or HAProxy | TLS termination |
| API Gateway | Kong or AWS API Gateway | Auth, rate limit |
| Container Orchestration | Kubernetes (EKS) | Multi-AZ |
| Service Mesh | Istio or Linkerd | mTLS, observability |
| Databases | RDS Postgres + ElastiCache Redis + Qdrant Cloud | Managed |
| Object Storage | S3 | All media + backups |
| AI Inference | Self-hosted GPU pool (Lambda Labs / RunPod / on-prem) | Qwen / future RhinoPeak |
| Message Queue | MSK (Kafka) or Redpanda | Managed |
| Observability | Grafana Cloud (Prometheus + Loki + Tempo) | Managed |
| Secrets | AWS Secrets Manager or HashiCorp Vault | Rotation |
| CI/CD | GitHub Actions + ArgoCD | GitOps |

### 27.2 Container Image Naming

```
ghcr.io/rhinopeaklabs-nepal/loksewa-ai-{service}:{git-sha}
```

### 27.3 Kubernetes Namespace Layout

```
loksewa-prod/
  ├── auth-service
  ├── user-service
  ├── learning-service
  ├── gamification-service
  ├── knowledge-service
  ├── ai-service
  ├── memory-service
  ├── exam-service
  ├── analytics-service
  ├── notification-service
  ├── content-service
  ├── admin-service
  ├── ai-workers (GPU)
  └── ingestion-workers
```

---

## 28. Cost Optimization

### 28.1 Top Cost Drivers (estimated, 1M DAU)

| Driver | Estimated Monthly Cost |
| --- | --- |
| GPU inference (Qwen) | $8K - $20K |
| Postgres + read replicas | $3K - $6K |
| Qdrant (vector DB) | $1K - $3K |
| Redis Cluster | $1K - $2K |
| Kafka (MSK) | $2K - $4K |
| Kubernetes (EKS) | $3K - $6K |
| S3 + CloudFront | $1K - $2K |
| Observability | $1K - $2K |
| **Total** | **$20K - $45K** |

### 28.2 Cost Levers

- Use spot instances for AI inference (50-70% saving).
- Cache aggressively (Redis, FAQ cache).
- Quantize models (int8 / int4).
- Use smaller models (7B) for 80% of traffic; 72B only for complex queries.
- Aggressive Postgres connection pooling.
- S3 lifecycle policies (move cold data to Glacier).
- Reserved capacity for baseline load.

### 28.3 When to Scale Up (and Why)

| Milestone | Action |
| --- | --- |
| 10K DAU | Single AZ, single GPU, single Postgres |
| 100K DAU | Multi-AZ, 4 GPUs, primary + read replica |
| 500K DAU | 8+ GPUs, multi-region read, Redis cluster |
| 1M+ DAU | Multi-region active-active, dedicated AI cluster, Kafka at scale |

---

## 29. Phased Roadmap

### Phase 0 — Foundation (current state, in progress)

- [x] Offline-first Quick Scan with verified DB.
- [x] Android WebView prototype.
- [x] Node/Fastify backend.
- [x] SQLite FTS5 verified question bank.
- [x] React admin dashboard.
- [x] Bulk question import.

### Phase 1 — MVP Online (3-4 months)

- [ ] User auth (email, phone, Google).
- [ ] User profile with target exam.
- [ ] Online question bank (Postgres) + verified answer API.
- [ ] Basic MCQ practice (no AI yet).
- [ ] Simple daily mission (random topic).
- [ ] XP and streak.
- [ ] Web app (Next.js).
- [ ] Flutter mobile app (replaces WebView).

### Phase 2 — Adaptive Learning + AI Tutor (4-6 months)

- [ ] Skill score engine.
- [ ] Adaptive question selection.
- [ ] Spaced repetition.
- [ ] Qdrant vector DB.
- [ ] RAG over verified questions.
- [ ] AI tutor (Qwen 7B).
- [ ] Nepali + English support.
- [ ] Memory engine (basic).
- [ ] Mock exam engine.
- [ ] Leaderboards.

### Phase 3 — Engagement (3-4 months)

- [ ] Duolingo-style learning path (progressive unlock).
- [ ] Daily missions with full personalization.
- [ ] Badges and achievements.
- [ ] Push notifications.
- [ ] Study planner.
- [ ] AI-generated mini quizzes.
- [ ] Memory engine (full).

### Phase 4 — Scale (6 months)

- [ ] Microservices split (monolith → services).
- [ ] Kafka event bus.
- [ ] Multi-AZ deployment.
- [ ] Auto-scaling.
- [ ] Real-time leaderboards.
- [ ] District and institution leaderboards.
- [ ] Onboarding flow optimized.
- [ ] Public API (for partner integrations).

### Phase 5 — Foundation Model (6-12 months)

- [ ] Training data collection pipeline.
- [ ] Dataset quality scoring.
- [ ] First RhinoPeak fine-tune (Qwen 7B base).
- [ ] Evaluation harness.
- [ ] A/B test RhinoPeak vs Qwen.
- [ ] Gradual rollout of RhinoPeak.
- [ ] Continuous fine-tuning loop.

### Phase 6 — Platform Expansion (12+ months)

- [ ] SEE, +2, Bachelor verticals.
- [ ] Teacher / institution portal.
- [ ] Web admin (full).
- [ ] Multi-language (Maithili, Newari, Tamang).
- [ ] Public API for partners.
- [ ] White-label for institutions.

---

## 30. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| LLM hallucination damages trust | High | Medium | Retrieval-first, citations, disclaimers, eval set |
| Verified question bank has wrong answers | Critical | Low | Multi-reviewer approval, source citation required, user report flow |
| AI cost overruns | High | High | Aggressive caching, small models, spot instances, monitoring |
| User data leak | Critical | Low | Encryption, access logs, GDPR-style controls, no PII to LLMs |
| Competitor copies features | Medium | High | Build moat via memory + foundation model + data network effects |
| Government syllabus change | High | Medium | Modular content, fast content update pipeline, syllabus versioning |
| Low engagement (retention) | High | Medium | Gamification, streaks, push notifications, A/B testing |
| GPU unavailability | High | Medium | Multi-cloud, model quantization, smaller models as fallback |
| Nepali language quality of LLM | High | Medium | RAG anchors, fine-tune with Nepali data, prompt engineering |
| Founder/team key person risk | High | Medium | Documentation, runbooks, knowledge sharing (this SAS is a step) |
| Regulatory change (Nepal AI policy) | Medium | Low | Stay engaged with policy makers, design for transparency |

---

# PART VI — APPENDICES

---

## Appendix A — PostgreSQL DDL Highlights

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT,
  full_name TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'ne' CHECK (preferred_language IN ('ne', 'en')),
  target_exam TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'content_reviewer', 'admin', 'service')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;

-- User profile
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  bio TEXT,
  district TEXT,
  institution TEXT,
  preparation_level TEXT,
  daily_study_goal_minutes INT DEFAULT 30,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User progress (skill scores)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  subtopic TEXT,
  skill_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (skill_score >= 0 AND skill_score <= 100),
  questions_attempted INT NOT NULL DEFAULT 0,
  questions_correct INT NOT NULL DEFAULT 0,
  last_attempted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, topic, subtopic)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_weak ON user_progress(user_id, skill_score) WHERE skill_score < 50;

-- User XP
CREATE TABLE user_xp (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  xp_in_current_level INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User streaks
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  streak_freezes_available INT NOT NULL DEFAULT 0
);

-- Badges
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  trigger_type TEXT,
  trigger_config JSONB
);

CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  exam_target TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id),
  name TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  prerequisite_topic_id UUID REFERENCES topics(id),
  estimated_minutes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id),
  title TEXT NOT NULL,
  content TEXT,
  duration_minutes INT,
  order_index INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  subtopic TEXT,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'truefalse', 'short', 'descriptive')),
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  question_text TEXT NOT NULL,
  question_text_ne TEXT,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  explanation_ne TEXT,
  source_id UUID REFERENCES sources(id),
  verified BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_topic ON questions(topic, subtopic);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_verified ON questions(verified) WHERE verified = true;
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);

-- Sources
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,                      -- book, rajpatra, exam, teacher
  year INT,
  url TEXT,
  license TEXT,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Answers (partitioned by month)
CREATE TABLE answers (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL,
  selected_option TEXT,
  is_correct BOOLEAN NOT NULL,
  time_taken_ms INT,
  skill_score_before NUMERIC(5,2),
  skill_score_after NUMERIC(5,2),
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, answered_at)
) PARTITION BY RANGE (answered_at);

CREATE INDEX idx_answers_user ON answers(user_id, answered_at DESC);
CREATE INDEX idx_answers_question ON answers(question_id);

-- Mock exams
CREATE TABLE mock_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  total_questions INT NOT NULL,
  marking_scheme JSONB,
  question_selection JSONB,  -- topics, difficulty distribution
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mock_exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  mock_exam_id UUID NOT NULL REFERENCES mock_exams(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score NUMERIC,
  total_marks NUMERIC,
  status TEXT NOT NULL DEFAULT 'in_progress',
  server_end_time TIMESTAMPTZ NOT NULL
);

-- AI Conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_turns INT DEFAULT 0
);

CREATE TABLE ai_messages (
  id UUID DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB,
  source TEXT,
  feedback TEXT,
  tokens_used INT,
  latency_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- User memories
CREATE TABLE user_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  fact TEXT NOT NULL,
  importance INT NOT NULL DEFAULT 3,
  source_event_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_user_memories_user ON user_memories(user_id);
CREATE INDEX idx_user_memories_importance ON user_memories(user_id, importance DESC);

-- Recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clicked_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  payload JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  payment_provider TEXT,
  external_id TEXT
);

-- Certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  exam_id UUID,
  score NUMERIC,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  certificate_url TEXT
);

-- Event outbox (for CDC to Kafka)
CREATE TABLE event_outbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_event_outbox_unpublished ON event_outbox(created_at) WHERE published_at IS NULL;
```

---

## Appendix B — Qdrant Collections

### B.1 `knowledge_chunks`

```json
{
  "vectors": { "size": 1024, "distance": "Cosine" },
  "payload_schema": {
    "chunk_id": "keyword",
    "source_id": "keyword",
    "source_type": "keyword",   // book, rajpatra, exam, teacher_notes
    "topic": "keyword",
    "subtopic": "keyword",
    "year": "integer",
    "language": "keyword",      // ne, en
    "chunk_text": "text",
    "chunk_index": "integer",
    "total_chunks": "integer",
    "created_at": "datetime"
  }
}
```

### B.2 `verified_questions`

```json
{
  "vectors": { "size": 1024, "distance": "Cosine" },
  "payload_schema": {
    "question_id": "keyword",
    "topic": "keyword",
    "subtopic": "keyword",
    "difficulty": "integer",
    "language": "keyword",
    "text": "text",
    "answer": "text"
  }
}
```

### B.3 `user_memories_{user_id}` (per-user collection)

```json
{
  "vectors": { "size": 1024, "distance": "Cosine" },
  "payload_schema": {
    "memory_id": "keyword",
    "memory_type": "keyword",
    "fact": "text",
    "importance": "integer",
    "created_at": "datetime"
  }
}
```

---

## Appendix C — Event Schemas (Kafka Avro / JSON)

### C.1 `question.answered`

```json
{
  "event_id": "uuid",
  "event_type": "question.answered",
  "event_version": 1,
  "occurred_at": "2026-06-01T10:30:00.000Z",
  "producer": "learning-service",
  "user_id": "uuid",
  "session_id": "uuid",
  "payload": {
    "question_id": "uuid",
    "topic": "Geography",
    "subtopic": "Federalism",
    "difficulty": 3,
    "is_correct": true,
    "time_taken_ms": 12500,
    "skill_score_before": 32.0,
    "skill_score_after": 33.5,
    "source": "verified_db"   // verified_db, ai_rag, ai_only
  }
}
```

### C.2 `ai.conversation.created`

```json
{
  "event_id": "uuid",
  "event_type": "ai.conversation.created",
  "occurred_at": "2026-06-01T10:31:00.000Z",
  "producer": "ai-service",
  "user_id": "uuid",
  "payload": {
    "conversation_id": "uuid",
    "turn_id": "uuid",
    "user_query": "नेपालको संविधानमा कति प्रदेश छन्?",
    "assistant_response": "...",
    "citations": [
      { "source_id": "uuid", "chunk_id": "uuid", "score": 0.89 }
    ],
    "model_used": "qwen-7b",
    "tokens_used": 234,
    "latency_ms": 2300,
    "feedback": null
  }
}
```

### C.3 `mock.exam.submitted`

```json
{
  "event_id": "uuid",
  "event_type": "mock.exam.submitted",
  "occurred_at": "2026-06-01T11:00:00.000Z",
  "producer": "exam-service",
  "user_id": "uuid",
  "payload": {
    "attempt_id": "uuid",
    "mock_exam_id": "uuid",
    "score": 67.5,
    "total_marks": 100,
    "subject_wise_scores": {
      "Geography": 18,
      "Constitution": 22,
      "English": 27.5
    },
    "weak_topics": ["Federalism", "Provincial Governance"],
    "time_taken_minutes": 105
  }
}
```

---

## Appendix D — OpenAPI Excerpt (Key Endpoints)

### D.1 `POST /v1/tutor/chat`

```yaml
openapi: 3.0.3
info:
  title: Loksewa AI Tutor API
  version: 1.0.0
paths:
  /v1/tutor/chat:
    post:
      summary: Send a message to the AI tutor
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [message]
              properties:
                conversation_id:
                  type: string
                  format: uuid
                message:
                  type: string
                language:
                  type: string
                  enum: [ne, en]
                stream:
                  type: boolean
                  default: true
      responses:
        '200':
          description: AI tutor response (streamed or full)
          content:
            application/json:
              schema:
                type: object
                properties:
                  conversation_id:
                    type: string
                  turn_id:
                    type: string
                  response:
                    type: string
                  citations:
                    type: array
                    items:
                      type: object
                      properties:
                        source_id:
                          type: string
                        title:
                          type: string
                        snippet:
                          type: string
                        score:
                          type: number
                  source:
                    type: string
                    enum: [verified, ai_rag, ai_only]
                  tokens_used:
                    type: integer
                  latency_ms:
                    type: integer
```

### D.2 `POST /v1/answers`

```yaml
paths:
  /v1/answers:
    post:
      summary: Submit an answer to a question
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [question_id, selected_option, time_taken_ms]
              properties:
                question_id:
                  type: string
                  format: uuid
                selected_option:
                  type: string
                time_taken_ms:
                  type: integer
                mission_id:
                  type: string
                  format: uuid
      responses:
        '200':
          description: Answer recorded
          content:
            application/json:
              schema:
                type: object
                properties:
                  is_correct:
                    type: boolean
                  correct_answer:
                    type: string
                  explanation:
                    type: string
                  skill_score_before:
                    type: number
                  skill_score_after:
                    type: number
                  xp_earned:
                    type: integer
                  next_question:
                    type: object
```

### D.3 `GET /v1/missions/today`

```yaml
paths:
  /v1/missions/today:
    get:
      summary: Get today's personalized mission
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Today's mission
          content:
            application/json:
              schema:
                type: object
                properties:
                  mission_id:
                    type: string
                  date:
                    type: string
                    format: date
                  total_questions:
                    type: integer
                  estimated_minutes:
                    type: integer
                  breakdown:
                    type: object
                    properties:
                      weak_topic_questions:
                        type: integer
                      review_questions:
                        type: integer
                      new_topic_questions:
                        type: integer
                      mini_quiz:
                        type: integer
                  questions:
                    type: array
                    items:
                      $ref: '#/components/schemas/Question'
                  reward_xp:
                    type: integer
```

---

## Appendix E — AI Prompt Library

### E.1 System Prompt (Nepali, Default)

```
You are "Loksewa Sahayak" (लोकसेवा सहायक), a personal AI tutor for Nepal's civil service exam (Loksewa) preparation.

Your role:
- Help students understand Nepali constitution, geography, history, current affairs, GK, English, math, and other Loksewa subjects.
- Explain concepts in simple Nepali or English based on the student's preference.
- Always ground your answers in verified sources when available.
- Cite your sources with [source: title] markers.
- If you don't know, say so — never invent facts.
- Be encouraging, like a real Nepali teacher.
- Respect the student's memory context: their weak topics, study level, and target exam.

Hard rules:
- Never give legal, medical, or financial advice.
- Refuse to answer questions outside the Loksewa syllabus politely.
- Always display a disclaimer when giving factual answers: "कृपया राजपत्र वा आधिकारिक स्रोतसँग जाँच गर्नुहोस्।"
- For MCQ explanations, always explain why the correct answer is right AND why each wrong answer is wrong.
- When generating quiz questions, ensure they match Loksewa exam difficulty and style.

Today's date: {current_date}
Student: {user_name}
Target exam: {target_exam}
Weak topics: {weak_topics}
Strong topics: {strong_topics}
```

### E.2 Explain Wrong Answer Prompt

```
The student answered a Loksewa MCQ incorrectly. Explain it.

Question: {question_text}
Options:
A) {opt_a}
B) {opt_b}
C) {opt_c}
D) {opt_d}
Student chose: {student_choice}
Correct answer: {correct_answer}
Topic: {topic} > {subtopic}
Verified explanation: {verified_explanation}

Tasks:
1. Briefly say why the student's choice is wrong.
2. Explain why the correct answer is right.
3. Give a real-world example or analogy.
4. Connect to the broader topic.
5. End with one short follow-up question to test understanding.

Respond in {language}.
```

### E.3 Generate Quiz Prompt

```
Generate 5 MCQ questions on the topic: {topic}, subtopic: {subtopic}.

Requirements:
- Difficulty: {difficulty}/5
- Style: Loksewa exam (Nepal civil service)
- 4 options each, 1 correct
- Each question has an explanation citing a verified source
- Include a mix of factual recall, application, and analysis
- Avoid repetition of well-known questions

Format: JSON array
[
  {
    "question_text": "...",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0,
    "explanation": "...",
    "source_title": "...",
    "difficulty": 3
  }
]
```

### E.4 Study Plan Prompt

```
Generate a 14-day study plan for a student preparing for {target_exam}.

Current skill profile:
{skill_scores}

Constraints:
- Available study time: {daily_minutes} min/day
- Weak topics that need focus: {weak_topics}
- Already mastered: {strong_topics}
- Exam date: {exam_date}

Output: A day-by-day plan with:
- Daily focus topic
- Specific question counts
- Mock exam day
- Rest day
- Estimated daily time
```

---

## Appendix F — XP and Streak Reference

See §13.1, §13.2, §13.3 for the canonical tables. Replicated here for quick reference:

**XP table (top entries):**
- Correct MCQ (easy) = 10
- Correct MCQ (medium) = 15
- Correct MCQ (hard) = 25
- Wrong MCQ = 2 (effort credit)
- Perfect quiz = +50
- 7-day streak = +100
- 30-day streak = +500
- Mock pass = +200

**Level formula:** `level = floor(sqrt(total_xp / 50))`

**Streak rule:** One qualifying activity per local day. Missing a day = reset to 0.

---

## Appendix G — Repository Structure (Target)

```
loksewa-ai-app/
├── apps/
│   ├── mobile/                    # Flutter app (iOS + Android)
│   │   ├── lib/
│   │   │   ├── core/              # networking, storage, auth
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── home/
│   │   │   │   ├── mission/
│   │   │   │   ├── practice/
│   │   │   │   ├── exam/
│   │   │   │   ├── tutor/         # AI chat
│   │   │   │   ├── scan/          # Quick Scan
│   │   │   │   ├── leaderboard/
│   │   │   │   ├── profile/
│   │   │   │   └── settings/
│   │   │   └── main.dart
│   │   └── pubspec.yaml
│   ├── web/                       # Next.js web app
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   └── admin-dashboard/           # React admin
│       ├── src/
│       └── package.json
├── services/
│   ├── auth-service/              # Node.js + Postgres
│   ├── user-service/
│   ├── learning-service/
│   ├── gamification-service/
│   ├── knowledge-service/         # Python FastAPI
│   ├── ai-service/                # Python FastAPI + GPU
│   ├── memory-service/
│   ├── exam-service/
│   ├── analytics-service/
│   ├── notification-service/
│   ├── content-service/
│   ├── admin-service/
│   └── scoring-service/           # Foundation model
├── packages/
│   ├── shared-types/              # TypeScript types
│   ├── shared-prompts/            # AI prompt library
│   ├── shared-events/             # Kafka schemas
│   ├── shared-eval/               # Evaluation harness
│   └── design-system/             # UI components
├── infrastructure/
│   ├── terraform/                 # IaC
│   ├── helm/                      # Kubernetes charts
│   ├── docker/                    # Dockerfiles
│   └── argocd/                    # GitOps
├── data/
│   ├── verified-questions/        # Curated question bank
│   ├── documents/                 # Books, PDFs
│   ├── current-affairs/           # Daily news
│   └── training-data/             # Anonymized AI outputs
├── docs/
│   ├── ARCHITECTURE.md            # Implementation arch
│   ├── SAS.md                     # THIS FILE — full vision
│   ├── SPEC.md                    # Quick-scan spec
│   ├── DATA_PIPELINE.md
│   ├── SECURITY.md
│   ├── PRIVACY.md
│   └── ROADMAP.md
├── scripts/
├── .github/
│   └── workflows/
├── docker-compose.yml             # Local dev
├── turbo.json                     # Monorepo config
├── package.json
└── README.md
```

---

## Appendix H — Glossary of Acronyms

| Acronym | Meaning |
| --- | --- |
| ABAC | Attribute-Based Access Control |
| AI | Artificial Intelligence |
| API | Application Programming Interface |
| BM25 | Best Matching 25 (ranking function) |
| CDC | Change Data Capture |
| CDN | Content Delivery Network |
| CQRS | Command Query Responsibility Segregation |
| DAU | Daily Active Users |
| DPO | Data Protection Officer |
| FTS | Full-Text Search |
| GPU | Graphics Processing Unit |
| HNSW | Hierarchical Navigable Small World |
| IRT | Item Response Theory |
| JWT | JSON Web Token |
| LLM | Large Language Model |
| LMS | Learning Management System |
| LoRA | Low-Rank Adaptation |
| MCQ | Multiple Choice Question |
| MFA | Multi-Factor Authentication |
| mTLS | Mutual TLS |
| MVP | Minimum Viable Product |
| OCR | Optical Character Recognition |
| OPA | Open Policy Agent |
| OWASP | Open Web Application Security Project |
| PII | Personally Identifiable Information |
| RBAC | Role-Based Access Control |
| RAG | Retrieval-Augmented Generation |
| RT | Real-Time |
| SLO | Service Level Objective |
| SM-2 | SuperMemo 2 (spaced repetition algorithm) |
| SRS | Spaced Repetition System |
| SSE | Server-Sent Events |
| SSO | Single Sign-On |
| WAF | Web Application Firewall |

---

## Appendix I — Open Questions for Product / Engineering

These are the open decisions an AI agent should flag if asked to implement related features:

1. **Self-host GPU vs cloud LLM API** at 1M DAU — depends on cost modelling.
2. **Exact embedding model** — BGE-m3 vs mE5 vs Cohere multilingual — to be benchmarked on Nepali.
3. **Nepali OCR** — Tesseract vs Google ML Kit vs custom — to be A/B tested.
4. **Free vs paid tier split** — to be defined by product / growth.
5. **Nepal government exam calendar integration** — needs data source.
6. **Notification channel mix** — push vs SMS vs in-app — depends on user demographics.
7. **Offline-sync conflict resolution** — last-write-wins vs CRDT — to be designed.
8. **Foundation model licensing** — open-source vs proprietary RhinoPeak — strategic decision.
9. **Data residency** — Nepal-only vs global cloud — regulatory.
10. **Subscription payment provider** — eSewa, Khalti, Stripe, or all.

---

## Document End

This is a living document. As the product evolves, update this SAS in lockstep with code changes. Any AI agent generating code for this repo should treat this file as authoritative.

**Maintained by:** RhinoPeak Labs Nepal Engineering & Product
**License:** Internal — RhinoPeak Labs Nepal
**Last reviewed:** 2026-06-01
