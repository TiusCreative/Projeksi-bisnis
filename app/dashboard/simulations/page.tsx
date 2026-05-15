'use client';

import { useState, useEffect } from 'react';
import { useBusiness } from '@/app/context/BusinessContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

type SimulationScenario = 'best' | 'moderate' | 'worst';

interface SimulationParams {
  revenueGrowth: number;
  costGrowth: number;
  inflationRate: number;
  marketDemand: number;
  competition: number;
  months: number;
}

interface SimulationResult {
  month: number;
  revenue: number;
  cost: number;
  profit: number;
  cumulativeProfit: number;
}

export default function SimulationPage() {
  const { selectedBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<SimulationScenario>('moderate');
  const [customParams, setCustomParams] = useState<SimulationParams>({
    revenueGrowth: 5,
    costGrowth: 3,
    inflationRate: 2,
    marketDemand: 100,
    competition: 50,
    months: 12,
  });
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [baseData, setBaseData] = useState<any>(null);

  useEffect(() => {
    fetchBaseData();
  }, [selectedBusiness]);

  const fetchBaseData = async () => {
    if (!selectedBusiness) return;
    
    try {
      // Fetch projections for base data
      const projectionsQ = query(
        collection(db, 'projections'),
        where('business_id', '==', selectedBusiness.id)
      );
      const projectionsSnap = await getDocs(projectionsQ);
      const projections = projectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch invoices for actual data
      const invoicesQ = query(
        collection(db, 'invoices'),
        where('business_id', '==', selectedBusiness.id)
      );
      const invoicesSnap = await getDocs(invoicesQ);
      const invoices = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setBaseData({
        projections,
        invoices,
        avgMonthlyRevenue: invoices.length > 0 
          ? invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0) / 12 
          : projections[0]?.calculations?.totalRevenue / 12 || 10000000,
        avgMonthlyCost: projections[0]?.calculations?.totalCost / 12 || 8000000,
      });
    } catch (error) {
      console.error('Error fetching base data:', error);
    }
  };

  const applyScenario = (scenarioType: SimulationScenario) => {
    switch (scenarioType) {
      case 'best':
        setCustomParams({
          revenueGrowth: 15,
          costGrowth: 2,
          inflationRate: 1,
          marketDemand: 120,
          competition: 30,
          months: 12,
        });
        break;
      case 'moderate':
        setCustomParams({
          revenueGrowth: 5,
          costGrowth: 3,
          inflationRate: 2,
          marketDemand: 100,
          competition: 50,
          months: 12,
        });
        break;
      case 'worst':
        setCustomParams({
          revenueGrowth: -5,
          costGrowth: 8,
          inflationRate: 5,
          marketDemand: 70,
          competition: 80,
          months: 12,
        });
        break;
    }
  };

  const runSimulation = () => {
    if (!baseData) return;
    
    setLoading(true);
    
    const results: SimulationResult[] = [];
    let cumulativeProfit = 0;
    
    const { avgMonthlyRevenue, avgMonthlyCost } = baseData;
    const { revenueGrowth, costGrowth, inflationRate, marketDemand, competition, months } = customParams;
    
    // Calculate market factor based on demand and competition
    const marketFactor = (marketDemand / 100) * (1 - (competition / 200));
    
    for (let month = 1; month <= months; month++) {
      // Apply growth rates with compounding
      const revenueGrowthRate = (revenueGrowth / 100) / 12;
      const costGrowthRate = (costGrowth / 100) / 12;
      const inflationRateMonthly = (inflationRate / 100) / 12;
      
      // Calculate revenue with growth and market factors
      const revenue = avgMonthlyRevenue * 
        Math.pow(1 + revenueGrowthRate, month) * 
        marketFactor * 
        (1 + (month * 0.01)); // Seasonal variation
      
      // Calculate cost with growth and inflation
      const cost = avgMonthlyCost * 
        Math.pow(1 + costGrowthRate, month) * 
        Math.pow(1 + inflationRateMonthly, month);
      
      const profit = revenue - cost;
      cumulativeProfit += profit;
      
      results.push({
        month,
        revenue,
        cost,
        profit,
        cumulativeProfit,
      });
    }
    
    setSimulationResults(results);
    setLoading(false);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  if (!selectedBusiness) return <div className="p-8 text-center mt-10 text-gray-500">Pilih bisnis terlebih dahulu.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Simulasi Bisnis</h1>
        <p className="text-gray-600 dark:text-gray-400">Analisis skenario dan prediksi kinerja bisnis dengan simulasi what-if</p>
      </div>

      {/* Scenario Selection */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Pilih Skenario</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => { setScenario('best'); applyScenario('best'); }}
            className={`p-4 rounded-lg border-2 transition-all ${
              scenario === 'best' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
            }`}
          >
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-bold text-gray-900 dark:text-white">Skenario Terbaik</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pertumbuhan tinggi, biaya rendah</p>
          </button>
          
          <button
            onClick={() => { setScenario('moderate'); applyScenario('moderate'); }}
            className={`p-4 rounded-lg border-2 transition-all ${
              scenario === 'moderate' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-bold text-gray-900 dark:text-white">Skenario Moderat</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pertumbuhan stabil, kondisi normal</p>
          </button>
          
          <button
            onClick={() => { setScenario('worst'); applyScenario('worst'); }}
            className={`p-4 rounded-lg border-2 transition-all ${
              scenario === 'worst' 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
            }`}
          >
            <div className="text-2xl mb-2">⚠️</div>
            <h3 className="font-bold text-gray-900 dark:text-white">Skenario Terburuk</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pertumbuhan negatif, biaya tinggi</p>
          </button>
        </div>
      </div>

      {/* Custom Parameters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Parameter Simulasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pertumbuhan Pendapatan (%/tahun)
            </label>
            <input
              type="number"
              value={customParams.revenueGrowth}
              onChange={(e) => setCustomParams({ ...customParams, revenueGrowth: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pertumbuhan Biaya (%/tahun)
            </label>
            <input
              type="number"
              value={customParams.costGrowth}
              onChange={(e) => setCustomParams({ ...customParams, costGrowth: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tingkat Inflasi (%/tahun)
            </label>
            <input
              type="number"
              value={customParams.inflationRate}
              onChange={(e) => setCustomParams({ ...customParams, inflationRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Permintaan Pasar (indeks 100)
            </label>
            <input
              type="number"
              value={customParams.marketDemand}
              onChange={(e) => setCustomParams({ ...customParams, marketDemand: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tingkat Kompetisi (indeks 100)
            </label>
            <input
              type="number"
              value={customParams.competition}
              onChange={(e) => setCustomParams({ ...customParams, competition: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durasi Simulasi (bulan)
            </label>
            <input
              type="number"
              value={customParams.months}
              onChange={(e) => setCustomParams({ ...customParams, months: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              min="1"
              max="60"
            />
          </div>
        </div>
        
        <button
          onClick={runSimulation}
          disabled={loading}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Menjalankan Simulasi...' : 'Jalankan Simulasi'}
        </button>
      </div>

      {/* Simulation Results */}
      {simulationResults.length > 0 && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Pendapatan</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(simulationResults.reduce((sum, r) => sum + r.revenue, 0))}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Biaya</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(simulationResults.reduce((sum, r) => sum + r.cost, 0))}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Profit Kumulatif</p>
              <p className={`text-2xl font-bold ${
                simulationResults[simulationResults.length - 1].cumulativeProfit >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(simulationResults[simulationResults.length - 1].cumulativeProfit)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rata-rata Profit/Bulan</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(simulationResults[simulationResults.length - 1].cumulativeProfit / simulationResults.length)}
              </p>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Hasil Simulasi Per Bulan</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Bulan</th>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Pendapatan</th>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Biaya</th>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Profit</th>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Profit Kumulatif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {simulationResults.map((result) => (
                    <tr key={result.month} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-3 text-gray-900 dark:text-white font-medium">Bulan {result.month}</td>
                      <td className="p-3 text-green-600 dark:text-green-400">{formatCurrency(result.revenue)}</td>
                      <td className="p-3 text-red-600 dark:text-red-400">{formatCurrency(result.cost)}</td>
                      <td className={`p-3 font-bold ${result.profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(result.profit)}
                      </td>
                      <td className={`p-3 font-bold ${result.cumulativeProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(result.cumulativeProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Insight & Rekomendasi</h2>
            <div className="space-y-3">
              {simulationResults[simulationResults.length - 1].cumulativeProfit < 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="font-medium text-red-700 dark:text-red-400">⚠️ Peringatan: Simulasi menunjukkan kerugian</p>
                  <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                    Pertimbangkan untuk mengurangi biaya operasional atau meningkatkan strategi pemasaran.
                  </p>
                </div>
              )}
              
              {customParams.revenueGrowth < 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">📉 Pertumbuhan Pendapatan Negatif</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                    Fokus pada inovasi produk dan ekspansi pasar untuk membalikkan tren negatif.
                  </p>
                </div>
              )}
              
              {customParams.costGrowth > 10 && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="font-medium text-orange-700 dark:text-orange-400">💰 Pertumbuhan Biaya Tinggi</p>
                  <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">
                    Evaluasi efisiensi operasional dan cari cara untuk mengoptimalkan pengeluaran.
                  </p>
                </div>
              )}
              
              {simulationResults[simulationResults.length - 1].cumulativeProfit > 0 && customParams.revenueGrowth > 10 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="font-medium text-green-700 dark:text-green-400">✅ Prospek Bisnis Baik</p>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                    Simulasi menunjukkan pertumbuhan positif. Pertimbangkan ekspansi atau investasi tambahan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}