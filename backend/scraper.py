import hashlib
import html
import logging
import re
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from urllib import robotparser
from urllib.error import HTTPError, URLError
from urllib.parse import urldefrag, urljoin, urlparse
from urllib.request import Request, urlopen

import sqlite3

from backend.models import ScraperRunOut, ScraperSourceOut
from backend.repository import (
    create_scraper_run,
    finish_scraper_run,
    get_scraper_cache,
    get_scraper_source,
    list_scraper_sources,
    mark_scraper_source_crawled,
    upsert_scraped_document,
    upsert_scraper_cache,
)
from backend.settings import settings


logger = logging.getLogger(__name__)


@dataclass
class ExtractedPage:
    url: str
    title: str
    text: str
    links: list[str]
    content_hash: str
    status_code: int = 200
    etag: str = ""
    last_modified: str = ""


@dataclass
class MemoryCacheEntry:
    page: ExtractedPage
    expires_at: float


class ReadableHtmlParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.text_parts: list[str] = []
        self.links: list[str] = []
        self._ignored_depth = 0
        self._in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "noscript", "svg", "canvas"}:
            self._ignored_depth += 1
        if tag == "title":
            self._in_title = True
        if tag == "a":
            href = dict(attrs).get("href")
            if href:
                self.links.append(href)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "noscript", "svg", "canvas"} and self._ignored_depth > 0:
            self._ignored_depth -= 1
        if tag == "title":
            self._in_title = False
        if tag in {"p", "br", "li", "tr", "h1", "h2", "h3", "h4", "section", "article"}:
            self.text_parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self._ignored_depth > 0:
            return
        cleaned = data.strip()
        if not cleaned:
            return
        if self._in_title:
            self.title_parts.append(cleaned)
        self.text_parts.append(cleaned)

    @property
    def title(self) -> str:
        return compact_text(" ".join(self.title_parts))[:240]

    @property
    def text(self) -> str:
        return compact_text(" ".join(self.text_parts))


_memory_cache: dict[str, MemoryCacheEntry] = {}
_robots_cache: dict[str, robotparser.RobotFileParser] = {}


