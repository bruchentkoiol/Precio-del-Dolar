import React, { useState } from 'react';
import { getMarketAnalysis } from '../services/geminiService';
import { DolarQuote } from '../types';

interface MarketAnalysisProps {
  quotes: DolarQuote[];
}

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ quotes }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysis = async () => {
    setLoading(true);
    const result = await getMarketAnalysis(quotes);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="mt-10 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Análisis Inteligente
            </h2>
            <p className="text-gray-400 text-sm mt-1">Potenciado por Gemini 2.5 Flash</p>
          </div>
          
          {!analysis && !loading && (
            <button 
              onClick={handleAnalysis}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-6 rounded-full transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2"
            >
              <span>Generar Informe</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center space-x-3 text-indigo-300 animate-pulse py-4">
            <div className="w-5 h-5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
            <span>Analizando el mercado actual...</span>
          </div>
        )}

        {analysis && (
          <div className="bg-slate-900/50 rounded-xl p-5 border border-indigo-500/20 animate-fade-in">
            <p className="text-indigo-100 leading-relaxed text-lg">
              {analysis}
            </p>
            <button 
              onClick={() => setAnalysis(null)}
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              Cerrar análisis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAnalysis;