package com.loksewa.aiapp.ui.theme

import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat

private val DarkColorScheme = darkColorScheme(
    primary               = PrimaryBlue,
    onPrimary             = TextPrimary,
    primaryContainer      = SurfaceCard,
    onPrimaryContainer    = TextPrimary,
    secondary             = AccentGreen,
    onSecondary           = TextPrimary,
    secondaryContainer    = SurfaceElevated,
    onSecondaryContainer  = TextPrimary,
    tertiary              = AccentPurple,
    onTertiary            = TextPrimary,
    tertiaryContainer     = SurfaceCard,
    onTertiaryContainer   = TextPrimary,
    error                 = StatusError,
    onError               = TextPrimary,
    errorContainer        = AccentRed,
    onErrorContainer      = TextPrimary,
    background            = PrimaryBackground,
    onBackground          = TextPrimary,
    surface               = SurfaceBlue,
    onSurface             = TextPrimary,
    surfaceVariant        = SurfaceCard,
    onSurfaceVariant      = TextSecondary,
    outline               = TextTertiary,
    outlineVariant        = SurfaceElevated,
    inverseSurface        = TextPrimary,
    inverseOnSurface      = PrimaryBackground,
    inversePrimary        = PrimaryDark
)

@Composable
fun LoksewaTheme(
    content: @Composable () -> Unit
) {
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val activity = view.context as ComponentActivity
            // Modern edge-to-edge + transparent system bars (no deprecated setters)
            activity.enableEdgeToEdge()
            val window = activity.window
            WindowInsetsControllerCompat(window, view).apply {
                isAppearanceLightStatusBars     = false
                isAppearanceLightNavigationBars = false
            }
            WindowCompat.setDecorFitsSystemWindows(window, false)
        }
    }

    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography  = Typography,
        content     = content
    )
}