# Secure Secrets Storage Guide

This document describes how to securely store and manage production secrets for the Loksewa AI application. Proper secrets management is critical for protecting user data, backend credentials, and infrastructure access.

---

## Overview

Loksewa AI uses secrets at multiple layers:
1. **Backend secrets**: Admin tokens, session secrets, database credentials
2. **Signing secrets**: Delta update signing keys
3. **Client secrets**: API keys (if applicable)
4. **Infrastructure secrets**: Cloud credentials, deployment tokens

---

## 1. Never Commit Secrets to Version Control

### Rule

**Never store secrets in source code, configuration files, or version control.**

This is the single most important security rule.

### How to Exclude Secrets

Ensure your `.gitignore` includes common secret file names:

```gitignore
# Environment files with secrets
.env
.env.*
.env.local
.env.production

# Credentials and keys
*.pem
*.key
*.p12
*.keystore
credentials.json
secrets.json

# IDE and OS files
.idea/
.vscode/
.DS_Store
```

### Audit Existing Commits

Before deploying, verify no secrets have been accidentally committed:

```powershell
# Search for common secret patterns in git history
git log --all --source --remotes -S "change-me" -- "*.env"
git log --all -S "LOKSEWA_ADMIN_TOKEN"
git log --all -S "password" -- "*.ts" "*.kt" "*.js"
```

If secrets are found in history, rotate them immediately and remove them from history.

---

## 2. Environment Variables

### Local Development

For local development, use `.env.local` files (excluded from version control):

```powershell
# .env.local (NEVER commit this file)
LOKSEWA_ADMIN_TOKEN="your-generated-secret-here"
LOKSEWA_DELTA_SIGNING_SECRET="your-signing-secret-here"
LOKSEWA_SESSION_SECRET="your-session-secret-here"
LOKSEWA_BOOTSTRAP_ADMIN_EMAIL="admin@yourdomain.com"
LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD="your-secure-admin-password"
DATABASE_URL="postgresql://user:password@host:5432/loksewa"
```

### Loading Environment Variables

The Node backend loads environment files through `backend/src/env.ts` using `dotenv`:

```ts
import { config as loadDotEnv } from "dotenv";

loadDotEnv({ path: ".env.development", override: false, quiet: true });

const adminToken = process.env.LOKSEWA_ADMIN_TOKEN;
const deltaSecret = process.env.LOKSEWA_DELTA_SIGNING_SECRET;
```

### Production Environment

In production, inject secrets as environment variables at deployment time (not from a file):

**Container deployments (Docker/Kubernetes):**
```yaml
# kubernetes secret example
apiVersion: v1
kind: Secret
metadata:
  name: loksewa-secrets
type: Opaque
stringData:
  LOKSEWA_ADMIN_TOKEN: "prod-admin-token"
  LOKSEWA_DELTA_SIGNING_SECRET: "prod-signing-secret"
```

**Systemd service:**
```ini
[Service]
Environment="LOKSEWA_ADMIN_TOKEN=prod-secret"
Environment="LOKSEWA_SESSION_SECRET=prod-session-secret"
```

---

## 3. Secret Management Services

For production deployments, use a dedicated secrets management service.

### Option A: HashiCorp Vault

Best for: Self-hosted deployments, enterprise environments

```powershell
# Store a secret
vault kv put secret/loksewa/admin-token value="your-secret"

# Retrieve at runtime
vault kv get -field=value secret/loksewa/admin-token
```

### Option B: AWS Secrets Manager / Parameter Store

Best for: AWS-hosted deployments

```powershell
# Store using AWS CLI
aws secretsmanager create-secret \
  --name loksewa/admin-token \
  --secret-string "your-secret"

# Retrieve at runtime (backend startup)
aws secretsmanager get-secret-value \
  --secret-id loksewa/admin-token \
  --query SecretString \
  --output text
```

### Option C: Google Cloud Secret Manager

Best for: GCP-hosted deployments

```powershell
# Create secret
gcloud secrets create loksewa-admin-token --data-file=-

# Access in application
gcloud secrets versions access latest --secret=loksewa-admin-token
```

### Option D: Azure Key Vault

Best for: Azure-hosted deployments

```powershell
# Store secret
az keyvault secret set \
  --vault-name "loksewa-vault" \
  --name "admin-token" \
  --value "your-secret"

# Retrieve
az keyvault secret show \
  --vault-name "loksewa-vault" \
  --name "admin-token"
```

---

## 4. Secret Generation

### Generating Secure Tokens

Always use cryptographically secure random generation:

**Node.js:**
```js
import { randomBytes } from "node:crypto";

const adminToken = randomBytes(32).toString("base64url");
const deltaSigningSecret = randomBytes(32).toString("base64url");
const sessionSecret = randomBytes(32).toString("base64url");
```

**PowerShell:**
```powershell
# Generate secure random string
$bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
$secret = [Convert]::ToBase64String($bytes)
```

**Bash/Linux:**
```bash
# Generate secure random string
openssl rand -base64 32
```

