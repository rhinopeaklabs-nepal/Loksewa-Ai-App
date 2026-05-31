# Loksewa AI Security Guide

This document summarizes the security posture of the Loksewa AI application and provides a hardening checklist for production deployment.

---

## Security Architecture Overview

Loksewa AI is designed with a defense-in-depth approach:

```
User Device (Android/Flutter)
├── On-device OCR (ML Kit) — no raw data leaves device
├── Local SQLite database — encrypted at rest if SQLCipher used
└── AI fallback — sandboxed model execution

Backend Server
├── HTTPS/TLS encryption for all communications
├── Admin token authentication
├── Delta file signing
└── Rate limiting and request validation
```

---

## Security Principles

1. **Offline-first**: Core functionality does not require network access
2. **Local processing**: Camera frames are processed on-device
3. **Minimized data collection**: Only necessary data is transmitted
4. **Verified data wins**: AI fallback is a last resort, not the primary path
5. **Defense in depth**: Multiple layers of security controls

---

## Threat Model

### Protected Assets
- User scan data (camera frames, search queries)
- Backend admin credentials
- Question bank integrity (delta files)
- Session tokens

### Threat Vectors
- Unauthorized admin access
- Man-in-the-middle attacks on network communication
- Delta file tampering
- Report injection attacks
- Credential brute force attacks

### Mitigations in Place
| Threat | Mitigation |
|---|---|
| MITM attacks | HTTPS/TLS required in production |
| Admin credential theft | Secure token storage, hashing, rotation |
| Delta file tampering | Cryptographic signing and verification |
| Report injection | Input validation and sanitization |
| Brute force | Rate limiting on authentication endpoints |

---

## Hardening Checklist

Complete this checklist before production deployment.

### Authentication and Authorization

- [ ] **Change default admin credentials**
  - Default development credentials (`admin@loksewa.local` / `LoksewaAdmin@123`) must be replaced with secure values before deployment
  - Set `LOKSEWA_BOOTSTRAP_ADMIN_EMAIL` and `LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD` environment variables

- [ ] **Generate strong admin token**
  - Do not use placeholder values like `change-me`
  - Generate using: `openssl rand -base64 32`
  - Set `LOKSEWA_ADMIN_TOKEN` environment variable

- [ ] **Generate strong session secret**
  - Required for signed session cookies/tokens
  - Generate using: `openssl rand -base64 32`
  - Set `LOKSEWA_SESSION_SECRET` environment variable

- [ ] **Generate delta signing secret**
  - Used to sign question bank update files
  - Generate using: `openssl rand -base64 32`
  - Set `LOKSEWA_DELTA_SIGNING_SECRET` environment variable

### Network Security

- [ ] **Enforce HTTPS**
  - Backend must be accessed over HTTPS in production
  - Redirect HTTP to HTTPS
  - Use TLS 1.2 or higher (disable SSLv3, TLS 1.0, TLS 1.1)

- [ ] **Configure reverse proxy rate limits**
  - Limit authentication endpoint to prevent brute force
  - Recommended: 10 requests per minute per IP for `/v1/auth/login`
  - Limit request body size to prevent DoS

- [ ] **Disable development endpoints in production**
  - Remove or protect `/dashboard/` if not needed
  - Remove or protect `/architecture` endpoint
  - Disable debug mode in production

### Data Protection

- [ ] **Hash device identifiers**
  - Any device identifiers sent to backend must be hashed before storage
  - Use SHA-256 or stronger hash function

- [ ] **Encrypt local database (optional but recommended)**
  - For sensitive deployments, use SQLCipher for local SQLite encryption
  - Configure in Flutter using `sqflite_sqlcipher`

- [ ] **Sign delta updates**
  - Question bank updates must be signed with `LOKSEWA_DELTA_SIGNING_SECRET`
  - Client must verify signature before applying updates

- [ ] **Validate all inputs**
  - Sanitize and validate all user-submitted content (error reports)
  - Do not store unsanitized HTML or scripts

