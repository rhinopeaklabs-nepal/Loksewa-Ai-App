PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS database_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE IF NOT EXISTS scan_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    topic_id INTEGER,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES loksewa_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topic_notes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    completion_percentage REAL NOT NULL DEFAULT 0.0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topic_notes(id) ON DELETE CASCADE,
    UNIQUE(user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS ai_lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

INSERT OR REPLACE INTO database_metadata (key, value)
VALUES
    ('schema_version', '2'),
    ('database_kind', 'loksewa_offline_seed');

