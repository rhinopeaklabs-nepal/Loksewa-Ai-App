package com.loksewa.aiapp.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Quiz
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.data.remote.GoogleAuthClient
import com.loksewa.aiapp.data.remote.GoogleAuthSession
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

private val AppBg = Color(0xFFF6FAFF)
private val Surface = Color.White
private val Ink = Color(0xFF223044)
private val Muted = Color(0xFF6E7A8A)
private val Faint = Color(0xFFE3EAF3)
private val Leaf = Color(0xFF2DBE5F)
private val LeafDark = Color(0xFF159447)
private val Sky = Color(0xFF1DA1F2)
private val Amber = Color(0xFFFFB020)
private val Coral = Color(0xFFFF5A5F)
private val Purple = Color(0xFF845EF7)
private val Mint = Color(0xFF00BFA6)
private val Navy = Color(0xFF253858)
private val Disabled = Color(0xFFCAD4DF)

data class LessonNode(
    val id: Int,
    val unit: String,
    val title: String,
    val subtitle: String,
    val xp: Int,
    val icon: ImageVector,
    val color: Color
)

data class PracticeQuestion(
    val title: String,
    val tag: String,
    val options: List<Pair<String, String>>,
    val correct: String,
    val explanation: String
)

data class MockExam(
    val title: String,
    val subtitle: String,
    val score: Int,
    val locked: Boolean
)

data class StudyPack(val title: String, val subtitle: String, val progress: Float, val color: Color)

data class AppNotification(
    val id: Int,
    val title: String,
    val body: String,
    val category: String,
    val time: String,
    val color: Color,
    val icon: ImageVector,
    val unread: Boolean
)

class LoksewaLearningState {
    var userName by mutableStateOf("Loksewa Student")
    var email by mutableStateOf("student@loksewa.local")
    var isSignedIn by mutableStateOf(false)
    var xp by mutableStateOf(1240)
    var streak by mutableStateOf(7)
    var hearts by mutableStateOf(5)
    var gems by mutableStateOf(320)
    var selectedAnswer by mutableStateOf<String?>(null)
    var lastWasCorrect by mutableStateOf(true)
    var completedLessons by mutableStateOf(setOf(1, 2, 3))
    var currentQuestionIndex by mutableStateOf(0)

    val lessons = listOf(
        LessonNode(1, "Unit 1", "Nepal Basics", "Geography and state facts", 15, Icons.Default.Shield, Leaf),
        LessonNode(2, "Unit 1", "Constitution", "Rights, duties, bodies", 20, Icons.Default.MenuBook, Sky),
        LessonNode(3, "Unit 1", "Current Affairs", "Daily recall sprint", 15, Icons.Default.Lightbulb, Amber),
        LessonNode(4, "Unit 2", "Reasoning", "Series and analogy", 25, Icons.Default.Psychology, Purple),
        LessonNode(5, "Unit 2", "Mock Sprint", "Timed mixed practice", 30, Icons.Default.Assignment, Coral),
        LessonNode(6, "Unit 3", "Admin Basics", "Policy and service delivery", 25, Icons.Default.WorkspacePremium, Mint),
        LessonNode(7, "Unit 3", "Weak Topic Fix", "AI guided revision", 30, Icons.Default.AutoAwesome, Sky),
        LessonNode(8, "Final", "Full Mock", "Exam-ready checkpoint", 40, Icons.Default.EmojiEvents, Amber)
    )

    val questions = listOf(
        PracticeQuestion(
            title = "Which is the longest river in Nepal?",
            tag = "Geography",
            options = listOf("A" to "Koshi", "B" to "Gandaki", "C" to "Karnali", "D" to "Mahakali"),
            correct = "C",
            explanation = "Karnali is generally regarded as the longest river system within Nepal."
        ),
        PracticeQuestion(
            title = "Which schedule of Nepal's constitution lists local level powers?",
            tag = "Constitution",
            options = listOf("A" to "Schedule 5", "B" to "Schedule 6", "C" to "Schedule 8", "D" to "Schedule 9"),
            correct = "C",
            explanation = "Schedule 8 lists powers assigned to the local level."
        ),
        PracticeQuestion(
            title = "In a number series, what should you check first?",
            tag = "Reasoning",
            options = listOf("A" to "Random guessing", "B" to "Difference pattern", "C" to "Longest option", "D" to "Alphabet order"),
            correct = "B",
            explanation = "Difference and ratio patterns are the fastest first checks for most series questions."
        )
    )

    val currentQuestion: PracticeQuestion
        get() = questions[currentQuestionIndex % questions.size]

    val progress: Float
        get() = completedLessons.size / lessons.size.toFloat()

    val accuracy: Int
        get() = 68 + completedLessons.size * 3

    val nextLesson: LessonNode
        get() = lessons.firstOrNull { it.id !in completedLessons } ?: lessons.last()

    fun applySession(session: GoogleAuthSession) {
        userName = session.fullName.ifBlank { "Loksewa Student" }
        email = session.email.ifBlank { "student@loksewa.local" }
        isSignedIn = true
    }

    fun answer(option: String) {
        selectedAnswer = option
        lastWasCorrect = option == currentQuestion.correct
        if (lastWasCorrect) {
            xp += 10
            gems += 3
        } else {
            hearts = (hearts - 1).coerceAtLeast(0)
        }
    }

    fun continueAfterResult() {
        val lesson = nextLesson
        completedLessons = completedLessons + lesson.id
        xp += lesson.xp
        gems += 5
        streak = (streak + 1).coerceAtMost(99)
        hearts = (hearts + 1).coerceAtMost(5)
        selectedAnswer = null
        currentQuestionIndex += 1
    }

    fun resetSession() {
        userName = "Loksewa Student"
        email = "student@loksewa.local"
        isSignedIn = false
        selectedAnswer = null
    }

    fun notifications(): List<AppNotification> = listOf(
        AppNotification(
            1,
            "Your next lesson is ready",
            "${nextLesson.title} is unlocked. Finish it to keep your streak alive.",
            "Lesson",
            "Now",
            Leaf,
            Icons.Default.PlayArrow,
            true
        ),
        AppNotification(
            2,
            "Weak topic detected",
            "Reasoning accuracy is below your GK score. Try a five-question sprint.",
            "Practice",
            "12 min",
            Coral,
            Icons.Default.Psychology,
            true
        ),
        AppNotification(
            3,
            "Mock score improved",
            "Your average score moved to ${accuracy}%. Review the new analytics card.",
            "Analytics",
            "Today",
            Sky,
            Icons.Default.BarChart,
            false
        ),
        AppNotification(
            4,
            "Study pack synced",
            "Constitution notes and bookmarked questions are ready for offline review.",
            "Study",
            "Yesterday",
            Purple,
            Icons.Default.Download,
            false
        )
    )
}

private val LocalLearningState = compositionLocalOf<LoksewaLearningState> {
    error("LoksewaLearningState is not provided")
}

@Composable
fun rememberLoksewaLearningState(): LoksewaLearningState = remember { LoksewaLearningState() }