### Application Security

- [ ] **Remove hardcoded secrets**
  - All secrets must be in environment variables, not source code
  - Audit for hardcoded passwords or tokens in codebase

- [ ] **Update dependencies**
  - Run `pip list --outdated` and update vulnerable packages
  - Check for known vulnerabilities: `pip audit` or equivalent
  - Update Node.js packages: `npm audit`

- [ ] **Configure CORS properly**
  - Restrict allowed origins for API endpoints
  - Do not use wildcard `*` in production

- [ ] **Set secure HTTP headers**
  - `Strict-Transport-Security` (HSTS)
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy` (restrict scripts and sources)

### Platform Security (Android)

- [ ] **Use ProGuard/R8**
  - Enable code obfuscation for release builds
  - Do not rely on obfuscation alone for security (secrets belong in env vars)

- [ ] **Sign release builds**
  - Use a secure keystore with strong password
  - Do not share keystore credentials

- [ ] **Declare permissions correctly**
  - Camera permission: only when Quick Scan is used
  - No background location or microphone access

- [ ] **Target current SDK**
  - Use target SDK version required by current Play Store policy

### Monitoring and Response

- [ ] **Enable access logging**
  - Log all admin authentication attempts
  - Log failed authentication for security monitoring

- [ ] **Set up alerting**
  - Alert on multiple failed admin login attempts
  - Alert on unusual API usage patterns

- [ ] **Document incident response**
  - Procedure for secret rotation if compromised
  - Procedure for user notification if data breach suspected
  - Contact information for security issues: `[security-email@example.com]`

---

## Security Configuration Example

### Production Environment Variables

```powershell
# Production secrets (generate with openssl rand -base64 32)
$env:LOKSEWA_ADMIN_TOKEN="your-generated-admin-token"
$env:LOKSEWA_SESSION_SECRET="your-generated-session-secret"
$env:LOKSEWA_DELTA_SIGNING_SECRET="your-generated-signing-secret"

# Bootstrap admin (change from default)
$env:LOKSEWA_BOOTSTRAP_ADMIN_EMAIL="admin@your-domain.com"
$env:LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD="your-secure-password"

# Database
$env:DATABASE_URL="postgresql://user:password@prod-host:5432/loksewa"

# Analytics (disabled by default)
$env:ANALYTICS_ENABLED="false"
```

### Reverse Proxy Configuration (Nginx example)

```nginx
# Rate limit authentication endpoint
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/m;

server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # Admin endpoint protection
    location /v1/auth/login {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://localhost:8000;
    }

    # API proxy
    location /v1/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Size limit
    client_max_body_size 10k;
}
```

---

## Security Testing

### Pre-Deployment Security Tests

1. **Authentication testing**
   - Verify default credentials are rejected
   - Test brute force protection on login endpoint
   - Verify token expiration

2. **Input validation testing**
   - Submit malformed/error reports with special characters
   - Test SQL injection on search endpoints
   - Test XSS in report messages

3. **Network security testing**
   - Verify HTTP redirects to HTTPS
   - Test with self-signed certificates (should fail)
   - Verify TLS version enforcement

4. **Data protection testing**
   - Verify device identifiers are hashed in storage
   - Verify delta file signatures are validated
   - Test local database encryption (if enabled)

### Regular Security Reviews

| Review | Frequency |
|---|---|
| Dependency vulnerability scan | Every deployment |
| Secret rotation verification | Monthly |
| Access log review | Weekly |
| Penetration testing | Quarterly |
| Security policy review | Annually |

---

## Reporting Security Issues

If you discover a security vulnerability in Loksewa AI:

**Email:** `[security-email@example.com]`  
**Subject:** `[Security] Brief description of the issue`

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

We aim to respond within 48 hours and resolve critical issues within 7 days.

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

*Document Version: 1.0*  
*Last Updated: [Date]*