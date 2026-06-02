package com.loksewa.aiapp.ui.screens

import android.graphics.Color as AndroidColor
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.filled.LibraryBooks
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BusinessCenter
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.Insights
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.QuestionAnswer
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.data.remote.CourseDetailResponse
import com.loksewa.aiapp.data.remote.CourseMistakeResponse
import com.loksewa.aiapp.data.remote.CourseModuleResponse
import com.loksewa.aiapp.data.remote.CourseQuestionResponse
import com.loksewa.aiapp.data.remote.CourseResponse
import com.loksewa.aiapp.data.remote.CourseTaskResponse
import com.loksewa.aiapp.ui.components.NeuriseCard
import com.loksewa.aiapp.ui.components.NeuriseIconButton
import com.loksewa.aiapp.ui.components.NeuriseMetric
import com.loksewa.aiapp.ui.components.NeurisePill
import com.loksewa.aiapp.ui.components.NeurisePrimaryButton
import com.loksewa.aiapp.ui.components.NeuriseScreenSurface
import com.loksewa.aiapp.ui.components.NeuriseSectionHeader
import com.loksewa.aiapp.ui.components.NeuriseSecondaryButton
import com.loksewa.aiapp.ui.components.NeuriseThumbnail
import com.loksewa.aiapp.ui.theme.AccentGreen
import com.loksewa.aiapp.ui.theme.AccentRed
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandBlue
import com.loksewa.aiapp.ui.theme.BrandBlueLight
import com.loksewa.aiapp.ui.theme.BrandOrange
import com.loksewa.aiapp.ui.theme.BrandOrangeLight
import com.loksewa.aiapp.ui.theme.BrandTeal
import com.loksewa.aiapp.ui.theme.BrandTealLight
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.BrandVioletLight
import com.loksewa.aiapp.ui.theme.DarkForestGreen
import com.loksewa.aiapp.ui.theme.PrimaryGlow
import com.loksewa.aiapp.ui.theme.SurfaceElevated
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.SurfaceWarm
import com.loksewa.aiapp.ui.theme.TextPrimaryLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight
import com.loksewa.aiapp.ui.theme.TextTertiaryLight

