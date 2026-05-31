# Mobile Native Rewrite - Architecture Plan

## Context

This document defines the architecture for replacing the existing WebView prototype shell with a fully native Android application for the Loksewa AI app—Nepal's civil service exam preparation platform.

**Project Location:** `C:\My Files\Projects\Loksewa Ai App`
**Target:** Production-ready native Android app (minSdk 24, compileSdk 36)
**Stack:** Kotlin + Jetpack Compose + Room + Hilt + ML Kit + CameraX

The existing codebase has a working prototype with:
- Basic Room entities matching the backend schema
- ML Kit camera integration skeleton
- Hilt DI module
- Compose navigation scaffold
- WebView fallback mechanism in MainActivity

The prototype needs to be fully implemented into a production-quality offline-first application with verified-first answer strategy.

---

## 1. Verification Checklist

- [x] SPEC.md read and understood — verified-first pipeline, source badges, FTS5 offline search
- [x] STORE_COMPLIANCE.md read — camera permissions, AI disclaimers, data safety requirements
- [x] Current Android app explored — existing skeleton structure identified
- [x] Backend schema reviewed — loksewa_questions, scan_history, mock_tests tables
- [x] Flutter database_service.dart reviewed — FTS5 query pattern, decompression workflow
- [x] Architecture gaps identified between prototype and production requirements

---

## 2. High-Level Architecture

### 2.1 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| UI Framework | Jetpack Compose (BOM 2024.02) | Native declarative UI |
| State Management | ViewModel + StateFlow + Hilt | Reactive MVVM |
| Offline Database | Room + pre-bundled .db.gz | Offline-first storage |
| OCR Engine | Google ML Kit Text Recognition 16.0.0 | On-device text extraction |
| Camera | CameraX 1.3.1 | Camera preview and capture |
| Networking | Retrofit 2.9.0 + OkHttp 4.12.0 | API integration |
| DI | Hilt 2.50 | Dependency injection |
| Navigation | Navigation Compose 2.7.7 | Screen navigation |
| Preferences | DataStore 1.0.0 | User settings |

### 2.2 Core Data Flow

```
[Camera image or typed query]
           │
           ▼
[Layer 1: ML Kit OCR → normalize text]
           │
           ▼
[Layer 2: SQLite FTS5 search (pre-bundled DB)]
           │
     ┌─────┼──────┐
     ▼     ▼      ▼
high   medium    low
match  match    match
     │     │      │
     ▼     ▼      ▼
verified  AI-assisted  uncertain/AI-only
answer  + context     answer (warning badge)
```

### 2.3 Screen Map

