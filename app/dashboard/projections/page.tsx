'use client';

import { useState, useEffect } from 'react';
import { useBusiness } from '@/app/context/BusinessContext';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ProjectionsPage() {
  const { selectedBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [savedProjections, setSavedProjections] = useState<any[]>([]);
  
  // State Form Input
  const [inputs, setInputs] = useState({
    modalAwal: 10000000,
    fixedCost: 3000000,
    variableCost: 15000,
    hargaJual: 35000,
    targetPenjualan: 500,
    growthRate: 5 // Asumsi pertumbuhan 5% per bulan
  });

  // State Hasil Kalkulasi
  const [result, setResult] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);

  const fetchProjections = async () => {
    if (!selectedBusiness) return;
    try {
      const q = query(collection(db, 'projections'), where('business_id', '==', selectedBusiness.id));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Urutkan lokal berdasarkan created_at karena index composite firebase mungkin belum dibuat
      data.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
      setSavedProjections(data);
    } catch (error) {
      console.error('Error fetching projections:', error);
    }
  };

  useEffect(() => {
    fetchProjections();
  }, [selectedBusiness]);

  // Fungsi Kalkulasi BEP, ROI, Profit, dan Growth
  const calculateProjection = () => {
    const { modalAwal, fixedCost, variableCost, hargaJual, targetPenjualan, growthRate } = inputs;
    
    // 1. BEP (Break Even Point)
    const marginPerUnit = hargaJual - variableCost;
    const bepUnit = marginPerUnit > 0 ? Math.ceil(fixedCost / marginPerUnit) : 0;
    const bepRupiah = bepUnit * hargaJual;

    // 2. Proyeksi Bulan Pertama
    const totalPendapatan = targetPenjualan * hargaJual;
    const totalBiayaVariable = targetPenjualan * variableCost;
    const totalBiaya = fixedCost + totalBiayaVariable;
    const profit = totalPendapatan - totalBiaya;

    // 3. ROI (Return on Investment) per bulan
    const roi = modalAwal > 0 ? (profit / modalAwal) * 100 : 0;

    setResult({ bepUnit, bepRupiah, totalPendapatan, totalBiaya, profit, roi });

    // 4. Forecast Growth (y = a(1+r)^t) untuk 12 Bulan
    const forecast = [];
    let currentRevenue = totalPendapatan;
    let currentProfit = profit;
    const rate = growthRate / 100;

    for (let i = 1; i <= 12; i++) {
      forecast.push({
        bulan: `Bulan ${i}`,
        pendapatan: Math.round(currentRevenue),
        profit: Math.round(currentProfit)
      });
      currentRevenue = currentRevenue * (1 + rate);
      // Asumsi simple: Profit margin ratio tetap sama
      currentProfit = currentProfit * (1 + rate); 
    }
    setForecastData(forecast);
  };

  // Hitung ulang otomatis saat input berubah
  useEffect(() => {
    calculateProjection();
  }, [inputs]);

  const handleSaveProjection = async () => {
    if (!selectedBusiness || !auth.currentUser || !result) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'projections'), {
        business_id: selectedBusiness.id,
        user_id: auth.currentUser.uid,
        inputs,
        result,
        forecast: forecastData,
        created_at: serverTimestamp()
      });
      alert('Proyeksi berhasil disimpan!');
      fetchProjections();
    } catch (error) {
      console.error('Error saving projection:', error);
      alert('Gagal menyimpan proyeksi.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  if (!selectedBusiness) return <div className="p-8 text-center text-gray-500 mt-10">Pilih bisnis terlebih dahulu dari dropdown Header.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Proyeksi & Analisis Bisnis</h1>
        <p className="text-gray-600 dark:text-gray-400">Hitung kelayakan bisnis, BEP, ROI, dan estimasi pertumbuhan untuk <strong>{selectedBusiness.name}</strong>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Panel Kiri: Form Input Variabel */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit space-y-6">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">Variabel Asumsi</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Modal Awal / Investasi</label>
              <input type="number" value={inputs.modalAwal} onChange={(e) => setInputs({...inputs, modalAwal: Number(e.target.value)})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fixed Cost (Biaya Tetap/Bulan)</label>
              <input type="number" value={inputs.fixedCost} onChange={(e) => setInputs({...inputs, fixedCost: Number(e.target.value)})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Variable Cost (Biaya/Unit)</label>
              <input type="number" value={inputs.variableCost} onChange={(e) => setInputs({...inputs, variableCost: Number(e.target.value)})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Harga Jual per Unit</label>
              <input type="number" value={inputs.hargaJual} onChange={(e) => setInputs({...inputs, hargaJual: Number(e.target.value)})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target Sales</label>
                <input type="number" value={inputs.targetPenjualan} onChange={(e) => setInputs({...inputs, targetPenjualan: Number(e.target.value)})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 outline-none focus:border-indigo-500" placeholder="Unit" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Growth (%)</label>
                <input type="number" value={inputs.growthRate} onChange={(e) => setInputs({...inputs, growthRate: Number(e.target.value)})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 outline-none focus:border-indigo-500" placeholder="%" />
              </div>
            </div>
          </div>

          <button onClick={handleSaveProjection} disabled={loading || !result} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan Skenario Ini'}
          </button>
        </div>

        {/* Panel Kanan: Hasil & Grafik */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Cards Hasil Ringkasan */}
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-500 mb-1">TARGET PROFIT BULAN 1</p>
                <p className={`text-xl font-bold ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(result.profit)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-500 mb-1">ROI / BULAN</p>
                <p className={`text-xl font-bold ${result.roi >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{result.roi.toFixed(2)}%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-500 mb-1">BEP (UNIT TERJUAL)</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{result.bepUnit} Unit</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-500 mb-1">BEP (RUPIAH)</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.bepRupiah)}</p>
              </div>
            </div>
          )}

          {/* Chart Growth Forecast */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Grafik Proyeksi Pertumbuhan (12 Bulan)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="bulan" textAnchor="end" height={50} />
                  <YAxis tickFormatter={(val) => `Rp${val / 1000000}M`} />
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                  <Legend />
                  <Line type="monotone" dataKey="pendapatan" name="Proyeksi Pendapatan" stroke="#6366f1" strokeWidth={3} />
                  <Line type="monotone" dataKey="profit" name="Proyeksi Profit Bersih" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Riwayat Skenario yang Disimpan */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Riwayat Skenario Disimpan</h3>
            {savedProjections.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada skenario proyeksi yang disimpan.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400">
                    <tr>
                      <th className="p-3 rounded-l-lg">Tanggal</th>
                      <th className="p-3">Target Profit</th>
                      <th className="p-3">BEP Unit</th>
                      <th className="p-3">Growth Rate</th>
                      <th className="p-3 rounded-r-lg text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {savedProjections.map(proj => (
                      <tr key={proj.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-3">{new Date(proj.created_at?.seconds * 1000).toLocaleDateString('id-ID')}</td>
                        <td className="p-3 font-medium text-green-600">{formatCurrency(proj.result?.profit || 0)}</td>
                        <td className="p-3">{proj.result?.bepUnit} Unit</td>
                        <td className="p-3">{proj.inputs?.growthRate}%</td>
                        <td className="p-3 text-right">
                          <button onClick={() => setInputs(proj.inputs)} className="text-indigo-600 hover:text-indigo-800 font-medium">Muat Skenario</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}