PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS database_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    batch_name TEXT NOT NULL,
    source_name TEXT NOT NULL DEFAULT '',
    source_url TEXT NOT NULL DEFAULT '',
    source_license TEXT NOT NULL DEFAULT '',
    verifier TEXT NOT NULL DEFAULT '',
    imported_count INTEGER NOT NULL DEFAULT 0,
    rejected_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'student' CHECK (
        role IN ('student', 'reviewer', 'admin')
    ),
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'disabled')
    ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_app_users_role_status
    ON app_users (role, status);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    client_type TEXT NOT NULL DEFAULT 'mobile' CHECK (
        client_type IN ('mobile', 'admin')
    ),
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TEXT,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user
    ON auth_sessions (user_id, expires_at);

CREATE TABLE IF NOT EXISTS loksewa_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    public_id TEXT NOT NULL UNIQUE,
    question_text TEXT NOT NULL,
    normalized_question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT NOT NULL DEFAULT '',
    syllabus_category TEXT NOT NULL DEFAULT '',
    source_name TEXT NOT NULL DEFAULT '',
    source_url TEXT NOT NULL DEFAULT '',
    source_license TEXT NOT NULL DEFAULT '',
    source_year INTEGER,
    source_page INTEGER,
    exam_level TEXT NOT NULL DEFAULT '',
    exam_type TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'ne',
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (
        verification_status IN ('draft', 'needs_review', 'verified', 'rejected')
    ),
    verifier TEXT NOT NULL DEFAULT '',
    import_batch_id INTEGER,
    data_version INTEGER NOT NULL DEFAULT 1,
    verified_at TEXT CHECK (
        verification_status != 'verified' OR verified_at IS NOT NULL
    ),
    deleted_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (import_batch_id) REFERENCES import_batches(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_loksewa_questions_hash
    ON loksewa_questions (normalized_question_text, option_a, option_b, option_c, option_d);

CREATE INDEX IF NOT EXISTS idx_loksewa_questions_category
    ON loksewa_questions (syllabus_category);

CREATE INDEX IF NOT EXISTS idx_loksewa_questions_source
    ON loksewa_questions (source_name, source_year);

CREATE INDEX IF NOT EXISTS idx_loksewa_questions_version
    ON loksewa_questions (data_version, updated_at);

CREATE INDEX IF NOT EXISTS idx_loksewa_questions_deleted
    ON loksewa_questions (deleted_at);

CREATE TABLE IF NOT EXISTS syllabus_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    normalized_title TEXT NOT NULL,
    content TEXT NOT NULL,
    normalized_content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    source_name TEXT NOT NULL DEFAULT '',
    source_year INTEGER,
    verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS web_scraper_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    start_url TEXT NOT NULL UNIQUE,
    allowed_domain TEXT NOT NULL DEFAULT '',
    syllabus_category TEXT NOT NULL DEFAULT '',
    max_depth INTEGER NOT NULL DEFAULT 1 CHECK (max_depth BETWEEN 0 AND 5),
    max_pages INTEGER NOT NULL DEFAULT 25 CHECK (max_pages BETWEEN 1 AND 250),
    refresh_minutes INTEGER NOT NULL DEFAULT 1440 CHECK (refresh_minutes BETWEEN 5 AND 10080),
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'paused', 'archived')
    ),
    last_crawled_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_web_scraper_sources_status
    ON web_scraper_sources (status, last_crawled_at);

