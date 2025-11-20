import React, { useState, useCallback } from 'react';
import type { MatchAnalysis, BetType } from '../types';
import { extractMatchesFromImage, getAnalysisFromStructuredData } from '../services/geminiService';
import { fetchMatchData } from '../services/footballApiService';
import { deductCredit, saveAnalysisToHistory } from '../firebase/authService';
import ImageUploader from '../components/ImageUploader';
import BetTypeSelector from '../components/BetTypeSelector';
import AnalysisResultCard from '../components/AnalysisResultCard';
import Loader from '../components/Loader';
import ShopierPaymentModal from '../components/ShopierPaymentModal';
import HistoryModal from '../components/HistoryModal';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { WalletIcon } from '../components/icons/WalletIcon';
import { useAuth } from '../hooks/useAuth';
import { signOutUser } from '../firebase/authService';

interface DashboardProps {
  onOpenPrivacyPolicy: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onOpenPrivacyPolicy }) => {
  const { user, userData, loading: authLoading } = useAuth();

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<BetType | null>(null);
  const [analysisResults, setAnalysisResults] = useState<MatchAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Analiz ediliyor...');
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  const userCredits = userData?.credits ?? 0;

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage((reader.result as string).split(',')[1]);
      setMimeType(file.type);
      setAnalysisResults([]);
      setError(null);
    };
    reader.onerror = () => {
      setError("Görsel okunurken bir hata oluştu.");
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!user) {
        setError("Analiz yapmak için lütfen tekrar giriş yapın.");
        return;
    }

    if (userCredits < 1) {
      setError("Analiz yapmak için yeterli krediniz bulunmuyor.");
      setIsPaymentModalOpen(true);
      return;
    }

    if (!uploadedImage || !selectedBetType || !mimeType) {
      setError("Lütfen bir görsel yükleyin ve bahis türü seçin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResults([]);

    try {
      // 0. Krediyi en başta düşür
      await deductCredit(user.uid);
      
      // 1. Adım: Görselden maçları tespit et
      setLoadingMessage("Maçlar bültenden okunuyor...");
      const matchStrings = await extractMatchesFromImage(uploadedImage, mimeType);
      if (matchStrings.length === 0) {
        throw new Error("Görselden okunabilir maç bulunamadı. Lütfen daha net bir görsel deneyin.");
      }

      // 2. Adım: Her maç için Futbol API'sinden canlı verileri çek
      setLoadingMessage(`(${matchStrings.length}) maç için canlı veriler çekiliyor...`);
      const matchDataPromises = matchStrings.map(fetchMatchData);
      const structuredData = (await Promise.all(matchDataPromises)).filter(Boolean);

      if (structuredData.length === 0) {
        throw new Error("Maçlar için canlı istatistik verileri çekilemedi. Lütfen daha sonra tekrar deneyin.");
      }

      // 3. Adım: Çekilen verilerle Gemini'den nihai analizi al
      setLoadingMessage("Veriler yapay zeka ile yorumlanıyor...");
      // @ts-ignore
      const results = await getAnalysisFromStructuredData(structuredData, selectedBetType);
      
      if (results.length === 0) {
        setError("Analiz edilecek maç bulunamadı veya veriler yetersiz. Lütfen daha sonra tekrar deneyin.");
      } else {
        setAnalysisResults(results);
        await saveAnalysisToHistory(user.uid, results, selectedBetType);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Analiz sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, selectedBetType, mimeType, userCredits, user]);

  const isAnalyzeButtonDisabled = !uploadedImage || !selectedBetType || isLoading;

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              AI Futbol Analiz Uzmanı
            </h1>
            <p className="mt-2 text-lg text-gray-400">
              Bülteninizi yükleyin, bahis türünü seçin ve istatistiksel analiz gücünü keşfedin.
            </p>
          </header>

          <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
                <span className="text-gray-400 hidden sm:inline">{user?.email}</span>
                <button onClick={signOutUser} className="text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg transition-colors">Çıkış Yap</button>
            </div>
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Geçmiş Analizlerim
                </button>
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg">
                    <WalletIcon className="w-6 h-6 text-green-400" />
                    <span className="text-lg font-bold">Kredi: <span className="text-green-400">{authLoading ? '...' : userCredits}</span></span>
                </div>
                <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Kredi Satın Al
                </button>
            </div>
          </div>

          <main>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6">
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                  <h2 className="text-2xl font-semibold mb-4 text-green-400">1. Maç Bültenini Yükle</h2>
                  <ImageUploader onImageUpload={handleImageUpload} />
                </div>

                <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                  <h2 className="text-2xl font-semibold mb-4 text-green-400">2. Bahis Türünü Seç</h2>
                  <BetTypeSelector selectedBetType={selectedBetType} onSelectBetType={setSelectedBetType} disabled={!uploadedImage} />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col">
                <h2 className="text-2xl font-semibold mb-4 text-green-400">3. Analiz Sonuçları</h2>
                <div className="flex-grow flex flex-col items-center justify-center">
                  {isLoading ? (
                    <Loader />
                  ) : error ? (
                    <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
                      <h3 className="font-bold text-lg">Hata!</h3>
                      <p>{error}</p>
                    </div>
                  ) : analysisResults.length > 0 ? (
                    <div className="w-full space-y-4 overflow-y-auto max-h-[calc(100vh-20rem)] pr-2">
                      {analysisResults.map((result, index) => (
                        <AnalysisResultCard key={index} result={result} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Analiz sonuçları burada görünecektir.</p>
                      <p>Başlamak için bir görsel yükleyin ve bahis türü seçin.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzeButtonDisabled}
                className={`w-full flex items-center justify-center gap-3 text-lg font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg
                  ${isAnalyzeButtonDisabled 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : userCredits > 0 
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white transform hover:scale-105'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
              >
                <SparklesIcon className="w-6 h-6" />
                <span>
                  {isLoading 
                    ? loadingMessage
                    : userCredits > 0 
                      ? 'Analizi Başlat (1 Kredi)' 
                      : 'Kredi Yetersiz - Satın Al'}
                </span>
              </button>
            </div>
             <footer className="text-center mt-8 text-xs text-gray-500">
                <button onClick={onOpenPrivacyPolicy} className="underline hover:text-green-400">
                    Gizlilik Politikası ve Kullanım Koşulları
                </button>
            </footer>
          </main>
        </div>
      </div>
      <ShopierPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
       <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </>
  );
};

export default Dashboard;
