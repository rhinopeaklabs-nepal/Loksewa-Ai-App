package com.loksewa.aiapp.ui.screens.mocktest

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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.BusinessCenter
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.data.local.MockTestEntity
import com.loksewa.aiapp.ui.components.NeuriseCard
import com.loksewa.aiapp.ui.components.NeurisePill
import com.loksewa.aiapp.ui.components.NeuriseScreenSurface
import com.loksewa.aiapp.ui.components.NeuriseSectionHeader
import com.loksewa.aiapp.ui.components.NeuriseThumbnail
import com.loksewa.aiapp.ui.components.categoryTint
import com.loksewa.aiapp.ui.components.courseGradientPairs
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandBlue
import com.loksewa.aiapp.ui.theme.BrandOrange
import com.loksewa.aiapp.ui.theme.BrandTeal
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.BrandVioletLight
import com.loksewa.aiapp.ui.theme.PrimaryGlow
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.SurfaceWarm
import com.loksewa.aiapp.ui.theme.TextPrimaryLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight
import com.loksewa.aiapp.ui.theme.TextTertiaryLight

@Composable
fun MockTestListScreen(
    onTestClick: (Int) -> Unit,
    viewModel: MockTestViewModel
) {
    val state by viewModel.listState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadMockTests()
    }

    NeuriseScreenSurface {
        if (state.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = BrandViolet)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    MockHeader()
                }

                item {
                    Row(
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        listOf("All", "Officer", "GK", "IQ", "Fast Review").forEachIndexed { index, label ->
                            val (tint, bg) = categoryTint(index)
                            NeurisePill(
                                label = label,
                                icon = if (index == 0) Icons.Default.Tune else null,
                                selected = index == 0,
                                tint = tint,
                                background = bg
                            )
                        }
                    }
                }

                item {
                    NeuriseSectionHeader(title = "Available Mock Tests", actionText = null)
                }

                itemsIndexed(state.tests) { index, test ->
                    MockCourseRow(
                        test = test,
                        index = index,
                        onClick = { onTestClick(test.id) }
                    )
                }

                if (state.error != null) {
                    item {
                        ErrorPanel(message = state.error!!)
                    }
                }
            }
        }
    }
}

@Composable
private fun MockHeader() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = "Mock Tests",
                color = TextPrimaryLight,
                fontSize = 25.sp,
                fontWeight = FontWeight.Black
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Exam focused practice sets.",
                color = TextSecondaryLight,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(BrandVioletLight)
                .border(1.dp, BorderLight, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = BrandViolet)
        }
    }
}

@Composable
private fun FeaturedExamCard(
    totalTests: Int,
    onClick: () -> Unit
) {
    NeuriseCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        cornerRadius = 28,
        contentPadding = PaddingValues(18.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            NeuriseThumbnail(
                icon = Icons.Default.BusinessCenter,
                accent = BrandViolet,
                secondary = PrimaryGlow,
                modifier = Modifier.size(86.dp)
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Loksewa intensive pathway",
                    color = TextPrimaryLight,
                    fontSize = 18.sp,
                    lineHeight = 22.sp,
                    fontWeight = FontWeight.Black
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "$totalTests active sets, negative marking, and instant review.",
                    color = TextSecondaryLight,
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(15.dp))
                        .background(BrandViolet)
                        .padding(horizontal = 13.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null, tint = SurfaceLight, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(5.dp))
                    Text("Start Set", color = SurfaceLight, fontSize = 12.sp, fontWeight = FontWeight.Black)
                }
            }
        }
    }
}

@Composable
private fun MockCourseRow(
    test: MockTestEntity,
    index: Int,
    onClick: () -> Unit
) {
    val isLocked = index >= 3
    val progress = when (index) {
        0 -> 0.78f
        1 -> 0f
        2 -> 0f
        else -> 0f
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(SurfaceLight)
            .border(1.dp, BorderLight, RoundedCornerShape(14.dp))
            .clickable(enabled = !isLocked, onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = test.title,
                color = TextPrimaryLight,
                fontSize = 13.sp,
                lineHeight = 18.sp,
                fontWeight = FontWeight.Black,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(5.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${test.totalQuestions} Questions",
                    color = TextSecondaryLight,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "•",
                    color = TextTertiaryLight,
                    fontSize = 11.sp
                )
                Text(
                    text = "${test.durationMinutes / 60} Hours",
                    color = TextSecondaryLight,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
        Spacer(modifier = Modifier.width(12.dp))
        if (progress > 0f) {
            Box(contentAlignment = Alignment.Center) {
                CircularProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.size(44.dp),
                    color = BrandBlue,
                    trackColor = SurfaceWarm,
                    strokeWidth = 4.dp
                )
                Text("${(progress * 100).toInt()}%", color = TextPrimaryLight, fontSize = 10.sp, fontWeight = FontWeight.Black)
            }
        } else {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(10.dp))
                    .background(if (isLocked) SurfaceWarm else BrandVioletLight)
                    .padding(horizontal = 12.dp, vertical = 7.dp)
            ) {
                Text(
                    text = if (isLocked) "Locked" else "Attempt",
                    color = if (isLocked) TextTertiaryLight else BrandBlue,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black
                )
            }
        }
    }
}

@Composable
private fun MetaPill(
    icon: ImageVector,
    label: String
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(SurfaceWarm)
            .padding(horizontal = 8.dp, vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = BrandTeal, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text(label, color = TextSecondaryLight, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun ErrorPanel(message: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(Color(0xFFFFECEC))
            .border(1.dp, Color(0xFFFFD1D1), RoundedCornerShape(18.dp))
            .padding(16.dp)
    ) {
        Text(message, color = Color(0xFF9F2B2B), fontSize = 13.sp)
    }
}
