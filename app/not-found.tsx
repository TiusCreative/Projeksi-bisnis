import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-lg w-full">
        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          🔍
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm md:text-base leading-relaxed">
          Maaf, halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau tidak pernah ada. Pastikan alamat URL yang Anda masukkan benar.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
