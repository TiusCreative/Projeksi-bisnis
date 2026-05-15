'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';

interface SubscriptionPackage {
  id?: string;
  name: string;
  price: number;
  duration: number; // in months
  features: string[];
  midtransProductId?: string;
  active: boolean;
  createdAt?: string;
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'admins' | 'users' | 'packages'>('admins');
  
  // Subscription packages state
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [packageForm, setPackageForm] = useState({
    name: '',
    price: '',
    duration: '',
    features: '',
    midtransProductId: '',
    active: true,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const fetchData = async () => {
        try {
          const adminDoc = await getDoc(doc(db, 'settings', 'admins'));
          let emails: string[] = [];

          if (adminDoc.exists()) {
            emails = adminDoc.data().emails || [];
          } else {
            await setDoc(doc(db, 'settings', 'admins'), { emails: [user.email] });
            emails = [user.email as string];
          }

          setAdminEmails(emails);
          setIsAdmin(user.email ? emails.includes(user.email) : false);

          const snap = await getDocs(collection(db, 'users'));
          setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // Fetch subscription packages
          const packagesSnap = await getDocs(collection(db, 'subscriptionPackages'));
          setPackages(packagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubscriptionPackage)));
        } catch (error) {
          console.error('Error fetching admin data:', error);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    });

