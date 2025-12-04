import React, { useState } from 'react';
import { DolarQuote } from '../types';
import { formatCurrency, formatDate, getCardStyle, mapCasaToName } from '../utils';

interface QuoteCardProps {
  quote: DolarQuote;
  onClick: (quote: DolarQuote) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onClick }) => {
  const [copied, setCopied] = useState(false);
  const isBlue = quote.casa === 'blue';
  const displayTitle = mapCasaToName(quote);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection

    const text = `${displayTitle}\nCompra: ${formatCurrency(quote.compra, quote.moneda)}\nVenta: ${formatCurrency(quote.venta, quote.moneda)}\n\nConsulta más en: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cotización ${displayTitle}`,
          text: text,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard', err);
      }
    }
  };
  
  // Format price without symbol to save space
  const formatPriceNoSymbol = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val);
  };
  
  return (
    <div 
      onClick={() => onClick(quote)}
      className={`bg-card rounded-xl p-5 border-l-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${getCardStyle(quote.casa, quote.moneda)} group h-full flex flex-col justify-between`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 flex-1 mr-2">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider truncate" title={displayTitle}>
            {displayTitle}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Actualizado: {formatDate(quote.fechaActualizacion)}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
            {isBlue && (
            <span className="bg-blue-900/50 text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-700">
                Informal
            </span>
            )}
            <button
                onClick={handleShare}
                title="Compartir cotización"
                className="text-gray-500 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700/50 z-10"
            >
                {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                )}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col min-w-0">
          <span className="text-gray-400 text-xs font-medium uppercase mb-1">Compra</span>
          <span className="text-xl font-bold text-white tracking-tight" title={formatCurrency(quote.compra, quote.moneda)}>
            {formatPriceNoSymbol(quote.compra)}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-emerald-400 text-xs font-medium uppercase mb-1">Venta</span>
          <span className="text-xl font-bold text-emerald-400 tracking-tight" title={formatCurrency(quote.venta, quote.moneda)}>
            {formatPriceNoSymbol(quote.venta)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;