@Composable
fun CourseScreen(
    onStartMockClick: () -> Unit,
    onOpenCourseDetail: (String) -> Unit,
    onStartLearning: (String) -> Unit,
    uiState: CourseUiState = CourseUiState(),
    onLoadCourseDetail: (String) -> Unit = {}
) {
    val courses = remember(uiState.courses, uiState.details) {
        uiState.courses.toLearningCourses(uiState.details).ifEmpty { courseCatalog }
    }
    
    var selectedTab by remember { mutableIntStateOf(0) } // 0 = All, 1 = Subjects, 2 = Bookmarks
    var activeDialog by remember { mutableStateOf<LearningDialog?>(null) }
    
    // Bookmarks state
    var bookmarkFilter by remember { mutableStateOf("All") }
    var bookmarksList by remember {
        mutableStateOf(
            listOf(
                BookmarkItem("b1", "Which is the longest river in Nepal?", "Questions", "Geography", "The longest river in Nepal is the Karnali River (507 km within Nepal)."),
                BookmarkItem("b2", "Article 75 of Constitution of Nepal", "Notes", "Constitution", "Executive Power: The executive power of Nepal shall, pursuant to this Constitution and law, be vested in the Council of Ministers."),
                BookmarkItem("b3", "Historical Background of unification of Nepal", "Materials", "History", "King Prithvi Narayan Shah of Gorkha initiated the unification of Nepal in 1744 AD by capturing Nuwakot."),
                BookmarkItem("b4", "Who is the current Governor of Nepal Rastra Bank?", "Questions", "Economics", "Maha Prasad Adhikari is the current governor of Nepal Rastra Bank."),
                BookmarkItem("b5", "Federal Structure of Nepal", "Notes", "Constitution", "Pursuant to Article 56, the main structure of the Federal Democratic Republic of Nepal shall be three levels: Federation, Province, and Local level."),
                BookmarkItem("b6", "Official Syllabus of Section Officer (GK Part)", "Materials", "GK", "The general knowledge part of Section Officer covers Geography, History, Art & Culture, Science & Tech, Constitution, and International Relations.")
            )
        )
    }
    
    // Subjects state
    val subjectsList = remember {
        listOf(
            SubjectMaterialItem("Nepal Constitution", 14, Icons.Default.Gavel, "gk", BrandViolet),
            SubjectMaterialItem("Nepal Geography", 12, Icons.Default.School, "gk", BrandTeal),
            SubjectMaterialItem("Nepal History", 10, Icons.AutoMirrored.Filled.LibraryBooks, "gk", BrandOrange),
            SubjectMaterialItem("Economics", 8, Icons.Default.BusinessCenter, "gk", BrandBlue),
            SubjectMaterialItem("GK", 20, Icons.Default.Timer, "gk", AccentGreen)
        )
    }

    fun showInfo(title: String, message: String) {
        activeDialog = LearningDialog(title = title, message = message)
    }

    NeuriseScreenSurface {
        Column(
            modifier = Modifier
                .fillMaxSize()
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Study Materials",
                        color = TextPrimaryLight,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        text = "Syllabus, notes, bookmarks & search",
                        color = TextSecondaryLight,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                
                NeuriseIconButton(
                    icon = Icons.Default.Search,
                    contentDescription = "Search",
                    onClick = {
                        showInfo(
                            title = "Search Materials",
                            message = "Search across all books, constitution chapters, rivers databases, and saved mock test solutions."
                        )
                    }
                )
            }

            // Tabs Selector: All, Subjects, Bookmarks
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(SurfaceWarm)
                    .border(1.dp, BorderLight, RoundedCornerShape(16.dp))
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                val tabLabels = listOf("All", "Subjects", "Bookmarks")
                tabLabels.forEachIndexed { index, label ->
                    val isSelected = selectedTab == index
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) SurfaceLight else Color.Transparent)
                            .clickable { selectedTab = index }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = label,
                            color = if (isSelected) BrandViolet else TextSecondaryLight,
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Main Tab Content
            when (selectedTab) {
                0 -> {
                    // ALL tab: list courses
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().weight(1f),
                        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 4.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            NeuriseSectionHeader(
                                title = "Active Syllabus Courses",
                                actionText = "Start Practice",
                                onActionClick = onStartMockClick
                            )
                        }
                        items(courses) { course ->
                            CourseCatalogCard(
                                course = course,
                                selected = false,
                                onClick = { onOpenCourseDetail(course.id) },
                                onStartLearning = { onStartLearning(course.id) }
                            )
                        }
                    }
                }
                1 -> {
                    // SUBJECTS tab
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().weight(1f),
                        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 4.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        item {
                            Text(
                                text = "Syllabus breakdown by subject",
                                color = TextSecondaryLight,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(bottom = 4.dp)
                            )
                        }
                        items(subjectsList) { subject ->
                            SubjectMaterialRow(
                                subject = subject,
                                onDownloadClick = {
                                    showInfo(
                                        title = "Offline Storage",
                                        message = "Downloading ${subject.name} offline pack containing ${subject.chapterCount} chapters & flashcards."
                                    )
                                },
                                onClick = {
                                    onOpenCourseDetail(subject.courseId)
                                }
                            )
                        }
                    }
                }
                2 -> {
                    // BOOKMARKS tab (Screen 15)
                    Column(modifier = Modifier.fillMaxSize().weight(1f)) {
                        // Bookmark filter row
                        val filters = listOf("All", "Questions", "Notes", "Materials")
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState())
                                .padding(start = 20.dp, end = 20.dp, bottom = 12.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            filters.forEach { filter ->
                                val isSelected = bookmarkFilter == filter
                                NeurisePill(
                                    label = filter,
                                    icon = null,
                                    selected = isSelected,
                                    tint = BrandViolet,
                                    background = BrandVioletLight,
                                    onClick = { bookmarkFilter = filter }
                                )
                            }
                        }

                        // Filtered bookmarks list
                        val filteredList = bookmarksList.filter {
                            bookmarkFilter == "All" || it.category == bookmarkFilter
                        }

                        if (filteredList.isEmpty()) {
                            Box(
                                modifier = Modifier.fillMaxSize().weight(1f),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "No saved elements in this category.",
                                    color = TextSecondaryLight,
                                    fontSize = 14.sp
                                )
                            }
                        } else {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize().weight(1f),
                                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 4.dp),
                                verticalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                items(filteredList) { item ->
                                    BookmarkCard(
                                        item = item,
                                        onRemoveClick = {
                                            bookmarksList = bookmarksList.filter { it.id != item.id }
                                            showInfo(
                                                title = "Bookmark removed",
                                                message = "Removed '${item.title}' from your saved collection."
                                            )
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        activeDialog?.let { dialog ->
            LearningAlert(dialog = dialog, onDismiss = { activeDialog = null })
        }
    }
}

// Data class to support Redesigned CourseScreen
private data class SubjectMaterialItem(
    val name: String,
    val chapterCount: Int,
    val icon: ImageVector,
    val courseId: String,
    val color: Color
)

private data class BookmarkItem(
    val id: String,
    val title: String,
    val category: String, // Questions, Notes, Materials
    val tag: String,
    val content: String
)

@Composable
private fun SubjectMaterialRow(
    subject: SubjectMaterialItem,
    onDownloadClick: () -> Unit,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(SurfaceLight)
            .border(1.dp, BorderLight, RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.weight(1f),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(subject.color.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = subject.icon,
                    contentDescription = null,
                    tint = subject.color,
                    modifier = Modifier.size(20.dp)
                )
            }

            Column {
                Text(
                    text = subject.name,
                    color = TextPrimaryLight,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "${subject.chapterCount} Chapters",
                    color = TextSecondaryLight,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        // Blue Download Action Indicator
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(BrandBlue.copy(alpha = 0.12f))
                .clickable { onDownloadClick() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Download,
                contentDescription = "Download offline materials",
                tint = BrandBlue,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}

@Composable
private fun BookmarkCard(
    item: BookmarkItem,
    onRemoveClick: () -> Unit
) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 18,
        contentPadding = PaddingValues(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                val categoryColor = when (item.category) {
                    "Questions" -> BrandViolet
                    "Notes" -> BrandTeal
                    else -> BrandOrange
                }
                
                Box(
                    modifier = Modifier
                        .padding(top = 2.dp)
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(categoryColor)
                )

                Column {
                    Text(
                        text = item.title,
                        color = TextPrimaryLight,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = item.content,
                        color = TextSecondaryLight,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(categoryColor.copy(alpha = 0.12f))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = item.category,
                                color = categoryColor,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(SurfaceWarm)
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = item.tag,
                                color = TextSecondaryLight,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            Icon(
                imageVector = Icons.Default.Bookmark,
                contentDescription = "Remove Bookmark",
                tint = BrandViolet,
                modifier = Modifier
                    .size(20.dp)
                    .clickable { onRemoveClick() }
            )
        }
    }
}

@Composable
fun CourseDetailScreen(
    courseId: String,
    onBackClick: () -> Unit,
    onStartLearning: (String) -> Unit,
    onStartMockClick: () -> Unit,
    uiState: CourseUiState = CourseUiState()
) {
    val course = courseById(courseId, uiState)
    var activeDialog by remember { mutableStateOf<LearningDialog?>(null) }
    var bookmarked by remember { mutableStateOf(false) }

    fun showInfo(title: String, message: String) {
        activeDialog = LearningDialog(title = title, message = message)
    }

    NeuriseScreenSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 20.dp, top = 24.dp, end = 20.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            item {
                DetailTopBar(
                    title = "Course Detail",
                    onBackClick = onBackClick,
                    onBookmarkClick = {
                        bookmarked = !bookmarked
                        showInfo(
                            title = if (bookmarked) "Removed from saved" else "Saved course",
                            message = if (bookmarked) {
                                "${course.title} is removed from saved courses."
                            } else {
                                "${course.title} is now saved for quick access from your learning plan."
                            }
                        )
                    },
                    bookmarked = bookmarked
                )
            }

            item {
                CourseHeroDetail(
                    course = course,
                    onStartLearning = { onStartLearning(course.id) },
                    onStartMockClick = onStartMockClick
                )
            }

            item {
                DetailMetricsCard(course = course)
            }

            item {
                AiPlanDetailCard(
                    course = course,
                    onExplainClick = {
                        showInfo(
                            title = "AI plan details",
                            message = "The plan uses your weak topics, lesson completion, speed, and wrong answer type. It schedules concept review, scored practice, flashcards, mistake retry, and mock confirmation."
                        )
                    }
                )
            }

            item {
                NeuriseSectionHeader(title = "Learning Flow", actionText = "Start")
            }

            items(course.modules) { module ->
                ModuleDetailRow(
                    module = module,
                    accent = course.color,
                    onClick = {
                        if (module.locked) {
                            showInfo(
                                title = "Module locked",
                                message = "Complete the previous scored practice and one retry round before this module opens."
                            )
                        } else {
                            onStartLearning(course.id)
                        }
                    }
                )
            }

            item {
                NeuriseSectionHeader(title = "Course Tools", actionText = null)
            }

            item {
                CourseToolsGrid(
                    course = course,
                    onDownloadClick = {
                        showInfo(
                            title = "Offline pack queued",
                            message = "Lessons, flashcards, and solved mistakes for ${course.shortName} will download when offline storage is connected."
                        )
                    },
                    onShareClick = {
                        showInfo(
                            title = "Share course",
                            message = "A course invite link for ${course.title} will be generated after share intents are connected."
                        )
                    },
                    onCertificateClick = {
                        showInfo(
                            title = "Certificate locked",
                            message = "Finish all modules, score above 80 in two mini mocks, and complete final revision to unlock the certificate."
                        )
                    },
                    onTeacherClick = {
                        showInfo(
                            title = course.teacher,
                            message = "This mentor explains each lesson with exam traps, answer elimination, and a retry plan for weak topics."
                        )
                    }
                )
            }
        }

        activeDialog?.let { dialog ->
            LearningAlert(dialog = dialog, onDismiss = { activeDialog = null })
        }
    }
}

@Composable
fun LearningFlowScreen(
    courseId: String,
    onBackClick: () -> Unit,
    onFinish: () -> Unit,
    onOpenMock: () -> Unit,
    uiState: CourseUiState = CourseUiState()
) {
    val course = courseById(courseId, uiState)
    val questions = uiState.details[courseId]
        ?.questions
        ?.map { it.toFlowQuestion() }
        ?.takeIf { it.isNotEmpty() }
        ?: courseQuestions[course.id]
        ?: courseQuestions.getValue("gk")
    var currentIndex by remember(course.id) { mutableIntStateOf(0) }
    var selectedOption by remember(course.id, currentIndex) { mutableStateOf<String?>(null) }
    var submitted by remember(course.id, currentIndex) { mutableStateOf(false) }
    var score by remember(course.id) { mutableIntStateOf(0) }
    var retryMode by remember(course.id) { mutableStateOf(false) }
    var activeDialog by remember { mutableStateOf<LearningDialog?>(null) }

    val question = questions[currentIndex]
    val isCorrect = submitted && selectedOption == question.correctOption
    val progress = (currentIndex + 1).toFloat() / questions.size
    val stage = when {
        !submitted -> "Practice"
        isCorrect -> "AI Feedback"
        else -> "Retry"
    }

    fun submitAnswer() {
        if (selectedOption == null) {
            activeDialog = LearningDialog(
                title = "Choose an answer",
                message = "Select one option first. The AI scoring step needs your attempt before it can explain the weakness."
            )
            return
        }
        submitted = true
        if (selectedOption == question.correctOption) {
            score += if (retryMode) 6 else 10
        }
    }

    fun nextQuestion() {
        if (currentIndex == questions.lastIndex) {
            activeDialog = LearningDialog(
                title = "Flow complete",
                message = "You finished ${course.shortName} practice with $score AI points. The next step is a mini mock to confirm retention.",
                confirmText = "Go Detail",
                dismissText = "Mini Mock",
                onConfirm = onFinish
            )
        } else {
            currentIndex += 1
            selectedOption = null
            submitted = false
            retryMode = false
        }
    }

    fun retryQuestion() {
        retryMode = true
        selectedOption = null
        submitted = false
    }

    NeuriseScreenSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 20.dp, top = 24.dp, end = 20.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                LearningSessionTopBar(
                    course = course,
                    stage = stage,
                    onBackClick = {
                        activeDialog = LearningDialog(
                            title = "Leave learning flow?",
                            message = "Your current in-session answer will reset. Completed score already stays in this local session.",
                            confirmText = "Leave",
                            dismissText = "Stay",
                            onConfirm = onBackClick
                        )
                    }
                )
            }

            item {
                FlowProgressCard(
                    current = currentIndex + 1,
                    total = questions.size,
                    score = score,
                    progress = progress,
                    accent = course.color
                )
            }

            item {
                QuestionFlashcard(
                    question = question,
                    course = course,
                    retryMode = retryMode,
                    submitted = submitted
                )
            }

            items(question.options) { option ->
                LearningOptionRow(
                    option = option,
                    selected = selectedOption == option.key,
                    submitted = submitted,
                    correct = question.correctOption == option.key,
                    onClick = {
                        if (!submitted) {
                            selectedOption = option.key
                        }
                    }
                )
            }

            if (submitted) {
                item {
                    AiFeedbackPanel(
                        question = question,
                        isCorrect = isCorrect,
                        course = course,
                        selectedOption = selectedOption.orEmpty()
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (submitted && !isCorrect) {
                        NeuriseSecondaryButton(
                            text = "Retry",
                            modifier = Modifier.weight(1f),
                            onClick = { retryQuestion() }
                        )
                        NeurisePrimaryButton(
                            text = if (currentIndex == questions.lastIndex) "Finish" else "Next",
                            modifier = Modifier.weight(1f),
                            onClick = { nextQuestion() }
                        )
                    } else if (submitted) {
                        NeuriseSecondaryButton(
                            text = "Mini Mock",
                            modifier = Modifier.weight(1f),
                            onClick = onOpenMock
                        )
                        NeurisePrimaryButton(
                            text = if (currentIndex == questions.lastIndex) "Finish" else "Next",
                            modifier = Modifier.weight(1f),
                            onClick = { nextQuestion() }
                        )
                    } else {
                        NeuriseSecondaryButton(
                            text = "Explain",
                            modifier = Modifier.weight(1f),
                            onClick = {
                                activeDialog = LearningDialog(
                                    title = "AI hint",
                                    message = question.hint
                                )
                            }
                        )
                        NeurisePrimaryButton(
                            text = "Submit",
                            modifier = Modifier.weight(1f),
                            onClick = { submitAnswer() }
                        )
                    }
                }
            }
        }

        activeDialog?.let { dialog ->
            LearningAlert(dialog = dialog, onDismiss = { activeDialog = null })
        }
    }
}

