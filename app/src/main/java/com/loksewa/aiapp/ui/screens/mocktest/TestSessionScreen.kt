package com.loksewa.aiapp.ui.screens.mocktest

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.ui.components.NeuriseCard
import com.loksewa.aiapp.ui.components.NeurisePrimaryButton
import com.loksewa.aiapp.ui.components.NeuriseScreenSurface
import com.loksewa.aiapp.ui.components.NeuriseSecondaryButton
import com.loksewa.aiapp.ui.components.NeuriseSectionHeader
import com.loksewa.aiapp.ui.components.NeuriseThumbnail
import com.loksewa.aiapp.ui.components.categoryTint
import com.loksewa.aiapp.ui.components.courseGradientPairs
import com.loksewa.aiapp.ui.components.NeurisePill
import com.loksewa.aiapp.ui.components.OptionButton
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandTeal
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.BrandVioletLight
import com.loksewa.aiapp.ui.theme.DarkForestGreen
import com.loksewa.aiapp.ui.theme.SurfaceElevated
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.SurfaceWarm
import com.loksewa.aiapp.ui.theme.TextPrimaryLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight

@Composable
fun TestSessionScreen(
    testId: Int,
    userId: Int,
    onSubmitSuccess: (Int) -> Unit,
    viewModel: MockTestViewModel
) {
    val state by viewModel.sessionState.collectAsState()

    LaunchedEffect(testId) {
        viewModel.startMockTest(testId, userId)
    }

    LaunchedEffect(state.isSubmitted) {
        if (state.isSubmitted) {
            onSubmitSuccess(state.attemptId)
        }
    }

    val minutes = state.timeRemainingSeconds / 60
    val seconds = state.timeRemainingSeconds % 60
    val timeFormatted = String.format("%02d:%02d", minutes, seconds)

    NeuriseScreenSurface {
        if (state.isLoading || state.questions.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = BrandViolet)
            }
        } else {
            val question = state.questions[state.currentQuestionIndex]
            val selectedOption = state.selectedAnswers[question.id]
            val progress = (state.currentQuestionIndex + 1).toFloat() / state.questions.size

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp, vertical = 24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Mock Flashcard",
                            color = TextPrimaryLight,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = state.mockTest?.title ?: "Loksewa practice",
                            color = TextSecondaryLight,
                            fontSize = 12.sp,
                            maxLines = 1
                        )
                    }
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(17.dp))
                            .background(SurfaceLight)
                            .border(1.dp, BorderLight, RoundedCornerShape(17.dp))
                            .padding(horizontal = 12.dp, vertical = 9.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.AccessTime, contentDescription = null, tint = BrandViolet, modifier = Modifier.size(17.dp))
                        Spacer(modifier = Modifier.size(6.dp))
                        Text(timeFormatted, color = TextPrimaryLight, fontSize = 13.sp, fontWeight = FontWeight.Black)
                    }
                }

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
                        Text(
                            text = "Question ${state.currentQuestionIndex + 1}/${state.questions.size}",
                            color = BrandViolet,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black
                        )
                        val answered = state.selectedAnswers.size
                        Text(
                            text = "$answered answered",
                            color = TextSecondaryLight,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(CircleShape),
                        color = BrandViolet,
                        trackColor = SurfaceElevated
                    )
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .clip(RoundedCornerShape(28.dp))
                        .background(DarkForestGreen)
                        .padding(22.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .clip(RoundedCornerShape(14.dp))
                            .background(SurfaceLight.copy(alpha = 0.12f))
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text("Questions", color = SurfaceLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(
                        text = "${state.currentQuestionIndex + 1}",
                        color = SurfaceLight,
                        fontSize = 54.sp,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.align(Alignment.TopCenter)
                    )
                    Text(
                        text = question.questionText,
                        color = SurfaceLight,
                        fontSize = 20.sp,
                        lineHeight = 28.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.align(Alignment.Center)
                    )
                    Row(
                        modifier = Modifier.align(Alignment.BottomStart),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = SurfaceLight, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.size(7.dp))
                        Text("Choose the best answer", color = SurfaceLight.copy(alpha = 0.88f), fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Column {
                    val options = listOf(
                        Triple("A", question.optionA, "A"),
                        Triple("B", question.optionB, "B"),
                        Triple("C", question.optionC, "C"),
                        Triple("D", question.optionD, "D")
                    )

                    options.forEach { (letter, text, value) ->
                        OptionButton(
                            optionLetter = letter,
                            optionText = text,
                            isSelected = selectedOption == value,
                            isCorrectAnswer = null,
                            isWrongAnswer = null,
                            onClick = { viewModel.selectOption(question.id, value) }
                        )
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    NeuriseSecondaryButton(
                        text = "Previous",
                        enabled = state.currentQuestionIndex > 0,
                        modifier = Modifier.weight(1f),
                        onClick = { viewModel.prevQuestion() }
                    )
                    if (state.currentQuestionIndex == state.questions.size - 1) {
                        NeurisePrimaryButton(
                            text = "Submit Test",
                            modifier = Modifier.weight(1f),
                            onClick = { viewModel.submitMockTest() }
                        )
                    } else {
                        NeurisePrimaryButton(
                            text = "Next",
                            modifier = Modifier.weight(1f),
                            onClick = { viewModel.nextQuestion() }
                        )
                    }
                }
            }
        }
    }
}