@Composable
fun LoksewaLearningProvider(state: LoksewaLearningState, content: @Composable () -> Unit) {
    CompositionLocalProvider(LocalLearningState provides state, content = content)
}

@Composable
fun ReferenceSplashScreen(onDone: () -> Unit) {
    LaunchedEffect(Unit) {
        delay(900)
        onDone()
    }

    PhoneSurface {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 26.dp, vertical = 36.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(42.dp))
            LoksewaLogo(Modifier.size(158.dp))
            Spacer(Modifier.height(22.dp))
            Text("LOKSEWA AI", color = Ink, fontSize = 34.sp, fontWeight = FontWeight.Black)
            Text(
                "Tiny lessons for big exam progress",
                color = Muted,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center
            )
            Spacer(Modifier.height(34.dp))
            ProgressTrack(progress = 0.64f, color = Leaf)
            Spacer(Modifier.weight(1f))
            FeatureStrip()
            Spacer(Modifier.height(18.dp))
            PageDots(active = 0)
        }
    }
}

@Composable
fun ReferenceOnboardingScreen(step: Int, onNext: () -> Unit, onSkip: () -> Unit) {
    val first = step == 1
    PhoneSurface {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 22.dp, vertical = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                Text(
                    "Skip",
                    color = Muted,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable(onClick = onSkip)
                )
            }
            Spacer(Modifier.height(42.dp))
            OnboardingArt(first)
            Spacer(Modifier.height(34.dp))
            Text(
                if (first) "Learn in small wins" else "Train for exam day",
                color = Ink,
                fontSize = 30.sp,
                lineHeight = 36.sp,
                fontWeight = FontWeight.Black,
                textAlign = TextAlign.Center
            )
            Spacer(Modifier.height(12.dp))
            Text(
                if (first) "Complete bite-size lessons, earn XP, and keep your Loksewa streak alive."
                else "Practice mocks, fix weak topics, and watch your score climb every week.",
                color = Muted,
                fontSize = 16.sp,
                lineHeight = 23.sp,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center
            )
            Spacer(Modifier.weight(1f))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                PageDots(active = step)
                RoundIconButton(icon = Icons.AutoMirrored.Filled.ArrowForward, color = Leaf, onClick = onNext)
            }
        }
    }
}

@Composable
fun ReferenceGetStartedScreen(
    onBack: () -> Unit,
    onEmail: () -> Unit,
    onGoogle: () -> Unit,
    onApple: () -> Unit
) {
    GoogleAuthSurface(
        showBack = true,
        onBack = onBack,
        title = "Start your Loksewa streak",
        subtitle = "Sign in with Google and jump into your personalized lesson path.",
        onSuccess = onGoogle
    )
}

@Composable
fun ReferenceLoginScreen(onLogin: () -> Unit, onRegister: () -> Unit) {
    GoogleAuthSurface(
        showBack = false,
        onBack = {},
        title = "Welcome back",
        subtitle = "Continue with your Google account to resume lessons, mocks, and XP.",
        onSuccess = onLogin
    )
}

@Composable
fun ReferenceSignUpScreen(onSignUp: () -> Unit, onLogin: () -> Unit) {
    GoogleAuthSurface(
        showBack = false,
        onBack = {},
        title = "Create your profile",
        subtitle = "Use Google or your email password to start learning.",
        onSuccess = onSignUp
    )
}

@Composable
private fun GoogleAuthSurface(
    showBack: Boolean,
    onBack: () -> Unit,
    title: String,
    subtitle: String,
    onSuccess: () -> Unit
) {
    val state = LocalLearningState.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var loading by remember { mutableStateOf(false) }
    var loadingEmail by remember { mutableStateOf(false) }
    var resetting by remember { mutableStateOf(false) }
    var rememberMe by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var note by remember { mutableStateOf<String?>(null) }

    PhoneSurface {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Start) {
                if (showBack) {
                    IconButton(onClick = onBack, modifier = Modifier.size(42.dp)) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Ink)
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
            LoksewaLogo(Modifier.size(104.dp))
            Spacer(Modifier.height(18.dp))
            Text(title, color = Ink, fontSize = 30.sp, lineHeight = 35.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.Center)
            Spacer(Modifier.height(10.dp))
            Text(subtitle, color = Muted, fontSize = 16.sp, lineHeight = 23.sp, textAlign = TextAlign.Center)
            Spacer(Modifier.height(24.dp))
            GoogleButton(
                loading = loading,
                onClick = {
                    loading = true
                    error = null
                    note = null
                    scope.launch {
                        GoogleAuthClient.signInWithGoogle(context, rememberMe)
                            .onSuccess {
                                state.applySession(it)
                                onSuccess()
                            }
                            .onFailure {
                                error = it.message ?: "Google sign-in failed"
                            }
                        loading = false
                    }
                }
            )
            Spacer(Modifier.height(18.dp))
            DividerLabel("or login with email")
            Spacer(Modifier.height(16.dp))
            AuthInputField(
                label = "Email address",
                value = email,
                onValueChange = { email = it },
                leading = Icons.Default.Email,
                keyboardType = KeyboardType.Email
            )
            Spacer(Modifier.height(12.dp))
            AuthInputField(
                label = "Password",
                value = password,
                onValueChange = { password = it },
                leading = Icons.Default.Lock,
                keyboardType = KeyboardType.Password,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                trailing = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                            tint = Muted
                        )
                    }
                }
            )
            Spacer(Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(checked = rememberMe, onCheckedChange = { rememberMe = it })
                Text(
                    "Remember me",
                    color = Ink,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                TextButton(
                    enabled = !resetting,
                    onClick = {
                        error = null
                        note = null
                        if (!email.isValidEmail()) {
                            error = "Enter your email first, then tap Forgot password."
                            return@TextButton
                        }
                        resetting = true
                        scope.launch {
                            GoogleAuthClient.requestPasswordReset(email)
                                .onSuccess {
                                    note = "If this account exists, reset instructions will be sent."
                                }
                                .onFailure {
                                    error = it.message ?: "Password reset failed"
                                }
                            resetting = false
                        }
                    }
                ) {
                    Text(if (resetting) "Sending..." else "Forgot password?", color = Sky, fontWeight = FontWeight.Black)
                }
            }
            Spacer(Modifier.height(8.dp))
            PrimaryButton(
                text = if (loadingEmail) "Signing in..." else "Login",
                enabled = !loadingEmail && email.isNotBlank() && password.isNotBlank(),
                onClick = {
                    error = null
                    note = null
                    if (!email.isValidEmail()) {
                        error = "Enter a valid email address."
                        return@PrimaryButton
                    }
                    loadingEmail = true
                    scope.launch {
                        GoogleAuthClient.signInWithEmail(context, email, password, rememberMe)
                            .onSuccess {
                                state.applySession(it)
                                onSuccess()
                            }
                            .onFailure {
                                error = it.message ?: "Email login failed"
                            }
                        loadingEmail = false
                    }
                }
            )
            if (error != null) {
                Spacer(Modifier.height(14.dp))
                MessageCard(error.orEmpty(), Coral)
            }
            if (note != null) {
                Spacer(Modifier.height(14.dp))
                MessageCard(note.orEmpty(), Leaf)
            }
            Spacer(Modifier.height(18.dp))
            Text("Secure login for practice sync and progress backup.", color = Muted, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun ReferenceHomeScreen(
    onMockTests: () -> Unit,
    onPractice: () -> Unit,
    onStudy: () -> Unit,
    onBookmarks: () -> Unit,
    onTutor: () -> Unit,
    onAnalytics: () -> Unit,
    onProfile: () -> Unit,
    onNotifications: () -> Unit
) {
    val state = LocalLearningState.current
    PhoneSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 18.dp, top = 22.dp, end = 18.dp, bottom = 112.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("Hi, ${state.userName.firstName()}", color = Ink, fontSize = 25.sp, fontWeight = FontWeight.Black)
                        Text("Keep your ${state.streak}-day streak going.", color = Muted, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    }
                    IconButton(onClick = onNotifications) {
                        Box(contentAlignment = Alignment.TopEnd) {
                            Icon(Icons.Default.Notifications, contentDescription = "Notifications", tint = Navy, modifier = Modifier.size(28.dp))
                            Box(Modifier.size(9.dp).clip(CircleShape).background(Coral))
                        }
                    }
                }
            }
            item { StatsRow(state) }
            item {
                DailyQuestCard(state = state, onPractice = onPractice, onAnalytics = onAnalytics)
            }
            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    QuickAction("Practice", Icons.Default.Quiz, Leaf, onPractice, Modifier.weight(1f))
                    QuickAction("Mocks", Icons.Default.Assignment, Sky, onMockTests, Modifier.weight(1f))
                    QuickAction("Tutor", Icons.Default.Psychology, Purple, onTutor, Modifier.weight(1f))
                }
            }
            item {
                Text("Learning path", color = Ink, fontSize = 19.sp, fontWeight = FontWeight.Black)
                Text("Complete lessons to unlock the next exam checkpoint.", color = Muted, fontSize = 13.sp)
            }
            item {
                LessonPath(state = state, onPractice = onPractice, onStudy = onStudy, onBookmarks = onBookmarks, onProfile = onProfile)
            }
        }
    }
}