@Composable
private fun LearningHeader(
    title: String,
    subtitle: String,
    actionIcon: ImageVector,
    onActionClick: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                color = TextPrimaryLight,
                fontSize = 25.sp,
                fontWeight = FontWeight.Black
            )
            Spacer(modifier = Modifier.height(5.dp))
            Text(
                text = subtitle,
                color = TextSecondaryLight,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
        NeuriseIconButton(
            icon = actionIcon,
            contentDescription = title,
            onClick = onActionClick
        )
    }
}

@Composable
private fun DetailTopBar(
    title: String,
    onBackClick: () -> Unit,
    onBookmarkClick: () -> Unit,
    bookmarked: Boolean
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        NeuriseIconButton(
            icon = Icons.AutoMirrored.Filled.KeyboardArrowLeft,
            contentDescription = "Back",
            onClick = onBackClick
        )
        Text(
            text = title,
            color = TextPrimaryLight,
            fontSize = 18.sp,
            fontWeight = FontWeight.Black
        )
        NeuriseIconButton(
            icon = if (bookmarked) Icons.Default.Favorite else Icons.Default.Bookmark,
            contentDescription = "Save course",
            tint = if (bookmarked) AccentRed else TextPrimaryLight,
            onClick = onBookmarkClick
        )
    }
}

@Composable
private fun TargetPlanCard(
    targetScore: Int,
    forecast: Int,
    totalProgress: Int,
    onDecrease: () -> Unit,
    onIncrease: () -> Unit,
    onExplainClick: () -> Unit
) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 28,
        contentPadding = PaddingValues(18.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            NeuriseThumbnail(
                icon = Icons.Default.Insights,
                accent = BrandViolet,
                secondary = BrandTeal,
                modifier = Modifier.size(72.dp)
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Target Score Plan",
                    color = TextPrimaryLight,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Black
                )
                Spacer(modifier = Modifier.height(5.dp))
                Text(
                    text = "AI forecast $forecast based on current practice quality.",
                    color = TextSecondaryLight,
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TargetStepper(
                value = targetScore,
                onDecrease = onDecrease,
                onIncrease = onIncrease
            )
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(14.dp))
                    .background(BrandVioletLight)
                    .clickable(onClick = onExplainClick)
                    .padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Text(
                    text = "AI Plan",
                    color = BrandViolet,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        LinearProgressIndicator(
            progress = { totalProgress / 100f },
            modifier = Modifier
                .fillMaxWidth()
                .height(9.dp)
                .clip(CircleShape),
            color = BrandViolet,
            trackColor = SurfaceWarm
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "$totalProgress% total learning readiness",
            color = TextSecondaryLight,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
private fun TargetStepper(
    value: Int,
    onDecrease: () -> Unit,
    onIncrease: () -> Unit
) {
    Row(
        modifier = Modifier
            .height(44.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(SurfaceWarm)
            .border(1.dp, BorderLight, RoundedCornerShape(16.dp)),
        verticalAlignment = Alignment.CenterVertically
    ) {
        StepperButton(label = "-", onClick = onDecrease)
        Text(
            text = value.toString(),
            color = TextPrimaryLight,
            fontSize = 18.sp,
            fontWeight = FontWeight.Black,
            modifier = Modifier.padding(horizontal = 14.dp)
        )
        StepperButton(label = "+", onClick = onIncrease)
    }
}

@Composable
private fun StepperButton(
    label: String,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxHeight()
            .width(42.dp)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = BrandViolet,
            fontSize = 18.sp,
            fontWeight = FontWeight.Black
        )
    }
}

@Composable
private fun CourseStrip(
    courses: List<LearningCourse>,
    selectedCourseId: String,
    onSelect: (LearningCourse) -> Unit
) {
    Row(
        modifier = Modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        courses.forEach { course ->
            NeurisePill(
                label = course.shortName,
                icon = course.icon,
                selected = selectedCourseId == course.id,
                tint = course.color,
                background = course.background,
                onClick = { onSelect(course) }
            )
        }
    }
}

@Composable
private fun AiCoachCard(
    course: LearningCourse,
    aiScore: Int,
    dynamicProgress: Int,
    onOpenDetail: () -> Unit,
    onStartLearning: () -> Unit
) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 26,
        contentPadding = PaddingValues(18.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(58.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(Brush.linearGradient(listOf(course.color, PrimaryGlow))),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = SurfaceLight,
                    modifier = Modifier.size(27.dp)
                )
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "AI coach for ${course.shortName}",
                    color = TextPrimaryLight,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Black
                )
                Spacer(modifier = Modifier.height(5.dp))
                Text(
                    text = course.coachLine,
                    color = TextSecondaryLight,
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "AI score $aiScore",
                    color = TextPrimaryLight,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = "$dynamicProgress% section readiness",
                    color = TextSecondaryLight,
                    fontSize = 12.sp
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                MiniActionButton(
                    text = "Detail",
                    color = course.color,
                    background = course.background,
                    onClick = onOpenDetail
                )
                MiniActionButton(
                    text = "Start",
                    icon = Icons.Default.PlayArrow,
                    color = course.color,
                    background = course.background,
                    onClick = onStartLearning
                )
            }
        }
    }
}

