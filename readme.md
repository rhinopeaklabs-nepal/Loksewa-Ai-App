# Loksewa AI Preparation Engine

Offline-first architecture and implementation scaffold for a Loksewa preparation app with a camera-powered "Quick Scan" workflow, production backend, verified data pipeline, and Android prototype.

The core principle is simple: verified data wins. The app should only use local generative AI when the scanned question cannot be matched confidently against the verified offline question bank.

## Architecture

```text
User camera / manual input
        |
        v
Layer 1: On-device OCR
Google ML Kit text recognition extracts printed text offline.
        |
        v
Layer 2: Verified local database
SQLite FTS5 with a trigram tokenizer searches the packaged Loksewa data.
        |
        +-- High-confidence match -> Verified answer, no AI involved
        |
        v
Layer 3: On-device LLM fallback
Gemini Nano / Gemma / LiteRT-style model explains only when no verified
match exists, with an obvious AI warning badge.
```

This design avoids the dangerous path of letting a compact phone model invent facts about Nepal's constitution, geography, history, or current regulations.

## Repository Structure

```text
assets/
  README.md                  Notes for packaged compressed database assets
backend/
  app.py                     FastAPI API for search, sync, reports, and admin ingestion
  import_jsonl.py            Streaming importer for structured and instruction JSONL data
admin-dashboard/
  src/                       React admin dashboard for CRUD, users, reports, and mock tests
database/
  schema.sql                 Production SQLite schema with FTS5 trigram index
  search_query.sql           Canonical verified-question lookup query
  seed_script.py             Builds, vacuums, and compresses the seed database
data/
  sample_questions.json      Small sample input for validating the seed script
  training_samples.jsonl     Review-first JSONL ingestion sample
docs/
  DATA_PIPELINE.md           Data sourcing and verification workflow
  STORE_COMPLIANCE.md        Apple/Google production readiness checklist
app/
  src/main/...               Android WebView shell with mobile auth, search, and mock tests
lib/
  database_service.dart      Flutter runtime unpack/open/search service
PRIVACY.md                   Draft privacy policy
SPEC.md                      Product and technical specification
readme.md                    This file
```

## Accuracy Strategy

The app does not promise that an offline language model is always correct. It promises that verified answers are served deterministically whenever the database contains a strong match.

| Match result | Runtime behavior | UI badge |
| --- | --- | --- |
| Exact or high-confidence FTS match | Return the stored question, answer, explanation, and source | Verified Source |
| Medium-confidence match | Use the nearest verified row as context for the AI fallback | AI-Assisted Explanation |
| No useful match | Use the on-device model only if enabled and confidence-gated | AI Analysis: Check Sources |

Verified answers must always display source metadata. AI answers must always display a disclaimer that the result should be checked against official sources such as Rajpatra or authoritative textbooks.

## Database Design

The database uses a normal relational table for authoritative data and an FTS5 virtual table for fast fuzzy matching.

Key choices:

- `loksewa_questions` stores the verified MCQ, answer, explanation, and source fields.
- `fts_questions` indexes normalized question text using `tokenize = 'trigram'`.
- Insert, update, and delete triggers keep the FTS index synchronized.
- `scan_history` records local user activity without requiring a network.

See [database/schema.sql](database/schema.sql) for the complete schema.

## Build the Seed Database

Prepare a JSON or CSV file with verified questions, then run:

```powershell
python database\seed_script.py --input data\sample_questions.json --output build\loksewa_v1.db --compress gzip
```

The script:

1. Creates a fresh SQLite database.
2. Applies the production schema.
3. Normalizes and inserts verified question rows.
4. Builds the FTS5 trigram index through database triggers.
5. Runs `VACUUM` and `PRAGMA optimize`.
6. Writes a compressed `loksewa_v1.db.gz` asset.

Use Brotli when the Python `brotli` package is installed:

```powershell
python database\seed_script.py --input data\questions.json --output build\loksewa_v1.db --compress brotli
```

## Run the Backend

