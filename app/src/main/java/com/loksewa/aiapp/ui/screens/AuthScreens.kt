package com.loksewa.aiapp.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.ui.components.NeuriseCard
import com.loksewa.aiapp.ui.components.NeurisePill
import com.loksewa.aiapp.ui.components.NeuriseScreenSurface
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandBlue
import com.loksewa.aiapp.ui.theme.BrandOrange
import com.loksewa.aiapp.ui.theme.BrandTeal
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.BrandVioletLight
import com.loksewa.aiapp.ui.theme.StatusError
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.SurfaceWarm
import com.loksewa.aiapp.ui.theme.TextPrimaryLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight
import com.loksewa.aiapp.ui.theme.TextTertiaryLight
import kotlinx.coroutines.delay

// ----------------------------------------------------
// 1. SplashScreen
// ----------------------------------------------------
@Composable
fun SplashScreen(
    onTimeout: () -> Unit
) {
    LaunchedEffect(Unit) {
        delay(2500)
        onTimeout()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF08090C)), // Deep Space-Black Background
        contentAlignment = Alignment.Center
    ) {
        // Cosmic wave or gradient lines in background
        CosmicGradientLines(modifier = Modifier.fillMaxSize())

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxSize()
                .padding(vertical = 60.dp)
        ) {
            Spacer(modifier = Modifier.height(20.dp))

            // Logo & Title
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                LoksewaBrandIcon(
                    modifier = Modifier
                        .size(150.dp)
                        .clip(RoundedCornerShape(36.dp))
                )

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = "LOKSEWA AI",
                    color = Color.White,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp
                )

                Text(
                    text = "Your AI-Powered Companion\nfor Loksewa Success",
                    color = TextSecondaryLight,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp
                )
            }

            // Parliament and Mountains Illustration
            ParliamentAndMountainsIllustration(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp)
                    .padding(horizontal = 20.dp)
            )
        }
    }
}

// Helper to draw cosmic gradient background lines
@Composable
fun CosmicGradientLines(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height

        // Top-right glow
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(BrandViolet.copy(alpha = 0.15f), Color.Transparent),
                center = Offset(w * 0.8f, h * 0.2f),
                radius = w * 0.6f
            ),
            radius = w * 0.6f,
            center = Offset(w * 0.8f, h * 0.2f)
        )

        // Bottom-left glow
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(BrandBlue.copy(alpha = 0.12f), Color.Transparent),
                center = Offset(w * 0.2f, h * 0.8f),
                radius = w * 0.6f
            ),
            radius = w * 0.6f,
            center = Offset(w * 0.2f, h * 0.8f)
        )

        // Draw flowing path 1 (Indigo line)
        val path1 = Path().apply {
            moveTo(0f, h * 0.3f)
            cubicTo(w * 0.3f, h * 0.25f, w * 0.7f, h * 0.45f, w, h * 0.35f)
        }
        drawPath(
            path = path1,
            color = BrandViolet.copy(alpha = 0.15f),
            style = Stroke(width = 3f)
        )

        // Draw flowing path 2 (Cyan line)
        val path2 = Path().apply {
            moveTo(0f, h * 0.5f)
            cubicTo(w * 0.4f, h * 0.6f, w * 0.6f, h * 0.4f, w, h * 0.55f)
        }
        drawPath(
            path = path2,
            color = BrandBlue.copy(alpha = 0.12f),
            style = Stroke(width = 2f)
        )
    }
}