@Composable
private fun MiniActionButton(
    text: String,
    color: Color,
    background: Color,
    onClick: () -> Unit,
    icon: ImageVector? = null
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(15.dp))
            .background(background)
            .clickable(onClick = onClick)
            .padding(horizontal = 11.dp, vertical = 9.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (icon != null) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(17.dp))
            Spacer(modifier = Modifier.width(4.dp))
        }
        Text(text = text, color = color, fontSize = 12.sp, fontWeight = FontWeight.ExtraBold)
    }
}

@Composable
private fun LearningMetricsCard(
    readiness: Int,
    aiScore: Int,
    weakCount: Int,
    accent: Color
) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 24,
        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(66.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            NeuriseMetric("Ready", "$readiness%", Modifier.weight(1f), accent)
            Box(modifier = Modifier.width(1.dp).fillMaxHeight().background(BorderLight))
            NeuriseMetric("AI Score", aiScore.toString(), Modifier.weight(1f), BrandBlue)
            Box(modifier = Modifier.width(1.dp).fillMaxHeight().background(BorderLight))
            NeuriseMetric("Weak", weakCount.toString(), Modifier.weight(1f), BrandOrange)
        }
    }
}

@Composable
private fun CourseCatalogCard(
    course: LearningCourse,
    selected: Boolean,
    onClick: () -> Unit,
    onStartLearning: () -> Unit
) {
    NeuriseCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        cornerRadius = 22,
        contentPadding = PaddingValues(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            NeuriseThumbnail(
                icon = course.icon,
                accent = course.color,
                secondary = PrimaryGlow,
                modifier = Modifier.size(64.dp)
            )
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(horizontalArrangement = Arrangement.spacedBy(7.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(course.badge, color = course.color, fontSize = 11.sp, fontWeight = FontWeight.Black)
                    if (selected) {
                        Text("Selected", color = AccentGreen, fontSize = 11.sp, fontWeight = FontWeight.Black)
                    }
                }
                Text(
                    text = course.title,
                    color = TextPrimaryLight,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Black,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "${course.lessonCount} lessons, ${course.duration}, ${course.level}",
                    color = TextSecondaryLight,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
            MiniActionButton(
                text = "Learn",
                icon = Icons.Default.PlayArrow,
                color = course.color,
                background = course.background,
                onClick = onStartLearning
            )
        }
    }
}

@Composable
private fun PracticeTaskCard(
    task: LearningTask,
    completed: Boolean,
    accent: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(SurfaceLight)
            .border(1.dp, if (completed) AccentGreen.copy(alpha = 0.35f) else BorderLight, RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(46.dp)
                .clip(RoundedCornerShape(15.dp))
                .background(if (completed) AccentGreen.copy(alpha = 0.12f) else accent.copy(alpha = 0.11f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (completed) Icons.Default.CheckCircle else task.icon,
                contentDescription = null,
                tint = if (completed) AccentGreen else accent,
                modifier = Modifier.size(22.dp)
            )
        }
        Spacer(modifier = Modifier.width(13.dp))
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = task.title,
                    color = TextPrimaryLight,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                Text(task.duration, color = TextTertiaryLight, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(5.dp))
            Text(
                text = task.subtitle,
                color = TextSecondaryLight,
                fontSize = 12.sp,
                lineHeight = 16.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Icon(
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = "Open ${task.title}",
            tint = TextTertiaryLight,
            modifier = Modifier.size(22.dp)
        )
    }
}

@Composable
private fun MistakeBookCard(
    mistakes: List<MistakeItem>,
    accent: Color,
    onMistakeClick: (MistakeItem) -> Unit
) {
    Column {
        NeuriseSectionHeader(title = "Mistake Book", actionText = "${mistakes.size} Items")
        Spacer(modifier = Modifier.height(12.dp))
        NeuriseCard(
            modifier = Modifier.fillMaxWidth(),
            cornerRadius = 24,
            contentPadding = PaddingValues(12.dp)
        ) {
            mistakes.forEachIndexed { index, mistake ->
                MistakeRow(
                    mistake = mistake,
                    accent = accent,
                    onClick = { onMistakeClick(mistake) }
                )
                if (index != mistakes.lastIndex) {
                    Spacer(modifier = Modifier.height(10.dp))
                }
            }
        }
    }
}

@Composable
private fun MistakeRow(
    mistake: MistakeItem,
    accent: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(SurfaceWarm)
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(AccentRed.copy(alpha = 0.11f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = AccentRed, modifier = Modifier.size(20.dp))
        }
        Spacer(modifier = Modifier.width(11.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = mistake.title,
                color = TextPrimaryLight,
                fontSize = 13.sp,
                fontWeight = FontWeight.ExtraBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = mistake.reason,
                color = TextSecondaryLight,
                fontSize = 11.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(12.dp))
                .background(accent.copy(alpha = 0.12f))
                .padding(horizontal = 9.dp, vertical = 6.dp)
        ) {
            Text("Retry", color = accent, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold)
        }
    }
}

@Composable
private fun MockPathCard(
    targetScore: Int,
    course: LearningCourse,
    onStartMockClick: () -> Unit,
    onReviewClick: () -> Unit
) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 26,
        contentPadding = PaddingValues(18.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            NeuriseThumbnail(
                icon = Icons.AutoMirrored.Filled.Assignment,
                accent = BrandBlue,
                secondary = BrandViolet,
                modifier = Modifier.size(62.dp)
            )
            Column(modifier = Modifier.weight(1f)) {
                Text("Adaptive Mock Path", color = TextPrimaryLight, fontSize = 16.sp, fontWeight = FontWeight.Black)
                Text(
                    text = "${course.shortName} timed mock tuned for your $targetScore target.",
                    color = TextSecondaryLight,
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            NeurisePrimaryButton("Start Mock", Modifier.weight(1f), onClick = onStartMockClick)
            NeuriseSecondaryButton("Review", Modifier.weight(1f), onClick = onReviewClick)
        }
    }
}

@Composable
private fun CourseHeroDetail(
    course: LearningCourse,
    onStartLearning: () -> Unit,
    onStartMockClick: () -> Unit
) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 30,
        contentPadding = PaddingValues(18.dp)
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
            NeuriseThumbnail(
                icon = course.icon,
                accent = course.color,
                secondary = PrimaryGlow,
                modifier = Modifier.size(82.dp)
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(course.badge, color = course.color, fontSize = 11.sp, fontWeight = FontWeight.Black)
                Text(
                    text = course.title,
                    color = TextPrimaryLight,
                    fontSize = 20.sp,
                    lineHeight = 25.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = course.description,
                    color = TextSecondaryLight,
                    fontSize = 12.sp,
                    lineHeight = 17.sp,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            NeurisePrimaryButton("Start Learning", Modifier.weight(1f), onClick = onStartLearning)
            NeuriseSecondaryButton("Mock", Modifier.weight(1f), onClick = onStartMockClick)
        }
    }
}

