
import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail } from '../firebase/authService';
import { SparklesIcon } from './icons/SparklesIcon';

interface AuthFormProps {
  onOpenPrivacyPolicy: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onOpenPrivacyPolicy }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              AI Futbol Analiz Uzmanı
            </h1>
            <p className="mt-2 text-lg text-gray-400">
              {isLogin ? 'Devam etmek için giriş yapın' : 'Hesap oluşturun ve 5 ücretsiz kredi kazanın!'}
            </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta Adresi"
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'İşlem yapılıyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-400 hover:text-green-400">
            {isLogin ? 'Hesabınız yok mu? Kayıt Olun' : 'Zaten bir hesabınız var mı? Giriş Yapın'}
          </button>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">
            <p>
                Kaydolarak <button onClick={onOpenPrivacyPolicy} className="underline hover:text-green-400">Gizlilik Politikamızı</button> ve Kullanım Koşullarını kabul etmiş olursunuz.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;