CREATE TABLE IF NOT EXISTS web_scraper_cache (
    url TEXT PRIMARY KEY,
    source_id INTEGER,
    status_code INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL DEFAULT '',
    content_hash TEXT NOT NULL DEFAULT '',
    etag TEXT NOT NULL DEFAULT '',
    last_modified TEXT NOT NULL DEFAULT '',
    text_content TEXT NOT NULL DEFAULT '',
    fetched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    error TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (source_id) REFERENCES web_scraper_sources(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_web_scraper_cache_source
    ON web_scraper_cache (source_id, fetched_at DESC);

CREATE TABLE IF NOT EXISTS web_scraper_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    source_id INTEGER NOT NULL,
    syllabus_entry_id INTEGER,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    syllabus_category TEXT NOT NULL DEFAULT '',
    extracted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES web_scraper_sources(id) ON DELETE CASCADE,
    FOREIGN KEY (syllabus_entry_id) REFERENCES syllabus_entries(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_web_scraper_documents_category
    ON web_scraper_documents (syllabus_category, last_seen_at DESC);

CREATE TABLE IF NOT EXISTS web_scraper_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    source_id INTEGER,
    status TEXT NOT NULL DEFAULT 'running' CHECK (
        status IN ('running', 'completed', 'failed')
    ),
    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at TEXT,
    pages_seen INTEGER NOT NULL DEFAULT 0,
    pages_saved INTEGER NOT NULL DEFAULT 0,
    pages_skipped INTEGER NOT NULL DEFAULT 0,
    message TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (source_id) REFERENCES web_scraper_sources(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_web_scraper_runs_started
    ON web_scraper_runs (started_at DESC);

CREATE TABLE IF NOT EXISTS learning_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'school',
    color TEXT NOT NULL DEFAULT '#635BFF',
    sort_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (
        status IN ('draft', 'published', 'archived')
    ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_learning_subjects_status
    ON learning_subjects (status, sort_order, title);

CREATE TABLE IF NOT EXISTS learning_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    subject_id INTEGER NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_name TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL,
    badge TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    coach_line TEXT NOT NULL DEFAULT '',
    plan_line TEXT NOT NULL DEFAULT '',
    teacher TEXT NOT NULL DEFAULT '',
    lesson_count INTEGER NOT NULL DEFAULT 0 CHECK (lesson_count >= 0),
    duration TEXT NOT NULL DEFAULT '',
    level TEXT NOT NULL DEFAULT '',
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    ai_score INTEGER NOT NULL DEFAULT 0 CHECK (ai_score BETWEEN 0 AND 100),
    icon TEXT NOT NULL DEFAULT 'book',
    color TEXT NOT NULL DEFAULT '#635BFF',
    background TEXT NOT NULL DEFAULT '#EEEAFE',
    sort_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (
        status IN ('draft', 'published', 'archived')
    ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES learning_subjects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learning_courses_subject
    ON learning_courses (subject_id, status, sort_order);

CREATE INDEX IF NOT EXISTS idx_learning_courses_status
    ON learning_courses (status, sort_order, title);

CREATE TABLE IF NOT EXISTS learning_course_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    lessons INTEGER NOT NULL DEFAULT 0 CHECK (lessons >= 0),
    duration TEXT NOT NULL DEFAULT '',
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    locked INTEGER NOT NULL DEFAULT 0 CHECK (locked IN (0, 1)),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES learning_courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learning_course_modules_course
    ON learning_course_modules (course_id, sort_order, id);

CREATE TABLE IF NOT EXISTS learning_course_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    course_id INTEGER,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    duration TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'assignment',
    score_boost INTEGER NOT NULL DEFAULT 0 CHECK (score_boost >= 0),
    next_difficulty TEXT NOT NULL DEFAULT 'Adaptive',
    alert_title TEXT NOT NULL DEFAULT '',
    alert_message TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES learning_courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learning_course_tasks_course
    ON learning_course_tasks (course_id, sort_order, id);

CREATE TABLE IF NOT EXISTS learning_course_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    course_id INTEGER NOT NULL,
    mode TEXT NOT NULL DEFAULT 'Practice',
    prompt TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT NOT NULL DEFAULT '',
    hint TEXT NOT NULL DEFAULT '',
    tags_json TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES learning_courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learning_course_questions_course
    ON learning_course_questions (course_id, sort_order, id);

CREATE TABLE IF NOT EXISTS learning_course_mistakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES learning_courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learning_course_mistakes_course
    ON learning_course_mistakes (course_id, sort_order, id);

CREATE TABLE IF NOT EXISTS scan_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    scanned_text TEXT NOT NULL,
    normalized_scanned_text TEXT NOT NULL,
    matched_question_id INTEGER,
    answer_source TEXT NOT NULL CHECK (
        answer_source IN ('verified_db', 'ai_assisted', 'ai_only', 'uncertain')
    ),
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matched_question_id) REFERENCES loksewa_questions(id)
);

CREATE TABLE IF NOT EXISTS user_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    question_id INTEGER,
    scanned_text TEXT NOT NULL DEFAULT '',
    report_type TEXT NOT NULL CHECK (
        report_type IN ('wrong_answer', 'bad_ocr', 'outdated_fact', 'copyright', 'other')
    ),
    message TEXT NOT NULL DEFAULT '',
    contact TEXT NOT NULL DEFAULT '',
    device_hash TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open' CHECK (
        status IN ('open', 'triaged', 'resolved', 'rejected')
    ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES loksewa_questions(id)
);

CREATE TABLE IF NOT EXISTS mock_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    exam_level TEXT NOT NULL DEFAULT '',
    exam_type TEXT NOT NULL DEFAULT '',
    syllabus_category TEXT NOT NULL DEFAULT '',
    duration_minutes INTEGER NOT NULL DEFAULT 45 CHECK (duration_minutes BETWEEN 1 AND 360),
    total_questions INTEGER NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
    marks_per_correct REAL NOT NULL DEFAULT 1.0 CHECK (marks_per_correct > 0),
    negative_marking_enabled INTEGER NOT NULL DEFAULT 1 CHECK (negative_marking_enabled IN (0, 1)),
    negative_marks_per_wrong REAL NOT NULL DEFAULT 0.2 CHECK (negative_marks_per_wrong >= 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'published', 'archived')
    ),
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES app_users(id)
);

CREATE INDEX IF NOT EXISTS idx_mock_tests_status
    ON mock_tests (status, exam_level, exam_type);

CREATE TABLE IF NOT EXISTS mock_test_questions (
    mock_test_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (mock_test_id, question_id),
    UNIQUE (mock_test_id, position),
    FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES loksewa_questions(id)
);

CREATE INDEX IF NOT EXISTS idx_mock_test_questions_question
    ON mock_test_questions (question_id);

CREATE TABLE IF NOT EXISTS mock_test_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    mock_test_id INTEGER NOT NULL,
    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ends_at TEXT NOT NULL,
    submitted_at TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (
        status IN ('in_progress', 'submitted', 'expired')
    ),
    score REAL NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    wrong_count INTEGER NOT NULL DEFAULT 0,
    unanswered_count INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    total_marks REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
    FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id)
);

