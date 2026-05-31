package com.loksewa.aiapp.ui.camera

import android.Manifest
import android.content.Context
import android.util.Log
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.suspendCancellableCoroutine
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class CameraScanner(
    private val context: Context,
    private val lifecycleOwner: LifecycleOwner
) {
    private val textRecognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    private val cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()

    interface ScanCallback {
        fun onTextRecognized(text: String)
        fun onError(error: String)
    }

    suspend fun requestCameraPermission(): Boolean {
        return suspendCancellableCoroutine { continuation ->
            val permission = android.content.pm.PackageManager.PERMISSION_GRANTED
            continuation.resume(permission == ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ))
        }
    }

    suspend fun processImageFromFile(imagePath: String): String {
        return suspendCancellableCoroutine { continuation ->
            try {
                val image = InputImage.fromFilePath(context, android.net.Uri.parse(imagePath))
                imageTextRecognition(image) { text ->
                    continuation.resume(text)
                }
            } catch (e: Exception) {
                Log.e("CameraScanner", "Error processing image: ${e.message}")
                continuation.resumeWithException(e)
            }
        }
    }

    fun startCameraPreview(
        previewView: PreviewView,
        onTextRecognized: (String) -> Unit,
        onError: (String) -> Unit
    ) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)

        cameraProviderFuture.addListener({
            try {
                val cameraProvider = cameraProviderFuture.get()

                val preview = Preview.Builder()
                    .build()
                    .also {
                        it.setSurfaceProvider(previewView.surfaceProvider)
                    }

                val imageAnalyzer = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                    .also { analysis ->
                        analysis.setAnalyzer(cameraExecutor) { imageProxy ->
                            processImageProxy(imageProxy, onTextRecognized, onError)
                        }
                    }

                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageAnalyzer
                )
            } catch (e: Exception) {
                Log.e("CameraScanner", "Camera binding failed: ${e.message}")
                onError("Camera initialization failed: ${e.message}")
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun processImageProxy(
        imageProxy: ImageProxy,
        onTextRecognized: (String) -> Unit,
        onError: (String) -> Unit
    ) {
        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            val image = InputImage.fromMediaImage(
                mediaImage,
                imageProxy.imageInfo.rotationDegrees
            )

            imageTextRecognition(image) { text ->
                if (text.isNotBlank()) {
                    onTextRecognized(text)
                }
                imageProxy.close()
            }
        } else {
            imageProxy.close()
        }
    }

    private fun imageTextRecognition(image: InputImage, callback: (String) -> Unit) {
        textRecognizer.process(image)
            .addOnSuccessListener { visionText ->
                val recognizedText = visionText.text
                callback(recognizedText)
            }
            .addOnFailureListener { e ->
                Log.e("CameraScanner", "Text recognition failed: ${e.message}")
                callback("")
            }
    }

    fun stopCamera() {
        cameraExecutor.shutdown()
        textRecognizer.close()
    }

    companion object {
        private const val TAG = "CameraScanner"
    }
}