// ----------------------------------------------------
// 2. Onboarding1Screen
// ----------------------------------------------------
@Composable
fun Onboarding1Screen(
    onNextClick: () -> Unit,
    onSkipClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF08090C))
    ) {
        CosmicGradientLines(modifier = Modifier.fillMaxSize())

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header with Skip Button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
                horizontalArrangement = Arrangement.End
            ) {
                Text(
                    text = "Skip",
                    color = TextSecondaryLight,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .clickable { onSkipClick() }
                        .padding(8.dp)
                )
            }

            // Illustration
            BrainOnBookIllustration(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp)
            )

            // Content
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(horizontal = 16.dp)
            ) {
                Text(
                    text = "AI-Powered Learning",
                    color = Color.White,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Smart practice, personalized for Loksewa success",
                    color = TextSecondaryLight,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp
                )
            }

            // Bottom Navigation with custom indicators and Next button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Page Indicator (Capsule for active, Dot for inactive)
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .width(24.dp)
                            .height(6.dp)
                            .clip(CircleShape)
                            .background(BrandBlue)
                    )
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f))
                    )
                }

                // Next Button
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(Brush.horizontalGradient(listOf(BrandOrange, BrandBlue)))
                        .clickable { onNextClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Next",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

// ----------------------------------------------------
// 3. Onboarding2Screen
// ----------------------------------------------------
@Composable
fun Onboarding2Screen(
    onNextClick: () -> Unit,
    onBackClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF08090C))
    ) {
        CosmicGradientLines(modifier = Modifier.fillMaxSize())

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header with Back Button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
                horizontalArrangement = Arrangement.Start
            ) {
                Text(
                    text = "Back",
                    color = TextSecondaryLight,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .clickable { onBackClick() }
                        .padding(8.dp)
                )
            }

            // Illustration
            TargetClipboardIllustration(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp)
            )

            // Content
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(horizontal = 16.dp)
            ) {
                Text(
                    text = "Exam Focused Preparation",
                    color = Color.White,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Structured mock tests, syllabus-aligned cataloging, and smart progress analysis.",
                    color = TextSecondaryLight,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp
                )
            }

            // Bottom Navigation with custom indicators and Next button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Page Indicator (Dot for inactive, Capsule for active)
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f))
                    )
                    Box(
                        modifier = Modifier
                            .width(24.dp)
                            .height(6.dp)
                            .clip(CircleShape)
                            .background(BrandBlue)
                    )
                }

                // Next Button
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(Brush.horizontalGradient(listOf(BrandOrange, BrandBlue)))
                        .clickable { onNextClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Next",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

// ----------------------------------------------------
// 4. GetStartedScreen
// ----------------------------------------------------
@Composable
fun GetStartedScreen(
    onEmailClick: () -> Unit,
    onGoogleClick: () -> Unit,
    onAppleClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF08090C))
    ) {
        CosmicGradientLines(modifier = Modifier.fillMaxSize())

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Spacer(modifier = Modifier.height(20.dp))

            // App Logo & Welcome
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                LoksewaBrandIcon(
                    modifier = Modifier
                        .size(118.dp)
                        .clip(RoundedCornerShape(30.dp))
                )

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Welcome to Loksewa AI",
                    color = Color.White,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Black,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Prepare for Nepal Civil Service exams with authoritative answers and on-device AI guidance.",
                    color = TextSecondaryLight,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }

            // Buttons
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 30.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Continue with Email (Orange-to-blue gradient)
                Button(
                    onClick = onEmailClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    shape = RoundedCornerShape(18.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.Transparent
                    ),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                brush = Brush.horizontalGradient(listOf(BrandOrange, BrandBlue)),
                                shape = RoundedCornerShape(18.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Email,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Continue with Email",
                                color = Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                // Continue with Google (Glassmorphic)
                Button(
                    onClick = onGoogleClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                        .border(1.dp, Color(0x26FFFFFF), RoundedCornerShape(18.dp)),
                    shape = RoundedCornerShape(18.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0x0FFFFFFF)
                    ),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        GoogleIcon()
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Continue with Google",
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Continue with Apple (Glassmorphic)
                Button(
                    onClick = onAppleClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                        .border(1.dp, Color(0x26FFFFFF), RoundedCornerShape(18.dp)),
                    shape = RoundedCornerShape(18.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0x0FFFFFFF)
                    ),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        AppleIcon()
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Continue with Apple",
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------
// 5. LoginScreen & RegisterScreen (Refactored)
// ----------------------------------------------------
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

    AuthLayout(
        title = "Loksewa AI",
        subtitle = "Study smarter with verified answers, OCR, and mock exam coaching."
    ) {
        NeuriseCard(
            modifier = Modifier.fillMaxWidth(),
            cornerRadius = 30,
            contentPadding = PaddingValues(22.dp)
        ) {
            Text("Sign in", color = TextPrimaryLight, fontSize = 24.sp, fontWeight = FontWeight.Black)
            Spacer(modifier = Modifier.height(6.dp))
            Text("Continue your Loksewa preparation.", color = TextSecondaryLight, fontSize = 13.sp)

            Spacer(modifier = Modifier.height(22.dp))

            AuthTextField(
                value = email,
                onValueChange = { email = it },
                label = "Email address",
                icon = Icons.Default.Email,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) })
            )

            Spacer(modifier = Modifier.height(14.dp))

            AuthTextField(
                value = password,
                onValueChange = { password = it },
                label = "Password",
                icon = Icons.Default.Lock,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                trailing = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                            tint = TextSecondaryLight
                        )
                    }
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(
                    onDone = {
                        focusManager.clearFocus()
                        viewModel.login(email, password)
                    }
                )
            )

            if (uiState.error != null) {
                Spacer(modifier = Modifier.height(14.dp))
                ErrorBanner(uiState.error!!)
            }

            Spacer(modifier = Modifier.height(22.dp))

            Box(modifier = Modifier.fillMaxWidth()) {
                AuthPrimaryButton(
                    text = if (uiState.isLoading) "Signing in..." else "Sign In",
                    enabled = email.isNotBlank() && password.isNotBlank() && !uiState.isLoading,
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { viewModel.login(email, password) }
                )
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        color = Color.White,
                        strokeWidth = 2.dp,
                        modifier = Modifier
                            .align(Alignment.CenterEnd)
                            .padding(end = 18.dp)
                            .size(18.dp)
                    )
                }
            }

            AuthSwitchRow(
                label = "Do not have an account?",
                action = "Register",
                onClick = onRegisterClick
            )
        }
    }
}

