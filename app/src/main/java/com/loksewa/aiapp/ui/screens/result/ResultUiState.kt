package com.loksewa.aiapp.ui.screens.result

import com.loksewa.aiapp.core.model.AnswerSource
import com.loksewa.aiapp.data.local.QuestionEntity

data class ResultUiState(
    val isLoading: Boolean = true,
    val question: QuestionEntity? = null,
    val source: AnswerSource = AnswerSource.UNCERTAIN,
    val selectedOption: String? = null,
    val isCorrect: Boolean? = null,
    val rating: Int? = null,
    val error: String? = null
)
