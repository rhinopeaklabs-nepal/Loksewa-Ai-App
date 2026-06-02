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
import com.loksewa.aiapp.ui.theme.AccentGold
import com.loksewa.aiapp.ui.theme.AccentGreen
import com.loksewa.aiapp.ui.theme.BackgroundLight
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandBlue
import com.loksewa.aiapp.ui.theme.BrandBlueLight
import com.loksewa.aiapp.ui.theme.BrandOrange
import com.loksewa.aiapp.ui.theme.BrandOrangeLight
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
            drawPath(
                path = topWave,
                brush = Brush.linearGradient(
                    colors = listOf(BrandViolet.copy(alpha = 0.22f), Color.Transparent),
                    start = Offset(size.width * 0.4f, 0f),
                    end = Offset(size.width, size.height * 0.35f)
                )
            )

            val middleWave = Path().apply {
                moveTo(0f, size.height * 0.38f)
                cubicTo(size.width * 0.22f, size.height * 0.30f, size.width * 0.36f, size.height * 0.50f, size.width * 0.58f, size.height * 0.40f)
                cubicTo(size.width * 0.78f, size.height * 0.31f, size.width * 0.86f, size.height * 0.47f, size.width, size.height * 0.40f)
                lineTo(size.width, size.height * 0.65f)
                cubicTo(size.width * 0.76f, size.height * 0.74f, size.width * 0.62f, size.height * 0.56f, size.width * 0.40f, size.height * 0.64f)
                cubicTo(size.width * 0.22f, size.height * 0.70f, size.width * 0.14f, size.height * 0.55f, 0f, size.height * 0.60f)
                close()
            }
            drawPath(
                path = middleWave,
                brush = Brush.radialGradient(
                    colors = listOf(BrandBlue.copy(alpha = 0.16f), Color.Transparent),
                    center = Offset(size.width * 0.3f, size.height * 0.45f),
                    radius = size.width * 0.6f
                )
            )

            val bottomWave = Path().apply {
                moveTo(0f, size.height * 0.78f)
                cubicTo(size.width * 0.22f, size.height * 0.70f, size.width * 0.44f, size.height * 0.86f, size.width * 0.68f, size.height * 0.78f)
                cubicTo(size.width * 0.82f, size.height * 0.73f, size.width * 0.92f, size.height * 0.80f, size.width, size.height * 0.76f)
                lineTo(size.width, size.height)
                lineTo(0f, size.height)
                close()
            }
            drawPath(
                path = bottomWave,
                brush = Brush.linearGradient(
                    colors = listOf(Color.Transparent, BrandOrange.copy(alpha = 0.08f), BrandViolet.copy(alpha = 0.05f)),
                    start = Offset(0f, size.height * 0.75f),
                    end = Offset(size.width * 0.8f, size.height)
                )
            )
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
    val shape = RoundedCornerShape(cornerRadius.coerceAtMost(18).dp)
    Column(
        modifier = modifier
            .shadow(
                elevation = 8.dp,
                shape = shape,
                clip = false,
                ambientColor = Color.Black.copy(alpha = 0.5f),
                spotColor = BrandBlue.copy(alpha = 0.16f)
            )
            .clip(shape)
            .background(SurfaceLight)
            .border(
                BorderStroke(
                    width = 1.dp,
                    brush = Brush.linearGradient(
                        colors = listOf(
                            BrandBlue.copy(alpha = 0.22f),
                            Color.White.copy(alpha = 0.02f),
                            BrandOrange.copy(alpha = 0.16f)
                        )
                    )
                ),
                shape = shape
            )
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
                    color = BrandBlue,
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
            .background(background.copy(alpha = 0.6f))
            .border(
                BorderStroke(
                    width = 1.dp,
                    brush = Brush.linearGradient(
                        colors = listOf(
                            Color.White.copy(alpha = 0.15f),
                            Color.White.copy(alpha = 0.02f)
                        )
                    )
                ),
                shape = CircleShape
            )
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
    val shape = RoundedCornerShape(14.dp)
    val borderBrush = if (selected) {
        Brush.linearGradient(
            colors = listOf(
                tint.copy(alpha = 0.5f),
                tint.copy(alpha = 0.1f)
            )
        )
    } else {
        Brush.linearGradient(
            colors = listOf(
                Color.White.copy(alpha = 0.12f),
                Color.White.copy(alpha = 0.02f)
            )
        )
    }
    Row(
        modifier = modifier
            .clip(shape)
            .background(if (selected) background.copy(alpha = 0.25f) else SurfaceLight.copy(alpha = 0.5f))
            .border(BorderStroke(1.dp, borderBrush), shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(horizontal = 12.dp, vertical = 7.dp),
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
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            disabledContainerColor = SurfaceWarm.copy(alpha = 0.5f)
        ),
        contentPadding = PaddingValues(0.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    brush = Brush.horizontalGradient(listOf(BrandViolet, PrimaryGlow, BrandOrange, AccentGold)),
                    shape = RoundedCornerShape(14.dp)
                )
                .then(
                    if (enabled) {
                        Modifier.border(
                            BorderStroke(
                                width = 1.dp,
                                brush = Brush.linearGradient(
                                    colors = listOf(
                                        Color.White.copy(alpha = 0.25f),
                                        Color.Transparent
                                    )
                                )
                            ),
                            shape = RoundedCornerShape(14.dp)
                        )
                    } else Modifier
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = text,
                color = Color.White,
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
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(
            1.dp,
            brush = Brush.linearGradient(
                colors = listOf(
                    Color.White.copy(alpha = 0.15f),
                    Color.White.copy(alpha = 0.02f)
                )
            )
        ),
        colors = ButtonDefaults.outlinedButtonColors(
            containerColor = SurfaceLight.copy(alpha = 0.4f),
            contentColor = TextPrimaryLight,
            disabledContainerColor = SurfaceWarm.copy(alpha = 0.2f),
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
            .clip(RoundedCornerShape(14.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(accent.copy(alpha = 0.8f), secondary.copy(alpha = 0.8f)),
                    start = Offset.Zero,
                    end = Offset(400f, 400f)
                )
            )
            .border(
                BorderStroke(
                    width = 1.dp,
                    brush = Brush.linearGradient(
                        colors = listOf(
                            Color.White.copy(alpha = 0.25f),
                            Color.White.copy(alpha = 0.05f)
                        )
                    )
                ),
                shape = RoundedCornerShape(14.dp)
            ),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .size(58.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.12f))
        )
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .size(36.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.10f))
        )
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color.White,
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
        0 -> BrandBlue to BrandBlueLight
        1 -> BrandOrange to BrandOrangeLight
        2 -> BrandTeal to BrandTealLight
        3 -> BrandViolet to BrandVioletLight
        else -> AccentGreen to Color(0x2416C75B)
    }
}

val courseGradientPairs = listOf(
    BrandViolet to PrimaryGlow,
    BrandOrange to AccentGold,
    BrandBlue to BrandTeal,
    BrandViolet to BrandOrange,
    LavenderCanvas to BrandBlue
)