@Composable
fun ReferenceMockTestsScreen(onStartPractice: () -> Unit) {
    val state = LocalLearningState.current
    val tests = listOf(
        MockExam("Daily Mini Mock", "10 adaptive questions", state.accuracy, false),
        MockExam("Section Officer Set", "100 questions - 2 hours", 78, false),
        MockExam("Constitution Drill", "30 article recall questions", 64, false),
        MockExam("Full Length Mock 3", "Unlock after Unit 2", 0, true),
        MockExam("Final Confidence Mock", "Unlock after all lessons", 0, true)
    )
    PhoneSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 112.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item { ScreenTitle("Mock tests", "Train with timed sets and adaptive review.") }
            item { SegmentTabs(listOf("All", "Subject", "Level"), selected = 0) }
            items(tests) { exam ->
                MockCard(exam = exam, onClick = if (exam.locked) ({}) else onStartPractice)
            }
        }
    }
}

@Composable
fun ReferencePracticeQuestionScreen(onBack: () -> Unit, onResult: () -> Unit) {
    val state = LocalLearningState.current
    val question = state.currentQuestion

    PhoneSurface {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 24.dp)
        ) {
            HeaderLine(title = "Practice", trailing = "${state.currentQuestionIndex + 1}/${state.questions.size}", onBack = onBack)
            Spacer(Modifier.height(18.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                SmallChip(question.tag, Sky)
                SmallChip("+10 XP", Amber)
                SmallChip("${state.hearts} hearts", Coral)
            }
            Spacer(Modifier.height(18.dp))
            RoundedCard(color = Surface) {
                Text(question.title, color = Ink, fontSize = 22.sp, lineHeight = 29.sp, fontWeight = FontWeight.Black)
            }
            Spacer(Modifier.height(16.dp))
            question.options.forEach { (letter, label) ->
                AnswerOption(
                    letter = letter,
                    text = label,
                    selected = state.selectedAnswer == letter,
                    correct = letter == question.correct,
                    revealed = state.selectedAnswer != null,
                    onClick = {
                        if (state.selectedAnswer == null) state.answer(letter)
                    }
                )
                Spacer(Modifier.height(10.dp))
            }
            Spacer(Modifier.weight(1f))
            PrimaryButton(
                text = if (state.selectedAnswer == null) "Choose an answer" else "Continue",
                enabled = state.selectedAnswer != null,
                onClick = onResult
            )
        }
    }
}

@Composable
fun ReferenceQuestionResultScreen(onBack: () -> Unit, onNext: () -> Unit) {
    val state = LocalLearningState.current
    val question = state.currentQuestion
    val resultColor = if (state.lastWasCorrect) Leaf else Coral
    PhoneSurface {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            HeaderLine(title = "Result", onBack = onBack)
            Spacer(Modifier.height(34.dp))
            ResultBadge(correct = state.lastWasCorrect)
            Spacer(Modifier.height(16.dp))
            Text(
                if (state.lastWasCorrect) "Correct" else "Review this one",
                color = Ink,
                fontSize = 28.sp,
                fontWeight = FontWeight.Black
            )
            Text(
                if (state.lastWasCorrect) "+10 XP added to your lesson path." else "No worries. Your weak topic list learned from it.",
                color = Muted,
                fontSize = 15.sp,
                textAlign = TextAlign.Center
            )
            Spacer(Modifier.height(24.dp))
            RoundedCard(color = resultColor.copy(alpha = 0.10f), borderColor = resultColor.copy(alpha = 0.35f)) {
                Text("Correct answer", color = Muted, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Text(
                    question.options.first { it.first == question.correct }.second,
                    color = resultColor,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black
                )
                Spacer(Modifier.height(10.dp))
                Text(question.explanation, color = Ink, fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight.Medium)
            }
            Spacer(Modifier.weight(1f))
            PrimaryButton(
                text = "Continue",
                onClick = {
                    state.continueAfterResult()
                    onNext()
                }
            )
        }
    }
}

@Composable
fun ReferenceTestResultScreen(onAnalytics: () -> Unit, onReview: () -> Unit) {
    val state = LocalLearningState.current
    PhoneSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 112.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item { HeaderLine(title = "Lesson complete", onBack = onReview) }
            item {
                ScoreRing(score = state.accuracy, modifier = Modifier.size(156.dp), color = Leaf)
                Spacer(Modifier.height(8.dp))
                Text("Great progress", color = Ink, fontSize = 27.sp, fontWeight = FontWeight.Black)
                Text("You earned XP and moved forward on the path.", color = Muted, textAlign = TextAlign.Center)
            }
            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    MetricCard("XP", state.xp.toString(), Leaf, Modifier.weight(1f))
                    MetricCard("Streak", "${state.streak}d", Amber, Modifier.weight(1f))
                    MetricCard("Accuracy", "${state.accuracy}%", Sky, Modifier.weight(1f))
                }
            }
            item { PrimaryButton("View analytics", onClick = onAnalytics) }
            item { SecondaryButton("Review questions", onClick = onReview) }
        }
    }
}

