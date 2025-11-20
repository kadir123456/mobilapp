
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAnalysisHistory } from '../firebase/authService';
import type { AnalysisHistoryItem } from '../types';
import AnalysisResultCard from './AnalysisResultCard';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
          const userHistory = await getAnalysisHistory(user.uid);
          setHistory(userHistory);
        } catch (err) {
          setError("Geçmiş analizler yüklenirken bir hata oluştu.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl p-8 m-4 max-w-4xl w-full border border-gray-700 transform transition-all duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-green-400">Geçmiş Analizlerim</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-4">
          {loading ? (
            <div className="text-center text-gray-400">Yükleniyor...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : history.length === 0 ? (
            <div className="text-center text-gray-500">
                <p>Henüz analiz geçmişiniz bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((item) => (
                <div key={item.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-3 text-sm text-gray-400">
                    <span>Tarih: {new Date(item.createdAt.toDate()).toLocaleString()}</span>
                    <span className="font-bold bg-gray-700 px-2 py-1 rounded">Bahis Türü: {item.betType}</span>
                  </div>
                  <div className="space-y-4">
                    {item.analysisResults.map((result, index) => (
                      <AnalysisResultCard key={index} result={result} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;