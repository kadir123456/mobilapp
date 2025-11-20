
import React from 'react';
import type { MatchAnalysis } from '../types';

interface AnalysisResultCardProps {
  result: MatchAnalysis;
}

const getConfidenceColor = (confidence: 'Low' | 'Medium' | 'High') => {
  switch (confidence) {
    case 'High':
      return 'bg-green-500 text-green-900';
    case 'Medium':
      return 'bg-yellow-500 text-yellow-900';
    case 'Low':
      return 'bg-red-500 text-red-900';
    default:
      return 'bg-gray-500 text-gray-900';
  }
};

const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ result }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 shadow-md animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-gray-100">{result.match}</h3>
        <span className={`px-3 py-1 text-sm font-bold rounded-full ${getConfidenceColor(result.confidence)}`}>
          {result.confidence}
        </span>
      </div>
      <div className="mb-3">
        <p className="text-gray-400">Tahmin:</p>
        <p className="text-xl font-semibold text-green-400">{result.prediction}</p>
      </div>
      <div>
        <p className="text-gray-400 mb-1">İstatistiksel Gerekçe:</p>
        <p className="text-gray-300 text-sm whitespace-pre-wrap">{result.reasoning}</p>
      </div>
    </div>
  );
};

export default AnalysisResultCard;
