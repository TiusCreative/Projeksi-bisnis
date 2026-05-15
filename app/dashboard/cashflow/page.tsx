'use client';

import { useState, useEffect } from 'react';
import { useBusiness } from '@/app/context/BusinessContext';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

export default function CashflowPage() {
  const { selectedBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [cashflows, setCashflows] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    category: 'Penjualan',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchCashflows = async () => {
    if (!selectedBusiness) return;
    try {
      const q = query(collection(db, 'cashflows'), where('business_id', '==', selectedBusiness.id));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Mengurutkan data berdasarkan tanggal terbaru secara lokal
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setCashflows(data);
    } catch (error) {
      console.error('Error fetching cashflows:', error);
    }
  };

  useEffect(() => {
    fetchCashflows();
  }, [selectedBusiness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness || !auth.currentUser) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'cashflows'), {
        business_id: selectedBusiness.id,
        user_id: auth.currentUser.uid,
        type: formData.type,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        description: formData.description,
        created_at: serverTimestamp()
      });

      setFormData({ ...formData, amount: '', description: '' });
      fetchCashflows();
      alert('Data cashflow berhasil dicatat!');
    } catch (error) {
      console.error('Error adding cashflow:', error);
      alert('Gagal mencatat cashflow.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  if (!selectedBusiness) return <div className="p-8 text-center text-gray-500 mt-10">Silakan pilih bisnis terlebih dahulu dari menu di atas.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pencatatan Cashflow</h1>
        <p className="text-gray-600 dark:text-gray-400">Catat pemasukan dan pengeluaran untuk <strong>{selectedBusiness.name}</strong>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Input */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6">
            <button type="button" onClick={() => setFormData({ ...formData, type: 'income', category: 'Penjualan' })} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${formData.type === 'income' ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Pemasukan</button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'expense', category: 'Operasional' })} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${formData.type === 'expense' ? 'bg-white dark:bg-gray-800 text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Pengeluaran</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tanggal Transaksi</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-3 border border-gray-300 rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Kategori</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 border border-gray-300 rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500">
                {formData.type === 'income' ? (
                  <>
                    <option value="Penjualan">Penjualan / Sales</option>
                    <option value="Layanan">Layanan / Jasa</option>
                    <option value="Investasi">Investasi / Modal</option>
                    <option value="Lainnya">Pemasukan Lainnya</option>
                  </>
                ) : (
                  <>
                    <option value="Operasional">Operasional</option>
                    <option value="Bahan Baku">Bahan Baku (HPP)</option>
                    <option value="Gaji Karyawan">Gaji Karyawan</option>
                    <option value="Sewa & Utilitas">Sewa & Listrik</option>
                    <option value="Marketing">Marketing / Iklan</option>
                    <option value="Lainnya">Pengeluaran Lainnya</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nominal (Rp)</label>
              <input type="number" required min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="Contoh: 150000" className="w-full p-3 border border-gray-300 rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Keterangan (Opsional)</label>
              <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Catatan transaksi..." className="w-full p-3 border border-gray-300 rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <button type="submit" disabled={loading} className={`w-full font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 text-white ${formData.type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
              {loading ? 'Menyimpan...' : `Catat ${formData.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`}
            </button>
          </form>
        </div>

        {/* Daftar Transaksi */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Riwayat Transaksi</h3>
          {cashflows.length === 0 ? (
            <div className="text-center p-8 text-gray-500">Belum ada transaksi yang dicatat.</div>
          ) : (
            <div className="space-y-4">
              {cashflows.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>{item.type === 'income' ? '↓' : '↑'}</div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{item.category}</p>
                      <p className="text-sm text-gray-500">{item.date} {item.description && `• ${item.description}`}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}