### Minimum Secret Lengths

| Secret Type | Minimum Length | Recommendation |
|---|---|---|
| Admin tokens | 32 characters | 64 characters |
| Signing keys | 32 characters | 64 characters |
| Session secrets | 32 characters | 64 characters |
| API keys | 24 characters | 32 characters |

---

## 5. Android/App Secrets

### ProGuard/R8 Obfuscation

Do NOT hardcode secrets in Android code, even with ProGuard. Obfuscation is not encryption.

### Build-Time Injection

Inject secrets at build time using Gradle properties (not committed to VCS):

```gradle
// build.gradle.kts
val keystyPropertiesFile = rootProject.file("keystore.properties")
val keystyProperties = Properties()
keystyProperties.load(fileInputStream)

android {
    defaultConfig {
        buildConfigField("String", "API_BASE_URL", "\"${project.findProperty("apiBaseUrl")}\"")
    }
    signingConfigs {
        create("release") {
            keyAlias = keystyProperties["keyAlias"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystyProperties["storePassword"] as String
            keyPassword = keystyProperties["keyPassword"] as String
        }
    }
}
```

```properties
# keystore.properties (add to .gitignore)
keyAlias=your-key-alias
storeFile=keystore.jks
storePassword=your-store-password
keyPassword=your-key-password
apiBaseUrl=https://api.loksewa.example.com
```

---

## 6. Secret Rotation

### Rotation Schedule

| Secret Type | Rotation Frequency |
|---|---|
| Admin tokens | Every 90 days |
| Signing secrets | Every 6 months |
| Session secrets | On each deployment |
| Database passwords | Every 90 days |

### Rotation Procedure

1. Generate new secret (do not reuse old values)
2. Update secret in secrets management service
3. Deploy new application configuration
4. Verify service health
5. Revoke old secret
6. Document rotation in audit log

### Emergency Rotation

If a secret is compromised:
1. Rotate immediately (do not wait for scheduled rotation)
2. Audit access logs for unauthorized usage
3. Notify affected users if data exposure is suspected
4. Document incident in security log

---

## 7. Monitoring and Auditing

### Access Logging

Log all secret access attempts:

```ts
import { timingSafeEqual } from "node:crypto";

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function verifyAdminToken(token: string, stored: string): boolean {
  const match = safeEqual(token, stored);
  logger.info({ success: match }, "Admin token verification");
  return match;
}
```

### Alerting

Configure alerts for:
- Failed authentication attempts (threshold: 5 in 10 minutes)
- Secret access outside expected maintenance windows
- Unusual geographic access patterns

---

## 8. Development vs Production

### Never Use Production Secrets in Development

| Environment | Secrets Source | Example |
|---|---|---|
| Local development | `.env.local` (not committed) | `admin@loksewa.local` |
| Staging | Secrets service (staging namespace) | Staging-specific tokens |
| Production | Secrets service (production namespace) | Production tokens |

### Separate Namespaces

Use separate secret namespaces for each environment:
- `loksewa/dev/admin-token`
- `loksewa/staging/admin-token`
- `loksewa/prod/admin-token`

---

## 9. Checklist

Before deploying to production:

- [ ] All secrets loaded from environment variables or secrets service
- [ ] `.env` files excluded from version control
- [ ] No hardcoded secrets in source code
- [ ] Secrets meet minimum length requirements
- [ ] Production secrets are different from development secrets
- [ ] Secret rotation schedule documented
- [ ] Monitoring/alerting configured for secret access
- [ ] Backup and recovery procedure tested for secrets service

---

## 10. Quick Reference

### Common Mistakes to Avoid

| Mistake | Risk | Correct Approach |
|---|---|---|
| Committing `.env` file | Secret exposure in git history | Exclude from VCS, generate new secrets |
| Hardcoding in source | Secret in binary distribution | Use environment variables |
| Same secret for dev/prod | Compromised dev = compromised prod | Separate secrets per environment |
| No secret rotation | Stale credentials remain valid | Scheduled rotation, immediate on incident |
| Storing in git notes | Visible to all collaborators | Never store secrets in git |

### Secure Default Template

```env
# Loksewa AI - Production Environment Variables Template
# Copy to .env.local for local development (NEVER commit .env.local)

# Admin Authentication
LOKSEWA_ADMIN_TOKEN=CHANGE_ME_generate_using_openssl_rand_base64_32

# Session Security
LOKSEWA_SESSION_SECRET=CHANGE_ME_generate_using_openssl_rand_base64_32

# Delta Update Signing
LOKSEWA_DELTA_SIGNING_SECRET=CHANGE_ME_generate_using_openssl_rand_base64_32

# Database
DATABASE_URL=postgresql://user:password@host:5432/loksewa

# Admin Bootstrap (change default admin credentials)
LOKSEWA_BOOTSTRAP_ADMIN_EMAIL=CHANGE_ME
LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD=CHANGE_ME_generate_strong_password

# Analytics (opt-in)
ANALYTICS_ENABLED=false
```
