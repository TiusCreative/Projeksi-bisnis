'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useBusiness } from '@/app/context/BusinessContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { businesses, selectedBusiness } = useBusiness();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      } else {
        setLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Redirect ke halaman pemilihan bisnis jika memiliki lebih dari 1 bisnis tapi belum ada yang dipilih
  useEffect(() => {
    if (!loadingAuth && businesses.length > 1 && !selectedBusiness && pathname !== '/dashboard/select-business') {
      router.replace('/dashboard/select-business');
    }
  }, [loadingAuth, businesses, selectedBusiness, pathname, router]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Memuat data pengguna...</p>
      </div>
    );
  }

  return <>{children}</>;
}