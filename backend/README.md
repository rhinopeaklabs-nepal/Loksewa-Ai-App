# Loksewa AI Node Backend

This is the only backend runtime for the app. The old Python compatibility server has been removed.

The server is a Fastify/TypeScript app in `src/app.ts`. It serves the mobile API, admin API, admin dashboard build, course catalog, mock-test flow, sync delta endpoint, reporting endpoint, and scraper controls.

## Environments

Environment loading happens in this order, with real OS environment variables taking priority:

1. `.env.<environment>.local`
2. `.env.local`
3. `.env.<environment>`
4. `.env`

Tracked environment files:

- `.env.development`: local development defaults.
- `.env.test`: automated test defaults.
- `.env.production.example`: production template; copy values into your host secrets or deployment environment.

Production fails fast if these are still using development values:

- `LOKSEWA_ADMIN_TOKEN`
- `LOKSEWA_SESSION_SECRET`
- `LOKSEWA_DELTA_SIGNING_SECRET`
- `LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD`
- `LOKSEWA_CORS_ORIGINS`

## Development

```powershell
cd backend
npm install
npm run dev
```

Or from the repo root:

```powershell
.\scripts\run_backend_dev.ps1
```

Health check:

```powershell
curl.exe http://127.0.0.1:8000/healthz
```

Dashboard URL after building the React admin dashboard:

```powershell
cd ..\admin-dashboard
npm install
npm run build
```

```text
http://127.0.0.1:8000/dashboard/
```

Development admin credentials:

```text
Email: admin@loksewa.local
Password: LoksewaAdmin@123
```

## Test

```powershell
cd backend
npm test
npm run typecheck
npm run build
```

`npm run check` runs typecheck and tests together.

## Production

Set real secrets from `.env.production.example`, then build and run:

```powershell
cd backend
npm ci
npm run build
$env:NODE_ENV="production"
$env:LOKSEWA_ENV="production"
node dist/index.js
```

Docker production build from the repo root:

```powershell
docker build -f backend/Dockerfile -t loksewa-ai-backend .
```

Docker Compose production deploy:

```powershell
docker compose -f backend/docker-compose.production.yml up -d --build
```

The production image stores the JSON runtime database at `/data/node-backend-db.json` and includes the built `admin-dashboard/dist` bundle.

## Security Controls

- Session tokens are random bearer tokens stored server-side by HMAC digest using `LOKSEWA_SESSION_SECRET`.
- `/v1/auth/login` has a stricter per-IP rate limit than the global API limit.
- Production responses include HSTS, CSP, frame denial, referrer policy, and content-type sniffing protection.
- Production redirects proxied HTTP traffic to HTTPS when `X-Forwarded-Proto` is present.
- `/architecture` and `/architecture.md` are disabled in production unless `LOKSEWA_ENABLE_ARCHITECTURE_ROUTES=true`.
- Reports sanitize submitted text and store only a SHA-256 hash of any supplied device identifier.

## Main API

- `GET /healthz`
- `GET /v1/metadata`
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/auth/me`
- `POST /v1/auth/logout`
- `GET /v1/subjects`
- `GET /v1/courses`
- `GET /v1/questions`
- `POST /v1/search`
- `GET /v1/mock-tests`
- `POST /v1/mock-tests/:id/start`
- `POST /v1/mock-attempts/:id/answers`
- `POST /v1/mock-attempts/:id/submit`
- `GET /v1/sync/delta?since_version=1`
- `POST /v1/reports`

Admin endpoints use either `Authorization: Bearer <admin-login-token>` or `X-Admin-Token: <LOKSEWA_ADMIN_TOKEN>`.

## Notes

- Swagger UI is available at `/docs` outside production.
- The current runtime database is JSON-file backed for developer speed. Use one process per data volume, or migrate the route handlers to the Prisma/Postgres domain layer before high-traffic production.
- Keep `LOKSEWA_SCRAPER_ENABLED=false` unless source allowlists and licensing have been reviewed.
