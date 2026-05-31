package com.loksewa.aiapp.data.repository

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.loksewa.aiapp.data.local.UserDao
import com.loksewa.aiapp.data.local.UserEntity
import com.loksewa.aiapp.data.remote.LoksewaApiService
import com.loksewa.aiapp.data.remote.LoginRequest
import com.loksewa.aiapp.data.remote.RegisterRequest
import com.loksewa.aiapp.data.remote.AuthResponse
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenManager @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {
    private val tokenKey = stringPreferencesKey("auth_token")

    suspend fun getToken(): String? = dataStore.data.first()[tokenKey]

    suspend fun saveToken(token: String) {
        dataStore.edit { it[tokenKey] = token }
    }

    suspend fun clearToken() {
        dataStore.edit { it.remove(tokenKey) }
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
