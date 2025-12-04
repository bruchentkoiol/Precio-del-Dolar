import { DolarQuote } from "./types";

export const formatCurrency = (value: number, currency: string = 'ARS'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getCardStyle = (casa: string, moneda: string) => {
  // Styles based on currency type
  if (moneda === 'USDT') return 'border-teal-400 shadow-teal-400/20';
  
  // Bank styles
  if (casa.startsWith('banco') || moneda === 'USD_BANK') return 'border-indigo-400 shadow-indigo-400/20';

  // Default Dolar logic
  switch (casa) {
    case 'blue':
      return 'border-blue-500 shadow-blue-500/20';
    case 'oficial':
      return 'border-emerald-500 shadow-emerald-500/20';
    case 'bolsa': // MEP
      return 'border-purple-500 shadow-purple-500/20';
    case 'contadoconliqui': // CCL
      return 'border-orange-500 shadow-orange-500/20';
    case 'cripto':
      return 'border-yellow-500 shadow-yellow-500/20';
    default:
      // Fallback for banks if they don't match specific logic above
      return 'border-indigo-400 shadow-indigo-400/20';
  }
};

export const mapCasaToName = (quote: DolarQuote): string => {
   // Handle Crypto Exchanges (CryptoYa)
   if (quote.moneda === 'USDT') {
      const exchanges: {[key: string]: string} = {
        'lemoncash': 'Lemon Cash',
        'buenbit': 'Buenbit',
        'binance': 'Binance',
        'belo': 'Belo',
        'fiwind': 'Fiwind',
        'ripio': 'Ripio',
        'satoshitango': 'SatoshiTango',
        'bitso': 'Bitso',
        'cocoxcrypto': 'Cocos Crypto'
      };
      return exchanges[quote.casa] || quote.nombre || quote.casa.toUpperCase();
   }

   // Handle Banks (Assuming USD quote type for banks)
   if (quote.moneda === 'USD' && !['oficial', 'blue', 'bolsa', 'contadoconliqui', 'tarjeta', 'mayorista', 'cripto'].includes(quote.casa)) {
       // Clean up bank names from API
       let name = quote.nombre || quote.casa;
       name = name.replace('Banco ', '').replace('BBVA', 'BBVA').replace('Galicia', 'Galicia');
       // Capitalize properly
       return name.charAt(0).toUpperCase() + name.slice(1);
   }

   // Standard Dolar Types
   const prefix = 'Dólar ';
   
   switch (quote.casa) {
    case 'blue': return prefix + 'Blue';
    case 'oficial': return prefix + 'Oficial';
    case 'bolsa': return prefix + 'MEP';
    case 'contadoconliqui': return prefix + 'CCL';
    case 'tarjeta': return prefix + 'Tarjeta';
    case 'mayorista': return prefix + 'Mayorista';
    case 'cripto': return prefix + 'Cripto';
    default: return quote.nombre || quote.casa;
  }
}