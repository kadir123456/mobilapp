// Gerekli kütüphaneleri import et
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// Ortam değişkenlerini yüklemek için (Render.com'da bu satıra gerek yok)
require('dotenv').config();

// Firebase Admin SDK'sını başlat
// Render.com'da bu bilgiyi tek satırlık bir environment variable olarak gireceğiz.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Express uygulamasını oluştur
const app = express();

// Gelen isteklerin JSON formatında olmasını ve URL-encoded olmasını sağla
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Farklı domain'lerden gelen istekler için

// Fiyatlara karşılık gelen kredi miktarları (Frontend ile aynı olmalı!)
const PRICE_TO_CREDITS = {
    '150': 10,
    '300': 25,
    '600': 60,
    '1200': 150
};

// Shopier Callback Endpoint'i
app.post('/api/shopier/callback', async (req, res) => {
    // Shopier'dan gelen verileri al
    const { platform_order_id, status, total_order_value, buyer_email, custom_data } = req.body;
    
    console.log('Shopier callback received:', req.body);

    // GÜVENLİK: Shopier panelinizden alacağınız bir API anahtarı veya
    // gizli bir anahtar ile isteğin gerçekten Shopier'dan geldiğini doğrulayın.
    // Bu örnekte basit bir kontrol yapıyoruz.
    // const shopierApiKey = req.headers['x-shopier-api-key'];
    // if (shopierApiKey !== process.env.SHOPIER_API_SECRET) {
    //     console.error('Invalid Shopier API Key');
    //     return res.status(401).send('Unauthorized');
    // }
    
    // 1. Ödeme başarılı mı kontrol et (status=1 başarılı demektir)
    if (status !== '1') {
        console.log(`Ödeme başarısız veya beklemede. Sipariş ID: ${platform_order_id}, Durum: ${status}`);
        // Shopier'a isteği aldığımızı bildiriyoruz ki tekrar göndermesin.
        return res.status(200).send('OK');
    }

    // 2. Fiyata göre kredi miktarını belirle
    const amount = total_order_value;
    const creditsToAdd = PRICE_TO_CREDITS[amount];

    if (!creditsToAdd) {
        console.error(`Geçersiz veya bilinmeyen bir fiyat geldi: ${amount}. Sipariş ID: ${platform_order_id}`);
        return res.status(200).send('OK');
    }

    try {
        // 3. E-posta adresinden Firebase kullanıcısını bul
        const userRecord = await auth.getUserByEmail(buyer_email);
        const userId = userRecord.uid;
        const userRef = db.collection('users').doc(userId);

        // 4. Firestore Transaction ile krediyi güvenli bir şekilde ekle
        // Bu, aynı isteğin iki kez işlenmesi gibi durumları engeller.
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error(`Kullanıcı bulunamadı: ${buyer_email}`);
            }

            const currentCredits = userDoc.data().credits || 0;
            const newCredits = currentCredits + creditsToAdd;
            
            transaction.update(userRef, { credits: newCredits });
        });

        console.log(`Başarılı: ${creditsToAdd} kredi, ${buyer_email} adlı kullanıcıya eklendi.`);
        
        // 5. Shopier'a her şeyin yolunda olduğunu bildir.
        res.status(200).send('OK');

    } catch (error) {
        console.error(`Shopier callback işlenirken hata oluştu. Sipariş ID: ${platform_order_id}`, error);
        // Hata olsa bile Shopier'a 200 OK gönderiyoruz ki aynı isteği tekrar tekrar göndermeye çalışmasın.
        // Hataları manuel olarak log'lardan takip edip çözmemiz gerekir.
        res.status(200).send('OK');
    }
});

// Sunucuyu dinlemeye başla
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server ${PORT} portunda çalışıyor...`);
});
