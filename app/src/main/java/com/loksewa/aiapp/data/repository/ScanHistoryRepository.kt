package com.loksewa.aiapp.data.repository

import com.loksewa.aiapp.data.local.ScanHistoryDao
import com.loksewa.aiapp.data.local.ScanHistoryEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ScanHistoryRepository @Inject constructor(
    private val scanHistoryDao: ScanHistoryDao
) {
    fun getScanHistory(): Flow<List<ScanHistoryEntity>> {
        return scanHistoryDao.getScanHistory()
    }

    suspend fun saveScan(scan: ScanHistoryEntity): Long {
        return scanHistoryDao.insertScan(scan)
    }

    suspend fun updateRating(id: Int, rating: Int) {
        scanHistoryDao.updateRating(id, rating)
    }

    suspend fun clearHistory() {
        scanHistoryDao.clearHistory()
    }
}