```
App Launch
    │
    ▼
┌─────────────────────────────────────────────────┐
│                 Navigation Graph                │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Auth] ──► [Home] ──► [Quick Scan]            │
│                │           │                    │
│                │           ▼                    │
│                │     [Result Screen]           │
│                │           │                    │
│                │     [Question Detail]          │
│                │           │                    │
│                ▼           ▼                    │
│          [Subjects]       │                    │
│                │           ▼                    │
│          [Category Q's]   │                    │
│                │           ▼                    │
│                └────► [Manual Entry]            │
│                         │                       │
│    ┌────────────────────┼────────────────┐     │
│    ▼                    ▼                ▼     │
│ [Mock Tests]      [Scan History]   [Profile] │
│    │                    │                │     │
│    ▼                    ▼                ▼     │
│ [Test Session]    [History Detail]  [Settings] │
│    │                                       │
│    ▼                                       │
│ [Test Results]                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2.4 Bottom Navigation

```
┌──────────────────────────────────────────┐
│  [Home]    [Scan]     [Mock]    [Profile] │
│   🏠       📷         📝         👤        │
└──────────────────────────────────────────┘
```

**Scan** is the centered primary action button (elevated FAB style).

---

## 3. Component Architecture

### 3.1 Package Structure

```
app/src/main/java/com/loksewa/aiapp/
├── core/
│   ├── utils/TextNormalizer.kt             # Devanagari + ASCII normalization
│   ├── utils/DateUtils.kt
│   └── model/AnswerSource.kt               # verified_db | ai_assisted | ai_only | uncertain
│
├── data/
│   ├── local/
│   │   ├── db/
│   │   │   ├── AppDatabase.kt             # Room database
│   │   │   ├── dao/
│   │   │   │   ├── QuestionDao.kt
│   │   │   │   ├── MockTestDao.kt
│   │   │   │   ├── ScanHistoryDao.kt
│   │   │   │   └── UserDao.kt
│   │   │   └── entity/
│   │   │       ├── QuestionEntity.kt
│   │   │       ├── MockTestEntity.kt
│   │   │       ├── ScanHistoryEntity.kt
│   │   │       ├── MockTestAttemptEntity.kt
│   │   │       ├── MockTestAnswerEntity.kt
│   │   │       └── UserEntity.kt
│   │   ├── DatabaseInstaller.kt           # .db.gz bootstrap (install-once)
│   │   └── OfflineSearchService.kt        # FTS5 query + BM25 scoring via @RawQuery
│   │
│   ├── remote/
│   │   ├── ApiService.kt                   # Retrofit interface
│   │   ├── dto/                            # UserDto, QuestionDto, SyncDto
│   │   └── AuthInterceptor.kt
│   │
│   └── repository/
│       ├── AuthRepository.kt
│       ├── QuestionRepository.kt
│       ├── SearchRepository.kt             # unified search pipeline
│       ├── ScanHistoryRepository.kt
│       └── SyncRepository.kt
│
├── mlkit/
│   ├── TextRecognitionService.kt          # ML Kit wrapper
│   └── OcrConfidenceChecker.kt
│
├── camera/
│   ├── CameraScannerManager.kt             # CameraX lifecycle
│   └── CameraPermissionHandler.kt
│
└── ui/
    ├── components/
    │   ├── SourceBadge.kt                  # Verified (green) / AI (amber) / AI-only (orange)
    │   ├── QuestionCard.kt
    │   ├── OptionButton.kt
    │   ├── AiDisclaimer.kt                 # Required AI warning text
    │   └── LoadingScreen.kt
    │
    ├── screens/
    │   ├── auth/   (LoginScreen, RegisterScreen, AuthViewModel)
    │   ├── home/   (HomeScreen, HomeViewModel)
    │   ├── scan/   (ScanScreen, ScanViewModel, ScanUiState)
    │   ├── result/ (ResultScreen, ResultViewModel, ResultUiState)
    │   ├── manual/ (ManualEntryScreen, ManualEntryViewModel)
    │   ├── subjects/(SubjectsScreen, CategoryQuestionsScreen, SubjectsViewModel)
    │   ├── detail/ (QuestionDetailScreen, QuestionDetailViewModel)
    │   ├── history/ (ScanHistoryScreen, ScanHistoryViewModel)
    │   ├── mocktest/(MockTestListScreen, TestSessionScreen, TestResultsScreen, MockTestViewModel)
    │   └── profile/ (ProfileScreen, SettingsScreen)
    │
    └── navigation/
        ├── NavGraph.kt
        ├── Route.kt
        └── BottomNavHost.kt
```

### 3.2 ViewModel Pattern

Every screen follows this reactive MVVM pattern:

```kotlin
// UiState (immutable data class)
data class ScanUiState(
    val phase: ScanPhase = ScanPhase.IDLE,
    val scannedText: String = "",
    val answerSource: AnswerSource = AnswerSource.UNCERTAIN,
    val matchedQuestion: QuestionEntity? = null,
    val error: String? = null,
    val cameraPermissionGranted: Boolean = false
)

enum class ScanPhase { IDLE, CAMERA_READY, OCR_PROCESSING, DATABASE_MATCHING, RESULT, ERROR }

