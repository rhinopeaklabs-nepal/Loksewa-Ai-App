package com.loksewa.aiapp.ui.screens.mocktest

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.ui.components.OptionButton
import com.loksewa.aiapp.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
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

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mock Exam: $timeFormatted", color = TextPrimary) },
                actions = {
                    TextButton(onClick = { viewModel.submitMockTest() }) {
                        Text("Submit", color = AccentGreen, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SurfaceBlue)
            )
        },
        containerColor = PrimaryBackground
    ) { paddingValues ->
        if (state.isLoading || state.questions.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = PrimaryBlue)
            }
        } else {
            val question = state.questions[state.currentQuestionIndex]
            val selectedOption = state.selectedAnswers[question.id]

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Question ${state.currentQuestionIndex + 1} of ${state.questions.size}",
                        color = TextSecondary,
                        fontSize = 14.sp
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                LinearProgressIndicator(
                    progress = { (state.currentQuestionIndex + 1).toFloat() / state.questions.size },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp),
                    color = PrimaryBlue,
                    trackColor = SurfaceElevated
                )

                Spacer(modifier = Modifier.height(24.dp))

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                    ) {
                        Text(
                            text = question.questionText,
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary,
                            lineHeight = 24.sp
                        )

                        Spacer(modifier = Modifier.height(24.dp))

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
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Button(
                        onClick = { viewModel.prevQuestion() },
                        enabled = state.currentQuestionIndex > 0,
                        colors = ButtonDefaults.buttonColors(containerColor = SurfaceElevated)
                    ) {
                        Text("Previous", color = TextPrimary)
                    }

                    if (state.currentQuestionIndex == state.questions.size - 1) {
                        Button(
                            onClick = { viewModel.submitMockTest() },
                            colors = ButtonDefaults.buttonColors(containerColor = AccentGreen)
                        ) {
                            Text("Submit Test", color = PrimaryDark)
                        }
                    } else {
                        Button(
                            onClick = { viewModel.nextQuestion() },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                        ) {
                            Text("Next", color = PrimaryDark)
                        }
                    }
                }
            }
        }
    }
}
