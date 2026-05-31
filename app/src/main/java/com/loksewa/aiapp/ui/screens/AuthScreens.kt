package com.loksewa.aiapp.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.ui.theme.*

// ─── Shared design tokens ────────────────────────────────────────────────────

private val bgGradient = Brush.verticalGradient(
    colors = listOf(GradientStart, GradientMid, GradientEnd)
)

private val cardGradient = Brush.linearGradient(
    colors = listOf(
        Color(0x1AFFFFFF),
        Color(0x0DFFFFFF)
    ),
    start = Offset(0f, 0f),
    end   = Offset(400f, 400f)
)

// ─── Decorative orb (blurred glow circle) ────────────────────────────────────

@Composable
private fun GlowOrb(
    color: Color,
    size: Int,
    xFraction: Float,
    yFraction: Float
) {
    val infiniteTransition = rememberInfiniteTransition(label = "orb")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.18f,
        targetValue  = 0.32f,
        animationSpec = infiniteRepeatable(
            animation = tween(2800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )
    BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .size(size.dp)
                .offset(
                    x = (maxWidth * xFraction) - (size / 2).dp,
                    y = (maxHeight * yFraction) - (size / 2).dp
                )
                .blur(60.dp)
                .background(color.copy(alpha = alpha), CircleShape)
        )
    }
}

// ─── Glass card wrapper ───────────────────────────────────────────────────────

@Composable
private fun GlassCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(cardGradient)
            .border(
                width = 1.dp,
                brush = Brush.linearGradient(
                    listOf(SurfaceGlassBorder, Color.Transparent, SurfaceGlassBorder)
                ),
                shape = RoundedCornerShape(24.dp)
            )
    ) {
        Column(
            modifier = Modifier.padding(28.dp),
            content  = content
        )
    }
}

// ─── Styled text field ────────────────────────────────────────────────────────

@Composable
private fun LoksewaTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    leadingIcon: @Composable () -> Unit,
    trailingIcon: (@Composable () -> Unit)? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    modifier: Modifier = Modifier
) {
    OutlinedTextField(
        value               = value,
        onValueChange       = onValueChange,
        label               = { Text(label, color = TextSecondary) },
        leadingIcon         = leadingIcon,
        trailingIcon        = trailingIcon,
        singleLine          = true,
        visualTransformation = visualTransformation,
        keyboardOptions     = keyboardOptions,
        keyboardActions     = keyboardActions,
        modifier            = modifier.fillMaxWidth(),
        shape               = RoundedCornerShape(14.dp),
        colors              = OutlinedTextFieldDefaults.colors(
            focusedBorderColor      = PrimaryBlue,
            unfocusedBorderColor    = SurfaceElevated,
            focusedContainerColor   = SurfaceGlass,
            unfocusedContainerColor = SurfaceGlass,
            cursorColor             = PrimaryBlue,
            focusedLabelColor       = PrimaryBlue,
            focusedTextColor        = TextPrimary,
            unfocusedTextColor      = TextPrimary,
            focusedLeadingIconColor  = PrimaryBlue,
            unfocusedLeadingIconColor= TextTertiary
        )
    )
}

// ─── Primary gradient button ──────────────────────────────────────────────────

@Composable
private fun GradientButton(
    text: String,
    onClick: () -> Unit,
    isLoading: Boolean,
    enabled: Boolean,
    modifier: Modifier = Modifier
) {
    Button(
        onClick  = onClick,
        enabled  = enabled && !isLoading,
        modifier = modifier
            .fillMaxWidth()
            .height(56.dp),
        shape    = RoundedCornerShape(14.dp),
        colors   = ButtonDefaults.buttonColors(
            containerColor         = Color.Transparent,
            disabledContainerColor = Color.Transparent
        ),
        contentPadding = PaddingValues(0.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    brush = if (enabled && !isLoading)
                        Brush.horizontalGradient(listOf(PrimaryBlue, PrimaryGlow))
                    else
                        Brush.horizontalGradient(listOf(SurfaceElevated, SurfaceElevated)),
                    shape = RoundedCornerShape(14.dp)
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color    = TextPrimary,
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    text       = text,
                    fontWeight = FontWeight.SemiBold,
                    fontSize   = 16.sp,
                    color      = if (enabled) TextPrimary else TextTertiary,
                    letterSpacing = 0.5.sp
                )
            }
        }
    }
}

// ─── Error banner ─────────────────────────────────────────────────────────────

