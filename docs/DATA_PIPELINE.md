# Loksewa Data Pipeline

The production data pipeline has four stages.

## 1. Acquire

Allowed sources:

- Official PSC publications with redistribution permission.
- Public-domain or openly licensed materials.
- Internally authored questions.
- User submissions that are explicitly licensed for review.

Do not mark scraped or unlicensed content as verified.

## 2. Normalize

Convert each record into:

```json
{
  "question_text": "...",
  "option_a": "...",
  "option_b": "...",
  "option_c": "...",
  "option_d": "...",
  "correct_option": "A",
  "explanation": "...",
  "syllabus_category": "...",
  "source_name": "...",
  "source_url": "...",
  "source_license": "...",
  "verifier": "...",
  "verification_status": "needs_review"
}
```

Instruction-style JSONL can be imported with:

```powershell
python -m backend.import_jsonl --input data\training_samples.jsonl --batch-name "batch-001" --source-name "Internal sample set" --source-license "Internal development sample" --verifier "data-team"
```

## 3. Verify

A human reviewer checks:

- Answer correctness.
- Explanation accuracy.
- Source citation.
- License/redistribution rights.
- Whether the item is outdated or regulation-sensitive.

Only then change `verification_status` to `verified`.

## 4. Ship

For mobile offline release:

```powershell
python database\seed_script.py --input data\sample_questions.json --output build\loksewa_v1.db --compress gzip --version 1
```

For OTA sync, the backend exposes:

```text
GET /v1/sync/delta?since_version=<local_version>
```

The response includes an HMAC signature that the app should verify before applying updates.
