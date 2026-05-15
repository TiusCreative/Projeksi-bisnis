import Link from 'next/link';

export function Navbar() {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-6 sticky top-0 z-40 md:pl-70">
      {/* Bagian kiri Navbar (Mobile View) */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600 dark:text-indigo-400 md:hidden">
          ProjeksiSaaS
        </Link>
      </div>

      {/* Bagian Kanan Navbar */}
      <div className="flex items-center gap-4 ml-auto">
        <Link href="/dashboard/select-business" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors hidden sm:block">
          Ganti Bisnis
        </Link>
        <Link href="/dashboard/profile" className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
          U
        </Link>
      </div>
    </header>
  );
}