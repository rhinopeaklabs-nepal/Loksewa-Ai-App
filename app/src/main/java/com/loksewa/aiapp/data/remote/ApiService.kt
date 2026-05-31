package com.loksewa.aiapp.data.remote

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.*

// Request/Response models
data class LoginRequest(
    val email: String,
    val password: String,
    @SerializedName("client_type") val clientType: String = "mobile"
)

data class RegisterRequest(
    val email: String,
    val password: String,
    @SerializedName("full_name") val fullName: String
)

data class AuthResponse(
    val token: String,
    val user: UserResponse,
    @SerializedName("expires_at") val expiresAt: String
)

data class UserResponse(
    val id: Int,
    val email: String,
    @SerializedName("full_name") val fullName: String,
    val role: String,
    val status: String,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String,
    @SerializedName("last_login_at") val lastLoginAt: String?
)

data class QuestionResponse(
    val id: Int,
    @SerializedName("public_id") val publicId: String,
    @SerializedName("question_text") val questionText: String,
    @SerializedName("option_a") val optionA: String,
    @SerializedName("option_b") val optionB: String,
    @SerializedName("option_c") val optionC: String,
    @SerializedName("option_d") val optionD: String,
    @SerializedName("correct_option") val correctOption: String,
    val explanation: String,
    @SerializedName("syllabus_category") val syllabusCategory: String,
    @SerializedName("source_name") val sourceName: String,
    val verificationStatus: String
)

data class SearchRequest(
    val query: String,
    val limit: Int = 3,
    @SerializedName("allow_ai_fallback") val allowAiFallback: Boolean = true
)

data class SearchResponse(
    @SerializedName("answer_source") val answerSource: String,
    val matches: List<SearchMatch>,
    val disclaimer: String?
)

data class SearchMatch(
    val question: QuestionResponse,
    @SerializedName("bm25_score") val bm25Score: Float,
    val similarity: Float
)

data class MockTestResponse(
    val id: Int,
    val title: String,
    val description: String,
    @SerializedName("exam_level") val examLevel: String,
    @SerializedName("exam_type") val examType: String,
    @SerializedName("syllabus_category") val syllabusCategory: String,
    @SerializedName("duration_minutes") val durationMinutes: Int,
    @SerializedName("total_questions") val totalQuestions: Int,
    @SerializedName("marks_per_correct") val marksPerCorrect: Float,
    @SerializedName("negative_marking_enabled") val negativeMarkingEnabled: Boolean,
    @SerializedName("negative_marks_per_wrong") val negativeMarksPerWrong: Float,
    val status: String,
    @SerializedName("question_ids") val questionIds: List<Int>
)

data class MockAttemptResponse(
    val id: Int,
    val mockTest: MockTestResponse,
    val status: String,
    @SerializedName("started_at") val startedAt: String,
    @SerializedName("ends_at") val endsAt: String,
    @SerializedName("submitted_at") val submittedAt: String?,
    val score: Float,
    @SerializedName("correct_count") val correctCount: Int,
    @SerializedName("wrong_count") val wrongCount: Int,
    @SerializedName("unanswered_count") val unansweredCount: Int,
    @SerializedName("total_questions") val totalQuestions: Int,
    @SerializedName("total_marks") val totalMarks: Float,
    val questions: List<MockQuestionResponse>
)

data class MockQuestionResponse(
    val id: Int,
    val position: Int,
    @SerializedName("question_text") val questionText: String,
    @SerializedName("option_a") val optionA: String,
    @SerializedName("option_b") val optionB: String,
    @SerializedName("option_c") val optionC: String,
    @SerializedName("option_d") val optionD: String,
    @SerializedName("syllabus_category") val syllabusCategory: String
)

data class AnswerRequest(
    @SerializedName("question_id") val questionId: Int,
    @SerializedName("selected_option") val selectedOption: String
)

data class UserStatsResponse(
    @SerializedName("total_mocks_taken") val totalMocksTaken: Int,
    @SerializedName("total_mocks_completed") val totalMocksCompleted: Int,
    @SerializedName("average_score") val averageScore: Float,
    @SerializedName("correct_rate") val correctRate: Float,
    @SerializedName("total_questions_answered") val totalQuestionsAnswered: Int,
    @SerializedName("best_score") val bestScore: Float,
    @SerializedName("categories_studied") val categoriesStudied: List<String>
)

data class ReportRequest(
    @SerializedName("question_id") val questionId: Int?,
    @SerializedName("scanned_text") val scannedText: String,
    @SerializedName("report_type") val reportType: String,
    val message: String,
    val contact: String
)

data class ReportResponse(
    @SerializedName("report_id") val reportId: Int,
    val status: String
)

// API Service interface
interface LoksewaApiService {
    // Auth endpoints
    @POST("v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("v1/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @GET("v1/auth/me")
    suspend fun getCurrentUser(): Response<UserResponse>

    @POST("v1/auth/logout")
    suspend fun logout(): Response<Unit>

    // Search endpoints
    @POST("v1/search")
    suspend fun search(@Body request: SearchRequest): Response<SearchResponse>

    // Questions
    @GET("v1/questions")
    suspend fun getQuestions(
        @Query("category") category: String? = null,
        @Query("limit") limit: Int = 100
    ): Response<List<QuestionResponse>>

    @GET("v1/questions/{id}")
    suspend fun getQuestion(@Path("id") id: Int): Response<QuestionResponse>

    // Categories
    @GET("v1/categories")
    suspend fun getCategories(): Response<List<String>>

    // Mock Tests
    @GET("v1/mock-tests")
    suspend fun getMockTests(
        @Query("status") status: String? = null,
        @Query("limit") limit: Int = 50
    ): Response<List<MockTestResponse>>

    @GET("v1/mock-tests/{id}")
    suspend fun getMockTest(@Path("id") id: Int): Response<MockTestResponse>

    @POST("v1/mock-tests/{id}/start")
    suspend fun startMockTest(@Path("id") mockTestId: Int): Response<MockAttemptResponse>

    @POST("v1/mock-tests/attempts/{id}/answer")
    suspend fun answerQuestion(
        @Path("id") attemptId: Int,
        @Body request: AnswerRequest
    ): Response<MockAttemptResponse>

    @POST("v1/mock-tests/attempts/{id}/submit")
    suspend fun submitTest(@Path("id") attemptId: Int): Response<MockAttemptResponse>

    // User Stats
    @GET("v1/users/me/stats")
    suspend fun getUserStats(): Response<UserStatsResponse>

    // Reports
    @POST("v1/reports")
    suspend fun submitReport(@Body request: ReportRequest): Response<ReportResponse>
}