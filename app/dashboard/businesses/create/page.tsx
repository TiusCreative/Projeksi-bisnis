'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useBusiness } from '@/app/context/BusinessContext';
import Link from 'next/link';

export default function CreateBusinessPage() {
  const router = useRouter();
  const { fetchBusinesses } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Retail',
    logo_url: '',
    address: '',
    target_omzet: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('Anda harus login terlebih dahulu.');
      return;
    }
    
    setLoading(true);

    try {
      // Simpan data bisnis ke Firebase
      await addDoc(collection(db, 'businesses'), {
        name: formData.name,
        category: formData.category,
        logo_url: formData.logo_url,
        address: formData.address,
        target_omzet: Number(formData.target_omzet),
        owner_id: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        roles: {
          [auth.currentUser.uid]: 'owner'
        },
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      // Update state global dari Context jika fungsi fetch tersedia
      if (fetchBusinesses) await fetchBusinesses();
      
      alert('Bisnis berhasil dibuat!');
      router.push('/dashboard/businesses');
    } catch (error) {
      console.error('Error creating business:', error);
      alert('Terjadi kesalahan saat membuat bisnis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">
      <Link href="/dashboard/businesses" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-block">← Kembali ke Daftar Bisnis</Link>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Buat Bisnis Baru</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Masukkan informasi dasar untuk mendaftarkan bisnis Anda ke sistem.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nama Bisnis *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="Contoh: Toko Sembako Berkah" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Kategori Bisnis</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="Retail">Retail / Toko</option>
                <option value="F&B">F&B / Kuliner</option>
                <option value="Jasa">Jasa / Layanan</option>
                <option value="Teknologi">Teknologi / Startup</option>
                <option value="Manufaktur">Manufaktur / Produksi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Target Omzet Bulanan (Rp)</label>
              <input type="number" value={formData.target_omzet || ''} onChange={(e) => setFormData({...formData, target_omzet: Number(e.target.value)})} className="w-full p-3 border border-gray-300 rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="50000000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Alamat (Opsional)</label>
            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500" rows={3} placeholder="Alamat lengkap bisnis Anda" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL Logo (Opsional)</label>
            <input type="url" value={formData.logo_url} onChange={(e) => setFormData({...formData, logo_url: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://example.com/logo.png" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan Bisnis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}