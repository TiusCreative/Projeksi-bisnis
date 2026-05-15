'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ExportButtons from '@/app/components/ExportButtons';

export default function ProjectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectionId = params.id as string;
  
  const [projection, setProjection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjection = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'projections', projectionId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProjection({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert('Proyeksi tidak ditemukan');
          router.push('/dashboard/projections');
        }
      } catch (error) {
        console.error('Error fetching projection:', error);
        alert('Gagal memuat proyeksi');
        router.push('/dashboard/projections');
      } finally {
        setLoading(false);
      }
    };

    fetchProjection();
  }, [projectionId, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!projection) {
    return null;
  }

  const { input, result } = projection;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2 inline-flex items-center gap-2"
          >
            ← Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Detail Proyeksi</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Dibuat pada {formatDate(projection.created_at)}
          </p>
        </div>
        <ExportButtons
          data={[projection]}
          filename={`proyeksi-${projectionId}`}
          title="Laporan Proyeksi Bisnis"
          businessName={input.name || 'Bisnis'}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">BEP</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.bep.toFixed(2)} unit</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {formatCurrency(result.bep * input.harga_jual)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ROI</span>
            <span className="text-2xl">📈</span>
          </div>
          <p className={`text-2xl font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'} dark:text-white`}>
            {result.roi.toFixed(2)}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Bulanan</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className={`text-2xl font-bold ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'} dark:text-white`}>
            {formatCurrency(result.profit)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Tahunan</span>
            <span className="text-2xl">🎯</span>
          </div>
          <p className={`text-2xl font-bold ${result.summary.annual_profit >= 0 ? 'text-green-600' : 'text-red-600'} dark:text-white`}>
            {formatCurrency(result.summary.annual_profit)}
          </p>
        </div>
      </div>

      {/* Input Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Input Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Modal Awal</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(input.modal_awal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Biaya Operasional</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(input.biaya_operasional)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Sumbangan Investor</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(input.sumbangan_investor)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Pendapatan Iklan</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(input.pendapatan_iklan)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Target Penjualan</span>
            <span className="font-medium text-gray-900 dark:text-white">{input.target_penjualan} unit</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Harga Jual</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(input.harga_jual)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Biaya Produksi</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(input.biaya_produksi)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Pertumbuhan</span>
            <span className="font-medium text-gray-900 dark:text-white">{input.pertumbuhan_penjualan}%/bulan</span>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Forecast 12 Bulan</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={result.forecast_growth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" label={{ value: 'Bulan', position: 'insideBottom', offset: -5 }} />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} name="Pemasukan" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Pengeluaran" />
            <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Rincian Bulanan</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Bulan</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Pemasukan</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Pengeluaran</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Profit</th>
              </tr>
            </thead>
            <tbody>
              {result.forecast_growth.map((month: any, index: number) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{month.month}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">{formatCurrency(month.revenue)}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">{formatCurrency(month.expenses)}</td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'} dark:text-white`}>
                    {formatCurrency(month.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
