package com.loksewa.aiapp.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.StatusError
import com.loksewa.aiapp.ui.theme.StatusSuccess
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.SurfaceWarm
import com.loksewa.aiapp.ui.theme.TextPrimaryLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight

@Composable
fun OptionButton(
    optionLetter: String,
    optionText: String,
    isSelected: Boolean,
    isCorrectAnswer: Boolean?,
    isWrongAnswer: Boolean?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val borderColor = when {
        isCorrectAnswer == true -> StatusSuccess
        isWrongAnswer == true -> StatusError
        isSelected -> BrandViolet
        else -> BorderLight
    }

    val containerColor = when {
        isCorrectAnswer == true -> StatusSuccess.copy(alpha = 0.10f)
        isWrongAnswer == true -> StatusError.copy(alpha = 0.10f)
        isSelected -> BrandViolet.copy(alpha = 0.10f)
        else -> SurfaceLight
    }

    val accentColor = when {
        isCorrectAnswer == true -> StatusSuccess
        isWrongAnswer == true -> StatusError
        isSelected -> BrandViolet
        else -> TextSecondaryLight
    }

    OutlinedButton(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp),
        shape = RoundedCornerShape(17.dp),
        colors = ButtonDefaults.outlinedButtonColors(
            containerColor = containerColor,
            contentColor = TextPrimaryLight
        ),
        border = BorderStroke(1.dp, borderColor)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(30.dp)
                    .clip(CircleShape)
                    .background(if (isSelected || isCorrectAnswer == true || isWrongAnswer == true) accentColor else SurfaceWarm),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = optionLetter,
                    color = if (isSelected || isCorrectAnswer == true || isWrongAnswer == true) SurfaceLight else TextSecondaryLight,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = optionText,
                fontSize = 14.sp,
                lineHeight = 19.sp,
                color = TextPrimaryLight,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                modifier = Modifier.weight(1f)
            )
        }
    }
}
