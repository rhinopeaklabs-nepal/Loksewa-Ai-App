package com.loksewa.aiapp.ui.screens.result

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.loksewa.aiapp.core.model.AnswerSource
import com.loksewa.aiapp.data.local.QuestionDao
import com.loksewa.aiapp.data.local.ScanHistoryDao
import com.loksewa.aiapp.data.remote.LoksewaApiService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ResultViewModel @Inject constructor(
    private val questionDao: QuestionDao,
    private val scanHistoryDao: ScanHistoryDao,
    private val apiService: LoksewaApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(ResultUiState())
    val uiState: StateFlow<ResultUiState> = _uiState.asStateFlow()

    fun loadQuestion(questionId: Int?, sourceValue: String) {
        if (questionId == null) {
            _uiState.update {
                it.copy(
                    isLoading = false,
                    question = null,
                    source = AnswerSource.fromValue(sourceValue)
                )
            }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val question = questionDao.getQuestion(questionId)
            _uiState.update {
                it.copy(
                    isLoading = false,
                    question = question,
                    source = AnswerSource.fromValue(sourceValue)
                )
            }
        }
    }

    fun selectOption(option: String) {
        val correctOption = _uiState.value.question?.correctOption
        _uiState.update {
            it.copy(
                selectedOption = option,
                isCorrect = option == correctOption
            )
        }
    }

    fun rateResult(rating: Int, scanId: Int?) {
        viewModelScope.launch {
            _uiState.update { it.copy(rating = rating) }
            if (scanId != null) {
                scanHistoryDao.updateRating(scanId, rating)
            }
        }
    }
}
