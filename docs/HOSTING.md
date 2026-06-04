# Loksewa AI Backend Free Hosting Guide

This guide is for the current backend in this repo: a Node.js/Fastify API in `backend/` that builds with TypeScript and serves on `PORT` with health check `/healthz`.

Current backend facts:

- Backend folder: `backend`
- Local build command: `npm ci && npm run build`
- Local start command: `npm run start`
- Render Node-service build command: `npm run render:build`
- Render Node-service start command: `npm run render:start`
- Health check: `GET /healthz`
- Default local port: `8000`
- Runtime database file: `NODE_BACKEND_DB_PATH`, defaulting to `runtime/node-backend-db.json` from the project root
- Production Dockerfile: `backend/Dockerfile`

## Main Backend vs `services/`

This repo has two backend layers:

1. `backend/` is the currently working standalone API used by the mobile app and admin dashboard. This is the backend you should deploy first.
2. `services/` contains a planned microservice architecture: auth, user, learning, AI, gamification, analytics, content, exam, knowledge, memory, and notification services.

Do not assume `services/` will deploy automatically when you deploy `backend/`. They are separate services with separate ports, Dockerfiles, dependencies, databases, and environment variables.

Current status of `services/`:

- Runnable package folders now exist for all service directories.
- Local TypeScript build and typecheck now pass for all `services/*` packages.
- Service Dockerfiles now use Node/PNPM builds and include `/healthz` healthchecks.
- Runtime database/Redis/Kafka/Qdrant connectivity still must be verified in a live Docker Compose or VM environment before public traffic.

Recommended deployment order:

1. Deploy `backend/` first. This gives the mobile app a working hosted API.
2. Use Oracle Cloud Always Free VM if you want to run the full future microservice stack.
3. Repair and verify each `services/*` package before exposing it publicly.
4. Add an API gateway or Nginx routing layer only after the services compile and pass smoke tests.

### `services/` Deployability Matrix

| Service | Port | Current State | Deploy Now? | Notes |
|---|---:|---|---|---|
| `backend/` | 8000 | Standalone Fastify API with working build/test | Yes | Deploy this first for the mobile app. |
| `services/auth-service` | 3001 | Builds and typechecks | Runtime verification needed | Requires Postgres/Redis/JWT/OAuth env and endpoint smoke tests. |
| `services/user-service` | 3002 | Builds and typechecks | Runtime verification needed | Requires Postgres/JWT env and endpoint smoke tests. |
| `services/learning-service` | 3003 | Builds and typechecks | Runtime verification needed | Requires Postgres/Kafka/JWT env and endpoint smoke tests. |
| `services/gamification-service` | 3004 | Builds and typechecks | Runtime verification needed | Requires Postgres/Redis/JWT env and endpoint smoke tests. |
| `services/ai-service` | 3006 | Builds and typechecks with Node Dockerfile | Runtime verification needed | Requires Postgres/Kafka/Qdrant/LLM/JWT env and endpoint smoke tests. |
| `services/knowledge-service` | 3007 | Builds and typechecks | Runtime verification needed | Requires Postgres/Qdrant or embedding-related env and endpoint smoke tests. |
| `services/memory-service` | 3008 | Builds and typechecks | Runtime verification needed | Requires Postgres/vector-memory env and endpoint smoke tests. |
| `services/exam-service` | 3009 | Builds and typechecks | Runtime verification needed | Requires Postgres/Redis/JWT env and endpoint smoke tests. |
| `services/notification-service` | 3010 | Builds and typechecks | Runtime verification needed | Requires Postgres/JWT and notification provider env. |
| `services/analytics-service` | 3011 | Builds and typechecks | Runtime verification needed | Requires Postgres/Kafka and analytics data env. |
| `services/content-service` | 3012 | Builds and typechecks | Runtime verification needed | Minimal content shell with `/healthz` and `/readyz`. |

Minimum acceptance checklist before any `services/*` backend is public:

```bash
pnpm --filter <service-name> build
pnpm --filter <service-name> typecheck
docker build -f services/<service>/Dockerfile .
curl http://localhost:<port>/healthz
```

Run the automated backend/services audit:

```bash
npm run audit:backend-services
```

For free hosting of the full service layer, prefer one Oracle Always Free VM with Docker Compose over many Render free services. Render free services spin down independently, which is rough for service-to-service APIs.

The existing `infrastructure/docker/docker-compose.yml` only starts local infrastructure such as Postgres, Redis, Qdrant, Kafka, MinIO, Prometheus, Grafana, and Jaeger. It does not currently start the app services. Containerized app services will also need internal host env vars such as `POSTGRES_HOST=postgres`, `REDIS_HOST=redis`, `QDRANT_URL=http://qdrant:6333`, and `KAFKA_BROKERS=kafka:29092`.

## Best Free Options

| Option | Best For | Data Persistence | Difficulty | Recommendation |
|---|---|---:|---:|---|
| Render Free Web Service | Fast demo/public API preview | Not durable for the JSON file | Easy | Use for demo/testing |
| Oracle Cloud Always Free VM | Full backend with persistent disk | Durable if VM stays active | Medium | Best free production-like option |

Important: the backend currently stores data in a local JSON file. Free app platforms usually have ephemeral filesystems. That means accounts, sessions, mock attempts, and admin data can disappear after restart, redeploy, or spin-down unless you use a VM with disk or migrate the backend to a real database.

## Required Production Environment Variables

Use strong random values for every secret.

```bash
NODE_ENV=production
LOKSEWA_ENV=production
HOST=0.0.0.0
PORT=8000

NODE_BACKEND_DB_PATH=/data/node-backend-db.json
ADMIN_DIST_PATH=/app/admin-dashboard/dist

LOKSEWA_ADMIN_TOKEN=<random-hex>
LOKSEWA_SESSION_SECRET=<random-hex>
LOKSEWA_DELTA_SIGNING_SECRET=<random-hex>
LOKSEWA_BOOTSTRAP_ADMIN_EMAIL=admin@yourdomain.com
LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD=<strong-password>

SESSION_TTL_HOURS=168
LOKSEWA_TRUST_PROXY=true
LOKSEWA_ENFORCE_HTTPS=true
LOKSEWA_ENABLE_ARCHITECTURE_ROUTES=false

REQUEST_BODY_LIMIT_BYTES=131072
RATE_LIMIT_MAX=600
RATE_LIMIT_WINDOW=1 minute
AUTH_RATE_LIMIT_MAX=10
AUTH_RATE_LIMIT_WINDOW=1 minute

LOKSEWA_CORS_ORIGINS=https://your-admin-domain.com,https://your-app-domain.com
LOKSEWA_SCRAPER_ENABLED=false

GOOGLE_CLIENT_ID=<google-oauth-web-client-id>
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OLLAMA_URL=
```

Generate secrets:

```bash
openssl rand -hex 32
```

## Option A: Render Free Web Service

Choose this if you want the fastest free public backend URL.

Limitations:

- Render free web services spin down after idle time and cold start on the next request.
- Local filesystem changes are not durable on free web services.
- Free Render Postgres exists, but it expires after 30 days, so it is not a durable production database.
- Good for demo, testing mobile login, and sharing a public API URL.

### Fix The Current Failed Render Deploy

The failed deploy in the screenshot is happening because Render created a `Node` service from the repo root and is running:

```bash
pnpm install --frozen-lockfile; pnpm run build
```

That builds the PNPM/Turbo workspace, not the actual `backend/` app. Locally, that command fails before the backend is deployed.

Fastest fix for the existing Render service:

1. Open your Render service: `Loksewa-Ai-App`.
2. Go to `Settings`.
3. Set:

```text
Root Directory: backend
Build Command: npm run render:build
Start Command: npm run render:start
Health Check Path: /healthz
```

4. Add this environment variable so Render does not select a newer moving Node major version:

```bash
NODE_VERSION=22
```

5. Add all required production environment variables from this guide.
6. Click `Manual Deploy` -> `Clear build cache & deploy`.

Use this Node-service approach if you only need the API. The admin dashboard static build is not included unless you build and host it separately.

Best fix if you want API plus admin dashboard in one service:

1. Keep the new `render.yaml` file at the repo root.
2. In Render, use `New` -> `Blueprint`.
3. Select this GitHub repo.
4. Let Render create the new Docker service named `loksewa-ai-backend`.
5. Fill the secret values Render asks for.
6. Deploy.

Do not try to convert the existing `Loksewa-Ai-App` Node service into Docker. Render does not allow changing a service's runtime after creation. Either keep the current Node service and fix its root/build settings, or create the new Docker Blueprint service and use the new URL.

The Blueprint uses:

```text
Runtime: Docker
Dockerfile Path: ./backend/Dockerfile
Docker Build Context: .
Health Check Path: /healthz
```

This matches the Dockerfile in the repo, builds both `backend/` and `admin-dashboard/`, and starts `node dist/index.js`.

### Render Dashboard Setup

1. Push this repo to GitHub.
2. Go to Render Dashboard.
3. Click `New` -> `Web Service`.
4. Connect your GitHub repo.
5. Use Docker deployment:

```text
Name: loksewa-ai-backend
Runtime: Docker
Plan: Free
Root Directory: leave blank
Dockerfile Path: backend/Dockerfile
Docker Build Context Directory: .
Health Check Path: /healthz
```

6. Add environment variables from the production list above.
7. Set these Render-specific values:

```bash
PORT=8000
HOST=0.0.0.0
NODE_BACKEND_DB_PATH=/data/node-backend-db.json
ADMIN_DIST_PATH=/app/admin-dashboard/dist
LOKSEWA_ENFORCE_HTTPS=true
```

8. Deploy.
9. Test:

```bash
curl https://YOUR-RENDER-SERVICE.onrender.com/healthz
curl https://YOUR-RENDER-SERVICE.onrender.com/v1/metadata
```

### Optional `render.yaml`

Create this at repo root if you want Render Blueprint deployment:

```yaml
services:
  - type: web
    name: loksewa-ai-backend
    runtime: docker
    plan: free
    dockerfilePath: ./backend/Dockerfile
    dockerContext: .
    healthCheckPath: /healthz
    envVars:
      - key: NODE_ENV
        value: production
      - key: LOKSEWA_ENV
        value: production
      - key: HOST
        value: 0.0.0.0
      - key: PORT
        value: 8000
      - key: NODE_BACKEND_DB_PATH
        value: /data/node-backend-db.json
      - key: ADMIN_DIST_PATH
        value: /app/admin-dashboard/dist
      - key: LOKSEWA_TRUST_PROXY
        value: true
      - key: LOKSEWA_ENFORCE_HTTPS
        value: true
      - key: LOKSEWA_ENABLE_ARCHITECTURE_ROUTES
        value: false
      - key: LOKSEWA_SCRAPER_ENABLED
        value: false
      - key: LOKSEWA_ADMIN_TOKEN
        generateValue: true
      - key: LOKSEWA_SESSION_SECRET
        generateValue: true
      - key: LOKSEWA_DELTA_SIGNING_SECRET
        generateValue: true
      - key: LOKSEWA_BOOTSTRAP_ADMIN_EMAIL
        value: admin@loksewa.local
      - key: LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD
        sync: false
      - key: LOKSEWA_CORS_ORIGINS
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
```

### Render Data Warning

Render Free is not safe for this backend's current JSON database because `/data/node-backend-db.json` can be lost when the service restarts, redeploys, or spins down. Use Render only as a demo unless you migrate the backend to a durable database.

### Render Failure Checklist

If deploy still fails:

- If logs show `pnpm run build`, your service is still using the wrong root monorepo build. Set `Root Directory` to `backend`, or recreate through the Docker Blueprint.
- If logs show `Cannot find module 'node:fs'` or `Cannot find name 'process'`, Render did not install TypeScript's Node build types. Use build command `npm run render:build`.
- If logs show `Production Node backend requires secure configuration`, add the missing secret environment variables.
- If logs show Node `26.x`, set `NODE_VERSION=22` or use the Docker Blueprint.
- If deploy succeeds but `/` fails, test `/healthz` first. The root path redirects to `/dashboard/`, which needs the admin dashboard build.

### Fix TypeScript Node Type Errors On Render

If Render logs show errors like:

```text
Cannot find module 'node:crypto'
Cannot find module 'node:fs'
Cannot find name 'process'
Cannot find name 'Buffer'
```

the backend is compiling without dev build dependencies such as `@types/node`. Keep `Root Directory` as `backend`, then set:

```text
Build Command: npm run render:build
Start Command: npm run render:start
```

Then click `Manual Deploy` -> `Clear build cache & deploy`.

### Fix `Production Node backend requires secure configuration`

If Render logs show this error:

```text
Production Node backend requires secure configuration for:
LOKSEWA_ADMIN_TOKEN, LOKSEWA_SESSION_SECRET, LOKSEWA_DELTA_SIGNING_SECRET, LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD
```

