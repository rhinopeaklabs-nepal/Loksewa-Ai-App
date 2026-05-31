package com.loksewa.aiapp.di

import android.content.Context
import androidx.room.Room
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.preferencesDataStoreFile
import com.loksewa.aiapp.data.local.*
import com.loksewa.aiapp.data.remote.LoksewaApiService
import com.loksewa.aiapp.BuildConfig
import com.loksewa.aiapp.data.repository.TokenManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

private val MIGRATION_0_2 = object : Migration(0, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        ensureLocalTables(db)
    }
}

private val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        ensureLocalTables(db)
    }
}

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun providePreferencesDataStore(@ApplicationContext context: Context): DataStore<Preferences> {
        return PreferenceDataStoreFactory.create(
            produceFile = { context.preferencesDataStoreFile("loksewa_prefs") }
        )
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(tokenManager: TokenManager): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

        return OkHttpClient.Builder()
            .addInterceptor { chain ->
                val token = runBlocking { tokenManager.getToken() }
                val request = if (token.isNullOrBlank()) {
                    chain.request()
                } else {
                    chain.request().newBuilder()
                        .addHeader("Authorization", "Bearer $token")
                        .build()
                }
                chain.proceed(request)
            }
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideLoksewaApiService(retrofit: Retrofit): LoksewaApiService {
        return retrofit.create(LoksewaApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideDatabaseInstaller(@ApplicationContext context: Context): DatabaseInstaller {
        return DatabaseInstaller(context)
    }

    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext context: Context,
        databaseInstaller: DatabaseInstaller
    ): LoksewaDatabase {
        databaseInstaller.ensureInstalledBlocking()

        return Room.databaseBuilder(
            context,
            LoksewaDatabase::class.java,
            "loksewa_active.db"
        )
            .addMigrations(MIGRATION_0_2, MIGRATION_1_2)
            .build()
    }

    @Provides
    @Singleton
    fun provideQuestionDao(database: LoksewaDatabase): QuestionDao {
        return database.questionDao()
    }

    @Provides
    @Singleton
    fun provideUserDao(database: LoksewaDatabase): UserDao {
        return database.userDao()
    }

    @Provides
    @Singleton
    fun provideMockTestDao(database: LoksewaDatabase): MockTestDao {
        return database.mockTestDao()
    }

    @Provides
    @Singleton
    fun provideMockAttemptDao(database: LoksewaDatabase): MockAttemptDao {
        return database.mockAttemptDao()
    }

    @Provides
    @Singleton
    fun provideScanHistoryDao(database: LoksewaDatabase): ScanHistoryDao {
        return database.scanHistoryDao()
    }

    @Provides
    @Singleton
    fun provideMockTestAnswerDao(database: LoksewaDatabase): MockTestAnswerDao {
        return database.mockTestAnswerDao()
    }
}

private fun ensureLocalTables(db: SupportSQLiteDatabase) {
    db.execSQL(
        """
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            scanned_text TEXT NOT NULL,
            normalized_scanned_text TEXT NOT NULL,
            matched_question_id INTEGER,
            answer_source TEXT NOT NULL,
            user_rating INTEGER,
            created_at TEXT NOT NULL
        )
        """.trimIndent()
    )
    db.execSQL(
        """
        CREATE TABLE IF NOT EXISTS mock_test_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            user_id INTEGER NOT NULL,
            mock_test_id INTEGER NOT NULL,
            started_at TEXT NOT NULL,
            ends_at TEXT NOT NULL,
            submitted_at TEXT,
            status TEXT NOT NULL,
            score REAL NOT NULL,
            correct_count INTEGER NOT NULL,
            wrong_count INTEGER NOT NULL,
            unanswered_count INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            total_marks REAL NOT NULL
        )
        """.trimIndent()
    )
    db.execSQL(
        """
        CREATE TABLE IF NOT EXISTS mock_test_answers (
            attempt_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            selected_option TEXT,
            is_correct INTEGER NOT NULL,
            marks_awarded REAL NOT NULL,
            answered_at TEXT NOT NULL,
            PRIMARY KEY(attempt_id, question_id)
        )
        """.trimIndent()
    )
    db.execSQL(
        """
        CREATE TABLE IF NOT EXISTS mock_test_questions (
            mock_test_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            position INTEGER NOT NULL,
            PRIMARY KEY(mock_test_id, question_id)
        )
        """.trimIndent()
    )
}
