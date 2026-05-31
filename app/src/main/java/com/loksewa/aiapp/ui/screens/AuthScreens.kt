package com.loksewa.aiapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Brush
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
import com.loksewa.aiapp.ui.components.NeurisePrimaryButton
import com.loksewa.aiapp.ui.components.NeuriseScreenSurface
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandBlue
import com.loksewa.aiapp.ui.theme.BrandTeal
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.BrandVioletLight
import com.loksewa.aiapp.ui.theme.StatusError
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.SurfaceWarm
import com.loksewa.aiapp.ui.theme.TextPrimaryLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight
import com.loksewa.aiapp.ui.theme.TextTertiaryLight

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

            Box {
                NeurisePrimaryButton(
                    text = if (uiState.isLoading) "Signing in..." else "Sign In",
                    enabled = email.isNotBlank() && password.isNotBlank() && !uiState.isLoading,
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { viewModel.login(email, password) }
                )
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        color = SurfaceLight,
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

            NeurisePrimaryButton(
                text = if (uiState.isLoading) "Creating account..." else "Create Account",
                enabled = fullName.isNotBlank() && email.isNotBlank() && password.isNotBlank() && !uiState.isLoading,
                modifier = Modifier.fillMaxWidth(),
                onClick = { registerIfValid(fullName, email, password, confirmPassword, viewModel) }
            )

            AuthSwitchRow(
                label = "Already have an account?",
                action = "Sign in",
                onClick = onLoginClick
            )
        }
    }
}

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
                    .background(Brush.linearGradient(listOf(BrandViolet, BrandTeal))),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = SurfaceLight, modifier = Modifier.size(34.dp))
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
        leadingIcon = { Icon(icon, contentDescription = null, tint = BrandViolet) },
        trailingIcon = trailing,
        singleLine = true,
        visualTransformation = visualTransformation,
        keyboardOptions = keyboardOptions,
        keyboardActions = keyboardActions,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(17.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = BrandViolet,
            unfocusedBorderColor = BorderLight,
            focusedContainerColor = SurfaceLight,
            unfocusedContainerColor = SurfaceLight,
            cursorColor = BrandViolet,
            focusedTextColor = TextPrimaryLight,
            unfocusedTextColor = TextPrimaryLight
        )
    )
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
            Text(action, color = BrandViolet, fontWeight = FontWeight.Black, fontSize = 14.sp)
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
