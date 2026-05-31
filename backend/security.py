import hashlib
import hmac
import json
import secrets
import threading
import time
from collections import OrderedDict, defaultdict, deque
from datetime import datetime, timedelta, timezone
from typing import Callable

from fastapi import Header, HTTPException, Request, Response, status

from backend.db import get_connection
from backend.models import UserOut
from backend.settings import settings


# =============================================================================
# In-memory rate limiting (development / single-instance)
# =============================================================================
# For production with multiple instances, switch to Redis:
#   redis_client.setex(f"rl:ip:{client_ip}", 60, count)
#   Use a sliding window log: LPUSH timestamp, LTRIM to size, LEN = count
#   Or use a fixed counter: INCR with EXPIRE 60 on first request
#
# Bounded to 10,000 unique IPs and fully thread-safe.
# =============================================================================
class RateLimitStore:
    def __init__(self, max_ips: int = 10000):
        self._lock = threading.Lock()
        self._max_ips = max_ips
        self._store = OrderedDict()

    def check_and_update(self, key: str, limit: int, now: float) -> tuple[bool, int, int]:
        with self._lock:
            if key in self._store:
                bucket = self._store[key]
                self._store.move_to_end(key)
            else:
                if len(self._store) >= self._max_ips:
                    self._store.popitem(last=False)
                bucket = deque(maxlen=int(limit * 1.5))
                self._store[key] = bucket

            # Expire entries older than 60 seconds
            while bucket and now - bucket[0] > 60:
                bucket.popleft()

            if len(bucket) >= limit:
                reset_time = int(bucket[0] + 60) if bucket else int(now + 60)
                return False, 0, reset_time

            bucket.append(now)
            remaining = max(0, limit - len(bucket))
            reset_time = int(bucket[0] + 60) if bucket else int(now + 60)
            return True, remaining, reset_time

    def get_info(self, key: str, limit: int, now: float) -> tuple[int, int]:
        with self._lock:
            if key in self._store:
                bucket = self._store[key]
                while bucket and now - bucket[0] > 60:
                    bucket.popleft()
                remaining = max(0, limit - len(bucket))
                reset_time = int(bucket[0] + 60) if bucket else int(now + 60)
                return remaining, reset_time
            else:
                return limit, int(now + 60)

_rate_limit_store = RateLimitStore()

# =============================================================================
# CSRF token storage (development)
# =============================================================================
# For production, use Redis with TTL matching session lifetime:
#   redis_client.setex(f"csrf:{session_token}", session_ttl_seconds, csrf_token)
#
# Format: session_token -> (csrf_token, created_at)
# Tokens expire after 24 hours regardless of session state
# =============================================================================
_csrf_token_ttl_seconds = 86400  # 24 hours
_csrf_store: dict[str, tuple[str, float]] = {}  # session_token -> (csrf_token, created_at)
_csrf_lock = threading.Lock()


def _clean_csrf_store() -> None:
    """Remove expired CSRF tokens from the in-memory store."""
    now = time.monotonic()
    with _csrf_lock:
        expired = [k for k, (_, created) in _csrf_store.items() if now - created > _csrf_token_ttl_seconds]
        for k in expired:
            del _csrf_store[k]


def require_admin_token(x_admin_token: str | None = Header(default=None)) -> None:
    if not x_admin_token or not hmac.compare_digest(x_admin_token, settings.admin_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token",
        )


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def isoformat(value: datetime) -> str:
    return value.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str, salt: str | None = None) -> str:
    salt_value = salt or secrets.token_hex(16)
    iterations = 260000
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt_value.encode("utf-8"),
        iterations,
    ).hex()
    return f"pbkdf2_sha256${iterations}${salt_value}${digest}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected = stored_hash.split("$", 3)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        int(iterations),
    ).hex()
    return hmac.compare_digest(digest, expected)


def token_hash(token: str) -> str:
    return hashlib.sha256(f"{settings.session_secret}:{token}".encode("utf-8")).hexdigest()


