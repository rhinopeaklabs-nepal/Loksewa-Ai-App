package com.loksewa.aiapp.ui.utils

import android.database.sqlite.SQLiteException

fun getFriendlyErrorMessage(throwable: Throwable?): String {
    if (throwable == null) return "An unknown error occurred"
    val message = throwable.message ?: ""
    return when {
        // Room Schema Mismatch or SQLite initialization/corruption errors
        message.contains("Pre-packaged database has an invalid schema", ignoreCase = true) ||
        message.contains("TableInfo", ignoreCase = true) ||
        message.contains("Migration failed", ignoreCase = true) ||
        throwable is SQLiteException ||
        throwable.javaClass.simpleName.contains("Room", ignoreCase = true) -> {
            "Local database initialization failed. Please clear the app storage or reinstall the application."
        }
        // Network connection issues
        message.contains("ConnectException", ignoreCase = true) ||
        message.contains("UnknownHostException", ignoreCase = true) ||
        message.contains("timeout", ignoreCase = true) ||
        message.contains("SocketTimeout", ignoreCase = true) ||
        throwable is java.io.IOException -> {
            "Unable to connect to the server. Please check your internet connection and try again."
        }
        // Login or general user credential errors
        message.contains("Unauthorized", ignoreCase = true) || 
        message.contains("401", ignoreCase = true) -> {
            "Invalid email or password"
        }
        else -> throwable.localizedMessage ?: throwable.message ?: "An error occurred"
    }
}