// ViewModel
@HiltViewModel
class ScanViewModel @Inject constructor(
    private val textRecognitionService: TextRecognitionService,
    private val searchRepository: SearchRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(ScanUiState())
    val uiState: StateFlow<ScanUiState> = _uiState.asStateFlow()

    fun onImageCaptured(imagePath: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(phase = ScanPhase.OCR_PROCESSING) }
            try {
                val text = textRecognitionService.recognizeFromFile(imagePath)
                val result = searchRepository.searchVerifiedQuestions(text)
                _uiState.update { it.copy(
                    phase = ScanPhase.RESULT,
                    scannedText = text,
                    answerSource = result.source,
                    matchedQuestion = result.question
                )}
            } catch (e: Exception) {
                _uiState.update { it.copy(phase = ScanPhase.ERROR, error = e.message) }
            }
        }
    }
}
```

---

## 4. Room Database Schema

### 4.1 Strategy: Room + Raw SQLite for FTS5

Room's annotation-based API does not natively support FTS5 virtual tables. The solution is:
- Room manages entity tables: `app_users`, `scan_history`, `mock_tests`, `mock_test_attempts`, `mock_test_answers`
- Raw `@RawQuery` against the pre-bundled read-only database handles `loksewa_questions` + FTS5 searches
- **Pre-bundled compressed DB** (`.db.gz`) is decompressed once on first launch into the app's database directory, then opened read-only for normal queries

### 4.2 Database Schema (Matching Backend)

```sql
PRAGMA foreign_keys = ON;

-- loksewa_questions: authoritative questions (bundled read-only)
CREATE TABLE IF NOT EXISTS loksewa_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT NOT NULL UNIQUE,
    question_text TEXT NOT NULL,
    normalized_question_text TEXT NOT NULL,
    option_a TEXT NOT NULL, option_b TEXT NOT NULL,
    option_c TEXT NOT NULL, option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A','B','C','D')),
    explanation TEXT NOT NULL DEFAULT '',
    syllabus_category TEXT NOT NULL DEFAULT '',
    source_name TEXT NOT NULL DEFAULT '',
    source_url TEXT NOT NULL DEFAULT '',
    source_license TEXT NOT NULL DEFAULT '',
    source_year INTEGER, source_page INTEGER,
    exam_level TEXT NOT NULL DEFAULT '',
    exam_type TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'ne',
    verification_status TEXT NOT NULL DEFAULT 'verified',
    verifier TEXT NOT NULL DEFAULT '',
    import_batch_id INTEGER,
    data_version INTEGER NOT NULL DEFAULT 1,
    verified_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- FTS5 trigram index on questions
CREATE VIRTUAL TABLE IF NOT EXISTS fts_questions USING fts5(
    normalized_question_text,
    content = 'loksewa_questions',
    content_rowid = 'id',
    tokenize = 'trigram'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER loksewa_questions_ai AFTER INSERT ON loksewa_questions BEGIN
    INSERT INTO fts_questions(rowid, normalized_question_text)
    VALUES (new.id, new.normalized_question_text);
END;
CREATE TRIGGER loksewa_questions_ad AFTER DELETE ON loksewa_questions BEGIN
    INSERT INTO fts_questions(fts_questions, rowid, normalized_question_text)
    VALUES ('delete', old.id, old.normalized_question_text);
END;
CREATE TRIGGER loksewa_questions_au AFTER UPDATE ON loksewa_questions BEGIN
    INSERT INTO fts_questions(fts_questions, rowid, normalized_question_text) VALUES ('delete', old.id, old.normalized_question_text);
    INSERT INTO fts_questions(rowid, normalized_question_text) VALUES (new.id, new.normalized_question_text);
END;

-- scan_history: local user scan history
CREATE TABLE IF NOT EXISTS scan_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scanned_text TEXT NOT NULL,
    normalized_scanned_text TEXT NOT NULL,
    matched_question_id INTEGER,
    answer_source TEXT NOT NULL CHECK (answer_source IN ('verified_db','ai_assisted','ai_only','uncertain')),
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- mock_tests: available exam sets
CREATE TABLE IF NOT EXISTS mock_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    exam_level TEXT NOT NULL DEFAULT '', exam_type TEXT NOT NULL DEFAULT '',
    syllabus_category TEXT NOT NULL DEFAULT '',
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    total_questions INTEGER NOT NULL DEFAULT 0,
    marks_per_correct REAL NOT NULL DEFAULT 1.0,
    negative_marking_enabled INTEGER NOT NULL DEFAULT 1,
    negative_marks_per_wrong REAL NOT NULL DEFAULT 0.2,
    status TEXT NOT NULL DEFAULT 'draft',
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- mock_test_attempts: user test sessions
CREATE TABLE IF NOT EXISTS mock_test_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, mock_test_id INTEGER NOT NULL,
    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, ends_at TEXT NOT NULL,
    submitted_at TEXT, status TEXT NOT NULL DEFAULT 'in_progress',
    score REAL NOT NULL DEFAULT 0, correct_count INTEGER NOT NULL DEFAULT 0,
    wrong_count INTEGER NOT NULL DEFAULT 0, unanswered_count INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0, total_marks REAL NOT NULL DEFAULT 0
);

