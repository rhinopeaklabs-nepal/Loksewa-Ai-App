package com.loksewa.aiapp.ui.screens

import android.graphics.Paint
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.ui.components.NeuriseCard
import com.loksewa.aiapp.ui.components.NeuriseIconButton
import com.loksewa.aiapp.ui.components.NeuriseMetric
import com.loksewa.aiapp.ui.components.NeurisePill
import com.loksewa.aiapp.ui.components.NeuriseScreenSurface
import com.loksewa.aiapp.ui.components.NeuriseSectionHeader
import com.loksewa.aiapp.ui.theme.*

@Composable
fun AnalyticsScreen(
    onBackClick: (() -> Unit)? = null
) {
    var selectedTab by remember { mutableIntStateOf(0) } // 0 = Overview, 1 = Performance, 2 = Subjects
    var selectedTimeframe by remember { mutableStateOf("This Week") }
    val timeframes = listOf("This Week", "Last Week", "Last 30 Days", "All Time")

    val tabs = listOf("Overview", "Performance", "Subjects")

    NeuriseScreenSurface {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
        ) {
            // Top Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (onBackClick != null) {
                    NeuriseIconButton(
                        icon = Icons.AutoMirrored.Filled.KeyboardArrowLeft,
                        contentDescription = "Back",
                        onClick = onBackClick
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                }
                Text(
                    text = "Analytics",
                    color = TextPrimaryLight,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black
                )
            }

            // Custom Tabs
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
                tabs.forEachIndexed { index, title ->
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
                            text = title,
                            color = if (isSelected) BrandViolet else TextSecondaryLight,
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Timeframe Selector
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                timeframes.forEach { timeframe ->
                    val isSelected = selectedTimeframe == timeframe
                    NeurisePill(
                        label = timeframe,
                        icon = if (isSelected) Icons.Default.CalendarMonth else null,
                        selected = isSelected,
                        tint = BrandViolet,
                        background = BrandVioletLight,
                        onClick = { selectedTimeframe = timeframe }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Scrollable Content
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f),
                contentPadding = PaddingValues(start = 20.dp, end = 20.dp, bottom = 24.dp),
                verticalArrangement = Arrangement.spacedBy(18.dp)
            ) {
                when (selectedTab) {
                    0 -> {
                        // Overview Tab
                        item {
                            PerformanceMetricsGrid(
                                testsTaken = 12,
                                avgScore = 72,
                                accuracy = 68
                            )
                        }

                        item {
                            ScoreTrendChartCard()
                        }

                        item {
                            TopSubjectsCard()
                        }
                    }
                    1 -> {
                        // Performance Details Tab
                        item {
                            PerformanceMetricsGrid(
                                testsTaken = 12,
                                avgScore = 72,
                                accuracy = 68
                            )
                        }
                        item {
                            ScoreTrendChartCard()
                        }
                        item {
                            DetailedStatsCard()
                        }
                    }
                    2 -> {
                        // Subjects breakdown Tab
                        item {
                            TopSubjectsCard(showAll = true)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PerformanceMetricsGrid(
    testsTaken: Int,
    avgScore: Int,
    accuracy: Int
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
                    text = "Performance Metrics",
                    color = TextPrimaryLight,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = "Summary of mock tests & quizzes",
                    color = TextSecondaryLight,
                    fontSize = 12.sp
                )
            }
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(BrandVioletLight)
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "Live Stats",
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
            NeuriseMetric("Tests Taken", testsTaken.toString(), Modifier.weight(1f), BrandViolet)
            Box(modifier = Modifier.width(1.dp).fillMaxHeight().background(BorderLight))
            NeuriseMetric("Average Score", "$avgScore%", Modifier.weight(1f), BrandBlue)
            Box(modifier = Modifier.width(1.dp).fillMaxHeight().background(BorderLight))
            NeuriseMetric("Accuracy", "$accuracy%", Modifier.weight(1f), BrandOrange)
        }
    }
}

@Composable
fun ScoreTrendChartCard() {
    val trendData = listOf(55f, 62f, 75f, 68f, 80f, 72f, 85f)
    val days = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")

    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 24,
        contentPadding = PaddingValues(18.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(BrandVioletLight),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.TrendingUp,
                        contentDescription = null,
                        tint = BrandViolet,
                        modifier = Modifier.size(19.dp)
                    )
                }
                Column {
                    Text(
                        text = "Score Trend",
                        color = TextPrimaryLight,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        text = "Recent test scores out of 100",
                        color = TextSecondaryLight,
                        fontSize = 12.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Custom Canvas-drawn Line Chart
        BeautifulLineChart(
            data = trendData,
            labels = days,
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
        )
    }
}

@Composable
fun BeautifulLineChart(
    data: List<Float>,
    labels: List<String>,
    modifier: Modifier = Modifier
) {
    val primaryColor = BrandViolet
    val gradientColor = BrandViolet.copy(alpha = 0.25f)
    val gridColor = BorderLight
    val textPaintColor = TextSecondaryLight.toArgb()

    val density = LocalDensity.current
    val textSpacing = with(density) { 14.sp.toPx() }

    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val paddingLeft = 60f
        val paddingBottom = 60f
        val paddingTop = 20f
        val paddingRight = 20f

        val chartWidth = width - paddingLeft - paddingRight
        val chartHeight = height - paddingTop - paddingBottom

        if (data.size < 2) return@Canvas

        val maxVal = 100f
        val minVal = 0f
        val valRange = maxVal - minVal

        // 1. Draw horizontal grid lines and Y-axis labels
        val gridLines = 4
        for (i in 0..gridLines) {
            val ratio = i.toFloat() / gridLines
            val y = paddingTop + chartHeight * (1f - ratio)
            
            // Draw grid line
            drawLine(
                color = gridColor,
                start = Offset(paddingLeft, y),
                end = Offset(width - paddingRight, y),
                strokeWidth = 1.dp.toPx()
            )

            // Draw Y-axis text
            val scoreLabel = (minVal + ratio * valRange).toInt().toString()
            drawContext.canvas.nativeCanvas.drawText(
                scoreLabel,
                10f,
                y + 6f,
                Paint().apply {
                    color = textPaintColor
                    textSize = textSpacing
                    textAlign = Paint.Align.LEFT
                    isAntiAlias = true
                }
            )
        }

        // Calculate coordinates of all points
        val points = data.mapIndexed { index, score ->
            val ratioX = index.toFloat() / (data.size - 1)
            val ratioY = (score - minVal) / valRange
            val x = paddingLeft + ratioX * chartWidth
            val y = paddingTop + chartHeight * (1f - ratioY)
            Offset(x, y)
        }

        // 2. Draw gradient under the line
        val gradientPath = Path().apply {
            moveTo(points.first().x, paddingTop + chartHeight)
            points.forEach { point ->
                lineTo(point.x, point.y)
            }
            lineTo(points.last().x, paddingTop + chartHeight)
            close()
        }
        drawPath(
            path = gradientPath,
            brush = Brush.verticalGradient(
                colors = listOf(gradientColor, Color.Transparent),
                startY = paddingTop,
                endY = paddingTop + chartHeight
            )
        )

        // 3. Draw the line chart line
        val linePath = Path().apply {
            moveTo(points.first().x, points.first().y)
            for (i in 1 until points.size) {
                lineTo(points[i].x, points[i].y)
            }
        }
        drawPath(
            path = linePath,
            color = primaryColor,
            style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
        )

        // 4. Draw circles at each point
        points.forEach { point ->
            drawCircle(
                color = primaryColor,
                radius = 6.dp.toPx(),
                center = point
            )
            drawCircle(
                color = Color.White,
                radius = 3.dp.toPx(),
                center = point
            )
        }

        // 5. Draw X-axis labels
        labels.forEachIndexed { index, label ->
            val ratioX = index.toFloat() / (labels.size - 1)
            val x = paddingLeft + ratioX * chartWidth
            val y = height - 10f

            drawContext.canvas.nativeCanvas.drawText(
                label,
                x,
                y,
                Paint().apply {
                    color = textPaintColor
                    textSize = textSpacing
                    textAlign = Paint.Align.CENTER
                    isAntiAlias = true
                }
            )
        }
    }
}

private data class SubjectProgress(
    val name: String,
    val score: Int,
    val totalChapters: Int,
    val color: Color
)

@Composable
fun TopSubjectsCard(showAll: Boolean = false) {
    val subjectsList = listOf(
        SubjectProgress("Geography", 78, 12, BrandTeal),
        SubjectProgress("Constitution & Law", 72, 15, BrandViolet),
        SubjectProgress("History of Nepal", 68, 10, BrandOrange),
        SubjectProgress("Economics", 65, 8, BrandBlue),
        SubjectProgress("General Knowledge", 60, 20, AccentGreen)
    )

    val displayedList = if (showAll) subjectsList else subjectsList.take(3)

    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 24,
        contentPadding = PaddingValues(18.dp)
    ) {
        NeuriseSectionHeader(
            title = if (showAll) "All Subject Analytics" else "Top Subjects",
            actionText = null
        )

        Spacer(modifier = Modifier.height(14.dp))

        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            displayedList.forEach { subject ->
                SubjectProgressRow(subject = subject)
            }
        }
    }
}

