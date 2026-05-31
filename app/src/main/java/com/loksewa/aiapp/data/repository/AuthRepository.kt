package com.loksewa.aiapp.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.loksewa.aiapp.data.local.UserDao
import com.loksewa.aiapp.data.local.UserEntity
import com.loksewa.aiapp.data.remote.LoksewaApiService
import com.loksewa.aiapp.data.remote.LoginRequest
import com.loksewa.aiapp.data.remote.RegisterRequest
import com.loksewa.aiapp.data.remote.AuthResponse
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext context: Context,
    private val dataStore: DataStore<Preferences>
) {
    private val legacyTokenKey = stringPreferencesKey("auth_token")
    private val securePreferences by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            "secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    suspend fun getToken(): String? {
        val encryptedToken = securePreferences.getString(SECURE_TOKEN_KEY, null)
        if (!encryptedToken.isNullOrBlank()) return encryptedToken

        val legacyToken = dataStore.data.first()[legacyTokenKey]
        if (!legacyToken.isNullOrBlank()) {
            saveToken(legacyToken)
            return legacyToken
        }
        return null
    }

    suspend fun saveToken(token: String) {
        securePreferences.edit().putString(SECURE_TOKEN_KEY, token).apply()
        dataStore.edit { it.remove(legacyTokenKey) }
    }

    suspend fun clearToken() {
        securePreferences.edit().remove(SECURE_TOKEN_KEY).apply()
        dataStore.edit { it.remove(legacyTokenKey) }
    }

    private companion object {
        const val SECURE_TOKEN_KEY = "auth_token"
    }
}

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: LoksewaApiService,
    private val userDao: UserDao,
    private val tokenManager: TokenManager
) {
    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                tokenManager.saveToken(authResponse.token)
                
                // Cache user profile locally
                val user = authResponse.user
                userDao.insertUser(
                    UserEntity(
                        id = user.id,
                        email = user.email,
                        fullName = user.fullName,
                        role = user.role,
                        status = user.status,
                        createdAt = user.createdAt,
                        updatedAt = user.updatedAt,
                        lastLoginAt = user.lastLoginAt
                    )
                )
                Result.success(authResponse)
            } else {
                Result.failure(Exception(response.message().ifBlank { "Invalid email or password" }))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(email: String, password: String, fullName: String): Result<AuthResponse> {
        return try {
            val response = apiService.register(RegisterRequest(email, password, fullName))
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                tokenManager.saveToken(authResponse.token)
                
                // Cache user profile locally
                val user = authResponse.user
                userDao.insertUser(
                    UserEntity(
                        id = user.id,
                        email = user.email,
                        fullName = user.fullName,
                        role = user.role,
                        status = user.status,
                        createdAt = user.createdAt,
                        updatedAt = user.updatedAt,
                        lastLoginAt = user.lastLoginAt
                    )
                )
                Result.success(authResponse)
            } else {
                Result.failure(Exception(response.message().ifBlank { "Registration failed" }))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout(): Result<Unit> {
        return try {
            apiService.logout()
            tokenManager.clearToken()
            userDao.deleteAllUsers()
            Result.success(Unit)
        } catch (e: Exception) {
            // Even if network logout fails, clear local session
            tokenManager.clearToken()
            userDao.deleteAllUsers()
            Result.success(Unit)
        }
    }

    suspend fun getCachedUser(): UserEntity? {
        return userDao.getCurrentUser()
    }

    suspend fun isLoggedIn(): Boolean {
        return tokenManager.getToken() != null
    }
}
