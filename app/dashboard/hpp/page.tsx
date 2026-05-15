'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { useBusiness } from '@/app/context/BusinessContext';

interface HPPItem {
  id?: string;
  name: string;
  category: string;
  unit: string;
  cost: number;
  quantity: number;
  totalCost: number;
  createdAt: Date;
}

export default function HPPPage() {
  const { selectedBusiness } = useBusiness();
  const [hppItems, setHppItems] = useState<HPPItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<HPPItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Bahan Baku',
    unit: 'kg',
    cost: 0,
    quantity: 0
  });

  const categories = ['Bahan Baku', 'Tenaga Kerja', 'Overhead', 'Biaya Operasional', 'Lainnya'];
  const units = ['kg', 'gram', 'liter', 'pcs', 'box', 'jam', 'bulan', 'unit'];

  useEffect(() => {
    fetchHPPItems();
  }, [selectedBusiness]);

  const fetchHPPItems = async () => {
    if (!selectedBusiness) return;
    
    try {
      const q = query(
        collection(db, 'hpp'),
        where('business_id', '==', selectedBusiness.id)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as HPPItem[];
      setHppItems(items);
    } catch (error) {
      console.error('Error fetching HPP items:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = () => {
    return formData.cost * formData.quantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness) return;

    try {
      const totalCost = calculateTotalCost();
      const hppData = {
        ...formData,
        totalCost,
        business_id: selectedBusiness.id,
        createdAt: new Date()
      };

      if (editingItem?.id) {
        await updateDoc(doc(db, 'hpp', editingItem.id), hppData);
      } else {
        await addDoc(collection(db, 'hpp'), hppData);
      }

      setFormData({ name: '', category: 'Bahan Baku', unit: 'kg', cost: 0, quantity: 0 });
      setShowForm(false);
      setEditingItem(null);
      fetchHPPItems();
    } catch (error) {
      console.error('Error saving HPP item:', error);
      alert('Gagal menyimpan item HPP');
    }
  };

  const handleEdit = (item: HPPItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      cost: item.cost,
      quantity: item.quantity
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus item HPP ini?')) return;
    
    try {
      await deleteDoc(doc(db, 'hpp', id));
      fetchHPPItems();
    } catch (error) {
      console.error('Error deleting HPP item:', error);
      alert('Gagal menghapus item HPP');
    }
  };

  const totalHPP = hppItems.reduce((sum, item) => sum + item.totalCost, 0);

  if (!selectedBusiness) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Pilih bisnis terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HPP (Harga Pokok Penjualan)</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Tutup Form' : '+ Tambah Item'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {editingItem ? 'Edit Item HPP' : 'Tambah Item HPP Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Item</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Satuan</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biaya per Satuan</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Biaya</label>
              <input
                type="text"
                value={`Rp ${calculateTotalCost().toLocaleString('id-ID')}`}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 bg-gray-100 dark:bg-gray-600"
                disabled
              />
            </div>
            <div className="md:col-span-2 flex gap-2 mt-4">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">
                {editingItem ? 'Update' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setFormData({ name: '', category: 'Bahan Baku', unit: 'kg', cost: 0, quantity: 0 });
                }}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Ringkasan HPP</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Item</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{hppItems.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total HPP</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              Rp {totalHPP.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Rata-rata per Item</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Rp {hppItems.length > 0 ? (totalHPP / hppItems.length).toLocaleString('id-ID') : 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Daftar Item HPP</h2>
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
          ) : hppItems.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Belum ada item HPP</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Nama</th>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Kategori</th>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Satuan</th>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Biaya/Satuan</th>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Jumlah</th>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Total</th>
                    <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {hppItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-3 text-gray-900 dark:text-white">{item.name}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{item.category}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{item.unit}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">
                        Rp {item.cost.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{item.quantity}</td>
                      <td className="p-3 font-medium text-gray-900 dark:text-white">
                        Rp {item.totalCost.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-800 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="text-red-600 hover:text-red-800"
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
      </div>
    </div>
  );
}