@Composable
fun ReferenceAnalyticsScreen() {
    val state = LocalLearningState.current
    PhoneSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 112.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item { ScreenTitle("Analytics", "Your preparation signals, simplified.") }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    MetricCard("Lessons", "${state.completedLessons.size}/${state.lessons.size}", Leaf, Modifier.weight(1f))
                    MetricCard("Avg score", "${state.accuracy}%", Sky, Modifier.weight(1f))
                    MetricCard("Gems", state.gems.toString(), Purple, Modifier.weight(1f))
                }
            }
            item {
                RoundedCard {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Icon(Icons.Default.Timeline, contentDescription = null, tint = Leaf)
                        Text("Score trend", color = Ink, fontSize = 18.sp, fontWeight = FontWeight.Black)
                    }
                    Spacer(Modifier.height(18.dp))
                    TrendChart(Modifier.fillMaxWidth().height(145.dp))
                }
            }
            items(listOf(
                StudyPack("General Knowledge", "Strongest topic", 0.78f, Leaf),
                StudyPack("Constitution", "Needs article recall", 0.61f, Sky),
                StudyPack("Reasoning", "Practice speed drills", 0.48f, Coral)
            )) { pack ->
                SubjectProgress(pack)
            }
        }
    }
}

@Composable
fun ReferenceAiTutorScreen(onBack: () -> Unit) {
    val state = LocalLearningState.current
    var input by remember { mutableStateOf("") }
    var messages by remember {
        mutableStateOf(
            listOf(
                "Ask me about Loksewa topics, weak lessons, or mock strategy.",
                "Your next smart review is ${state.nextLesson.title}."
            )
        )
    }
    PhoneSurface {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 24.dp)
        ) {
            HeaderLine(title = "AI Tutor", onBack = onBack)
            Spacer(Modifier.height(18.dp))
            TutorAvatar()
            Spacer(Modifier.height(16.dp))
            Column(Modifier.weight(1f).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                messages.forEachIndexed { index, message ->
                    TutorBubble(message, own = index % 2 == 1)
                }
            }
            ChatInput(
                value = input,
                onValueChange = { input = it },
                onSend = {
                    if (input.isNotBlank()) {
                        messages = messages + input.trim() + "Focus on one concept, solve three questions, then review mistakes."
                        input = ""
                    }
                }
            )
        }
    }
}

@Composable
fun ReferenceStudyMaterialsScreen(onBookmarks: () -> Unit) {
    val packs = listOf(
        StudyPack("Nepal Constitution", "31 bite-size chapters", 0.72f, Sky),
        StudyPack("Nepal Geography", "Rivers, mountains, provinces", 0.58f, Leaf),
        StudyPack("Current Affairs", "Weekly revision deck", 0.46f, Amber),
        StudyPack("Economics", "High-yield concepts", 0.34f, Purple),
        StudyPack("General Knowledge", "Fact recall flashcards", 0.80f, Coral)
    )
    PhoneSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 112.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    ScreenTitle("Study", "Downloadable packs and flashcards.", Modifier.weight(1f))
                    IconButton(onClick = onBookmarks) {
                        Icon(Icons.Default.Bookmark, contentDescription = "Bookmarks", tint = Sky)
                    }
                }
            }
            item { SegmentTabs(listOf("All", "Subjects", "Saved"), selected = 0) }
            items(packs) { pack -> StudyPackCard(pack) }
        }
    }
}

@Composable
fun ReferenceBookmarksScreen() {
    val state = LocalLearningState.current
    val saved = listOf(
        state.currentQuestion.title,
        "Fundamental rights in Nepal constitution",
        "High-frequency river system facts",
        "Public service delivery principles",
        "Fast series pattern checklist"
    )
    PhoneSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 112.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item { ScreenTitle("Bookmarks", "Saved questions and notes for revision.") }
            item { SegmentTabs(listOf("Questions", "Notes", "Materials"), selected = 0) }
            items(saved) { BookmarkCard(it) }
        }
    }
}

@Composable
fun ReferenceNotificationsScreen(onBack: () -> Unit, onOpenDetail: (Int) -> Unit) {
    val state = LocalLearningState.current
    PhoneSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 28.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item { HeaderLine(title = "Notifications", trailing = "${state.notifications().count { it.unread }} new", onBack = onBack) }
            items(state.notifications()) { notification ->
                NotificationCard(notification = notification, onClick = { onOpenDetail(notification.id) })
            }
        }
    }
}

@Composable
fun ReferenceNotificationDetailScreen(
    notificationId: Int,
    onBack: () -> Unit,
    onPractice: () -> Unit,
    onAnalytics: () -> Unit
) {
    val state = LocalLearningState.current
    val item = state.notifications().firstOrNull { it.id == notificationId } ?: state.notifications().first()
    PhoneSurface {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 24.dp)
        ) {
            HeaderLine(title = item.category, onBack = onBack)
            Spacer(Modifier.height(22.dp))
            BigIconCircle(icon = item.icon, color = item.color)
            Spacer(Modifier.height(18.dp))
            Text(item.title, color = Ink, fontSize = 27.sp, lineHeight = 33.sp, fontWeight = FontWeight.Black)
            Spacer(Modifier.height(10.dp))
            Text(item.body, color = Muted, fontSize = 16.sp, lineHeight = 23.sp)
            Spacer(Modifier.height(22.dp))
            RoundedCard {
                Text("What changed", color = Ink, fontSize = 18.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.height(10.dp))
                TimelineRow("Your score, streak, and lesson path were refreshed.")
                TimelineRow("AI picked ${state.nextLesson.title} as the next best step.")
                TimelineRow("Practice now to protect your ${state.streak}-day streak.")
            }
            Spacer(Modifier.weight(1f))
            PrimaryButton("Start practice", onClick = onPractice)
            Spacer(Modifier.height(10.dp))
            SecondaryButton("Open analytics", onClick = onAnalytics)
        }
    }
}

@Composable
fun ReferenceProfileScreen(onOpenDetail: (String) -> Unit, onLogout: () -> Unit) {
    val state = LocalLearningState.current
    val context = LocalContext.current
    val rows = listOf(
        ProfileItem(Icons.Default.Person, "Edit Profile", "edit-profile"),
        ProfileItem(Icons.Default.Timeline, "Study Plan", "study-plan"),
        ProfileItem(Icons.Default.CreditCard, "Subscription", "subscription"),
        ProfileItem(Icons.Default.Assignment, "Payment History", "payment-history"),
        ProfileItem(Icons.Default.Settings, "Settings", "settings"),
        ProfileItem(Icons.Default.HelpOutline, "Help & Support", "help-support")
    )
    PhoneSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 112.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                ProfileHero(state)
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    MetricCard("XP", state.xp.toString(), Leaf, Modifier.weight(1f))
                    MetricCard("Streak", "${state.streak}d", Amber, Modifier.weight(1f))
                    MetricCard("Hearts", state.hearts.toString(), Coral, Modifier.weight(1f))
                }
            }
            items(rows) { row ->
                ProfileRow(row.icon, row.label, onClick = { onOpenDetail(row.key) })
            }
            item {
                ProfileRow(Icons.AutoMirrored.Filled.Logout, "Logout", danger = true) {
                    GoogleAuthClient.clearSession(context)
                    state.resetSession()
                    onLogout()
                }
            }
        }
    }
}

