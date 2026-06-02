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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.WorkspacePremium
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.ui.components.NeuriseCard
import com.loksewa.aiapp.ui.components.NeuriseIconButton
import com.loksewa.aiapp.ui.components.NeuriseMetric
import com.loksewa.aiapp.ui.components.NeurisePrimaryButton
import com.loksewa.aiapp.ui.components.NeuriseScreenSurface
import com.loksewa.aiapp.ui.components.OptionButton
import com.loksewa.aiapp.ui.theme.AccentGreen
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandBlue
import com.loksewa.aiapp.ui.theme.BrandOrange
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.PrimaryGlow
import com.loksewa.aiapp.ui.theme.StatusError
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.SurfaceWarm
import com.loksewa.aiapp.ui.theme.TextPrimaryLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight

@Composable
fun TestResultsScreen(
    attemptId: Int,
    onHomeClick: () -> Unit,
    viewModel: MockTestViewModel
) {
    val state by viewModel.resultsState.collectAsState()

    LaunchedEffect(attemptId) {
        viewModel.loadAttemptResults(attemptId)
    }

    NeuriseScreenSurface {
        if (state.isLoading || state.attempt == null || state.mockTest == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = BrandViolet)
            }
        } else {
            val attempt = state.attempt!!
            val scoreProgress = if (attempt.totalMarks > 0f) {
                (attempt.score / attempt.totalMarks).coerceIn(0f, 1f)
            } else {
                0f
            }
            val scorePercent = (scoreProgress * 100).toInt()

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
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
                            text = "Exam Results",
                            color = TextPrimaryLight,
                            fontSize = 25.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = state.mockTest?.title ?: "Mock test review",
                            color = TextSecondaryLight,
                            fontSize = 12.sp,
                            maxLines = 1
                        )
                    }
                    NeuriseIconButton(
                        icon = Icons.Default.Home,
                        contentDescription = "Home",
                        onClick = onHomeClick
                    )
                }

                NeuriseCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 30,
                    contentPadding = PaddingValues(20.dp)
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.WorkspacePremium, contentDescription = null, tint = BrandOrange, modifier = Modifier.size(48.dp))
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = state.mockTest?.title ?: "Full Length Mock Test",
                            color = TextPrimaryLight,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text("Completed just now", color = TextSecondaryLight, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(18.dp))
                        Box(contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(
                                progress = { scoreProgress },
                                modifier = Modifier.size(148.dp),
                                color = BrandOrange,
                                trackColor = SurfaceWarm,
                                strokeWidth = 9.dp
                            )
                            CircularProgressIndicator(
                                progress = { (scoreProgress * 0.76f).coerceIn(0f, 1f) },
                                modifier = Modifier.size(148.dp),
                                color = BrandBlue,
                                trackColor = androidx.compose.ui.graphics.Color.Transparent,
                                strokeWidth = 9.dp
                            )
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("$scorePercent%", color = TextPrimaryLight, fontSize = 38.sp, fontWeight = FontWeight.Black)
                                Text("Score", color = TextSecondaryLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = String.format("%.1f / %.1f", attempt.score, attempt.totalMarks),
                            color = TextSecondaryLight,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(18.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(70.dp),
                            horizontalArrangement = Arrangement.SpaceEvenly,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            NeuriseMetric("Correct", "${attempt.correctCount}", Modifier.weight(1f), AccentGreen)
                            NeuriseMetric("Wrong", "${attempt.wrongCount}", Modifier.weight(1f), StatusError)
                            NeuriseMetric("Skipped", "${attempt.unansweredCount}", Modifier.weight(1f), BrandOrange)
                        }
                    }
                }

                Text(
                    text = "Question Review",
                    color = TextPrimaryLight,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black
                )

                state.questions.forEachIndexed { index, question ->
                    val answer = state.answers.firstOrNull { it.questionId == question.id }
                    val selected = answer?.selectedOption

                    NeuriseCard(
                        modifier = Modifier.fillMaxWidth(),
                        cornerRadius = 22,
                        contentPadding = PaddingValues(16.dp)
                    ) {
                        Text(
                            text = "Q${index + 1}. ${question.questionText}",
                            color = TextPrimaryLight,
                            fontSize = 14.sp,
                            lineHeight = 20.sp,
                            fontWeight = FontWeight.Black
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        val options = listOf(
                            Triple("A", question.optionA, "A"),
                            Triple("B", question.optionB, "B"),
                            Triple("C", question.optionC, "C"),
                            Triple("D", question.optionD, "D")
                        )

                        options.forEach { (letter, text, value) ->
                            val isCorrectOption = value == question.correctOption
                            val isSelectedOption = value == selected
                            val isWrong = isSelectedOption && !isCorrectOption

                            OptionButton(
                                optionLetter = letter,
                                optionText = text,
                                isSelected = isSelectedOption,
                                isCorrectAnswer = if (isCorrectOption) true else null,
                                isWrongAnswer = if (isWrong) true else null,
                                onClick = {}
                            )
                        }

                        if (!question.explanation.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(15.dp))
                                    .background(SurfaceWarm)
                                    .border(1.dp, BorderLight, RoundedCornerShape(15.dp))
                                    .padding(12.dp)
                            ) {
                                Text(
                                    text = question.explanation,
                                    color = TextSecondaryLight,
                                    fontSize = 13.sp,
                                    lineHeight = 19.sp
                                )
                            }
                        }
                    }
                }

                NeurisePrimaryButton(
                    text = "Return to Home",
                    modifier = Modifier.fillMaxWidth(),
                    onClick = onHomeClick
                )
            }
        }
    }
}
