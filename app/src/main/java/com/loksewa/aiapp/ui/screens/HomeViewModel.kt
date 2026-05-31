package com.loksewa.aiapp.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.loksewa.aiapp.data.local.MockAttemptDao
import com.loksewa.aiapp.data.local.ScanHistoryEntity
import com.loksewa.aiapp.data.repository.ScanHistoryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val scanHistory: List<ScanHistoryEntity> = emptyList(),
    val stats: UserStatsUiState = UserStatsUiState()
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val scanHistoryRepository: ScanHistoryRepository,
    private val mockAttemptDao: MockAttemptDao
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    fun loadHomeData(userId: Int = 1) {
        viewModelScope.launch {
            scanHistoryRepository.getScanHistory().collect { history ->
                val attempts = mockAttemptDao.getAttemptsByUserList(userId)
                val completed = attempts.filter { it.status == "submitted" }
                val avg = if (completed.isEmpty()) 0f else completed.map { (it.score / it.totalMarks) * 100f }.average().toFloat()
                val best = if (completed.isEmpty()) 0f else completed.maxOf { (it.score / it.totalMarks) * 100f }

                _uiState.update {
                    HomeUiState(
                        scanHistory = history,
                        stats = UserStatsUiState(
                            totalMocksTaken = attempts.size,
                            totalMocksCompleted = completed.size,
                            averageScore = avg,
                            bestScore = best
                        )
                    )
                }
            }
        }
    }

    fun clearScanHistory() {
        viewModelScope.launch {
            scanHistoryRepository.clearHistory()
        }
    }
}
