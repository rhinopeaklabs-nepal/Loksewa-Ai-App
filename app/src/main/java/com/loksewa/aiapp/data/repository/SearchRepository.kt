package com.loksewa.aiapp.data.repository

import com.loksewa.aiapp.core.model.AnswerSource
import com.loksewa.aiapp.core.utils.TextNormalizer
import com.loksewa.aiapp.data.local.FtsSearchResult
import com.loksewa.aiapp.data.local.OfflineSearchService
import com.loksewa.aiapp.data.local.QuestionEntity
import com.loksewa.aiapp.data.remote.LoksewaApiService
import com.loksewa.aiapp.data.remote.SearchRequest
import javax.inject.Inject
import javax.inject.Singleton

data class SearchResult(
    val source: AnswerSource,
    val question: QuestionEntity?,
    val confidence: Float
)

@Singleton
class SearchRepository @Inject constructor(
    private val offlineSearchService: OfflineSearchService,
    private val apiService: LoksewaApiService
) {
    suspend fun searchVerifiedQuestions(queryText: String): SearchResult {
        // Step 1: Search offline database first
        try {
            val offlineResults = offlineSearchService.searchQuestions(queryText, limit = 3)
            if (offlineResults.isNotEmpty()) {
                val bestMatch = offlineResults.first()
                val question = bestMatch.question
                val similarity = calculateSimilarity(queryText, question.questionText)
                
                val source = when {
                    similarity >= 0.6f -> AnswerSource.VERIFIED_DB
                    similarity >= 0.3f -> AnswerSource.AI_ASSISTED
                    else -> AnswerSource.AI_ONLY
                }
                
                return SearchResult(
                    source = source,
                    question = question,
                    confidence = similarity
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // Step 2: Try online search if offline yields nothing or low match
        try {
            val response = apiService.search(SearchRequest(query = queryText))
            if (response.isSuccessful && response.body() != null) {
                val searchResponse = response.body()!!
                val bestOnlineMatch = searchResponse.matches.firstOrNull()
                if (bestOnlineMatch != null) {
                    val questionDto = bestOnlineMatch.question
                    val question = QuestionEntity(
                        id = questionDto.id,
                        publicId = questionDto.publicId,
                        questionText = questionDto.questionText,
                        normalizedQuestionText = TextNormalizer.normalize(questionDto.questionText),
                        optionA = questionDto.optionA,
                        optionB = questionDto.optionB,
                        optionC = questionDto.optionC,
                        optionD = questionDto.optionD,
                        correctOption = questionDto.correctOption,
                        explanation = questionDto.explanation,
                        syllabusCategory = questionDto.syllabusCategory,
                        sourceName = questionDto.sourceName,
                        sourceUrl = "",
                        sourceLicense = "",
                        sourceYear = null,
                        sourcePage = null,
                        examLevel = "",
                        examType = "",
                        language = "ne",
                        verificationStatus = questionDto.verificationStatus,
                        verifier = "",
                        dataVersion = 1,
                        verifiedAt = null,
                        createdAt = "",
                        updatedAt = ""
                    )
                    return SearchResult(
                        source = AnswerSource.fromValue(searchResponse.answerSource),
                        question = question,
                        confidence = bestOnlineMatch.similarity
                    )
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // Step 3: Default fallback
        return SearchResult(
            source = AnswerSource.UNCERTAIN,
            question = null,
            confidence = 0f
        )
    }

    private fun calculateSimilarity(str1: String, str2: String): Float {
        val s1 = TextNormalizer.normalize(str1).split(" ").filter { it.length > 1 }.toSet()
        val s2 = TextNormalizer.normalize(str2).split(" ").filter { it.length > 1 }.toSet()
        if (s1.isEmpty() || s2.isEmpty()) return 0f
        val intersection = s1.intersect(s2).size
        val union = s1.union(s2).size
        return intersection.toFloat() / union.toFloat()
    }
}
