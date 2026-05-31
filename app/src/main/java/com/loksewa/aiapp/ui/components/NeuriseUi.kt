package com.loksewa.aiapp.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.ui.theme.AccentGreen
import com.loksewa.aiapp.ui.theme.BackgroundLight
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandBlue
import com.loksewa.aiapp.ui.theme.BrandBlueLight
import com.loksewa.aiapp.ui.theme.BrandOrange
import com.loksewa.aiapp.ui.theme.BrandTeal
import com.loksewa.aiapp.ui.theme.BrandTealLight
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.BrandVioletLight
import com.loksewa.aiapp.ui.theme.LavenderCanvas
import com.loksewa.aiapp.ui.theme.LavenderMist
import com.loksewa.aiapp.ui.theme.LavenderWave
import com.loksewa.aiapp.ui.theme.PrimaryGlow
import com.loksewa.aiapp.ui.theme.SoftLilac
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.SurfaceWarm
import com.loksewa.aiapp.ui.theme.TextPrimaryLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight
import com.loksewa.aiapp.ui.theme.TextTertiaryLight

@Composable
fun NeuriseScreenSurface(
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundLight)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawRect(color = BackgroundLight)

            val topWave = Path().apply {
                moveTo(size.width * 0.36f, 0f)
                cubicTo(size.width * 0.52f, size.height * 0.04f, size.width * 0.72f, -size.height * 0.02f, size.width, size.height * 0.08f)
                lineTo(size.width, size.height * 0.36f)
                cubicTo(size.width * 0.76f, size.height * 0.30f, size.width * 0.62f, size.height * 0.18f, size.width * 0.38f, size.height * 0.25f)
                cubicTo(size.width * 0.25f, size.height * 0.29f, size.width * 0.18f, size.height * 0.19f, 0f, size.height * 0.24f)
                lineTo(0f, 0f)
                close()
            }
            drawPath(topWave, color = LavenderMist)

            val middleWave = Path().apply {
                moveTo(0f, size.height * 0.38f)
                cubicTo(size.width * 0.22f, size.height * 0.30f, size.width * 0.36f, size.height * 0.50f, size.width * 0.58f, size.height * 0.40f)
                cubicTo(size.width * 0.78f, size.height * 0.31f, size.width * 0.86f, size.height * 0.47f, size.width, size.height * 0.40f)
                lineTo(size.width, size.height * 0.65f)
                cubicTo(size.width * 0.76f, size.height * 0.74f, size.width * 0.62f, size.height * 0.56f, size.width * 0.40f, size.height * 0.64f)
                cubicTo(size.width * 0.22f, size.height * 0.70f, size.width * 0.14f, size.height * 0.55f, 0f, size.height * 0.60f)
                close()
            }
            drawPath(middleWave, color = SoftLilac.copy(alpha = 0.42f))

            val bottomWave = Path().apply {
                moveTo(0f, size.height * 0.78f)
                cubicTo(size.width * 0.22f, size.height * 0.70f, size.width * 0.44f, size.height * 0.86f, size.width * 0.68f, size.height * 0.78f)
                cubicTo(size.width * 0.82f, size.height * 0.73f, size.width * 0.92f, size.height * 0.80f, size.width, size.height * 0.76f)
                lineTo(size.width, size.height)
                lineTo(0f, size.height)
                close()
            }
            drawPath(bottomWave, color = LavenderWave.copy(alpha = 0.42f))
        }
        content()
    }
}

@Composable
fun NeuriseCard(
    modifier: Modifier = Modifier,
    cornerRadius: Int = 22,
    contentPadding: PaddingValues = PaddingValues(16.dp),
    content: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = modifier
            .shadow(10.dp, RoundedCornerShape(cornerRadius.dp), clip = false, ambientColor = BrandViolet.copy(alpha = 0.07f))
            .clip(RoundedCornerShape(cornerRadius.dp))
            .background(SurfaceLight)
            .border(1.dp, BorderLight, RoundedCornerShape(cornerRadius.dp))
            .padding(contentPadding),
        content = content
    )
}