open `Environment` in the Render service and add these variables:

```bash
NODE_VERSION=22
NODE_ENV=production
LOKSEWA_ENV=production
HOST=0.0.0.0
PORT=8000

LOKSEWA_ADMIN_TOKEN=<random-hex-32-or-longer>
LOKSEWA_SESSION_SECRET=<random-hex-32-or-longer>
LOKSEWA_DELTA_SIGNING_SECRET=<random-hex-32-or-longer>
LOKSEWA_BOOTSTRAP_ADMIN_EMAIL=admin@yourdomain.com
LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD=<strong-password>

NODE_BACKEND_DB_PATH=/opt/render/project/src/backend/runtime/node-backend-db.json
LOKSEWA_TRUST_PROXY=true
LOKSEWA_ENFORCE_HTTPS=true
LOKSEWA_ENABLE_ARCHITECTURE_ROUTES=false
LOKSEWA_SCRAPER_ENABLED=false
LOKSEWA_CORS_ORIGINS=https://loksewa-ai-app.onrender.com
```

Generate secrets locally:

```powershell
$bytes = New-Object byte[] 32; [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes); -join ($bytes | ForEach-Object { $_.ToString("x2") })
```

Run that command three times for `LOKSEWA_ADMIN_TOKEN`, `LOKSEWA_SESSION_SECRET`, and `LOKSEWA_DELTA_SIGNING_SECRET`.

After adding the variables, click `Manual Deploy` -> `Clear build cache & deploy`.

## Option B: Oracle Cloud Always Free VM

Choose this if you want the most complete free backend hosting with persistent disk.

Oracle Cloud Always Free can provide VM compute and block storage in your home region. Capacity can be limited in some regions, so if VM creation fails with capacity errors, try another availability domain or retry later.

### 1. Create The VM

1. Create an Oracle Cloud account.
2. Go to `Compute` -> `Instances` -> `Create instance`.
3. Use an Always Free eligible shape:
   - `VM.Standard.E2.1.Micro`, or
   - `VM.Standard.A1.Flex` within Always Free limits.
4. Choose Ubuntu 22.04 or 24.04.
5. Add your SSH public key.
6. Keep the boot volume within Always Free storage limits.
7. Create the VM.

### 2. Open Firewall Ports

In the VM subnet security list or network security group, allow:

```text
22/tcp   SSH
80/tcp   HTTP
443/tcp  HTTPS
```

Do not expose `8000` publicly if you use Nginx. Keep Node bound to localhost or firewall it.

### 3. Install Runtime

SSH into the VM:

```bash
ssh ubuntu@YOUR_VM_PUBLIC_IP
```

Install packages:

```bash
sudo apt update
sudo apt install -y git curl nginx certbot python3-certbot-nginx

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

node --version
npm --version
```

### 4. Clone And Build

```bash
sudo mkdir -p /opt/loksewa
sudo chown -R ubuntu:ubuntu /opt/loksewa
cd /opt/loksewa

git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git app
cd app/backend
npm ci
npm run build
```

If you also want the admin dashboard served by the backend Docker-style route, build it:

```bash
cd /opt/loksewa/app/admin-dashboard
npm ci
npm run build
```

### 5. Create Production Env File

```bash
sudo mkdir -p /opt/loksewa/data
sudo nano /opt/loksewa/app/backend/.env.production
```

Use:

```bash
NODE_ENV=production
LOKSEWA_ENV=production
HOST=127.0.0.1
PORT=8000

NODE_BACKEND_DB_PATH=/opt/loksewa/data/node-backend-db.json
ADMIN_DIST_PATH=/opt/loksewa/app/admin-dashboard/dist

LOKSEWA_ADMIN_TOKEN=<random-hex>
LOKSEWA_SESSION_SECRET=<random-hex>
LOKSEWA_DELTA_SIGNING_SECRET=<random-hex>
LOKSEWA_BOOTSTRAP_ADMIN_EMAIL=admin@yourdomain.com
LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD=<strong-password>

SESSION_TTL_HOURS=168
LOKSEWA_TRUST_PROXY=true
LOKSEWA_ENFORCE_HTTPS=true
LOKSEWA_ENABLE_ARCHITECTURE_ROUTES=false
LOKSEWA_CORS_ORIGINS=https://api.yourdomain.com,https://yourdomain.com
LOKSEWA_SCRAPER_ENABLED=false
GOOGLE_CLIENT_ID=<google-oauth-web-client-id>
```

