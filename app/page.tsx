import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ProjeksiSaaS - Kelola & Prediksi Keuangan Bisnis dengan AI',
  description: 'Aplikasi manajemen proyeksi bisnis, simulasi keuangan, perhitungan ROI & BEP, serta AI cashflow analytics untuk UMKM dan perusahaan.',
};

// SVG Icon Components
const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const RobotIcon = () => (
  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Navbar */}
      <header className="px-6 py-4 md:px-12 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <ChartIcon />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Projeksi Bisnis</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Fitur</Link>
          <Link href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Harga</Link>
          <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Masuk</Link>
          <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">Daftar</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Kelola & Prediksi Keuangan dengan AI
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Analisis arus kas, prediksi tren masa depan, dan simulasi ekspansi bisnis dengan mudah.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700">
              Mulai Gratis
            </Link>
            <Link href="/login" className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
              Masuk
            </Link>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Fitur Utama</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
              <div className="mb-4"><TrendingUpIcon /></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Proyeksi Dinamis</h3>
              <p className="text-gray-600 dark:text-gray-400">Hitung ROI, BEP, dan proyeksi keuntungan dengan mudah.</p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
              <div className="mb-4"><RobotIcon /></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">Sistem cerdas memantau cashflow dan memberikan peringatan.</p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
              <div className="mb-4"><BuildingIcon /></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Multi Bisnis</h3>
              <p className="text-gray-600 dark:text-gray-400">Kelola seluruh bisnis dari satu dashboard.</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Harga</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Free</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Rp 0</p>
              <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-400">
                <li>✓ 1 Bisnis</li>
                <li>✓ Proyeksi Dasar</li>
                <li>✓ Cashflow Management</li>
              </ul>
              <Link href="/register" className="block text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium">Mulai</Link>
            </div>
            <div className="p-6 border-2 border-indigo-600 rounded-xl relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">POPULAR</span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Pro</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Rp 99.000</p>
              <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-400">
                <li>✓ 5 Bisnis</li>
                <li>✓ AI Analytics</li>
                <li>✓ Simulasi Bisnis</li>
                <li>✓ WhatsApp Report</li>
              </ul>
              <Link href="/register" className="block text-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium">Pilih Pro</Link>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Enterprise</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Custom</p>
              <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-400">
                <li>✓ Unlimited Bisnis</li>
                <li>✓ White Label</li>
                <li>✓ API Access</li>
                <li>✓ Priority Support</li>
              </ul>
              <Link href="/register" className="block text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium">Hubungi</Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-600 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Siap Mengembangkan Bisnis?</h2>
            <p className="text-indigo-100 mb-8">Bergabung dengan ribuan pengusaha yang menggunakan ProjeksiSaaS</p>
            <Link href="/register" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium">Daftar Sekarang</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 ProjeksiSaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