@Composable
private fun ErrorBanner(message: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(StatusError.copy(alpha = 0.12f))
            .border(1.dp, StatusError.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Text(
            text  = message,
            color = StatusError,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onRegisterClick: () -> Unit,
    viewModel: LoginViewModel
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    val focusManager = LocalFocusManager.current
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.isLoggedIn) {
        if (uiState.isLoggedIn) onLoginSuccess()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        // Background glow orbs
        GlowOrb(PrimaryBlue,  320, 0.15f, 0.10f)
        GlowOrb(AccentPurple, 240, 0.85f, 0.30f)
        GlowOrb(AccentCyan,   200, 0.50f, 0.75f)

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp)
                .padding(top = 72.dp, bottom = 40.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Logo mark
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        Brush.linearGradient(listOf(PrimaryBlue, PrimaryGlow))
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text       = "LA",
                    color      = TextPrimary,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize   = 28.sp,
                    letterSpacing = (-1).sp
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text       = "Loksewa AI",
                style      = MaterialTheme.typography.displaySmall,
                fontWeight = FontWeight.ExtraBold,
                color      = TextPrimary,
                letterSpacing = (-0.5).sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text  = "Study with verified answers first.",
                style = MaterialTheme.typography.bodyLarge,
                color = TextSecondary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Feature pills
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("📷 Offline OCR", "✅ Verified DB", "🏆 Mock Exams").forEach { label ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(SurfaceGlass)
                            .border(1.dp, SurfaceGlassBorder, RoundedCornerShape(20.dp))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(label, fontSize = 11.sp, color = TextSecondary)
                    }
                }
            }

            Spacer(modifier = Modifier.height(36.dp))

            // Glass form card
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text       = "Sign in",
                    style      = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color      = TextPrimary
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text  = "Welcome back — let's keep studying",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(24.dp))

                LoksewaTextField(
                    value    = email,
                    onValueChange = { email = it },
                    label    = "Email address",
                    leadingIcon = { Icon(Icons.Filled.Email, contentDescription = null) },
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Email,
                        imeAction    = ImeAction.Next
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                LoksewaTextField(
                    value    = password,
                    onValueChange = { password = it },
                    label    = "Password",
                    leadingIcon = { Icon(Icons.Filled.Lock, contentDescription = null) },
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                imageVector = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                contentDescription = if (passwordVisible) "Hide" else "Show",
                                tint = TextSecondary
                            )
                        }
                    },
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction    = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            focusManager.clearFocus()
                            viewModel.login(email, password)
                        }
                    )
                )

                if (uiState.error != null) {
                    Spacer(modifier = Modifier.height(16.dp))
                    ErrorBanner(uiState.error!!)
                }

                Spacer(modifier = Modifier.height(24.dp))

                GradientButton(
                    text      = "Sign In",
                    onClick   = { viewModel.login(email, password) },
                    isLoading = uiState.isLoading,
                    enabled   = email.isNotBlank() && password.isNotBlank()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Don't have an account? ", color = TextSecondary, fontSize = 14.sp)
                    TextButton(
                        onClick = onRegisterClick,
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Text(
                            "Register",
                            color = PrimaryGlow,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}

// ─── REGISTER SCREEN ──────────────────────────────────────────────────────────

@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onLoginClick: () -> Unit,
    viewModel: RegisterViewModel
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var fullName by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    val focusManager = LocalFocusManager.current
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.isRegistered) {
        if (uiState.isRegistered) onRegisterSuccess()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        GlowOrb(AccentGreen,  280, 0.85f, 0.12f)
        GlowOrb(PrimaryBlue,  200, 0.10f, 0.50f)

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp)
                .padding(top = 72.dp, bottom = 40.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text       = "Create Account",
                style      = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.ExtraBold,
                color      = TextPrimary
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text  = "Start your Loksewa preparation journey",
                color = TextSecondary,
                style = MaterialTheme.typography.bodyMedium
            )

            Spacer(modifier = Modifier.height(32.dp))

            GlassCard(modifier = Modifier.fillMaxWidth()) {
                LoksewaTextField(
                    value    = fullName,
                    onValueChange = { fullName = it },
                    label    = "Full Name",
                    leadingIcon = { Icon(Icons.Filled.Person, contentDescription = null) },
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                    keyboardActions = KeyboardActions(
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                LoksewaTextField(
                    value    = email,
                    onValueChange = { email = it },
                    label    = "Email address",
                    leadingIcon = { Icon(Icons.Filled.Email, contentDescription = null) },
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Email,
                        imeAction    = ImeAction.Next
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                LoksewaTextField(
                    value    = password,
                    onValueChange = { password = it },
                    label    = "Password",
                    leadingIcon = { Icon(Icons.Filled.Lock, contentDescription = null) },
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                imageVector = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                contentDescription = null,
                                tint = TextSecondary
                            )
                        }
                    },
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction    = ImeAction.Next
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                LoksewaTextField(
                    value    = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    label    = "Confirm Password",
                    leadingIcon = { Icon(Icons.Filled.Lock, contentDescription = null) },
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction    = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            focusManager.clearFocus()
                            if (password == confirmPassword)
                                viewModel.register(email, password, fullName)
                        }
                    )
                )

                if (uiState.error != null) {
                    Spacer(modifier = Modifier.height(16.dp))
                    ErrorBanner(uiState.error!!)
                }

                Spacer(modifier = Modifier.height(24.dp))

                GradientButton(
                    text      = "Create Account",
                    onClick   = {
                        if (password != confirmPassword)
                            viewModel.setError("Passwords do not match")
                        else
                            viewModel.register(email, password, fullName)
                    },
                    isLoading = uiState.isLoading,
                    enabled   = email.isNotBlank() && password.isNotBlank() && fullName.isNotBlank()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Already have an account? ", color = TextSecondary, fontSize = 14.sp)
                    TextButton(
                        onClick = onLoginClick,
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Text(
                            "Sign In",
                            color = PrimaryGlow,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}