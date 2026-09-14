package com.example

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
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

class MainActivity : ComponentActivity() {
  private lateinit var webView: WebView

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    webView = WebView(this).apply {
      setBackgroundColor(Color.parseColor("#132242"))
      // Enforce software rendering layer to avoid Mesa DRI / rendernode missing errors in virtualized environments
      setLayerType(View.LAYER_TYPE_SOFTWARE, null)

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
}

