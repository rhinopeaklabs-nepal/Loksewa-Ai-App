package com.loksewa.aiapp.data.local

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

class DatabaseInstaller(
    private val context: Context,
    private val assetFileName: String = "loksewa_v1.db",
    private val databaseFileName: String = "loksewa_active.db"
) {
    companion object {
        const val ROOM_DATABASE_VERSION = 2
    }

    private var isInstalled = false

    fun getDatabasePath(): String {
        return context.getDatabasePath(databaseFileName).absolutePath
    }

    suspend fun ensureInstalled(): String = withContext(Dispatchers.IO) {
        ensureInstalledBlocking()
    }

    @Synchronized
    fun ensureInstalledBlocking(): String {
        if (isInstalled) return getDatabasePath()

        val dbFile = context.getDatabasePath(databaseFileName)
        if (dbFile.exists()) {
            isInstalled = true
            alignRoomVersion(dbFile)
            return dbFile.absolutePath
        }

        dbFile.parentFile?.mkdirs()

        try {
            installFromAsset(dbFile)
            alignRoomVersion(dbFile)
            isInstalled = true
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
        return dbFile.absolutePath
    }

    private fun installFromAsset(dbFile: File) {
        context.assets.open(assetFileName).use { inputStream ->
            FileOutputStream(dbFile).use { outputStream ->
                val buffer = ByteArray(8192)
                var length: Int
                while (inputStream.read(buffer).also { length = it } > 0) {
                    outputStream.write(buffer, 0, length)
                }
            }
        }
    }

    private fun alignRoomVersion(dbFile: File) {
        SQLiteDatabase.openDatabase(
            dbFile.absolutePath,
            null,
            SQLiteDatabase.OPEN_READWRITE
        ).use { database ->
            if (database.version < ROOM_DATABASE_VERSION) {
                database.version = ROOM_DATABASE_VERSION
            }
        }
    }
}
