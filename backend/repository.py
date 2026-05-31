import hashlib
import json
import sqlite3
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from backend.models import (
    MockAnswerRequest,
    MockAttemptOut,
    MockQuestionOut,
    MockResultAnswer,
    MockSubmitResponse,
    MockTestIn,
    MockTestOut,
    CourseDetailOut,
    CourseIn,
    CourseOut,
    CourseMistakeIn,
    CourseMistakeOut,
    CourseModuleIn,
    CourseModuleOut,
    CourseQuestionIn,
    CourseQuestionOut,
    CourseTaskIn,
    CourseTaskOut,
    QuestionIn,
    QuestionOut,
    ReportOut,
    ScrapedDocumentOut,
    ScraperRunOut,
    ScraperSourceIn,
    ScraperSourceOut,
    SubjectIn,
    SubjectOut,
    SyllabusIn,
    SyllabusOut,
    UserCreate,
    UserOut,
    UserUpdate,
)
from backend.security import hash_password, normalize_email, row_to_user
from backend.text import build_fts_query, normalize_text, trigram_similarity


QUESTION_COLUMNS = """
    id,
    public_id,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
    explanation,
    syllabus_category,
    source_name,
    source_url,
    source_license,
    source_year,
    source_page,
    exam_level,
    exam_type,
    language,
    verification_status,
    verifier,
    data_version,
    verified_at,
    deleted_at,
    created_at,
    updated_at
"""