@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onLoginClick: () -> Unit,
    viewModel: RegisterViewModel
) {
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    val focusManager = LocalFocusManager.current
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.isRegistered) {
        if (uiState.isRegistered) onRegisterSuccess()
    }

    AuthLayout(
        title = "Create Study Profile",
        subtitle = "Set up a focused learning space for Loksewa practice."
    ) {
        NeuriseCard(
            modifier = Modifier.fillMaxWidth(),
            cornerRadius = 30,
            contentPadding = PaddingValues(22.dp)
        ) {
            Text("Register", color = TextPrimaryLight, fontSize = 24.sp, fontWeight = FontWeight.Black)
            Spacer(modifier = Modifier.height(6.dp))
            Text("Your progress, mocks, and scans stay together.", color = TextSecondaryLight, fontSize = 13.sp)

            Spacer(modifier = Modifier.height(22.dp))

            AuthTextField(
                value = fullName,
                onValueChange = { fullName = it },
                label = "Full name",
                icon = Icons.Default.Person,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) })
            )

            Spacer(modifier = Modifier.height(14.dp))

            AuthTextField(
                value = email,
                onValueChange = { email = it },
                label = "Email address",
                icon = Icons.Default.Email,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) })
            )

            Spacer(modifier = Modifier.height(14.dp))

            AuthTextField(
                value = password,
                onValueChange = { password = it },
                label = "Password",
                icon = Icons.Default.Lock,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                trailing = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                            tint = TextSecondaryLight
                        )
                    }
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next),
                keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) })
            )

            Spacer(modifier = Modifier.height(14.dp))

            AuthTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                label = "Confirm password",
                icon = Icons.Default.Lock,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(
                    onDone = {
                        focusManager.clearFocus()
                        registerIfValid(fullName, email, password, confirmPassword, viewModel)
                    }
                )
            )

            if (uiState.error != null) {
                Spacer(modifier = Modifier.height(14.dp))
                ErrorBanner(uiState.error!!)
            }

            Spacer(modifier = Modifier.height(22.dp))

            Box(modifier = Modifier.fillMaxWidth()) {
                AuthPrimaryButton(
                    text = if (uiState.isLoading) "Creating account..." else "Create Account",
                    enabled = fullName.isNotBlank() && email.isNotBlank() && password.isNotBlank() && !uiState.isLoading,
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { registerIfValid(fullName, email, password, confirmPassword, viewModel) }
                )
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        color = Color.White,
                        strokeWidth = 2.dp,
                        modifier = Modifier
                            .align(Alignment.CenterEnd)
                            .padding(end = 18.dp)
                            .size(18.dp)
                    )
                }
            }

            AuthSwitchRow(
                label = "Already have an account?",
                action = "Sign in",
                onClick = onLoginClick
            )
        }
    }
}

// ----------------------------------------------------
// Helpers & Internal Components
// ----------------------------------------------------
@Composable
private fun AuthLayout(
    title: String,
    subtitle: String,
    content: @Composable () -> Unit
) {
    NeuriseScreenSurface {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp)
                .padding(top = 54.dp, bottom = 34.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(78.dp)
                    .clip(RoundedCornerShape(26.dp))
                    .background(Brush.linearGradient(listOf(BrandViolet, BrandBlue))),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(34.dp))
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = title,
                color = TextPrimaryLight,
                fontSize = 32.sp,
                fontWeight = FontWeight.Black,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = subtitle,
                color = TextSecondaryLight,
                fontSize = 14.sp,
                lineHeight = 20.sp,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                NeurisePill(label = "OCR", icon = null, selected = true, tint = BrandViolet, background = BrandVioletLight)
                NeurisePill(label = "Verified DB", icon = null, selected = true, tint = BrandTeal, background = SurfaceWarm)
                NeurisePill(label = "Mocks", icon = null, selected = true, tint = BrandBlue, background = SurfaceWarm)
            }

            Spacer(modifier = Modifier.height(30.dp))

            content()
        }
    }
}

@Composable
private fun AuthTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    icon: ImageVector,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    trailing: (@Composable () -> Unit)? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label, color = TextSecondaryLight) },
        leadingIcon = { Icon(icon, contentDescription = null, tint = BrandBlue) },
        trailingIcon = trailing,
        singleLine = true,
        visualTransformation = visualTransformation,
        keyboardOptions = keyboardOptions,
        keyboardActions = keyboardActions,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(17.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = BrandBlue,
            unfocusedBorderColor = BorderLight,
            focusedContainerColor = SurfaceLight,
            unfocusedContainerColor = SurfaceLight,
            cursorColor = BrandBlue,
            focusedTextColor = TextPrimaryLight,
            unfocusedTextColor = TextPrimaryLight,
            focusedLabelColor = BrandBlue,
            unfocusedLabelColor = TextSecondaryLight
        )
    )
}

@Composable
fun AuthPrimaryButton(
    text: String,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.height(54.dp),
        shape = RoundedCornerShape(18.dp),
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
                    brush = if (enabled) {
                        Brush.horizontalGradient(listOf(BrandOrange, BrandBlue))
                    } else {
                        Brush.horizontalGradient(listOf(SurfaceWarm, SurfaceWarm))
                    },
                    shape = RoundedCornerShape(18.dp)
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = text,
                color = if (enabled) Color.White else TextTertiaryLight,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun ErrorBanner(message: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(15.dp))
            .background(StatusError.copy(alpha = 0.10f))
            .border(1.dp, StatusError.copy(alpha = 0.20f), RoundedCornerShape(15.dp))
            .padding(horizontal = 14.dp, vertical = 12.dp)
    ) {
        Text(text = message, color = StatusError, fontSize = 13.sp, lineHeight = 18.sp)
    }
}

@Composable
private fun AuthSwitchRow(
    label: String,
    action: String,
    onClick: () -> Unit
) {
    Spacer(modifier = Modifier.height(14.dp))
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = TextSecondaryLight, fontSize = 14.sp)
        TextButton(onClick = onClick, contentPadding = PaddingValues(horizontal = 4.dp)) {
            Text(action, color = BrandBlue, fontWeight = FontWeight.Black, fontSize = 14.sp)
        }
    }
}

