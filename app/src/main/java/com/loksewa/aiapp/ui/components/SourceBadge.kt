package com.loksewa.aiapp.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.core.model.AnswerSource

@Composable
fun SourceBadge(source: AnswerSource, modifier: Modifier = Modifier) {
    val (backgroundColor, textColor, label) = when (source) {
        AnswerSource.VERIFIED_DB -> Triple(Color(0xFFE8F5E9), Color(0xFF2E7D32), "Verified Source")
        AnswerSource.AI_ASSISTED -> Triple(Color(0xFFFFF8E1), Color(0xFFFFA000), "AI-Assisted Explanation")
        AnswerSource.AI_ONLY -> Triple(Color(0xFFFFE0B2), Color(0xFFE65100), "AI Analysis: Check Sources")
        AnswerSource.UNCERTAIN -> Triple(Color(0xFFFFEBEE), Color(0xFFC62828), "Not in Database")
    }

    Box(
        modifier = modifier
            .background(backgroundColor, RoundedCornerShape(4.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = label,
            color = textColor,
            fontSize = 12.sp,
            style = androidx.compose.material3.MaterialTheme.typography.labelMedium
        )
    }
}
