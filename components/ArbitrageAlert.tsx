import React, { useState, useEffect } from 'react';
import { DolarQuote } from '../types';
import { formatCurrency } from '../utils';

interface ArbitrageAlertProps {
  quotes: DolarQuote[];
}

interface Strategy {
  id: string;
  title: string;
  description: string;
  buySource: string;
  sellSource: string;
  buyPrice: number;
  sellPrice: number;
  profitPercentage: number;
  profitAmount: number; // Per 1000 USD
  isProfitable: boolean;
  triggersAlert: boolean; // New prop based on user threshold
  color: string;
}

const ArbitrageAlert: React.FC<ArbitrageAlertProps> = ({ quotes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [minProfitThreshold, setMinProfitThreshold] = useState<number>(1.5); // Default 1.5%
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);

  // Load settings from local storage safely
  useEffect(() => {
    try {
        const savedThreshold = localStorage.getItem('arbitrage_threshold');
        const savedEnabled = localStorage.getItem('arbitrage_enabled');
        
        if (savedThreshold) setMinProfitThreshold(parseFloat(savedThreshold));
        if (savedEnabled) setAlertsEnabled(savedEnabled === 'true');
    } catch (e) {
        console.warn("Could not access localStorage for arbitrage settings");
    }
  }, []);

  // Save settings safely
  const saveSettings = () => {
    try {
        localStorage.setItem('arbitrage_threshold', minProfitThreshold.toString());
        localStorage.setItem('arbitrage_enabled', alertsEnabled.toString());
    } catch (e) {
        console.warn("Could not save settings to localStorage");
    }
    setShowSettings(false);
  };

  const blue = quotes.find(q => q.casa === 'blue');
  const mep = quotes.find(q => q.casa === 'bolsa');
  const oficial = quotes.find(q => q.casa === 'oficial');

  // Si faltan datos críticos, no mostramos nada
  if (!blue || !mep || !oficial) return null;

  // Helper para calcular estrategias
  const calculateStrategy = (
    id: string,
    title: string,
    buyQuote: DolarQuote,
    sellQuote: DolarQuote,
    buyName: string,
    sellName: string,
    descProfitable: string,
    descLoss: string
  ): Strategy => {
    const buyPrice = buyQuote.venta; // Compramos a la punta vendedora
    const sellPrice = sellQuote.compra; // Vendemos a la punta compradora
    
    const profitPerDolar = sellPrice - buyPrice;
    const profitPercentage = (profitPerDolar / buyPrice) * 100;
    const investment = 1000;
    const profitAmount = profitPerDolar * investment;
    
    // Consideramos "Rentable" si gana más de 0.5% (para cubrir spread/comisones mínimas)
    const isProfitable = profitPercentage > 0.5;
    
    // Alerta personalizada basada en el umbral del usuario
    const triggersAlert = alertsEnabled && profitPercentage >= minProfitThreshold;

    let color = 'red';
    if (triggersAlert) color = 'emerald-alert'; // Special state
    else if (isProfitable) color = 'emerald';
    else if (profitPercentage > -1.5) color = 'yellow';

    return {
      id,
      title,
      description: isProfitable ? descProfitable : descLoss,
      buySource: buyName,
      sellSource: sellName,
      buyPrice,
      sellPrice,
      profitPercentage,
      profitAmount,
      isProfitable,
      triggersAlert,
      color
    };
  };

  // Definimos las estrategias
  const strategies: Strategy[] = [
    // 1. MEP -> BLUE (Hacer Puré)
    calculateStrategy(
      'mep-to-blue',
      'Hacer Puré (MEP → Blue)',
      mep, blue, 'MEP', 'Blue',
      'El Blue está caro respecto al MEP. Comprás barato en bolsa y vendés caro en el paralelo.',
      'Actualmente no conviene comprar MEP para vender al Blue, la brecha es negativa o muy chica.'
    ),
    // 2. BLUE -> MEP (Rulo Inverso)
    calculateStrategy(
      'blue-to-mep',
      'Rulo Inverso (Blue → MEP)',
      blue, mep, 'Blue', 'MEP',
      'El Blue está barato. Podés comprar billete físico y venderlo vía MEP (requiere depositar en banco).',
      'El MEP no paga lo suficiente por tus dólares Blue para justificar el movimiento.'
    ),
    // 3. MEP -> OFICIAL (Arbitraje Bancario)
    calculateStrategy(
      'mep-to-oficial',
      'Vender al Banco (MEP → Oficial)',
      mep, oficial, 'MEP', 'Oficial',
      'Situación atípica: El banco paga más por tus dólares que el mercado de capitales.',
      'Vender tus dólares MEP al banco (Oficial) genera pérdida. El banco paga menos.'
    ),
     // 4. BLUE -> OFICIAL (Arbitraje Billete)
     calculateStrategy(
        'blue-to-oficial',
        'Vender al Banco (Blue → Oficial)',
        blue, oficial, 'Blue', 'Oficial',
        'El banco está pagando muy bien el dólar comparado con la cueva.',
        'El banco paga mucho menos que el Blue. No te conviene venderle al banco.'
      )
  ];

  // Ordenar: Alertas primero, luego rentables, luego el resto
  const sortedStrategies = [...strategies].sort((a, b) => {
      if (a.triggersAlert && !b.triggersAlert) return -1;
      if (!a.triggersAlert && b.triggersAlert) return 1;
      return b.profitPercentage - a.profitPercentage;
  });

  const current = sortedStrategies[currentIndex];
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedStrategies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedStrategies.length) % sortedStrategies.length);
  };

  // Color map classes
  const getThemeClasses = (color: string) => {
    if (color === 'emerald-alert') return {
        bg: 'bg-emerald-900/30', border: 'border-emerald-400', text: 'text-emerald-300', 
        badge: 'bg-emerald-500 text-white animate-pulse', glow: 'bg-emerald-400'
    };
    if (color === 'emerald') return {
        bg: 'bg-emerald-900/20', border: 'border-emerald-500/50', text: 'text-emerald-400', 
        badge: 'bg-emerald-500 text-white', glow: 'bg-emerald-500'
    };
    if (color === 'red') return {
        bg: 'bg-red-900/10', border: 'border-red-500/30', text: 'text-red-400', 
        badge: 'bg-red-500/20 text-red-300 border border-red-500/30', glow: 'bg-red-500'
    };
    return { // Yellow/Neutral
        bg: 'bg-yellow-900/10', border: 'border-yellow-500/30', text: 'text-yellow-400', 
        badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', glow: 'bg-yellow-500'
    };
  };

  const theme = getThemeClasses(current.color);

  return (
    <>
        {/* Settings Modal (Global) */}
        {showSettings && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                    onClick={() => setShowSettings(false)}
                ></div>

                {/* Modal Content */}
                <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 transition-all transform scale-100 opacity-100">
                    <button 
                        onClick={() => setShowSettings(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        aria-label="Cerrar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        Configurar Alertas
                    </h3>
                    
                    <div className="w-full space-y-4">
                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <label className="text-gray-300 text-sm font-medium">Activar Alertas</label>
                            <button 
                                onClick={() => setAlertsEnabled(!alertsEnabled)}
                                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${alertsEnabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${alertsEnabled ? 'translate-x-5' : ''}`}></div>
                            </button>
                        </div>

                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <label className="text-gray-300 text-sm font-medium block mb-2">
                                Ganancia mínima para notificar
                            </label>
                            <div className="flex items-center gap-3">
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="10" 
                                    step="0.5"
                                    value={minProfitThreshold}
                                    onChange={(e) => setMinProfitThreshold(parseFloat(e.target.value))}
                                    className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <span className="text-emerald-400 font-bold font-mono w-12 text-right">{minProfitThreshold}%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Solo te avisaremos cuando una oportunidad supere este porcentaje.
                            </p>
                        </div>

                        <button 
                            onClick={saveSettings}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-emerald-900/20 mt-2"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Card Component */}
        <div className={`mb-8 rounded-2xl border transition-all relative overflow-hidden ${theme.bg} ${theme.border}`}>
            
            {/* Background Glow */}
            {(current.isProfitable || current.triggersAlert) && (
                <div className={`absolute -right-10 -top-10 w-40 h-40 ${theme.glow} blur-[80px] opacity-20 pointer-events-none`}></div>
            )}

            <div className="p-5 sm:p-6 relative z-10">
                
                {/* Header / Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button 
                        onClick={prevSlide}
                        className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        aria-label="Anterior"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>

                    <div className="flex flex-col items-center">
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-1 flex items-center gap-1 ${theme.badge}`}>
                            {current.triggersAlert && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 animate-bounce" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                </svg>
                            )}
                            {current.triggersAlert ? '🔔 Alerta de Rulo' : current.isProfitable ? '¡Oportunidad!' : 'Análisis de Arbitraje'}
                        </span>
                        <div className="flex gap-1.5 mt-2">
                            {sortedStrategies.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-3' : 'bg-gray-600'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowSettings(true)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            aria-label="Configuración"
                            title="Configurar Alertas"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            aria-label="Siguiente"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Info Text */}
                    <div className="text-center md:text-left flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{current.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed min-h-[40px]">
                            {current.description}
                        </p>
                        
                        {/* Visual Flow */}
                        <div className="mt-4 flex items-center justify-center md:justify-start gap-3 text-sm">
                            <div className="bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/50">
                                <span className="text-gray-500 text-xs block">Compras {current.buySource}</span>
                                <span className="text-white font-bold">{formatCurrency(current.buyPrice)}</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <div className="bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/50">
                                <span className="text-gray-500 text-xs block">Vendés {current.sellSource}</span>
                                <span className="text-white font-bold">{formatCurrency(current.sellPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Profit Box */}
                    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center min-w-[160px] bg-slate-900/40 border-slate-700/30 transition-transform ${current.triggersAlert ? 'scale-105' : ''}`}>
                        <span className="text-xs text-gray-400 uppercase font-semibold mb-1">Resultado</span>
                        <div className={`text-3xl font-bold font-mono mb-1 ${theme.text}`}>
                            {current.profitPercentage > 0 ? '+' : ''}{current.profitPercentage.toFixed(2)}%
                        </div>
                        <span className={`text-xs font-medium ${current.profitPercentage > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                            {current.profitPercentage > 0 ? '+' : ''}{formatCurrency(current.profitAmount).replace(',00', '')} / 1k USD
                        </span>
                    </div>
                </div>

            </div>
        </div>
    </>
  );
};

export default ArbitrageAlert;