def row_to_question(row: sqlite3.Row) -> QuestionOut:
    return QuestionOut(
        id=row["id"],
        public_id=row["public_id"],
        question_text=row["question_text"],
        option_a=row["option_a"],
        option_b=row["option_b"],
        option_c=row["option_c"],
        option_d=row["option_d"],
        correct_option=row["correct_option"],
        explanation=row["explanation"],
        syllabus_category=row["syllabus_category"],
        source_name=row["source_name"],
        source_url=row["source_url"],
        source_license=row["source_license"],
        source_year=row["source_year"],
        source_page=row["source_page"],
        exam_level=row["exam_level"],
        exam_type=row["exam_type"],
        language=row["language"],
        verification_status=row["verification_status"],
        verifier=row["verifier"],
        data_version=row["data_version"],
        verified_at=row["verified_at"],
        deleted_at=row["deleted_at"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def public_id_for(question: QuestionIn) -> str:
    payload = "|".join(
        [
            normalize_text(question.question_text),
            normalize_text(question.option_a),
            normalize_text(question.option_b),
            normalize_text(question.option_c),
            normalize_text(question.option_d),
        ]
    )
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:24]
    return f"q_{digest}"


def insert_question(
    connection: sqlite3.Connection,
    question: QuestionIn,
    *,
    data_version: int,
    import_batch_id: int | None = None,
) -> int:
    public_id = public_id_for(question)
    fallback_id = f"q_{uuid4().hex[:24]}"

    verified_at = question.verified_at
    if question.verification_status == "verified" and not verified_at:
        verified_at = utc_iso_now()

    values = {
        "public_id": public_id,
        "question_text": question.question_text,
        "normalized_question_text": normalize_text(question.question_text),
        "option_a": question.option_a,
        "option_b": question.option_b,
        "option_c": question.option_c,
        "option_d": question.option_d,
        "correct_option": question.correct_option,
        "explanation": question.explanation,
        "syllabus_category": question.syllabus_category,
        "source_name": question.source_name,
        "source_url": question.source_url,
        "source_license": question.source_license,
        "source_year": question.source_year,
        "source_page": question.source_page,
        "exam_level": question.exam_level,
        "exam_type": question.exam_type,
        "language": question.language,
        "verification_status": question.verification_status,
        "verifier": question.verifier,
        "import_batch_id": import_batch_id,
        "data_version": data_version,
        "verified_at": verified_at,
        "deleted_at": question.deleted_at,
    }

    try:
        cursor = connection.execute(
            """
            INSERT INTO loksewa_questions (
                public_id,
                question_text,
                normalized_question_text,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                explanation,
                syllabus_category,
                source_name,
                source_url,
                source_license,
                source_year,
                source_page,
                exam_level,
                exam_type,
                language,
                verification_status,
                verifier,
                import_batch_id,
                data_version,
                verified_at,
                deleted_at
            )
            VALUES (
                :public_id,
                :question_text,
                :normalized_question_text,
                :option_a,
                :option_b,
                :option_c,
                :option_d,
                :correct_option,
                :explanation,
                :syllabus_category,
                :source_name,
                :source_url,
                :source_license,
                :source_year,
                :source_page,
                :exam_level,
                :exam_type,
                :language,
                :verification_status,
                :verifier,
                :import_batch_id,
                :data_version,
                :verified_at,
                :deleted_at
            )
            """,
            values,
        )
    except sqlite3.IntegrityError:
        values["public_id"] = fallback_id
        cursor = connection.execute(
            """
            INSERT INTO loksewa_questions (
                public_id,
                question_text,
                normalized_question_text,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                explanation,
                syllabus_category,
                source_name,
                source_url,
                source_license,
                source_year,
                source_page,
                exam_level,
                exam_type,
                language,
                verification_status,
                verifier,
                import_batch_id,
                data_version,
                verified_at,
                deleted_at
            )
            VALUES (
                :public_id,
                :question_text,
                :normalized_question_text,
                :option_a,
                :option_b,
                :option_c,
                :option_d,
                :correct_option,
                :explanation,
                :syllabus_category,
                :source_name,
                :source_url,
                :source_license,
                :source_year,
                :source_page,
                :exam_level,
                :exam_type,
                :language,
                :verification_status,
                :verifier,
                :import_batch_id,
                :data_version,
                :verified_at,
                :deleted_at
            )
            """,
            values,
        )
    return int(cursor.lastrowid)


def get_question(connection: sqlite3.Connection, question_id: int, include_deleted: bool = False) -> QuestionOut | None:
    clause = "" if include_deleted else " AND deleted_at IS NULL"
    row = connection.execute(
        f"SELECT {QUESTION_COLUMNS} FROM loksewa_questions WHERE id = ?{clause}",
        (question_id,),
    ).fetchone()
    return None if row is None else row_to_question(row)


def list_questions(
    connection: sqlite3.Connection,
    *,
    category: str | None = None,
    since_version: int | None = None,
    limit: int = 100,
    include_deleted: bool = False,
) -> list[QuestionOut]:
    clauses = ["verification_status = 'verified'"]
    if not include_deleted:
        clauses.append("deleted_at IS NULL")
    values: list[object] = []
    if category:
        clauses.append("syllabus_category = ?")
        values.append(category)
    if since_version is not None:
        clauses.append("data_version > ?")
        values.append(since_version)
    values.append(limit)
    rows = connection.execute(
        f"""
        SELECT {QUESTION_COLUMNS}
        FROM loksewa_questions
        WHERE {" AND ".join(clauses)}
        ORDER BY data_version ASC, id ASC
        LIMIT ?
        """,
        values,
    ).fetchall()
    return [row_to_question(row) for row in rows]


def search_questions(
    connection: sqlite3.Connection,
    query: str,
    *,
    limit: int,
    include_deleted: bool = False,
) -> list[tuple[QuestionOut, float, float]]:
    normalized = normalize_text(query)
    fts_query = build_fts_query(normalized)
    deleted_clause = "AND q.deleted_at IS NULL" if not include_deleted else ""
    rows = connection.execute(
        f"""
        SELECT
            {", ".join("q." + column.strip() for column in QUESTION_COLUMNS.split(",") if column.strip())},
            bm25(fts_questions) AS bm25_score
        FROM fts_questions
        JOIN loksewa_questions q ON q.id = fts_questions.rowid
        WHERE fts_questions MATCH ?
            AND q.verification_status = 'verified'
            {deleted_clause}
        ORDER BY bm25_score ASC
        LIMIT ?
        """,
        (fts_query, limit),
    ).fetchall()

    results = []
    for row in rows:
        question = row_to_question(row)
        similarity = trigram_similarity(normalized, question.question_text)
        results.append((question, float(row["bm25_score"]), similarity))
    return results


def list_questions_admin(
    connection: sqlite3.Connection,
    *,
    status: str | None = None,
    category: str | None = None,
    query: str | None = None,
    limit: int = 200,
    include_deleted: bool = False,
) -> list[QuestionOut]:
    clauses = ["1 = 1"]
    if not include_deleted:
        clauses.append("deleted_at IS NULL")
    values: list[object] = []
    if status:
        clauses.append("verification_status = ?")
        values.append(status)
    if category:
        clauses.append("syllabus_category = ?")
        values.append(category)
    if query:
        clauses.append("normalized_question_text LIKE ?")
        values.append(f"%{normalize_text(query)}%")
    values.append(limit)
    rows = connection.execute(
        f"""
        SELECT {QUESTION_COLUMNS}
        FROM loksewa_questions
        WHERE {" AND ".join(clauses)}
        ORDER BY updated_at DESC, id DESC
        LIMIT ?
        """,
        values,
    ).fetchall()
    return [row_to_question(row) for row in rows]


def update_question(
    connection: sqlite3.Connection,
    question_id: int,
    question: QuestionIn,
    *,
    data_version: int,
) -> QuestionOut | None:
    verified_at = question.verified_at
    if question.verification_status == "verified" and not verified_at:
        existing = connection.execute("SELECT verified_at FROM loksewa_questions WHERE id = ?", (question_id,)).fetchone()
        if existing and existing["verified_at"]:
            verified_at = existing["verified_at"]
        else:
            verified_at = utc_iso_now()

    cursor = connection.execute(
        """
        UPDATE loksewa_questions
        SET
            question_text = ?,
            normalized_question_text = ?,
            option_a = ?,
            option_b = ?,
            option_c = ?,
            option_d = ?,
            correct_option = ?,
            explanation = ?,
            syllabus_category = ?,
            source_name = ?,
            source_url = ?,
            source_license = ?,
            source_year = ?,
            source_page = ?,
            exam_level = ?,
            exam_type = ?,
            language = ?,
            verification_status = ?,
            verifier = ?,
            data_version = ?,
            verified_at = ?,
            deleted_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            question.question_text,
            normalize_text(question.question_text),
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
            question.correct_option,
            question.explanation,
            question.syllabus_category,
            question.source_name,
            question.source_url,
            question.source_license,
            question.source_year,
            question.source_page,
            question.exam_level,
            question.exam_type,
            question.language,
            question.verification_status,
            question.verifier,
            data_version,
            verified_at,
            question.deleted_at,
            question_id,
        ),
    )
    if cursor.rowcount == 0:
        return None
    return get_question(connection, question_id, include_deleted=True)


def row_to_syllabus(row: sqlite3.Row) -> SyllabusOut:
    return SyllabusOut(
        id=row["id"],
        title=row["title"],
        content=row["content"],
        category=row["category"],
        source_name=row["source_name"],
        source_year=row["source_year"],
        verified_at=row["verified_at"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def list_syllabus(connection: sqlite3.Connection, *, category: str | None = None, limit: int = 200) -> list[SyllabusOut]:
    clauses = ["1 = 1"]
    values: list[object] = []
    if category:
        clauses.append("category = ?")
        values.append(category)
    values.append(limit)
    rows = connection.execute(
        f"""
        SELECT id, title, content, category, source_name, source_year, verified_at, created_at, updated_at
        FROM syllabus_entries
        WHERE {" AND ".join(clauses)}
        ORDER BY updated_at DESC, id DESC
        LIMIT ?
        """,
        values,
    ).fetchall()
    return [row_to_syllabus(row) for row in rows]


def get_syllabus(connection: sqlite3.Connection, syllabus_id: int) -> SyllabusOut | None:
    row = connection.execute(
        """
        SELECT id, title, content, category, source_name, source_year, verified_at, created_at, updated_at
        FROM syllabus_entries
        WHERE id = ?
        """,
        (syllabus_id,),
    ).fetchone()
    return None if row is None else row_to_syllabus(row)


def insert_syllabus(connection: sqlite3.Connection, payload: SyllabusIn) -> int:
    cursor = connection.execute(
        """
        INSERT INTO syllabus_entries (
            title, normalized_title, content, normalized_content, category, source_name, source_year, verified_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.title,
            normalize_text(payload.title),
            payload.content,
            normalize_text(payload.content),
            payload.category,
            payload.source_name,
            payload.source_year,
            payload.verified_at,
        ),
    )
    return int(cursor.lastrowid)


def update_syllabus(connection: sqlite3.Connection, syllabus_id: int, payload: SyllabusIn) -> SyllabusOut | None:
    cursor = connection.execute(
        """
        UPDATE syllabus_entries
        SET
            title = ?,
            normalized_title = ?,
            content = ?,
            normalized_content = ?,
            category = ?,
            source_name = ?,
            source_year = ?,
            verified_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            payload.title,
            normalize_text(payload.title),
            payload.content,
            normalize_text(payload.content),
            payload.category,
            payload.source_name,
            payload.source_year,
            payload.verified_at,
            syllabus_id,
        ),
    )
    if cursor.rowcount == 0:
        return None
    return get_syllabus(connection, syllabus_id)


def delete_syllabus(connection: sqlite3.Connection, syllabus_id: int) -> bool:
    cursor = connection.execute("DELETE FROM syllabus_entries WHERE id = ?", (syllabus_id,))
    return cursor.rowcount > 0


def row_to_scraper_source(row: sqlite3.Row) -> ScraperSourceOut:
    return ScraperSourceOut(
        id=row["id"],
        name=row["name"],
        start_url=row["start_url"],
        allowed_domain=row["allowed_domain"],
        syllabus_category=row["syllabus_category"],
        max_depth=row["max_depth"],
        max_pages=row["max_pages"],
        refresh_minutes=row["refresh_minutes"],
        status=row["status"],
        last_crawled_at=row["last_crawled_at"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def list_scraper_sources(
    connection: sqlite3.Connection,
    *,
    status: str | None = None,
    due_only: bool = False,
    limit: int = 200,
) -> list[ScraperSourceOut]:
    clauses = ["1 = 1"]
    values: list[object] = []
    if status:
        clauses.append("status = ?")
        values.append(status)
    if due_only:
        clauses.append(
            """
            (
                last_crawled_at IS NULL OR
                datetime(last_crawled_at, '+' || refresh_minutes || ' minutes') <= CURRENT_TIMESTAMP
            )
            """
        )
    values.append(limit)
    rows = connection.execute(
        f"""
        SELECT id, name, start_url, allowed_domain, syllabus_category, max_depth,
               max_pages, refresh_minutes, status, last_crawled_at, created_at, updated_at
        FROM web_scraper_sources
        WHERE {" AND ".join(clauses)}
        ORDER BY COALESCE(last_crawled_at, '1970-01-01') ASC, id ASC
        LIMIT ?
        """,
        values,
    ).fetchall()
    return [row_to_scraper_source(row) for row in rows]


def get_scraper_source(connection: sqlite3.Connection, source_id: int) -> ScraperSourceOut | None:
    row = connection.execute(
        """
        SELECT id, name, start_url, allowed_domain, syllabus_category, max_depth,
               max_pages, refresh_minutes, status, last_crawled_at, created_at, updated_at
        FROM web_scraper_sources
        WHERE id = ?
        """,
        (source_id,),
    ).fetchone()
    return None if row is None else row_to_scraper_source(row)


def get_scraper_source_by_url(connection: sqlite3.Connection, start_url: str) -> ScraperSourceOut | None:
    row = connection.execute(
        """
        SELECT id, name, start_url, allowed_domain, syllabus_category, max_depth,
               max_pages, refresh_minutes, status, last_crawled_at, created_at, updated_at
        FROM web_scraper_sources
        WHERE start_url = ?
        """,
        (start_url,),
    ).fetchone()
    return None if row is None else row_to_scraper_source(row)


def create_scraper_source(connection: sqlite3.Connection, payload: ScraperSourceIn) -> ScraperSourceOut:
    cursor = connection.execute(
        """
        INSERT INTO web_scraper_sources (
            name, start_url, allowed_domain, syllabus_category, max_depth, max_pages,
            refresh_minutes, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.name,
            payload.start_url,
            payload.allowed_domain,
            payload.syllabus_category,
            payload.max_depth,
            payload.max_pages,
            payload.refresh_minutes,
            payload.status,
        ),
    )
    return get_scraper_source(connection, int(cursor.lastrowid))


def update_scraper_source(
    connection: sqlite3.Connection,
    source_id: int,
    payload: ScraperSourceIn,
) -> ScraperSourceOut | None:
    cursor = connection.execute(
        """
        UPDATE web_scraper_sources
        SET name = ?, start_url = ?, allowed_domain = ?, syllabus_category = ?,
            max_depth = ?, max_pages = ?, refresh_minutes = ?, status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            payload.name,
            payload.start_url,
            payload.allowed_domain,
            payload.syllabus_category,
            payload.max_depth,
            payload.max_pages,
            payload.refresh_minutes,
            payload.status,
            source_id,
        ),
    )
    if cursor.rowcount == 0:
        return None
    return get_scraper_source(connection, source_id)


def archive_scraper_source(connection: sqlite3.Connection, source_id: int) -> bool:
    cursor = connection.execute(
        "UPDATE web_scraper_sources SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (source_id,),
    )
    return cursor.rowcount > 0


def mark_scraper_source_crawled(connection: sqlite3.Connection, source_id: int) -> None:
    connection.execute(
        """
        UPDATE web_scraper_sources
        SET last_crawled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (source_id,),
    )


def get_scraper_cache(connection: sqlite3.Connection, url: str) -> sqlite3.Row | None:
    return connection.execute(
        """
        SELECT url, source_id, status_code, title, content_hash, etag, last_modified,
               text_content, fetched_at, expires_at, error
        FROM web_scraper_cache
        WHERE url = ?
        """,
        (url,),
    ).fetchone()


def upsert_scraper_cache(
    connection: sqlite3.Connection,
    *,
    url: str,
    source_id: int | None,
    status_code: int,
    title: str,
    content_hash: str,
    etag: str,
    last_modified: str,
    text_content: str,
    expires_at: str,
    error: str = "",
) -> None:
    connection.execute(
        """
        INSERT INTO web_scraper_cache (
            url, source_id, status_code, title, content_hash, etag, last_modified,
            text_content, fetched_at, expires_at, error
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
        ON CONFLICT(url) DO UPDATE SET
            source_id = excluded.source_id,
            status_code = excluded.status_code,
            title = excluded.title,
            content_hash = excluded.content_hash,
            etag = excluded.etag,
            last_modified = excluded.last_modified,
            text_content = excluded.text_content,
            fetched_at = CURRENT_TIMESTAMP,
            expires_at = excluded.expires_at,
            error = excluded.error
        """,
        (
            url,
            source_id,
            status_code,
            title,
            content_hash,
            etag,
            last_modified,
            text_content,
            expires_at,
            error,
        ),
    )


def create_scraper_run(connection: sqlite3.Connection, source_id: int | None = None) -> ScraperRunOut:
    cursor = connection.execute(
        "INSERT INTO web_scraper_runs (source_id, status) VALUES (?, 'running')",
        (source_id,),
    )
    return get_scraper_run(connection, int(cursor.lastrowid))


def finish_scraper_run(
    connection: sqlite3.Connection,
    run_id: int,
    *,
    status: str,
    pages_seen: int,
    pages_saved: int,
    pages_skipped: int,
    message: str,
) -> ScraperRunOut | None:
    connection.execute(
        """
        UPDATE web_scraper_runs
        SET status = ?, finished_at = CURRENT_TIMESTAMP, pages_seen = ?, pages_saved = ?,
            pages_skipped = ?, message = ?
        WHERE id = ?
        """,
        (status, pages_seen, pages_saved, pages_skipped, message, run_id),
    )
    return get_scraper_run(connection, run_id)


def row_to_scraper_run(row: sqlite3.Row) -> ScraperRunOut:
    return ScraperRunOut(
        id=row["id"],
        source_id=row["source_id"],
        status=row["status"],
        started_at=row["started_at"],
        finished_at=row["finished_at"],
        pages_seen=row["pages_seen"],
        pages_saved=row["pages_saved"],
        pages_skipped=row["pages_skipped"],
        message=row["message"],
    )


def get_scraper_run(connection: sqlite3.Connection, run_id: int) -> ScraperRunOut | None:
    row = connection.execute(
        """
        SELECT id, source_id, status, started_at, finished_at, pages_seen, pages_saved,
               pages_skipped, message
        FROM web_scraper_runs
        WHERE id = ?
        """,
        (run_id,),
    ).fetchone()
    return None if row is None else row_to_scraper_run(row)


def list_scraper_runs(connection: sqlite3.Connection, limit: int = 100) -> list[ScraperRunOut]:
    rows = connection.execute(
        """
        SELECT id, source_id, status, started_at, finished_at, pages_seen, pages_saved,
               pages_skipped, message
        FROM web_scraper_runs
        ORDER BY started_at DESC, id DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    return [row_to_scraper_run(row) for row in rows]


def row_to_scraped_document(row: sqlite3.Row) -> ScrapedDocumentOut:
    return ScrapedDocumentOut(
        id=row["id"],
        source_id=row["source_id"],
        syllabus_entry_id=row["syllabus_entry_id"],
        url=row["url"],
        title=row["title"],
        content=row["content"],
        content_hash=row["content_hash"],
        syllabus_category=row["syllabus_category"],
        extracted_at=row["extracted_at"],
        last_seen_at=row["last_seen_at"],
    )


def list_scraped_documents(
    connection: sqlite3.Connection,
    *,
    source_id: int | None = None,
    category: str | None = None,
    limit: int = 200,
) -> list[ScrapedDocumentOut]:
    clauses = ["1 = 1"]
    values: list[object] = []
    if source_id is not None:
        clauses.append("source_id = ?")
        values.append(source_id)
    if category:
        clauses.append("syllabus_category = ?")
        values.append(category)
    values.append(limit)
    rows = connection.execute(
        f"""
        SELECT id, source_id, syllabus_entry_id, url, title, content, content_hash,
               syllabus_category, extracted_at, last_seen_at
        FROM web_scraper_documents
        WHERE {" AND ".join(clauses)}
        ORDER BY last_seen_at DESC, id DESC
        LIMIT ?
        """,
        values,
    ).fetchall()
    return [row_to_scraped_document(row) for row in rows]


def upsert_scraped_document(
    connection: sqlite3.Connection,
    *,
    source_id: int,
    url: str,
    title: str,
    content: str,
    content_hash: str,
    syllabus_category: str,
    source_name: str,
) -> tuple[ScrapedDocumentOut, bool]:
    existing = connection.execute(
        """
        SELECT id, source_id, syllabus_entry_id, url, title, content, content_hash,
               syllabus_category, extracted_at, last_seen_at
        FROM web_scraper_documents
        WHERE url = ?
        """,
        (url,),
    ).fetchone()

    if existing is not None and existing["content_hash"] == content_hash:
        connection.execute(
            "UPDATE web_scraper_documents SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?",
            (existing["id"],),
        )
        return row_to_scraped_document(
            connection.execute(
                """
                SELECT id, source_id, syllabus_entry_id, url, title, content, content_hash,
                       syllabus_category, extracted_at, last_seen_at
                FROM web_scraper_documents
                WHERE id = ?
                """,
                (existing["id"],),
            ).fetchone()
        ), False

    syllabus_payload = SyllabusIn(
        title=title[:400] or "Scraped syllabus update",
        content=content,
        category=syllabus_category,
        source_name=source_name,
        source_year=None,
        verified_at=utc_iso_now(),
    )

    if existing is not None and existing["syllabus_entry_id"]:
        syllabus_entry = update_syllabus(connection, int(existing["syllabus_entry_id"]), syllabus_payload)
        syllabus_id = existing["syllabus_entry_id"] if syllabus_entry else insert_syllabus(connection, syllabus_payload)
        connection.execute(
            """
            UPDATE web_scraper_documents
            SET source_id = ?, syllabus_entry_id = ?, title = ?, content = ?, content_hash = ?,
                syllabus_category = ?, extracted_at = CURRENT_TIMESTAMP, last_seen_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (source_id, syllabus_id, title, content, content_hash, syllabus_category, existing["id"]),
        )
        document_id = int(existing["id"])
    else:
        syllabus_id = insert_syllabus(connection, syllabus_payload)
        cursor = connection.execute(
            """
            INSERT INTO web_scraper_documents (
                source_id, syllabus_entry_id, url, title, content, content_hash, syllabus_category
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(url) DO UPDATE SET
                source_id = excluded.source_id,
                syllabus_entry_id = excluded.syllabus_entry_id,
                title = excluded.title,
                content = excluded.content,
                content_hash = excluded.content_hash,
                syllabus_category = excluded.syllabus_category,
                extracted_at = CURRENT_TIMESTAMP,
                last_seen_at = CURRENT_TIMESTAMP
            """,
            (source_id, syllabus_id, url, title, content, content_hash, syllabus_category),
        )
        document_id = int(cursor.lastrowid or connection.execute("SELECT id FROM web_scraper_documents WHERE url = ?", (url,)).fetchone()["id"])

    row = connection.execute(
        """
        SELECT id, source_id, syllabus_entry_id, url, title, content, content_hash,
               syllabus_category, extracted_at, last_seen_at
        FROM web_scraper_documents
        WHERE id = ?
        """,
        (document_id,),
    ).fetchone()
    return row_to_scraped_document(row), True


def row_to_subject(row: sqlite3.Row) -> SubjectOut:
    return SubjectOut(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        description=row["description"],
        icon=row["icon"],
        color=row["color"],
        sort_order=row["sort_order"],
        status=row["status"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def list_subjects(
    connection: sqlite3.Connection,
    *,
    status: str | None = None,
    limit: int = 200,
) -> list[SubjectOut]:
    clauses = ["1 = 1"]
    values: list[object] = []
    if status:
        clauses.append("status = ?")
        values.append(status)
    values.append(limit)
    rows = connection.execute(
        f"""
        SELECT id, slug, title, description, icon, color, sort_order, status, created_at, updated_at
        FROM learning_subjects
        WHERE {" AND ".join(clauses)}
        ORDER BY sort_order ASC, title ASC, id ASC
        LIMIT ?
        """,
        values,
    ).fetchall()
    return [row_to_subject(row) for row in rows]


def get_subject(connection: sqlite3.Connection, subject_id: int) -> SubjectOut | None:
    row = connection.execute(
        """
        SELECT id, slug, title, description, icon, color, sort_order, status, created_at, updated_at
        FROM learning_subjects
        WHERE id = ?
        """,
        (subject_id,),
    ).fetchone()
    return None if row is None else row_to_subject(row)


def create_subject(connection: sqlite3.Connection, payload: SubjectIn) -> SubjectOut:
    cursor = connection.execute(
        """
        INSERT INTO learning_subjects (slug, title, description, icon, color, sort_order, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.slug,
            payload.title,
            payload.description,
            payload.icon,
            payload.color,
            payload.sort_order,
            payload.status,
        ),
    )
    return get_subject(connection, int(cursor.lastrowid))


def update_subject(connection: sqlite3.Connection, subject_id: int, payload: SubjectIn) -> SubjectOut | None:
    cursor = connection.execute(
        """
        UPDATE learning_subjects
        SET slug = ?, title = ?, description = ?, icon = ?, color = ?, sort_order = ?,
            status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            payload.slug,
            payload.title,
            payload.description,
            payload.icon,
            payload.color,
            payload.sort_order,
            payload.status,
            subject_id,
        ),
    )
    if cursor.rowcount == 0:
        return None
    return get_subject(connection, subject_id)


def delete_subject(connection: sqlite3.Connection, subject_id: int) -> bool:
    cursor = connection.execute(
        "UPDATE learning_subjects SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (subject_id,),
    )
    return cursor.rowcount > 0


COURSE_COLUMNS = """
    c.id,
    c.subject_id,
    s.slug AS subject_slug,
    s.title AS subject_title,
    c.slug,
    c.short_name,
    c.title,
    c.badge,
    c.description,
    c.coach_line,
    c.plan_line,
    c.teacher,
    c.lesson_count,
    c.duration,
    c.level,
    c.progress,
    c.ai_score,
    c.icon,
    c.color,
    c.background,
    c.sort_order,
    c.status,
    c.created_at,
    c.updated_at
"""


def row_to_course(row: sqlite3.Row) -> CourseOut:
    return CourseOut(
        id=row["id"],
        subject_id=row["subject_id"],
        subject_slug=row["subject_slug"],
        subject_title=row["subject_title"],
        slug=row["slug"],
        short_name=row["short_name"],
        title=row["title"],
        badge=row["badge"],
        description=row["description"],
        coach_line=row["coach_line"],
        plan_line=row["plan_line"],
        teacher=row["teacher"],
        lesson_count=row["lesson_count"],
        duration=row["duration"],
        level=row["level"],
        progress=row["progress"],
        ai_score=row["ai_score"],
        icon=row["icon"],
        color=row["color"],
        background=row["background"],
        sort_order=row["sort_order"],
        status=row["status"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def list_courses(
    connection: sqlite3.Connection,
    *,
    subject_id: int | None = None,
    status: str | None = None,
    limit: int = 200,
) -> list[CourseOut]:
    clauses = ["1 = 1"]
    values: list[object] = []
    if subject_id is not None:
        clauses.append("c.subject_id = ?")
        values.append(subject_id)
    if status:
        clauses.append("c.status = ?")
        values.append(status)
    values.append(limit)
    rows = connection.execute(
        f"""
        SELECT {COURSE_COLUMNS}
        FROM learning_courses c
        JOIN learning_subjects s ON s.id = c.subject_id
        WHERE {" AND ".join(clauses)}
        ORDER BY c.sort_order ASC, c.title ASC, c.id ASC
        LIMIT ?
        """,
        values,
    ).fetchall()
    return [row_to_course(row) for row in rows]


def get_course(connection: sqlite3.Connection, course_id: int, *, published_only: bool = False) -> CourseOut | None:
    clause = "AND c.status = 'published'" if published_only else ""
    row = connection.execute(
        f"""
        SELECT {COURSE_COLUMNS}
        FROM learning_courses c
        JOIN learning_subjects s ON s.id = c.subject_id
        WHERE c.id = ? {clause}
        """,
        (course_id,),
    ).fetchone()
    return None if row is None else row_to_course(row)


def get_course_by_slug(connection: sqlite3.Connection, slug: str, *, published_only: bool = False) -> CourseOut | None:
    clause = "AND c.status = 'published'" if published_only else ""
    row = connection.execute(
        f"""
        SELECT {COURSE_COLUMNS}
        FROM learning_courses c
        JOIN learning_subjects s ON s.id = c.subject_id
        WHERE c.slug = ? {clause}
        """,
        (slug,),
    ).fetchone()
    return None if row is None else row_to_course(row)


def get_course_by_identifier(
    connection: sqlite3.Connection,
    identifier: str,
    *,
    published_only: bool = False,
) -> CourseOut | None:
    return get_course(connection, int(identifier), published_only=published_only) if identifier.isdigit() else get_course_by_slug(
        connection,
        identifier,
        published_only=published_only,
    )


def create_course(connection: sqlite3.Connection, payload: CourseIn) -> CourseOut:
    cursor = connection.execute(
        """
        INSERT INTO learning_courses (
            subject_id, slug, short_name, title, badge, description, coach_line, plan_line,
            teacher, lesson_count, duration, level, progress, ai_score, icon, color,
            background, sort_order, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.subject_id,
            payload.slug,
            payload.short_name,
            payload.title,
            payload.badge,
            payload.description,
            payload.coach_line,
            payload.plan_line,
            payload.teacher,
            payload.lesson_count,
            payload.duration,
            payload.level,
            payload.progress,
            payload.ai_score,
            payload.icon,
            payload.color,
            payload.background,
            payload.sort_order,
            payload.status,
        ),
    )
    return get_course(connection, int(cursor.lastrowid))


def update_course(connection: sqlite3.Connection, course_id: int, payload: CourseIn) -> CourseOut | None:
    cursor = connection.execute(
        """
        UPDATE learning_courses
        SET
            subject_id = ?, slug = ?, short_name = ?, title = ?, badge = ?,
            description = ?, coach_line = ?, plan_line = ?, teacher = ?,
            lesson_count = ?, duration = ?, level = ?, progress = ?, ai_score = ?,
            icon = ?, color = ?, background = ?, sort_order = ?, status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            payload.subject_id,
            payload.slug,
            payload.short_name,
            payload.title,
            payload.badge,
            payload.description,
            payload.coach_line,
            payload.plan_line,
            payload.teacher,
            payload.lesson_count,
            payload.duration,
            payload.level,
            payload.progress,
            payload.ai_score,
            payload.icon,
            payload.color,
            payload.background,
            payload.sort_order,
            payload.status,
            course_id,
        ),
    )
    if cursor.rowcount == 0:
        return None
    return get_course(connection, course_id)


def delete_course(connection: sqlite3.Connection, course_id: int) -> bool:
    cursor = connection.execute(
        "UPDATE learning_courses SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (course_id,),
    )
    return cursor.rowcount > 0


def row_to_course_module(row: sqlite3.Row) -> CourseModuleOut:
    return CourseModuleOut(
        id=row["id"],
        course_id=row["course_id"],
        title=row["title"],
        lessons=row["lessons"],
        duration=row["duration"],
        progress=row["progress"],
        locked=bool(row["locked"]),
        sort_order=row["sort_order"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def list_course_modules(connection: sqlite3.Connection, course_id: int) -> list[CourseModuleOut]:
    rows = connection.execute(
        """
        SELECT id, course_id, title, lessons, duration, progress, locked, sort_order, created_at, updated_at
        FROM learning_course_modules
        WHERE course_id = ?
        ORDER BY sort_order ASC, id ASC
        """,
        (course_id,),
    ).fetchall()
    return [row_to_course_module(row) for row in rows]


def get_course_module(connection: sqlite3.Connection, module_id: int) -> CourseModuleOut | None:
    row = connection.execute(
        """
        SELECT id, course_id, title, lessons, duration, progress, locked, sort_order, created_at, updated_at
        FROM learning_course_modules
        WHERE id = ?
        """,
        (module_id,),
    ).fetchone()
    return None if row is None else row_to_course_module(row)


def create_course_module(connection: sqlite3.Connection, course_id: int, payload: CourseModuleIn) -> CourseModuleOut:
    cursor = connection.execute(
        """
        INSERT INTO learning_course_modules (course_id, title, lessons, duration, progress, locked, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            course_id,
            payload.title,
            payload.lessons,
            payload.duration,
            payload.progress,
            int(payload.locked),
            payload.sort_order,
        ),
    )
    return get_course_module(connection, int(cursor.lastrowid))


def update_course_module(connection: sqlite3.Connection, module_id: int, payload: CourseModuleIn) -> CourseModuleOut | None:
    cursor = connection.execute(
        """
        UPDATE learning_course_modules
        SET title = ?, lessons = ?, duration = ?, progress = ?, locked = ?,
            sort_order = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            payload.title,
            payload.lessons,
            payload.duration,
            payload.progress,
            int(payload.locked),
            payload.sort_order,
            module_id,
        ),
    )
    if cursor.rowcount == 0:
        return None
    return get_course_module(connection, module_id)


def delete_course_module(connection: sqlite3.Connection, module_id: int) -> bool:
    cursor = connection.execute("DELETE FROM learning_course_modules WHERE id = ?", (module_id,))
    return cursor.rowcount > 0


def row_to_course_task(row: sqlite3.Row) -> CourseTaskOut:
    return CourseTaskOut(
        id=row["id"],
        course_id=row["course_id"],
        title=row["title"],
        subtitle=row["subtitle"],
        duration=row["duration"],
        icon=row["icon"],
        score_boost=row["score_boost"],
        next_difficulty=row["next_difficulty"],
        alert_title=row["alert_title"],
        alert_message=row["alert_message"],
        sort_order=row["sort_order"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def list_course_tasks(connection: sqlite3.Connection, course_id: int | None = None) -> list[CourseTaskOut]:
    if course_id is None:
        rows = connection.execute(
            """
            SELECT id, course_id, title, subtitle, duration, icon, score_boost, next_difficulty,
                   alert_title, alert_message, sort_order, created_at, updated_at
            FROM learning_course_tasks
            WHERE course_id IS NULL
            ORDER BY sort_order ASC, id ASC
            """
        ).fetchall()
    else:
        rows = connection.execute(
            """
            SELECT id, course_id, title, subtitle, duration, icon, score_boost, next_difficulty,
                   alert_title, alert_message, sort_order, created_at, updated_at
            FROM learning_course_tasks
            WHERE course_id = ? OR course_id IS NULL
            ORDER BY CASE WHEN course_id IS NULL THEN 1 ELSE 0 END, sort_order ASC, id ASC
            """,
            (course_id,),
        ).fetchall()
    return [row_to_course_task(row) for row in rows]


def get_course_task(connection: sqlite3.Connection, task_id: int) -> CourseTaskOut | None:
    row = connection.execute(
        """
        SELECT id, course_id, title, subtitle, duration, icon, score_boost, next_difficulty,
               alert_title, alert_message, sort_order, created_at, updated_at
        FROM learning_course_tasks
        WHERE id = ?
        """,
        (task_id,),
    ).fetchone()
    return None if row is None else row_to_course_task(row)


def create_course_task(connection: sqlite3.Connection, payload: CourseTaskIn) -> CourseTaskOut:
    cursor = connection.execute(
        """
        INSERT INTO learning_course_tasks (
            course_id, title, subtitle, duration, icon, score_boost, next_difficulty,
            alert_title, alert_message, sort_order
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.course_id,
            payload.title,
            payload.subtitle,
            payload.duration,
            payload.icon,
            payload.score_boost,
            payload.next_difficulty,
            payload.alert_title,
            payload.alert_message,
            payload.sort_order,
        ),
    )
    return get_course_task(connection, int(cursor.lastrowid))


def update_course_task(connection: sqlite3.Connection, task_id: int, payload: CourseTaskIn) -> CourseTaskOut | None:
    cursor = connection.execute(
        """
        UPDATE learning_course_tasks
        SET course_id = ?, title = ?, subtitle = ?, duration = ?, icon = ?,
            score_boost = ?, next_difficulty = ?, alert_title = ?, alert_message = ?,
            sort_order = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            payload.course_id,
            payload.title,
            payload.subtitle,
            payload.duration,
            payload.icon,
            payload.score_boost,
            payload.next_difficulty,
            payload.alert_title,
            payload.alert_message,
            payload.sort_order,
            task_id,
        ),
    )
    if cursor.rowcount == 0:
        return None
    return get_course_task(connection, task_id)


def delete_course_task(connection: sqlite3.Connection, task_id: int) -> bool:
    cursor = connection.execute("DELETE FROM learning_course_tasks WHERE id = ?", (task_id,))
    return cursor.rowcount > 0


def row_to_course_question(row: sqlite3.Row) -> CourseQuestionOut:
    try:
        tags = json.loads(row["tags_json"] or "[]")
    except json.JSONDecodeError:
        tags = []
    return CourseQuestionOut(
        id=row["id"],
        course_id=row["course_id"],
        mode=row["mode"],
        prompt=row["prompt"],
        option_a=row["option_a"],
        option_b=row["option_b"],
        option_c=row["option_c"],
        option_d=row["option_d"],
        correct_option=row["correct_option"],
        explanation=row["explanation"],
        hint=row["hint"],
        tags=[str(tag) for tag in tags],
        sort_order=row["sort_order"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def list_course_questions(connection: sqlite3.Connection, course_id: int) -> list[CourseQuestionOut]:
    rows = connection.execute(
        """
        SELECT id, course_id, mode, prompt, option_a, option_b, option_c, option_d,
               correct_option, explanation, hint, tags_json, sort_order, created_at, updated_at
        FROM learning_course_questions
        WHERE course_id = ?
        ORDER BY sort_order ASC, id ASC
        """,
        (course_id,),
    ).fetchall()
    return [row_to_course_question(row) for row in rows]


def get_course_question(connection: sqlite3.Connection, question_id: int) -> CourseQuestionOut | None:
    row = connection.execute(
        """
        SELECT id, course_id, mode, prompt, option_a, option_b, option_c, option_d,
               correct_option, explanation, hint, tags_json, sort_order, created_at, updated_at
        FROM learning_course_questions
        WHERE id = ?
        """,
        (question_id,),
    ).fetchone()
    return None if row is None else row_to_course_question(row)


def create_course_question(connection: sqlite3.Connection, course_id: int, payload: CourseQuestionIn) -> CourseQuestionOut:
    cursor = connection.execute(
        """
        INSERT INTO learning_course_questions (
            course_id, mode, prompt, option_a, option_b, option_c, option_d,
            correct_option, explanation, hint, tags_json, sort_order
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            course_id,
            payload.mode,
            payload.prompt,
            payload.option_a,
            payload.option_b,
            payload.option_c,
            payload.option_d,
            payload.correct_option,
            payload.explanation,
            payload.hint,
            json.dumps(payload.tags),
            payload.sort_order,
        ),
    )
    return get_course_question(connection, int(cursor.lastrowid))


def update_course_question(
    connection: sqlite3.Connection,
    question_id: int,
    payload: CourseQuestionIn,
) -> CourseQuestionOut | None:
    cursor = connection.execute(
        """
        UPDATE learning_course_questions
        SET mode = ?, prompt = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?,
            correct_option = ?, explanation = ?, hint = ?, tags_json = ?,
            sort_order = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            payload.mode,
            payload.prompt,
            payload.option_a,
            payload.option_b,
            payload.option_c,
            payload.option_d,
            payload.correct_option,
            payload.explanation,
            payload.hint,
            json.dumps(payload.tags),
            payload.sort_order,
            question_id,
        ),
    )
    if cursor.rowcount == 0:
        return None
    return get_course_question(connection, question_id)


def delete_course_question(connection: sqlite3.Connection, question_id: int) -> bool:
    cursor = connection.execute("DELETE FROM learning_course_questions WHERE id = ?", (question_id,))
    return cursor.rowcount > 0


def row_to_course_mistake(row: sqlite3.Row) -> CourseMistakeOut:
    return CourseMistakeOut(
        id=row["id"],
        course_id=row["course_id"],
        title=row["title"],
        reason=row["reason"],
        sort_order=row["sort_order"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def list_course_mistakes(connection: sqlite3.Connection, course_id: int) -> list[CourseMistakeOut]:
    rows = connection.execute(
        """
        SELECT id, course_id, title, reason, sort_order, created_at, updated_at
        FROM learning_course_mistakes
        WHERE course_id = ?
        ORDER BY sort_order ASC, id ASC
        """,
        (course_id,),
    ).fetchall()
    return [row_to_course_mistake(row) for row in rows]


def get_course_mistake(connection: sqlite3.Connection, mistake_id: int) -> CourseMistakeOut | None:
    row = connection.execute(
        """
        SELECT id, course_id, title, reason, sort_order, created_at, updated_at
        FROM learning_course_mistakes
        WHERE id = ?
        """,
        (mistake_id,),
    ).fetchone()
    return None if row is None else row_to_course_mistake(row)


def create_course_mistake(connection: sqlite3.Connection, course_id: int, payload: CourseMistakeIn) -> CourseMistakeOut:
    cursor = connection.execute(
        """
        INSERT INTO learning_course_mistakes (course_id, title, reason, sort_order)
        VALUES (?, ?, ?, ?)
        """,
        (course_id, payload.title, payload.reason, payload.sort_order),
    )
    return get_course_mistake(connection, int(cursor.lastrowid))


def update_course_mistake(connection: sqlite3.Connection, mistake_id: int, payload: CourseMistakeIn) -> CourseMistakeOut | None:
    cursor = connection.execute(
        """
        UPDATE learning_course_mistakes
        SET title = ?, reason = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (payload.title, payload.reason, payload.sort_order, mistake_id),
    )
    if cursor.rowcount == 0:
        return None
    return get_course_mistake(connection, mistake_id)


def delete_course_mistake(connection: sqlite3.Connection, mistake_id: int) -> bool:
    cursor = connection.execute("DELETE FROM learning_course_mistakes WHERE id = ?", (mistake_id,))
    return cursor.rowcount > 0


def get_course_detail(
    connection: sqlite3.Connection,
    identifier: str,
    *,
    published_only: bool = False,
) -> CourseDetailOut | None:
    course = get_course_by_identifier(connection, identifier, published_only=published_only)
    if course is None:
        return None
    return CourseDetailOut(
        course=course,
        modules=list_course_modules(connection, course.id),
        tasks=list_course_tasks(connection, course.id),
        questions=list_course_questions(connection, course.id),
        mistakes=list_course_mistakes(connection, course.id),
    )


def list_reports(connection: sqlite3.Connection, *, status: str | None = None, limit: int = 200) -> list[ReportOut]:
    clauses = ["1 = 1"]
    values: list[object] = []
    if status:
        clauses.append("status = ?")
        values.append(status)
    values.append(limit)
    rows = connection.execute(
        f"""
        SELECT id, question_id, scanned_text, report_type, message, contact, status, created_at
        FROM user_reports
        WHERE {" AND ".join(clauses)}
        ORDER BY created_at DESC, id DESC
        LIMIT ?
        """,
        values,
    ).fetchall()
    return [ReportOut(**dict(row)) for row in rows]


def update_report_status(connection: sqlite3.Connection, report_id: int, report_status: str) -> ReportOut | None:
    cursor = connection.execute(
        "UPDATE user_reports SET status = ? WHERE id = ?",
        (report_status, report_id),
    )
    if cursor.rowcount == 0:
        return None
    row = connection.execute(
        "SELECT id, question_id, scanned_text, report_type, message, contact, status, created_at FROM user_reports WHERE id = ?",
        (report_id,),
    ).fetchone()
    return None if row is None else ReportOut(**dict(row))


def delete_report(connection: sqlite3.Connection, report_id: int) -> bool:
    cursor = connection.execute("DELETE FROM user_reports WHERE id = ?", (report_id,))
    return cursor.rowcount > 0


def create_user(connection: sqlite3.Connection, payload: UserCreate) -> UserOut:
    cursor = connection.execute(
        """
        INSERT INTO app_users (email, password_hash, full_name, role, status)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            normalize_email(payload.email),
            hash_password(payload.password),
            payload.full_name,
            payload.role,
            payload.status,
        ),
    )
    return get_user(connection, int(cursor.lastrowid))


def get_user(connection: sqlite3.Connection, user_id: int) -> UserOut | None:
    row = connection.execute("SELECT * FROM app_users WHERE id = ?", (user_id,)).fetchone()
    return None if row is None else row_to_user(row)


def get_user_by_email(connection: sqlite3.Connection, email: str):
    return connection.execute(
        "SELECT * FROM app_users WHERE email = ?",
        (normalize_email(email),),
    ).fetchone()


def list_users(connection: sqlite3.Connection, *, role: str | None = None, status: str | None = None, limit: int = 200) -> list[UserOut]:
    clauses = ["1 = 1"]
    values: list[object] = []
    if role:
        clauses.append("role = ?")
        values.append(role)
    if status:
        clauses.append("status = ?")
        values.append(status)
    values.append(limit)
    rows = connection.execute(
        f"SELECT * FROM app_users WHERE {' AND '.join(clauses)} ORDER BY created_at DESC, id DESC LIMIT ?",
        values,
    ).fetchall()
    return [row_to_user(row) for row in rows]


def update_user(connection: sqlite3.Connection, user_id: int, payload: UserUpdate) -> UserOut | None:
    current = connection.execute("SELECT * FROM app_users WHERE id = ?", (user_id,)).fetchone()
    if current is None:
        return None
    email = normalize_email(payload.email) if payload.email is not None else current["email"]
    full_name = payload.full_name if payload.full_name is not None else current["full_name"]
    role = payload.role if payload.role is not None else current["role"]
    status = payload.status if payload.status is not None else current["status"]
    password_hash = hash_password(payload.password) if payload.password else current["password_hash"]
    connection.execute(
        """
        UPDATE app_users
        SET email = ?, password_hash = ?, full_name = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (email, password_hash, full_name, role, status, user_id),
    )
    return get_user(connection, user_id)


def delete_user(connection: sqlite3.Connection, user_id: int) -> bool:
    cursor = connection.execute("DELETE FROM app_users WHERE id = ?", (user_id,))
    return cursor.rowcount > 0


def row_to_mock_test(connection: sqlite3.Connection, row: sqlite3.Row) -> MockTestOut:
    question_rows = connection.execute(
        "SELECT question_id FROM mock_test_questions WHERE mock_test_id = ? ORDER BY position ASC",
        (row["id"],),
    ).fetchall()
    return MockTestOut(
        id=row["id"],
        title=row["title"],
        description=row["description"],
        exam_level=row["exam_level"],
        exam_type=row["exam_type"],
        syllabus_category=row["syllabus_category"],
        duration_minutes=row["duration_minutes"],
        total_questions=row["total_questions"],
        marks_per_correct=row["marks_per_correct"],
        negative_marking_enabled=bool(row["negative_marking_enabled"]),
        negative_marks_per_wrong=row["negative_marks_per_wrong"],
        status=row["status"],
        created_by=row["created_by"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        question_ids=[int(item["question_id"]) for item in question_rows],
    )


def set_mock_questions(connection: sqlite3.Connection, mock_test_id: int, question_ids: list[int]) -> None:
    connection.execute("DELETE FROM mock_test_questions WHERE mock_test_id = ?", (mock_test_id,))
    for index, question_id in enumerate(question_ids, start=1):
        connection.execute(
            """
            INSERT INTO mock_test_questions (mock_test_id, question_id, position)
            VALUES (?, ?, ?)
            """,
            (mock_test_id, question_id, index),
        )
    connection.execute(
        "UPDATE mock_tests SET total_questions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (len(question_ids), mock_test_id),
    )


def create_mock_test(connection: sqlite3.Connection, payload: MockTestIn, created_by: int | None = None) -> MockTestOut:
    cursor = connection.execute(
        """
        INSERT INTO mock_tests (
            title, description, exam_level, exam_type, syllabus_category, duration_minutes,
            marks_per_correct, negative_marking_enabled, negative_marks_per_wrong, status, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.title,
            payload.description,
            payload.exam_level,
            payload.exam_type,
            payload.syllabus_category,
            payload.duration_minutes,
            payload.marks_per_correct,
            int(payload.negative_marking_enabled),
            payload.negative_marks_per_wrong,
            payload.status,
            created_by,
        ),
    )
    mock_test_id = int(cursor.lastrowid)
    set_mock_questions(connection, mock_test_id, payload.question_ids)
    return get_mock_test(connection, mock_test_id)


def get_mock_test(connection: sqlite3.Connection, mock_test_id: int, *, published_only: bool = False) -> MockTestOut | None:
    clause = "AND status = 'published'" if published_only else ""
    row = connection.execute(
        f"SELECT * FROM mock_tests WHERE id = ? {clause}",
        (mock_test_id,),
    ).fetchone()
    return None if row is None else row_to_mock_test(connection, row)


def list_mock_tests(connection: sqlite3.Connection, *, status: str | None = None, limit: int = 200) -> list[MockTestOut]:
    clauses = ["1 = 1"]
    values: list[object] = []
    if status:
        clauses.append("status = ?")
        values.append(status)
    values.append(limit)
    rows = connection.execute(
        f"SELECT * FROM mock_tests WHERE {' AND '.join(clauses)} ORDER BY updated_at DESC, id DESC LIMIT ?",
        values,
    ).fetchall()
    return [row_to_mock_test(connection, row) for row in rows]


def update_mock_test(connection: sqlite3.Connection, mock_test_id: int, payload: MockTestIn) -> MockTestOut | None:
    cursor = connection.execute(
        """
        UPDATE mock_tests
        SET
            title = ?,
            description = ?,
            exam_level = ?,
            exam_type = ?,
            syllabus_category = ?,
            duration_minutes = ?,
            marks_per_correct = ?,
            negative_marking_enabled = ?,
            negative_marks_per_wrong = ?,
            status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            payload.title,
            payload.description,
            payload.exam_level,
            payload.exam_type,
            payload.syllabus_category,
            payload.duration_minutes,
            payload.marks_per_correct,
            int(payload.negative_marking_enabled),
            payload.negative_marks_per_wrong,
            payload.status,
            mock_test_id,
        ),
    )
    if cursor.rowcount == 0:
        return None
    set_mock_questions(connection, mock_test_id, payload.question_ids)
    return get_mock_test(connection, mock_test_id)


def delete_mock_test(connection: sqlite3.Connection, mock_test_id: int) -> bool:
    cursor = connection.execute(
        "UPDATE mock_tests SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (mock_test_id,),
    )
    return cursor.rowcount > 0


def list_mock_questions(connection: sqlite3.Connection, mock_test_id: int, include_deleted: bool = False) -> list[MockQuestionOut]:
    deleted_clause = " AND q.deleted_at IS NULL" if not include_deleted else ""
    rows = connection.execute(
        f"""
        SELECT
            q.id,
            mtq.position,
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.syllabus_category
        FROM mock_test_questions mtq
        JOIN loksewa_questions q ON q.id = mtq.question_id
        WHERE mtq.mock_test_id = ?{deleted_clause}
        ORDER BY mtq.position ASC
        """,
        (mock_test_id,),
    ).fetchall()
    return [MockQuestionOut(**dict(row)) for row in rows]


def utc_iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def create_mock_attempt(connection: sqlite3.Connection, mock_test_id: int, user_id: int) -> MockAttemptOut | None:
    mock_test = get_mock_test(connection, mock_test_id, published_only=True)
    if mock_test is None or mock_test.total_questions <= 0:
        return None
    ends_at = (datetime.now(timezone.utc) + timedelta(minutes=mock_test.duration_minutes)).replace(microsecond=0)
    total_marks = mock_test.total_questions * mock_test.marks_per_correct
    cursor = connection.execute(
        """
        INSERT INTO mock_test_attempts (
            user_id, mock_test_id, ends_at, total_questions, unanswered_count, total_marks
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            mock_test_id,
            ends_at.isoformat().replace("+00:00", "Z"),
            mock_test.total_questions,
            mock_test.total_questions,
            total_marks,
        ),
    )
    return get_mock_attempt(connection, int(cursor.lastrowid), user_id=user_id, include_questions=True)


def get_mock_attempt(
    connection: sqlite3.Connection,
    attempt_id: int,
    *,
    user_id: int | None = None,
    include_questions: bool = False,
    include_deleted: bool = False,
) -> MockAttemptOut | None:
    clauses = ["id = ?"]
    values: list[object] = [attempt_id]
    if user_id is not None:
        clauses.append("user_id = ?")
        values.append(user_id)
    row = connection.execute(
        f"SELECT * FROM mock_test_attempts WHERE {' AND '.join(clauses)}",
        values,
    ).fetchone()
    if row is None:
        return None
    mock_test = get_mock_test(connection, row["mock_test_id"])
    if mock_test is None:
        return None
    questions = list_mock_questions(connection, mock_test.id, include_deleted=include_deleted) if include_questions else []
    return MockAttemptOut(
        id=row["id"],
        mock_test=mock_test,
        status=row["status"],
        started_at=row["started_at"],
        ends_at=row["ends_at"],
        submitted_at=row["submitted_at"],
        score=row["score"],
        correct_count=row["correct_count"],
        wrong_count=row["wrong_count"],
        unanswered_count=row["unanswered_count"],
        total_questions=row["total_questions"],
        total_marks=row["total_marks"],
        questions=questions,
    )


def answer_mock_question(
    connection: sqlite3.Connection,
    attempt_id: int,
    user_id: int,
    payload: MockAnswerRequest,
    include_deleted: bool = False,
) -> MockAttemptOut | None:
    attempt_row = connection.execute(
        """
        SELECT a.*, mt.marks_per_correct, mt.negative_marking_enabled, mt.negative_marks_per_wrong
        FROM mock_test_attempts a
        JOIN mock_tests mt ON mt.id = a.mock_test_id
        WHERE a.id = ? AND a.user_id = ?
        """,
        (attempt_id, user_id),
    ).fetchone()
    if attempt_row is None or attempt_row["status"] != "in_progress":
        return None
    if datetime.fromisoformat(attempt_row["ends_at"].replace("Z", "+00:00")) < datetime.now(timezone.utc):
        connection.execute("UPDATE mock_test_attempts SET status = 'expired' WHERE id = ?", (attempt_id,))
        return get_mock_attempt(connection, attempt_id, user_id=user_id, include_questions=True, include_deleted=include_deleted)

    deleted_clause = " AND q.deleted_at IS NULL" if not include_deleted else ""
    question_row = connection.execute(
        f"""
        SELECT q.correct_option
        FROM mock_test_questions mtq
        JOIN loksewa_questions q ON q.id = mtq.question_id
        WHERE mtq.mock_test_id = ? AND mtq.question_id = ?{deleted_clause}
        """,
        (attempt_row["mock_test_id"], payload.question_id),
    ).fetchone()
    if question_row is None:
        return None

    is_correct = payload.selected_option == question_row["correct_option"]
    if is_correct:
        marks_awarded = float(attempt_row["marks_per_correct"])
    elif int(attempt_row["negative_marking_enabled"]):
        marks_awarded = -float(attempt_row["negative_marks_per_wrong"])
    else:
        marks_awarded = 0.0

    connection.execute(
        """
        INSERT INTO mock_test_answers (attempt_id, question_id, selected_option, is_correct, marks_awarded, answered_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(attempt_id, question_id) DO UPDATE SET
            selected_option = excluded.selected_option,
            is_correct = excluded.is_correct,
            marks_awarded = excluded.marks_awarded,
            answered_at = CURRENT_TIMESTAMP
        """,
        (attempt_id, payload.question_id, payload.selected_option, int(is_correct), marks_awarded),
    )
    return get_mock_attempt(connection, attempt_id, user_id=user_id, include_questions=True, include_deleted=include_deleted)


def submit_mock_attempt(connection: sqlite3.Connection, attempt_id: int, user_id: int, include_deleted: bool = False) -> MockSubmitResponse | None:
    attempt = get_mock_attempt(connection, attempt_id, user_id=user_id, include_questions=True, include_deleted=include_deleted)
    if attempt is None:
        return None
    if attempt.status not in {"in_progress", "expired"}:
        return build_mock_submit_response(connection, attempt_id, user_id, include_deleted=include_deleted)

    answer_rows = connection.execute(
        "SELECT COUNT(*) AS answered, COALESCE(SUM(is_correct), 0) AS correct, COALESCE(SUM(marks_awarded), 0) AS score FROM mock_test_answers WHERE attempt_id = ?",
        (attempt_id,),
    ).fetchone()
    answered = int(answer_rows["answered"])
    correct = int(answer_rows["correct"])
    wrong = answered - correct
    unanswered = max(attempt.total_questions - answered, 0)
    now = utc_iso_now()
    status = "expired" if datetime.fromisoformat(attempt.ends_at.replace("Z", "+00:00")) < datetime.now(timezone.utc) else "submitted"
    connection.execute(
        """
        UPDATE mock_test_attempts
        SET
            status = ?,
            submitted_at = ?,
            score = ?,
            correct_count = ?,
            wrong_count = ?,
            unanswered_count = ?
        WHERE id = ? AND user_id = ?
        """,
        (status, now, float(answer_rows["score"]), correct, wrong, unanswered, attempt_id, user_id),
    )
    return build_mock_submit_response(connection, attempt_id, user_id, include_deleted=include_deleted)


def build_mock_submit_response(connection: sqlite3.Connection, attempt_id: int, user_id: int, include_deleted: bool = False) -> MockSubmitResponse | None:
    attempt = get_mock_attempt(connection, attempt_id, user_id=user_id, include_questions=True, include_deleted=include_deleted)
    if attempt is None:
        return None
    deleted_clause = " AND q.deleted_at IS NULL" if not include_deleted else ""
    rows = connection.execute(
        f"""
        SELECT
            q.id AS question_id,
            a.selected_option,
            q.correct_option,
            COALESCE(a.is_correct, 0) AS is_correct,
            COALESCE(a.marks_awarded, 0) AS marks_awarded,
            q.explanation
        FROM mock_test_questions mtq
        JOIN loksewa_questions q ON q.id = mtq.question_id
        LEFT JOIN mock_test_answers a ON a.question_id = q.id AND a.attempt_id = ?
        WHERE mtq.mock_test_id = ?{deleted_clause}
        ORDER BY mtq.position ASC
        """,
        (attempt_id, attempt.mock_test.id),
    ).fetchall()
    answers = [
        MockResultAnswer(
            question_id=row["question_id"],
            selected_option=row["selected_option"],
            correct_option=row["correct_option"],
            is_correct=bool(row["is_correct"]),
            marks_awarded=row["marks_awarded"],
            explanation=row["explanation"],
        )
        for row in rows
    ]
    return MockSubmitResponse(attempt=attempt, answers=answers)


def get_user_stats(connection: sqlite3.Connection, user_id: int, include_deleted: bool = False) -> dict:
    """Aggregate user study statistics from mock_test_attempts and mock_test_answers."""
    # Aggregate attempt-level stats
    attempt_row = connection.execute(
        """
        SELECT
            COUNT(*) AS total_taken,
            SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) AS total_completed,
            COALESCE(AVG(CASE WHEN status = 'submitted' THEN score END), 0.0) AS avg_score,
            COALESCE(MAX(CASE WHEN status = 'submitted' THEN score END), 0.0) AS best_score
        FROM mock_test_attempts
        WHERE user_id = ?
        """,
        (user_id,),
    ).fetchone()

    total_taken = int(attempt_row["total_taken"])
    total_completed = int(attempt_row["total_completed"])
    avg_score = float(attempt_row["avg_score"])
    best_score = float(attempt_row["best_score"])

    # Aggregate answer-level stats
    answer_row = connection.execute(
        """
        SELECT
            COUNT(*) AS total_answered,
            COALESCE(SUM(is_correct), 0) AS total_correct
        FROM mock_test_answers
        WHERE attempt_id IN (
            SELECT id FROM mock_test_attempts WHERE user_id = ?
        )
        """,
        (user_id,),
    ).fetchone()

    total_answered = int(answer_row["total_answered"])
    total_correct = int(answer_row["total_correct"])
    correct_rate = (total_correct / total_answered * 100) if total_answered > 0 else 0.0

    # Distinct categories the user has studied
    deleted_clause = " AND q.deleted_at IS NULL" if not include_deleted else ""
    category_rows = connection.execute(
        f"""
        SELECT DISTINCT q.syllabus_category
        FROM mock_test_answers a
        JOIN loksewa_questions q ON q.id = a.question_id
        WHERE a.attempt_id IN (
            SELECT id FROM mock_test_attempts WHERE user_id = ?
        )
        AND q.syllabus_category != ''
        {deleted_clause}
        ORDER BY q.syllabus_category ASC
        """,
        (user_id,),
    ).fetchall()
    categories = [row["syllabus_category"] for row in category_rows]

    return {
        "total_mocks_taken": total_taken,
        "total_mocks_completed": total_completed,
        "average_score": round(avg_score, 2),
        "correct_rate": round(correct_rate, 2),
        "total_questions_answered": total_answered,
        "best_score": round(best_score, 2),
        "categories_studied": categories,
    }


def list_preparation_subjects() -> list[str]:
    return [
        "Constitution",
        "Geography",
        "History",
        "Governance & Public Admin",
        "Science & Technology",
        "Economics",
        "General Knowledge",
    ]


def list_preparation_topics(connection: sqlite3.Connection, subject_id: str, user_id: int) -> list[dict]:
    rows = connection.execute(
        """
        SELECT t.id, t.title, COALESCE(p.completion_percentage, 0.0) AS completion_percentage
        FROM topic_notes t
        LEFT JOIN study_progress p ON p.topic_id = t.id AND p.user_id = ?
        WHERE t.subject_id = ?
        ORDER BY t.id ASC
        """,
        (user_id, subject_id),
    ).fetchall()
    return [dict(row) for row in rows]


def get_preparation_topic(connection: sqlite3.Connection, topic_id: int, user_id: int, include_deleted: bool = False) -> dict | None:
    topic_row = connection.execute(
        "SELECT * FROM topic_notes WHERE id = ?",
        (topic_id,),
    ).fetchone()
    if topic_row is None:
        return None

    # Fetch flashcards
    flashcard_rows = connection.execute(
        "SELECT id, question_id, topic_id, front, back FROM flashcards WHERE topic_id = ?",
        (topic_id,),
    ).fetchall()
    flashcards = [dict(row) for row in flashcard_rows]

    # Fetch questions related to this subject/category
    subject_id = topic_row["subject_id"]
    deleted_clause = " AND deleted_at IS NULL" if not include_deleted else ""
    question_rows = connection.execute(
        f"SELECT {QUESTION_COLUMNS} FROM loksewa_questions WHERE syllabus_category = ? AND verification_status = 'verified'{deleted_clause} LIMIT 10",
        (subject_id,),
    ).fetchall()
    questions = [row_to_question(row) for row in question_rows]

    # Fetch completion progress
    progress_row = connection.execute(
        "SELECT completion_percentage FROM study_progress WHERE user_id = ? AND topic_id = ?",
        (user_id, topic_id),
    ).fetchone()
    completion_percentage = float(progress_row["completion_percentage"]) if progress_row else 0.0

    return {
        "topic": dict(topic_row),
        "flashcards": flashcards,
        "questions": [q.model_dump(mode="json") for q in questions],
        "completion_percentage": completion_percentage,
    }


def save_topic_progress(connection: sqlite3.Connection, user_id: int, topic_id: int, completion_percentage: float) -> None:
    connection.execute(
        """
        INSERT INTO study_progress (user_id, topic_id, completion_percentage, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, topic_id) DO UPDATE SET
            completion_percentage = excluded.completion_percentage,
            updated_at = CURRENT_TIMESTAMP
        """,
        (user_id, topic_id, completion_percentage),
    )


def get_ai_lesson(connection: sqlite3.Connection, question_id: int, include_deleted: bool = False) -> dict | None:
    import json
    # Try fetching cached lesson
    cached_row = connection.execute(
        "SELECT * FROM ai_lessons WHERE question_id = ?",
        (question_id,),
    ).fetchone()
    if cached_row is not None:
        lesson_data = dict(cached_row)
        # Parse JSON lists
        lesson_data["related_mcqs"] = json.loads(lesson_data["related_mcqs"])
        lesson_data["flashcards"] = json.loads(lesson_data["flashcards_json"])
        return lesson_data

    # Otherwise generate dynamically using programmatic AI Learning Engine
    question = get_question(connection, question_id, include_deleted=include_deleted)
    if question is None:
        return None

    # Programs a rich structured study lesson
    text = question.question_text
    correct_opt = question.correct_option
    correct_text = getattr(question, f"option_{correct_opt.lower()}")
    explanation = question.explanation or "This topic forms a core part of the official Loksewa syllabus."
    category = question.syllabus_category or "General study"

    lesson_simple = (
        f"Let's learn about **{category}**.\n\n"
        f"The correct option is **{correct_opt}** ({correct_text}).\n\n"
        f"**Teacher's Guide:** {explanation} Make sure to understand this concept, as related questions frequently appear on the exam."
    )

    lesson_detailed = (
        f"### Detailed Study: {category}\n\n"
        f"This question explores the following topic: *{text}*\n\n"
        f"#### Background & Rationale:\n"
        f"In civil service exams, questions under '{category}' require an exact memory of key facts. "
        f"The verified answer is **{correct_opt}** ({correct_text}). Let's examine the options offered:\n"
        f"- **Option A**: {question.option_a}\n"
        f"- **Option B**: {question.option_b}\n"
        f"- **Option C**: {question.option_c}\n"
        f"- **Option D**: {question.option_d}\n\n"
        f"#### Important Notes:\n"
        f"1. Remember this context clearly for administrative and officer-level tests.\n"
        f"2. Note any dates or figures associated with this concept."
    )

    exam_notes = (
        f"- **Category Focus**: {category}\n"
        f"- **Key Fact**: {correct_text} ({correct_opt})\n"
        f"- **Remember**: Double-check constitution articles and amendments if applicable.\n"
        f"- **Relevance**: Highly relevant for competitive civil service exams."
    )

    mnemonic = (
        f"**Mnemonic (Memory Aid):**\n"
        f"To remember this, associate the key term '{category}' with the answer '{correct_text}' by forming a mental connection or a simple phrase."
    )

    related_mcqs = [
        {
            "question_text": f"Which of the following topics is most relevant when reviewing {category}?",
            "option_a": "Administrative Divisions of Nepal",
            "option_b": "Constitutional Organs and their powers",
            "option_c": "Both A and B",
            "option_d": "None of the above",
            "correct_option": "C",
            "explanation": "Both administrative divisions and constitutional organs represent core parts of general governance study."
        },
        {
            "question_text": f"What is a recommended strategy to secure marks on {category} MCQs?",
            "option_a": "Reviewing past exam papers",
            "option_b": "Active recall and memorizing short revision notes",
            "option_c": "Group studies",
            "option_d": "Both A and B",
            "correct_option": "D",
            "explanation": "Practicing past papers combined with active recall using flashcards gives the highest success rate."
        }
    ]

    revision_summary = (
        f"**Revision Sheet: {category}**\n\n"
        f"- **Key Question**: {text}\n"
        f"- **Official Answer**: {correct_text} ({correct_opt})\n"
        f"- **Source**: {question.source_name or 'Loksewa Preparation Guide'}"
    )

    flashcards = [
        {"front": f"What is the correct answer to: '{text}'?", "back": f"Option {correct_opt}: {correct_text}"},
        {"front": f"Under which category is this studied?", "back": f"{category}"}
    ]

    # Insert into database
    connection.execute(
        """
        INSERT INTO ai_lessons (
            question_id, lesson_simple, lesson_detailed, exam_notes, mnemonic, related_mcqs, revision_summary, flashcards_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            question_id,
            lesson_simple,
            lesson_detailed,
            exam_notes,
            mnemonic,
            json.dumps(related_mcqs, ensure_ascii=False),
            revision_summary,
            json.dumps(flashcards, ensure_ascii=False),
        ),
    )

    # Return structured dict
    return {
        "id": question_id,  # proxy id
        "question_id": question_id,
        "lesson_simple": lesson_simple,
        "lesson_detailed": lesson_detailed,
        "exam_notes": exam_notes,
        "mnemonic": mnemonic,
        "related_mcqs": related_mcqs,
        "revision_summary": revision_summary,
        "flashcards": flashcards,
    }


def ai_tutor_ask(connection: sqlite3.Connection, query: str, include_deleted: bool = False) -> dict:
    normalized = normalize_text(query)
    fts_query = build_fts_query(normalized)

    # 1. Search verified questions
    questions = []
    deleted_clause = " AND q.deleted_at IS NULL" if not include_deleted else ""
    try:
        rows = connection.execute(
            f"""
            SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation, q.source_name
            FROM fts_questions
            JOIN loksewa_questions q ON q.id = fts_questions.rowid
            WHERE fts_questions MATCH ?{deleted_clause}
            LIMIT 2
            """,
            (fts_query,),
        ).fetchall()
        for r in rows:
            questions.append(dict(r))
    except Exception:
        pass

    # 2. Search topic notes
    notes = []
    try:
        rows = connection.execute(
            """
            SELECT id, title, subject_id, content_beginner, content_intermediate, content_advanced, revision_notes
            FROM topic_notes
            WHERE title LIKE ? OR content_intermediate LIKE ?
            LIMIT 2
            """,
            (f"%{normalized}%", f"%{normalized}%"),
        ).fetchall()
        for r in rows:
            notes.append(dict(r))
    except Exception:
        pass

    # Synthesize response
    citations = []
    response_parts = []

    if notes:
        for note in notes:
            citations.append({
                "source_name": f"Topic Notes: {note['title']} ({note['subject_id']})",
                "source_type": "topic",
                "title": note["title"]
            })
            response_parts.append(
                f"### {note['title']} ({note['subject_id']})\n\n"
                f"{note['content_intermediate'][:600]}..."
            )

    if questions:
        for q in questions:
            citations.append({
                "source_name": f"Question Bank: {q['source_name'] or 'Loksewa Seed'}",
                "source_type": "question",
                "title": q["question_text"]
            })
            correct_opt = q["correct_option"]
            correct_text = q[f"option_{correct_opt.lower()}"]
            response_parts.append(
                f"### Question: {q['question_text']}\n\n"
                f"- **Correct Answer**: {correct_opt}. {correct_text}\n"
                f"- **Explanation**: {q['explanation'] or 'No explanation available.'}"
            )

    if not response_parts:
        response_text = (
            "I could not find a specific verified note or question matching your query in the database. "
            "As an AI Tutor focused on verified RAG, I want to ensure absolute accuracy. "
            "Please try asking about topics related to the Constitution (like 'fundamental rights' or 'schedules'), "
            "Geography, or other subjects listed in the Preparation module."
        )
    else:
        response_text = (
            "Based on the verified syllabus, here is the official information:\n\n"
            + "\n\n---\n\n".join(response_parts)
        )

    return {
        "answer": response_text,
        "citations": citations
    }