CREATE INDEX IF NOT EXISTS idx_mock_test_attempts_user
    ON mock_test_attempts (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_mock_test_attempts_user_mock
    ON mock_test_attempts (user_id, mock_test_id);

CREATE TABLE IF NOT EXISTS mock_test_answers (
    attempt_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct INTEGER NOT NULL DEFAULT 0 CHECK (is_correct IN (0, 1)),
    marks_awarded REAL NOT NULL DEFAULT 0,
    answered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (attempt_id, question_id),
    FOREIGN KEY (attempt_id) REFERENCES mock_test_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES loksewa_questions(id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS fts_questions USING fts5(
    normalized_question_text,
    content = 'loksewa_questions',
    content_rowid = 'id',
    tokenize = 'trigram'
);

CREATE VIRTUAL TABLE IF NOT EXISTS fts_syllabus USING fts5(
    normalized_title,
    normalized_content,
    content = 'syllabus_entries',
    content_rowid = 'id',
    tokenize = 'trigram'
);

CREATE TRIGGER IF NOT EXISTS loksewa_questions_ai
AFTER INSERT ON loksewa_questions
BEGIN
    INSERT INTO fts_questions(rowid, normalized_question_text)
    SELECT new.id, new.normalized_question_text WHERE new.deleted_at IS NULL;
END;

CREATE TRIGGER IF NOT EXISTS loksewa_questions_ad
AFTER DELETE ON loksewa_questions
BEGIN
    INSERT INTO fts_questions(fts_questions, rowid, normalized_question_text)
    VALUES ('delete', old.id, old.normalized_question_text);
END;

CREATE TRIGGER IF NOT EXISTS loksewa_questions_au
AFTER UPDATE ON loksewa_questions
BEGIN
    INSERT INTO fts_questions(fts_questions, rowid, normalized_question_text)
    VALUES ('delete', old.id, old.normalized_question_text);

    INSERT INTO fts_questions(rowid, normalized_question_text)
    SELECT new.id, new.normalized_question_text WHERE new.deleted_at IS NULL;
END;

CREATE TRIGGER IF NOT EXISTS syllabus_entries_ai
AFTER INSERT ON syllabus_entries
BEGIN
    INSERT INTO fts_syllabus(rowid, normalized_title, normalized_content)
    VALUES (new.id, new.normalized_title, new.normalized_content);
END;

CREATE TRIGGER IF NOT EXISTS syllabus_entries_ad
AFTER DELETE ON syllabus_entries
BEGIN
    INSERT INTO fts_syllabus(fts_syllabus, rowid, normalized_title, normalized_content)
    VALUES ('delete', old.id, old.normalized_title, old.normalized_content);
END;

CREATE TRIGGER IF NOT EXISTS syllabus_entries_au
AFTER UPDATE ON syllabus_entries
BEGIN
    INSERT INTO fts_syllabus(fts_syllabus, rowid, normalized_title, normalized_content)
    VALUES ('delete', old.id, old.normalized_title, old.normalized_content);

    INSERT INTO fts_syllabus(rowid, normalized_title, normalized_content)
    VALUES (new.id, new.normalized_title, new.normalized_content);
END;

CREATE TABLE IF NOT EXISTS topic_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    subject_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content_beginner TEXT NOT NULL,
    content_intermediate TEXT NOT NULL,
    content_advanced TEXT NOT NULL,
    revision_notes TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    question_id INTEGER,
    topic_id INTEGER,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES loksewa_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topic_notes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    completion_percentage REAL NOT NULL DEFAULT 0.0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topic_notes(id) ON DELETE CASCADE,
    UNIQUE(user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS ai_lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    question_id INTEGER NOT NULL UNIQUE,
    lesson_simple TEXT NOT NULL,
    lesson_detailed TEXT NOT NULL,
    exam_notes TEXT NOT NULL,
    mnemonic TEXT NOT NULL,
    related_mcqs TEXT NOT NULL,
    revision_summary TEXT NOT NULL,
    flashcards_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES loksewa_questions(id) ON DELETE CASCADE
);

-- Normalized question tags table (replaces JSON in ai_lessons.related_mcqs)
CREATE TABLE IF NOT EXISTS question_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    tag TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tag)
);

CREATE INDEX IF NOT EXISTS idx_question_tags_tag
    ON question_tags (tag);

-- Junction table linking questions to tags
CREATE TABLE IF NOT EXISTS question_tag_links (
    question_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (question_id, tag_id),
    FOREIGN KEY (question_id) REFERENCES loksewa_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES question_tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_question_tag_links_tag
    ON question_tag_links (tag_id);

CREATE TABLE IF NOT EXISTS cache_store (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cache_store_expiry ON cache_store(expires_at);

INSERT OR REPLACE INTO database_metadata (key, value)
VALUES
    ('schema_version', '2'),
    ('database_kind', 'loksewa_offline_seed');
