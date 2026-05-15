'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useBusiness } from '@/app/context/BusinessContext';

export default function CreateBusinessPage() {
  const router = useRouter();
  const { refreshBusinesses } = useBusiness();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [targetOmzet, setTargetOmzet] = useState('');
  const [address, setAddress] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = auth.currentUser;
    if (!user) {
      setError('Anda harus login untuk membuat bisnis.');
      return;
    }

    if (!name.trim()) {
      setError('Nama bisnis wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      await addDoc(collection(db, 'businesses'), {
        name: name.trim(),
        category: category.trim(),
        target_omzet: Number(targetOmzet) || 0,
        address: address.trim(),
        owner_id: user.uid,
        members: [user.uid],
        roles: {
          [user.uid]: 'Owner'
        },
        created_at: serverTimestamp()
      });

      // Perbarui state bisnis secara global
      refreshBusinesses();
      
      // Arahkan kembali ke dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Gagal membuat bisnis:', err);
      setError('Terjadi kesalahan saat membuat bisnis: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buat Bisnis Baru</h1>
        <p className="text-gray-600 dark:text-gray-400">Silakan masukkan detail bisnis Anda</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Bisnis *</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Contoh: Toko Maju Jaya" required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori Bisnis</label>
          <input id="category" type="text" value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Contoh: Retail, F&B, Jasa"
          />
        </div>

        <div>
          <label htmlFor="targetOmzet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Omzet Bulanan (Rp)</label>
          <input id="targetOmzet" type="number" value={targetOmzet} onChange={(e) => setTargetOmzet(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Contoh: 50000000"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Bisnis</label>
          <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Alamat lengkap..." rows={3}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Batal</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-none">{isLoading ? 'Menyimpan...' : 'Buat Bisnis'}</button>
        </div>
      </form>
    </div>
  );
}