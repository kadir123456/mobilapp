// components/GooglePlayPaymentModal.tsx
import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { creditPackages, purchasePackage, initializePurchaseListener } from '../services/googlePlayService';

interface GooglePlayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GooglePlayPaymentModal: React.FC<GooglePlayPaymentModalProps> = ({ isOpen, onClose }) => {
  const { user, userData } = useAuth();

  useEffect(() => {
    // Satın alma tamamlandığında tetiklenir
    const handlePurchaseComplete = (success: boolean, credits: number) => {
      if (success) {
        alert(`Tebrikler! ${credits} kredi hesabınıza eklendi.`);
        onClose();
      } else {
        alert('Satın alma iptal edildi veya başarısız oldu.');
      }
    };

    initializePurchaseListener(handlePurchaseComplete);
  }, [onClose]);

  if (!isOpen) return null;

  const handlePurchase = (pkg: typeof creditPackages[0]) => {
    if (user && userData) {
      purchasePackage(pkg, user.uid, user.email || '');
    } else {
      alert('Satın alma yapmak için lütfen giriş yapın.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-400">Kredi Paketleri</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <p className="text-gray-400 mb-6 text-sm sm:text-base">
          Analiz yapmak için kredi satın alın. Güvenli ödeme Google Play üzerinden yapılır.
        </p>

        <div className="space-y-3">
          {creditPackages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`relative border-2 rounded-lg p-4 transition-all duration-200 ${
                pkg.popular 
                  ? 'border-green-500 bg-gray-700/50 shadow-lg' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2.5 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  ⭐ POPÜLER
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-white">{pkg.name}</h3>
                  <p className="text-2xl font-bold text-green-400 my-1">
                    {pkg.credits} <span className="text-base text-gray-300">Kredi</span>
                  </p>
                  <p className="text-gray-400 text-base font-medium">{pkg.price}</p>
                </div>
                
                <button 
                  onClick={() => handlePurchase(pkg)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors duration-300 whitespace-nowrap ml-4"
                >
                  Satın Al
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          <p>🔒 Güvenli ödeme Google Play tarafından sağlanır</p>
          <p>💳 Google Play hesabınızdan ücretlendirilir</p>
          <p>✅ Krediler anında hesabınıza eklenir</p>
        </div>
      </div>
    </div>
  );
};

export default GooglePlayPaymentModal;