@Composable
private fun SubjectProgressRow(subject: SubjectProgress) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(subject.color)
                )
                Text(
                    text = subject.name,
                    color = TextPrimaryLight,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Text(
                text = "${subject.score}% accuracy",
                color = subject.color,
                fontSize = 13.sp,
                fontWeight = FontWeight.ExtraBold
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            LinearProgressIndicator(
                progress = { subject.score / 100f },
                modifier = Modifier
                    .weight(1f)
                    .height(8.dp)
                    .clip(CircleShape),
                color = subject.color,
                trackColor = BorderLight
            )
            Text(
                text = "${subject.totalChapters} Chs",
                color = TextSecondaryLight,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun DetailedStatsCard() {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 24,
        contentPadding = PaddingValues(18.dp)
    ) {
        Text(
            text = "Detailed Breakdown",
            color = TextPrimaryLight,
            fontSize = 16.sp,
            fontWeight = FontWeight.Black
        )
        Spacer(modifier = Modifier.height(14.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            DetailStatTile(
                title = "Study Time",
                value = "18.5 hrs",
                icon = Icons.Default.Timeline,
                tint = BrandViolet,
                modifier = Modifier.weight(1f)
            )
            DetailStatTile(
                title = "Wrong Answers",
                value = "42 items",
                icon = Icons.Default.Assessment,
                tint = AccentRed,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun DetailStatTile(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    tint: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(SurfaceWarm)
            .border(1.dp, BorderLight, RoundedCornerShape(18.dp))
            .padding(14.dp)
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(tint.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(18.dp))
        }
        Spacer(modifier = Modifier.height(10.dp))
        Text(title, color = TextSecondaryLight, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        Text(value, color = TextPrimaryLight, fontSize = 16.sp, fontWeight = FontWeight.Black)
    }
}
