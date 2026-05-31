package com.loksewa.aiapp.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.ui.theme.*

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
        isSelected -> PrimaryBlue
        else -> SurfaceElevated
    }

    val containerColor = when {
        isCorrectAnswer == true -> StatusSuccess.copy(alpha = 0.15f)
        isWrongAnswer == true -> StatusError.copy(alpha = 0.15f)
        isSelected -> PrimaryBlue.copy(alpha = 0.15f)
        else -> SurfaceCard
    }

    val contentColor = when {
        isCorrectAnswer == true -> StatusSuccess
        isWrongAnswer == true -> StatusError
        isSelected -> PrimaryBlue
        else -> TextPrimary
    }

    androidx.compose.material3.OutlinedButton(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.outlinedButtonColors(
            containerColor = containerColor,
            contentColor = contentColor
        ),
        border = BorderStroke(2.dp, borderColor)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "$optionLetter.",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = contentColor
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = optionText,
                fontSize = 16.sp,
                color = if (isCorrectAnswer == true || isWrongAnswer == true || isSelected) contentColor else TextSecondary,
                modifier = Modifier.weight(1f)
            )
        }
    }
}