def compact_text(value: str) -> str:
    value = html.unescape(value)
    value = re.sub(r"[ \t\r\f\v]+", " ", value)
    value = re.sub(r"\n\s*", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(microsecond=0)


def iso_at(seconds_from_now: int) -> str:
    return (utc_now() + timedelta(seconds=seconds_from_now)).isoformat().replace("+00:00", "Z")


def parse_time(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        try:
            return datetime.strptime(value, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        except ValueError:
            return None


def normalize_url(url: str, base_url: str | None = None) -> str:
    joined = urljoin(base_url or "", url.strip())
    clean, _fragment = urldefrag(joined)
    parsed = urlparse(clean)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return ""
    return parsed._replace(query=parsed.query[:1000]).geturl()


def domain_for(url: str) -> str:
    return urlparse(url).netloc.lower().removeprefix("www.")


def allowed_for_source(url: str, source: ScraperSourceOut) -> bool:
    allowed_domain = (source.allowed_domain or domain_for(source.start_url)).lower().removeprefix("www.")
    current_domain = domain_for(url)
    return current_domain == allowed_domain or current_domain.endswith(f".{allowed_domain}")


def robots_allowed(url: str, user_agent: str) -> bool:
    if not settings.scraper_respect_robots:
        return True
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    parser = _robots_cache.get(robots_url)
    if parser is None:
        parser = robotparser.RobotFileParser()
        parser.set_url(robots_url)
        try:
            parser.read()
        except Exception:
            logger.info("Could not read robots.txt for %s; skipping robots decision", robots_url)
        _robots_cache[robots_url] = parser
    return parser.can_fetch(user_agent, url)


def category_for(source: ScraperSourceOut, page: ExtractedPage) -> str:
    if source.syllabus_category.strip():
        return source.syllabus_category.strip()
    haystack = f"{page.url} {page.title} {page.text[:4000]}".lower()
    scores = {
        "Constitution and Law": ["constitution", "article", "law", "rights", "commission", "act", "regulation"],
        "Public Administration": ["administration", "governance", "policy", "accountability", "public service", "service delivery"],
        "IQ and Reasoning": ["reasoning", "iq", "series", "analogy", "coding", "logic", "direction"],
        "Syllabus Updates": ["syllabus", "curriculum", "course of study", "exam scheme"],
        "Loksewa Updates": ["psc", "loksewa", "vacancy", "notice", "exam", "result", "application"],
        "General Knowledge": ["geography", "history", "science", "current affairs", "general knowledge"],
    }
    best_category = "General Knowledge"
    best_score = 0
    for category, keywords in scores.items():
        score = sum(1 for keyword in keywords if keyword in haystack)
        if score > best_score:
            best_score = score
            best_category = category
    return best_category


def from_db_cache(connection: sqlite3.Connection, url: str) -> ExtractedPage | None:
    row = get_scraper_cache(connection, url)
    if row is None:
        return None
    expires_at = parse_time(row["expires_at"])
    if expires_at is None or expires_at < utc_now():
        return None
    if row["error"]:
        return None
    return ExtractedPage(
        url=row["url"],
        title=row["title"],
        text=row["text_content"],
        links=[],
        content_hash=row["content_hash"],
        status_code=row["status_code"],
        etag=row["etag"],
        last_modified=row["last_modified"],
    )


def parse_html_page(url: str, raw_html: bytes, headers) -> ExtractedPage:
    parser = ReadableHtmlParser()
    parser.feed(raw_html.decode(headers.get_content_charset() or "utf-8", errors="ignore"))
    text = parser.text[: settings.scraper_max_content_chars]
    title = parser.title or urlparse(url).path.rsplit("/", 1)[-1].replace("-", " ").replace("_", " ").strip() or url
    links = [normalize_url(link, url) for link in parser.links]
    links = [link for link in links if link]
    content_hash = hashlib.sha256(f"{title}\n{text}".encode("utf-8")).hexdigest()
    return ExtractedPage(
        url=url,
        title=title[:240],
        text=text,
        links=links,
        content_hash=content_hash,
        status_code=200,
        etag=headers.get("ETag", ""),
        last_modified=headers.get("Last-Modified", ""),
    )


def fetch_page(connection: sqlite3.Connection, source: ScraperSourceOut, url: str) -> ExtractedPage | None:
    cached = _memory_cache.get(url)
    if cached and cached.expires_at > time.time():
        return cached.page

    db_cached = from_db_cache(connection, url)
    if db_cached is not None:
        _memory_cache[url] = MemoryCacheEntry(db_cached, time.time() + settings.scraper_memory_ttl_seconds)
        return db_cached

    if not robots_allowed(url, settings.scraper_user_agent):
        upsert_scraper_cache(
            connection,
            url=url,
            source_id=source.id,
            status_code=403,
            title="",
            content_hash="",
            etag="",
            last_modified="",
            text_content="",
            expires_at=iso_at(settings.cache_default_ttl),
            error="Blocked by robots.txt",
        )
        return None

    request = Request(url, headers={"User-Agent": settings.scraper_user_agent})
    cached_row = get_scraper_cache(connection, url)
    if cached_row is not None:
        if cached_row["etag"]:
            request.add_header("If-None-Match", cached_row["etag"])
        if cached_row["last_modified"]:
            request.add_header("If-Modified-Since", cached_row["last_modified"])

    try:
        with urlopen(request, timeout=settings.scraper_request_timeout_seconds) as response:
            content_type = response.headers.get("Content-Type", "")
            if "text/html" not in content_type and "application/xhtml" not in content_type:
                upsert_scraper_cache(
                    connection,
                    url=url,
                    source_id=source.id,
                    status_code=response.status,
                    title="",
                    content_hash="",
                    etag=response.headers.get("ETag", ""),
                    last_modified=response.headers.get("Last-Modified", ""),
                    text_content="",
                    expires_at=iso_at(settings.cache_default_ttl),
                    error=f"Unsupported content type: {content_type}",
                )
                return None
            page = parse_html_page(url, response.read(), response.headers)
            page.status_code = response.status
    except HTTPError as exc:
        if exc.code == 304 and cached_row is not None:
            page = ExtractedPage(
                url=url,
                title=cached_row["title"],
                text=cached_row["text_content"],
                links=[],
                content_hash=cached_row["content_hash"],
                status_code=304,
                etag=cached_row["etag"],
                last_modified=cached_row["last_modified"],
            )
        else:
            upsert_scraper_cache(
                connection,
                url=url,
                source_id=source.id,
                status_code=exc.code,
                title="",
                content_hash="",
                etag="",
                last_modified="",
                text_content="",
                expires_at=iso_at(settings.cache_default_ttl),
                error=str(exc),
            )
            return None
    except (TimeoutError, URLError, OSError) as exc:
        upsert_scraper_cache(
            connection,
            url=url,
            source_id=source.id,
            status_code=0,
            title="",
            content_hash="",
            etag="",
            last_modified="",
            text_content="",
            expires_at=iso_at(settings.cache_default_ttl),
            error=str(exc),
        )
        return None

    upsert_scraper_cache(
        connection,
        url=url,
        source_id=source.id,
        status_code=page.status_code,
        title=page.title,
        content_hash=page.content_hash,
        etag=page.etag,
        last_modified=page.last_modified,
        text_content=page.text,
        expires_at=iso_at(settings.cache_default_ttl),
    )
    _memory_cache[url] = MemoryCacheEntry(page, time.time() + settings.scraper_memory_ttl_seconds)
    return page


def syllabus_content_for(page: ExtractedPage, category: str) -> str:
    fetched = utc_now().isoformat().replace("+00:00", "Z")
    return compact_text(
        f"{page.text}\n\nSource URL: {page.url}\nSyllabus category: {category}\nFetched at: {fetched}"
    )


def crawl_source(
    connection: sqlite3.Connection,
    source: ScraperSourceOut,
    *,
    max_pages_override: int | None = None,
) -> ScraperRunOut:
    run = create_scraper_run(connection, source.id)
    max_pages = max_pages_override or source.max_pages
    queue: list[tuple[str, int]] = [(normalize_url(source.start_url), 0)]
    visited: set[str] = set()
    pages_seen = 0
    pages_saved = 0
    pages_skipped = 0
    message = "completed"

    try:
        while queue and pages_seen < max_pages:
            url, depth = queue.pop(0)
            if not url or url in visited or not allowed_for_source(url, source):
                pages_skipped += 1
                continue
            visited.add(url)
            pages_seen += 1
            page = fetch_page(connection, source, url)
            if page is None or len(page.text) < settings.scraper_min_text_chars:
                pages_skipped += 1
                continue

            category = category_for(source, page)
            content = syllabus_content_for(page, category)
            _document, changed = upsert_scraped_document(
                connection,
                source_id=source.id,
                url=page.url,
                title=page.title,
                content=content,
                content_hash=page.content_hash,
                syllabus_category=category,
                source_name=source.name,
            )
            pages_saved += 1 if changed else 0

            if depth < source.max_depth:
                for link in page.links:
                    if link not in visited and allowed_for_source(link, source):
                        queue.append((link, depth + 1))

        mark_scraper_source_crawled(connection, source.id)
        finished = finish_scraper_run(
            connection,
            run.id,
            status="completed",
            pages_seen=pages_seen,
            pages_saved=pages_saved,
            pages_skipped=pages_skipped,
            message=message,
        )
        return finished or run
    except Exception as exc:
        logger.exception("Scraper run failed for source %s", source.id)
        finished = finish_scraper_run(
            connection,
            run.id,
            status="failed",
            pages_seen=pages_seen,
            pages_saved=pages_saved,
            pages_skipped=pages_skipped,
            message=str(exc),
        )
        return finished or run


def run_scraper(
    connection: sqlite3.Connection,
    *,
    source_id: int | None = None,
    due_only: bool = False,
    max_pages: int | None = None,
) -> list[ScraperRunOut]:
    if source_id is not None:
        source = get_scraper_source(connection, source_id)
        sources = [] if source is None or source.status != "active" else [source]
    else:
        sources = list_scraper_sources(connection, status="active", due_only=due_only, limit=100)
    return [crawl_source(connection, source, max_pages_override=max_pages) for source in sources]