private fun registerIfValid(
    fullName: String,
    email: String,
    password: String,
    confirmPassword: String,
    viewModel: RegisterViewModel
) {
    when {
        password != confirmPassword -> viewModel.setError("Passwords do not match")
        password.length < 6 -> viewModel.setError("Password must be at least 6 characters")
        else -> viewModel.register(email, password, fullName)
    }
}

// ----------------------------------------------------
// Dynamic Illustration Drawings
// ----------------------------------------------------
@Composable
fun ParliamentAndMountainsIllustration(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val centerX = width * 0.5f
        val centerY = height * 0.8f

        // 1. Draw mountains in the background
        val mountainPath1 = Path().apply {
            moveTo(0f, centerY)
            lineTo(width * 0.35f, height * 0.35f)
            lineTo(width * 0.7f, centerY)
            close()
        }
        drawPath(
            path = mountainPath1,
            brush = Brush.verticalGradient(
                colors = listOf(BrandViolet.copy(alpha = 0.2f), Color.Transparent)
            )
        )

        val mountainPath2 = Path().apply {
            moveTo(width * 0.3f, centerY)
            lineTo(width * 0.65f, height * 0.25f)
            lineTo(width, centerY)
            close()
        }
        drawPath(
            path = mountainPath2,
            brush = Brush.verticalGradient(
                colors = listOf(BrandBlue.copy(alpha = 0.15f), Color.Transparent)
            )
        )

        val mountainPath3 = Path().apply {
            moveTo(width * 0.1f, centerY)
            lineTo(width * 0.5f, height * 0.45f)
            lineTo(width * 0.9f, centerY)
            close()
        }
        drawPath(
            path = mountainPath3,
            brush = Brush.verticalGradient(
                colors = listOf(BrandViolet.copy(alpha = 0.12f), Color.Transparent)
            )
        )

        // 2. Draw glowing energy paths (lines on the ground converging to the center)
        // Left paths
        drawLine(
            brush = Brush.linearGradient(listOf(Color.Transparent, BrandBlue)),
            start = Offset(0f, height),
            end = Offset(centerX - 40f, centerY + 10f),
            strokeWidth = 4f
        )
        drawLine(
            brush = Brush.linearGradient(listOf(Color.Transparent, BrandOrange)),
            start = Offset(width * 0.2f, height),
            end = Offset(centerX - 15f, centerY + 10f),
            strokeWidth = 3f
        )

        // Right paths
        drawLine(
            brush = Brush.linearGradient(listOf(Color.Transparent, BrandBlue)),
            start = Offset(width, height),
            end = Offset(centerX + 40f, centerY + 10f),
            strokeWidth = 4f
        )
        drawLine(
            brush = Brush.linearGradient(listOf(Color.Transparent, BrandOrange)),
            start = Offset(width * 0.8f, height),
            end = Offset(centerX + 15f, centerY + 10f),
            strokeWidth = 3f
        )

        // Central path
        drawLine(
            brush = Brush.linearGradient(listOf(Color.Transparent, BrandViolet)),
            start = Offset(centerX, height),
            end = Offset(centerX, centerY + 10f),
            strokeWidth = 5f
        )

        // 3. Draw Parliament Building (Singha Durbar style representation in front)
        val bWidth = width * 0.52f
        val bHeight = height * 0.26f
        val bLeft = centerX - bWidth / 2
        val bRight = centerX + bWidth / 2
        val bBottom = centerY
        val bTop = bBottom - bHeight

        // Main base block
        drawRect(
            color = Color(0xD9111422), // Dark Slate Glassmorphic surface
            topLeft = Offset(bLeft, bTop),
            size = Size(bWidth, bHeight)
        )
        drawRect(
            color = Color(0x26FFFFFF), // border white outline
            topLeft = Offset(bLeft, bTop),
            size = Size(bWidth, bHeight),
            style = Stroke(width = 2f)
        )

        // Colonnade (vertical pillars)
        val pillarCount = 8
        val pillarGap = bWidth / (pillarCount + 1)
        for (i in 1..pillarCount) {
            val pillarX = bLeft + i * pillarGap
            drawLine(
                color = Color(0x66FFFFFF),
                start = Offset(pillarX, bBottom),
                end = Offset(pillarX, bTop + 24f),
                strokeWidth = 3f
            )
        }

        // Upper floor balcony/frieze line
        drawLine(
            color = Color(0x88FFFFFF),
            start = Offset(bLeft, bTop + 24f),
            end = Offset(bRight, bTop + 24f),
            strokeWidth = 2f
        )

        // Pediment (triangle roof in the middle)
        val pedimentWidth = bWidth * 0.38f
        val pedimentLeft = centerX - pedimentWidth / 2
        val pedimentRight = centerX + pedimentWidth / 2
        val pedimentHeight = bHeight * 0.25f
        val pedimentTop = bTop - pedimentHeight
        val pedimentPath = Path().apply {
            moveTo(pedimentLeft, bTop)
            lineTo(centerX, pedimentTop)
            lineTo(pedimentRight, bTop)
            close()
        }
        drawPath(
            path = pedimentPath,
            color = Color(0xFF1B1E32)
        )
        drawPath(
            path = pedimentPath,
            color = Color(0x88FFFFFF),
            style = Stroke(width = 2f)
        )

        // Central Dome behind the pediment
        val domeRadius = bWidth * 0.11f
        drawArc(
            color = Color(0xFF1B1E32),
            startAngle = 180f,
            sweepAngle = 180f,
            useCenter = true,
            topLeft = Offset(centerX - domeRadius, bTop - domeRadius - 6f),
            size = Size(domeRadius * 2, domeRadius * 2)
        )
        drawArc(
            color = Color(0x88FFFFFF),
            startAngle = 180f,
            sweepAngle = 180f,
            useCenter = false,
            topLeft = Offset(centerX - domeRadius, bTop - domeRadius - 6f),
            size = Size(domeRadius * 2, domeRadius * 2),
            style = Stroke(width = 2f)
        )

        // Dome spire (glowing tip)
        drawLine(
            color = BrandOrange,
            start = Offset(centerX, bTop - domeRadius - 6f),
            end = Offset(centerX, bTop - domeRadius - 22f),
            strokeWidth = 3f
        )
        drawCircle(
            color = BrandOrange,
            radius = 5f,
            center = Offset(centerX, bTop - domeRadius - 22f)
        )

        // Steps leading up to the building
        val stepCount = 3
        val stepHeight = 6f
        for (i in 0 until stepCount) {
            val stepWidth = bWidth * 0.32f + (i * 16f)
            val stepLeft = centerX - stepWidth / 2
            val stepTop = bBottom + (i * stepHeight)
            drawRect(
                color = Color(0xFF1B1E32),
                topLeft = Offset(stepLeft, stepTop),
                size = Size(stepWidth, stepHeight)
            )
            drawRect(
                color = Color(0x44FFFFFF),
                topLeft = Offset(stepLeft, stepTop),
                size = Size(stepWidth, stepHeight),
                style = Stroke(width = 1f)
            )
        }
    }
}

