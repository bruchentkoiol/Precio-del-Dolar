import React, { useState, useEffect } from 'react';
import { DolarQuote } from '../types';
import { mapCasaToName } from '../utils';

interface ConverterProps {
  quotes: DolarQuote[];
  selectedQuote?: DolarQuote | null;
}

const Converter: React.FC<ConverterProps> = ({ quotes, selectedQuote }) => {
  const [amount, setAmount] = useState<string>('100');
  const [activeQuoteIndex, setActiveQuoteIndex] = useState<number>(0);
  const [direction, setDirection] = useState<'FOREIGN_TO_ARS' | 'ARS_TO_FOREIGN'>('FOREIGN_TO_ARS');

  useEffect(() => {
    if (selectedQuote) {
      const idx = quotes.findIndex(q => q.casa === selectedQuote.casa && q.moneda === selectedQuote.moneda);
      if (idx !== -1) setActiveQuoteIndex(idx);
    }
  }, [selectedQuote, quotes]);

  // Ensure we have a valid quote, otherwise default to first
  const activeQuote = quotes[activeQuoteIndex] || quotes[0];
  
  const convertedValue = React.useMemo(() => {
    if (!activeQuote) return 0;
    const val = parseFloat(amount) || 0;
    
    if (direction === 'FOREIGN_TO_ARS') {
      return val * activeQuote.compra;
    } else {
      // Avoid division by zero
      return activeQuote.venta > 0 ? val / activeQuote.venta : 0;
    }
  }, [amount, activeQuote, direction]);

  const handleSwap = () => {
    setDirection(prev => prev === 'FOREIGN_TO_ARS' ? 'ARS_TO_FOREIGN' : 'FOREIGN_TO_ARS');
  };

  const currencySymbol = activeQuote?.moneda || 'USD';

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 mb-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Calculadora
      </h2>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        
        {/* Input Amount */}
        <div className="flex-1 w-full">
          <label className="block text-xs text-gray-400 mb-1 uppercase font-semibold">Monto</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
            />
            <span className="absolute right-4 top-3.5 text-gray-500 font-bold">
              {direction === 'FOREIGN_TO_ARS' ? currencySymbol : 'ARS'}
            </span>
          </div>
        </div>

        {/* Swap Button */}
        <button 
          onClick={handleSwap}
          className="bg-slate-700 hover:bg-slate-600 p-3 rounded-full text-white transition-colors self-center md:self-end md:mb-1"
          aria-label="Intercambiar monedas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        {/* Quote Selector */}
        <div className="flex-1 w-full">
           <label className="block text-xs text-gray-400 mb-1 uppercase font-semibold">Tipo de Cambio</label>
           <select 
             value={activeQuoteIndex}
             onChange={(e) => setActiveQuoteIndex(Number(e.target.value))}
             className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg appearance-none cursor-pointer"
           >
             {quotes.map((q, idx) => (
               <option key={`${q.casa}-${idx}`} value={idx}>{mapCasaToName(q)}</option>
             ))}
           </select>
        </div>

        {/* Result Display */}
        <div className="flex-1 w-full bg-slate-950/50 rounded-lg border border-emerald-500/30 p-2 flex flex-col justify-center items-end min-h-[58px]">
          <span className="text-xs text-emerald-400 uppercase font-bold mr-2">Recibís estimadamente</span>
          <span className="text-2xl font-bold text-white mr-2">
            {direction === 'FOREIGN_TO_ARS' 
              ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(convertedValue)
              : new Intl.NumberFormat('en-US', { style: 'currency', currency: currencySymbol }).format(convertedValue)
            }
          </span>
        </div>
      </div>
      
      <div className="mt-3 text-right">
        <p className="text-xs text-gray-500">
          *Cotización usada: {direction === 'FOREIGN_TO_ARS' ? 'Compra' : 'Venta'} del {activeQuote ? mapCasaToName(activeQuote) : ''}
        </p>
      </div>
    </div>
  );
};

export default Converter;