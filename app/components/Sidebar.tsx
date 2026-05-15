
// import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Sidebar() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  // Untuk SSR/Next.js App Router, gunakan usePathname jika memungkinkan
  // const pathname = usePathname();
  // Jika ingin lebih baik, bisa gunakan usePathname dari 'next/navigation' jika Sidebar digunakan di client component
  // Namun, jika Sidebar server component, window.location.pathname fallback
  // Untuk Next.js 13+ App Router, pastikan Sidebar di-mark 'use client' jika ingin pakai usePathname
  //
  // NOTE: Jika Sidebar ini server component, gunakan props atau context untuk pathname
  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen fixed hidden md:flex flex-col z-50">
      <div className="p-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">ProjeksiSaaS</h2>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 space-y-2 pb-6">

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-2">Menu Utama</div>
        <Link href="/dashboard" className="block px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors text-gray-700 dark:text-gray-300">Dashboard</Link>
        <Link href="/dashboard/select-business" className="block px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors text-gray-700 dark:text-gray-300">Pilih Bisnis</Link>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-2">Proyeksi & Analisis</div>
        <Link href="/dashboard/projections" className="block px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors text-gray-700 dark:text-gray-300">Proyeksi Dasar</Link>
        <Link href="/dashboard/hpp" className={
          `block px-3 py-2.5 rounded-xl font-medium transition-colors ` +
          (pathname === '/dashboard/hpp'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-700 dark:text-gray-300')
        }>
          Kalkulator HPP
        </Link>
        <Link href="/dashboard/simulations" className="block px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors text-gray-700 dark:text-gray-300">Simulasi Skenario</Link>
        <Link href="/dashboard/reports" className={
          `block px-3 py-2.5 rounded-xl font-medium transition-colors ` +
          (pathname === '/dashboard/reports'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-700 dark:text-gray-300')
        }>
          Laporan
        </Link>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-2">Manajemen</div>
        <Link
          href="/dashboard/finance"
          className={
            `block px-3 py-2.5 rounded-xl font-medium transition-colors ` +
            (pathname === '/dashboard/finance'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-700 dark:text-gray-300')
          }
        >
          Finance
        </Link>
        <Link
          href="/dashboard/investments"
          className={
            `block px-3 py-2.5 rounded-xl font-medium transition-colors ` +
            (pathname === '/dashboard/investments'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-700 dark:text-gray-300')
          }
        >
          Investment
        </Link>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-2">Sistem</div>
        <Link href="/dashboard/profile" className="block px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors text-gray-700 dark:text-gray-300">Profil Saya</Link>
        <Link href="/dashboard/admin" className="block px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors text-gray-700 dark:text-gray-300">Admin Panel</Link>
      </nav>
    </aside>
  );
}