@Composable
fun BrainOnBookIllustration(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val centerX = width * 0.5f
        val centerY = height * 0.52f

        // 1. Draw Open Book
        val bookWidth = width * 0.65f
        val bookHeight = height * 0.22f
        val bookLeft = centerX - bookWidth / 2
        val bookRight = centerX + bookWidth / 2
        val bookBottom = centerY + height * 0.16f

        // Left page path
        val leftPage = Path().apply {
            moveTo(centerX, bookBottom)
            cubicTo(
                centerX - bookWidth * 0.2f, bookBottom - 8f,
                centerX - bookWidth * 0.4f, bookBottom + 8f,
                bookLeft, bookBottom - 16f
            )
            lineTo(bookLeft, bookBottom - bookHeight - 16f)
            cubicTo(
                centerX - bookWidth * 0.4f, bookBottom - bookHeight + 8f,
                centerX - bookWidth * 0.2f, bookBottom - bookHeight - 8f,
                centerX, bookBottom - bookHeight
            )
            close()
        }

        // Right page path
        val rightPage = Path().apply {
            moveTo(centerX, bookBottom)
            cubicTo(
                centerX + bookWidth * 0.2f, bookBottom - 8f,
                centerX + bookWidth * 0.4f, bookBottom + 8f,
                bookRight, bookBottom - 16f
            )
            lineTo(bookRight, bookBottom - bookHeight - 16f)
            cubicTo(
                centerX + bookWidth * 0.4f, bookBottom - bookHeight + 8f,
                centerX + bookWidth * 0.2f, bookBottom - bookHeight - 8f,
                centerX, bookBottom - bookHeight
            )
            close()
        }

        // Draw book sheets with gradients
        drawPath(
            path = leftPage,
            brush = Brush.horizontalGradient(
                colors = listOf(Color(0xFF1B1E32), Color(0xCC111422))
            )
        )
        drawPath(
            path = leftPage,
            color = Color(0x33FFFFFF),
            style = Stroke(width = 2f)
        )

        drawPath(
            path = rightPage,
            brush = Brush.horizontalGradient(
                colors = listOf(Color(0xCC111422), Color(0xFF1B1E32))
            )
        )
        drawPath(
            path = rightPage,
            color = Color(0x33FFFFFF),
            style = Stroke(width = 2f)
        )

        // Central spine line
        drawLine(
            color = Color(0x66FFFFFF),
            start = Offset(centerX, bookBottom),
            end = Offset(centerX, bookBottom - bookHeight),
            strokeWidth = 2f
        )

        // 2. Draw Glowing Brain / Neural Net above the book
        val brainY = centerY - height * 0.12f
        val lobeRadiusX = width * 0.18f

        // Draw a glowing radial aura behind the brain
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(BrandBlue.copy(alpha = 0.2f), Color.Transparent),
                center = Offset(centerX, brainY),
                radius = lobeRadiusX * 1.5f
            ),
            radius = lobeRadiusX * 1.5f,
            center = Offset(centerX, brainY)
        )

        // Brain nodes mapping
        val nodes = listOf(
            Offset(centerX, brainY),
            Offset(centerX - 30f, brainY - 12f),
            Offset(centerX - 50f, brainY - 30f),
            Offset(centerX - 70f, brainY - 8f),
            Offset(centerX - 55f, brainY + 16f),
            Offset(centerX - 30f, brainY + 24f),
            Offset(centerX - 20f, brainY + 8f),
            Offset(centerX - 42f, brainY - 4f),
            Offset(centerX + 30f, brainY - 12f),
            Offset(centerX + 50f, brainY - 30f),
            Offset(centerX + 70f, brainY - 8f),
            Offset(centerX + 55f, brainY + 16f),
            Offset(centerX + 30f, brainY + 24f),
            Offset(centerX + 20f, brainY + 8f),
            Offset(centerX + 42f, brainY - 4f),
            Offset(centerX, brainY + 38f),
            Offset(centerX, brainY + 58f)
        )

        // Connections (Edges)
        val edges = listOf(
            0 to 1, 0 to 7, 0 to 8, 0 to 13, 0 to 15,
            1 to 2, 2 to 3, 3 to 4, 4 to 5, 5 to 6, 6 to 7, 1 to 7, 4 to 7,
            8 to 9, 9 to 10, 10 to 11, 11 to 12, 12 to 13, 13 to 14, 8 to 14, 11 to 14,
            5 to 15, 12 to 15, 15 to 16
        )

        // Draw edges (neural paths)
        edges.forEach { (startIdx, endIdx) ->
            drawLine(
                brush = Brush.linearGradient(listOf(BrandViolet, BrandBlue)),
                start = nodes[startIdx],
                end = nodes[endIdx],
                strokeWidth = 2f
            )
        }

        // Draw nodes
        nodes.forEachIndexed { idx, pos ->
            val color = when {
                idx == 0 -> BrandOrange
                idx < 8 -> BrandViolet
                idx < 15 -> BrandBlue
                else -> BrandTeal
            }
            drawCircle(
                color = color.copy(alpha = 0.3f),
                radius = 7f,
                center = pos
            )
            drawCircle(
                color = color,
                radius = 3.5f,
                center = pos
            )
        }

        // Energy beam rising from book to brain stem
        drawLine(
            brush = Brush.verticalGradient(
                colors = listOf(BrandBlue.copy(alpha = 0.8f), Color.Transparent)
            ),
            start = Offset(centerX, brainY + 58f),
            end = Offset(centerX, bookBottom - bookHeight),
            strokeWidth = 2f
        )
    }
}

