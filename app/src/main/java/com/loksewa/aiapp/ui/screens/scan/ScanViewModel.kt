package com.loksewa.aiapp.ui.screens.scan

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.loksewa.aiapp.core.model.AnswerSource
import com.loksewa.aiapp.core.utils.TextNormalizer
import com.loksewa.aiapp.data.local.ScanHistoryEntity
import com.loksewa.aiapp.data.repository.ScanHistoryRepository
import com.loksewa.aiapp.data.repository.SearchRepository
import com.loksewa.aiapp.mlkit.TextRecognitionService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject

@HiltViewModel
class ScanViewModel @Inject constructor(
    private val textRecognitionService: TextRecognitionService,
    private val searchRepository: SearchRepository,
    private val scanHistoryRepository: ScanHistoryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ScanUiState())
    val uiState: StateFlow<ScanUiState> = _uiState.asStateFlow()

    fun updatePermissionState(granted: Boolean) {
        _uiState.update { it.copy(cameraPermissionGranted = granted) }
    }

    fun onTextDetected(text: String) {
        if (_uiState.value.phase == ScanPhase.OCR_PROCESSING || _uiState.value.phase == ScanPhase.DATABASE_MATCHING) return

        viewModelScope.launch {
            _uiState.update { it.copy(phase = ScanPhase.DATABASE_MATCHING, scannedText = text) }

            val searchResult = searchRepository.searchVerifiedQuestions(text)

            // Save to local scan history
            val now = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
            scanHistoryRepository.saveScan(
                ScanHistoryEntity(
                    scannedText = text,
                    normalizedScannedText = TextNormalizer.normalize(text),
                    matchedQuestionId = searchResult.question?.id,
                    answerSource = searchResult.source.value,
                    userRating = null,
                    createdAt = now
                )
            )

            _uiState.update {
                it.copy(
                    phase = ScanPhase.RESULT,
                    scannedText = text,
                    answerSource = searchResult.source,
                    matchedQuestion = searchResult.question,
                    confidence = searchResult.confidence
                )
            }
        }
    }

    fun onImageCaptured(imagePath: String, context: Context) {
        viewModelScope.launch {
            _uiState.update { it.copy(phase = ScanPhase.OCR_PROCESSING) }

            val ocrResult = textRecognitionService.recognizeText(imagePath, context)
            if (ocrResult.text.isBlank()) {
                _uiState.update { it.copy(phase = ScanPhase.ERROR, error = "No text detected in image") }
                return@launch
            }

            onTextDetected(ocrResult.text)
        }
    }

    fun reset() {
        _uiState.update { ScanUiState(cameraPermissionGranted = it.cameraPermissionGranted) }
    }
}
