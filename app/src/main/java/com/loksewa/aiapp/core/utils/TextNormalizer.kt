package com.loksewa.aiapp.core.utils

import java.text.Normalizer

object TextNormalizer {
    fun normalize(text: String): String {
        val nfkc = Normalizer.normalize(text, Normalizer.Form.NFKC)
        return nfkc.lowercase()
            .replace(Regex("[।॥,;.?!:\\-\"'\n\r\t()_@]"), " ")
            .replace(Regex("\\s+"), " ")
            .trim()
    }

    fun normalizeForFts(text: String): String {
        return normalize(text)
    }
}
