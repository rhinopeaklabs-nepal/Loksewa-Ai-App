package com.loksewa.aiapp.data.local

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.util.zip.GZIPInputStream

class DatabaseInstaller(
    private val context: Context,
    private val assetFileName: String = "loksewa_v1.db.gz",
    private val databaseFileName: String = "loksewa_active.db"
) {
    private var isInstalled = false

    fun getDatabasePath(): String {
        return context.getDatabasePath(databaseFileName).absolutePath
    }

    suspend fun ensureInstalled(): String = withContext(Dispatchers.IO) {
        if (isInstalled) return@withContext getDatabasePath()

        val dbFile = context.getDatabasePath(databaseFileName)
        if (dbFile.exists()) {
            isInstalled = true
            return@withContext dbFile.absolutePath
        }

        // Ensure parent directory exists
        dbFile.parentFile?.mkdirs()

        try {
            context.assets.open(assetFileName).use { inputStream ->
                GZIPInputStream(inputStream).use { gzipStream ->
                    FileOutputStream(dbFile).use { outputStream ->
                        val buffer = ByteArray(8192)
                        var length: Int
                        while (gzipStream.read(buffer).also { length = it } > 0) {
                            outputStream.write(buffer, 0, length)
                        }
                    }
                }
            }
            isInstalled = true
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
        dbFile.absolutePath
    }
}
