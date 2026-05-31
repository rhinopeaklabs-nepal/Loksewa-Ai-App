# Loksewa AI Technical Specification

## 1. Product Vision

Loksewa AI is an offline-first mobile study app for Nepalese civil service candidates. The flagship feature is Quick Scan: a user photographs a printed question, the app extracts text locally, searches a verified offline database, and returns the safest available answer.

The product must be honest about accuracy. A verified database answer can be presented as authoritative within the limits of its source. An on-device AI answer is probabilistic and must be labeled clearly.

## 2. Non-Negotiable Principles

- Offline-first: camera OCR, verified search, history, and subject browsing work without internet.
- Verified-first: never call the AI layer when a high-confidence database match exists.
- Transparent: every result shows whether it came from the verified database, AI-assisted synthesis, or AI-only analysis.
- Conservative: if the app cannot confidently answer, it should say so instead of guessing.
- Maintainable: question updates are data updates, not UI code changes.

## 3. Answer Pipeline

```text
[Camera image or typed question]
          |
          v
[Layer 1: Google ML Kit OCR]
          |
          v
[Normalize extracted text]
          |
          v
[Layer 2: SQLite FTS5 verified lookup]
          |
          +-- high match -> verified answer
          |
          +-- medium match -> AI-assisted answer with closest verified context
          |
          v
[Layer 3: on-device LLM fallback]
          |
          +-- confident enough -> AI answer with warning
          |
          +-- low confidence -> no generated answer
```

## 4. Source Labels

| Source | Meaning | UI badge | Trust behavior |
| --- | --- | --- | --- |
| `verified_db` | Strong match in local verified question bank | Verified Source | Show answer directly |
| `ai_assisted` | LLM used with nearby verified database context | AI-Assisted Explanation | Show disclaimer |
| `ai_only` | LLM used without useful verified context | AI Analysis: Check Sources | Strong disclaimer |
| `uncertain` | No reliable answer available | Not in Database | Do not guess |

## 5. Accuracy Rules

1. If a verified database row passes the high-confidence threshold, return it directly.
2. Do not paraphrase or regenerate the verified answer through the LLM.
3. AI output must include a warning badge and source-check disclaimer.
4. Legal, constitutional, regulation, and date-sensitive answers should prefer official source citations.
5. If OCR confidence is low or the extracted text is too short, ask the user to retake the scan or type the question.

## 6. Matching Strategy

SQLite FTS5 with the trigram tokenizer is the default offline search engine.

Why:

- Fast enough for tens of thousands of rows on mobile.
- Works without a server.
- Handles partial words and many OCR typo patterns better than `LIKE`.
- Supports Devanagari text because it operates on character trigrams.
- Keeps the deployment simple compared with a separate vector database.

Runtime stages:

1. Normalize OCR text.
2. Run the FTS5 BM25 query.
3. Return the top 3 candidate rows.
4. Apply app-level thresholds:
   - High confidence: show verified row.
   - Medium confidence: pass scanned text plus nearest row as AI context.
   - Low confidence: AI-only fallback or uncertain state.

The exact threshold must be calibrated with a held-out set of real scanned Loksewa questions. Start with conservative thresholds and loosen only after testing.

## 7. Database Schema

The production schema lives in [database/schema.sql](database/schema.sql).

Important tables:

- `loksewa_questions`: authoritative question, option, answer, explanation, and source metadata.
- `fts_questions`: FTS5 trigram index linked to `loksewa_questions`.
- `syllabus_entries`: verified syllabus or reference material.
- `scan_history`: local user scan history.
- `database_metadata`: versioning and migration metadata.

## 8. Seed Database Build

Seed databases must be built on a development machine or server, not on the user's phone.

Build workflow:

1. Collect verified source data in JSON or CSV.
2. Run `database/seed_script.py`.
3. Apply `database/schema.sql`.
4. Insert rows into `loksewa_questions`.
5. Let triggers populate `fts_questions`.
6. Run `VACUUM` and `PRAGMA optimize`.
7. Compress the database as `.db.gz` or `.db.br`.
8. Bundle the compressed file as an app asset.

This avoids first-launch CPU drain, battery drain, and slow inserts on low-end devices.

## 9. Mobile Database Install

The Flutter runtime service in [lib/database_service.dart](lib/database_service.dart) handles first-launch installation.

Runtime workflow:

1. Look for the active database in the app database directory.
2. If missing, read the compressed database asset.
3. Decompress on a background isolate.
4. Write to a temporary file.
5. Rename atomically to the active database path.
6. Open read-only for normal use.

For delta updates, reopen in write mode only during the update transaction.

## 10. Quick Scan Feature

States:

- Idle
- Camera permission request
- Camera ready
- Capturing
- OCR processing
- Database matching
- AI fallback, if enabled and needed
- Result
- Error

