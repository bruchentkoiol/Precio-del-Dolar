import { GoogleGenAI } from "@google/genai";
import { DolarQuote } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMarketAnalysis = async (quotes: DolarQuote[]): Promise<string> => {
  try {
    // Filter pertinent data to reduce token usage and noise
    const relevantData = quotes.map(q => ({
      nombre: q.nombre,
      compra: q.compra,
      venta: q.venta,
      casa: q.casa
    }));

    const prompt = `
      Actúa como un experto economista argentino. Analiza brevemente estos valores actuales del mercado cambiario en Argentina:
      ${JSON.stringify(relevantData)}

      Provee un "Flash de Mercado" corto (máximo 80 palabras) en formato texto plano (sin markdown).
      Responde a estas preguntas implícitamente:
      1. ¿Cómo está la brecha entre el oficial y el blue?
      2. ¿Cuál es la recomendación general (comprar/esperar)?
      
      Usa un tono profesional pero directo. No uses listas, usa párrafos.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudo generar el análisis en este momento.";
  } catch (error) {
    console.error("Error generating market analysis:", error);
    return "El servicio de análisis de mercado no está disponible momentáneamente.";
  }
};