@Composable
fun ReferenceProfileDetailScreen(section: String, onBack: () -> Unit) {
    val detail = profileDetails[section] ?: profileDetails.getValue("settings")
    PhoneSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 18.dp, top = 24.dp, end = 18.dp, bottom = 28.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item { HeaderLine(title = detail.title, onBack = onBack) }
            item {
                RoundedCard(color = detail.color.copy(alpha = 0.10f), borderColor = detail.color.copy(alpha = 0.28f)) {
                    BigIconCircle(icon = detail.icon, color = detail.color)
                    Spacer(Modifier.height(12.dp))
                    Text(detail.title, color = Ink, fontSize = 24.sp, fontWeight = FontWeight.Black)
                    Text(detail.subtitle, color = Muted, fontSize = 14.sp, lineHeight = 21.sp)
                }
            }
            items(detail.rows) { row -> DetailRowCard(row) }
        }
    }
}

@Composable
fun ReferenceBottomNav(
    currentRoute: String?,
    onHome: () -> Unit,
    onTests: () -> Unit,
    onStudy: () -> Unit,
    onAnalytics: () -> Unit,
    onProfile: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(78.dp)
            .background(Surface)
            .border(BorderStroke(1.dp, Faint))
            .padding(horizontal = 8.dp, vertical = 7.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        NavItem("Learn", Icons.Default.Home, currentRoute == "home", onHome, Modifier.weight(1f))
        NavItem("Tests", Icons.Default.Assignment, currentRoute == "mock_tests", onTests, Modifier.weight(1f))
        NavItem("Study", Icons.Default.MenuBook, currentRoute == "study" || currentRoute == "bookmarks", onStudy, Modifier.weight(1f))
        NavItem("Stats", Icons.Default.BarChart, currentRoute == "analytics", onAnalytics, Modifier.weight(1f))
        NavItem("Profile", Icons.Default.Person, currentRoute == "profile", onProfile, Modifier.weight(1f))
    }
}

@Composable
private fun PhoneSurface(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(AppBg)
    ) {
        content()
    }
}

@Composable
private fun LoksewaLogo(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(30.dp))
            .background(Color(0xFF06101F)),
        contentAlignment = Alignment.Center
    ) {
        Text("L", color = Color.White, fontSize = 58.sp, fontWeight = FontWeight.Black)
        Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Amber, modifier = Modifier.align(Alignment.TopEnd).padding(16.dp).size(22.dp))
        Icon(Icons.Default.MenuBook, contentDescription = null, tint = Sky, modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 13.dp).size(28.dp))
    }
}

@Composable
private fun FeatureStrip() {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        FeaturePill(Icons.Default.Shield, "Trusted", Leaf, Modifier.weight(1f))
        FeaturePill(Icons.Default.Quiz, "Practice", Sky, Modifier.weight(1f))
        FeaturePill(Icons.Default.TrendingUp, "Progress", Amber, Modifier.weight(1f))
    }
}

@Composable
private fun FeaturePill(icon: ImageVector, label: String, color: Color, modifier: Modifier = Modifier) {
    RoundedCard(modifier = modifier, padding = PaddingValues(10.dp), color = Surface) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
        Spacer(Modifier.height(6.dp))
        Text(label, color = Ink, fontSize = 12.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
    }
}

@Composable
private fun OnboardingArt(first: Boolean) {
    Box(Modifier.fillMaxWidth().height(260.dp), contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val base = if (first) Leaf else Sky
            drawCircle(base.copy(alpha = 0.12f), radius = size.minDimension * 0.47f, center = center)
            drawCircle(Amber.copy(alpha = 0.14f), radius = size.minDimension * 0.28f, center = Offset(size.width * 0.68f, size.height * 0.32f))
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            BigIconCircle(if (first) Icons.Default.Star else Icons.Default.EmojiEvents, if (first) Leaf else Amber, size = 132)
            Spacer(Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                SmallLessonDot(Leaf, checked = true)
                SmallLessonDot(Sky, checked = true)
                SmallLessonDot(Amber, checked = false)
                SmallLessonDot(Purple, checked = false)
            }
        }
    }
}

@Composable
private fun PageDots(active: Int) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        repeat(4) { index ->
            Box(
                Modifier
                    .width(if (index == active) 28.dp else 10.dp)
                    .height(8.dp)
                    .clip(RoundedCornerShape(99.dp))
                    .background(if (index == active) Leaf else Faint)
            )
        }
    }
}

@Composable
private fun StatsRow(state: LoksewaLearningState) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        StatPill(Icons.Default.LocalFireDepartment, "${state.streak}", Amber, Modifier.weight(1f))
        StatPill(Icons.Default.Favorite, "${state.hearts}", Coral, Modifier.weight(1f))
        StatPill(Icons.Default.Diamond, "${state.gems}", Sky, Modifier.weight(1f))
        StatPill(Icons.Default.Star, "${state.xp}", Purple, Modifier.weight(1f))
    }
}

@Composable
private fun StatPill(icon: ImageVector, value: String, color: Color, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .height(42.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Surface)
            .border(1.dp, Faint, RoundedCornerShape(8.dp))
            .padding(horizontal = 9.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
        Spacer(Modifier.width(4.dp))
        Text(value, color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Black, maxLines = 1)
    }
}

@Composable
private fun DailyQuestCard(state: LoksewaLearningState, onPractice: () -> Unit, onAnalytics: () -> Unit) {
    RoundedCard(color = Leaf.copy(alpha = 0.10f), borderColor = Leaf.copy(alpha = 0.25f)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            ScoreRing(score = (state.progress * 100).roundToInt(), modifier = Modifier.size(82.dp), color = Leaf, label = "Path")
            Column(Modifier.weight(1f)) {
                Text("Daily quest", color = Ink, fontSize = 20.sp, fontWeight = FontWeight.Black)
                Text("Finish ${state.nextLesson.title} to collect ${state.nextLesson.xp} XP.", color = Muted, fontSize = 13.sp, lineHeight = 18.sp)
                Spacer(Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    MiniButton("Start", Leaf, onPractice)
                    MiniButton("Stats", Sky, onAnalytics)
                }
            }
        }
    }
}

@Composable
private fun QuickAction(label: String, icon: ImageVector, color: Color, onClick: () -> Unit, modifier: Modifier = Modifier) {
    RoundedCard(modifier = modifier.clickable(onClick = onClick), color = Surface, padding = PaddingValues(12.dp)) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(26.dp))
        Spacer(Modifier.height(8.dp))
        Text(label, color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Black, maxLines = 1)
    }
}

