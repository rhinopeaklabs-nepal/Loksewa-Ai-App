package com.loksewa.aiapp.ui.screens

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
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.BusinessCenter
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.QuestionAnswer
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.data.local.ScanHistoryEntity
import com.loksewa.aiapp.ui.components.NeuriseCard
import com.loksewa.aiapp.ui.components.NeuriseIconButton
import com.loksewa.aiapp.ui.components.NeuriseMetric
import com.loksewa.aiapp.ui.components.NeurisePill
import com.loksewa.aiapp.ui.components.NeurisePrimaryButton
import com.loksewa.aiapp.ui.components.NeuriseScreenSurface
import com.loksewa.aiapp.ui.components.NeuriseSectionHeader
import com.loksewa.aiapp.ui.components.NeuriseThumbnail
import com.loksewa.aiapp.ui.components.categoryTint
import com.loksewa.aiapp.ui.components.courseGradientPairs
import com.loksewa.aiapp.ui.theme.AccentGreen
import com.loksewa.aiapp.ui.theme.AccentRed
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandBlue
import com.loksewa.aiapp.ui.theme.BrandOrange
import com.loksewa.aiapp.ui.theme.BrandTeal
import com.loksewa.aiapp.ui.theme.BrandTealLight
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.BrandVioletLight
import com.loksewa.aiapp.ui.theme.DarkForestGreen
import com.loksewa.aiapp.ui.theme.StatusSuccess
import com.loksewa.aiapp.ui.theme.SurfaceElevated
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.SurfaceWarm
import com.loksewa.aiapp.ui.theme.TextPrimaryLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight
import com.loksewa.aiapp.ui.theme.TextTertiaryLight
import com.loksewa.aiapp.ui.theme.VerifiedBadgeBackground

@Composable
fun HomeScreen(
    userName: String,
    stats: UserStatsUiState,
    scanHistory: List<ScanHistoryEntity>,
    onMockTestClick: () -> Unit,
    onCameraClick: () -> Unit,
    onProfileClick: () -> Unit,
    onHistoryItemClick: (Int?, String) -> Unit,
    onClearHistory: () -> Unit
) {
    NeuriseScreenSurface {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            item {
                HomeHeader(
                    userName = userName.ifBlank { "Scholar" },
                    onProfileClick = onProfileClick
                )
            }

            item {
                AiCoachPanel(
                    onCameraClick = onCameraClick,
                    onMockTestClick = onMockTestClick
                )
            }

            item {
                SearchBar()
            }

            item {
                CourseCategories()
            }

            item {
                TrendingCourses(onMockTestClick = onMockTestClick)
            }

            item {
                ProgressAndTools(
                    stats = stats,
                    onCameraClick = onCameraClick,
                    onMockTestClick = onMockTestClick
                )
            }

            item {
                FlashcardPreview(onMockTestClick = onMockTestClick)
            }

            item {
                RecentQuestionHeader(
                    hasHistory = scanHistory.isNotEmpty(),
                    onClearHistory = onClearHistory
                )
            }

            if (scanHistory.isEmpty()) {
                item {
                    EmptyHistoryCard(onCameraClick = onCameraClick)
                }
            } else {
                items(scanHistory) { scan ->
                    NeuriseHistoryCard(
                        scan = scan,
                        onClick = { onHistoryItemClick(scan.matchedQuestionId, scan.answerSource) }
                    )
                }
            }
        }
    }
}

@Composable
private fun HomeHeader(
    userName: String,
    onProfileClick: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "Hi, $userName",
                color = TextPrimaryLight,
                fontSize = 24.sp,
                fontWeight = FontWeight.Black
            )
            Spacer(modifier = Modifier.height(5.dp))
            Text(
                text = "What is on your mind to learn today?",
                color = TextSecondaryLight,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            NeuriseIconButton(
                icon = Icons.Default.Notifications,
                contentDescription = "Notifications",
                onClick = {}
            )
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.linearGradient(listOf(BrandVioletLight, BrandTealLight))
                    )
                    .border(1.dp, BorderLight, CircleShape)
                    .clickable(onClick = onProfileClick),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "Profile",
                    tint = BrandViolet,
                    modifier = Modifier.size(23.dp)
                )
            }
        }
    }
}

