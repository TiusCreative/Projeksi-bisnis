'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useBusiness } from '@/app/context/BusinessContext';
import { auth } from '@/lib/firebase';

interface SubscriptionPackage {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  midtransProductId?: string;
  active: boolean;
}

export default function SubscriptionPage() {
  const { selectedBusiness } = useBusiness();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const packagesSnap = await getDocs(collection(db, 'subscriptionPackages'));
      const packagesData = packagesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as SubscriptionPackage))
        .filter(pkg => pkg.active);
      setPackages(packagesData);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (pkg: SubscriptionPackage) => {
    if (!selectedBusiness || !auth.currentUser) {
      alert('Mohon login dan pilih bisnis terlebih dahulu');
      return;
    }

    setProcessing(pkg.id);

    try {
      // Direct subscription without Midtrans payment
      const confirmed = confirm(
        `Anda akan berlangganan paket ${pkg.name} seharga Rp ${pkg.price.toLocaleString('id-ID')} untuk ${pkg.duration} bulan.\n\nLanjutkan?`
      );

      if (!confirmed) {
        setProcessing(null);
        return;
      }

      await updateDoc(doc(db, 'businesses', selectedBusiness.id), {
        subscription: pkg.name.toLowerCase(),
        subscription_package_id: pkg.id,
        subscription_expires_at: new Date(Date.now() + pkg.duration * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });

      alert(`Berlangganan paket ${pkg.name} berhasil!`);
      window.location.reload();
    } catch (error: any) {
      console.error('Error subscribing:', error);
      alert(error.message || 'Gagal berlangganan. Silakan coba lagi.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Memuat paket langganan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Paket Langganan</h1>
        <p className="text-gray-600 dark:text-gray-400">Pilih paket yang sesuai dengan kebutuhan bisnis Anda</p>
      </div>

      {selectedBusiness && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Paket saat ini: <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedBusiness.subscription || 'Free'}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                Rp {pkg.price.toLocaleString('id-ID')}
              </span>
              <span className="text-gray-600 dark:text-gray-400">/{pkg.duration} bulan</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              {pkg.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(pkg)}
              disabled={processing === pkg.id}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing === pkg.id ? 'Memproses...' : 'Berlangganan Sekarang'}
            </button>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Belum ada paket langganan tersedia</p>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informasi Pembayaran</h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>• Pembayaran aman melalui Midtrans</p>
          <p>• Paket akan aktif setelah pembayaran berhasil</p>
          <p>• Durasi langganan sesuai dengan paket yang dipilih</p>
          <p>• Anda dapat upgrade atau downgrade paket kapan saja</p>
          <p>• Mendukung berbagai metode pembayaran (BCA, Mandiri, BNI, GoPay, OVO, dll)</p>
        </div>
      </div>
    </div>
  );
}