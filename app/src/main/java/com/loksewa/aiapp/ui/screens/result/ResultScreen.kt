package com.loksewa.aiapp.ui.screens.result

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.core.model.AnswerSource
import com.loksewa.aiapp.ui.components.AiDisclaimer
import com.loksewa.aiapp.ui.components.OptionButton
import com.loksewa.aiapp.ui.components.SourceBadge
import com.loksewa.aiapp.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
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

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Search Result", color = TextPrimary) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = TextPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = SurfaceBlue
                )
            )
        },
        containerColor = PrimaryBackground
    ) { paddingValues ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = PrimaryBlue)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                if (uiState.source == AnswerSource.AI_ASSISTED || uiState.source == AnswerSource.AI_ONLY) {
                    AiDisclaimer()
                    Spacer(modifier = Modifier.height(16.dp))
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Classification: ",
                        color = TextSecondary,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    SourceBadge(source = uiState.source)
                }

                Spacer(modifier = Modifier.height(16.dp))

                val question = uiState.question
                if (question != null) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = SurfaceCard)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = question.questionText,
                                style = MaterialTheme.typography.titleMedium,
                                color = TextPrimary,
                                lineHeight = 24.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    val options = listOf(
                        Triple("A", question.optionA, "A"),
                        Triple("B", question.optionB, "B"),
                        Triple("C", question.optionC, "C"),
                        Triple("D", question.optionD, "D")
                    )

                    options.forEach { (letter, text, value) ->
                        val isSelected = uiState.selectedOption == value
                        val isCorrect = if (uiState.selectedOption != null) value == question.correctOption else null
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

                    Spacer(modifier = Modifier.height(16.dp))

                    if (uiState.selectedOption != null || uiState.source == AnswerSource.VERIFIED_DB) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = SurfaceElevated)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Explanation:",
                                    style = MaterialTheme.typography.titleSmall,
                                    color = PrimaryBlue,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = question.explanation.ifBlank { "No explanation provided." },
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TextSecondary,
                                    lineHeight = 20.sp
                                )

                                if (question.sourceName.isNotBlank()) {
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Text(
                                        text = "Source: ${question.sourceName} " +
                                                (question.sourceYear?.let { "(Year: $it) " } ?: "") +
                                                (question.sourcePage?.let { "(Page: $it)" } ?: ""),
                                        style = MaterialTheme.typography.labelSmall,
                                        color = TextTertiary
                                    )
                                }
                            }
                        }
                    }
                } else {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = SurfaceCard)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Question Not Found",
                                style = MaterialTheme.typography.titleMedium,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "We couldn't find a high-confidence match in our offline database.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Was this search result accurate?",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary,
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                )

                Spacer(modifier = Modifier.height(8.dp))

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
                            tint = if (isSelected) AccentGold else TextSecondary,
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
