import React, { useEffect, useState } from 'react';
import { fetchRates } from './services/dolarService';
import { DolarQuote, QuoteType } from './types';
import QuoteCard from './components/QuoteCard';
import Converter from './components/Converter';
import MarketAnalysis from './components/MarketAnalysis';
import ComparisonChart from './components/ComparisonChart';
import TabSelector from './components/TabSelector';
import ExchangeBands from './components/ExchangeBands';
import ArbitrageAlert from './components/ArbitrageAlert';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<QuoteType>('dolares');
  const [quotes, setQuotes] = useState<DolarQuote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<DolarQuote | null>(null);

  const refreshData = async (type: QuoteType = activeTab) => {
    setLoading(true);
    setQuotes([]); // Clear previous data to avoid mix-ups during transition
    const data = await fetchRates(type);
    
    // Sort logic depends on type
    let sortedData = data;
    if (type === 'dolares') {
        sortedData = data.sort((a, b) => {
          const priority = ['blue', 'oficial', 'bolsa', 'contadoconliqui', 'cripto', 'tarjeta', 'mayorista'];
          const idxA = priority.indexOf(a.casa);
          const idxB = priority.indexOf(b.casa);
          // If not in priority list, push to end
          return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        });
    } else if (type === 'cotizaciones') {
        // Banks: sort by sell price ascending (best for user)
        sortedData = data.sort((a, b) => a.venta - b.venta);
    } else if (type === 'cripto') {
        // Crypto: sort by best sell price (cheapest to buy)
        sortedData = data.sort((a, b) => {
             // Put generic "cripto" (benchmark) at the top if exists
             if (a.casa === 'cripto') return -1;
             if (b.casa === 'cripto') return 1;
             return a.venta - b.venta
        });
    }

    setQuotes(sortedData);
    setLastUpdated(new Date());
    setLoading(false);
    // Reset selection on tab change
    setSelectedQuote(null);
  };

  useEffect(() => {
    refreshData(activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen pb-12 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">
              Precio del <span className="text-emerald-400">Dolar</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            
             {/* BOTÓN DESCARGAR APP */}
             <a 
               href="https://onelink.to/jr3z3k" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 flex items-center gap-2"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
               <span className="hidden sm:inline">Descargar App</span>
               <span className="sm:hidden">App</span>
             </a>

             {lastUpdated && (
               <span className="text-xs text-gray-400 hidden sm:block">
                 {lastUpdated.toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'})}
               </span>
             )}
             <button 
               onClick={() => refreshData(activeTab)} 
               className={`p-2 rounded-full hover:bg-slate-800 transition-all ${loading ? 'animate-spin text-emerald-500' : 'text-gray-400'}`}
               aria-label="Refrescar datos"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab Selector */}
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

        {loading && quotes.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
             <p className="text-gray-400 animate-pulse">Cargando cotizaciones...</p>
          </div>
        ) : (
          <>
            {quotes.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-gray-400 mb-4">No se pudieron cargar los datos.</p>
                    <button 
                        onClick={() => refreshData(activeTab)}
                        className="text-emerald-500 hover:text-emerald-400 font-medium hover:underline"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            ) : (
                <>
                {/* VIEW: BANDAS */}
                {activeTab === 'bandas' ? (
                    <ExchangeBands quotes={quotes} />
                ) : (
                    <>
                    {/* Top Section: Calculator & Chart (Hidden for Banks/Bandas) */}
                    {activeTab !== 'cotizaciones' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        <Converter quotes={quotes} selectedQuote={selectedQuote} />
                        <div className="hidden lg:block">
                            <ComparisonChart quotes={quotes} />
                        </div>
                        </div>
                    )}
                    
                    {/* Arbitrage Alert (Only for Dolar tab) */}
                    {activeTab === 'dolares' && <ArbitrageAlert quotes={quotes} />}

                    {/* IOL CTA Banner (Only for Dolar tab) */}
                    {activeTab === 'dolares' && (
                        <div className="mb-12 relative group overflow-hidden rounded-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
                        
                        <div className="relative border border-emerald-500/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
                            <div className="flex items-start gap-4 max-w-2xl">
                            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hidden sm:block">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                ¿Querés comprar o vender Dólar MEP?
                                </h3>
                                <p className="text-gray-300 text-sm sm:text-base">
                                Operá de forma legal, segura y sin topes a través de <span className="font-semibold text-emerald-300">IOL invertironline</span>.
                                </p>
                            </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <a 
                                href="https://www.invertironline.com/productos/dolar-mep-simple" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 whitespace-nowrap bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                Comprar MEP
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                </a>
                                
                                <a 
                                href="https://www.invertironline.com/productos/venta-dolar-mep-simple" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-3 px-6 rounded-xl transition-all border border-emerald-500/30 hover:border-emerald-500/60 hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                Vender MEP
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                </a>
                            </div>
                        </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                            {activeTab === 'cotizaciones' ? 'Cotizaciones Bancarias' : activeTab === 'cripto' ? 'Cotizaciones Cripto (USDT)' : activeTab}
                        </h2>
                        <span className="text-xs sm:text-sm bg-slate-800 text-gray-400 px-3 py-1 rounded-full border border-slate-700 font-medium capitalize">
                            {activeTab === 'cripto' ? 'Exchanges' : 'Argentina'}
                        </span>
                    </div>

                    {/* Grid of Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {quotes.map((quote, idx) => (
                        <QuoteCard 
                        key={quote.casa + idx} 
                        quote={quote} 
                        onClick={(q) => {
                            setSelectedQuote(q);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        />
                    ))}
                    </div>

                    {/* Gemini Analysis Section (Only for major currencies) */}
                    {activeTab === 'dolares' && (
                        <MarketAnalysis quotes={quotes} />
                    )}
                    
                    {/* Mobile Chart (Only shown on smaller screens below cards) */}
                    <div className="lg:hidden mt-10">
                    {activeTab !== 'cotizaciones' && activeTab !== 'cripto' && <ComparisonChart quotes={quotes} />}
                    </div>
                    </>
                )}
                </>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-800 mt-12 py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Precio del Dolar. Desarrollado con React & Gemini.</p>
        <p className="mt-2 text-xs text-gray-600">
          Datos provistos por DolarAPI.com & CryptoYa. No representa asesoramiento financiero oficial.
        </p>
      </footer>
    </div>
  );
};

export default App;