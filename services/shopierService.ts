
// Fiyatlandırma, Render.com (25$/ay) ve Gemini API maliyetleri göz önünde bulundurularak güncellenmiştir.
// DİKKAT: Bu URL'ler Shopier panelinizde oluşturduğunuz ürünlere ait olmalıdır.
export const shopierPackages = [
    { id: 'pkg_1', name: 'Başlangıç', credits: 10, price: 150, shopierUrl: 'https://www.shopier.com/bilwininc/example1', popular: false },
    { id: 'pkg_2', name: 'Standart', credits: 25, price: 300, shopierUrl: 'https://www.shopier.com/bilwininc/example2', popular: true },
    { id: 'pkg_3', name: 'Profesyonel', credits: 60, price: 600, shopierUrl: 'https://www.shopier.com/bilwininc/example3', popular: false },
    { id: 'pkg_4', name: 'Expert', credits: 150, price: 1200, shopierUrl: 'https://www.shopier.com/bilwininc/example4', popular: false },
];

interface Package {
    id: string;
    credits: number;
    price: number;
    shopierUrl: string;
}

/**
 * Kullanıcıyı Shopier ödeme sayfasına yönlendirir.
 * Ödeme sonrası callback'in doğru çalışabilmesi için
 * backend'de kullanıcıyı tanıyabilmek amacıyla gerekli bilgileri localStorage'a kaydeder.
 * @param pkg Seçilen kredi paketi
 * @param userId Firebase kullanıcı ID'si
 * @param userEmail Kullanıcının e-posta adresi
 */
export const redirectToPayment = (pkg: Package, userId: string, userEmail: string) => {
    // Backend'in callback'te hangi işlemi tamamlayacağını bilmesi için
    // geçici bilgi saklama. Gerçek bir senaryoda bu bilgi daha güvenli
    // bir yöntemle (örn: backend'de bir "pending_payments" koleksiyonu) tutulabilir.
    const paymentInfo = {
        packageId: pkg.id,
        userId,
        userEmail,
        credits: pkg.credits,
        price: pkg.price,
        timestamp: Date.now(),
    };
    localStorage.setItem('pending_payment', JSON.stringify(paymentInfo));
    
    // Shopier sayfasına e-posta ve isim gibi bilgileri önceden doldurmak için
    // URL'e parametre olarak ekleyebilirsiniz. Bu, Shopier'in desteklediği bir özelliktir.
    // Örnek: &buyer_email=...
    const shopierUrlWithParams = `${pkg.shopierUrl}?buyer_email=${encodeURIComponent(userEmail)}`;

    window.location.href = shopierUrlWithParams;
};