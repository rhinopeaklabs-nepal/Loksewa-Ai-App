package com.loksewa.aiapp.ui.screens.scan

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.loksewa.aiapp.camera.CameraPermissionHandler
import com.loksewa.aiapp.camera.CameraScannerManager
import com.loksewa.aiapp.ui.components.NeuriseIconButton
import com.loksewa.aiapp.ui.components.NeurisePrimaryButton
import com.loksewa.aiapp.ui.theme.*

@Composable
fun ScanScreen(
    onResultReady: (Int?, String) -> Unit,
    onBackClick: () -> Unit,
    cameraScannerManager: CameraScannerManager,
    viewModel: ScanViewModel
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val uiState by viewModel.uiState.collectAsState()

    var permissionGranted by remember {
        mutableStateOf(CameraPermissionHandler.hasCameraPermission(context))
    }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        permissionGranted = isGranted
        viewModel.updatePermissionState(isGranted)
    }

    LaunchedEffect(permissionGranted) {
        if (!permissionGranted) {
            launcher.launch(Manifest.permission.CAMERA)
        } else {
            viewModel.updatePermissionState(true)
        }
    }

    LaunchedEffect(Unit) {
        viewModel.reset()
    }

    LaunchedEffect(uiState.phase) {
        if (uiState.phase == ScanPhase.RESULT) {
            onResultReady(uiState.matchedQuestion?.id, uiState.answerSource.value)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        if (permissionGranted) {
            AndroidView(
                factory = { ctx ->
                    PreviewView(ctx).apply {
                        scaleType = PreviewView.ScaleType.FILL_CENTER
                    }
                },
                modifier = Modifier.fillMaxSize(),
                update = { previewView ->
                    cameraScannerManager.bindCamera(
                        lifecycleOwner = lifecycleOwner,
                        previewView = previewView,
                        onTextRecognized = { text ->
                            viewModel.onTextDetected(text)
                        },
                        onError = { _ -> }
                    )
                }
            )

            DisposableEffect(Unit) {
                onDispose {
                    cameraScannerManager.stopCamera()
                }
            }

            // UI Overlay
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp, vertical = 24.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    NeuriseIconButton(
                        icon = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        background = Color.White.copy(alpha = 0.2f),
                        tint = Color.White,
                        onClick = onBackClick
                    )
                    
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(Color.Black.copy(alpha = 0.5f))
                            .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(20.dp))
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = BrandVioletLight,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Loksewa OCR",
                                color = Color.White,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black
                            )
                        }
                    }
                }

                // Scanning Frame
                Box(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .fillMaxWidth()
                        .height(280.dp)
                        .clip(RoundedCornerShape(32.dp))
                        .border(
                            width = 3.dp,
                            brush = Brush.linearGradient(listOf(BrandViolet, PrimaryGlow)),
                            shape = RoundedCornerShape(32.dp)
                        )
                ) {
                    // Corner accents could go here
                }

                Column(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Align question text inside the frame",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(Color.Black.copy(alpha = 0.6f))
                            .padding(horizontal = 20.dp, vertical = 12.dp)
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Decorative scan button (it scans automatically but this provides feedback)
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f))
                            .border(4.dp, Color.White, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                        )
                    }
                }
            }
        } else {
            // Permission Denied UI
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(BackgroundLight)
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(RoundedCornerShape(30.dp))
                        .background(BrandVioletLight),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.CameraAlt,
                        contentDescription = null,
                        tint = BrandViolet,
                        modifier = Modifier.size(44.dp)
                    )
                }
                Spacer(modifier = Modifier.height(32.dp))
                Text(
                    text = "Camera Access",
                    color = TextPrimaryLight,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Allow access to your camera to scan questions and get instant AI coaching.",
                    color = TextSecondaryLight,
                    textAlign = TextAlign.Center,
                    fontSize = 15.sp,
                    lineHeight = 22.sp
                )
                Spacer(modifier = Modifier.height(40.dp))
                NeurisePrimaryButton(
                    text = "Grant Permission",
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { launcher.launch(Manifest.permission.CAMERA) }
                )
            }
        }

        if (uiState.phase == ScanPhase.OCR_PROCESSING || uiState.phase == ScanPhase.DATABASE_MATCHING) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.75f)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(
                        color = BrandViolet,
                        strokeWidth = 4.dp,
                        modifier = Modifier.size(54.dp)
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Text(
                        text = if (uiState.phase == ScanPhase.OCR_PROCESSING) "Analyzing Image..." else "Matching Database...",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "This happens entirely offline",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 12.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }
    }
}
