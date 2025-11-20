
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { shopierPackages, redirectToPayment } from '../services/shopierService';

interface ShopierPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShopierPaymentModal: React.FC<ShopierPaymentModalProps> = ({ isOpen, onClose }) => {
  const { user, userData } = useAuth();

  if (!isOpen) return null;

  const handlePurchase = (pkg: typeof shopierPackages[0]) => {
    if (user && userData) {
      redirectToPayment(pkg, user.uid, user.email || '');
    } else {
      console.error("Ödeme yapmak için kullanıcı girişi gereklidir.");
      // Burada kullanıcıya bir uyarı gösterilebilir.
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl p-8 m-4 max-w-2xl w-full border border-gray-700 transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-green-400">Kredi Paketleri</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <p className="text-gray-400 mb-8">
            Analiz yapmak için krediye ihtiyacınız var. Aşağıdaki paketlerden birini seçerek hemen başlayın!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shopierPackages.map((pkg) => (
                <div 
                    key={pkg.id}
                    className={`relative border-2 rounded-lg p-5 flex flex-col justify-between transition-all duration-200 ${pkg.popular ? 'border-green-500 bg-gray-700/50' : 'border-gray-600'}`}
                >
                    {pkg.popular && (
                        <div className="absolute -top-3.5 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">POPÜLER</div>
                    )}
                    <div className="flex-grow">
                        <h3 className="text-2xl font-semibold text-white">{pkg.name}</h3>
                        <p className="text-4xl font-bold text-green-400 my-3">{pkg.credits} <span className="text-xl text-gray-300">Kredi</span></p>
                        <p className="text-gray-400 text-lg font-medium">{pkg.price} TL</p>
                    </div>
                    <button 
                      onClick={() => handlePurchase(pkg)}
                      className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                    >
                      Satın Al
                    </button>
                </div>
            ))}
        </div>
        
        <div className="text-center mt-6 text-xs text-gray-500">
            <p>Ödemeleriniz Shopier güvencesiyle işlenmektedir.</p>
        </div>
      </div>
    </div>
  );
};

export default ShopierPaymentModal;