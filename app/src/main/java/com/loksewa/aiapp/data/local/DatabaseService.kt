package com.loksewa.aiapp.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "loksewa_questions")
data class QuestionEntity(
    @PrimaryKey val id: Int,
    @ColumnInfo(name = "public_id") val publicId: String,
    @ColumnInfo(name = "question_text") val questionText: String,
    @ColumnInfo(name = "normalized_question_text") val normalizedQuestionText: String,
    @ColumnInfo(name = "option_a") val optionA: String,
    @ColumnInfo(name = "option_b") val optionB: String,
    @ColumnInfo(name = "option_c") val optionC: String,
    @ColumnInfo(name = "option_d") val optionD: String,
    @ColumnInfo(name = "correct_option") val correctOption: String,
    val explanation: String,
    @ColumnInfo(name = "syllabus_category") val syllabusCategory: String,
    @ColumnInfo(name = "source_name") val sourceName: String,
    @ColumnInfo(name = "source_url") val sourceUrl: String,
    @ColumnInfo(name = "source_license") val sourceLicense: String,
    @ColumnInfo(name = "source_year") val sourceYear: Int?,
    @ColumnInfo(name = "source_page") val sourcePage: Int?,
    @ColumnInfo(name = "exam_level") val examLevel: String,
    @ColumnInfo(name = "exam_type") val examType: String,
    val language: String,
    @ColumnInfo(name = "verification_status") val verificationStatus: String,
    val verifier: String,
    @ColumnInfo(name = "data_version") val dataVersion: Int,
    @ColumnInfo(name = "verified_at") val verifiedAt: String?,
    @ColumnInfo(name = "created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") val updatedAt: String
)

@Entity(tableName = "app_users")
data class UserEntity(
    @PrimaryKey val id: Int,
    val email: String,
    @ColumnInfo(name = "password_hash") val passwordHash: String = "",
    @ColumnInfo(name = "full_name") val fullName: String,
    val role: String,
    val status: String,
    @ColumnInfo(name = "created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") val updatedAt: String,
    @ColumnInfo(name = "last_login_at") val lastLoginAt: String?
)

@Entity(tableName = "scan_history")
data class ScanHistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "scanned_text") val scannedText: String,
    @ColumnInfo(name = "normalized_scanned_text") val normalizedScannedText: String,
    @ColumnInfo(name = "matched_question_id") val matchedQuestionId: Int?,
    @ColumnInfo(name = "answer_source") val answerSource: String, // verified_db | ai_assisted | ai_only | uncertain
    @ColumnInfo(name = "user_rating") val userRating: Int?, // 1-5
    @ColumnInfo(name = "created_at") val createdAt: String
)

@Entity(tableName = "mock_tests")
data class MockTestEntity(
    @PrimaryKey val id: Int,
    val title: String,
    val description: String,
    @ColumnInfo(name = "exam_level") val examLevel: String,
    @ColumnInfo(name = "exam_type") val examType: String,
    @ColumnInfo(name = "syllabus_category") val syllabusCategory: String,
    @ColumnInfo(name = "duration_minutes") val durationMinutes: Int,
    @ColumnInfo(name = "total_questions") val totalQuestions: Int,
    @ColumnInfo(name = "marks_per_correct") val marksPerCorrect: Float,
    @ColumnInfo(name = "negative_marking_enabled") val negativeMarkingEnabled: Boolean,
    @ColumnInfo(name = "negative_marks_per_wrong") val negativeMarksPerWrong: Float,
    val status: String,
    @ColumnInfo(name = "created_by") val createdBy: Int?,
    @ColumnInfo(name = "created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") val updatedAt: String
)

@Entity(tableName = "mock_test_attempts")
data class MockAttemptEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "user_id") val userId: Int,
    @ColumnInfo(name = "mock_test_id") val mockTestId: Int,
    @ColumnInfo(name = "started_at") val startedAt: String,
    @ColumnInfo(name = "ends_at") val endsAt: String,
    @ColumnInfo(name = "submitted_at") val submittedAt: String? = null,
    val status: String,
    val score: Float,
    @ColumnInfo(name = "correct_count") val correctCount: Int,
    @ColumnInfo(name = "wrong_count") val wrongCount: Int,
    @ColumnInfo(name = "unanswered_count") val unansweredCount: Int,
    @ColumnInfo(name = "total_questions") val totalQuestions: Int,
    @ColumnInfo(name = "total_marks") val totalMarks: Float
)

@Entity(
    tableName = "mock_test_answers",
    primaryKeys = ["attempt_id", "question_id"]
)
data class MockTestAnswerEntity(
    @ColumnInfo(name = "attempt_id") val attemptId: Int,
    @ColumnInfo(name = "question_id") val questionId: Int,
    @ColumnInfo(name = "selected_option") val selectedOption: String?, // A | B | C | D
    @ColumnInfo(name = "is_correct") val isCorrect: Boolean,
    @ColumnInfo(name = "marks_awarded") val marksAwarded: Float,
    @ColumnInfo(name = "answered_at") val answeredAt: String
)

