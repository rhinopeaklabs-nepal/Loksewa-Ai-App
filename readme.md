# Loksewa AI — AI Learning Operating System for Nepal

> **Duolingo + ChatGPT + Anki + Coursera + Nepal Loksewa Knowledge**

The complete monorepo for **Loksewa AI** — RhinoPeak Labs Nepal's flagship product. An AI-native adaptive learning platform with 13 microservices, Flutter mobile app, Next.js web, React admin dashboard, and a future foundation model pipeline.

📖 **Read the full vision: [`docs/SAS.md`](docs/SAS.md)** (Software Architecture Specification)

---

## 🏗️ What's Inside

```
loksewa-ai-app/
├── apps/
│   ├── mobile/              # Flutter app (iOS + Android)
│   ├── web/                 # Next.js web app
│   └── admin-dashboard/     # React admin console
├── services/                # 10+ Node.js / Python microservices
│   ├── auth-service/        # JWT, OAuth, OTP, sessions
│   ├── user-service/        # Profile, preferences
│   ├── learning-service/    # Skill engine, missions, recommendations
│   ├── gamification-service/# XP, streaks, badges, leaderboards
│   ├── knowledge-service/   # Verified Q&A, RAG
│   ├── ai-service/          # Qwen/Llama, RAG, prompts, context
│   ├── memory-service/      # Long-term user memory
│   ├── exam-service/        # Mock exams, grading, reports
│   ├── notification-service/# Push, email, in-app
│   └── analytics-service/   # Events, BI, dashboards
├── packages/
│   ├── shared-types/        # TypeScript types shared across services
│   └── shared-utils/        # Logger, errors, DB, Redis, Kafka, JWT
├── infrastructure/
│   ├── docker/              # docker-compose for local dev
│   ├── database/migrations/ # 12 SQL migration files
│   ├── kubernetes/          # K8s manifests
│   └── kong/                # API Gateway config
├── docs/                    # SAS, architecture, specs
└── .github/workflows/       # CI/CD
```

---

## 🚀 Quick Start (5 minutes)

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **Docker** & **Docker Compose**
- **Python 3.11+** (for AI service)
- 8GB+ RAM (16GB recommended)

### 1. Clone & install

```bash
git clone https://github.com/rhinopeaklabs-nepal/Loksewa-Ai-App
cd Loksewa-Ai-App
pnpm install
```

### 2. Start infrastructure

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

This starts:
- ✅ PostgreSQL 16 (9 databases, one per service)
- ✅ Redis 7
- ✅ Qdrant (vector DB)
- ✅ Kafka + Zookeeper
- ✅ MinIO (S3-compatible storage)
- ✅ Prometheus, Grafana, Jaeger

### 3. Run database migrations

```bash
for f in infrastructure/database/migrations/*.sql; do
  dbname=$(basename "$f" .sql | sed 's/^[0-9]*_//' | tr '-' '_')
  PGPASSWORD=loksewa_dev_pw psql -h localhost -U loksewa -d "$dbname" -f "$f"
done
```

Or on Windows PowerShell:

```powershell
Get-ChildItem infrastructure/database/migrations/*.sql | ForEach-Object {
  $name = $_.BaseName -replace '^\d+_', ''
  $env:PGPASSWORD = 'loksewa_dev_pw'
  psql -h localhost -U loksewa -d $name -f $_.FullName
}
```

### 4. Build shared packages

```bash
pnpm --filter @loksewa/shared-types build
pnpm --filter @loksewa/shared-utils build
```

### 5. Start all services (dev mode)

```bash
pnpm turbo run dev --parallel
```

Each service starts on its assigned port (3001-3011).

### 6. Start the apps

```bash
# Web (Next.js)
pnpm --filter @loksewa/web dev

# Admin
pnpm --filter @loksewa/admin-dashboard dev

# Mobile (Flutter)
cd apps/mobile
flutter pub get
flutter run
```

---

## 🔌 Service Endpoints