def row_to_user(row) -> UserOut:
    return UserOut(
        id=row["id"],
        email=row["email"],
        full_name=row["full_name"],
        role=row["role"],
        status=row["status"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        last_login_at=row["last_login_at"],
    )


def create_session(connection, user_id: int, client_type: str) -> tuple[str, str, str]:
    """Create a new session. Returns (token, expires_at, csrf_token)."""
    token = secrets.token_urlsafe(32)
    expires_at = isoformat(utc_now() + timedelta(hours=settings.session_ttl_hours))
    csrf_token = secrets.token_urlsafe(32)
    
    connection.execute(
        """
        INSERT INTO auth_sessions (user_id, token_hash, client_type, expires_at)
        VALUES (?, ?, ?, ?)
        """,
        (user_id, token_hash(token), client_type, expires_at),
    )
    connection.execute(
        "UPDATE app_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
        (user_id,),
    )
    
    # Store CSRF token with creation timestamp for TTL tracking
    with _csrf_lock:
        _csrf_store[token] = (csrf_token, time.monotonic())
    
    return token, expires_at, csrf_token


def get_bearer_or_cookie_token(request: Request) -> str:
    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        return authorization.split(" ", 1)[1].strip()
    return request.cookies.get("loksewa_session", "")


def get_current_user(request: Request) -> UserOut:
    token = get_bearer_or_cookie_token(request)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT u.*
            FROM auth_sessions s
            JOIN app_users u ON u.id = s.user_id
            WHERE s.token_hash = ?
                AND s.revoked_at IS NULL
                AND datetime(s.expires_at) > datetime('now')
                AND u.status = 'active'
            """,
            (token_hash(token),),
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
    return row_to_user(row)


def require_admin_user(request: Request) -> UserOut:
    user = get_current_user(request)
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


def validate_csrf_token(request: Request) -> None:
    """Validate CSRF token for state-changing operations (POST, PUT, DELETE, PATCH).
    
    Implements double-submit cookie pattern:
    - Client sends CSRF token in X-CSRF-Token header
    - Client sends CSRF token in loksewa_csrf cookie
    - Server compares cookie and header values to prevent CSRF
    """
    if request.method not in ("POST", "PUT", "DELETE", "PATCH"):
        return
    
    # Exclude login and register routes from CSRF checks
    if request.url.path in (
        "/v1/auth/login",
        "/v1/auth/register",
        "/api/auth/login",
        "/api/auth/register",
    ):
        return

    # CSRF only applies if using cookie-based authentication
    if "loksewa_session" not in request.cookies:
        return

    # Bearer token authenticated requests are immune to CSRF
    auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        return

    csrf_header = request.headers.get("X-CSRF-Token") or request.headers.get("x-csrf-token")
    csrf_cookie = request.cookies.get("loksewa_csrf")

    if not csrf_header or not csrf_cookie:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing from header or cookie.",
        )
    
    # Constant-time comparison to prevent timing attacks
    if not hmac.compare_digest(csrf_header, csrf_cookie):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token mismatch between header and cookie.",
        )
        
    session_token = request.cookies.get("loksewa_session")
    with _csrf_lock:
        entry = _csrf_store.get(session_token)
        if entry is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token expired or not found. Please refresh your session.",
            )
        expected_csrf, created_at = entry
        
        # Check TTL
        if time.monotonic() - created_at > _csrf_token_ttl_seconds:
            del _csrf_store[session_token]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token expired. Please refresh your session.",
            )
            
        if not hmac.compare_digest(csrf_header, expected_csrf):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid CSRF token.",
            )


def add_rate_limit_headers(response: Response, request: Request) -> None:
    """Add rate limit headers to response."""
    forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else ""
    if not client_ip and request.client:
        client_ip = request.client.host
    key = client_ip or "unknown"
    
    now = time.monotonic()
    limit = settings.rate_limit_per_minute
    remaining, reset_time = _rate_limit_store.get_info(key, limit, now)
    
    response.headers["X-RateLimit-Limit"] = str(limit)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset_time)


async def rate_limit(request: Request, response: Response) -> None:
    """Sliding-window rate limiter. Enforces per-IP rate limits using an in-memory store."""
    if settings.rate_limit_per_minute <= 0:
        return

    forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else ""
    if not client_ip and request.client:
        client_ip = request.client.host
    key = client_ip or "unknown"

    now = time.monotonic()
    limit = settings.rate_limit_per_minute
    allowed, remaining, reset_time = _rate_limit_store.check_and_update(key, limit, now)
    
    # Add rate limit headers to the response
    response.headers["X-RateLimit-Limit"] = str(limit)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset_time)

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
            headers={
                "Retry-After": "60",
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time),
            },
        )


def sign_payload(payload: object) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hmac.new(
        settings.delta_signing_secret.encode("utf-8"),
        encoded,
        hashlib.sha256,
    ).hexdigest()


def device_hash(value: str | None) -> str:
    if not value:
        return ""
    return hashlib.sha256(value.encode("utf-8")).hexdigest()
