import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { DolarQuote } from '../types';
import { mapCasaToName } from '../utils';

interface ComparisonChartProps {
  quotes: DolarQuote[];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ quotes }) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'trend'>('comparison');

  // Bar Chart Data Processing
  // Filter out odd ones if necessary, but generally show what's passed
  const barData = quotes.slice(0, 6).map(q => ({ // Limit to 6 for chart clarity
      name: mapCasaToName(q).replace('Dólar ', ''),
      Venta: q.venta,
      Compra: q.compra,
      casa: q.casa,
      moneda: q.moneda
    }));

  const getBarColor = (entry: any) => {
    switch (entry.casa) {
      case 'blue': return '#3B82F6';
      case 'oficial': return '#10B981';
      default: return '#64748B'; // slate-500
    }
  };

  // Line Chart Data Generation (Mocked based on current Blue value for demo purposes)
  const trendData = useMemo(() => {
    // Try to find Blue, otherwise first item
    const blueQuote = quotes.find(q => q.casa === 'blue') || quotes[0];
    if (!blueQuote) return [];

    const currentVal = blueQuote.venta;
    const data = [];
    const days = 7;
    
    // Simulate a market trend for the last 7 days ending in current value
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let val = currentVal;
      // Generate some realistic-looking past data
      if (i > 0) {
         // Random variation between -1.5% and +1.5% for past points
         const noise = (Math.random() * 0.03) - 0.015; 
         // Add a slight trend factor (simulating growth or decline)
         const trendFactor = i * 0.002; 
         val = Math.floor(currentVal * (1 - trendFactor + noise));
      }
      
      data.push({
        date: date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        value: val,
      });
    }
    return data;
  }, [quotes]);

  return (
    <div className="bg-card rounded-xl p-6 border border-gray-800 shadow-xl h-[350px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-bold text-lg">
          {activeTab === 'comparison' ? 'Comparativa (Venta)' : 'Tendencia (7 días)'}
        </h3>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'comparison' 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Barras
          </button>
          <button
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'trend' 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Tendencia
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'comparison' ? (
            <BarChart
              data={barData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
                width={40}
              />
              <Tooltip 
                cursor={{ fill: '#334155', opacity: 0.2 }}
                contentStyle={{ backgroundColor: '#1E293B', borderColor: '#475569', color: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="Venta" radius={[4, 4, 0, 0]} animationDuration={1000}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={['dataMin - 10', 'dataMax + 10']}
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
                width={40}
              />
               <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', borderColor: '#475569', color: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#3B82F6' }}
                formatter={(value: number) => [`$${value}`, 'Venta']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4, stroke: '#1E293B' }}
                activeDot={{ r: 6, fill: '#60A5FA' }}
                animationDuration={1500}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChart;