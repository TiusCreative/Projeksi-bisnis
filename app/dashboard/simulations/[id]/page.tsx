'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ExportButtons from '@/app/components/ExportButtons';

export default function SimulationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const simulationId = params.id as string;
  
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimulation = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'simulations', simulationId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSimulation({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert('Simulasi tidak ditemukan');
          router.push('/dashboard/simulations');
        }
      } catch (error) {
        console.error('Error fetching simulation:', error);
        alert('Gagal memuat simulasi');
        router.push('/dashboard/simulations');
      } finally {
        setLoading(false);
      }
    };

    fetchSimulation();
  }, [simulationId, router]);

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

  if (!simulation) {
    return null;
  }

  const { result } = simulation;

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Detail Simulasi</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {result?.scenario} - Dibuat pada {formatDate(simulation.created_at)}
          </p>
        </div>
        <ExportButtons
          data={[simulation]}
          filename={`simulasi-${simulationId}`}
          title="Laporan Simulasi Bisnis"
          businessName="Simulasi"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Sebelum</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(result?.before?.profit || 0)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Sesudah</span>
            <span className="text-2xl">🎯</span>
          </div>
          <p className={`text-2xl font-bold ${result?.after?.profit >= 0 ? 'text-green-600' : 'text-red-600'} dark:text-white`}>
            {formatCurrency(result?.after?.profit || 0)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Perubahan Profit</span>
            <span className="text-2xl">📈</span>
          </div>
          <p className={`text-2xl font-bold ${result?.impact?.profitChange >= 0 ? 'text-green-600' : 'text-red-600'} dark:text-white`}>
            {result?.impact?.profitChangePercent?.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Perbandingan Profit Bulanan</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={result?.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="beforeProfit" fill="#94a3b8" name="Sebelum" />
            <Bar dataKey="afterProfit" fill="#4f46e5" name="Sesudah" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Rincian Perbandingan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sebelum Simulasi</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Pemasukan</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(result?.before?.revenue || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Pengeluaran</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(result?.before?.expense || 0)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Profit</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(result?.before?.profit || 0)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sesudah Simulasi</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Pemasukan</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(result?.after?.revenue || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Pengeluaran</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(result?.after?.expense || 0)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Profit</span>
                <span className={`font-medium ${result?.after?.profit >= 0 ? 'text-green-600' : 'text-red-600'} dark:text-white`}>
                  {formatCurrency(result?.after?.profit || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Dampak Simulasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Perubahan Pemasukan</p>
            <p className={`text-lg font-bold text-blue-900 dark:text-blue-100 ${result?.impact?.revenueChange >= 0 ? '' : 'text-red-600'}`}>
              {formatCurrency(result?.impact?.revenueChange || 0)}
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300 mb-1">Perubahan Pengeluaran</p>
            <p className={`text-lg font-bold text-red-900 dark:text-red-100 ${result?.impact?.expenseChange >= 0 ? '' : 'text-green-600'}`}>
              {formatCurrency(result?.impact?.expenseChange || 0)}
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 mb-1">Perubahan Profit</p>
            <p className={`text-lg font-bold text-green-900 dark:text-green-100 ${result?.impact?.profitChange >= 0 ? '' : 'text-red-600'}`}>
              {formatCurrency(result?.impact?.profitChange || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
