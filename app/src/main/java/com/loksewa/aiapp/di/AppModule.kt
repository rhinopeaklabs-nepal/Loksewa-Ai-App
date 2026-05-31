package com.loksewa.aiapp.di

import android.content.Context
import androidx.room.Room
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.preferencesDataStoreFile
import com.loksewa.aiapp.data.local.*
import com.loksewa.aiapp.data.remote.LoksewaApiService
import com.loksewa.aiapp.BuildConfig
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

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
    fun provideOkHttpClient(): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        return OkHttpClient.Builder()
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
        return Room.databaseBuilder(
            context,
            LoksewaDatabase::class.java,
            "loksewa_active.db"
        )
            .fallbackToDestructiveMigration()
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