package com.loksewa.aiapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PrivacyTip
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.data.local.UserEntity
import com.loksewa.aiapp.data.repository.AuthRepository
import com.loksewa.aiapp.ui.components.NeuriseCard
import com.loksewa.aiapp.ui.components.NeuriseMetric
import com.loksewa.aiapp.ui.components.NeurisePill
import com.loksewa.aiapp.ui.components.NeuriseScreenSurface
import com.loksewa.aiapp.ui.theme.AccentGreen
import com.loksewa.aiapp.ui.theme.AccentRed
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandBlue
import com.loksewa.aiapp.ui.theme.BrandOrange
import com.loksewa.aiapp.ui.theme.BrandTeal
import com.loksewa.aiapp.ui.theme.BrandTealLight
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.BrandVioletLight
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.SurfaceWarm
import com.loksewa.aiapp.ui.theme.TextPrimaryLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight
import com.loksewa.aiapp.ui.theme.TextTertiaryLight
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(
    authRepository: AuthRepository,
    onLogoutSuccess: () -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    var user by remember { mutableStateOf<UserEntity?>(null) }
    var activeAlert by remember { mutableStateOf<ProfileAlert?>(null) }

    LaunchedEffect(Unit) {
        user = authRepository.getCachedUser()
    }

    fun showInfo(title: String, message: String) {
        activeAlert = ProfileAlert.Info(title, message)
    }

    fun showDone(title: String, message: String) {
        activeAlert = ProfileAlert.Success(title, message)
    }

    fun showConfirm(
        title: String,
        message: String,
        confirmText: String,
        destructive: Boolean = false,
        onConfirm: () -> Unit
    ) {
        activeAlert = ProfileAlert.Confirm(
            title = title,
            message = message,
            confirmText = confirmText,
            destructive = destructive,
            onConfirm = onConfirm
        )
    }

    activeAlert?.let { alert ->
        ProfileActionDialog(alert = alert, onDismiss = { activeAlert = null })
    }

    NeuriseScreenSurface(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Profile",
                color = TextPrimaryLight,
                fontSize = 25.sp,
                fontWeight = FontWeight.Black,
                modifier = Modifier.align(Alignment.Start)
            )

            ProfileHeroCard(user = user)

            NeuriseCard(
                modifier = Modifier.fillMaxWidth(),
                cornerRadius = 24,
                contentPadding = PaddingValues(16.dp)
            ) {
                Text(
                    text = "Account Information",
                    color = BrandViolet,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black
                )
                Spacer(modifier = Modifier.height(14.dp))
                ProfileInfoRow(icon = Icons.Default.Badge, label = "Role", value = user?.role?.uppercase() ?: "STUDENT")
                ProfileInfoRow(icon = Icons.Default.AutoAwesome, label = "Status", value = user?.status?.uppercase() ?: "ACTIVE")
                ProfileInfoRow(icon = Icons.Default.Email, label = "Member Since", value = user?.createdAt?.split(" ")?.firstOrNull() ?: "May 2026")
            }

            NeuriseCard(
                modifier = Modifier.fillMaxWidth(),
                cornerRadius = 28,
                contentPadding = PaddingValues(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Complete Details",
                            color = TextPrimaryLight,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = "Account, study, security, and local app controls.",
                            color = TextSecondaryLight,
                            fontSize = 12.sp,
                            lineHeight = 17.sp
                        )
                    }
                    NeurisePill(
                        label = "Verified",
                        icon = Icons.Default.VerifiedUser,
                        selected = true,
                        tint = AccentGreen,
                        background = BrandTealLight
                    )
                }
            }

            ProfileDetailsSection(title = "Account") {
                ProfileActionRow(
                    icon = Icons.Default.Badge,
                    title = "Personal information",
                    subtitle = user?.fullName ?: "Guest Student",
                    tint = BrandViolet,
                    onClick = {
                        showInfo(
                            "Personal information",
                            "Name: ${user?.fullName ?: "Guest Student"}\nEmail: ${user?.email ?: "guest@loksewa.com"}\nRole: ${user?.role?.uppercase() ?: "STUDENT"}"
                        )
                    }
                )
                ProfileActionRow(
                    icon = Icons.Default.Edit,
                    title = "Edit profile",
                    subtitle = "Update name and profile details",
                    tint = BrandBlue,
                    onClick = {
                        showInfo(
                            "Edit profile",
                            "Profile editing is ready in the UI. Connect this action to the profile update API when that endpoint is available."
                        )
                    }
                )
                ProfileActionRow(
                    icon = Icons.Default.Email,
                    title = "Email verification",
                    subtitle = user?.email ?: "No email cached",
                    tint = BrandTeal,
                    onClick = {
                        showConfirm(
                            title = "Send verification email?",
                            message = "We will send a verification link to ${user?.email ?: "your saved email"} when email delivery is connected.",
                            confirmText = "Send"
                        ) {
                            showDone("Verification queued", "A verification request has been prepared for this account.")
                        }
                    }
                )
            }

            ProfileDetailsSection(title = "Study") {
                ProfileActionRow(
                    icon = Icons.Default.School,
                    title = "Learning profile",
                    subtitle = "Officer level, GK, IQ, Constitution",
                    tint = BrandViolet,
                    onClick = {
                        showInfo(
                            "Learning profile",
                            "Focus areas: Officer level, GK, IQ reasoning, Constitution, and public administration."
                        )
                    }
                )
                ProfileActionRow(
                    icon = Icons.Default.Storage,
                    title = "Offline question bank",
                    subtitle = "Bundled local database and OCR history",
                    tint = BrandOrange,
                    onClick = {
                        showInfo(
                            "Offline question bank",
                            "The app can search bundled verified questions locally. OCR history is stored on this device."
                        )
                    }
                )
                ProfileActionRow(
                    icon = Icons.Default.CloudSync,
                    title = "Sync progress",
                    subtitle = "Back up practice and scan activity",
                    tint = BrandTeal,
                    onClick = {
                        showConfirm(
                            title = "Sync progress now?",
                            message = "This will sync mock attempts, profile details, and scan activity when the backend sync endpoint is available.",
                            confirmText = "Sync"
                        ) {
                            showDone("Sync checked", "Your local progress is ready for the next cloud sync.")
                        }
                    }
                )
            }

            ProfileDetailsSection(title = "Preferences") {
                ProfileActionRow(
                    icon = Icons.Default.Notifications,
                    title = "Notifications",
                    subtitle = "Study reminders and exam alerts",
                    tint = BrandViolet,
                    onClick = {
                        showInfo(
                            "Notifications",
                            "Notification preferences will cover mock reminders, revision prompts, and exam deadline alerts."
                        )
                    }
                )
                ProfileActionRow(
                    icon = Icons.Default.Language,
                    title = "Language",
                    subtitle = "English and Nepali learning support",
                    tint = BrandBlue,
                    onClick = {
                        showInfo(
                            "Language",
                            "Language preferences are ready for English and Nepali content modes."
                        )
                    }
                )
                ProfileActionRow(
                    icon = Icons.Default.PrivacyTip,
                    title = "Privacy",
                    subtitle = "OCR, profile, and data protection",
                    tint = BrandTeal,
                    onClick = {
                        showInfo(
                            "Privacy",
                            "OCR scans and cached account details stay on this device unless you choose to sync them."
                        )
                    }
                )
            }

            ProfileDetailsSection(title = "Security") {
                ProfileActionRow(
                    icon = Icons.Default.Lock,
                    title = "Change password",
                    subtitle = "Protect your Loksewa AI account",
                    tint = BrandViolet,
                    onClick = {
                        showInfo(
                            "Change password",
                            "Password update needs the account security API. The UI state and alert flow are ready."
                        )
                    }
                )
                ProfileActionRow(
                    icon = Icons.Default.VerifiedUser,
                    title = "Two-step protection",
                    subtitle = "Recommended for shared phones",
                    tint = BrandTeal,
                    onClick = {
                        showInfo(
                            "Two-step protection",
                            "Two-step verification will add another confirmation layer before sensitive account actions."
                        )
                    }
                )
                ProfileActionRow(
                    icon = Icons.Default.Security,
                    title = "Active session",
                    subtitle = "This device is currently signed in",
                    tint = BrandOrange,
                    onClick = {
                        showInfo(
                            "Active session",
                            "This phone or emulator is using the locally cached secure auth token."
                        )
                    }
                )
            }

            ProfileDetailsSection(title = "Data Actions") {
                ProfileActionRow(
                    icon = Icons.Default.Download,
                    title = "Export my data",
                    subtitle = "Profile, scans, attempts, and ratings",
                    tint = BrandBlue,
                    onClick = {
                        showConfirm(
                            title = "Prepare export?",
                            message = "This will package profile, mock attempt, scan history, and rating data once export storage is connected.",
                            confirmText = "Prepare"
                        ) {
                            showDone("Export prepared", "Your export request is ready for download support.")
                        }
                    }
                )
                ProfileActionRow(
                    icon = Icons.AutoMirrored.Filled.ExitToApp,
                    title = "Logout session",
                    subtitle = "Clear local token and return to login",
                    tint = AccentRed,
                    onClick = {
                        showConfirm(
                            title = "Logout now?",
                            message = "You will return to the login screen. Local cached session data will be cleared.",
                            confirmText = "Logout",
                            destructive = true
                        ) {
                            coroutineScope.launch {
                                authRepository.logout()
                                onLogoutSuccess()
                            }
                        }
                    }
                )
                ProfileActionRow(
                    icon = Icons.Default.Delete,
                    title = "Delete account",
                    subtitle = "Permanent account removal request",
                    tint = AccentRed,
                    onClick = {
                        showConfirm(
                            title = "Request account deletion?",
                            message = "This is a destructive action. Once backend deletion is connected, your profile, scans, attempts, and ratings will be removed.",
                            confirmText = "Request Delete",
                            destructive = true
                        ) {
                            showDone("Deletion request noted", "Account deletion requires backend confirmation before data is permanently removed.")
                        }
                    }
                )
            }

            Button(
                onClick = {
                    showConfirm(
                        title = "Logout now?",
                        message = "You will return to the login screen. Local cached session data will be cleared.",
                        confirmText = "Logout",
                        destructive = true
                    ) {
                        coroutineScope.launch {
                            authRepository.logout()
                            onLogoutSuccess()
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AccentRed),
                shape = RoundedCornerShape(18.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                        contentDescription = "Logout",
                        tint = SurfaceLight
                    )
                    Spacer(modifier = Modifier.size(8.dp))
                    Text("Logout Session", color = SurfaceLight, fontWeight = FontWeight.Black, fontSize = 14.sp)
                }
            }
        }
    }
}

@Composable
private fun ProfileHeroCard(user: UserEntity?) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 30,
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 24.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(94.dp)
                    .clip(CircleShape)
                    .background(Brush.linearGradient(listOf(BrandVioletLight, SurfaceWarm)))
                    .border(1.dp, BorderLight, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "User",
                    tint = BrandViolet,
                    modifier = Modifier.size(46.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = user?.fullName ?: "Guest Student",
                    color = TextPrimaryLight,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black
                )
                Spacer(modifier = Modifier.size(7.dp))
                Icon(Icons.Default.Star, contentDescription = null, tint = BrandTeal, modifier = Modifier.size(18.dp))
            }

            Text(
                text = user?.email ?: "guest@loksewa.com",
                color = TextSecondaryLight,
                fontSize = 13.sp
            )

            Spacer(modifier = Modifier.height(22.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(70.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                NeuriseMetric("Rating", "4.9", Modifier.weight(1f), BrandViolet)
                NeuriseMetric("Mocks", "120", Modifier.weight(1f), BrandBlue)
                NeuriseMetric("Reviews", "2.1k", Modifier.weight(1f), BrandTeal)
            }
        }
    }
}

@Composable
fun ProfileInfoRow(
    icon: ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(SurfaceWarm),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = BrandViolet, modifier = Modifier.size(17.dp))
            }
            Spacer(modifier = Modifier.size(10.dp))
            Text(text = label, color = TextSecondaryLight, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        }
        Text(text = value, color = TextPrimaryLight, fontWeight = FontWeight.Black, fontSize = 13.sp)
    }
}

