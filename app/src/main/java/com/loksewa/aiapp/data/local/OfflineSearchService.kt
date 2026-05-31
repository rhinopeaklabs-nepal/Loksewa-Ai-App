package com.loksewa.aiapp.data.local

import android.database.sqlite.SQLiteDatabase
import com.loksewa.aiapp.core.utils.TextNormalizer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

data class FtsSearchResult(
    val question: QuestionEntity,
    val bm25Score: Double
)

@Singleton
class OfflineSearchService @Inject constructor(
    private val databaseInstaller: DatabaseInstaller
) {
    private var cachedDatabase: SQLiteDatabase? = null

    private fun getDatabase(): SQLiteDatabase {
        val path = databaseInstaller.getDatabasePath()
        if (cachedDatabase == null || !cachedDatabase!!.isOpen) {
            cachedDatabase = SQLiteDatabase.openDatabase(
                path,
                null,
                SQLiteDatabase.OPEN_READONLY
            )
        }
        return cachedDatabase!!
    }

    suspend fun searchQuestions(input: String, limit: Int = 3): List<FtsSearchResult> {
        return withContext(Dispatchers.IO) {
            databaseInstaller.ensureInstalled()

            val normalized = TextNormalizer.normalizeForFts(input)
            if (normalized.isBlank()) return@withContext emptyList()

            val query = buildFtsQuery(normalized)
            val db = getDatabase()

            val cursor = db.rawQuery("""
                SELECT q.id, q.public_id, q.question_text, q.normalized_question_text,
                       q.option_a, q.option_b, q.option_c, q.option_d,
                       q.correct_option, q.explanation, q.syllabus_category,
                       q.source_name, q.source_url, q.source_license, q.source_year, q.source_page,
                       q.exam_level, q.exam_type, q.language, q.verification_status, q.verifier,
                       q.data_version, q.verified_at, q.created_at, q.updated_at,
                       bm25(fts_questions) AS bm25_score
                FROM fts_questions
                JOIN loksewa_questions q ON q.id = fts_questions.rowid
                WHERE fts_questions MATCH ?
                ORDER BY bm25_score ASC
                LIMIT ?
            """, arrayOf(query, limit.toString()))

            val results = mutableListOf<FtsSearchResult>()
            try {
                if (cursor.moveToFirst()) {
                    do {
                        val id = cursor.getInt(cursor.getColumnIndexOrThrow("id"))
                        val publicId = cursor.getString(cursor.getColumnIndexOrThrow("public_id"))
                        val questionText = cursor.getString(cursor.getColumnIndexOrThrow("question_text"))
                        val normalizedQuestionText = cursor.getString(cursor.getColumnIndexOrThrow("normalized_question_text"))
                        val optionA = cursor.getString(cursor.getColumnIndexOrThrow("option_a"))
                        val optionB = cursor.getString(cursor.getColumnIndexOrThrow("option_b"))
                        val optionC = cursor.getString(cursor.getColumnIndexOrThrow("option_c"))
                        val optionD = cursor.getString(cursor.getColumnIndexOrThrow("option_d"))
                        val correctOption = cursor.getString(cursor.getColumnIndexOrThrow("correct_option"))
                        val explanation = cursor.getString(cursor.getColumnIndexOrThrow("explanation"))
                        val syllabusCategory = cursor.getString(cursor.getColumnIndexOrThrow("syllabus_category"))
                        val sourceName = cursor.getString(cursor.getColumnIndexOrThrow("source_name"))
                        val sourceUrl = cursor.getString(cursor.getColumnIndexOrThrow("source_url"))
                        val sourceLicense = cursor.getString(cursor.getColumnIndexOrThrow("source_license"))
                        val sourceYear = if (cursor.isNull(cursor.getColumnIndexOrThrow("source_year"))) null else cursor.getInt(cursor.getColumnIndexOrThrow("source_year"))
                        val sourcePage = if (cursor.isNull(cursor.getColumnIndexOrThrow("source_page"))) null else cursor.getInt(cursor.getColumnIndexOrThrow("source_page"))
                        val examLevel = cursor.getString(cursor.getColumnIndexOrThrow("exam_level"))
                        val examType = cursor.getString(cursor.getColumnIndexOrThrow("exam_type"))
                        val language = cursor.getString(cursor.getColumnIndexOrThrow("language"))
                        val verificationStatus = cursor.getString(cursor.getColumnIndexOrThrow("verification_status"))
                        val verifier = cursor.getString(cursor.getColumnIndexOrThrow("verifier"))
                        val dataVersion = cursor.getInt(cursor.getColumnIndexOrThrow("data_version"))
                        val verifiedAt = cursor.getString(cursor.getColumnIndexOrThrow("verified_at"))
                        val createdAt = cursor.getString(cursor.getColumnIndexOrThrow("created_at"))
                        val updatedAt = cursor.getString(cursor.getColumnIndexOrThrow("updated_at"))
                        val bm25Score = cursor.getDouble(cursor.getColumnIndexOrThrow("bm25_score"))

                        val question = QuestionEntity(
                            id = id,
                            publicId = publicId,
                            questionText = questionText,
                            normalizedQuestionText = normalizedQuestionText,
                            optionA = optionA,
                            optionB = optionB,
                            optionC = optionC,
                            optionD = optionD,
                            correctOption = correctOption,
                            explanation = explanation,
                            syllabusCategory = syllabusCategory,
                            sourceName = sourceName,
                            sourceUrl = sourceUrl,
                            sourceLicense = sourceLicense,
                            sourceYear = sourceYear,
                            sourcePage = sourcePage,
                            examLevel = examLevel,
                            examType = examType,
                            language = language,
                            verificationStatus = verificationStatus,
                            verifier = verifier,
                            dataVersion = dataVersion,
                            verifiedAt = verifiedAt,
                            createdAt = createdAt,
                            updatedAt = updatedAt
                        )

                        results.add(FtsSearchResult(question, bm25Score))
                    } while (cursor.moveToNext())
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                cursor.close()
            }
            results
        }
    }

    private fun buildFtsQuery(normalized: String): String {
        val terms = normalized.split(' ')
            .filter { it.length >= 2 }.take(24)
            .map { "\"${it.replace("\"", "\"\"")}\"" }
        return if (terms.isEmpty()) "\"${normalized.replace("\"", "\"\"")}\""
            else terms.joinToString(" OR ")
    }
}
