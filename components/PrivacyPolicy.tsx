
import React from 'react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl p-8 m-4 max-w-2xl w-full border border-gray-700 transform transition-all duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '80vh' }}
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-400">Gizlilik Politikası ve Kullanım Koşulları</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="text-gray-300 overflow-y-auto pr-4 space-y-4 text-sm">
          <p><strong>Son Güncelleme: [Tarih]</strong></p>
          
          <p>Bu platformu kullanarak, aşağıda belirtilen şartları ve gizlilik politikasını kabul etmiş olursunuz.</p>
          
          <h3 className="text-lg font-semibold text-green-300 mt-4">1. Veri Toplama</h3>
          <p>Kayıt sırasında e-posta adresiniz gibi kişisel bilgileri topluyoruz. Bu bilgiler, hesabınızı yönetmek ve hizmetlerimizi sunmak için kullanılır. Ödeme işlemleriniz Shopier tarafından güvenli bir şekilde işlenir, biz kredi kartı bilgilerinizi saklamayız.</p>
          
          <h3 className="text-lg font-semibold text-green-300 mt-4">2. Veri Kullanımı</h3>
          <p>Toplanan veriler, hizmet kalitesini artırmak, kullanıcı deneyimini kişiselleştirmek ve destek sağlamak amacıyla kullanılır. Bilgileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.</p>
          
          <h3 className="text-lg font-semibold text-green-300 mt-4">3. Sorumluluk Reddi</h3>
          <p>Uygulamamız tarafından sunulan futbol analizleri ve tahminleri, yapay zeka tarafından istatistiksel verilere dayalı olarak üretilir ve yalnızca bilgilendirme ve eğlence amaçlıdır. Tahminlerin doğruluğu garanti edilmez. Bahis oynamak risk içerir ve tüm sorumluluk kullanıcıya aittir. Finansal kayıplardan platformumuz sorumlu tutulamaz.</p>
          
           <h3 className="text-lg font-semibold text-green-300 mt-4">4. Hizmet Değişiklikleri</h3>
          <p>Hizmet şartlarını ve fiyatlandırmayı önceden haber vermeksizin değiştirme hakkını saklı tutarız.</p>

          <p className="mt-6">Sorularınız için [email@example.com] adresinden bizimle iletişime geçebilirsiniz.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;