@Composable
fun TargetClipboardIllustration(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val centerX = width * 0.5f
        val centerY = height * 0.5f

        // 1. Draw Clipboard
        val boardWidth = width * 0.42f
        val boardHeight = height * 0.52f
        val boardLeft = centerX - boardWidth * 0.65f
        val boardTop = centerY - boardHeight * 0.5f

        // Draw clipboard board
        drawRoundRect(
            color = Color(0xFF1B1E32),
            topLeft = Offset(boardLeft, boardTop),
            size = Size(boardWidth, boardHeight),
            cornerRadius = CornerRadius(12.dp.toPx(), 12.dp.toPx())
        )
        drawRoundRect(
            color = Color(0x26FFFFFF),
            topLeft = Offset(boardLeft, boardTop),
            size = Size(boardWidth, boardHeight),
            cornerRadius = CornerRadius(12.dp.toPx(), 12.dp.toPx()),
            style = Stroke(width = 2f)
        )

        // Paper sheet
        val paperWidth = boardWidth * 0.84f
        val paperHeight = boardHeight * 0.8f
        val paperLeft = boardLeft + (boardWidth - paperWidth) / 2
        val paperTop = boardTop + boardHeight * 0.12f
        drawRoundRect(
            color = Color(0xD9111422), // SurfaceLight slate glass
            topLeft = Offset(paperLeft, paperTop),
            size = Size(paperWidth, paperHeight),
            cornerRadius = CornerRadius(8.dp.toPx(), 8.dp.toPx())
        )
        drawRoundRect(
            color = Color(0x13FFFFFF),
            topLeft = Offset(paperLeft, paperTop),
            size = Size(paperWidth, paperHeight),
            cornerRadius = CornerRadius(8.dp.toPx(), 8.dp.toPx()),
            style = Stroke(width = 1f)
        )

        // Metal clip at top
        val clipWidth = boardWidth * 0.32f
        val clipHeight = boardHeight * 0.08f
        val clipLeft = boardLeft + (boardWidth - clipWidth) / 2
        val clipTop = boardTop - clipHeight * 0.25f
        drawRoundRect(
            color = Color(0xFF64748B),
            topLeft = Offset(clipLeft, clipTop),
            size = Size(clipWidth, clipHeight),
            cornerRadius = CornerRadius(4.dp.toPx(), 4.dp.toPx())
        )

        // Checklist lines on paper
        val lineCount = 4
        val lineGap = paperHeight / (lineCount + 1)
        val checkboxSize = 12f
        val lineStartX = paperLeft + 22f

        for (i in 1..lineCount) {
            val lineY = paperTop + i * lineGap

            // Checkbox
            drawRoundRect(
                color = if (i <= 2) BrandTeal else Color(0x33FFFFFF),
                topLeft = Offset(paperLeft + 6f, lineY - checkboxSize / 2),
                size = Size(checkboxSize, checkboxSize),
                cornerRadius = CornerRadius(3f, 3f),
                style = if (i > 2) Stroke(width = 1.5f) else Stroke(width = 0f) // Fill for completed ones
            )

            // Checkmark in checked box
            if (i <= 2) {
                drawLine(
                    color = Color.White,
                    start = Offset(paperLeft + 8f, lineY),
                    end = Offset(paperLeft + 11f, lineY + 2f),
                    strokeWidth = 2f
                )
                drawLine(
                    color = Color.White,
                    start = Offset(paperLeft + 11f, lineY + 2f),
                    end = Offset(paperLeft + 15f, lineY - 2f),
                    strokeWidth = 2f
                )
            }

            // Text line
            val lineWidth = paperWidth * (if (i % 2 == 0) 0.52f else 0.62f)
            drawLine(
                color = if (i <= 2) Color(0xFFF1F5F9) else Color(0xFF64748B),
                start = Offset(lineStartX, lineY),
                end = Offset(lineStartX + lineWidth, lineY),
                strokeWidth = 3f
            )
        }

        // 2. Draw Target / Bullseye overlapping on the right
        val targetX = centerX + boardWidth * 0.44f
        val targetY = centerY + boardHeight * 0.12f
        val targetRadius = width * 0.15f

        // Target glow
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(BrandOrange.copy(alpha = 0.2f), Color.Transparent),
                center = Offset(targetX, targetY),
                radius = targetRadius * 1.3f
            ),
            radius = targetRadius * 1.3f,
            center = Offset(targetX, targetY)
        )

        // Outer ring
        drawCircle(
            color = Color(0x11FFFFFF),
            radius = targetRadius,
            center = Offset(targetX, targetY)
        )
        drawCircle(
            color = Color(0x44FFFFFF),
            radius = targetRadius,
            center = Offset(targetX, targetY),
            style = Stroke(width = 1.5f)
        )

        // Middle ring
        drawCircle(
            color = Color(0xCC111422),
            radius = targetRadius * 0.65f,
            center = Offset(targetX, targetY)
        )
        drawCircle(
            color = Color(0x66FFFFFF),
            radius = targetRadius * 0.65f,
            center = Offset(targetX, targetY),
            style = Stroke(width = 1.5f)
        )

        // Inner bullseye
        drawCircle(
            color = BrandOrange,
            radius = targetRadius * 0.3f,
            center = Offset(targetX, targetY)
        )

        // Arrow hitting the center
        val arrowStartX = targetX + targetRadius * 1.1f
        val arrowStartY = targetY - targetRadius * 1.1f
        val arrowEndX = targetX + targetRadius * 0.1f
        val arrowEndY = targetY - targetRadius * 0.1f

        // Arrow shaft
        drawLine(
            color = BrandBlue,
            start = Offset(arrowStartX, arrowStartY),
            end = Offset(arrowEndX, arrowEndY),
            strokeWidth = 3f
        )

        // Arrow head
        val headPath = Path().apply {
            moveTo(arrowEndX, arrowEndY)
            lineTo(arrowEndX + 14f, arrowEndY - 2f)
            lineTo(arrowEndX + 2f, arrowEndY + 14f)
            close()
        }
        drawPath(
            path = headPath,
            color = BrandBlue
        )

        // Arrow feathers
        drawLine(
            color = BrandViolet,
            start = Offset(arrowStartX, arrowStartY),
            end = Offset(arrowStartX - 6f, arrowStartY - 10f),
            strokeWidth = 2.5f
        )
        drawLine(
            color = BrandViolet,
            start = Offset(arrowStartX, arrowStartY),
            end = Offset(arrowStartX - 10f, arrowStartY - 6f),
            strokeWidth = 2.5f
        )
    }
}

