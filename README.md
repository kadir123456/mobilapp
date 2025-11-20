# AI Futbol Analiz Uzmanı

Bu proje, kullanıcıların futbol maçı bültenlerinin görsellerini yükleyerek, seçtikleri bahis türüne göre yapay zeka destekli, derinlemesine istatistiksel analizler ve tahminler almasını sağlayan modern bir web uygulamasıdır.

## ✨ Özellikler

- **Hibrit Analiz Motoru:** Google Gemini ile görselden maç tespiti ve `api-football.com`'dan çekilen canlı verilerin yine Gemini ile yorumlanması.
- **Kullanıcı Yönetimi:** Firebase Authentication ile güvenli kayıt olma ve giriş yapma.
- **Kredi Sistemi:** Kullanıcıların analiz yapabilmesi için kredi sistemi.
- **Ödeme Entegrasyonu:** Shopier ile otomatik kredi satışı (Frontend + Güvenli Backend Callback).
- **Analiz Geçmişi:** Yapılan tüm analizlerin kullanıcıya özel olarak saklanması ve görüntülenebilmesi.
- **Mobil Uyumlu Arayüz:** Tüm cihazlarda sorunsuz çalışan modern ve kullanıcı dostu tasarım.
- **Render.com Uyumlu:** Frontend ve Backend servisleri, Render.com üzerinde kolayca dağıtılabilecek şekilde yapılandırılmıştır.

## 🛠️ Teknoloji Stack'i

- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Express.js
- **Veritabanı & Kimlik Doğrulama:** Google Firebase (Authentication, Firestore)
- **AI Servisleri:** Google Gemini API
- **Futbol Veri API'si:** api-football.com
- **Ödeme Altyapısı:** Shopier
- **Hosting:** Render.com

## 📁 Proje Yapısı

```
.
├── backend/
│   ├── server.js           # Shopier callback'ini işleyen Express sunucusu
│   ├── package.json        # Backend bağımlılıkları
│   └── .env.example        # Backend ortam değişkenleri
│
├── src/
│   ├── components/         # Tekrar kullanılabilir React bileşenleri
│   ├── contexts/           # React Context (AuthContext)
│   ├── firebase/           # Firebase yapılandırma ve servisleri
│   ├── hooks/              # Özel React hook'ları (useAuth)
│   ├── pages/              # Ana sayfa bileşenleri (Dashboard)
│   ├── services/           # API servisleri (Gemini, Football, Shopier)
│   ├── App.tsx             # Ana uygulama bileşeni ve yönlendirici
│   └── index.tsx           # React başlangıç noktası
│
├── index.html              # Ana HTML dosyası
├── vite.config.ts          # Vite yapılandırma dosyası
├── README.md               # Proje açıklaması (bu dosya)
└── package.json            # Frontend bağımlılıkları
```

## ⚙️ Kurulum ve Yerel Çalıştırma

1.  **Projeyi Klonla:**
    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```

2.  **Frontend Bağımlılıklarını Yükle:**
    ```bash
    npm install
    ```

3.  **Backend Bağımlılıklarını Yükle:**
    ```bash
    cd backend
    npm install
    cd ..
    ```

4.  **Ortam Değişkenlerini Ayarla:**
    - Proje ana dizininde `.env` adında bir dosya oluştur ve aşağıdaki `Frontend Ortam Değişkenleri`'ni ekle.
    - `backend/` klasörü içinde `.env` adında bir dosya oluştur ve aşağıdaki `Backend Ortam Değişkenleri`'ni ekle.

5.  **Uygulamayı Başlat:**
    - **Frontend'i başlat:** `npm run dev` (Genellikle `http://localhost:5173` adresinde çalışır)
    - **Backend'i başlat:** `cd backend` ve `npm start` (Genellikle `http://localhost:3001` adresinde çalışır)

## 🔑 Ortam Değişkenleri (Environment Variables)

Bu değişkenleri Render.com'daki servislerinizin "Environment" bölümüne eklemeniz gerekmektedir.

### Frontend (.env)

```
# Firebase Proje Ayarları > Genel'den alınacak
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_firebase_app_id"

# Google AI Studio'dan alınacak
VITE_GEMINI_API_KEY="your_gemini_api_key"

# api-football.com'dan alınacak
VITE_FOOTBALL_API_KEY="your_api_football_key"
```

### Backend (backend/.env)

```
# Firebase Proje Ayarları > Hizmet Hesapları'ndan oluşturulan JSON dosyasının tek satırlık hali
FIREBASE_SERVICE_ACCOUNT_JSON='{"type": "service_account", "project_id": "...", ...}'

# Shopier Panelinizdeki API Bilgileri bölümünden alacağınız API KULLANICI ADI
SHOPIER_API_USER="your_shopier_api_user"

# Sunucunun çalışacağı port (Render.com otomatik ayarlar)
# PORT=3001
```