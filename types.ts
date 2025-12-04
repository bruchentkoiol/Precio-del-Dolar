export interface DolarQuote {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export interface MarketAnalysis {
  summary: string;
  trend: 'stable' | 'up' | 'down';
  recommendation: string;
}

export enum Currency {
  ARS = 'ARS',
  USD = 'USD'
}

export type QuoteType = 'dolares' | 'cotizaciones' | 'cripto' | 'bandas';