@Composable
private fun LoksewaBrandIcon(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(36.dp))
            .background(Color(0xFF040916))
            .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(36.dp)),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize().padding(14.dp)) {
            val w = size.width
            val h = size.height

            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(BrandBlue.copy(alpha = 0.28f), Color.Transparent),
                    center = Offset(w * 0.34f, h * 0.22f),
                    radius = w * 0.58f
                ),
                radius = w * 0.58f,
                center = Offset(w * 0.34f, h * 0.22f)
            )
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(BrandOrange.copy(alpha = 0.22f), Color.Transparent),
                    center = Offset(w * 0.76f, h * 0.40f),
                    radius = w * 0.48f
                ),
                radius = w * 0.48f,
                center = Offset(w * 0.76f, h * 0.40f)
            )

            val upright = Path().apply {
                moveTo(w * 0.22f, h * 0.66f)
                cubicTo(w * 0.28f, h * 0.36f, w * 0.42f, h * 0.18f, w * 0.64f, h * 0.08f)
                lineTo(w * 0.72f, h * 0.12f)
                lineTo(w * 0.72f, h * 0.54f)
                lineTo(w * 0.55f, h * 0.54f)
                cubicTo(w * 0.44f, h * 0.55f, w * 0.36f, h * 0.61f, w * 0.22f, h * 0.66f)
                close()
            }
            drawPath(
                path = upright,
                brush = Brush.linearGradient(
                    colors = listOf(BrandBlue, BrandViolet),
                    start = Offset(w * 0.22f, h * 0.10f),
                    end = Offset(w * 0.58f, h * 0.70f)
                )
            )

            val wing = Path().apply {
                moveTo(w * 0.20f, h * 0.66f)
                lineTo(w * 0.36f, h * 0.48f)
                lineTo(w * 0.88f, h * 0.48f)
                cubicTo(w * 0.84f, h * 0.62f, w * 0.74f, h * 0.70f, w * 0.56f, h * 0.71f)
                lineTo(w * 0.20f, h * 0.71f)
                close()
            }
            drawPath(
                path = wing,
                brush = Brush.linearGradient(
                    colors = listOf(BrandOrange, Color(0xFFFFD83D)),
                    start = Offset(w * 0.22f, h * 0.70f),
                    end = Offset(w * 0.88f, h * 0.48f)
                )
            )

            val nodes = listOf(
                Offset(w * 0.56f, h * 0.18f),
                Offset(w * 0.70f, h * 0.20f),
                Offset(w * 0.78f, h * 0.32f),
                Offset(w * 0.66f, h * 0.36f),
                Offset(w * 0.52f, h * 0.34f),
                Offset(w * 0.58f, h * 0.48f),
                Offset(w * 0.78f, h * 0.48f)
            )
            val links = listOf(0 to 1, 1 to 2, 2 to 3, 3 to 0, 3 to 4, 4 to 0, 4 to 5, 5 to 3, 3 to 6, 6 to 2)
            links.forEach { (a, b) ->
                val start = nodes[a]
                val end = nodes[b]
                drawLine(
                    color = if (start.x < w * 0.64f) BrandBlue else BrandOrange,
                    start = start,
                    end = end,
                    strokeWidth = 2.2f
                )
            }
            nodes.forEachIndexed { index, node ->
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Color.White, if (index < 4) BrandBlue else BrandOrange),
                        center = node,
                        radius = w * 0.044f
                    ),
                    radius = w * 0.038f,
                    center = node
                )
            }

            val bookY = h * 0.83f
            val leftPage = Path().apply {
                moveTo(w * 0.14f, bookY)
                cubicTo(w * 0.28f, h * 0.74f, w * 0.42f, h * 0.76f, w * 0.50f, h * 0.88f)
                cubicTo(w * 0.38f, h * 0.83f, w * 0.28f, h * 0.84f, w * 0.14f, bookY)
                close()
            }
            val rightPage = Path().apply {
                moveTo(w * 0.50f, h * 0.88f)
                cubicTo(w * 0.58f, h * 0.76f, w * 0.72f, h * 0.74f, w * 0.86f, bookY)
                cubicTo(w * 0.72f, h * 0.84f, w * 0.62f, h * 0.83f, w * 0.50f, h * 0.88f)
                close()
            }
            drawPath(leftPage, color = Color.White)
            drawPath(rightPage, color = Color.White)
            drawLine(BrandBlue, Offset(w * 0.50f, h * 0.88f), Offset(w * 0.50f, h * 0.78f), strokeWidth = 2.5f)

            drawRoundRect(
                color = Color.White,
                topLeft = Offset(w * 0.37f, h * 0.66f),
                size = Size(w * 0.26f, h * 0.05f),
                cornerRadius = CornerRadius(4f, 4f)
            )
            repeat(4) { index ->
                drawRoundRect(
                    color = Color.White,
                    topLeft = Offset(w * (0.40f + index * 0.055f), h * 0.71f),
                    size = Size(w * 0.026f, h * 0.10f),
                    cornerRadius = CornerRadius(2f, 2f)
                )
            }
            drawCircle(Color.White, radius = w * 0.07f, center = Offset(w * 0.50f, h * 0.64f))
            drawRoundRect(
                color = Color.White,
                topLeft = Offset(w * 0.49f, h * 0.55f),
                size = Size(w * 0.02f, h * 0.10f),
                cornerRadius = CornerRadius(2f, 2f)
            )
            drawPath(
                path = Path().apply {
                    moveTo(w * 0.51f, h * 0.56f)
                    lineTo(w * 0.59f, h * 0.58f)
                    lineTo(w * 0.51f, h * 0.61f)
                    close()
                },
                color = Color.White
            )
        }
    }
}

