'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/app/context/BusinessContext';
import { cashflowService } from '@/lib/cashflow';
import { INCOME_CATEGORIES } from '@/lib';

export default function AddIncomePage() {
  const router = useRouter();
  const { selectedBusiness } = useBusiness();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: INCOME_CATEGORIES[0],
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedBusiness) {
      setError('Pilih bisnis terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const result = await cashflowService.addTransaction({
        business_id: selectedBusiness.id,
        type: 'income',
        category: formData.category,
        amount: parseFloat(formData.amount) || 0,
        date: new Date(formData.date),
        description: formData.description,
      });

      if (result.success) {
        router.push('/dashboard/cashflow');
      } else {
        setError(result.error || 'Gagal menambah pemasukan');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 inline-flex items-center gap-2"
        >
          ← Kembali
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Catat Pemasukan</h1>
        <p className="text-gray-600 dark:text-gray-400">Tambah transaksi pemasukan baru</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kategori *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
          >
            {INCOME_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Jumlah (Rp) *
          </label>
          <input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            min="0"
            step="1000"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            placeholder="0"
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tanggal *
          </label>
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Deskripsi
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
            placeholder="Deskripsi transaksi"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
}
