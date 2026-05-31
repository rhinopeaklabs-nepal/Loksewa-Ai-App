package com.loksewa.aiapp.ui.screens.scan

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.loksewa.aiapp.camera.CameraPermissionHandler
import com.loksewa.aiapp.camera.CameraScannerManager
import com.loksewa.aiapp.ui.theme.PrimaryBackground
import com.loksewa.aiapp.ui.theme.TextPrimary
import com.loksewa.aiapp.ui.theme.TextSecondary

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
            .background(PrimaryBackground)
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

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(48.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Align question text inside camera view",
                    color = Color.White.copy(alpha = 0.8f),
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .background(Color.Black.copy(alpha = 0.6f))
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Camera Permission Required",
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "We need access to the camera to scan questions offline.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(24.dp))
                Button(onClick = { launcher.launch(Manifest.permission.CAMERA) }) {
                    Text("Grant Permission")
                }
            }
        }

        if (uiState.phase == ScanPhase.OCR_PROCESSING || uiState.phase == ScanPhase.DATABASE_MATCHING) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.7f)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = Color.White)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = if (uiState.phase == ScanPhase.OCR_PROCESSING) "Recognizing Text..." else "Searching Local Database...",
                        color = Color.White,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}
