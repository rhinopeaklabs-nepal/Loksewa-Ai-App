package com.loksewa.aiapp.ui.screens.result

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.StarBorder
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
import com.loksewa.aiapp.core.model.AnswerSource
import com.loksewa.aiapp.ui.components.AiDisclaimer
import com.loksewa.aiapp.ui.components.NeuriseCard
import com.loksewa.aiapp.ui.components.NeuriseIconButton
import com.loksewa.aiapp.ui.components.NeuriseScreenSurface
import com.loksewa.aiapp.ui.components.OptionButton
import com.loksewa.aiapp.ui.components.SourceBadge
import com.loksewa.aiapp.ui.theme.AccentGold
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandTeal
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.BrandVioletLight
import com.loksewa.aiapp.ui.theme.PrimaryGlow
import com.loksewa.aiapp.ui.theme.SurfaceElevated
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.SurfaceWarm
import com.loksewa.aiapp.ui.theme.TextPrimaryLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight
import com.loksewa.aiapp.ui.theme.TextTertiaryLight

@Composable
fun ResultScreen(
    questionId: Int?,
    sourceValue: String,
    onBackClick: () -> Unit,
    viewModel: ResultViewModel
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(questionId, sourceValue) {
        viewModel.loadQuestion(questionId, sourceValue)
    }

    NeuriseScreenSurface {
        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = BrandViolet)
            }
        } else {
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
                    NeuriseIconButton(
                        icon = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        onClick = onBackClick
                    )
                    Text(
                        text = "Search Result",
                        color = TextPrimaryLight,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black
                    )
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(BrandVioletLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = BrandViolet, modifier = Modifier.size(20.dp))
                    }
                }

                if (uiState.source == AnswerSource.AI_ASSISTED || uiState.source == AnswerSource.AI_ONLY) {
                    AiDisclaimer()
                }

                NeuriseCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 26,
                    contentPadding = PaddingValues(16.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(Brush.linearGradient(listOf(BrandViolet, PrimaryGlow))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = SurfaceLight, modifier = Modifier.size(24.dp))
                        }
                        Spacer(modifier = Modifier.size(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Classification",
                                color = TextSecondaryLight,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            SourceBadge(source = uiState.source)
                        }
                    }
                }

                val question = uiState.question
                if (question != null) {
                    NeuriseCard(
                        modifier = Modifier.fillMaxWidth(),
                        cornerRadius = 24,
                        contentPadding = PaddingValues(18.dp)
                    ) {
                        Text(
                            text = "Question",
                            color = BrandViolet,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = question.questionText,
                            color = TextPrimaryLight,
                            fontSize = 19.sp,
                            lineHeight = 27.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    val options = listOf(
                        Triple("A", question.optionA, "A"),
                        Triple("B", question.optionB, "B"),
                        Triple("C", question.optionC, "C"),
                        Triple("D", question.optionD, "D")
                    )

                    Column {
                        options.forEach { (letter, text, value) ->
                            val isSelected = uiState.selectedOption == value
                            val isCorrect = if (uiState.selectedOption != null || uiState.source == AnswerSource.VERIFIED_DB) value == question.correctOption else null
                            val isWrong = if (uiState.selectedOption != null) (isSelected && value != question.correctOption) else null

                            OptionButton(
                                optionLetter = letter,
                                optionText = text,
                                isSelected = isSelected,
                                isCorrectAnswer = isCorrect,
                                isWrongAnswer = isWrong,
                                onClick = {
                                    if (uiState.selectedOption == null) {
                                        viewModel.selectOption(value)
                                    }
                                }
                            )
                        }
                    }

                    if (uiState.selectedOption != null || uiState.source == AnswerSource.VERIFIED_DB) {
                        NeuriseCard(
                            modifier = Modifier.fillMaxWidth(),
                            cornerRadius = 24,
                            contentPadding = PaddingValues(18.dp)
                        ) {
                            Text(
                                text = "Explanation",
                                color = BrandTeal,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = question.explanation.ifBlank { "No explanation provided." },
                                color = TextSecondaryLight,
                                fontSize = 14.sp,
                                lineHeight = 21.sp
                            )

                            if (question.sourceName.isNotBlank()) {
                                Spacer(modifier = Modifier.height(14.dp))
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(SurfaceWarm)
                                        .border(1.dp, BorderLight, RoundedCornerShape(14.dp))
                                        .padding(12.dp)
                                ) {
                                    Text(
                                        text = "Source: ${question.sourceName} " +
                                                (question.sourceYear?.let { "($it) " } ?: "") +
                                                (question.sourcePage?.let { "Page $it" } ?: ""),
                                        color = TextSecondaryLight,
                                        fontSize = 12.sp,
                                        lineHeight = 17.sp
                                    )
                                }
                            }
                        }
                    }
                } else {
                    NeuriseCard(
                        modifier = Modifier.fillMaxWidth(),
                        cornerRadius = 24,
                        contentPadding = PaddingValues(22.dp)
                    ) {
                        Text(
                            text = "Question Not Found",
                            color = TextPrimaryLight,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "We could not find a high-confidence match in the offline database.",
                            color = TextSecondaryLight,
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                    }
                }

                NeuriseCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 22,
                    contentPadding = PaddingValues(16.dp)
                ) {
                    Text(
                        text = "Was this search result accurate?",
                        color = TextPrimaryLight,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        for (i in 1..5) {
                            val isSelected = uiState.rating != null && i <= uiState.rating!!
                            Icon(
                                imageVector = if (isSelected) Icons.Filled.Star else Icons.Outlined.StarBorder,
                                contentDescription = "$i Stars",
                                tint = if (isSelected) AccentGold else TextTertiaryLight,
                                modifier = Modifier
                                    .size(36.dp)
                                    .clickable {
                                        viewModel.rateResult(i, question?.id)
                                    }
                                    .padding(4.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
