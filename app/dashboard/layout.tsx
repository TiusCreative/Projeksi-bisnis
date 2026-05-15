'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useBusiness } from '@/app/context/BusinessContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedBusiness } = useBusiness();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Protected Route Logic: Cek apakah user sudah login
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login'); // Lempar ke login jika belum
      } else {
        setUserEmail(user.email);
        
        // Check if user is admin
        try {
          const adminDoc = await getDoc(doc(db, 'settings', 'admins'));
          if (adminDoc.exists()) {
            const emails = adminDoc.data().emails || [];
            setIsAdmin(user.email ? emails.includes(user.email) : false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Tutup sidebar mobile saat pindah halaman
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const navigation = [
    { name: 'Pilih Bisnis', href: '/dashboard/select-business', icon: '🏢' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Manajemen Bisnis', href: '/dashboard/businesses', icon: '💼' },
    { name: 'Proyeksi Bisnis', href: '/dashboard/projections', icon: '📈' },
    { name: 'Manajemen Proyek', href: '/dashboard/projects', icon: '📋' },
    { name: 'Simulasi Bisnis', href: '/dashboard/simulations', icon: '🎮' },
    { name: 'HPP', href: '/dashboard/hpp', icon: '💵' },
    { name: 'Finance / Cashflow', href: '/dashboard/finance', icon: '💰' },
    { name: 'Invoice', href: '/dashboard/invoices', icon: '🧾' },
    { name: 'Laporan', href: '/dashboard/reports', icon: '📄' },
    { name: 'AI Analytics', href: '/dashboard/analytics', icon: '🧠' },
    { name: 'Profil', href: '/dashboard/profile', icon: '👤' },
    ...(isAdmin ? [{ name: 'Admin', href: '/dashboard/admin', icon: '⚙️' }] : []),
    { name: 'Langganan', href: '/dashboard/subscription', icon: '⭐' },
    { name: 'Bantuan', href: '/dashboard/help', icon: '❓' },
  ];

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500">Memuat dashboard...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col shadow-xl lg:shadow-none`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <span className="text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">ProjeksiSaaS</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            ✕
          </button>
        </div>

        {/* Info Bisnis Aktif */}
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 m-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Bisnis Aktif:</p>
          <p className="font-bold text-sm text-indigo-900 dark:text-indigo-100 line-clamp-1">
            {selectedBusiness?.name || 'Belum ada bisnis'}
          </p>
        </div>
        
        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-4 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/dashboard');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 truncate">{userEmail}</p>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg text-sm font-bold transition-colors">
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 h-screen overflow-hidden">
        {/* Header Khusus Mobile */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="font-bold text-gray-900 dark:text-white line-clamp-1">{selectedBusiness?.name || 'Dashboard'}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      
      {/* Overlay Gelap untuk Mobile Sidebar */}
      {isSidebarOpen && <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
}