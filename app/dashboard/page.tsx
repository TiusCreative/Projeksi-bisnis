'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/app/context/BusinessContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function DashboardPage() {
  const { selectedBusiness } = useBusiness();
  const [cashflows, setCashflows] = useState<any[]>([]);
  const [projections, setProjections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterMonth, setFilterMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (!selectedBusiness) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const cfQuery = query(collection(db, 'cashflows'), where('business_id', '==', selectedBusiness.id));
        const projQuery = query(collection(db, 'projections'), where('business_id', '==', selectedBusiness.id));
        
        const [cfSnap, projSnap] = await Promise.all([getDocs(cfQuery), getDocs(projQuery)]);
        
        setCashflows(cfSnap.docs.map(doc => doc.data()));
        setProjections(projSnap.docs.map(doc => doc.data()));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBusiness]);

  if (!selectedBusiness) return <div className="p-8 text-gray-500">Pilih bisnis terlebih dahulu.</div>;
  if (loading) return <div className="p-8 text-gray-500">Memuat data dashboard...</div>;

  // Filter Data berdasarkan Bulan
  const filteredCashflows = cashflows.filter(c => c.date && c.date.startsWith(filterMonth));
  const filteredProjections = projections.filter(p => {
    if (!p.created_at) return false;
    // Tangani Timestamp Firebase
    const dateObj = typeof p.created_at.toDate === 'function' ? p.created_at.toDate() : new Date(p.created_at.seconds * 1000);
    const pMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    return pMonth === filterMonth;
  });

  const totalIncome = filteredCashflows.filter(c => c.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const totalExpense = filteredCashflows.filter(c => c.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
  const balance = totalIncome - totalExpense;

  // Mengelompokkan data cashflow harian untuk Chart Omzet & Cashflow
  const dailyDataMap = new Map();
  filteredCashflows.forEach(c => {
    const day = c.date.split('-')[2]; // Mengambil tanggal (DD) dari string YYYY-MM-DD
    if (!dailyDataMap.has(day)) {
      dailyDataMap.set(day, { name: `${day} ${new Date(filterMonth).toLocaleString('id-ID', { month: 'short' })}`, omzet: 0, pengeluaran: 0 });
    }
    if (c.type === 'income') {
      dailyDataMap.get(day).omzet += c.amount;
    } else if (c.type === 'expense') {
      dailyDataMap.get(day).pengeluaran += c.amount;
    }
  });
  const timeSeriesChartData = Array.from(dailyDataMap.values()).sort((a, b) => parseInt(a.name) - parseInt(b.name));

  const cashflowChartData = [
    { name: 'Pemasukan', amount: totalIncome, fill: '#10b981' },
    { name: 'Pengeluaran', amount: totalExpense, fill: '#ef4444' }
  ];

  const projectionChartData = filteredProjections.map((p, index) => ({
    name: `Proyeksi ${index + 1}`,
    profit: p.result?.profit || 0,
    pendapatan: p.result?.totalPendapatan || 0,
  }));

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard: {selectedBusiness.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">Ringkasan performa finansial bisnis Anda.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Bulan Laporan:</label>
          <input 
            type="month" 
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="bg-transparent border-none outline-none text-gray-900 dark:text-white font-semibold cursor-pointer" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pemasukan Kas</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pengeluaran Kas</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-indigo-500">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Kas Bersih</h3>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{formatCurrency(balance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Perbandingan Cashflow</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `Rp${val / 1000}k`} />
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Tren Proyeksi Pendapatan vs Profit</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `Rp${val / 1000}k`} />
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Legend />
                <Line type="monotone" dataKey="pendapatan" name="Pendapatan Kasar" stroke="#6366f1" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" name="Net Profit (Bersih)" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Omzet dan Cashflow Harian */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Grafik Omzet & Pengeluaran Harian</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => `Rp${val / 1000}k`} />
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
              <Legend />
              <Line type="monotone" dataKey="omzet" name="Omzet (Pemasukan)" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#ef4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}