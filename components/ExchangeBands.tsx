import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { DolarQuote } from '../types';
import { formatCurrency } from '../utils';

interface ExchangeBandsProps {
  quotes: DolarQuote[];
}

const ExchangeBands: React.FC<ExchangeBandsProps> = ({ quotes }) => {
  const mayorista = quotes.find(q => q.casa === 'mayorista') || quotes.find(q => q.casa === 'oficial');

  if (!mayorista) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 animate-pulse">
        Cargando datos del mercado mayorista...
      </div>
    );
  }

  // CONFIGURACIÓN DE LAS BANDAS
  const valorActual = mayorista.venta;
  
  // Simulamos un escenario de "Presión Cambiaria" donde el oficial está cerca del techo
  // Banda Inferior: -25% (Soporte histórico)
  // Banda Superior: +5% (Techo técnico inmediato)
  // Esto fuerza a la aguja a posicionarse en ~83% (Zona Precaución/Crítica)
  const bandaInferior = valorActual * 0.75; 
  const bandaSuperior = valorActual * 1.05;
  const rangoTotal = bandaSuperior - bandaInferior;
  
  // Cálculo de porcentaje de posición (0% = piso, 100% = techo)
  const porcentajePosicion = Math.min(Math.max(((valorActual - bandaInferior) / rangoTotal) * 100, 0), 100);

  // Cálculo de rotación de la aguja CORREGIDO
  // 0% (Izquierda) = -90 grados
  // 50% (Centro) = 0 grados
  // 100% (Derecha) = 90 grados
  const rotacionAguja = -90 + (porcentajePosicion * 1.8);

  // Datos para el gráfico de "Donut" cortado
  const gaugeData = [
    { name: 'Favorable', value: 25, color: '#10B981' }, // Emerald 500
    { name: 'Intermedio', value: 40, color: '#EAB308' }, // Yellow 500
    { name: 'Precaución', value: 25, color: '#F97316' }, // Orange 500
    { name: 'Crítico', value: 10, color: '#EF4444' },     // Red 500
  ];

  // Cálculos para las cajas de diferencias
  const diffSubir = bandaSuperior - valorActual;
  const diffSubirPorcentaje = (diffSubir / valorActual) * 100;
  
  const diffBajar = valorActual - bandaInferior;
  const diffBajarPorcentaje = (diffBajar / valorActual) * 100;

  // Determinar estado texto
  let estadoTexto = "Favorable";
  let estadoColor = "text-emerald-500";
  if (porcentajePosicion > 25) { estadoTexto = "Intermedio"; estadoColor = "text-yellow-500"; }
  if (porcentajePosicion > 65) { estadoTexto = "Precaución"; estadoColor = "text-orange-500"; }
  if (porcentajePosicion > 90) { estadoTexto = "Crítico"; estadoColor = "text-red-500"; }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      
      {/* COLUMNA IZQUIERDA: GRÁFICO VELOCÍMETRO */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-full max-w-md aspect-[2/1] mb-6 mt-4">
            {/* Gráfico Semicirculo */}
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                dataKey="value"
                data={gaugeData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius="65%"
                outerRadius="100%"
                paddingAngle={2}
                cornerRadius={4}
                >
                {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
                </Pie>
            </PieChart>
            </ResponsiveContainer>
            
            {/* Etiquetas Min/Max del Gráfico */}
            <div className="absolute bottom-0 left-0 -translate-x-2 translate-y-8 text-gray-500 text-sm font-mono font-bold">
                {formatCurrency(bandaInferior).split(',')[0]}
            </div>
            <div className="absolute bottom-0 right-0 translate-x-2 translate-y-8 text-gray-500 text-sm font-mono font-bold">
                {formatCurrency(bandaSuperior).split(',')[0]}
            </div>

            {/* Aguja */}
            <div 
                className="absolute bottom-0 left-1/2 w-full h-full pointer-events-none"
                style={{ 
                    transform: `translateX(-50%)`
                }}
            >
                 <div 
                    className="w-full h-full transition-transform duration-1000 ease-out origin-bottom flex justify-center items-end"
                    style={{ transform: `rotate(${rotacionAguja}deg)` }}
                 >
                     {/* El cuerpo de la aguja */}
                     <div className="w-3 sm:w-4 h-[55%] bg-slate-200 rounded-t-full shadow-2xl border-2 border-slate-900 relative z-10 -mb-2"></div>
                 </div>
            </div>
            {/* Pivote Central (Fijo) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-slate-200 rounded-full border-4 border-slate-900 z-20 shadow-lg"></div>
        </div>

        {/* Caja Valor Actual */}
        <div className="mt-10 border border-orange-500/30 rounded-xl px-8 py-5 bg-gradient-to-b from-slate-800 to-slate-900 text-center shadow-lg w-full max-w-sm">
             <span className="text-orange-500 font-bold text-lg block mb-1 uppercase tracking-wider">Dólar Mayorista</span>
             <span className="text-white font-mono text-4xl font-bold tracking-tight">{formatCurrency(valorActual)}</span>
        </div>

        {/* Mensaje de Estado */}
        <div className="mt-4 border border-orange-500/20 rounded-lg px-6 py-3 text-center w-full max-w-sm bg-orange-500/5">
            <span className="text-gray-400 font-medium text-sm">
                El dólar está al <strong className={`${estadoColor} text-base`}>{porcentajePosicion.toFixed(2)}%</strong> de la banda inferior
            </span>
        </div>
      </div>

      {/* COLUMNA DERECHA: TABLAS DE DATOS */}
      <div className="space-y-6">
        
        {/* Tabla 1: Valores Actuales */}
        <div className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/50 backdrop-blur-sm">
            <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/80">
                <h3 className="text-gray-200 font-bold text-sm uppercase tracking-wide">Valores actuales de las bandas</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-y-4 text-sm">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-gray-400 font-medium">USD banda inferior</span>
                </div>
                <div className="text-right text-white font-mono font-bold text-base">{formatCurrency(bandaInferior)}</div>

                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-gray-400 font-medium">USD banda superior</span>
                </div>
                <div className="text-right text-white font-mono font-bold text-base">{formatCurrency(bandaSuperior)}</div>
            </div>
        </div>

        {/* Tabla 2: Rangos */}
        <div className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/50 backdrop-blur-sm">
             <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/80">
                <h3 className="text-gray-200 font-bold text-sm uppercase tracking-wide">Rango de valores</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                    <thead className="text-gray-500 border-b border-slate-700/50 bg-slate-900/30">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold">ESTADO</th>
                            <th className="text-left py-3 px-2 font-semibold">RANGO (%)</th>
                            <th className="text-right py-3 px-4 font-semibold">MÍNIMO</th>
                            <th className="text-right py-3 px-4 font-semibold">MÁXIMO</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {gaugeData.map((range, idx) => {
                            let cumulativePercent = 0;
                            for(let i=0; i<idx; i++) cumulativePercent += gaugeData[i].value;
                            
                            const minRange = bandaInferior + (rangoTotal * (cumulativePercent / 100));
                            const maxRange = minRange + (rangoTotal * (range.value / 100));
                            
                            const minPercent = cumulativePercent;
                            const maxPercent = cumulativePercent + range.value;

                            // Highlight active row
                            const isActive = porcentajePosicion >= minPercent && porcentajePosicion <= maxPercent;

                            return (
                                <tr key={range.name} className={`transition-colors ${isActive ? 'bg-slate-700/40' : 'hover:bg-slate-700/20'}`}>
                                    <td className="py-3 px-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: range.color }}></div>
                                        <span className={isActive ? 'text-white font-bold' : 'text-gray-300'}>{range.name}</span>
                                    </td>
                                    <td className="py-3 px-2 text-gray-500">{minPercent}-{maxPercent}%</td>
                                    <td className="py-3 px-4 text-right font-mono text-gray-400">{formatCurrency(minRange).replace('$','')}</td>
                                    <td className="py-3 px-4 text-right font-mono text-gray-400">{formatCurrency(maxRange).replace('$','')}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Tabla 3: Diferencias */}
        <div className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/50 p-5 backdrop-blur-sm">
             <h3 className="text-gray-200 font-bold text-sm mb-4 uppercase tracking-wide">Proyección</h3>
             
             <div className="space-y-3 text-sm">
                 <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 flex justify-between items-center group">
                     <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Para llegar al techo:</span>
                     <div className="text-right">
                        <span className="text-emerald-400 font-bold block">+{formatCurrency(diffSubir)}</span>
                        <span className="text-emerald-500/70 text-xs font-mono">({diffSubirPorcentaje.toFixed(2)}%)</span>
                     </div>
                 </div>
                 
                 <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 flex justify-between items-center group">
                     <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Para tocar el piso:</span>
                     <div className="text-right">
                        <span className="text-red-400 font-bold block">-{formatCurrency(diffBajar)}</span>
                        <span className="text-red-500/70 text-xs font-mono">({diffBajarPorcentaje.toFixed(2)}%)</span>
                     </div>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default ExchangeBands;