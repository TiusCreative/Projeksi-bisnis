import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Harga - ProjeksiSaaS',
  description: 'Pilih paket yang sesuai dengan kebutuhan bisnis Anda. Free, Pro, dan Enterprise.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-block mb-8 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
            ← Kembali ke Beranda
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Pilih Paket yang Sesuai</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Mulai gratis, upgrade kapan saja sesuai kebutuhan bisnis Anda
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Untuk memulai bisnis kecil</p>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Rp 0<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/bulan</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-green-500 mr-2">✓</span>1 Bisnis</li>
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-green-500 mr-2">✓</span>Proyeksi Dasar</li>
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-green-500 mr-2">✓</span>Cashflow Management</li>
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-green-500 mr-2">✓</span>Laporan PDF</li>
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-gray-400 mr-2">✗</span>AI Analytics</li>
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-gray-400 mr-2">✗</span>Simulasi Bisnis</li>
            </ul>
            <Link href="/register" className="block w-full text-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Mulai Gratis
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-indigo-600 p-8 rounded-3xl shadow-lg border-2 border-indigo-700 hover:shadow-xl transition-shadow transform hover:-translate-y-1 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <p className="text-indigo-200 mb-6">Untuk bisnis yang berkembang</p>
            <div className="text-4xl font-bold text-white mb-6">Rp 99.000<span className="text-lg font-normal text-indigo-200">/bulan</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-white"><span className="text-green-300 mr-2">✓</span>5 Bisnis</li>
              <li className="flex items-center text-white"><span className="text-green-300 mr-2">✓</span>AI Analytics</li>
              <li className="flex items-center text-white"><span className="text-green-300 mr-2">✓</span>Simulasi Bisnis</li>
              <li className="flex items-center text-white"><span className="text-green-300 mr-2">✓</span>Laporan Excel & CSV</li>
              <li className="flex items-center text-white"><span className="text-green-300 mr-2">✓</span>WhatsApp Report</li>
              <li className="flex items-center text-white"><span className="text-green-300 mr-2">✓</span>Priority Support</li>
            </ul>
            <Link href="/register" className="block w-full text-center bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
              Pilih Pro
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Untuk perusahaan besar</p>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Custom<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/bulan</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-green-500 mr-2">✓</span>Unlimited Bisnis</li>
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-green-500 mr-2">✓</span>White Label</li>
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-green-500 mr-2">✓</span>API Access</li>
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-green-500 mr-2">✓</span>Custom Integration</li>
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-green-500 mr-2">✓</span>Dedicated Support</li>
              <li className="flex items-center text-gray-700 dark:text-gray-300"><span className="text-green-500 mr-2">✓</span>SLA Guarantee</li>
            </ul>
            <Link href="/register" className="block w-full text-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Hubungi Sales
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">FAQ</h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Apakah ada masa percobaan gratis?</h3>
              <p className="text-gray-600 dark:text-gray-400">Ya! Paket Free bisa digunakan selamanya tanpa batas waktu. Upgrade kapan saja ke Pro atau Enterprise.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bagaimana cara upgrade paket?</h3>
              <p className="text-gray-600 dark:text-gray-400">Login ke dashboard, masuk ke menu Subscription, dan pilih paket yang diinginkan. Pembayaran dilakukan melalui gateway yang aman.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Apakah data saya aman?</h3>
              <p className="text-gray-600 dark:text-gray-400">Data Anda dienkripsi dan disimpan di server yang aman. Kami menggunakan standar keamanan industri untuk melindungi data Anda.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bisakah saya membatalkan kapan saja?</h3>
              <p className="text-gray-600 dark:text-gray-400">Tentu! Anda bisa membatalkan kapan saja tanpa penalti. Data Anda akan tetap tersedia sampai akhir periode berlangganan.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Masih punya pertanyaan?</p>
          <a href="mailto:support@projeksibisnis.com" className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
            Hubungi Support →
          </a>
        </div>
      </div>
    </div>
  );
}
