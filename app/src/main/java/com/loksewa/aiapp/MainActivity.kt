package com.loksewa.aiapp

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.loksewa.aiapp.ui.theme.LoksewaTheme
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject
import com.loksewa.aiapp.data.repository.AuthRepository
import com.loksewa.aiapp.camera.CameraScannerManager

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    @Inject
    lateinit var authRepository: AuthRepository
    
    @Inject
    lateinit var cameraScannerManager: CameraScannerManager

    // Set to true to use native Compose UI, false to use WebView prototype
    private var useNativeUI = USE_NATIVE_UI
    private lateinit var networkMonitor: NetworkMonitor
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        networkMonitor = NetworkMonitor(applicationContext)
        
        setContent {
            LoksewaTheme {
                val isOnline by networkMonitor.isOnline.collectAsState()
                
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        if (useNativeUI) {
                            // Use Jetpack Compose native UI
                            LoksewaApp(
                                authRepository = authRepository,
                                cameraScannerManager = cameraScannerManager
                            )
                        } else {
                            // Use WebView fallback
                            AndroidView(
                                factory = { context ->
                                    createConfiguredWebView(context)
                                },
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                        
                        if (!isOnline) {
                            OfflineOverlay()
                        }
                    }
                }
            }
        }
    }
    
    private fun createConfiguredWebView(context: Context): WebView {
        return WebView(context).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.loadWithOverviewMode = true
            settings.useWideViewPort = true
            settings.cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
            
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    // Handle navigation within WebView
                    return false
                }
            }
            
            // Register secure storage JavaScript bridge
            addJavascriptInterface(AndroidSecureStorageBridge(context), "AndroidSecureStorage")
            
            // Load the mobile app from assets
            loadUrl("file:///android_asset/mobile/index.html")
        }
    }
    
    companion object {
        // Toggle between native and WebView
        const val USE_NATIVE_UI = true
    }
}

class NetworkMonitor(context: Context) {
    private val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    private val _isOnline = MutableStateFlow(true)
    val isOnline: StateFlow<Boolean> = _isOnline

    init {
        // Initial state check
        checkCurrentState()

        // Dynamic callbacks
        val networkRequest = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()

        connectivityManager.registerNetworkCallback(networkRequest, object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                _isOnline.value = true
            }

            override fun onLost(network: Network) {
                _isOnline.value = false
            }
        })
    }

    private fun checkCurrentState() {
        val activeNetwork = connectivityManager.activeNetwork
        val capabilities = connectivityManager.getNetworkCapabilities(activeNetwork)
        _isOnline.value = capabilities?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
    }
}

class AndroidSecureStorageBridge(private val context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    @JavascriptInterface
    fun getItem(key: String): String {
        return sharedPreferences.getString(key, "") ?: ""
    }

    @JavascriptInterface
    fun setItem(key: String, value: String) {
        sharedPreferences.edit().putString(key, value).apply()
    }

    @JavascriptInterface
    fun removeItem(key: String) {
        sharedPreferences.edit().remove(key).apply()
    }

    @JavascriptInterface
    fun getApiBaseUrl(): String {
        return BuildConfig.API_BASE_URL
    }
}

@Composable
fun OfflineOverlay() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xEE121212)), // Semi-transparent dark background
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(24.dp)
        ) {
            Icon(
                imageVector = Icons.Default.CloudOff,
                contentDescription = "Offline",
                tint = MaterialTheme.colorScheme.error,
                modifier = Modifier.size(64.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "No Internet Connection",
                style = MaterialTheme.typography.titleLarge,
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Please check your network settings and try again.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.LightGray,
                textAlign = TextAlign.Center
            )
        }
    }
}