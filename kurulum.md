# 🚀 Google Play In-App Purchase Kurulum Rehberi

## 📱 1. Google Play Console Ayarları

### A. Uygulama Oluşturma
1. [Google Play Console](https://play.google.com/console)'a giriş yapın
2. "Uygulama oluştur" butonuna tıklayın
3. Uygulama adı: **AI Futbol Analiz Uzmanı**
4. Paket adı: `com.yourcompany.futbolanaliz` (bu ismi değiştirin!)

### B. Uygulama İçi Ürünler Oluşturma
1. Sol menüden **"Monetize" > "Products" > "In-app products"** seçin
2. Her paket için ürün oluşturun:

#### Paket 1: Başlangıç
- Ürün ID: `futbol_analiz_10_credits`
- Ad: "10 Kredi"
- Açıklama: "10 analiz yapabilirsiniz"
- Fiyat: 149,99 TL

#### Paket 2: Standart (Popüler)
- Ürün ID: `futbol_analiz_25_credits`
- Ad: "25 Kredi"
- Açıklama: "25 analiz yapabilirsiniz"
- Fiyat: 299,99 TL

#### Paket 3: Profesyonel
- Ürün ID: `futbol_analiz_60_credits`
- Ad: "60 Kredi"
- Açıklama: "60 analiz yapabilirsiniz"
- Fiyat: 599,99 TL

#### Paket 4: Expert
- Ürün ID: `futbol_analiz_150_credits`
- Ad: "150 Kredi"
- Açıklama: "150 analiz yapabilirsiniz"
- Fiyat: 1.199,99 TL

### C. Service Account Oluşturma
1. [Google Cloud Console](https://console.cloud.google.com)'a gidin
2. Proje seçin veya yeni oluşturun
3. **"IAM & Admin" > "Service Accounts"** seçin
4. "Create Service Account" tıklayın:
   - İsim: `futbol-analiz-backend`
   - Açıklama: "Backend için Google Play doğrulama"
5. Role: **"Service Account User"** ekleyin
6. JSON key oluşturun ve indirin
7. Google Play Console'da:
   - **"Setup" > "API access"** seçin
   - Service Account'u bağlayın
   - **"Financial data"** iznini verin

---

## 🔧 2. Backend Kurulumu

### A. Environment Variables Ekle (Render.com)
```env
# Firebase Service Account (Mevcut)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Google Play Service Account (YENİ)
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Android Paket Adı (YENİ)
ANDROID_PACKAGE_NAME=com.yourcompany.futbolanaliz

# Port
PORT=3001
```

### B. Backend Güncelleme
```bash
cd backend
npm install googleapis
npm start
```

---

## 📲 3. Android Uygulama Kurulumu

### A. Proje Yapısı
```
android-app/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/yourcompany/futbolanaliz/
│   │       │   └── MainActivity.kt
│   │       ├── res/
│   │       │   └── layout/
│   │       │       └── activity_main.xml
│   │       └── AndroidManifest.xml
│   └── build.gradle
├── gradle/
└── build.gradle
```

### B. activity_main.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### C. AndroidManifest.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FutbolAnaliz"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

### D. Build ve Yayınlama
```bash
# Debug APK oluştur (Test için)
./gradlew assembleDebug

# Release AAB oluştur (Google Play için)
./gradlew bundleRelease
```

---

## 🔄 4. Frontend Güncelleme

### Dashboard.tsx'de Import Değişikliği
```typescript
// ESKİ
import ShopierPaymentModal from '../components/ShopierPaymentModal';

// YENİ
import GooglePlayPaymentModal from '../components/GooglePlayPaymentModal';
```

```typescript
// ESKİ
<ShopierPaymentModal 
  isOpen={isPaymentModalOpen}
  onClose={() => setIsPaymentModalOpen(false)}
/>

// YENİ
<GooglePlayPaymentModal 
  isOpen={isPaymentModalOpen}
  onClose={() => setIsPaymentModalOpen(false)}
/>
```

---

## ✅ 5. Test Adımları

### A. Test Kullanıcıları Ekle
1. Google Play Console'da **"Setup" > "License testing"**
2. Test e-posta adreslerini ekleyin
3. Test ürünleri "Licensed" olarak işaretleyin

### B. Test Senaryosu
1. ✅ Uygulamayı test cihazına yükle
2. ✅ Test kullanıcısı ile giriş yap
3. ✅ Kredi satın al butonuna tıkla
4. ✅ Google Play ödeme ekranı açılsın
5. ✅ Test kartı ile ödeme yap
6. ✅ Krediler otomatik eklensin
7. ✅ Toast mesajı gösterilsin

### C. Backend Logs Kontrolü
```bash
# Render.com'da
heroku logs --tail --app your-backend-name

# Veya Render.com dashboard'dan "Logs" sekmesi
```

---

## 🔐 6. Güvenlik Kontrol Listesi

- ✅ Service Account JSON dosyalarını **ASLA** GitHub'a push etmeyin
- ✅ `.gitignore` içinde `.env` ve `*.json` olsun
- ✅ Backend'de purchase token'ları kontrol edin (tekrar kullanım önleme)
- ✅ Frontend'de AndroidBridge kontrolü yapın
- ✅ ProGuard kurallarını ekleyin (release build için)

---

## 📊 7. Google Play Release Checklist

### İlk Yayınlama
- [ ] Uygulama ikonu (512x512 PNG)
- [ ] Ekran görüntüleri (en az 2 adet)
- [ ] Uygulama açıklaması
- [ ] Gizlilik politikası URL'i
- [ ] Content rating anketi
- [ ] APK/AAB yükleme
- [ ] Pricing: Free (uygulama içi satın alma var)

### Store Listing
**Başlık**: AI Futbol Analiz Uzmanı
**Kısa Açıklama**: Yapay zeka ile futbol maçı analizi ve tahmin
**Tam Açıklama**:
```
🎯 AI Futbol Analiz Uzmanı ile maç bültenlerinizi analiz edin!

✨ Özellikler:
• Yapay zeka destekli maç analizi
• Canlı istatistikler
• Detaylı tahminler
• Güvenli ödeme (Google Play)

Kredi satın alın ve analizlerinizi hemen başlatın!
```

---

## 🆘 Sorun Giderme

### Problem 1: "Billing client bağlanamıyor"
**Çözüm**: 
- Google Play Console'da uygulamanın yayında olduğundan emin olun
- Test lisansı eklenmiş mi kontrol edin

### Problem 2: "Ürün bulunamadı"
**Çözüm**:
- Ürün ID'lerinin doğru olduğunu kontrol edin
- Ürünlerin "Active" durumda olduğunu doğrulayın

### Problem 3: "Backend doğrulama başarısız"
**Çözüm**:
- Service Account'un doğru izinlere sahip olduğunu kontrol edin
- Backend URL'inin doğru olduğundan emin olun
- Backend logs kontrol edin

---

## 📞 İletişim

Backend URL: `https://your-backend-url.com`
Frontend URL: `https://your-frontend-url.com`

**ÖNEMLİ**: Tüm URL'leri kendi domain'lerinizle değiştirin!