User errors:

- No text detected: ask user to retake or type manually.
- Blurry image: ask user to retake.
- Too much surrounding text: let user crop or select the detected question text.
- AI disabled: show verified results only or uncertain state.

## 11. Manual Question Entry

Manual entry follows the same pipeline after OCR:

```text
Typed text -> normalize -> FTS5 search -> verified / AI-assisted / AI-only / uncertain
```

This is required for low-light environments, damaged pages, handwriting, or camera permission denial.

## 12. UI Requirements

Design direction:

- Quiet, focused, public-service trustworthy.
- High readability for long Nepali and English questions.
- Clear badges, no hidden source state.
- Bottom navigation centered around Scan.

Core screens:

- Home
- Quick Scan
- Result
- Manual Entry
- Subjects
- Question Detail
- Scan History
- Settings

Source badge colors:

- Verified: green.
- AI-assisted: amber.
- AI-only: orange.
- Uncertain/error: red or neutral warning.

Every AI answer must show:

```text
This answer was generated by an on-device AI model and may be incomplete or inaccurate. Please verify important facts with official sources such as Rajpatra or authoritative textbooks.
```

## 13. Suggested Flutter Stack

Mobile framework:

- Flutter 3.x with Dart 3.x.

Core dependencies:

- `camera`
- `google_mlkit_text_recognition`
- `sqflite` or `sqflite_sqlcipher`
- `path`
- `path_provider`
- `archive`
- `permission_handler`

Optional:

- AICore or Gemini Nano bridge on supported Android devices.
- LiteRT / TensorFlow Lite runtime for a bundled small model fallback.
- Drift if the app needs type-safe database access beyond raw search queries.

## 14. Android Notes

- Minimum SDK: 24 or higher.
- Request camera permission in AndroidManifest.
- Bundle the ML Kit text-recognition model for offline use.
- Detect whether AICore is available before enabling Gemini Nano features.
- Provide a no-AI mode for devices that do not support local inference.

## 15. iOS Notes

iOS can support the same verified-database architecture. OCR and on-device model choices will differ:

- OCR: Vision framework or ML Kit if supported in the chosen stack.
- AI fallback: platform-specific local model runtime.
- Database: same SQLite schema with FTS5 support if the bundled SQLite build includes FTS5 and trigram tokenizer.

## 16. OTA Data Updates

Delta updates should be small, signed, and auditable.

Recommended delta format:

```json
{
  "from_version": 1,
  "to_version": 2,
  "questions": []
}
```

Update rules:

1. Download only when internet is available.
2. Validate signature and version order.
3. Insert inside a transaction.
4. Let database triggers update FTS.
5. Record the applied version in `database_metadata`.
6. Keep the previous database until the update succeeds.

## 17. Testing Plan

Database tests:

- Schema can be applied to a fresh SQLite file.
- FTS5 trigram table exists.
- Insert triggers populate the FTS index.
- Update and delete triggers keep the index correct.
- Search query returns expected top candidates.

Pipeline tests:

- Exact known question returns `verified_db`.
- OCR typo still returns a verified candidate if above threshold.
- Medium match sends context to AI.
- No match does not show a verified badge.
- AI disabled returns `uncertain` when no match exists.

Device tests:

- First-launch database decompression.
- App restart opens existing database without reinstalling.
- Low-storage failure path.
- Camera permission denied path.
- Offline mode with airplane mode enabled.

## 18. Data Governance

Every verified row should store:

- Source name.
- Exam year or publication year.
- Page number, if available.
- Verification date.
- Verifier or import batch identifier.

Do not import scraped data into the verified bank unless licensing and correctness have been reviewed.

## 19. Open Decisions

- Final app framework: Flutter remains preferred for the production cross-platform app. The current runnable Android build is a native WebView shell that preserves the Stitch export while backend/mobile architecture is hardened.
- Final AI runtime: depends on supported Android devices and model availability.
- Exact high/medium/low FTS thresholds: must be calibrated using real OCR captures.
- Encryption: use SQLCipher if the bundled database or scan history requires protection beyond the normal app sandbox.
- Update signature format: choose before any OTA update service ships.

## 20. Current Implementation Status

- Android debug app exists under `app/` and displays the exported Stitch UI screens.
- Node/Fastify backend exists under `backend/src`.
- SQLite FTS5 schema exists under `database/schema.sql`.
- Seed database builder exists under `database/seed_script.py`.
- Review batch import is exposed by the Node admin API at `/v1/admin/import-batch`.
- Store compliance and privacy drafts exist under `docs/` and `PRIVACY.md`.

This is now a functional development baseline, not a final store submission. The release app still needs real OCR integration, authenticated admin tooling, licensed verified data, native production screens, release signing, privacy-policy publication, and full Apple/Google review preparation.
