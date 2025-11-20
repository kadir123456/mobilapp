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
      await deductCredit(user.uid);
      
      setLoadingMessage("Maçlar bültenden okunuyor...");
      const matchStrings = await extractMatchesFromImage(uploadedImage, mimeType);
      
      if (matchStrings.length === 0) {
        throw new Error("Görselden okunabilir maç bulunamadı. Lütfen daha net bir görsel deneyin.");
      }

      setLoadingMessage(`${matchStrings.length} maç için veriler çekiliyor...`);
      const matchDataPromises = matchStrings.map(m => fetchMatchData(m));
      const structuredData = (await Promise.all(matchDataPromises)).filter(d => d !== null);

      if (structuredData.length === 0) {
        throw new Error("Maçlar için istatistik verileri çekilemedi. Lütfen sonra tekrar deneyin.");
      }

      setLoadingMessage("Veriler AI ile yorumlanıyor...");
      const results = await getAnalysisFromStructuredData(structuredData, selectedBetType);
      
      if (results.length === 0) {
        setError("Analiz edilecek maç bulunamadı. Lütfen sonra tekrar deneyin.");
      } else {
        setAnalysisResults(results);
        await saveAnalysisToHistory(user.uid, results, selectedBetType);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Analiz sırasında hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, selectedBetType, mimeType, userCredits, user]);

  const isAnalyzeButtonDisabled = !uploadedImage || !selectedBetType || isLoading;

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 text-center mb-2">
              AI Futbol Analiz
            </h1>
            
            {/* Top Bar */}
            <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
              <button 
                onClick={signOutUser} 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors"
              >
                Çıkış
              </button>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 px-2 py-1.5 rounded-lg">
                  <WalletIcon className="w-4 h-4 text-green-400" />
                  <span className="font-bold text-green-400">{authLoading ? '...' : userCredits}</span>
                </div>
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap"
                >
                  Kredi Al
                </button>
              </div>
            </div>
          </header>

          <main className="p-4 pb-24">
            {/* Upload Section */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 mb-4">
              <h2 className="text-lg font-semibold mb-3 text-green-400">1. Bülten Yükle</h2>
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>

            {/* Bet Type Section */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 mb-4">
              <h2 className="text-lg font-semibold mb-3 text-green-400">2. Bahis Türü</h2>
              <BetTypeSelector 
                selectedBetType={selectedBetType} 
                onSelectBetType={setSelectedBetType} 
                disabled={!uploadedImage} 
              />
            </div>

            {/* Results Section */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 mb-4">
              <h2 className="text-lg font-semibold mb-3 text-green-400">3. Sonuçlar</h2>
              <div className="min-h-[200px] flex flex-col items-center justify-center">
                {isLoading ? (
                  <Loader />
                ) : error ? (
                  <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg w-full">
                    <h3 className="font-bold text-base mb-1">Hata!</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : analysisResults.length > 0 ? (
                  <div className="w-full space-y-3">
                    {analysisResults.map((result, index) => (
                      <AnalysisResultCard key={index} result={result} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm">
                    <p>Sonuçlar burada görünecek</p>
                  </div>
                )}
              </div>
            </div>

            {/* History Button */}
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors mb-3"
            >
              Geçmiş Analizlerim
            </button>
          </main>

          {/* Fixed Bottom Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzeButtonDisabled}
              className={`w-full flex items-center justify-center gap-2 text-base font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg
                ${isAnalyzeButtonDisabled 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : userCredits > 0 
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
            >
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm sm:text-base">
                {isLoading 
                  ? loadingMessage
                  : userCredits > 0 
                    ? 'Analizi Başlat (1 Kredi)' 
                    : 'Kredi Satın Al'}
              </span>
            </button>
          </div>
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