@Composable
private fun DetailMetricsCard(course: LearningCourse) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 24,
        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(66.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            NeuriseMetric("Lessons", course.lessonCount.toString(), Modifier.weight(1f), course.color)
            Box(modifier = Modifier.width(1.dp).fillMaxHeight().background(BorderLight))
            NeuriseMetric("Progress", "${course.progress}%", Modifier.weight(1f), BrandBlue)
            Box(modifier = Modifier.width(1.dp).fillMaxHeight().background(BorderLight))
            NeuriseMetric("AI Score", course.aiScore.toString(), Modifier.weight(1f), BrandOrange)
        }
    }
}

@Composable
private fun AiPlanDetailCard(
    course: LearningCourse,
    onExplainClick: () -> Unit
) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 24,
        contentPadding = PaddingValues(16.dp)
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(13.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(RoundedCornerShape(15.dp))
                    .background(course.background),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = course.color, modifier = Modifier.size(22.dp))
            }
            Column(modifier = Modifier.weight(1f)) {
                Text("Today AI Plan", color = TextPrimaryLight, fontSize = 16.sp, fontWeight = FontWeight.Black)
                Text(course.planLine, color = TextSecondaryLight, fontSize = 12.sp, lineHeight = 17.sp)
            }
            MiniActionButton("Why", course.color, course.background, onExplainClick)
        }
    }
}

@Composable
private fun ModuleDetailRow(
    module: CourseModule,
    accent: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(SurfaceLight)
            .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(if (module.locked) SurfaceElevated else accent.copy(alpha = 0.11f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (module.locked) Icons.Default.Lock else Icons.Default.PlayArrow,
                contentDescription = null,
                tint = if (module.locked) TextTertiaryLight else accent,
                modifier = Modifier.size(21.dp)
            )
        }
        Spacer(modifier = Modifier.width(13.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(module.title, color = TextPrimaryLight, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
            Text("${module.lessons} lessons, ${module.duration}", color = TextSecondaryLight, fontSize = 12.sp)
        }
        Text(
            text = if (module.locked) "Locked" else "${module.progress}%",
            color = if (module.locked) TextTertiaryLight else accent,
            fontSize = 12.sp,
            fontWeight = FontWeight.Black
        )
    }
}

@Composable
private fun CourseToolsGrid(
    course: LearningCourse,
    onDownloadClick: () -> Unit,
    onShareClick: () -> Unit,
    onCertificateClick: () -> Unit,
    onTeacherClick: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CourseToolTile("Offline", "Lessons pack", Icons.Default.Download, course.color, onDownloadClick, Modifier.weight(1f))
            CourseToolTile("Share", "Invite link", Icons.Default.Share, BrandBlue, onShareClick, Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CourseToolTile("Certificate", "After mastery", Icons.Default.CheckCircle, BrandOrange, onCertificateClick, Modifier.weight(1f))
            CourseToolTile("Mentor", course.teacher, Icons.Default.Psychology, BrandTeal, onTeacherClick, Modifier.weight(1f))
        }
    }
}

@Composable
private fun CourseToolTile(
    title: String,
    subtitle: String,
    icon: ImageVector,
    tint: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(SurfaceLight)
            .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
            .padding(14.dp)
    ) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(tint.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(19.dp))
        }
        Spacer(modifier = Modifier.height(10.dp))
        Text(title, color = TextPrimaryLight, fontSize = 13.sp, fontWeight = FontWeight.ExtraBold)
        Text(subtitle, color = TextSecondaryLight, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
private fun LearningSessionTopBar(
    course: LearningCourse,
    stage: String,
    onBackClick: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        NeuriseIconButton(
            icon = Icons.AutoMirrored.Filled.KeyboardArrowLeft,
            contentDescription = "Back",
            onClick = onBackClick
        )
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
            Text(course.shortName, color = TextPrimaryLight, fontSize = 18.sp, fontWeight = FontWeight.Black)
            Text(stage, color = course.color, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(course.background),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = course.color, modifier = Modifier.size(21.dp))
        }
    }
}

@Composable
private fun FlowProgressCard(
    current: Int,
    total: Int,
    score: Int,
    progress: Float,
    accent: Color
) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 22,
        contentPadding = PaddingValues(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Step $current/$total", color = accent, fontSize = 13.sp, fontWeight = FontWeight.Black)
            Text("$score AI points", color = TextSecondaryLight, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
        }
        Spacer(modifier = Modifier.height(12.dp))
        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(CircleShape),
            color = accent,
            trackColor = SurfaceElevated
        )
    }
}

