package com.loksewa.aiapp.ui.screens

data class UserStatsUiState(
    val totalMocksTaken: Int = 0,
    val totalMocksCompleted: Int = 0,
    val averageScore: Float = 0f,
    val bestScore: Float = 0f
)
