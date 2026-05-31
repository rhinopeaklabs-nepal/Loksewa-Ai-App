package com.loksewa.aiapp.ui.screens.mocktest

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.loksewa.aiapp.data.local.*
import com.loksewa.aiapp.data.remote.LoksewaApiService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject

data class MockTestListUiState(
    val isLoading: Boolean = true,
    val tests: List<MockTestEntity> = emptyList(),
    val error: String? = null
)

data class TestSessionUiState(
    val isLoading: Boolean = true,
    val mockTest: MockTestEntity? = null,
    val questions: List<QuestionEntity> = emptyList(),
    val currentQuestionIndex: Int = 0,
    val selectedAnswers: Map<Int, String> = emptyMap(),
    val timeRemainingSeconds: Int = 0,
    val attemptId: Int = 0,
    val isSubmitted: Boolean = false
)

data class TestResultsUiState(
    val isLoading: Boolean = true,
    val attempt: MockAttemptEntity? = null,
    val mockTest: MockTestEntity? = null,
    val questions: List<QuestionEntity> = emptyList(),
    val answers: List<MockTestAnswerEntity> = emptyList()
)

@HiltViewModel
class MockTestViewModel @Inject constructor(
    private val mockTestDao: MockTestDao,
    private val mockAttemptDao: MockAttemptDao,
    private val questionDao: QuestionDao,
    private val mockTestAnswerDao: MockTestAnswerDao,
    private val apiService: LoksewaApiService
) : ViewModel() {

    private val _listState = MutableStateFlow(MockTestListUiState())
    val listState: StateFlow<MockTestListUiState> = _listState.asStateFlow()

    private val _sessionState = MutableStateFlow(TestSessionUiState())
    val sessionState: StateFlow<TestSessionUiState> = _sessionState.asStateFlow()

    private val _resultsState = MutableStateFlow(TestResultsUiState())
    val resultsState: StateFlow<TestResultsUiState> = _resultsState.asStateFlow()

    private var timerJob: Job? = null

    fun loadMockTests() {
        viewModelScope.launch {
            _listState.update { it.copy(isLoading = true) }
            try {
                // Fetch local published tests
                var tests = mockTestDao.getPublishedTests()
                if (tests.isEmpty()) {
                    // Seed standard mock test for user experience
                    val sampleTest = MockTestEntity(
                        id = 1,
                        title = "Civil Service Officers General Mock Set 1",
                        description = "Full syllabus coverage including IQ, GK, and civil service administration laws.",
                        examLevel = "Officer",
                        examType = "GK & IQ",
                        syllabusCategory = "Section Officer",
                        durationMinutes = 45,
                        totalQuestions = 50,
                        marksPerCorrect = 2.0f,
                        negativeMarkingEnabled = true,
                        negativeMarksPerWrong = 0.4f,
                        status = "published",
                        createdBy = 1,
                        createdAt = "2026-05-30 00:00:00",
                        updatedAt = "2026-05-30 00:00:00"
                    )
                    mockTestDao.insertMockTests(listOf(sampleTest))
                    tests = listOf(sampleTest)
                }
                _listState.update { it.copy(isLoading = false, tests = tests) }
            } catch (e: Exception) {
                _listState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun startMockTest(testId: Int, userId: Int) {
        timerJob?.cancel()
        viewModelScope.launch {
            _sessionState.update { it.copy(isLoading = true) }
            try {
                val mockTest = mockTestDao.getMockTest(testId) ?: return@launch
                
                // Get verified questions for mock test
                // In production, we'd query questions by categories or mapped table, 
                // but since it's pre-bundled, we retrieve the first 50 verified questions as a seed set
                val questions = questionDao.getVerifiedQuestions(limit = mockTest.totalQuestions)

                val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
                val now = Date()
                val startedAt = sdf.format(now)
                val endsAt = sdf.format(Date(now.time + mockTest.durationMinutes * 60 * 1000))

                val attempt = MockAttemptEntity(
                    userId = userId,
                    mockTestId = testId,
                    startedAt = startedAt,
                    endsAt = endsAt,
                    status = "in_progress",
                    score = 0f,
                    correctCount = 0,
                    wrongCount = 0,
                    unansweredCount = questions.size,
                    totalQuestions = questions.size,
                    totalMarks = questions.size * mockTest.marksPerCorrect
                )

                val attemptId = mockAttemptDao.insertAttempt(attempt).toInt()

                _sessionState.update {
                    TestSessionUiState(
                        isLoading = false,
                        mockTest = mockTest,
                        questions = questions,
                        currentQuestionIndex = 0,
                        selectedAnswers = emptyMap(),
                        timeRemainingSeconds = mockTest.durationMinutes * 60,
                        attemptId = attemptId,
                        isSubmitted = false
                    )
                }

                startTimer()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun startTimer() {
        timerJob = viewModelScope.launch {
            while (_sessionState.value.timeRemainingSeconds > 0 && !_sessionState.value.isSubmitted) {
                delay(1000L)
                _sessionState.update { it.copy(timeRemainingSeconds = it.timeRemainingSeconds - 1) }
            }
            if (_sessionState.value.timeRemainingSeconds == 0 && !_sessionState.value.isSubmitted) {
                submitMockTest()
            }
        }
    }

    fun selectOption(questionId: Int, option: String) {
        _sessionState.update {
            val updated = it.selectedAnswers.toMutableMap()
            updated[questionId] = option
            it.copy(selectedAnswers = updated)
        }
    }

    fun nextQuestion() {
        _sessionState.update {
            if (it.currentQuestionIndex < it.questions.size - 1) {
                it.copy(currentQuestionIndex = it.currentQuestionIndex + 1)
            } else it
        }
    }

    fun prevQuestion() {
        _sessionState.update {
            if (it.currentQuestionIndex > 0) {
                it.copy(currentQuestionIndex = it.currentQuestionIndex - 1)
            } else it
        }
    }

    fun submitMockTest() {
        timerJob?.cancel()
        val session = _sessionState.value
        val mockTest = session.mockTest ?: return

        viewModelScope.launch {
            var correctCount = 0
            var wrongCount = 0
            var unansweredCount = 0
            val answersToInsert = mutableListOf<MockTestAnswerEntity>()

            session.questions.forEach { question ->
                val selected = session.selectedAnswers[question.id]
                val nowStr = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
                
                if (selected == null) {
                    unansweredCount++
                    answersToInsert.add(
                        MockTestAnswerEntity(
                            attemptId = session.attemptId,
                            questionId = question.id,
                            selectedOption = null,
                            isCorrect = false,
                            marksAwarded = 0f,
                            answeredAt = nowStr
                        )
                    )
                } else {
                    val isCorrect = selected == question.correctOption
                    val marks = if (isCorrect) {
                        correctCount++
                        mockTest.marksPerCorrect
                    } else {
                        wrongCount++
                        if (mockTest.negativeMarkingEnabled) -mockTest.negativeMarksPerWrong else 0f
                    }

                    answersToInsert.add(
                        MockTestAnswerEntity(
                            attemptId = session.attemptId,
                            questionId = question.id,
                            selectedOption = selected,
                            isCorrect = isCorrect,
                            marksAwarded = marks,
                            answeredAt = nowStr
                        )
                    )
                }
            }

            val finalScore = (correctCount * mockTest.marksPerCorrect) - 
                    (wrongCount * (if (mockTest.negativeMarkingEnabled) mockTest.negativeMarksPerWrong else 0f))

            mockTestAnswerDao.insertAnswers(answersToInsert)

            val nowStr = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
            mockAttemptDao.updateAttemptResults(
                id = session.attemptId,
                status = "submitted",
                submittedAt = nowStr,
                score = finalScore,
                correct = correctCount,
                wrong = wrongCount,
                unanswered = unansweredCount
            )

            _sessionState.update { it.copy(isSubmitted = true) }
        }
    }

    fun loadAttemptResults(attemptId: Int) {
        viewModelScope.launch {
            _resultsState.update { it.copy(isLoading = true) }
            try {
                val attempt = mockAttemptDao.getAttemptById(attemptId)
                if (attempt != null) {
                    val mockTest = mockTestDao.getMockTest(attempt.mockTestId)
                    val answers = mockTestAnswerDao.getAnswersForAttempt(attemptId)
                    
                    // Retrieve matched questions
                    val questions = answers.mapNotNull { questionDao.getQuestion(it.questionId) }

                    _resultsState.update {
                        TestResultsUiState(
                            isLoading = false,
                            attempt = attempt,
                            mockTest = mockTest,
                            questions = questions,
                            answers = answers
                        )
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
