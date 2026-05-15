'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';

export default function SelectBusinessPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push('/login');
          return;
        }

        const q = query(
          collection(db, 'businesses'),
          where('owner_id', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const businessList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBusinesses(businessList);

        // If only one business, redirect to dashboard
        if (businessList.length === 1) {
          router.push(`/dashboard?business=${businessList[0].id}`);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [router]);

  const handleSelectBusiness = (businessId: string) => {
    router.push(`/dashboard?business=${businessId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Memuat bisnis...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pilih Bisnis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Anda memiliki {businesses.length} bisnis
          </p>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Anda belum memiliki bisnis. Buat bisnis baru untuk memulai.
            </p>
            <Link
              href="/dashboard/businesses/create"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
            >
              Buat Bisnis Baru
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => handleSelectBusiness(business.id)}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors text-left"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {business.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {business.category}
                </p>
                <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                  Buka Dashboard →
                </div>
              </button>
            ))}
            <Link
              href="/dashboard/businesses/create"
              className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors flex flex-col items-center justify-center text-center min-h-[160px]"
            >
              <div className="text-4xl mb-2">+</div>
              <div className="text-gray-700 dark:text-gray-300 font-medium">
                Buat Bisnis Baru
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