@Composable
private fun AiCoachPanel(
    onCameraClick: () -> Unit,
    onMockTestClick: () -> Unit
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
            Box(
                modifier = Modifier
                    .size(76.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(Brush.linearGradient(listOf(BrandViolet, BrandTeal))),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = SurfaceLight,
                    modifier = Modifier.size(34.dp)
                )
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Learn smarter with Loksewa AI",
                    color = TextPrimaryLight,
                    fontSize = 18.sp,
                    lineHeight = 22.sp,
                    fontWeight = FontWeight.Black
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Snap a question, review verified answers, and practice the same topic.",
                    color = TextSecondaryLight,
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf("Mathematics", "Constitution", "GK", "IQ Reasoning", "Nepali").forEachIndexed { index, label ->
                val (tint, bg) = categoryTint(index)
                NeurisePill(label = label, icon = null, selected = index == 0, tint = tint, background = bg)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            NeurisePrimaryButton(
                text = "Snap to Solve",
                modifier = Modifier.weight(1f),
                onClick = onCameraClick
            )
            Box(
                modifier = Modifier
                    .height(52.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(SurfaceWarm)
                    .border(1.dp, BorderLight, RoundedCornerShape(18.dp))
                    .clickable(onClick = onMockTestClick)
                    .padding(horizontal = 15.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.Assignment,
                    contentDescription = "Mock tests",
                    tint = BrandViolet,
                    modifier = Modifier.size(22.dp)
                )
            }
        }
    }
}

@Composable
private fun SearchBar() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(SurfaceLight)
            .border(1.dp, BorderLight, RoundedCornerShape(18.dp))
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = Icons.Default.Search,
            contentDescription = null,
            tint = TextTertiaryLight,
            modifier = Modifier.size(22.dp)
        )
        Spacer(modifier = Modifier.width(10.dp))
        Text(
            text = "Search questions, syllabus, and mock sets",
            color = TextTertiaryLight,
            fontSize = 13.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
private fun CourseCategories() {
    Column {
        NeuriseSectionHeader(title = "Course Category")
        Spacer(modifier = Modifier.height(10.dp))
        Row(
            modifier = Modifier.horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            val categories = listOf(
                Triple("GK", Icons.Default.Public, BrandViolet),
                Triple("IQ", Icons.Default.Psychology, BrandTeal),
                Triple("Admin", Icons.Default.BusinessCenter, BrandBlue),
                Triple("Law", Icons.Default.Gavel, BrandOrange),
                Triple("More", Icons.Default.Add, BrandViolet)
            )
            categories.forEachIndexed { index, category ->
                val (tint, bg) = categoryTint(index)
                NeurisePill(
                    label = category.first,
                    icon = category.second,
                    selected = index == 0,
                    tint = if (index == 0) category.third else tint,
                    background = bg
                )
            }
        }
    }
}

@Composable
private fun TrendingCourses(onMockTestClick: () -> Unit) {
    Column {
        NeuriseSectionHeader(title = "Trending Course", onActionClick = onMockTestClick)
        Spacer(modifier = Modifier.height(12.dp))
        Row(
            modifier = Modifier.horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            sampleCourses.forEachIndexed { index, course ->
                CourseCard(
                    course = course,
                    gradient = courseGradientPairs[index % courseGradientPairs.size],
                    onClick = onMockTestClick
                )
            }
        }
    }
}

@Composable
private fun CourseCard(
    course: HomeCourse,
    gradient: Pair<Color, Color>,
    onClick: () -> Unit
) {
    NeuriseCard(
        modifier = Modifier
            .width(214.dp)
            .clickable(onClick = onClick),
        cornerRadius = 18,
        contentPadding = PaddingValues(10.dp)
    ) {
        NeuriseThumbnail(
            icon = course.icon,
            accent = gradient.first,
            secondary = gradient.second,
            modifier = Modifier
                .fillMaxWidth()
                .height(104.dp)
        )
        Spacer(modifier = Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(
                text = "Popular",
                color = BrandViolet,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = course.tag,
                color = gradient.first,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
        }
        Spacer(modifier = Modifier.height(7.dp))
        Text(
            text = course.title,
            color = TextPrimaryLight,
            fontSize = 14.sp,
            lineHeight = 18.sp,
            fontWeight = FontWeight.ExtraBold,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
        Spacer(modifier = Modifier.height(10.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = course.teacher,
                color = TextSecondaryLight,
                fontSize = 11.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f)
            )
            Text(
                text = course.price,
                color = TextPrimaryLight,
                fontSize = 14.sp,
                fontWeight = FontWeight.Black
            )
        }
    }
}

@Composable
private fun ProgressAndTools(
    stats: UserStatsUiState,
    onCameraClick: () -> Unit,
    onMockTestClick: () -> Unit
) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 24,
        contentPadding = PaddingValues(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Study progress",
                    color = TextPrimaryLight,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = "Mock performance and answer recall",
                    color = TextSecondaryLight,
                    fontSize = 12.sp
                )
            }
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(13.dp))
                    .background(BrandVioletLight)
                    .padding(horizontal = 10.dp, vertical = 7.dp)
            ) {
                Text(
                    text = "AI Plan",
                    color = BrandViolet,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            NeuriseMetric("Mocks", stats.totalMocksTaken.toString(), Modifier.weight(1f), BrandViolet)
            Box(modifier = Modifier.width(1.dp).fillMaxHeight().background(BorderLight))
            NeuriseMetric("Average", String.format("%.0f%%", stats.averageScore), Modifier.weight(1f), BrandBlue)
            Box(modifier = Modifier.width(1.dp).fillMaxHeight().background(BorderLight))
            NeuriseMetric("Best", String.format("%.0f%%", stats.bestScore), Modifier.weight(1f), BrandOrange)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            ToolTile(
                title = "Scan & Solve",
                subtitle = "Offline OCR",
                icon = Icons.Default.CameraAlt,
                tint = BrandTeal,
                onClick = onCameraClick,
                modifier = Modifier.weight(1f)
            )
            ToolTile(
                title = "Mock Exams",
                subtitle = "Timed tests",
                icon = Icons.Default.Timer,
                tint = BrandViolet,
                onClick = onMockTestClick,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun ToolTile(
    title: String,
    subtitle: String,
    icon: ImageVector,
    tint: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(SurfaceWarm)
            .border(1.dp, BorderLight, RoundedCornerShape(18.dp))
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
        Spacer(modifier = Modifier.height(12.dp))
        Text(title, color = TextPrimaryLight, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
        Text(subtitle, color = TextSecondaryLight, fontSize = 11.sp, maxLines = 1)
    }
}

@Composable
private fun FlashcardPreview(onMockTestClick: () -> Unit) {
    Column {
        NeuriseSectionHeader(title = "Quick Flashcard", actionText = "Try Quiz", onActionClick = onMockTestClick)
        Spacer(modifier = Modifier.height(12.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(DarkForestGreen)
                .clickable(onClick = onMockTestClick)
                .padding(22.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Questions", color = SurfaceLight, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Text("1/5", color = SurfaceLight, fontSize = 14.sp, fontWeight = FontWeight.Black)
            }
            Text(
                text = "What is the difference between loktantra and ganatantra?",
                color = SurfaceLight,
                fontSize = 20.sp,
                lineHeight = 27.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.align(Alignment.Center)
            )
            Text(
                text = "Tap to Flip",
                color = SurfaceLight.copy(alpha = 0.86f),
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.BottomStart)
            )
        }
    }
}

@Composable
private fun RecentQuestionHeader(
    hasHistory: Boolean,
    onClearHistory: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = "Recent Question",
                color = TextPrimaryLight,
                fontSize = 16.sp,
                fontWeight = FontWeight.Black
            )
            Text(
                text = "Matched OCR history and explanations",
                color = TextSecondaryLight,
                fontSize = 12.sp
            )
        }
        if (hasHistory) {
            Text(
                text = "Clear All",
                color = AccentRed,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable(onClick = onClearHistory)
            )
        }
    }
}

