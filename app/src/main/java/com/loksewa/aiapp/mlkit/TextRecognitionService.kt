package com.loksewa.aiapp.mlkit

import android.content.Context
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.suspendCancellableCoroutine
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume

data class TextRecognitionResult(
    val text: String,
    val confidence: Float
)

@Singleton
class TextRecognitionService @Inject constructor() {
    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    suspend fun recognizeText(imagePath: String, context: Context): TextRecognitionResult {
        return suspendCancellableCoroutine { continuation ->
            try {
                val inputImage = InputImage.fromFilePath(context, Uri.parse(imagePath))
                recognizer.process(inputImage)
                    .addOnSuccessListener { visionText ->
                        val confidence = if (visionText.text.isNotBlank()) 0.85f else 0.0f
                        continuation.resume(
                            TextRecognitionResult(
                                text = visionText.text,
                                confidence = confidence
                            )
                        )
                    }
                    .addOnFailureListener {
                        continuation.resume(TextRecognitionResult(text = "", confidence = 0f))
                    }
            } catch (e: Exception) {
                continuation.resume(TextRecognitionResult(text = "", confidence = 0f))
            }
        }
    }

    suspend fun recognizeFromImage(image: InputImage): TextRecognitionResult {
        return suspendCancellableCoroutine { continuation ->
            recognizer.process(image)
                .addOnSuccessListener { visionText ->
                    val confidence = if (visionText.text.isNotBlank()) 0.85f else 0.0f
                    continuation.resume(
                        TextRecognitionResult(
                            text = visionText.text,
                            confidence = confidence
                        )
                    )
                }
                .addOnFailureListener {
                    continuation.resume(TextRecognitionResult(text = "", confidence = 0f))
                }
        }
    }

    fun close() = recognizer.close()
}