| Service | Port | Base URL |
| --- | --- | --- |
| auth-service | 3001 | http://localhost:3001 |
| user-service | 3002 | http://localhost:3002 |
| learning-service | 3003 | http://localhost:3003 |
| gamification-service | 3004 | http://localhost:3004 |
| ai-service | 3006 | http://localhost:3006 |
| knowledge-service | 3007 | http://localhost:3007 |
| memory-service | 3008 | http://localhost:3008 |
| exam-service | 3009 | http://localhost:3009 |
| notification-service | 3010 | http://localhost:3010 |
| analytics-service | 3011 | http://localhost:3011 |

For local dev, run the **Kong API Gateway** in front:

```bash
docker run -d --name kong \
  --network loksewa-ai-app_loksewa-net \
  -e KONG_DATABASE=off \
  -e KONG_DECLARATIVE_CONFIG=/etc/kong/kong.yml \
  -p 8000:8000 \
  -v $(pwd)/infrastructure/kong/kong.yml:/etc/kong/kong.yml \
  kong:3.4
```

Then everything is available at `http://localhost:8000`.

---

## 🧪 Testing

```bash
# All services
pnpm test

# Specific service
pnpm --filter @loksewa/auth-service test
```

---

## 📊 Observability

- **Grafana**: http://localhost:3000 (admin / `loksewa_dev_pw`)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **MinIO Console**: http://localhost:9001 (`loksewa` / `loksewa_dev_pw`)

---

## 🧠 The Six Engines

| Engine | Owns | File |
| --- | --- | --- |
| **Learning** | Skill scores, daily missions, recommendations | `services/learning-service/src/engines/` |
| **Memory** | Long-term user memory, extraction | `services/memory-service/src/` |
| **Knowledge** | Verified Q&A, RAG ingestion | `services/knowledge-service/src/` |
| **AI Tutor** | LLM, RAG, prompts, context | `services/ai-service/src/` |
| **Gamification** | XP, streaks, badges, leaderboards | `services/gamification-service/src/engines/` |
| **Foundation Model** | (Future) Training data collection | `services/analytics-service/` |

See `docs/SAS.md` §6 for the canonical description of each.

---

## 🗺️ Roadmap

- ✅ **Phase 0** — Foundation (offline-first Quick Scan)
- 🚧 **Phase 1** — MVP Online (auth, basic MCQ practice, XP)
- 📋 **Phase 2** — Adaptive Learning + AI Tutor
- 📋 **Phase 3** — Engagement (gamification, leaderboards)
- 📋 **Phase 4** — Scale (microservices, Kafka, 1M users)
- 📋 **Phase 5** — Foundation Model (RhinoPeak fine-tune)
- 📋 **Phase 6** — Platform expansion (SEE, +2, Bachelor)

---

## 🛠️ Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend Mobile | Flutter, Riverpod, GoRouter |
| Frontend Web | Next.js 14, React 18, Tailwind |
| Admin Dashboard | React 18, Vite, Recharts, TanStack Query |
| Backend Services | Node.js (Fastify) + Python (FastAPI) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Vector DB | Qdrant |
| Message Queue | Kafka (Redpanda in prod) |
| Object Storage | S3 / MinIO |
| LLM | Qwen 2.5 / Llama 3 (local) + future RhinoPeak |
| Embeddings | BGE-m3 (multilingual incl. Nepali) |
| Orchestration | Kubernetes (EKS) + ArgoCD |
| API Gateway | Kong |
| Observability | Prometheus + Grafana + Jaeger + OpenTelemetry |

---

## 🤝 Contributing

See `docs/SAS.md` for the source of truth. New features should map to one of the six engines.

```bash
# Create a feature branch
git checkout -b feat/your-feature

# Make changes
pnpm test
pnpm typecheck

# Commit
git commit -m "feat(learning): add spaced repetition review screen"

# Open PR
```

---

## 📜 License

UNLICENSED — Proprietary, RhinoPeak Labs Nepal © 2026

---

## 📞 Contact

- **Company**: RhinoPeak Labs Nepal
- **Repository**: https://github.com/rhinopeaklabs-nepal/Loksewa-Ai-App
- **Vision Document**: [docs/SAS.md](docs/SAS.md)