@Composable
private fun EmptyHistoryCard(onCameraClick: () -> Unit) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 22,
        contentPadding = PaddingValues(18.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(BrandVioletLight),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.QuestionAnswer, contentDescription = null, tint = BrandViolet)
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "No solved questions yet",
                    color = TextPrimaryLight,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = "Scan an exam paper to build your personal review trail.",
                    color = TextSecondaryLight,
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )
            }
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = "Scan",
                tint = BrandViolet,
                modifier = Modifier
                    .size(28.dp)
                    .clickable(onClick = onCameraClick)
            )
        }
    }
}

@Composable
private fun NeuriseHistoryCard(
    scan: ScanHistoryEntity,
    onClick: () -> Unit
) {
    val statusColor = when (scan.answerSource) {
        "verified_db" -> StatusSuccess
        "ai_assisted" -> BrandOrange
        "ai_only" -> BrandViolet
        else -> BrandBlue
    }
    val badgeLabel = when (scan.answerSource) {
        "verified_db" -> "DB Match"
        "ai_assisted" -> "AI Assist"
        "ai_only" -> "Generative"
        else -> "Pending"
    }
    val badgeBg = when (scan.answerSource) {
        "verified_db" -> VerifiedBadgeBackground
        "ai_assisted" -> com.loksewa.aiapp.ui.theme.BrandOrangeLight
        "ai_only" -> BrandVioletLight
        else -> SurfaceElevated
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(SurfaceLight)
            .border(1.dp, BorderLight, RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(statusColor.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.QuestionAnswer,
                contentDescription = null,
                tint = statusColor,
                modifier = Modifier.size(19.dp)
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = scan.scannedText,
                color = TextPrimaryLight,
                fontSize = 13.sp,
                fontWeight = FontWeight.ExtraBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(badgeBg)
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = badgeLabel,
                        color = statusColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black
                    )
                }
                Text(
                    text = scan.createdAt.split(" ").firstOrNull() ?: "",
                    color = TextSecondaryLight,
                    fontSize = 11.sp
                )
            }
        }
        Icon(
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = "Open",
            tint = TextTertiaryLight,
            modifier = Modifier.size(22.dp)
        )
    }
}

private data class HomeCourse(
    val title: String,
    val teacher: String,
    val tag: String,
    val price: String,
    val icon: ImageVector
)

private val sampleCourses = listOf(
    HomeCourse(
        title = "Officer Level General Knowledge Sprint",
        teacher = "Aruna Sharma",
        tag = "GK",
        price = "Free",
        icon = Icons.Default.Public
    ),
    HomeCourse(
        title = "IQ Reasoning for Loksewa Beginners",
        teacher = "Rabin K.C.",
        tag = "IQ",
        price = "Practice",
        icon = Icons.Default.Psychology
    ),
    HomeCourse(
        title = "Governance and Constitution Essentials",
        teacher = "Maya Adhikari",
        tag = "Law",
        price = "Guide",
        icon = Icons.Default.Gavel
    )
)
