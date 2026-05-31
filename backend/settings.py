import os
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def env_bool(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    app_name: str = "Loksewa AI API"
    environment: str = os.getenv("LOKSEWA_ENV", "development")
    database_path: Path = Path(os.getenv("LOKSEWA_DB_PATH", ROOT / "runtime" / "loksewa_backend.db"))
    admin_token: str = os.getenv("LOKSEWA_ADMIN_TOKEN", "dev-admin-token-change-me")
    bootstrap_admin_email: str = os.getenv("LOKSEWA_BOOTSTRAP_ADMIN_EMAIL", "admin@loksewa.local")
    bootstrap_admin_password: str = os.getenv("LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD", "dev-admin-password-change-me")
    bootstrap_admin_name: str = os.getenv("LOKSEWA_BOOTSTRAP_ADMIN_NAME", "Loksewa Admin")
    session_secret: str = os.getenv("LOKSEWA_SESSION_SECRET", "dev-session-secret-change-me")
    session_ttl_hours: int = int(os.getenv("LOKSEWA_SESSION_TTL_HOURS", "168"))
    delta_signing_secret: str = os.getenv(
        "LOKSEWA_DELTA_SIGNING_SECRET",
        "dev-delta-signing-secret-change-me",
    )
    # CORS: explicitly list allowed origins — no wildcard, no unrestricted defaults
    cors_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv(
            "LOKSEWA_CORS_ORIGINS",
            # Safe local defaults — replace with your production domain(s) via env var
            "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    )
    high_confidence_threshold: float = float(os.getenv("LOKSEWA_HIGH_CONFIDENCE", "0.42"))
    medium_confidence_threshold: float = float(os.getenv("LOKSEWA_MEDIUM_CONFIDENCE", "0.18"))
    max_search_limit: int = int(os.getenv("LOKSEWA_MAX_SEARCH_LIMIT", "10"))
    rate_limit_per_minute: int = int(os.getenv("LOKSEWA_RATE_LIMIT_PER_MINUTE", "120"))
    scraper_target_urls: tuple[str, ...] = tuple(
        url.strip()
        for url in os.getenv(
            "LOKSEWA_SCRAPER_TARGET_URLS",
            "https://www.psc.gov.np",
        ).split(",")
        if url.strip()
    )
    cache_default_ttl: int = int(os.getenv("LOKSEWA_CACHE_DEFAULT_TTL", "3600"))
    scraper_enabled: bool = env_bool("LOKSEWA_SCRAPER_ENABLED", "true")
    scraper_refresh_interval_seconds: int = int(os.getenv("LOKSEWA_SCRAPER_REFRESH_INTERVAL_SECONDS", "3600"))
    scraper_memory_ttl_seconds: int = int(os.getenv("LOKSEWA_SCRAPER_MEMORY_TTL_SECONDS", "900"))
    scraper_request_timeout_seconds: int = int(os.getenv("LOKSEWA_SCRAPER_REQUEST_TIMEOUT_SECONDS", "12"))
    scraper_max_pages_per_source: int = int(os.getenv("LOKSEWA_SCRAPER_MAX_PAGES_PER_SOURCE", "25"))
    scraper_min_text_chars: int = int(os.getenv("LOKSEWA_SCRAPER_MIN_TEXT_CHARS", "300"))
    scraper_max_content_chars: int = int(os.getenv("LOKSEWA_SCRAPER_MAX_CONTENT_CHARS", "30000"))
    scraper_respect_robots: bool = env_bool("LOKSEWA_SCRAPER_RESPECT_ROBOTS", "true")
    scraper_user_agent: str = os.getenv(
        "LOKSEWA_SCRAPER_USER_AGENT",
        "LoksewaAIStudyBot/0.1 (+https://localhost; educational syllabus updater)",
    )



def validate_settings() -> None:
    """Fail-fast if running in production with default/insecure secrets."""
    if settings.environment == "production":
        production_defaults_used = []
        
        if settings.admin_token in ("", "dev-admin-token-change-me"):
            production_defaults_used.append("LOKSEWA_ADMIN_TOKEN")
        
        if settings.session_secret in ("", "dev-session-secret-change-me"):
            production_defaults_used.append("LOKSEWA_SESSION_SECRET")
        
        if settings.delta_signing_secret in ("", "dev-delta-signing-secret-change-me"):
            production_defaults_used.append("LOKSEWA_DELTA_SIGNING_SECRET")
        
        if production_defaults_used:
            raise RuntimeError(
                f"SECURITY: The following environment variables must be set before deployment in production: "
                f"{', '.join(production_defaults_used)}. "
                f"Do not use default or empty values."
            )
        
        # Reject '*' in CORS origins
        if "*" in settings.cors_origins:
            raise RuntimeError(
                "SECURITY: Wildcard CORS origin (*) is not allowed in production environments. "
                "Specify explicit allowed origins in LOKSEWA_CORS_ORIGINS."
            )
            
        if not settings.cors_origins:
            import logging
            logging.warning(
                "SECURITY: LOKSEWA_CORS_ORIGINS is not set. "
                "CORS is disabled — no cross-origin requests will be allowed. "
                "Set this to your mobile app's domain(s) for production."
            )
            
        # Fail-fast if bootstrap admin is using insecure defaults in production
        insecure_bootstrap = []
        if not settings.bootstrap_admin_email or settings.bootstrap_admin_email == "admin@loksewa.local":
            insecure_bootstrap.append("LOKSEWA_BOOTSTRAP_ADMIN_EMAIL")
        if not settings.bootstrap_admin_password or settings.bootstrap_admin_password == "dev-admin-password-change-me":
            insecure_bootstrap.append("LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD")
        if insecure_bootstrap:
            raise RuntimeError(
                f"SECURITY: The following bootstrap environment variables must be set in production: "
                f"{', '.join(insecure_bootstrap)}. "
                f"Bootstrap admin will not be created without valid credentials."
            )


settings = Settings()
