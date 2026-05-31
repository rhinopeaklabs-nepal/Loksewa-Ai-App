package com.loksewa.aiapp.ui.screens.scan

import com.loksewa.aiapp.core.model.AnswerSource
import com.loksewa.aiapp.data.local.QuestionEntity

data class ScanUiState(
    val phase: ScanPhase = ScanPhase.IDLE,
    val scannedText: String = "",
    val answerSource: AnswerSource = AnswerSource.UNCERTAIN,
    val matchedQuestion: QuestionEntity? = null,
    val confidence: Float = 0f,
    val error: String? = null,
    val cameraPermissionGranted: Boolean = false
)

enum class ScanPhase {
    IDLE,
    CAMERA_READY,
    OCR_PROCESSING,
    DATABASE_MATCHING,
    RESULT,
    ERROR
}
