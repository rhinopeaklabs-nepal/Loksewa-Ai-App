from typing import Literal

from pydantic import BaseModel, Field, model_validator


AnswerSource = Literal["verified_db", "ai_assisted", "ai_only", "uncertain"]
ReportType = Literal["wrong_answer", "bad_ocr", "outdated_fact", "copyright", "other"]
VerificationStatus = Literal["draft", "needs_review", "verified", "rejected"]
UserRole = Literal["student", "reviewer", "admin"]
UserStatus = Literal["active", "disabled"]
SessionClient = Literal["mobile", "admin"]
ReportStatus = Literal["open", "triaged", "resolved", "rejected"]
MockTestStatus = Literal["draft", "published", "archived"]
AttemptStatus = Literal["in_progress", "submitted", "expired"]
LearningStatus = Literal["draft", "published", "archived"]
ScraperSourceStatus = Literal["active", "paused", "archived"]
ScraperRunStatus = Literal["running", "completed", "failed"]


class QuestionIn(BaseModel):
    question_text: str = Field(min_length=3, max_length=4000)
    option_a: str = Field(min_length=1, max_length=1000)
    option_b: str = Field(min_length=1, max_length=1000)
    option_c: str = Field(min_length=1, max_length=1000)
    option_d: str = Field(min_length=1, max_length=1000)
    correct_option: Literal["A", "B", "C", "D"]
    explanation: str = Field(default="", max_length=8000)
    syllabus_category: str = Field(default="", max_length=200)
    source_name: str = Field(default="", max_length=300)
    source_url: str = Field(default="", max_length=1000)
    source_license: str = Field(default="", max_length=300)
    source_year: int | None = None
    source_page: int | None = None
    exam_level: str = Field(default="", max_length=100)
    exam_type: str = Field(default="", max_length=100)
    language: str = Field(default="ne", max_length=16)
    verification_status: VerificationStatus = "needs_review"
    verifier: str = Field(default="", max_length=200)
    verified_at: str | None = None
    deleted_at: str | None = None

    @model_validator(mode="after")
    def require_source_for_verified(self):
        if self.verification_status == "verified":
            if not self.source_name.strip():
                raise ValueError("source_name is required for verified questions")
            if not self.source_license.strip():
                raise ValueError("source_license is required for verified questions")
            if not self.verifier.strip():
                raise ValueError("verifier is required for verified questions")
        return self


class QuestionOut(QuestionIn):
    id: int
    public_id: str
    data_version: int
    created_at: str
    updated_at: str


class UserCreate(BaseModel):
    email: str = Field(min_length=5, max_length=320)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(default="", max_length=200)
    role: UserRole = "student"
    status: UserStatus = "active"


class UserUpdate(BaseModel):
    email: str | None = Field(default=None, min_length=5, max_length=320)
    full_name: str | None = Field(default=None, max_length=200)
    role: UserRole | None = None
    status: UserStatus | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    status: UserStatus
    created_at: str
    updated_at: str
    last_login_at: str | None = None


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=320)
    password: str = Field(min_length=8, max_length=128)
    client_type: SessionClient = "mobile"


class RegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=320)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(default="", max_length=200)


class AuthResponse(BaseModel):
    token: str
    user: UserOut
    expires_at: str


class SyllabusIn(BaseModel):
    title: str = Field(min_length=1, max_length=400)
    content: str = Field(min_length=1, max_length=20000)
    category: str = Field(default="", max_length=200)
    source_name: str = Field(default="", max_length=300)
    source_year: int | None = None
    verified_at: str | None = None


class SyllabusOut(SyllabusIn):
    id: int
    created_at: str
    updated_at: str


class SubjectIn(BaseModel):
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=1200)
    icon: str = Field(default="school", max_length=80)
    color: str = Field(default="#635BFF", max_length=32)
    sort_order: int = 0
    status: LearningStatus = "published"


class SubjectOut(SubjectIn):
    id: int
    created_at: str
    updated_at: str


class CourseIn(BaseModel):
    subject_id: int = Field(ge=1)
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    short_name: str = Field(default="", max_length=40)
    title: str = Field(min_length=1, max_length=220)
    badge: str = Field(default="", max_length=80)
    description: str = Field(default="", max_length=1600)
    coach_line: str = Field(default="", max_length=400)
    plan_line: str = Field(default="", max_length=500)
    teacher: str = Field(default="", max_length=160)
    lesson_count: int = Field(default=0, ge=0)
    duration: str = Field(default="", max_length=80)
    level: str = Field(default="", max_length=80)
    progress: int = Field(default=0, ge=0, le=100)
    ai_score: int = Field(default=0, ge=0, le=100)
    icon: str = Field(default="book", max_length=80)
    color: str = Field(default="#635BFF", max_length=32)
    background: str = Field(default="#EEEAFE", max_length=32)
    sort_order: int = 0
    status: LearningStatus = "published"