```powershell
$env:LOKSEWA_ADMIN_TOKEN="change-me"
$env:LOKSEWA_DELTA_SIGNING_SECRET="change-me-too"
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

Health check:

```powershell
curl.exe http://127.0.0.1:8000/healthz
```

React admin dashboard:

```text
http://127.0.0.1:8000/dashboard/
```

Architecture page from `index.html`:

```text
http://127.0.0.1:8000/architecture
```

The backend also serves the source architecture spec from `ARCHITECTURE.md` at:

```text
http://127.0.0.1:8000/architecture.md
```

Development admin credentials:

```text
Email: admin@loksewa.local
Password: LoksewaAdmin@123
```

Set `LOKSEWA_BOOTSTRAP_ADMIN_EMAIL`, `LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD`, and `LOKSEWA_SESSION_SECRET` before any real deployment.

Public API:

- `POST /v1/search`
- `GET /v1/questions`
- `GET /v1/questions/{id}`
- `GET /v1/categories`
- `GET /v1/sync/delta?since_version=1`
- `POST /v1/reports`

Admin API requires `X-Admin-Token`:

- `POST /v1/admin/questions`
- `POST /v1/admin/import-batch`
- `DELETE /v1/admin/questions/{id}`

Or sign in through `/v1/auth/login` as an admin and use `Authorization: Bearer <token>`.

## React Admin Dashboard

```powershell
cd admin-dashboard
npm install
npm run dev
npm run build
```

The dashboard includes:

1. Question CRUD and review status management.
2. Syllabus/reference CRUD.
3. User CRUD for students, reviewers, and admins.
4. Student report triage.
5. Mock test CRUD with duration, positive marks, optional negative marking, and question ordering.

## Import Training or Review Data

Instruction-style JSONL can be streamed into the backend database as review data:

```powershell
python -m backend.import_jsonl `
  --input data\training_samples.jsonl `
  --batch-name "training-samples" `
  --source-name "Internal sample set" `
  --source-license "Internal development sample" `
  --verifier "data-team"
```

Use `--verification-status verified` only after source, license, and answer correctness have been reviewed.

## Android Prototype

The Android project currently uses a local WebView mobile surface for sign in/register, verified-bank search, and mock-test simulation. The emulator uses `http://10.0.2.2:8000` to reach the local backend.

Build:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME="C:\Users\salam\AppData\Local\Android\Sdk"
& "C:\Users\salam\.gradle\wrapper\dists\gradle-8.14-all\c2qonpi39x1mddn7hk5gh9iqj\gradle-8.14\bin\gradle.bat" --offline assembleDebug
```

Install on emulator:

```powershell
adb install -r app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n com.loksewa.aiapp/.MainActivity
```

## Mobile Runtime Flow

On first launch:

1. Check whether `loksewa_active.db` already exists in app storage.
2. If missing, load `assets/loksewa_v1.db.gz`.
3. Decompress it on a background isolate.
4. Write it atomically into the app database directory.
5. Open it read-only for fast verified lookup.

At runtime:

1. OCR extracts text from the camera image.
2. Text is normalized.
3. `VerifiedDatabaseService.searchVerifiedQuestions()` returns the top local matches.
4. The answer pipeline decides whether to show a verified result or fall back to AI.

See [lib/database_service.dart](lib/database_service.dart).

## Suggested Flutter Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter
  archive: ^3.6.1
  google_mlkit_text_recognition: ^0.15.0
  path: ^1.9.0
  path_provider: ^2.1.3
  sqflite: ^2.3.3
```

If you need encrypted local storage, replace `sqflite` with `sqflite_sqlcipher` and adapt the open call accordingly.

## OTA Update Model

The packaged database gives instant offline value. Later question-bank updates can be delivered as small signed delta files when the user has internet:

1. Download a JSON delta with new verified rows and a version number.
2. Temporarily open the database in write mode.
3. Insert new rows into `loksewa_questions`.
4. Let the triggers update `fts_questions`.
5. Store the applied database version in `database_metadata`.

Do not update the on-device model silently. Model changes should be treated as app releases or explicit large downloads because they affect behavior, size, battery use, and trust.

## Production Readiness

See:

- [docs/DATA_PIPELINE.md](docs/DATA_PIPELINE.md)
- [docs/STORE_COMPLIANCE.md](docs/STORE_COMPLIANCE.md)
- [PRIVACY.md](PRIVACY.md)
