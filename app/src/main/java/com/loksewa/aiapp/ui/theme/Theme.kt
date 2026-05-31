package com.loksewa.aiapp.ui.theme

import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat

private val LightColorScheme = lightColorScheme(
    primary               = BrandViolet,
    onPrimary             = Color.White,
    primaryContainer      = BrandVioletLight,
    onPrimaryContainer    = BrandViolet,
    secondary             = BrandBlue,
    onSecondary           = Color.White,
    secondaryContainer    = BrandBlueLight,
    onSecondaryContainer  = BrandBlue,
    tertiary              = BrandOrange,
    onTertiary            = Color.White,
    tertiaryContainer     = BrandOrangeLight,
    onTertiaryContainer   = BrandOrange,
    error                 = StatusError,
    onError               = Color.White,
    errorContainer        = Color(0xFFFEE2E2),
    onErrorContainer      = StatusError,
    background            = BackgroundLight,
    onBackground          = TextPrimaryLight,
    surface               = SurfaceLight,
    onSurface             = TextPrimaryLight,
    surfaceVariant        = SurfaceLight,
    onSurfaceVariant      = TextSecondaryLight,
    outline               = BorderLight,
    outlineVariant        = BorderLight,
    inverseSurface        = TextPrimaryLight,
    inverseOnSurface      = BackgroundLight,
    inversePrimary        = BrandViolet
)

@Composable
fun LoksewaTheme(
    content: @Composable () -> Unit
) {
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val activity = view.context as ComponentActivity
            // Modern edge-to-edge + transparent system bars
            activity.enableEdgeToEdge()
            val window = activity.window
            WindowInsetsControllerCompat(window, view).apply {
                // True = Dark icons for light theme background
                isAppearanceLightStatusBars     = true
                isAppearanceLightNavigationBars = true
            }
            WindowCompat.setDecorFitsSystemWindows(window, false)
        }
    }

    MaterialTheme(
        colorScheme = LightColorScheme,
        typography  = Typography,
        content     = content
    )
}