class CourseOut(CourseIn):
    id: int
    subject_slug: str
    subject_title: str
    created_at: str
    updated_at: str


class CourseModuleIn(BaseModel):
    title: str = Field(min_length=1, max_length=220)
    lessons: int = Field(default=0, ge=0)
    duration: str = Field(default="", max_length=80)
    progress: int = Field(default=0, ge=0, le=100)
    locked: bool = False
    sort_order: int = 0


class CourseModuleOut(CourseModuleIn):
    id: int
    course_id: int
    created_at: str
    updated_at: str


class CourseTaskIn(BaseModel):
    course_id: int | None = Field(default=None, ge=1)
    title: str = Field(min_length=1, max_length=220)
    subtitle: str = Field(default="", max_length=600)
    duration: str = Field(default="", max_length=80)
    icon: str = Field(default="assignment", max_length=80)
    score_boost: int = Field(default=0, ge=0)
    next_difficulty: str = Field(default="Adaptive", max_length=80)
    alert_title: str = Field(default="", max_length=180)
    alert_message: str = Field(default="", max_length=900)
    sort_order: int = 0


class CourseTaskOut(CourseTaskIn):
    id: int
    created_at: str
    updated_at: str


class CourseQuestionIn(BaseModel):
    mode: str = Field(default="Practice", max_length=120)
    prompt: str = Field(min_length=1, max_length=4000)
    option_a: str = Field(min_length=1, max_length=1000)
    option_b: str = Field(min_length=1, max_length=1000)
    option_c: str = Field(min_length=1, max_length=1000)
    option_d: str = Field(min_length=1, max_length=1000)
    correct_option: Literal["A", "B", "C", "D"] = "A"
    explanation: str = Field(default="", max_length=8000)
    hint: str = Field(default="", max_length=1200)
    tags: list[str] = Field(default_factory=list, max_length=20)
    sort_order: int = 0


class CourseQuestionOut(CourseQuestionIn):
    id: int
    course_id: int
    created_at: str
    updated_at: str


class CourseMistakeIn(BaseModel):
    title: str = Field(min_length=1, max_length=220)
    reason: str = Field(default="", max_length=600)
    sort_order: int = 0


class CourseMistakeOut(CourseMistakeIn):
    id: int
    course_id: int
    created_at: str
    updated_at: str


class CourseDetailOut(BaseModel):
    course: CourseOut
    modules: list[CourseModuleOut] = Field(default_factory=list)
    tasks: list[CourseTaskOut] = Field(default_factory=list)
    questions: list[CourseQuestionOut] = Field(default_factory=list)
    mistakes: list[CourseMistakeOut] = Field(default_factory=list)


class ScraperSourceIn(BaseModel):
    name: str = Field(min_length=1, max_length=240)
    start_url: str = Field(min_length=8, max_length=1000)
    allowed_domain: str = Field(default="", max_length=240)
    syllabus_category: str = Field(default="", max_length=200)
    max_depth: int = Field(default=1, ge=0, le=5)
    max_pages: int = Field(default=25, ge=1, le=250)
    refresh_minutes: int = Field(default=1440, ge=5, le=10080)
    status: ScraperSourceStatus = "active"


class ScraperSourceOut(ScraperSourceIn):
    id: int
    last_crawled_at: str | None = None
    created_at: str
    updated_at: str


class ScrapedDocumentOut(BaseModel):
    id: int
    source_id: int
    syllabus_entry_id: int | None = None
    url: str
    title: str
    content: str
    content_hash: str
    syllabus_category: str
    extracted_at: str
    last_seen_at: str


class ScraperRunOut(BaseModel):
    id: int
    source_id: int | None = None
    status: ScraperRunStatus
    started_at: str
    finished_at: str | None = None
    pages_seen: int
    pages_saved: int
    pages_skipped: int
    message: str


class ScraperRunRequest(BaseModel):
    source_id: int | None = Field(default=None, ge=1)
    max_pages: int | None = Field(default=None, ge=1, le=250)


class ReportOut(BaseModel):
    id: int
    question_id: int | None = None
    scanned_text: str
    report_type: ReportType
    message: str
    contact: str
    status: ReportStatus
    created_at: str


class ReportUpdateRequest(BaseModel):
    status: ReportStatus