@Entity(
    tableName = "mock_test_questions",
    primaryKeys = ["mock_test_id", "question_id"]
)
data class MockTestQuestionEntity(
    @ColumnInfo(name = "mock_test_id") val mockTestId: Int,
    @ColumnInfo(name = "question_id") val questionId: Int,
    val position: Int
)

@Dao
interface QuestionDao {
    @Query("SELECT * FROM loksewa_questions WHERE id = :id")
    suspend fun getQuestion(id: Int): QuestionEntity?

    @Query("SELECT * FROM loksewa_questions WHERE verification_status = 'verified' LIMIT :limit")
    suspend fun getVerifiedQuestions(limit: Int = 100): List<QuestionEntity>

    @Query("""
        SELECT * FROM loksewa_questions 
        WHERE syllabus_category = :category AND verification_status = 'verified'
        LIMIT :limit
    """)
    suspend fun getQuestionsByCategory(category: String, limit: Int = 100): List<QuestionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuestions(questions: List<QuestionEntity>)

    @Query("DELETE FROM loksewa_questions")
    suspend fun deleteAllQuestions()
}

@Dao
interface UserDao {
    @Query("SELECT * FROM app_users WHERE id = :id")
    suspend fun getUser(id: Int): UserEntity?

    @Query("SELECT * FROM app_users LIMIT 1")
    suspend fun getCurrentUser(): UserEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Query("DELETE FROM app_users")
    suspend fun deleteAllUsers()
}

@Dao
interface MockTestDao {
    @Query("SELECT * FROM mock_tests WHERE status = 'published' LIMIT :limit")
    suspend fun getPublishedTests(limit: Int = 50): List<MockTestEntity>

    @Query("SELECT * FROM mock_tests WHERE id = :id")
    suspend fun getMockTest(id: Int): MockTestEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMockTests(tests: List<MockTestEntity>)

    @Query("DELETE FROM mock_tests")
    suspend fun deleteAllMockTests()
}

@Dao
interface MockAttemptDao {
    @Query("SELECT * FROM mock_test_attempts WHERE user_id = :userId ORDER BY started_at DESC")
    fun getAttemptsByUser(userId: Int): Flow<List<MockAttemptEntity>>

    @Query("SELECT * FROM mock_test_attempts WHERE user_id = :userId ORDER BY started_at DESC")
    suspend fun getAttemptsByUserList(userId: Int): List<MockAttemptEntity>

    @Query("SELECT * FROM mock_test_attempts WHERE id = :id")
    suspend fun getAttemptById(id: Int): MockAttemptEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttempt(attempt: MockAttemptEntity): Long

    @Query("UPDATE mock_test_attempts SET status = :status, submitted_at = :submittedAt, score = :score, correct_count = :correct, wrong_count = :wrong, unanswered_count = :unanswered WHERE id = :id")
    suspend fun updateAttemptResults(id: Int, status: String, submittedAt: String?, score: Float, correct: Int, wrong: Int, unanswered: Int)
}

@Dao
interface ScanHistoryDao {
    @Query("SELECT * FROM scan_history ORDER BY created_at DESC")
    fun getScanHistory(): Flow<List<ScanHistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertScan(scan: ScanHistoryEntity): Long

    @Query("UPDATE scan_history SET user_rating = :rating WHERE id = :id")
    suspend fun updateRating(id: Int, rating: Int)

    @Query("DELETE FROM scan_history")
    suspend fun clearHistory()
}

@Dao
interface MockTestAnswerDao {
    @Query("SELECT * FROM mock_test_answers WHERE attempt_id = :attemptId")
    suspend fun getAnswersForAttempt(attemptId: Int): List<MockTestAnswerEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAnswer(answer: MockTestAnswerEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAnswers(answers: List<MockTestAnswerEntity>)
}

@Database(
    entities = [
        QuestionEntity::class,
        UserEntity::class,
        ScanHistoryEntity::class,
        MockTestEntity::class,
        MockAttemptEntity::class,
        MockTestAnswerEntity::class,
        MockTestQuestionEntity::class
    ],
    version = 2, // Upgraded version to 2 for the schema changes
    exportSchema = false
)
abstract class LoksewaDatabase : RoomDatabase() {
    abstract fun questionDao(): QuestionDao
    abstract fun userDao(): UserDao
    abstract fun mockTestDao(): MockTestDao
    abstract fun mockAttemptDao(): MockAttemptDao
    abstract fun scanHistoryDao(): ScanHistoryDao
    abstract fun mockTestAnswerDao(): MockTestAnswerDao
}