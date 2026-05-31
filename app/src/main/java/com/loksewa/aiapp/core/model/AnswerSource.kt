package com.loksewa.aiapp.core.model

enum class AnswerSource(val value: String) {
    VERIFIED_DB("verified_db"),
    AI_ASSISTED("ai_assisted"),
    AI_ONLY("ai_only"),
    UNCERTAIN("uncertain");

    companion object {
        fun fromValue(value: String): AnswerSource {
            return entries.firstOrNull { it.value == value } ?: UNCERTAIN
        }
    }
}
