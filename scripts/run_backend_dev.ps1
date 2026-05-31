$ErrorActionPreference = "Stop"

if (-not $env:LOKSEWA_ADMIN_TOKEN) {
  $env:LOKSEWA_ADMIN_TOKEN = "dev-admin-token-change-me"
}

if (-not $env:LOKSEWA_DELTA_SIGNING_SECRET) {
  $env:LOKSEWA_DELTA_SIGNING_SECRET = "dev-delta-signing-secret-change-me"
}

if (-not $env:LOKSEWA_DB_PATH) {
  $env:LOKSEWA_DB_PATH = "runtime\loksewa_backend.db"
}

python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
