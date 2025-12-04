import { DolarQuote, QuoteType } from '../types';

const BASE_URL = 'https://dolarapi.com/v1';
const CRYPTO_API_URL = 'https://cryptoya.com/api/usdt/ars';

export const fetchRates = async (type: QuoteType = 'dolares'): Promise<DolarQuote[]> => {
  // Handle Cripto specifically
  if (type === 'cripto') {
    try {
        // We combine specific exchanges (CryptoYa) with the generic benchmark (DolarApi)
        // Use Promise.allSettled to ensure if one fails the other still loads
        const [cryptoYaResult, benchmarkResult] = await Promise.allSettled([
            fetchCryptoRates(),
            fetchStandardRates('dolares/cripto', 'USD').then(res => res[0]) // Get single object
        ]);
        
        let results: DolarQuote[] = [];

        // Add benchmark if successful
        if (benchmarkResult.status === 'fulfilled' && benchmarkResult.value) {
            benchmarkResult.value.nombre = "Promedio Cripto";
            benchmarkResult.value.casa = "cripto";
            results.push(benchmarkResult.value);
        }

        // Add exchanges if successful
        if (cryptoYaResult.status === 'fulfilled') {
            results = [...results, ...cryptoYaResult.value];
        }
        
        return results;
    } catch (e) {
        console.error("Critical error fetching crypto", e);
        return [];
    }
  }
  
  // Handle Bandas (needs dolar data to calculate)
  if (type === 'bandas') {
      return fetchStandardRates('dolares', 'USD'); 
  }

  // Standard DolarAPI endpoints mapping
  // Defaults to 'dolares' or 'cotizaciones'
  return fetchStandardRates(type, 'USD');
};

const fetchStandardRates = async (endpoint: string, forceCurrency: string): Promise<DolarQuote[]> => {
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`);
    if (!response.ok) {
      throw new Error('Failed to fetch rates');
    }
    const data = await response.json();
    
    let arrayData = Array.isArray(data) ? data : [data];

    // Force correct currency code and ensure consistency
    return arrayData.map((quote: any) => ({
        ...quote,
        moneda: forceCurrency
    }));

  } catch (error) {
    console.error(`Error fetching ${endpoint} rates:`, error);
    return [];
  }
};

const fetchCryptoRates = async (): Promise<DolarQuote[]> => {
    try {
        const response = await fetch(CRYPTO_API_URL);
        if (!response.ok) throw new Error('Failed to fetch crypto rates');
        const data = await response.json();
        
        // Transform CryptoYa format { exchange: { ask: 100, bid: 90 ... } } to DolarQuote[]
        const exchanges = ['lemoncash', 'binance', 'belo', 'buenbit', 'fiwind', 'ripio', 'satoshitango', 'bitso'];
        const quotes: DolarQuote[] = [];
        
        exchanges.forEach(exchange => {
            if (data[exchange]) {
                quotes.push({
                    moneda: 'USDT',
                    casa: exchange,
                    nombre: exchange,
                    compra: data[exchange].bid, // totalBid includes fees usually, using bid for raw
                    venta: data[exchange].ask,
                    fechaActualizacion: new Date().toISOString()
                });
            }
        });

        return quotes;

    } catch (error) {
        console.error("Error fetching crypto rates:", error);
        return [];
    }
}