@Composable
private fun LessonPath(
    state: LoksewaLearningState,
    onPractice: () -> Unit,
    onStudy: () -> Unit,
    onBookmarks: () -> Unit,
    onProfile: () -> Unit
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        state.lessons.forEachIndexed { index, lesson ->
            val completed = lesson.id in state.completedLessons
            val unlocked = completed || lesson.id == state.nextLesson.id
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = if (index % 2 == 0) Arrangement.Start else Arrangement.End
            ) {
                LessonNodeButton(
                    lesson = lesson,
                    completed = completed,
                    unlocked = unlocked,
                    onClick = {
                        when {
                            !unlocked -> onBookmarks()
                            lesson.id == 6 -> onStudy()
                            lesson.id == 8 -> onProfile()
                            else -> onPractice()
                        }
                    }
                )
            }
            if (index != state.lessons.lastIndex) {
                Box(
                    modifier = Modifier
                        .width(8.dp)
                        .height(34.dp)
                        .clip(RoundedCornerShape(99.dp))
                        .background(if (completed) Leaf.copy(alpha = 0.45f) else Faint)
                )
            }
        }
    }
}

@Composable
private fun LessonNodeButton(lesson: LessonNode, completed: Boolean, unlocked: Boolean, onClick: () -> Unit) {
    val color = when {
        completed -> Leaf
        unlocked -> lesson.color
        else -> Disabled
    }
    Column(
        modifier = Modifier.width(132.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(82.dp)
                .clip(CircleShape)
                .background(color)
                .border(5.dp, Surface, CircleShape)
                .clickable(onClick = onClick),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                if (!unlocked) Icons.Default.Lock else if (completed) Icons.Default.Check else lesson.icon,
                contentDescription = lesson.title,
                tint = Color.White,
                modifier = Modifier.size(34.dp)
            )
        }
        Spacer(Modifier.height(7.dp))
        Text(lesson.title, color = if (unlocked) Ink else Muted, fontSize = 13.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.Center, maxLines = 1, overflow = TextOverflow.Ellipsis)
        Text(lesson.unit, color = Muted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun GoogleButton(loading: Boolean, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Surface)
            .border(2.dp, Faint, RoundedCornerShape(8.dp))
            .clickable(enabled = !loading, onClick = onClick)
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        if (loading) {
            CircularProgressIndicator(modifier = Modifier.size(22.dp), color = Leaf, strokeWidth = 3.dp)
        } else {
            Text("G", color = Sky, fontSize = 20.sp, fontWeight = FontWeight.Black)
            Spacer(Modifier.width(10.dp))
            Text("Continue with Google", color = Ink, fontSize = 16.sp, fontWeight = FontWeight.Black)
        }
    }
}

@Composable
private fun DividerLabel(label: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Box(Modifier.weight(1f).height(1.dp).background(Faint))
        Text(label, color = Muted, fontSize = 12.sp, fontWeight = FontWeight.Black)
        Box(Modifier.weight(1f).height(1.dp).background(Faint))
    }
}

@Composable
private fun AuthInputField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    leading: ImageVector,
    keyboardType: KeyboardType,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    trailing: (@Composable () -> Unit)? = null
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        label = { Text(label, color = Muted, fontWeight = FontWeight.Bold) },
        leadingIcon = {
            Icon(leading, contentDescription = null, tint = Muted)
        },
        trailingIcon = trailing,
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        visualTransformation = visualTransformation,
        shape = RoundedCornerShape(8.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Leaf,
            unfocusedBorderColor = Faint,
            focusedContainerColor = Surface,
            unfocusedContainerColor = Surface,
            focusedTextColor = Ink,
            unfocusedTextColor = Ink,
            cursorColor = Leaf
        )
    )
}

