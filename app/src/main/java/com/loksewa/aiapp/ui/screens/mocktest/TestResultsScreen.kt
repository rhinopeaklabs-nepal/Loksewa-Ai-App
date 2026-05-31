package com.loksewa.aiapp.ui.screens.mocktest

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.ui.components.OptionButton
import com.loksewa.aiapp.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
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

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Exam Results", color = TextPrimary) },
                actions = {
                    IconButton(onClick = onHomeClick) {
                        Icon(
                            imageVector = Icons.Default.Home,
                            contentDescription = "Home",
                            tint = TextPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SurfaceBlue)
            )
        },
        containerColor = PrimaryBackground
    ) { paddingValues ->
        if (state.isLoading || state.attempt == null || state.mockTest == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = PrimaryBlue)
            }
        } else {
            val attempt = state.attempt!!
            val mockTest = state.mockTest!!

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Your Score",
                            color = TextSecondary,
                            fontSize = 14.sp
                        )
                        Text(
                            text = String.format("%.2f / %.2f", attempt.score, attempt.totalMarks),
                            style = MaterialTheme.typography.headlineLarge,
                            color = PrimaryBlue,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Correct", color = TextSecondary, fontSize = 12.sp)
                                Text("${attempt.correctCount}", color = StatusSuccess, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Wrong", color = TextSecondary, fontSize = 12.sp)
                                Text("${attempt.wrongCount}", color = StatusError, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Unanswered", color = TextSecondary, fontSize = 12.sp)
                                Text("${attempt.unansweredCount}", color = TextSecondary, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Question Review",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(8.dp))

                state.questions.forEachIndexed { index, question ->
                    val answer = state.answers.firstOrNull { it.questionId == question.id }
                    val selected = answer?.selectedOption

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceCard)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "Q${index + 1}. ${question.questionText}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
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
                                Text(
                                    text = "Explanation: ${question.explanation}",
                                    color = TextSecondary,
                                    fontSize = 13.sp,
                                    lineHeight = 18.sp
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = onHomeClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                ) {
                    Text("Return to Home", style = MaterialTheme.typography.titleMedium, color = PrimaryDark)
                }
            }
        }
    }
}
