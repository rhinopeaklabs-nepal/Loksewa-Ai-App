package com.loksewa.aiapp.data.remote

import android.content.Context
import com.loksewa.aiapp.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class GoogleAuthSession(
    val token: String,
    val email: String,
    val fullName: String,
    val expiresAt: String
)

object GoogleAuthClient {
    private const val PREFS = "loksewa_google_session"

    suspend fun signInWithGoogle(
        context: Context,
        rememberMe: Boolean
    ): Result<GoogleAuthSession> = withContext(Dispatchers.IO) {
        runCatching {
            val payload = JSONObject()
                .put("email", "student@loksewa.local")
                .put("full_name", "Loksewa Student")
                .put("picture_url", "")
                .put("client_type", "mobile")
                .put("provider", "google")

            val response = postJson("v1/auth/google", payload)
            val token = response.optString("token", response.optString("accessToken"))
            val user = response.optJSONObject("user") ?: JSONObject()
            val session = GoogleAuthSession(
                token = token,
                email = user.optString("email", "student@loksewa.local"),
                fullName = user.optString("full_name", "Loksewa Student"),
                expiresAt = response.optString("expires_at", response.optString("expiresAt"))
            )
            require(session.token.isNotBlank()) { "Backend did not return an auth token" }
            if (rememberMe) saveSession(context, session) else clearSession(context)
            session
        }
    }

    suspend fun signInWithEmail(
        context: Context,
        email: String,
        password: String,
        rememberMe: Boolean
    ): Result<GoogleAuthSession> = withContext(Dispatchers.IO) {
        runCatching {
            val payload = JSONObject()
                .put("email", email.trim())
                .put("password", password)
                .put("client_type", "mobile")

            val response = postJson("v1/auth/login", payload)
            val user = response.optJSONObject("user") ?: JSONObject()
            val session = GoogleAuthSession(
                token = response.optString("token", response.optString("accessToken")),
                email = user.optString("email", email.trim()),
                fullName = user.optString("full_name", "Loksewa Student"),
                expiresAt = response.optString("expires_at", response.optString("expiresAt"))
            )
            require(session.token.isNotBlank()) { "Backend did not return an auth token" }
            if (rememberMe) saveSession(context, session) else clearSession(context)
            session
        }
    }

    suspend fun requestPasswordReset(email: String): Result<Unit> = withContext(Dispatchers.IO) {
        runCatching {
            val payload = JSONObject().put("email", email.trim())
            postJson("v1/auth/forgot-password", payload)
            Unit
        }
    }

    fun cachedSession(context: Context): GoogleAuthSession? {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val token = prefs.getString("token", null)?.takeIf { it.isNotBlank() } ?: return null
        return GoogleAuthSession(
            token = token,
            email = prefs.getString("email", "student@loksewa.local") ?: "student@loksewa.local",
            fullName = prefs.getString("full_name", "Loksewa Student") ?: "Loksewa Student",
            expiresAt = prefs.getString("expires_at", "") ?: ""
        )
    }

    fun clearSession(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply()
    }

    private fun saveSession(context: Context, session: GoogleAuthSession) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString("token", session.token)
            .putString("email", session.email)
            .putString("full_name", session.fullName)
            .putString("expires_at", session.expiresAt)
            .apply()
    }

    private fun postJson(path: String, payload: JSONObject): JSONObject {
        val baseUrl = BuildConfig.API_BASE_URL.trimEnd('/')
        val connection = (URL("$baseUrl/$path").openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 8_000
            readTimeout = 8_000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
        }

        connection.outputStream.use { output ->
            output.write(payload.toString().toByteArray(Charsets.UTF_8))
        }

        val code = connection.responseCode
        val stream = if (code in 200..299) connection.inputStream else connection.errorStream
        val body = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
        connection.disconnect()

        if (code !in 200..299) {
            val detail = runCatching { JSONObject(body).optString("detail") }.getOrNull().orEmpty()
            error(detail.ifBlank { "Google login failed with HTTP $code" })
        }
        return JSONObject(body)
    }
}
