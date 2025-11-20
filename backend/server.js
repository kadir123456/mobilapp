// backend/server.js
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const { google } = require('googleapis');

require('dotenv').config();

// Firebase Admin SDK'sını başlat
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(express.json());
app.use(cors());

// SKU'dan kredi miktarını bul
const SKU_TO_CREDITS = {
    'futbol_analiz_10_credits': 10,
    'futbol_analiz_25_credits': 25,
    'futbol_analiz_60_credits': 60,
    'futbol_analiz_150_credits': 150
};

// Google Play Developer API Client oluştur
const getGooglePlayClient = () => {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON),
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    
    return google.androidpublisher({
        version: 'v3',
        auth: auth,
    });
};

// Google Play satın alma doğrulama endpoint'i
app.post('/api/googleplay/verify', async (req, res) => {
    const { purchaseToken, productId, userId, userEmail } = req.body;
    
    console.log('Google Play doğrulama isteği:', { productId, userId });

    // Gerekli alanları kontrol et
    if (!purchaseToken || !productId || !userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Eksik parametreler' 
        });
    }

    try {
        // 1. Google Play'den satın almayı doğrula
        const androidPublisher = getGooglePlayClient();
        const packageName = process.env.ANDROID_PACKAGE_NAME; // com.yourcompany.futbolanaliz
        
        const purchase = await androidPublisher.purchases.products.get({
            packageName: packageName,
            productId: productId,
            token: purchaseToken,
        });

        const purchaseData = purchase.data;
        
        // 2. Satın alma durumunu kontrol et
        // purchaseState: 0 = satın alındı, 1 = iptal edildi
        if (purchaseData.purchaseState !== 0) {
            console.log('Satın alma geçerli değil:', purchaseData.purchaseState);
            return res.status(400).json({ 
                success: false, 
                error: 'Satın alma geçerli değil' 
            });
        }

        // 3. Satın alma daha önce kullanıldı mı kontrol et
        const purchaseRef = db.collection('purchases').doc(purchaseToken);
        const purchaseDoc = await purchaseRef.get();
        
        if (purchaseDoc.exists) {
            console.log('Bu satın alma daha önce kullanıldı');
            return res.status(400).json({ 
                success: false, 
                error: 'Bu satın alma zaten kullanıldı' 
            });
        }

        // 4. Kredi miktarını belirle
        const creditsToAdd = SKU_TO_CREDITS[productId];
        if (!creditsToAdd) {
            console.error('Geçersiz ürün ID:', productId);
            return res.status(400).json({ 
                success: false, 
                error: 'Geçersiz ürün' 
            });
        }

        // 5. Firestore Transaction ile krediyi ekle
        const userRef = db.collection('users').doc(userId);
        
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            
            if (!userDoc.exists) {
                throw new Error('Kullanıcı bulunamadı');
            }

            const currentCredits = userDoc.data().credits || 0;
            const newCredits = currentCredits + creditsToAdd;
            
            // Kullanıcıya kredi ekle
            transaction.update(userRef, { 
                credits: newCredits,
                lastPurchaseDate: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // Satın almayı kaydet (tekrar kullanımı önlemek için)
            transaction.set(purchaseRef, {
                userId,
                userEmail,
                productId,
                creditsAdded: creditsToAdd,
                purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
                orderId: purchaseData.orderId
            });
        });

        console.log(`Başarılı: ${creditsToAdd} kredi, ${userId} kullanıcısına eklendi`);
        
        res.json({ 
            success: true, 
            credits: creditsToAdd,
            message: 'Krediler başarıyla eklendi'
        });

    } catch (error) {
        console.error('Google Play doğrulama hatası:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Doğrulama başarısız',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server ${PORT} portunda çalışıyor...`);
});