-- mock_test_answers: per-question answers during a test attempt
CREATE TABLE IF NOT EXISTS mock_test_answers (
    attempt_id INTEGER PRIMARY KEY NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option TEXT,
    is_correct INTEGER NOT NULL DEFAULT 0,
    marks_awarded REAL NOT NULL DEFAULT 0,
    answered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (attempt_id, question_id)
);

-- app_users: cached user profile
CREATE TABLE IF NOT EXISTS app_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT 'student',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
);

-- database_metadata: version tracking
CREATE TABLE IF NOT EXISTS database_metadata (
    key TEXT PRIMARY KEY, value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 Database Installer

```kotlin
class DatabaseInstaller(
    private val context: Context,
    private val assetPath: String = "assets/loksewa_v1.db.gz",
    private val databaseFileName: String = "loksewa_active.db"
) {
    private var isInstalled = false

    fun getDatabasePath(): String {
        return context.getDatabasePath(databaseFileName).absolutePath
    }

    suspend fun ensureInstalled(): String = withContext(Dispatchers.IO) {
        if (isInstalled) return@withContext getDatabasePath()

        val dbFile = File(getDatabasePath())
        if (dbFile.exists()) {
            isInstalled = true
            return@withContext getDatabasePath()
        }

        dbFile.parentFile?.mkdirs()
        val compressedBytes = context.assets.open(assetPath).use { it.readBytes() }
        val decompressed = GZipDecoder().decodeBytes(compressedBytes)
        val tempFile = File("${getDatabasePath()}.tmp")
        tempFile.writeBytes(decompressed)
        tempFile.renameTo(dbFile)
        isInstalled = true
        getDatabasePath()
    }
}
```

### 4.4 Entity Definitions

```kotlin
@Entity(tableName = "scan_history")
data class ScanHistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val scannedText: String,
    val normalizedScannedText: String,
    val matchedQuestionId: Int?,
    val answerSource: String,  // verified_db | ai_assisted | ai_only | uncertain
    val userRating: Int?,      // 1-5
    val createdAt: String
)

@Entity(tableName = "mock_test_attempts")
data class MockTestAttemptEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val userId: Int, val mockTestId: Int,
    val startedAt: String, val endsAt: String,
    val submittedAt: String?, val status: String,  // in_progress | submitted | expired
    val correctCount: Int = 0, val wrongCount: Int = 0,
    val unansweredCount: Int = 0, val totalQuestions: Int = 0
)

@Entity(tableName = "mock_test_answers",
    primaryKeys = ["attemptId", "questionId"])
data class MockTestAnswerEntity(
    val attemptId: Int, val questionId: Int,
    val selectedOption: String?,  // A | B | C | D
    val isCorrect: Boolean, val marksAwarded: Float,
    val answeredAt: String
)
```

### 4.5 OfflineSearchService (FTS5 + BM25)

```kotlin
class OfflineSearchService @Inject constructor(
    private val databasePathProvider: DatabasePathProvider
) {
    private var cachedDatabase: SQLiteDatabase? = null

    private fun getDatabase(): SQLiteDatabase {
        if (cachedDatabase == null || !cachedDatabase!!.isOpen) {
            cachedDatabase = SQLiteDatabase.openDatabase(
                databasePathProvider.getDatabasePath(),
                null, SQLiteDatabase.OPEN_READONLY
            )
        }
        return cachedDatabase!!
    }

    suspend fun searchQuestions(input: String, limit: Int = 3): List<FtsSearchResult> {
        return withContext(Dispatchers.IO) {
            val normalized = normalizeText(input)
            val query = buildFtsQuery(normalized)
            val db = getDatabase()

            val cursor = db.rawQuery("""
                SELECT q.id, q.question_text, q.option_a, q.option_b,
                       q.option_c, q.option_d, q.correct_option, q.explanation,
                       q.syllabus_category, q.source_name, q.source_year, q.source_page,
                       bm25(fts_questions) AS bm25_score
                FROM fts_questions
                JOIN loksewa_questions q ON q.id = fts_questions.rowid
                WHERE fts_questions MATCH ?
                ORDER BY bm25_score ASC
                LIMIT ?
            """, arrayOf(query, limit))

            val results = mutableListOf<FtsSearchResult>()
            while (cursor.moveToNext()) {
                results.add(cursor.toFtsSearchResult())
            }
            cursor.close()
            results
        }
    }

    private fun buildFtsQuery(normalized: String): String {
        val terms = normalized.split(' ')
            .filter { it.length >= 3 }.take(24)
            .map { "\"${it.replace("\"", "\"\"")}\"" }
        return if (terms.isEmpty()) "\"${normalized.replace("\"", "\"\"")}\""
            else terms.joinToString(" OR ")
    }

    private fun normalizeText(text: String): String {
        return text.replace(Regex("\\s+"), " ").trim().lowercase()
    }
}
```

---

## 5. ML Kit Integration

### 5.1 Text Recognition Service

```kotlin
@Singleton
class TextRecognitionService @Inject constructor() {
    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    suspend fun recognizeText(imagePath: String, context: Context): TextRecognitionResult {
        return suspendCancellableCoroutine { continuation ->
            try {
                val inputImage = InputImage.fromFilePath(context, Uri.parse(imagePath))
                recognizer.process(inputImage)
                    .addOnSuccessListener { visionText ->
                        continuation.resume(TextRecognitionResult(
                            text = visionText.text,
                            confidence = visionText.textConfidence ?: 0f
                        ))
                    }
                    .addOnFailureListener {
                        continuation.resume(TextRecognitionResult(text = "", confidence = 0f))
                    }
            } catch (e: Exception) {
                continuation.resume(TextRecognitionResult(text = "", confidence = 0f))
            }
        }
    }

    fun close() = recognizer.close()
}
```

### 5.2 Camera Scanner Manager

```kotlin
@Singleton
class CameraScannerManager @Inject constructor(
    private val textRecognitionService: TextRecognitionService
) {
    private val cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    private var cameraProvider: ProcessCameraProvider? = null

    fun bindCamera(
        lifecycleOwner: LifecycleOwner,
        previewView: PreviewView,
        onTextRecognized: (String) -> Unit,
        onError: (String) -> Unit
    ) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder().build()
                .also { it.setSurfaceProvider(previewView.surfaceProvider) }

            val imageAnalyzer = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also { analysis -> analysis.setAnalyzer(cameraExecutor) { proxy ->
                    processImageProxy(proxy, onTextRecognized, onError)
                } }

            cameraProvider!!.unbindAll()
            cameraProvider!!.bindToLifecycle(
                lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA,
                preview, imageAnalyzer
            )
        }, ContextCompat.getMainExecutor(context))
    }

    private fun processImageProxy(
        imageProxy: ImageProxy,
        onTextRecognized: (String) -> Unit,
        onError: (String) -> Unit
    ) {
        val mediaImage = imageProxy.image ?: return imageProxy.close()
        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
        textRecognitionService.recognizeText(image, context).let { result ->
            if (result.text.isNotBlank()) onTextRecognized(result.text)
            imageProxy.close()
        }
    }

    fun stopCamera() {
        cameraProvider?.unbindAll()
        cameraExecutor.shutdown()
    }
}
```

### 5.3 Offline Requirement

`text-recognition:16.0.0` bundles models automatically via the Google Maven repository. For true offline operation (no network for model download), add to `build.gradle`:

```groovy
dependencies {
    // Bundled ML Kit model (no network download required)
    implementation("com.google.mlkit:text-recognition:16.0.0")
}
```

ML Kit models are cached on first use. For Play Store readiness, declare in `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<!-- No network permission needed for bundled model -->
```

---

## 6. API Integration Points

### 6.1 Backend Endpoints to Integrate

| Endpoint | Method | Mobile Usage |
|----------|--------|--------------|
| `/api/v1/auth/register` | POST | User registration |
| `/api/v1/auth/login` | POST | User login → get token |
| `/api/v1/auth/me` | GET | Get current user profile |
| `/api/v1/questions/sync` | GET | Delta sync: `?from_version=N` |
| `/api/v1/mock-tests/published` | GET | List available mock tests |
| `/api/v1/sync/delta` | GET/POST | OTA delta updates |
| `/api/v1/reports` | POST | User error/content reports |
| `/api/v1/users/rating` | POST | Rate a scan result |

### 6.2 Auth Token Handling

```kotlin
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val token = runBlocking { tokenManager.getToken() }
        val request = if (token != null) {
            original.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else original
        return chain.proceed(request)
    }
}

class TokenManager @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {
    private val tokenKey = stringPreferencesKey("auth_token")

    suspend fun getToken(): String? =
        dataStore.data.first()[tokenKey]

    suspend fun saveToken(token: String) {
        dataStore.edit { it[tokenKey] = token }
    }

    suspend fun clearToken() {
        dataStore.edit { it.remove(tokenKey) }
    }
}
```

### 6.3 Sync Repository (Offline-First)

```kotlin
class SyncRepository @Inject constructor(
    private val apiService: ApiService,
    private val db: LoksewaDatabase,
    private val databaseMetadata: DatabaseMetadataStore
) {
    suspend fun syncQuestions(): SyncResult {
        val currentVersion = databaseMetadata.getCurrentVersion()
        val remoteQuestions = apiService.getQuestionDelta(currentVersion)

        return if (remoteQuestions.isNotEmpty()) {
            db.runInTransaction {
                db.questionDao().insertQuestions(remoteQuestions)
                databaseMetadata.updateVersion(remoteQuestions.lastVersion)
            }
            SyncResult.Success
        } else {
            SyncResult.NoUpdates
        }
    }
}
```

---

## 7. Navigation Structure

### 7.1 Routes

```kotlin
object Route {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val HOME = "home"
    const val SCAN = "scan"
    const val RESULT = "result/{questionId}?source={source}"
    const val MANUAL_ENTRY = "manual_entry"
    const val SUBJECTS = "subjects"
    const val CATEGORY_QUESTIONS = "category/{categoryId}"
    const val QUESTION_DETAIL = "question/{questionId}"
    const val SCAN_HISTORY = "history"
    const val MOCK_TESTS = "mock_tests"
    const val TEST_SESSION = "test_session/{testId}"
    const val TEST_RESULTS = "test_results/{attemptId}"
    const val PROFILE = "profile"
    const val SETTINGS = "settings"
}
```

---

## 8. Source Badge System

### 8.1 Badge Definitions

| Source | Badge Color | Label | Disclaimer |
|--------|------------|-------|------------|
| `verified_db` | Green (#2E7D32) | Verified Source | None |
| `ai_assisted` | Amber (#FFA000) | AI-Assisted Explanation | Brief |
| `ai_only` | Orange (#E65100) | AI Analysis: Check Sources | Full |
| `uncertain` | Red (#C62828) | Not in Database | Avoid generated answer |

### 8.2 AI Disclaimer (Required by STORE_COMPLIANCE.md)

Every `ai_assisted` and `ai_only` result must display:

```
⚠️ This answer was generated by an on-device AI model and may be
incomplete or inaccurate. Please verify important facts with official
sources such as Rajpatra or authoritative textbooks.
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1-2)

- [ ] **1.1** Set up Room database with entities: UserEntity, ScanHistoryEntity, MockTest* Entities
- [ ] **1.2** Implement DatabaseInstaller for pre-bundled .db.gz bootstrap
- [ ] **1.3** Implement OfflineSearchService with FTS5 BM25 query
- [ ] **1.4** Implement TextNormalization utility
- [ ] **1.5** Create Bottom Navigation scaffold with all routes
- [ ] **1.6** Implement Login/Register screens with AuthRepository
- [ ] **1.7** Implement HomeScreen with user stats

### Phase 2: Core Features (Week 3-4)

- [ ] **2.1** Implement CameraPermissionHandler
- [ ] **2.2** Wire CameraScannerManager into ScanScreen
- [ ] **2.3** Implement TextRecognitionService with ML Kit
- [ ] **2.4** Implement ScanViewModel with full OCR → search pipeline
- [ ] **2.5** Implement ResultScreen with SourceBadge + OptionButton
- [ ] **2.6** Implement QuestionDetailScreen
- [ ] **2.7** Implement SourceBadge component (all 4 states)
- [ ] **2.8** Implement ManualEntryScreen

### Phase 3: Secondary Screens (Week 5)

- [ ] **3.1** Implement SubjectsScreen + CategoryQuestionsScreen
- [ ] **3.2** Implement ScanHistoryScreen with user ratings
- [ ] **3.3** Implement MockTestListScreen
- [ ] **3.4** Implement TestSessionScreen with timer
- [ ] **3.5** Implement TestResultsScreen
- [ ] **3.6** Implement ProfileScreen + SettingsScreen

### Phase 4: Sync + AI Fallback (Week 6)

- [ ] **4.1** Implement SyncRepository for delta OTA updates
- [ ] **4.2** Implement AuthInterceptor for token-managed API calls
- [ ] **4.3** Implement AI fallback layer (Gemini Nano / on-device LLM integration point)
- [ ] **4.4** Implement user report flow (error reporting)
- [ ] **4.5** Accessibility audit (Nepali + English text)

### Phase 5: Production Hardening (Week 7-8)

- [ ] **5.1** Remove development defaults
- [ ] **5.2** Measure and optimize database package size
- [ ] **5.3** Test: airplane mode, low storage, camera denial, slow network
- [ ] **5.4** Build release APK with ProGuard/R8 minification
- [ ] **5.5** Sign APK for Play Store submission

---

## 10. Key Component Details

### 10.1 Search Pipeline (ScanViewModel)

```kotlin
// Full pipeline: OCR text → normalize → FTS5 search → source classification
@HiltViewModel
class ScanViewModel @Inject constructor(
    private val textRecognitionService: TextRecognitionService,
    private val searchRepository: SearchRepository,
    private val scanHistoryRepository: ScanHistoryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ScanUiState())
    val uiState: StateFlow<ScanUiState> = _uiState.asStateFlow()

    fun onCapture(imagePath: String, context: Context) {
        viewModelScope.launch {
            _uiState.update { it.copy(phase = ScanPhase.OCR_PROCESSING) }

            // Step 1: OCR
            val ocrResult = textRecognitionService.recognizeText(imagePath, context)
            if (ocrResult.text.isBlank()) {
                _uiState.update { it.copy(phase = ScanPhase.ERROR, error = "No text detected") }
                return@launch
            }

            // Step 2: Normalize + Search
            _uiState.update { it.copy(phase = ScanPhase.DATABASE_MATCHING) }
            val searchResult = searchRepository.searchVerifiedQuestions(ocrResult.text)

            // Step 3: Save to history
            scanHistoryRepository.saveScan(ScanHistoryEntity(
                scannedText = ocrResult.text,
                normalizedScannedText = normalizeText(ocrResult.text),
                matchedQuestionId = searchResult.question?.id,
                answerSource = searchResult.source.name,
                userRating = null,
                createdAt = ISO8601.now()
            ))

            // Step 4: Update UI
            _uiState.update { it.copy(
                phase = ScanPhase.RESULT,
                scannedText = ocrResult.text,
                answerSource = searchResult.source,
                matchedQuestion = searchResult.question,
                confidence = searchResult.confidence
            )}
        }
    }
}
```

### 10.2 Text Normalization

```kotlin
object TextNormalizer {
    fun normalize(text: String): String {
        return text
            .lowercase()
            .replace(Regex("\\s+"), " ")
            .trim()
    }

    fun normalizeForFts(text: String): String {
        return normalize(text)
            .filter { !it.isPunctuation() || it == '-' }
            .replace(Regex("[।॥]"), " ") // Remove Devanagari full stop
    }
}
```

---

## 11. Missing From Current Prototype

| Component | Status | Priority |
|-----------|--------|----------|
| ScanScreen.kt | Missing | High |
| ScanViewModel.kt | Missing | High |
| ResultScreen.kt | Missing | High |
| ResultViewModel.kt | Missing | High |
| SourceBadge.kt (Compose) | Missing | High |
| AiDisclaimer.kt | Missing | High |
| ManualEntryScreen.kt | Missing | High |
| SubjectsScreen.kt | Missing | Medium |
| ScanHistoryScreen.kt | Missing | Medium |
| MockTestListScreen.kt | Missing | Medium |
| TestSessionScreen.kt | Missing | Medium |
| TextNormalizer.kt | Missing | High |
| OfflineSearchService | Partial | High |
| DatabaseInstaller (gz bootstrap) | Missing | High |
| AuthRepository | Partial | High |
| Bottom navigation host | Missing | High |
| NavGraph.kt (full routes) | Partial | High |

---

## 12. Files to Create

### New Files (High Priority)

```
app/src/main/java/com/loksewa/aiapp/
├── core/utils/TextNormalizer.kt
├── core/model/AnswerSource.kt
├── data/local/DatabaseInstaller.kt
├── data/local/OfflineSearchService.kt
├── data/local/db/dao/ScanHistoryDao.kt
├── data/local/db/entity/ScanHistoryEntity.kt
├── data/local/db/entity/MockTestAttemptEntity.kt
├── data/local/db/entity/MockTestAnswerEntity.kt
├── data/repository/AuthRepository.kt
├── data/repository/SearchRepository.kt
├── data/repository/ScanHistoryRepository.kt
├── mlkit/TextRecognitionService.kt
├── camera/CameraScannerManager.kt
├── camera/CameraPermissionHandler.kt
└── ui/
    ├── components/SourceBadge.kt, OptionButton.kt, AiDisclaimer.kt
    ├── screens/scan/ScanScreen.kt, ScanViewModel.kt, ScanUiState.kt
    ├── screens/result/ResultScreen.kt, ResultViewModel.kt, ResultUiState.kt
    ├── screens/manual/ManualEntryScreen.kt, ManualEntryViewModel.kt
    ├── screens/subjects/SubjectsScreen.kt, CategoryQuestionsScreen.kt, SubjectsViewModel.kt
    ├── screens/detail/QuestionDetailScreen.kt, QuestionDetailViewModel.kt
    ├── screens/history/ScanHistoryScreen.kt, ScanHistoryViewModel.kt
    ├── screens/mocktest/MockTestListScreen.kt, TestSessionScreen.kt, TestResultsScreen.kt, MockTestViewModel.kt
    ├── screens/profile/ProfileScreen.kt, SettingsScreen.kt, ProfileViewModel.kt
    └── navigation/NavGraph.kt, Route.kt, BottomNavHost.kt
```

### Files to Modify

```
app/src/main/java/com/loksewa/aiapp/
├── data/local/DatabaseService.kt    → rename to AppDatabase.kt, add raw SQLite
├── data/local/LoksewaDatabase.kt     → update entity list
├── data/remote/ApiService.kt         → add missing endpoints
├── di/AppModule.kt                  → add DatabaseInstaller, OfflineSearchService
├── LoksewaApp.kt                    → complete all navigation routes
└── MainActivity.kt                   → remove WebView toggle, pure native
```

---

## 13. Risk Items

| Risk | Mitigation |
|------|------------|
| ML Kit + FTS5 multithreaded DB locks | Read-only mode, single-writer for sync only |
| Pre-bundled DB large size | Use Brotli compression (.db.br), target ~15MB seed DB |
| Nepali OCR accuracy on low-quality images | Show "retake" prompt when confidence < 0.5 |
| AI-only not available on all devices | "No-AI mode" toggle in Settings |
| Camera permission denied | Graceful fallback to Manual Entry |
| Delta sync fails mid-download | Keep previous DB, rollback on failure |

---

## 14. Build Verification

```bash
./gradlew assembleDebug
# APK at: app/build/outputs/apk/debug/app-debug.apk
./gradlew lintDebug
```

Target metrics:
- APK size: < 40MB (excluding model downloads)
- FTS5 search response: < 100ms for 50K questions
- ML Kit OCR: < 2s per image
- First-launch cold start: < 3s on mid-range device

---

*Document version: 1.0*
*Architecture alignment: Native Android, Offline-first, Verified-first*
