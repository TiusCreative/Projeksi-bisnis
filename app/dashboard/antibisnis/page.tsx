'use client';

import { useState, useEffect } from 'react';
import { useBusiness } from '@/app/context/BusinessContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

interface BlacklistItem {
  id?: string;
  name: string;
  type: 'customer' | 'supplier' | 'partner';
  reason: string;
  date: string;
}

export default function AntiBisnisPage() {
  const { selectedBusiness } = useBusiness();
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'customer' as 'customer' | 'supplier' | 'partner',
    reason: '',
  });

  useEffect(() => {
    const fetchBlacklist = async () => {
      if (!selectedBusiness) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'blacklist'), where('business_id', '==', selectedBusiness.id));
        const snapshot = await getDocs(q);
        setBlacklist(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlacklistItem)));
      } catch (error) {
        console.error('Error fetching blacklist:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlacklist();
  }, [selectedBusiness]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness || !formData.name || !formData.reason) return;

    try {
      await addDoc(collection(db, 'blacklist'), {
        ...formData,
        business_id: selectedBusiness.id,
        date: new Date().toISOString(),
      });
      setFormData({ name: '', type: 'customer', reason: '' });
      setShowForm(false);
      const q = query(collection(db, 'blacklist'), where('business_id', '==', selectedBusiness.id));
      const snapshot = await getDocs(q);
      setBlacklist(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlacklistItem)));
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      alert('Gagal menambahkan ke blacklist');
    }
  };

  const handleRemove = async (id: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'blacklist', id));
      setBlacklist(blacklist.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      alert('Gagal menghapus dari blacklist');
    }
  };

  if (!selectedBusiness) return <div className="p-8 text-gray-500">Pilih bisnis terlebih dahulu.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Anti Bisnis</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola blacklist dan deteksi risiko bisnis</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Tutup Form' : 'Tambah ke Blacklist'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tambah ke Blacklist</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama/Perusahaan *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipe *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="customer">Pelanggan</option>
                <option value="supplier">Pemasok</option>
                <option value="partner">Mitra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alasan *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Memuat data...</p>
      ) : blacklist.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-gray-500">
          Belum ada data blacklist
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Nama</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Tipe</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Alasan</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Tanggal</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {blacklist.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.type === 'customer' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'supplier' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {item.type === 'customer' ? 'Pelanggan' : item.type === 'supplier' ? 'Pemasok' : 'Mitra'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.reason}</td>
                  <td className="p-4 text-gray-500">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleRemove(item.id!)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
