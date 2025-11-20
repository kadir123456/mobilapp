// services/googlePlayService.ts

export interface CreditPackage {
  id: string;
  sku: string; // Google Play ürün ID'si
  name: string;
  credits: number;
  price: string; // Gösterim için (Google Play'den gelecek)
  popular: boolean;
}

// Google Play Console'da tanımlanacak ürünler
export const creditPackages: CreditPackage[] = [
  { 
    id: 'pkg_1', 
    sku: 'futbol_analiz_10_credits', 
    name: 'Başlangıç', 
    credits: 10, 
    price: '149,99 TL',
    popular: false 
  },
  { 
    id: 'pkg_2', 
    sku: 'futbol_analiz_25_credits', 
    name: 'Standart', 
    credits: 25, 
    price: '299,99 TL',
    popular: true 
  },
  { 
    id: 'pkg_3', 
    sku: 'futbol_analiz_60_credits', 
    name: 'Profesyonel', 
    credits: 60, 
    price: '599,99 TL',
    popular: false 
  },
  { 
    id: 'pkg_4', 
    sku: 'futbol_analiz_150_credits', 
    name: 'Expert', 
    credits: 150, 
    price: '1.199,99 TL',
    popular: false 
  },
];

// SKU'dan kredi sayısını al
export const SKU_TO_CREDITS: { [key: string]: number } = {
  'futbol_analiz_10_credits': 10,
  'futbol_analiz_25_credits': 25,
  'futbol_analiz_60_credits': 60,
  'futbol_analiz_150_credits': 150,
};

// WebView'dan native Android'e mesaj gönder
export const purchasePackage = (pkg: CreditPackage, userId: string, userEmail: string) => {
  if (window.AndroidBridge) {
    // Android WebView Bridge üzerinden satın alma başlat
    window.AndroidBridge.startPurchase(
      pkg.sku, 
      userId, 
      userEmail,
      pkg.credits
    );
  } else {
    console.error('Android Bridge bulunamadı. Uygulama içinde çalıştırın.');
    alert('Bu özellik sadece mobil uygulamada çalışır.');
  }
};

// Android'den gelen satın alma sonucunu dinle
export const initializePurchaseListener = (onPurchaseComplete: (success: boolean, credits: number) => void) => {
  // Android'den JavaScript'e callback
  (window as any).onPurchaseComplete = (success: boolean, sku: string) => {
    const credits = SKU_TO_CREDITS[sku] || 0;
    onPurchaseComplete(success, credits);
  };
};

// TypeScript tanımları
declare global {
  interface Window {
    AndroidBridge?: {
      startPurchase: (sku: string, userId: string, userEmail: string, credits: number) => void;
    };
  }
}