    return () => unsubscribe();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || adminEmails.includes(newEmail)) return;

    try {
      const updatedEmails = [...adminEmails, newEmail];
      await setDoc(doc(db, 'settings', 'admins'), { emails: updatedEmails });
      setAdminEmails(updatedEmails);
      setNewEmail('');
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Gagal menambahkan admin');
    }
  };

  const handleRemoveAdmin = async (emailToRemove: string) => {
    if (emailToRemove === auth.currentUser?.email) {
      alert('Anda tidak bisa menghapus diri sendiri!');
      return;
    }

    try {
      const updatedEmails = adminEmails.filter(e => e !== emailToRemove);
      await setDoc(doc(db, 'settings', 'admins'), { emails: updatedEmails });
      setAdminEmails(updatedEmails);
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Gagal menghapus admin');
    }
  };

  // Subscription package functions
  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const featuresArray = packageForm.features.split('\n').filter(f => f.trim());
    
    try {
      const packageData: any = {
        name: packageForm.name,
        price: parseFloat(packageForm.price),
        duration: parseInt(packageForm.duration),
        features: featuresArray,
        active: packageForm.active,
        createdAt: new Date().toISOString(),
      };

      // Only include midtransProductId if it has a value
      if (packageForm.midtransProductId && packageForm.midtransProductId.trim()) {
        packageData.midtransProductId = packageForm.midtransProductId.trim();
      }

      if (editingPackage) {
        await updateDoc(doc(db, 'subscriptionPackages', editingPackage.id!), packageData);
      } else {
        await addDoc(collection(db, 'subscriptionPackages'), packageData);
      }

      // Refresh packages
      const packagesSnap = await getDocs(collection(db, 'subscriptionPackages'));
      setPackages(packagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubscriptionPackage)));

      // Reset form
      setPackageForm({
        name: '',
        price: '',
        duration: '',
        features: '',
        midtransProductId: '',
        active: true,
      });
      setShowPackageForm(false);
      setEditingPackage(null);
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Gagal menyimpan paket');
    }
  };

  const handleEditPackage = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      price: pkg.price.toString(),
      duration: pkg.duration.toString(),
      features: pkg.features.join('\n'),
      midtransProductId: pkg.midtransProductId || '',
      active: pkg.active,
    });
    setShowPackageForm(true);
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Hapus paket ini?')) return;
    
    try {
      await deleteDoc(doc(db, 'subscriptionPackages', id));
      const packagesSnap = await getDocs(collection(db, 'subscriptionPackages'));
      setPackages(packagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubscriptionPackage)));
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Gagal menghapus paket');
    }
  };

  const handleTogglePackageActive = async (pkg: SubscriptionPackage) => {
    try {
      await updateDoc(doc(db, 'subscriptionPackages', pkg.id!), { active: !pkg.active });
      const packagesSnap = await getDocs(collection(db, 'subscriptionPackages'));
      setPackages(packagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubscriptionPackage)));
    } catch (error) {
      console.error('Error toggling package:', error);
      alert('Gagal mengubah status paket');
    }
  };

  if (loading) return <div className="p-8">Memuat data...</div>;

  if (!isAdmin) {
    return (
      <div className="p-8 text-center mt-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
        <p className="text-gray-600 dark:text-gray-400">Halaman ini khusus untuk Administrator.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <Link href="/dashboard" className="text-indigo-600 hover:underline">Kembali ke Dashboard</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'admins'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Admin
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Pengguna
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'packages'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Paket Langganan
        </button>
      </div>

      {activeTab === 'admins' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">Daftar Admin</h2>
          <ul className="space-y-3 mb-6">
            {adminEmails.map(email => (
              <li key={email} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                <span>{email}</span>
                <button onClick={() => handleRemoveAdmin(email)} className="text-red-500 hover:text-red-700 text-sm font-medium">Hapus</button>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddAdmin} className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="Email admin baru"
              className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none"
              required
            />
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 shadow-sm">
              Tambah Admin
            </button>
          </form>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Daftar Pengguna</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="p-3 rounded-l-lg font-semibold">Nama / Email</th>
                  <th className="p-3 font-semibold">ID Pengguna</th>
                  <th className="p-3 rounded-r-lg font-semibold">Nomor Telepon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-3 font-medium text-gray-900 dark:text-white">{u.name || u.email || 'Tanpa Nama'}</td>
                    <td className="p-3 text-gray-500">{u.id}</td>
                    <td className="p-3 text-gray-500">{u.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daftar Paket Langganan</h2>
              <button
                onClick={() => {
                  setShowPackageForm(true);
                  setEditingPackage(null);
                  setPackageForm({
                    name: '',
                    price: '',
                    duration: '',
                    features: '',
                    midtransProductId: '',
                    active: true,
                  });
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
              >
                + Tambah Paket
              </button>
            </div>

            {showPackageForm && (
              <form onSubmit={handleAddPackage} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {editingPackage ? 'Edit Paket' : 'Tambah Paket Baru'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Paket</label>
                    <input
                      type="text"
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durasi (bulan)</label>
                    <input
                      type="number"
                      value={packageForm.duration}
                      onChange={(e) => setPackageForm({ ...packageForm, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Midtrans Product ID</label>
                    <input
                      type="text"
                      value={packageForm.midtransProductId}
                      onChange={(e) => setPackageForm({ ...packageForm, midtransProductId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Opsional"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fitur (satu per baris)</label>
                  <textarea
                    value={packageForm.features}
                    onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Fitur 1&#10;Fitur 2&#10;Fitur 3"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={packageForm.active}
                    onChange={(e) => setPackageForm({ ...packageForm, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">Aktif</label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">
                    {editingPackage ? 'Update Paket' : 'Simpan Paket'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPackageForm(false);
                      setEditingPackage(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className={`p-4 rounded-lg border ${pkg.active ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-60'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${pkg.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                          {pkg.active ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                        Rp {pkg.price.toLocaleString('id-ID')} / {pkg.duration} bulan
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-2">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx}>• {feature}</li>
                        ))}
                      </ul>
                      {pkg.midtransProductId && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">Midtrans ID: {pkg.midtransProductId}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePackageActive(pkg)}
                        className="text-sm px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {pkg.active ? 'Non-aktifkan' : 'Aktifkan'}
                      </button>
                      <button
                        onClick={() => handleEditPackage(pkg)}
                        className="text-sm px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id!)}
                        className="text-sm px-3 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {packages.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">Belum ada paket langganan</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}