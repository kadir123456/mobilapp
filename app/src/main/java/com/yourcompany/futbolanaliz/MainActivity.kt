// app/src/main/java/com/yourcompany/futbolanaliz/MainActivity.kt

package com.yourcompany.futbolanaliz

import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.android.billingclient.api.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity(), PurchasesUpdatedListener {

    private lateinit var webView: WebView
    private lateinit var billingClient: BillingClient
    
    // Satın alma bilgileri
    private var currentUserId: String = ""
    private var currentUserEmail: String = ""
    private var currentCredits: Int = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // WebView ayarları
        webView = findViewById(R.id.webview)
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
        }

        // JavaScript Bridge ekle
        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")
        
        // WebView Client ayarla
        webView.webViewClient = WebViewClient()
        
        // Web uygulamasını yükle
        webView.loadUrl("https://your-app-url.com") // Frontend URL'nizi buraya yazın

        // Google Play Billing'i başlat
        setupBillingClient()
    }

    private fun setupBillingClient() {
        billingClient = BillingClient.newBuilder(this)
            .setListener(this)
            .enablePendingPurchases()
            .build()

        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    println("Billing client başarıyla başlatıldı")
                } else {
                    println("Billing hatası: ${billingResult.debugMessage}")
                }
            }

            override fun onBillingServiceDisconnected() {
                println("Billing bağlantısı kesildi, yeniden bağlanılıyor...")
                setupBillingClient()
            }
        })
    }

    // JavaScript'ten çağrılacak fonksiyonlar
    inner class AndroidBridge {
        @JavascriptInterface
        fun startPurchase(sku: String, userId: String, userEmail: String, credits: Int) {
            currentUserId = userId
            currentUserEmail = userEmail
            currentCredits = credits
            
            runOnUiThread {
                launchBillingFlow(sku)
            }
        }
    }

    private fun launchBillingFlow(sku: String) {
        val queryProductDetailsParams = QueryProductDetailsParams.newBuilder()
            .setProductList(
                listOf(
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(sku)
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build()
                )
            )
            .build()

        billingClient.queryProductDetailsAsync(queryProductDetailsParams) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && productDetailsList.isNotEmpty()) {
                val productDetails = productDetailsList[0]
                
                val productDetailsParamsList = listOf(
                    BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(productDetails)
                        .build()
                )

                val billingFlowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(productDetailsParamsList)
                    .build()

                billingClient.launchBillingFlow(this, billingFlowParams)
            } else {
                Toast.makeText(this, "Ürün bulunamadı", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                handlePurchase(purchase)
            }
        } else if (billingResult.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            Toast.makeText(this, "Satın alma iptal edildi", Toast.LENGTH_SHORT).show()
            notifyWebView(false, "")
        } else {
            Toast.makeText(this, "Satın alma başarısız", Toast.LENGTH_SHORT).show()
            notifyWebView(false, "")
        }
    }

    private fun handlePurchase(purchase: Purchase) {
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            // Backend'e doğrulama isteği gönder
            verifyPurchaseWithBackend(purchase)
        }
    }

    private fun verifyPurchaseWithBackend(purchase: Purchase) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL("https://your-backend-url.com/api/googleplay/verify") // Backend URL
                val connection = url.openConnection() as HttpURLConnection
                
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true

                val jsonBody = JSONObject().apply {
                    put("purchaseToken", purchase.purchaseToken)
                    put("productId", purchase.products[0])
                    put("userId", currentUserId)
                    put("userEmail", currentUserEmail)
                }

                connection.outputStream.use { os ->
                    val input = jsonBody.toString().toByteArray(Charsets.UTF_8)
                    os.write(input, 0, input.size)
                }

                val responseCode = connection.responseCode
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    // Başarılı - satın almayı tamamla
                    acknowledgePurchase(purchase)
                    
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            this@MainActivity, 
                            "$currentCredits kredi hesabınıza eklendi!", 
                            Toast.LENGTH_LONG
                        ).show()
                        notifyWebView(true, purchase.products[0])
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            this@MainActivity, 
                            "Doğrulama başarısız", 
                            Toast.LENGTH_SHORT
                        ).show()
                        notifyWebView(false, "")
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@MainActivity, 
                        "Hata: ${e.message}", 
                        Toast.LENGTH_SHORT
                    ).show()
                    notifyWebView(false, "")
                }
            }
        }
    }

    private fun acknowledgePurchase(purchase: Purchase) {
        if (!purchase.isAcknowledged) {
            val acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchase.purchaseToken)
                .build()
                
            billingClient.acknowledgePurchase(acknowledgePurchaseParams) { billingResult ->
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    println("Satın alma onaylandı")
                }
            }
        }
    }

    private fun notifyWebView(success: Boolean, sku: String) {
        runOnUiThread {
            webView.evaluateJavascript(
                "if(window.onPurchaseComplete) window.onPurchaseComplete($success, '$sku');",
                null
            )
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}