class MockTestIn(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    description: str = Field(default="", max_length=2000)
    exam_level: str = Field(default="", max_length=100)
    exam_type: str = Field(default="", max_length=100)
    syllabus_category: str = Field(default="", max_length=200)
    duration_minutes: int = Field(default=45, ge=1, le=360)
    marks_per_correct: float = Field(default=1.0, gt=0)
    negative_marking_enabled: bool = True
    negative_marks_per_wrong: float = Field(default=0.2, ge=0)
    status: MockTestStatus = "draft"
    question_ids: list[int] = Field(default_factory=list, max_length=500)


class MockTestOut(BaseModel):
    id: int
    title: str
    description: str
    exam_level: str
    exam_type: str
    syllabus_category: str
    duration_minutes: int
    total_questions: int
    marks_per_correct: float
    negative_marking_enabled: bool
    negative_marks_per_wrong: float
    status: MockTestStatus
    created_by: int | None = None
    created_at: str
    updated_at: str
    question_ids: list[int] = Field(default_factory=list)


class MockQuestionOut(BaseModel):
    id: int
    position: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    syllabus_category: str


class MockAttemptOut(BaseModel):
    id: int
    mock_test: MockTestOut
    status: AttemptStatus
    started_at: str
    ends_at: str
    submitted_at: str | None = None
    score: float
    correct_count: int
    wrong_count: int
    unanswered_count: int
    total_questions: int
    total_marks: float
    questions: list[MockQuestionOut] = Field(default_factory=list)


class MockAnswerRequest(BaseModel):
    question_id: int
    selected_option: Literal["A", "B", "C", "D"]


class MockResultAnswer(BaseModel):
    question_id: int
    selected_option: str | None = None
    correct_option: Literal["A", "B", "C", "D"]
    is_correct: bool
    marks_awarded: float
    explanation: str


class MockSubmitResponse(BaseModel):
    attempt: MockAttemptOut
    answers: list[MockResultAnswer]


class SearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=4000)
    limit: int = Field(default=3, ge=1, le=10)
    allow_ai_fallback: bool = True


class SearchMatch(BaseModel):
    question: QuestionOut
    bm25_score: float
    similarity: float


class SearchResponse(BaseModel):
    answer_source: AnswerSource
    threshold_reason: str
    query: str
    matches: list[SearchMatch]
    disclaimer: str | None = None


class ImportBatchRequest(BaseModel):
    batch_name: str = Field(min_length=1, max_length=300)
    source_name: str = Field(default="", max_length=300)
    source_url: str = Field(default="", max_length=1000)
    source_license: str = Field(default="", max_length=300)
    verifier: str = Field(default="", max_length=200)
    questions: list[QuestionIn] = Field(min_length=1, max_length=5000)


class ImportBatchResponse(BaseModel):
    batch_id: int
    imported_count: int
    rejected_count: int
    data_version: int


class ReportRequest(BaseModel):
    question_id: int | None = None
    scanned_text: str = Field(default="", max_length=4000)
    report_type: ReportType
    message: str = Field(default="", max_length=2000)
    contact: str = Field(default="", max_length=300)
    device_id: str = Field(default="", max_length=300)


class ReportResponse(BaseModel):
    report_id: int
    status: str


class ReviewUpdateRequest(BaseModel):
    verification_status: VerificationStatus
    source_name: str = Field(default="", max_length=300)
    source_url: str = Field(default="", max_length=1000)
    source_license: str = Field(default="", max_length=300)
    verifier: str = Field(default="", max_length=200)
    verified_at: str | None = None

    @model_validator(mode="after")
    def require_verified_metadata(self):
        if self.verification_status == "verified":
            if not self.source_name.strip():
                raise ValueError("source_name is required to verify a question")
            if not self.source_license.strip():
                raise ValueError("source_license is required to verify a question")
            if not self.verifier.strip():
                raise ValueError("verifier is required to verify a question")
        return self


class DeltaResponse(BaseModel):
    from_version: int
    to_version: int
    questions: list[QuestionOut]
    signature: str


class UserStats(BaseModel):
    total_mocks_taken: int = 0
    total_mocks_completed: int = 0
    average_score: float = 0.0
    correct_rate: float = 0.0
    total_questions_answered: int = 0
    best_score: float = 0.0
    categories_studied: list[str] = []


class TopicNotesOut(BaseModel):
    id: int
    subject_id: str
    title: str
    content_beginner: str
    content_intermediate: str
    content_advanced: str
    revision_notes: str
    verified: int


class FlashcardOut(BaseModel):
    id: int | None = None
    question_id: int | None = None
    topic_id: int | None = None
    front: str
    back: str


class TopicDetailResponse(BaseModel):
    topic: TopicNotesOut
    flashcards: list[FlashcardOut]
    questions: list[QuestionOut]
    completion_percentage: float


class TopicProgressIn(BaseModel):
    completion_percentage: float


class TopicOut(BaseModel):
    id: int
    title: str
    completion_percentage: float


class RelatedMcq(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: str


class AiLessonOut(BaseModel):
    id: int
    question_id: int
    lesson_simple: str
    lesson_detailed: str
    exam_notes: str
    mnemonic: str
    related_mcqs: list[RelatedMcq]
    revision_summary: str
    flashcards: list[FlashcardOut]


class AiTutorAskIn(BaseModel):
    query: str


class AiTutorCitation(BaseModel):
    source_name: str
    source_type: str  # 'question' or 'topic'
    title: str        # question text or topic title


class AiTutorAskOut(BaseModel):
    answer: str
    citations: list[AiTutorCitation]