@Composable
fun GoogleIcon() {
    Canvas(modifier = Modifier.size(20.dp)) {
        val r = size.width / 2
        val strokeW = 4f
        drawArc(
            color = Color.White,
            startAngle = 45f,
            sweepAngle = 270f,
            useCenter = false,
            style = Stroke(width = strokeW)
        )
        drawLine(
            color = Color.White,
            start = Offset(r, r),
            end = Offset(r * 1.7f, r),
            strokeWidth = strokeW
        )
    }
}

@Composable
fun AppleIcon() {
    Canvas(modifier = Modifier.size(20.dp)) {
        val path = Path().apply {
            moveTo(size.width * 0.5f, size.height * 0.3f)
            cubicTo(size.width * 0.4f, size.height * 0.3f, size.width * 0.2f, size.height * 0.4f, size.width * 0.2f, size.height * 0.65f)
            cubicTo(size.width * 0.2f, size.height * 0.85f, size.width * 0.4f, size.height * 0.95f, size.width * 0.5f, size.height * 0.95f)
            cubicTo(size.width * 0.6f, size.height * 0.95f, size.width * 0.8f, size.height * 0.85f, size.width * 0.8f, size.height * 0.65f)
            cubicTo(size.width * 0.8f, size.height * 0.4f, size.width * 0.6f, size.height * 0.3f, size.width * 0.5f, size.height * 0.3f)
            close()
        }
        drawPath(path = path, color = Color.White)
        val leafPath = Path().apply {
            moveTo(size.width * 0.5f, size.height * 0.28f)
            cubicTo(size.width * 0.55f, size.height * 0.15f, size.width * 0.65f, size.height * 0.12f, size.width * 0.65f, size.height * 0.12f)
            cubicTo(size.width * 0.65f, size.height * 0.12f, size.width * 0.58f, size.height * 0.22f, size.width * 0.5f, size.height * 0.28f)
            close()
        }
        drawPath(path = leafPath, color = Color.White)
    }
}