@Composable
fun NeuriseSectionHeader(
    title: String,
    modifier: Modifier = Modifier,
    actionText: String? = "See All",
    onActionClick: () -> Unit = {}
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = title,
            color = TextPrimaryLight,
            fontSize = 16.sp,
            fontWeight = FontWeight.ExtraBold
        )
        if (actionText != null) {
            TextButton(
                onClick = onActionClick,
                contentPadding = PaddingValues(horizontal = 6.dp, vertical = 0.dp)
            ) {
                Text(
                    text = actionText,
                    color = BrandViolet,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun NeuriseIconButton(
    icon: ImageVector,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    tint: Color = TextPrimaryLight,
    background: Color = SurfaceLight,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .size(44.dp)
            .clip(CircleShape)
            .background(background)
            .border(1.dp, BorderLight, CircleShape)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
            tint = tint,
            modifier = Modifier.size(21.dp)
        )
    }
}

@Composable
fun NeurisePill(
    label: String,
    icon: ImageVector?,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    tint: Color = BrandViolet,
    background: Color = BrandVioletLight,
    onClick: (() -> Unit)? = null
) {
    val shape = RoundedCornerShape(15.dp)
    Row(
        modifier = modifier
            .clip(shape)
            .background(if (selected) background else SurfaceLight)
            .border(1.dp, if (selected) tint.copy(alpha = 0.24f) else BorderLight, shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(7.dp)
    ) {
        if (icon != null) {
            Box(
                modifier = Modifier
                    .size(18.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(tint.copy(alpha = 0.14f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = tint,
                    modifier = Modifier.size(13.dp)
                )
            }
        }
        Text(
            text = label,
            color = if (selected) tint else TextPrimaryLight,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
fun NeurisePrimaryButton(
    text: String,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.height(52.dp),
        shape = RoundedCornerShape(18.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            disabledContainerColor = SurfaceWarm
        ),
        contentPadding = PaddingValues(0.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    brush = Brush.horizontalGradient(listOf(BrandViolet, PrimaryGlow)),
                    shape = RoundedCornerShape(18.dp)
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = text,
                color = SurfaceLight,
                fontSize = 14.sp,
                fontWeight = FontWeight.ExtraBold
            )
        }
    }
}

@Composable
fun NeuriseSecondaryButton(
    text: String,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.height(52.dp),
        shape = RoundedCornerShape(18.dp),
        border = BorderStroke(1.dp, BorderLight),
        colors = ButtonDefaults.outlinedButtonColors(
            containerColor = SurfaceLight,
            contentColor = TextPrimaryLight,
            disabledContainerColor = SurfaceWarm,
            disabledContentColor = TextTertiaryLight
        )
    ) {
        Text(text = text, fontWeight = FontWeight.Bold, fontSize = 14.sp)
    }
}

@Composable
fun NeuriseMetric(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    color: Color = BrandViolet
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            color = TextPrimaryLight,
            fontSize = 20.sp,
            fontWeight = FontWeight.Black
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = label,
            color = TextSecondaryLight,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium
        )
        Spacer(modifier = Modifier.height(5.dp))
        Box(
            modifier = Modifier
                .width(20.dp)
                .height(3.dp)
                .clip(CircleShape)
                .background(color.copy(alpha = 0.62f))
        )
    }
}

@Composable
fun NeuriseThumbnail(
    icon: ImageVector,
    modifier: Modifier = Modifier,
    accent: Color = BrandViolet,
    secondary: Color = BrandBlue
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(accent.copy(alpha = 0.92f), secondary.copy(alpha = 0.92f)),
                    start = Offset.Zero,
                    end = Offset(400f, 400f)
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .size(58.dp)
                .clip(CircleShape)
                .background(SurfaceLight.copy(alpha = 0.18f))
        )
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .size(36.dp)
                .clip(CircleShape)
                .background(SurfaceLight.copy(alpha = 0.16f))
        )
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = SurfaceLight,
            modifier = Modifier.size(30.dp)
        )
    }
}

@Composable
fun NeuriseDivider(
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .width(1.dp)
            .fillMaxHeight()
            .background(BorderLight)
    )
}

fun categoryTint(index: Int): Pair<Color, Color> {
    return when (index % 5) {
        0 -> BrandViolet to BrandVioletLight
        1 -> BrandTeal to BrandTealLight
        2 -> BrandBlue to BrandBlueLight
        3 -> BrandOrange to Color(0xFFFFF3DF)
        else -> AccentGreen to Color(0xFFE1FAEE)
    }
}

val courseGradientPairs = listOf(
    BrandTeal to BrandBlue,
    BrandViolet to PrimaryGlow,
    BrandOrange to BrandViolet,
    BrandBlue to BrandTeal,
    LavenderCanvas to BrandViolet
)