@Composable
private fun QuestionFlashcard(
    question: FlowQuestion,
    course: LearningCourse,
    retryMode: Boolean,
    submitted: Boolean
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(236.dp)
            .clip(RoundedCornerShape(28.dp))
            .background(DarkForestGreen)
            .padding(22.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (retryMode) "Retry Question" else question.mode,
                color = SurfaceLight,
                fontSize = 13.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Text(
                text = course.shortName,
                color = SurfaceLight.copy(alpha = 0.84f),
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
        }
        Text(
            text = question.prompt,
            color = SurfaceLight,
            fontSize = 20.sp,
            lineHeight = 28.sp,
            textAlign = TextAlign.Center,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.align(Alignment.Center)
        )
        Row(
            modifier = Modifier.align(Alignment.BottomStart),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = if (submitted) Icons.Default.Insights else Icons.Default.AutoAwesome,
                contentDescription = null,
                tint = SurfaceLight,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(7.dp))
            Text(
                text = if (submitted) "AI feedback unlocked" else "Attempt before explanation",
                color = SurfaceLight.copy(alpha = 0.88f),
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun LearningOptionRow(
    option: FlowOption,
    selected: Boolean,
    submitted: Boolean,
    correct: Boolean,
    onClick: () -> Unit
) {
    val borderColor = when {
        submitted && correct -> AccentGreen
        submitted && selected && !correct -> AccentRed
        selected -> BrandViolet
        else -> BorderLight
    }
    val bgColor = when {
        submitted && correct -> AccentGreen.copy(alpha = 0.10f)
        submitted && selected && !correct -> AccentRed.copy(alpha = 0.08f)
        selected -> BrandVioletLight
        else -> SurfaceLight
    }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(bgColor)
            .border(1.dp, borderColor, RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(34.dp)
                .clip(CircleShape)
                .background(borderColor.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center
        ) {
            Text(option.key, color = borderColor, fontSize = 13.sp, fontWeight = FontWeight.Black)
        }
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = option.text,
            color = TextPrimaryLight,
            fontSize = 13.sp,
            lineHeight = 17.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun AiFeedbackPanel(
    question: FlowQuestion,
    isCorrect: Boolean,
    course: LearningCourse,
    selectedOption: String
) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 22,
        contentPadding = PaddingValues(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(if (isCorrect) AccentGreen.copy(alpha = 0.12f) else AccentRed.copy(alpha = 0.10f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (isCorrect) Icons.Default.CheckCircle else Icons.Default.ErrorOutline,
                    contentDescription = null,
                    tint = if (isCorrect) AccentGreen else AccentRed,
                    modifier = Modifier.size(21.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = if (isCorrect) "AI score: strong" else "AI score: retry needed",
                    color = TextPrimaryLight,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = "Your answer: $selectedOption. Correct answer: ${question.correctOption}.",
                    color = TextSecondaryLight,
                    fontSize = 11.sp
                )
            }
        }
        Spacer(modifier = Modifier.height(12.dp))
        Text(question.explanation, color = TextSecondaryLight, fontSize = 12.sp, lineHeight = 18.sp)
        Spacer(modifier = Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            question.tags.forEach { tag ->
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(course.background)
                        .padding(horizontal = 9.dp, vertical = 6.dp)
                ) {
                    Text(tag, color = course.color, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun LearningAlert(
    dialog: LearningDialog,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(dialog.title, color = TextPrimaryLight, fontWeight = FontWeight.Black)
        },
        text = {
            Text(dialog.message, color = TextSecondaryLight, lineHeight = 20.sp)
        },
        confirmButton = {
            TextButton(
                onClick = {
                    val action = dialog.onConfirm
                    onDismiss()
                    action()
                }
            ) {
                Text(dialog.confirmText, color = BrandViolet, fontWeight = FontWeight.ExtraBold)
            }
        },
        dismissButton = {
            if (dialog.dismissText != null) {
                TextButton(onClick = onDismiss) {
                    Text(dialog.dismissText, color = TextSecondaryLight, fontWeight = FontWeight.Bold)
                }
            }
        },
        containerColor = SurfaceLight,
        shape = RoundedCornerShape(24.dp)
    )
}

private fun courseById(courseId: String, uiState: CourseUiState = CourseUiState()): LearningCourse {
    val remoteCourses = uiState.courses.toLearningCourses(uiState.details)
    return remoteCourses.firstOrNull { it.id == courseId }
        ?: courseCatalog.firstOrNull { it.id == courseId }
        ?: remoteCourses.firstOrNull()
        ?: courseCatalog.first()
}

private fun List<CourseResponse>.toLearningCourses(details: Map<String, CourseDetailResponse>): List<LearningCourse> {
    return map { response ->
        response.toLearningCourse(details[response.slug])
    }
}

private fun CourseResponse.toLearningCourse(detail: CourseDetailResponse?): LearningCourse {
    val fallback = courseCatalog.firstOrNull { it.id == slug }
    val accent = colorFromHex(color, fallback?.color ?: BrandViolet)
    return LearningCourse(
        id = slug,
        shortName = shortName.ifBlank { fallback?.shortName ?: title.take(3).uppercase() },
        title = title,
        badge = badge.ifBlank { fallback?.badge ?: subjectTitle },
        description = description.ifBlank { fallback?.description ?: "" },
        coachLine = coachLine.ifBlank { fallback?.coachLine ?: description },
        planLine = planLine.ifBlank { fallback?.planLine ?: "Learn, practice, score, retry, and confirm with a mini mock." },
        teacher = teacher.ifBlank { fallback?.teacher ?: "Loksewa AI Coach" },
        lessonCount = lessonCount,
        duration = duration.ifBlank { fallback?.duration ?: "Adaptive" },
        level = level.ifBlank { fallback?.level ?: "Exam" },
        progress = progress,
        aiScore = aiScore,
        icon = iconFromKey(icon, fallback?.icon ?: Icons.Default.Book),
        color = accent,
        background = colorFromHex(background, fallback?.background ?: accent.copy(alpha = 0.12f)),
        modules = detail?.modules?.map { it.toCourseModule() }?.takeIf { it.isNotEmpty() } ?: fallback?.modules.orEmpty()
    )
}

private fun CourseModuleResponse.toCourseModule(): CourseModule {
    return CourseModule(
        title = title,
        lessons = lessons,
        duration = duration,
        progress = progress,
        locked = locked
    )
}

private fun CourseTaskResponse.toLearningTask(courseSlug: String): LearningTask {
    return LearningTask(
        id = id.toString(),
        courseId = courseSlug,
        title = title,
        subtitle = subtitle,
        duration = duration,
        icon = iconFromKey(icon, Icons.AutoMirrored.Filled.Assignment),
        scoreBoost = scoreBoost,
        nextDifficulty = nextDifficulty,
        alertTitle = alertTitle.ifBlank { title },
        alertMessage = alertMessage.ifBlank { subtitle }
    )
}

private fun CourseMistakeResponse.toMistakeItem(courseSlug: String): MistakeItem {
    return MistakeItem(
        courseId = courseSlug,
        title = title,
        reason = reason
    )
}

private fun CourseQuestionResponse.toFlowQuestion(): FlowQuestion {
    return FlowQuestion(
        mode = mode,
        prompt = prompt,
        options = listOf(
            FlowOption("A", optionA),
            FlowOption("B", optionB),
            FlowOption("C", optionC),
            FlowOption("D", optionD)
        ),
        correctOption = correctOption,
        explanation = explanation,
        hint = hint,
        tags = tags
    )
}

private fun colorFromHex(value: String, fallback: Color): Color {
    return runCatching { Color(AndroidColor.parseColor(value)) }.getOrDefault(fallback)
}

private fun iconFromKey(key: String, fallback: ImageVector): ImageVector {
    return when (key.lowercase()) {
        "public", "gk" -> Icons.Default.School
        "psychology", "iq" -> Icons.Default.Psychology
        "gavel", "law" -> Icons.Default.Gavel
        "business", "business_center", "admin" -> Icons.Default.BusinessCenter
        "timer" -> Icons.Default.Timer
        "bookmark" -> Icons.Default.Bookmark
        "question_answer" -> Icons.Default.QuestionAnswer
        "insights" -> Icons.Default.Insights
        "error" -> Icons.Default.ErrorOutline
        "assignment" -> Icons.AutoMirrored.Filled.Assignment
        "book" -> Icons.Default.Book
        "school" -> Icons.AutoMirrored.Filled.LibraryBooks
        else -> fallback
    }
}

private data class LearningDialog(
    val title: String,
    val message: String,
    val confirmText: String = "Got It",
    val dismissText: String? = null,
    val onConfirm: () -> Unit = {}
)

private data class LearningCourse(
    val id: String,
    val shortName: String,
    val title: String,
    val badge: String,
    val description: String,
    val coachLine: String,
    val planLine: String,
    val teacher: String,
    val lessonCount: Int,
    val duration: String,
    val level: String,
    val progress: Int,
    val aiScore: Int,
    val icon: ImageVector,
    val color: Color,
    val background: Color,
    val modules: List<CourseModule>
)

private data class CourseModule(
    val title: String,
    val lessons: Int,
    val duration: String,
    val progress: Int,
    val locked: Boolean = false
)

private data class LearningTask(
    val id: String,
    val courseId: String,
    val title: String,
    val subtitle: String,
    val duration: String,
    val icon: ImageVector,
    val scoreBoost: Int,
    val nextDifficulty: String,
    val alertTitle: String,
    val alertMessage: String
)

private data class MistakeItem(
    val courseId: String,
    val title: String,
    val reason: String
)

private data class FlowQuestion(
    val mode: String,
    val prompt: String,
    val options: List<FlowOption>,
    val correctOption: String,
    val explanation: String,
    val hint: String,
    val tags: List<String>
)

private data class FlowOption(
    val key: String,
    val text: String
)

private val courseCatalog = listOf(
    LearningCourse(
        id = "gk",
        shortName = "GK",
        title = "General Knowledge Mastery",
        badge = "Popular GK",
        description = "High-frequency facts, current affairs, science, geography, history, and Nepal-specific exam recall.",
        coachLine = "High-frequency facts, current affairs, and quick recall practice.",
        planLine = "6 min fact review, 20 prediction questions, 8 flashcards, 1 mistake retry.",
        teacher = "Aruna Sharma",
        lessonCount = 45,
        duration = "8 weeks",
        level = "Officer",
        progress = 64,
        aiScore = 73,
        icon = Icons.Default.School,
        color = BrandViolet,
        background = BrandVioletLight,
        modules = listOf(
            CourseModule("Nepal geography and history", 12, "1 hr 45 min", 80),
            CourseModule("Current affairs recall", 10, "1 hr 20 min", 54),
            CourseModule("Science and technology facts", 11, "1 hr 30 min", 28),
            CourseModule("Mixed GK mock confirmation", 12, "2 hr", 0, locked = true)
        )
    ),
    LearningCourse(
        id = "iq",
        shortName = "IQ",
        title = "IQ and Reasoning Accelerator",
        badge = "Speed Logic",
        description = "Pattern recognition, series, analogy, coding, direction, and elimination under exam timing.",
        coachLine = "Pattern recognition, series, analogy, and speed logic drills.",
        planLine = "Warm up shortcuts, solve timed sets, explain wrong patterns, retry slow items.",
        teacher = "Rabin K.C.",
        lessonCount = 32,
        duration = "6 weeks",
        level = "Beginner",
        progress = 48,
        aiScore = 68,
        icon = Icons.Default.Psychology,
        color = BrandTeal,
        background = BrandTealLight,
        modules = listOf(
            CourseModule("Number and letter series", 8, "1 hr", 65),
            CourseModule("Analogy and classification", 8, "1 hr 10 min", 44),
            CourseModule("Direction and coding", 8, "1 hr 15 min", 22),
            CourseModule("Timed reasoning mock", 8, "1 hr 30 min", 0, locked = true)
        )
    ),
    LearningCourse(
        id = "law",
        shortName = "Law",
        title = "Constitution and Law Essentials",
        badge = "Exam Trap",
        description = "Articles, rights, duties, governance structure, commissions, and negative wording traps.",
        coachLine = "Articles, rights, governance structure, and keyword traps.",
        planLine = "Article recall, keyword trap practice, provision mapping, and mini mock.",
        teacher = "Maya Adhikari",
        lessonCount = 28,
        duration = "5 weeks",
        level = "Intermediate",
        progress = 42,
        aiScore = 61,
        icon = Icons.Default.Gavel,
        color = BrandOrange,
        background = BrandOrangeLight,
        modules = listOf(
            CourseModule("Fundamental rights and duties", 8, "1 hr 15 min", 58),
            CourseModule("State structure and bodies", 7, "1 hr", 38),
            CourseModule("Article number recall", 7, "55 min", 18),
            CourseModule("Negative keyword practice", 6, "50 min", 0, locked = true)
        )
    ),
    LearningCourse(
        id = "admin",
        shortName = "Admin",
        title = "Public Administration Practice",
        badge = "Policy Skill",
        description = "Administration principles, accountability, public service delivery, policy cycle, and practical cases.",
        coachLine = "Policy, management, accountability, and service delivery concepts.",
        planLine = "Concept review, scenario selection, weak term flashcards, and case retry.",
        teacher = "Suman Bista",
        lessonCount = 24,
        duration = "4 weeks",
        level = "Officer",
        progress = 37,
        aiScore = 58,
        icon = Icons.Default.BusinessCenter,
        color = BrandBlue,
        background = BrandBlueLight,
        modules = listOf(
            CourseModule("Administration principles", 7, "1 hr", 48),
            CourseModule("Accountability and ethics", 6, "45 min", 36),
            CourseModule("Policy cycle", 5, "40 min", 18),
            CourseModule("Applied case practice", 6, "1 hr", 0, locked = true)
        )
    )
)

private val learningTasks = listOf(
    LearningTask(
        id = "gk-daily",
        courseId = "gk",
        title = "Daily Prediction Set",
        subtitle = "20 high-frequency GK questions with instant answer reasoning.",
        duration = "12 min",
        icon = Icons.Default.QuestionAnswer,
        scoreBoost = 3,
        nextDifficulty = "Medium",
        alertTitle = "GK set ready",
        alertMessage = "AI will score recall speed and flag current affairs that need spaced revision."
    ),
    LearningTask(
        id = "gk-flash",
        courseId = "gk",
        title = "Rapid Fact Flashcards",
        subtitle = "Memorize dates, institutions, awards, geography, and science facts.",
        duration = "7 min",
        icon = Icons.Default.Bookmark,
        scoreBoost = 2,
        nextDifficulty = "Easy",
        alertTitle = "Flashcards ready",
        alertMessage = "Slow cards will be pinned to tomorrow's revision queue."
    ),
    LearningTask(
        id = "iq-speed",
        courseId = "iq",
        title = "Speed Reasoning Drill",
        subtitle = "Series, analogy, coding, direction, and odd-one-out under time.",
        duration = "15 min",
        icon = Icons.Default.Timer,
        scoreBoost = 4,
        nextDifficulty = "Hard",
        alertTitle = "Speed drill ready",
        alertMessage = "AI will mark time pressure, skipped steps, and shortcut opportunities."
    ),
    LearningTask(
        id = "iq-explain",
        courseId = "iq",
        title = "Step-by-step Logic",
        subtitle = "See why each option fails before selecting the final answer.",
        duration = "9 min",
        icon = Icons.Default.Insights,
        scoreBoost = 3,
        nextDifficulty = "Medium",
        alertTitle = "Logic flow ready",
        alertMessage = "The coach compares your reasoning path with the optimal shortcut."
    ),
    LearningTask(
        id = "law-articles",
        courseId = "law",
        title = "Article Recall Sprint",
        subtitle = "Practice Constitution article numbers, rights, duties, and bodies.",
        duration = "11 min",
        icon = Icons.Default.Gavel,
        scoreBoost = 4,
        nextDifficulty = "Hard",
        alertTitle = "Law recall ready",
        alertMessage = "AI will detect article sequence confusion and generate a smaller recall chain."
    ),
    LearningTask(
        id = "law-keyword",
        courseId = "law",
        title = "Keyword Trap Practice",
        subtitle = "Train on except, not, only, and similar exam wording traps.",
        duration = "8 min",
        icon = Icons.Default.ErrorOutline,
        scoreBoost = 3,
        nextDifficulty = "Medium",
        alertTitle = "Keyword traps ready",
        alertMessage = "Wrong answers are grouped by trap type so you can retry with better attention."
    ),
    LearningTask(
        id = "admin-policy",
        courseId = "admin",
        title = "Policy Concept Drill",
        subtitle = "Connect administration principles with real Loksewa-style examples.",
        duration = "13 min",
        icon = Icons.Default.BusinessCenter,
        scoreBoost = 3,
        nextDifficulty = "Medium",
        alertTitle = "Policy drill ready",
        alertMessage = "AI will compare theory recall against applied scenario selection."
    ),
    LearningTask(
        id = "admin-case",
        courseId = "admin",
        title = "Case Explanation",
        subtitle = "Read a short case and select the most accountable decision.",
        duration = "10 min",
        icon = Icons.Default.Book,
        scoreBoost = 4,
        nextDifficulty = "Hard",
        alertTitle = "Case flow ready",
        alertMessage = "The coach explains why each distractor looks attractive but fails the rule."
    ),
    LearningTask(
        id = "all-mini-mock",
        courseId = "all",
        title = "Mini Mock Confirmation",
        subtitle = "10 mixed questions to verify whether today's learning actually stuck.",
        duration = "10 min",
        icon = Icons.AutoMirrored.Filled.Assignment,
        scoreBoost = 5,
        nextDifficulty = "Adaptive",
        alertTitle = "Mini mock ready",
        alertMessage = "The next mini mock mixes strong and weak topics so the score is not inflated."
    )
)

private val mistakeBook = listOf(
    MistakeItem("gk", "Federalism fact mix-up", "Province and local level powers confused"),
    MistakeItem("gk", "Current affairs recall", "Slow recall on recent appointments"),
    MistakeItem("iq", "Number series shortcut", "Used long calculation instead of pattern"),
    MistakeItem("iq", "Direction sense trap", "Skipped final orientation check"),
    MistakeItem("law", "Article sequence recall", "Article number and provision mismatch"),
    MistakeItem("law", "Except keyword missed", "Selected true statement in negative question"),
    MistakeItem("admin", "Accountability concept", "Mixed transparency with responsibility"),
    MistakeItem("admin", "Policy cycle order", "Evaluation placed before implementation")
)

private val courseQuestions = mapOf(
    "gk" to listOf(
        FlowQuestion(
            mode = "Learn and Practice",
            prompt = "Which method gives the strongest long-term recall for static GK facts?",
            options = listOf(
                FlowOption("A", "Only reading the same page many times"),
                FlowOption("B", "Spaced active recall with short flashcards"),
                FlowOption("C", "Watching one long lecture without practice"),
                FlowOption("D", "Solving only full mocks")
            ),
            correctOption = "B",
            explanation = "Spaced active recall forces retrieval and repeats weak facts over time. That is why the AI plan turns slow or wrong facts into tomorrow's cards.",
            hint = "Think about a method that makes your brain retrieve the fact, not just see it again.",
            tags = listOf("Recall", "Flashcard")
        ),
        FlowQuestion(
            mode = "Prediction Set",
            prompt = "In a GK exam, what should the AI mark as a weak signal after practice?",
            options = listOf(
                FlowOption("A", "Only wrong answers"),
                FlowOption("B", "Wrong answers and slow correct answers"),
                FlowOption("C", "Only skipped questions"),
                FlowOption("D", "Only questions from history")
            ),
            correctOption = "B",
            explanation = "A slow correct answer still means recall is fragile. The flow treats it as review material before it becomes a wrong answer under pressure.",
            hint = "A correct answer can still be risky when it takes too long.",
            tags = listOf("Speed", "Weakness")
        )
    ),
    "iq" to listOf(
        FlowQuestion(
            mode = "Speed Drill",
            prompt = "What is the first check in a number series question?",
            options = listOf(
                FlowOption("A", "Guess from the options"),
                FlowOption("B", "Difference, ratio, alternating pattern, then position logic"),
                FlowOption("C", "Always multiply by two"),
                FlowOption("D", "Skip the question immediately")
            ),
            correctOption = "B",
            explanation = "A stable check order avoids wasting time. The AI flow records where your reasoning slowed down.",
            hint = "Look for a repeatable checklist, not a single formula.",
            tags = listOf("Shortcut", "Speed")
        ),
        FlowQuestion(
            mode = "Reasoning",
            prompt = "Why should you review wrong reasoning paths, not only final answers?",
            options = listOf(
                FlowOption("A", "It reveals the trap that caused the wrong answer"),
                FlowOption("B", "It makes every question longer"),
                FlowOption("C", "It removes the need for mocks"),
                FlowOption("D", "It only helps vocabulary")
            ),
            correctOption = "A",
            explanation = "Reasoning questions are won by path quality. AI feedback turns wrong paths into shorter retry drills.",
            hint = "The answer alone does not show where your logic failed.",
            tags = listOf("Trap", "Retry")
        )
    ),
    "law" to listOf(
        FlowQuestion(
            mode = "Keyword Trap",
            prompt = "What is the safest first action in a negative law question?",
            options = listOf(
                FlowOption("A", "Ignore the negative word"),
                FlowOption("B", "Circle the negative keyword and eliminate true statements"),
                FlowOption("C", "Choose the longest option"),
                FlowOption("D", "Skip all article questions")
            ),
            correctOption = "B",
            explanation = "Negative wording changes the task. The AI flow separates keyword mistakes from knowledge mistakes.",
            hint = "The question is asking for an exception, not the usual true statement.",
            tags = listOf("Keyword", "Law")
        ),
        FlowQuestion(
            mode = "Article Recall",
            prompt = "Why does article recall need small chains instead of one big list?",
            options = listOf(
                FlowOption("A", "Small chains reduce sequence confusion"),
                FlowOption("B", "Big lists are always faster"),
                FlowOption("C", "Articles are not asked in exams"),
                FlowOption("D", "It removes the need to revise")
            ),
            correctOption = "A",
            explanation = "Short chains keep related provisions together and reduce article-number swapping.",
            hint = "Think about preventing one provision from being mixed with another.",
            tags = listOf("Recall", "Article")
        )
    ),
    "admin" to listOf(
        FlowQuestion(
            mode = "Case Practice",
            prompt = "How is accountability different from transparency?",
            options = listOf(
                FlowOption("A", "They mean exactly the same thing"),
                FlowOption("B", "Transparency is visibility, accountability is responsibility for action and result"),
                FlowOption("C", "Accountability only means publishing data"),
                FlowOption("D", "Transparency only applies to private offices")
            ),
            correctOption = "B",
            explanation = "Many administration questions use close concepts. AI feedback flags term confusion and gives a contrast card.",
            hint = "One term is about seeing action, the other is about being answerable for it.",
            tags = listOf("Concept", "Contrast")
        ),
        FlowQuestion(
            mode = "Policy Drill",
            prompt = "Which step comes after policy implementation in a simple policy cycle?",
            options = listOf(
                FlowOption("A", "Evaluation"),
                FlowOption("B", "Problem identification"),
                FlowOption("C", "Agenda setting"),
                FlowOption("D", "Drafting only")
            ),
            correctOption = "A",
            explanation = "Implementation is followed by evaluation so the result can be measured and adjusted.",
            hint = "After doing the policy, the system needs to check the result.",
            tags = listOf("Policy", "Sequence")
        )
    )
)
