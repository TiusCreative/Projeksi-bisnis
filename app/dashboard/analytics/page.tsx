'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/app/context/BusinessContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mendefinisikan tipe untuk hasil analisis
type AnalysisResult = {
  revenueForecast: { month: string; revenue: number }[];
  priceRecommendation: string | null;
  lossWarning: string | null;
  costSavingSuggestion: string | null;
};

export default function AnalyticsPage() {
  const { selectedBusiness } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [projections, setProjections] = useState<any[]>([]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  useEffect(() => {
    const fetchDataAndAnalyze = async () => {
      if (!selectedBusiness) return;
      setLoading(true);
      try {
        // 1. Mengambil data proyeksi
        const q = query(collection(db, 'projections'), where('business_id', '==', selectedBusiness.id));
        const snapshot = await getDocs(q);
        const projectionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjections(projectionsData);

        if (projectionsData.length === 0) {
          setAnalysis(null);
          return;
        }

        // 2. Mensimulasikan Analisis AI
        const analysisResult = performAnalysis(projectionsData);
        setAnalysis(analysisResult);

      } catch (error) {
        console.error("Error fetching or analyzing data:", error);
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndAnalyze();
  }, [selectedBusiness]);

  // Fungsi ini mensimulasikan analisis AI berdasarkan data yang diambil
  const performAnalysis = (data: any[]): AnalysisResult => {
    // --- Prediksi Omzet ---
    const avgMonthlyRevenue = data.reduce((acc, p) => acc + (p.result?.totalPendapatan || 0), 0) / data.length;
    const revenueForecast = [
      { month: 'Bulan+1', revenue: avgMonthlyRevenue * 1.05 }, // Asumsi pertumbuhan sederhana 5%
      { month: 'Bulan+2', revenue: avgMonthlyRevenue * 1.10 },
      { month: 'Bulan+3', revenue: avgMonthlyRevenue * 1.15 },
    ];

    // --- Rekomendasi Harga ---
    let priceRecommendation: string | null = null;
    const profitableProjections = data.filter(p => p.result?.profit > 0);
    if (profitableProjections.length > 0) {
      const bestProjection = profitableProjections.reduce((max, p) => (p.result.roi > max.result.roi ? p : max), profitableProjections[0]);
      const mainProduct = bestProjection.inputs?.revenueItems?.find((item: any) => item.type === 'unit_based');
      if (mainProduct && mainProduct.unit_price > 0) {
        priceRecommendation = `Proyeksi dengan ROI tertinggi (${bestProjection.result.roi.toFixed(1)}%) menggunakan harga jual ${formatCurrency(mainProduct.unit_price)} per unit. Pertimbangkan untuk mengadaptasi strategi harga ini.`;
      }
    } else {
        priceRecommendation = "Semua proyeksi menunjukkan profit negatif. Tinjau kembali struktur harga dan biaya Anda secara fundamental untuk mencapai profitabilitas.";
    }

    // --- Peringatan Kerugian ---
    let lossWarning: string | null = null;
    const lossProjections = data.filter(p => p.result?.profit < 0);
    if (lossProjections.length > 0) {
      lossWarning = `Terdapat ${lossProjections.length} dari ${data.length} proyeksi yang mengindikasikan kerugian. Perlu perhatian khusus pada skenario ini untuk mitigasi risiko.`;
    }

    // --- Rekomendasi Penghematan ---
    let costSavingSuggestion: string | null = null;
    const allCosts: { name: string, amount: number }[] = [];
    data.forEach(p => {
        p.inputs?.costItems?.forEach((cost: any) => {
            const totalCost = cost.type === 'variable' ? (cost.unit_cost * (p.inputs.revenueItems.find((r:any) => r.type === 'unit_based')?.estimated_units || 0)) : cost.amount;
            if (cost.name && totalCost > 0) allCosts.push({ name: cost.name, amount: totalCost });
        });
    });
    
    if (allCosts.length > 0) {
        const costSummary = allCosts.reduce((acc, cost) => {
            acc[cost.name] = (acc[cost.name] || 0) + cost.amount;
            return acc;
        }, {} as Record<string, number>);

        const topCost = Object.entries(costSummary).sort(([,a],[,b]) => b-a)[0];
        if (topCost) {
            costSavingSuggestion = `Biaya terbesar Anda adalah "${topCost[0]}". Fokus pada negosiasi atau efisiensi di area ini dapat memberikan penghematan signifikan.`;
        }
    }

    return { revenueForecast, priceRecommendation, lossWarning, costSavingSuggestion };
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-12 text-gray-500">🧠 Menganalisis data bisnis Anda...</div>;
    }

    if (!analysis || projections.length === 0) {
      return (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Data Tidak Cukup</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            AI membutuhkan setidaknya satu data proyeksi untuk dapat melakukan analisis. Silakan buat proyeksi bisnis terlebih dahulu.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 col-span-1 lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📈 Prediksi Omzet (3 Bulan ke Depan)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={analysis.revenueForecast} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value as number)} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="revenue" name="Prediksi Omzet" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {analysis.priceRecommendation && <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">💡 Rekomendasi Harga</h3><p className="text-gray-700 dark:text-gray-300">{analysis.priceRecommendation}</p></div>}
        {analysis.costSavingSuggestion && <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">💰 Rekomendasi Penghematan</h3><p className="text-gray-700 dark:text-gray-300">{analysis.costSavingSuggestion}</p></div>}
        {analysis.lossWarning && <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800 col-span-1 lg:col-span-2"><h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-3">⚠️ Prediksi Kerugian</h3><p className="text-red-700 dark:text-red-300">{analysis.lossWarning}</p></div>}
      </div>
    );
  };

  if (!selectedBusiness) return <div className="p-8 text-gray-500">Pilih bisnis terlebih dahulu.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Business Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Dapatkan insight dan rekomendasi cerdas untuk bisnis Anda.</p>
      </div>
      {renderContent()}
    </div>
  );
}