package com.example

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import java.io.File

class MainActivity : ComponentActivity() {
  private lateinit var webView: WebView

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Disable hardware acceleration on the window to eliminate Mesa rendernode errors in virtualized environments
    window.clearFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED)

    // Clean up any stale or corrupted Chromium HTTP Cache directory from previous builds/crashes
    cleanStaleChromiumCache()

    webView = WebView(this).apply {
      setBackgroundColor(Color.parseColor("#132242"))
      // Enforce software rendering layer to avoid Mesa DRI / rendernode missing errors in virtualized environments
      setLayerType(View.LAYER_TYPE_SOFTWARE, null)

      // Clear any invalid cached entries to ensure Chromium's simple cache initializes cleanly
      clearCache(false)

      settings.apply {
        javaScriptEnabled = true
        domStorageEnabled = true
        databaseEnabled = true
        allowFileAccess = true
        @Suppress("DEPRECATION")
        allowFileAccessFromFileURLs = true
        @Suppress("DEPRECATION")
        allowUniversalAccessFromFileURLs = true
        loadWithOverviewMode = true
        useWideViewPort = true
        cacheMode = WebSettings.LOAD_DEFAULT
        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        javaScriptCanOpenWindowsAutomatically = true
      }

      webViewClient = object : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
          val url = request?.url?.toString() ?: return false
          if (url.startsWith("http://") || url.startsWith("https://")) {
            try {
              val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
              startActivity(intent)
              return true
            } catch (e: Exception) {
              Log.e("MainActivity", "Failed to launch external URL: $url", e)
            }
          }
          return false
        }

        override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
          Log.w("MainActivity", "WebView resource error: ${error?.description} for ${request?.url}")
        }
      }

      webChromeClient = object : WebChromeClient() {
        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
          Log.d("NotesWallahJS", "${consoleMessage?.message()} [${consoleMessage?.sourceId()}:${consoleMessage?.lineNumber()}]")
          return true
        }
      }

      loadUrl("file:///android_asset/index.html")
    }

    setContentView(webView)

    ViewCompat.setOnApplyWindowInsetsListener(webView) { view, insets ->
      val statusBars = insets.getInsets(WindowInsetsCompat.Type.statusBars())
      val navBars = insets.getInsets(WindowInsetsCompat.Type.navigationBars())
      view.setPadding(0, statusBars.top, 0, navBars.bottom)
      insets
    }

    onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        if (webView.canGoBack()) {
          webView.goBack()
        } else {
          isEnabled = false
          onBackPressedDispatcher.onBackPressed()
        }
      }
    })
  }

  private fun cleanStaleChromiumCache() {
    try {
      val cacheDirs = listOf(
        File(cacheDir, "WebView/Default/HTTP Cache"),
        File(cacheDir, "app_webview/Default/HTTP Cache"),
        File(cacheDir, "org.chromium.android_webview")
      )
      for (dir in cacheDirs) {
        if (dir.exists()) {
          val fakeIndex = File(dir, "index")
          if (!fakeIndex.exists() || fakeIndex.length() == 0L) {
            dir.deleteRecursively()
          }
        }
      }
    } catch (e: Exception) {
      Log.w("MainActivity", "Cache check warning: ${e.message}")
    }
  }
}

