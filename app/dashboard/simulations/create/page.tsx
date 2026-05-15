'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/app/context/BusinessContext';
import { SimulationEngine, SimulationInput } from '@/lib/simulation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CreateSimulationPage() {
  const router = useRouter();
  const { selectedBusiness } = useBusiness();
  
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<SimulationInput['scenario']>('sales_increase');
  const [baseRevenue, setBaseRevenue] = useState('50000000');
  const [baseExpense, setBaseExpense] = useState('35000000');
  const [percentage, setPercentage] = useState('10');
  const [branches, setBranches] = useState('1');
  const [employees, setEmployees] = useState('1');
  const [newPrice, setNewPrice] = useState('600000');
  const [result, setResult] = useState<any>(null);

  const handleSimulate = () => {
    const input: SimulationInput = {
      baseRevenue: parseFloat(baseRevenue),
      baseExpense: parseFloat(baseExpense),
      scenario,
      parameters: {
        percentage: parseFloat(percentage),
        branches: parseInt(branches),
        employees: parseInt(employees),
        newPrice: parseFloat(newPrice),
      },
    };

    const simulation = SimulationEngine.runSimulation(input);
    setResult(simulation);
  };

  const handleSave = async () => {
    if (!selectedBusiness || !result) {
      alert('Pilih bisnis dan jalankan simulasi terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'simulations'), {
        business_id: selectedBusiness.id,
        scenario,
        input: {
          baseRevenue: parseFloat(baseRevenue),
          baseExpense: parseFloat(baseExpense),
          parameters: result.impact,
        },
        result,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      router.push('/dashboard/simulations');
    } catch (error: any) {
      alert('Gagal menyimpan simulasi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 inline-flex items-center gap-2"
        >
          ← Kembali
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Simulasi Bisnis</h1>
        <p className="text-gray-600 dark:text-gray-400">Uji berbagai skenario bisnis Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Parameter Simulasi</h2>
          
          <div className="space-y-6">
            {/* Scenario Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skenario
              </label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value as SimulationInput['scenario'])}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              >
                <option value="sales_increase">Penjualan Naik</option>
                <option value="sales_decrease">Penjualan Turun</option>
                <option value="cost_increase">Biaya Naik</option>
                <option value="add_branch">Tambah Cabang</option>
                <option value="add_employee">Tambah Pegawai</option>
                <option value="price_change">Ubah Harga</option>
              </select>
            </div>

            {/* Base Revenue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pemasukan Bulanan Saat Ini (Rp)
              </label>
              <input
                type="number"
                value={baseRevenue}
                onChange={(e) => setBaseRevenue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="50000000"
              />
            </div>

            {/* Base Expense */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pengeluaran Bulanan Saat Ini (Rp)
              </label>
              <input
                type="number"
                value={baseExpense}
                onChange={(e) => setBaseExpense(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="35000000"
              />
            </div>

            {/* Dynamic Parameters */}
            {(scenario === 'sales_increase' || scenario === 'sales_decrease' || scenario === 'cost_increase') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Persentase Perubahan (%)
                </label>
                <input
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="10"
                />
              </div>
            )}

            {scenario === 'add_branch' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jumlah Cabang Baru
                </label>
                <input
                  type="number"
                  value={branches}
                  onChange={(e) => setBranches(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="1"
                />
              </div>
            )}

            {scenario === 'add_employee' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jumlah Pegawai Baru
                </label>
                <input
                  type="number"
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="1"
                />
              </div>
            )}

            {scenario === 'price_change' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Harga Baru per Unit (Rp)
                </label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="600000"
                />
              </div>
            )}

            <button
              onClick={handleSimulate}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Jalankan Simulasi
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hasil Simulasi: {result.scenario}</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Profit Sebelum</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(result.before.profit)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Profit Sesudah</span>
                  <span className={`font-medium ${result.after.profit >= 0 ? 'text-green-600' : 'text-red-600'} dark:text-white`}>
                    {formatCurrency(result.after.profit)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-400">Perubahan Profit</span>
                  <span className={`font-bold ${result.impact.profitChange >= 0 ? 'text-green-600' : 'text-red-600'} dark:text-white`}>
                    {result.impact.profitChangePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Perbandingan Profit</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.monthlyData}>
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

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan Simulasi'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