@Composable
private fun ProfileDetailsSection(
    title: String,
    content: @Composable ColumnScope.() -> Unit
) {
    NeuriseCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 24,
        contentPadding = PaddingValues(16.dp)
    ) {
        Text(
            text = title,
            color = BrandViolet,
            fontSize = 14.sp,
            fontWeight = FontWeight.Black
        )
        Spacer(modifier = Modifier.height(10.dp))
        content()
    }
}

@Composable
private fun ProfileActionRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    tint: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(tint.copy(alpha = 0.10f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = tint,
                modifier = Modifier.size(19.dp)
            )
        }
        Spacer(modifier = Modifier.size(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                color = TextPrimaryLight,
                fontSize = 14.sp,
                fontWeight = FontWeight.Black
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                color = TextSecondaryLight,
                fontSize = 12.sp,
                lineHeight = 16.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
        Icon(
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = TextTertiaryLight,
            modifier = Modifier.size(22.dp)
        )
    }
}

@Composable
private fun ProfileActionDialog(
    alert: ProfileAlert,
    onDismiss: () -> Unit
) {
    val iconTint = when (alert) {
        is ProfileAlert.Confirm -> if (alert.destructive) AccentRed else BrandViolet
        is ProfileAlert.Info -> BrandViolet
        is ProfileAlert.Success -> AccentGreen
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(iconTint.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when (alert) {
                        is ProfileAlert.Confirm -> Icons.Default.Info
                        is ProfileAlert.Info -> Icons.Default.Info
                        is ProfileAlert.Success -> Icons.Default.AutoAwesome
                    },
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(23.dp)
                )
            }
        },
        title = {
            Text(
                text = alert.title,
                color = TextPrimaryLight,
                fontWeight = FontWeight.Black,
                fontSize = 19.sp
            )
        },
        text = {
            Text(
                text = alert.message,
                color = TextSecondaryLight,
                fontSize = 14.sp,
                lineHeight = 20.sp
            )
        },
        confirmButton = {
            TextButton(
                onClick = {
                    when (alert) {
                        is ProfileAlert.Confirm -> {
                            onDismiss()
                            alert.onConfirm()
                        }
                        else -> onDismiss()
                    }
                }
            ) {
                Text(
                    text = if (alert is ProfileAlert.Confirm) alert.confirmText else "Got it",
                    color = if (alert is ProfileAlert.Confirm && alert.destructive) AccentRed else BrandViolet,
                    fontWeight = FontWeight.Black
                )
            }
        },
        dismissButton = {
            if (alert is ProfileAlert.Confirm) {
                TextButton(onClick = onDismiss) {
                    Text("Cancel", color = TextSecondaryLight, fontWeight = FontWeight.Bold)
                }
            }
        },
        containerColor = SurfaceLight,
        shape = RoundedCornerShape(24.dp)
    )
}

private sealed class ProfileAlert {
    abstract val title: String
    abstract val message: String

    data class Info(
        override val title: String,
        override val message: String
    ) : ProfileAlert()

    data class Success(
        override val title: String,
        override val message: String
    ) : ProfileAlert()

    data class Confirm(
        override val title: String,
        override val message: String,
        val confirmText: String,
        val destructive: Boolean,
        val onConfirm: () -> Unit
    ) : ProfileAlert()
}