### 6. Create systemd Service

```bash
sudo nano /etc/systemd/system/loksewa-backend.service
```

Paste:

```ini
[Unit]
Description=Loksewa AI Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/loksewa/app/backend
EnvironmentFile=/opt/loksewa/app/backend/.env.production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable loksewa-backend
sudo systemctl start loksewa-backend
sudo systemctl status loksewa-backend
```

Check logs:

```bash
journalctl -u loksewa-backend -f
```

### 7. Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/loksewa-backend
```

Paste:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 1m;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/loksewa-backend /etc/nginx/sites-enabled/loksewa-backend
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Add HTTPS

Point your DNS `A` record:

```text
api.yourdomain.com -> YOUR_VM_PUBLIC_IP
```

Then:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

Test:

```bash
curl https://api.yourdomain.com/healthz
curl https://api.yourdomain.com/v1/metadata
```

### 9. Backup The JSON Database

Create backup script:

```bash
sudo nano /opt/loksewa/backup.sh
```

Paste:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/opt/loksewa/backups"
DB_FILE="/opt/loksewa/data/node-backend-db.json"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"

if [ -f "$DB_FILE" ]; then
  cp "$DB_FILE" "$BACKUP_DIR/node-backend-db-$STAMP.json"
  find "$BACKUP_DIR" -type f -name "node-backend-db-*.json" -mtime +14 -delete
fi
```

Enable daily backup:

```bash
chmod +x /opt/loksewa/backup.sh
crontab -e
```

Add:

```cron
0 2 * * * /opt/loksewa/backup.sh
```

## Mobile App API URL

The mobile app is Flutter-only and lives in `apps/mobile`. Do not build the root legacy Kotlin app for normal mobile releases.

Create Flutter platform folders once after installing the Flutter SDK:

```powershell
cd apps/mobile
flutter pub get
flutter create --platforms=android,ios .
```

For Android release APK builds pointed at the hosted backend:

```powershell
cd apps/mobile
flutter build apk --release --dart-define=API_URL=https://api.yourdomain.com/
```

For emulator/debug runs pointed at the hosted backend:

```powershell
cd apps/mobile
flutter run --dart-define=API_URL=https://api.yourdomain.com/
```

The `API_URL` value must end with `/`.

## Production Google Login

The backend supports Google login at:

```text
POST /v1/auth/google
```

For production:

1. Create a Google OAuth client.
2. Add the web client ID to `GOOGLE_CLIENT_ID`.
3. The mobile app must send a real Google ID token to the backend.
4. Keep development profile-login disabled in production by using `LOKSEWA_ENV=production`.

## Quick Verification Checklist

Run these after deployment:

```bash
curl https://api.yourdomain.com/healthz
curl https://api.yourdomain.com/v1/metadata

curl -X POST https://api.yourdomain.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"YOUR_PASSWORD","client_type":"mobile"}'
```

Expected:

- `/healthz` returns status `ok`.
- `/v1/metadata` returns schema and data version.
- Login returns `token`, `user`, and `expires_at`.

## Troubleshooting

### Backend crashes immediately in production

Check required secrets. Production rejects default insecure values:

```bash
journalctl -u loksewa-backend -n 100 --no-pager
```

Make sure these are not default:

```text
LOKSEWA_ADMIN_TOKEN
LOKSEWA_SESSION_SECRET
LOKSEWA_DELTA_SIGNING_SECRET
LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD
```

### Render deploy works but data disappears

That is expected on free web services because local files are ephemeral and persistent disks are not available for free web services. Use Oracle VM or migrate to a durable database.

### Root URL redirects to dashboard

The backend redirects `/` to `/dashboard/`. Use `/healthz` for health checks and `/v1/...` for API checks.

### CORS error from mobile/admin

Set:

```bash
LOKSEWA_CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

Then restart the backend.

### Nginx shows 502

Check Node service:

```bash
sudo systemctl status loksewa-backend
journalctl -u loksewa-backend -n 100 --no-pager
curl http://127.0.0.1:8000/healthz
```

## Sources

- Render Free Web Services: https://render.com/docs/free
- Render Persistent Disks: https://render.com/docs/disks
- Oracle Cloud Always Free Resources: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