@Composable
private fun PrimaryButton(text: String, enabled: Boolean = true, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(if (enabled) Leaf else Disabled)
            .clickable(enabled = enabled, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(text, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
private fun SecondaryButton(text: String, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(54.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Surface)
            .border(2.dp, Faint, RoundedCornerShape(8.dp))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(text, color = Navy, fontSize = 15.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
private fun RoundIconButton(icon: ImageVector, color: Color, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(58.dp)
            .clip(CircleShape)
            .background(color)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Icon(icon, contentDescription = "Next", tint = Color.White, modifier = Modifier.size(28.dp))
    }
}

@Composable
private fun MiniButton(text: String, color: Color, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .height(34.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(color)
            .clickable(onClick = onClick)
            .padding(horizontal = 13.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(text, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
private fun RoundedCard(
    modifier: Modifier = Modifier,
    color: Color = Surface,
    borderColor: Color = Faint,
    padding: PaddingValues = PaddingValues(14.dp),
    content: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(color)
            .border(1.dp, borderColor, RoundedCornerShape(8.dp))
            .padding(padding),
        content = content
    )
}

@Composable
private fun MessageCard(message: String, color: Color) {
    RoundedCard(color = color.copy(alpha = 0.10f), borderColor = color.copy(alpha = 0.28f)) {
        Text(message, color = color, fontSize = 13.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
    }
}

@Composable
private fun ScreenTitle(title: String, subtitle: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        Text(title, color = Ink, fontSize = 28.sp, fontWeight = FontWeight.Black)
        Spacer(Modifier.height(4.dp))
        Text(subtitle, color = Muted, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun HeaderLine(title: String, trailing: String? = null, onBack: () -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Back",
                tint = Ink,
                modifier = Modifier.size(25.dp).clickable(onClick = onBack)
            )
            Text(title, color = Ink, fontSize = 20.sp, fontWeight = FontWeight.Black)
        }
        if (trailing != null) {
            Text(trailing, color = Muted, fontSize = 13.sp, fontWeight = FontWeight.Black)
        }
    }
}

@Composable
private fun SegmentTabs(labels: List<String>, selected: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(42.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFFEAF0F7))
            .padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        labels.forEachIndexed { index, label ->
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(7.dp))
                    .background(if (index == selected) Surface else Color.Transparent),
                contentAlignment = Alignment.Center
            ) {
                Text(label, color = if (index == selected) Ink else Muted, fontSize = 12.sp, fontWeight = FontWeight.Black)
            }
        }
    }
}

@Composable
private fun SmallChip(label: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = 0.13f))
            .border(1.dp, color.copy(alpha = 0.24f), RoundedCornerShape(8.dp))
            .padding(horizontal = 10.dp, vertical = 6.dp)
    ) {
        Text(label, color = color, fontSize = 11.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
private fun AnswerOption(
    letter: String,
    text: String,
    selected: Boolean,
    correct: Boolean,
    revealed: Boolean,
    onClick: () -> Unit
) {
    val color = when {
        revealed && correct -> Leaf
        selected && !correct -> Coral
        selected -> Sky
        else -> Surface
    }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(62.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = if (color == Surface) 1f else 0.12f))
            .border(2.dp, if (color == Surface) Faint else color, RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 13.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Box(Modifier.size(34.dp).clip(CircleShape).background(if (color == Surface) Color(0xFFEAF0F7) else color), contentAlignment = Alignment.Center) {
            Text(letter, color = if (color == Surface) Ink else Color.White, fontWeight = FontWeight.Black)
        }
        Text(text, color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Black, modifier = Modifier.weight(1f))
        if (revealed && correct) Icon(Icons.Default.Check, contentDescription = null, tint = Leaf)
        if (selected && !correct) Icon(Icons.Default.Close, contentDescription = null, tint = Coral)
    }
}

@Composable
private fun ResultBadge(correct: Boolean) {
    BigIconCircle(
        icon = if (correct) Icons.Default.CheckCircle else Icons.Default.Lightbulb,
        color = if (correct) Leaf else Coral,
        size = 132
    )
}

@Composable
private fun BigIconCircle(icon: ImageVector, color: Color, size: Int = 76) {
    Box(
        modifier = Modifier
            .size(size.dp)
            .clip(CircleShape)
            .background(color.copy(alpha = 0.16f))
            .border(2.dp, color.copy(alpha = 0.26f), CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size((size * 0.48f).dp))
    }
}

@Composable
private fun SmallLessonDot(color: Color, checked: Boolean) {
    Box(Modifier.size(42.dp).clip(CircleShape).background(color), contentAlignment = Alignment.Center) {
        Icon(if (checked) Icons.Default.Check else Icons.Default.Star, contentDescription = null, tint = Color.White, modifier = Modifier.size(22.dp))
    }
}

@Composable
private fun ScoreRing(score: Int, modifier: Modifier = Modifier, color: Color = Leaf, label: String = "Score") {
    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        CircularProgressIndicator(
            progress = { score.coerceIn(0, 100) / 100f },
            modifier = Modifier.fillMaxSize(),
            color = color,
            trackColor = Faint,
            strokeWidth = 9.dp
        )
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("$score%", color = Ink, fontSize = 24.sp, fontWeight = FontWeight.Black)
            Text(label, color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun MetricCard(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    RoundedCard(modifier = modifier, color = Surface, padding = PaddingValues(10.dp)) {
        Text(label, color = Muted, fontSize = 11.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(6.dp))
        Text(value, color = color, fontSize = 21.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
    }
}

@Composable
private fun MockCard(exam: MockExam, onClick: () -> Unit) {
    RoundedCard(modifier = Modifier.clickable(onClick = onClick), color = Surface) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(13.dp)) {
            BigIconCircle(if (exam.locked) Icons.Default.Lock else Icons.Default.Assignment, if (exam.locked) Disabled else Sky, size = 54)
            Column(Modifier.weight(1f)) {
                Text(exam.title, color = Ink, fontSize = 16.sp, fontWeight = FontWeight.Black)
                Text(exam.subtitle, color = Muted, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
            if (exam.locked) {
                SmallChip("Locked", Disabled)
            } else {
                ScoreRing(score = exam.score, modifier = Modifier.size(56.dp), color = if (exam.score >= 75) Leaf else Amber, label = "")
            }
        }
    }
}

@Composable
private fun TrendChart(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val points = listOf(0.30f, 0.46f, 0.42f, 0.61f, 0.70f, 0.66f, 0.78f, 0.84f)
        val step = size.width / (points.size - 1)
        for (i in 0..4) {
            val y = size.height * i / 4f
            drawLine(Faint, Offset(0f, y), Offset(size.width, y), strokeWidth = 2f)
        }
        val path = Path()
        points.forEachIndexed { index, value ->
            val point = Offset(step * index, size.height * (1f - value))
            if (index == 0) path.moveTo(point.x, point.y) else path.lineTo(point.x, point.y)
        }
        drawPath(path, Leaf, style = Stroke(width = 6f, cap = StrokeCap.Round))
        points.forEachIndexed { index, value ->
            drawCircle(Surface, 10f, Offset(step * index, size.height * (1f - value)))
            drawCircle(Leaf, 6f, Offset(step * index, size.height * (1f - value)))
        }
    }
}

@Composable
private fun SubjectProgress(pack: StudyPack) {
    RoundedCard {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            BigIconCircle(Icons.Default.School, pack.color, size = 48)
            Column(Modifier.weight(1f)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(pack.title, color = Ink, fontWeight = FontWeight.Black, fontSize = 15.sp)
                    Text("${(pack.progress * 100).roundToInt()}%", color = pack.color, fontWeight = FontWeight.Black, fontSize = 13.sp)
                }
                Spacer(Modifier.height(8.dp))
                ProgressTrack(pack.progress, pack.color)
                Text(pack.subtitle, color = Muted, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun ProgressTrack(progress: Float, color: Color = Leaf) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(9.dp)
            .clip(RoundedCornerShape(99.dp))
            .background(Faint)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(progress.coerceIn(0f, 1f))
                .fillMaxHeight()
                .clip(RoundedCornerShape(99.dp))
                .background(color)
        )
    }
}

@Composable
private fun TutorAvatar() {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        Box(Modifier.size(126.dp), contentAlignment = Alignment.Center) {
            Canvas(Modifier.fillMaxSize()) {
                drawCircle(Sky.copy(alpha = 0.16f), radius = size.minDimension * 0.48f)
                drawCircle(Leaf.copy(alpha = 0.12f), radius = size.minDimension * 0.34f, center = Offset(size.width * 0.60f, size.height * 0.42f))
            }
            BigIconCircle(Icons.Default.Psychology, Sky, size = 94)
        }
        Text("Loksewa Coach", color = Ink, fontSize = 22.sp, fontWeight = FontWeight.Black)
        Text("Short hints, exact next steps.", color = Muted, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun TutorBubble(message: String, own: Boolean) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = if (own) Arrangement.End else Arrangement.Start) {
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(if (own) Leaf.copy(alpha = 0.13f) else Surface)
                .border(1.dp, if (own) Leaf.copy(alpha = 0.28f) else Faint, RoundedCornerShape(8.dp))
                .padding(horizontal = 13.dp, vertical = 10.dp)
        ) {
            Text(message, color = Ink, fontSize = 13.sp, lineHeight = 19.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun ChatInput(value: String, onValueChange: (String) -> Unit, onSend: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Surface)
            .border(1.dp, Faint, RoundedCornerShape(8.dp))
            .padding(start = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.weight(1f),
            placeholder = { Text("Ask anything", color = Muted, fontSize = 13.sp) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color.Transparent,
                unfocusedBorderColor = Color.Transparent,
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                cursorColor = Leaf,
                focusedTextColor = Ink,
                unfocusedTextColor = Ink
            ),
            singleLine = true
        )
        IconButton(onClick = onSend) {
            Icon(Icons.Default.Send, contentDescription = "Send", tint = Leaf)
        }
    }
}

@Composable
private fun StudyPackCard(pack: StudyPack) {
    RoundedCard {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            BigIconCircle(Icons.Default.MenuBook, pack.color, size = 50)
            Column(Modifier.weight(1f)) {
                Text(pack.title, color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Black)
                Text(pack.subtitle, color = Muted, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                ProgressTrack(pack.progress, pack.color)
            }
            Icon(Icons.Default.Download, contentDescription = "Download", tint = Muted)
        }
    }
}

@Composable
private fun BookmarkCard(title: String) {
    RoundedCard {
        Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            BigIconCircle(Icons.Default.Bookmark, Sky, size = 44)
            Column(Modifier.weight(1f)) {
                Text(title, color = Ink, fontSize = 14.sp, lineHeight = 19.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.height(4.dp))
                Text("Saved for spaced revision", color = Muted, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun NotificationCard(notification: AppNotification, onClick: () -> Unit) {
    RoundedCard(modifier = Modifier.clickable(onClick = onClick)) {
        Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            BigIconCircle(notification.icon, notification.color, size = 50)
            Column(Modifier.weight(1f)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(notification.category, color = notification.color, fontSize = 11.sp, fontWeight = FontWeight.Black)
                    Text(notification.time, color = Muted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.height(4.dp))
                Text(notification.title, color = Ink, fontSize = 15.sp, lineHeight = 20.sp, fontWeight = FontWeight.Black)
                Text(notification.body, color = Muted, fontSize = 12.sp, lineHeight = 18.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
            }
            if (notification.unread) Box(Modifier.size(10.dp).clip(CircleShape).background(Coral))
        }
    }
}

@Composable
private fun TimelineRow(text: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.Top) {
        Box(Modifier.padding(top = 4.dp).size(10.dp).clip(CircleShape).background(Leaf))
        Text(text, color = Ink, fontSize = 13.sp, lineHeight = 19.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
    }
    Spacer(Modifier.height(8.dp))
}

private data class ProfileItem(val icon: ImageVector, val label: String, val key: String)

private data class ProfileDetail(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val color: Color,
    val rows: List<DetailLine>
)

private data class DetailLine(val title: String, val value: String, val color: Color)

private val profileDetails = mapOf(
    "edit-profile" to ProfileDetail(
        "Edit Profile",
        "Name, email, exam target, and account basics.",
        Icons.Default.Person,
        Sky,
        listOf(
            DetailLine("Full name", "Loksewa Student", Sky),
            DetailLine("Email", "student@loksewa.local", Leaf),
            DetailLine("Exam goal", "Section Officer", Amber),
            DetailLine("Learning mode", "Adaptive lessons", Purple)
        )
    ),
    "study-plan" to ProfileDetail(
        "Study Plan",
        "Daily lessons, revision rhythm, and weak-topic repair.",
        Icons.Default.Timeline,
        Leaf,
        listOf(
            DetailLine("Daily target", "3 lessons and 20 questions", Leaf),
            DetailLine("Weak topic", "Reasoning speed", Coral),
            DetailLine("Next mock", "Daily Mini Mock", Sky),
            DetailLine("Revision time", "7:00 PM", Amber)
        )
    ),
    "subscription" to ProfileDetail(
        "Subscription",
        "Premium packs, offline notes, and AI tutor access.",
        Icons.Default.CreditCard,
        Purple,
        listOf(
            DetailLine("Plan", "Premium Member", Purple),
            DetailLine("Offline packs", "5 active downloads", Sky),
            DetailLine("AI Tutor", "Enabled", Leaf)
        )
    ),
    "payment-history" to ProfileDetail(
        "Payment History",
        "Recent receipts and subscription records.",
        Icons.Default.Assignment,
        Amber,
        listOf(
            DetailLine("May invoice", "NPR 999 - Paid", Leaf),
            DetailLine("April invoice", "NPR 999 - Paid", Leaf),
            DetailLine("March invoice", "NPR 999 - Paid", Leaf)
        )
    ),
    "settings" to ProfileDetail(
        "Settings",
        "Notifications, sync, privacy, and learning preferences.",
        Icons.Default.Settings,
        Navy,
        listOf(
            DetailLine("Notifications", "Lesson and mock reminders on", Leaf),
            DetailLine("Offline sync", "Wi-Fi only", Sky),
            DetailLine("Theme", "Playful light", Amber),
            DetailLine("Privacy", "Analytics enabled", Purple)
        )
    ),
    "help-support" to ProfileDetail(
        "Help & Support",
        "Support, issue reporting, and app information.",
        Icons.Default.HelpOutline,
        Coral,
        listOf(
            DetailLine("Help center", "Common app and exam questions", Sky),
            DetailLine("Contact", "Response within 24 hours", Leaf),
            DetailLine("App version", "0.1.0", Amber)
        )
    )
)

@Composable
private fun ProfileHero(state: LoksewaLearningState) {
    RoundedCard(color = Leaf.copy(alpha = 0.10f), borderColor = Leaf.copy(alpha = 0.25f)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            Box(Modifier.size(72.dp).clip(CircleShape).background(Leaf), contentAlignment = Alignment.Center) {
                Text(state.userName.initials(), color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
            }
            Column(Modifier.weight(1f)) {
                Text(state.userName, color = Ink, fontSize = 21.sp, fontWeight = FontWeight.Black, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(state.email, color = Muted, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Spacer(Modifier.height(8.dp))
                SmallChip("Premium learner", Amber)
            }
        }
    }
}

@Composable
private fun ProfileRow(icon: ImageVector, label: String, danger: Boolean = false, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Surface)
            .border(1.dp, Faint, RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Icon(icon, contentDescription = null, tint = if (danger) Coral else Navy, modifier = Modifier.size(20.dp))
        Text(label, color = if (danger) Coral else Ink, fontSize = 14.sp, fontWeight = FontWeight.Black, modifier = Modifier.weight(1f))
        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = Muted, modifier = Modifier.size(18.dp))
    }
}

@Composable
private fun DetailRowCard(row: DetailLine) {
    RoundedCard {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Box(Modifier.size(11.dp).clip(CircleShape).background(row.color))
            Column(Modifier.weight(1f)) {
                Text(row.title, color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Black)
                Text(row.value, color = Muted, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun NavItem(label: String, icon: ImageVector, selected: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxHeight()
            .clip(RoundedCornerShape(8.dp))
            .background(if (selected) Leaf.copy(alpha = 0.12f) else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(vertical = 7.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(icon, contentDescription = label, tint = if (selected) Leaf else Muted, modifier = Modifier.size(23.dp))
        Spacer(Modifier.height(3.dp))
        Text(label, color = if (selected) LeafDark else Muted, fontSize = 10.sp, fontWeight = FontWeight.Black)
    }
}

private fun String.firstName(): String = trim().split(" ").firstOrNull { it.isNotBlank() } ?: "Student"

private fun String.initials(): String {
    val parts = trim().split(" ").filter { it.isNotBlank() }
    return when {
        parts.size >= 2 -> "${parts[0].first()}${parts[1].first()}".uppercase()
        parts.size == 1 -> parts[0].take(2).uppercase()
        else -> "LS"
    }
}

private fun String.isValidEmail(): Boolean {
    val clean = trim()
    return clean.length in 5..320 && "@" in clean && "." in clean.substringAfter("@", "")
}
