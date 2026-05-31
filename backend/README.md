# Loksewa AI Backend

FastAPI backend for verified Loksewa question ingestion, search, sync deltas, mobile auth, mock tests, user reports, and the React admin dashboard.

## Architecture Layout

`backend/src` now mirrors the clean TypeScript backend structure from `ARCHITECTURE.md`, including `core`, `domains`, `shared`, `config`, `routes`, `workers`, and `app.ts`.

The TypeScript implementation from `.mavis/plans/plan.yaml` is available as a standalone Fastify + Prisma backend package in this folder. The existing FastAPI adapter remains available as the current compatibility runtime.

TypeScript backend:

```powershell
cd backend
npm install
$env:DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/loksewa_ai?schema=public"
$env:AI_PROVIDER="ollama"
$env:OLLAMA_MODEL="qwen2.5:3b"
$env:AI_LESSON_MODEL="qwen2.5:3b"
$env:AI_TUTOR_MODEL="qwen2.5:3b"
npx prisma generate
npm run typecheck
npm run build
npm run dev
```

Ollama setup:

```powershell
ollama pull qwen2.5:3b
ollama serve
```

FastAPI compatibility runtime:

```powershell
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

## Run Locally

```powershell
$env:LOKSEWA_ADMIN_TOKEN="change-me"
$env:LOKSEWA_DELTA_SIGNING_SECRET="change-me-too"
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

Health check:

```powershell
curl.exe http://127.0.0.1:8000/healthz
```

React dashboard:

```text
http://127.0.0.1:8000/dashboard/
```

Exact supplied architecture page:

```text
http://127.0.0.1:8000/architecture
```

Exact supplied architecture markdown:

```text
http://127.0.0.1:8000/architecture.md
```

Development admin credentials:

```text
Email: admin@loksewa.local
Password: LoksewaAdmin@123
```

Override these before any real deployment:

```powershell
$env:LOKSEWA_BOOTSTRAP_ADMIN_EMAIL="admin@example.com"
$env:LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD="replace-with-a-strong-secret"
$env:LOKSEWA_SESSION_SECRET="replace-with-a-strong-session-secret"
```

## React Dashboard

```powershell
cd admin-dashboard
npm install
npm run dev
npm run build
```

The production build is served by FastAPI from `admin-dashboard/dist` at `/dashboard/`.

## Import Review Data

Instruction-style JSONL is imported as `needs_review` by default:

```powershell
python -m backend.import_jsonl `
  --input data\training_samples.jsonl `
  --batch-name "training-samples" `
  --source-name "Internal sample set" `
  --source-license "Internal development sample" `
  --verifier "data-team"
```

Only use `--verification-status verified` after your team has checked the answer, source, and license.

## Public Endpoints

- `GET /healthz`
- `GET /v1/metadata`
- `GET /v1/categories`
- `GET /v1/questions`
- `GET /v1/questions/{id}`
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/auth/me`
- `POST /v1/auth/logout`
- `GET /v1/mock-tests`
- `POST /v1/mock-tests/{id}/start`
- `GET /v1/mock-attempts/{id}`
- `POST /v1/mock-attempts/{id}/answers`
- `POST /v1/mock-attempts/{id}/submit`
- `POST /v1/search`
- `GET /v1/sync/delta?since_version=1`
- `POST /v1/reports`

## Admin Endpoints

Admin endpoints require either an admin Bearer token from `/v1/auth/login` or the legacy development token header:

```http
X-Admin-Token: <LOKSEWA_ADMIN_TOKEN>
```

- `GET /v1/admin/questions`
- `POST /v1/admin/questions`
- `PUT /v1/admin/questions/{id}`
- `POST /v1/admin/import-batch`
- `POST /v1/admin/questions/{id}/review`
- `DELETE /v1/admin/questions/{id}`
- `GET/POST/PUT/DELETE /v1/admin/syllabus`
- `GET/POST/PUT/DELETE /v1/admin/mock-tests`
- `GET/POST/PUT/DELETE /v1/admin/users`
- `GET/PUT/DELETE /v1/admin/reports`

## Production Notes

- Put this API behind HTTPS only.
- Set strong secrets through environment variables.
- Do not expose `/docs` in production.
- Keep public endpoints read-only except user reports.
- Use signed delta payloads for mobile sync.
- Store only minimal report metadata; device IDs are SHA-256 hashed.
- Do not ingest copyrighted/private data unless you have rights to redistribute it.
