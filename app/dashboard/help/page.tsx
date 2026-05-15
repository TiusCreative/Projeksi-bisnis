'use client';

import { useState } from 'react';

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Memulai' },
    { id: 'business', title: 'Manajemen Bisnis' },
    { id: 'projections', title: 'Proyeksi' },
    { id: 'simulations', title: 'Simulasi' },
    { id: 'cashflow', title: 'Cashflow' },
    { id: 'reports', title: 'Laporan' },
    { id: 'analytics', title: 'AI Analytics' },
    { id: 'faq', title: 'FAQ' },
  ];

  const content: Record<string, any> = {
    'getting-started': {
      title: 'Memulai dengan ProjeksiSaaS',
      content: (
        <div className="space-y-6">
          <p>Selamat datang di ProjeksiSaaS! Berikut panduan untuk memulai:</p>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li>Buat akun baru atau login dengan akun yang sudah ada</li>
            <li>Buat bisnis baru dengan mengisi informasi dasar bisnis Anda</li>
            <li>Mulai mencatat transaksi cashflow (pemasukan dan pengeluaran)</li>
            <li>Buat proyeksi untuk melihat estimasi keuntungan di masa depan</li>
            <li>Gunakan simulasi untuk melihat skenario bisnis yang berbeda</li>
            <li>Analisis data dengan AI Analytics untuk mendapatkan rekomendasi</li>
          </ol>
        </div>
      ),
    },
    'business': {
      title: 'Manajemen Bisnis',
      content: (
        <div className="space-y-6">
          <p>Kelola bisnis Anda dengan fitur-fitur berikut:</p>
          <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li><strong>Buat Bisnis:</strong> Tambah bisnis baru dengan logo dan informasi detail</li>
            <li><strong>Edit Bisnis:</strong> Perbarui informasi bisnis kapan saja</li>
            <li><strong>Hapus Bisnis:</strong> Hapus bisnis yang tidak lagi digunakan</li>
            <li><strong>Multi Bisnis:</strong> Kelola beberapa bisnis dalam satu akun</li>
          </ul>
        </div>
      ),
    },
    'projections': {
      title: 'Proyeksi',
      content: (
        <div className="space-y-6">
          <p>Gunakan fitur proyeksi untuk melihat estimasi keuangan:</p>
          <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li><strong>Modal Awal:</strong> Masukkan modal awal bisnis Anda</li>
            <li><strong>Biaya Operasional:</strong> Input biaya operasional bulanan</li>
            <li><strong>Harga Jual:</strong> Tentukan harga jual per unit</li>
            <li><strong>Target Penjualan:</strong> Set target penjualan bulanan</li>
            <li><strong>Hasil:</strong> Lihat BEP, ROI, dan estimasi profit</li>
          </ul>
        </div>
      ),
    },
    'simulations': {
      title: 'Simulasi',
      content: (
        <div className="space-y-6">
          <p>Simulasikan berbagai skenario bisnis:</p>
          <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li><strong>Penjualan Naik/Turun:</strong> Simulasikan perubahan penjualan</li>
            <li><strong>Biaya Naik:</strong> Simulasikan kenaikan biaya operasional</li>
            <li><strong>Tambah Cabang:</strong> Simulasikan ekspansi bisnis</li>
            <li><strong>Tambah Karyawan:</strong> Simulasikan penambahan SDM</li>
            <li><strong>Ubah Harga:</strong> Simulasikan perubahan harga jual</li>
          </ul>
        </div>
      ),
    },
    'cashflow': {
      title: 'Cashflow',
      content: (
        <div className="space-y-6">
          <p>Kelola arus kas bisnis Anda:</p>
          <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li><strong>Catat Pemasukan:</strong> Tambah transaksi pemasukan</li>
            <li><strong>Catat Pengeluaran:</strong> Tambah transaksi pengeluaran</li>
            <li><strong>Lihat Ringkasan:</strong> Pantau total pemasukan, pengeluaran, dan saldo</li>
            <li><strong>Riwayat Transaksi:</strong> Lihat semua transaksi yang tercatat</li>
          </ul>
        </div>
      ),
    },
    'reports': {
      title: 'Laporan',
      content: (
        <div className="space-y-6">
          <p>Generate laporan bisnis dalam berbagai format:</p>
          <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li><strong>Ringkasan:</strong> Lihat ringkasan cashflow, proyeksi, dan simulasi</li>
            <li><strong>Export PDF:</strong> Download laporan dalam format PDF</li>
            <li><strong>Export Excel:</strong> Download laporan dalam format Excel</li>
            <li><strong>Export CSV:</strong> Download data dalam format CSV</li>
            <li><strong>WhatsApp Report:</strong> Kirim laporan langsung ke WhatsApp</li>
          </ul>
        </div>
      ),
    },
    'analytics': {
      title: 'AI Analytics',
      content: (
        <div className="space-y-6">
          <p>Dapatkan insight dan rekomendasi dari AI:</p>
          <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li><strong>Prediksi Revenue:</strong> Estimasi pendapatan masa depan</li>
            <li><strong>Prediksi Kerugian:</strong> Deteksi potensi kerugian</li>
            <li><strong>Rekomendasi Harga:</strong> Saran harga optimal</li>
            <li><strong>Hemat Biaya:</strong> Tips penghematan biaya</li>
          </ul>
        </div>
      ),
    },
    'faq': {
      title: 'FAQ',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Apakah aplikasi ini gratis?</h3>
              <p className="text-gray-700 dark:text-gray-300">Ya! Ada paket Free yang bisa digunakan selamanya dengan fitur dasar. Paket Pro tersedia dengan fitur tambahan.</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Berapa bisnis yang bisa dikelola?</h3>
              <p className="text-gray-700 dark:text-gray-300">Paket Free: 1 bisnis. Paket Pro: 5 bisnis. Paket Enterprise: Unlimited.</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Apakah data saya aman?</h3>
              <p className="text-gray-700 dark:text-gray-300">Ya, data Anda dienkripsi dan disimpan dengan aman menggunakan Firebase.</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bagaimana cara upgrade paket?</h3>
              <p className="text-gray-700 dark:text-gray-300">Masuk ke menu Subscription di dashboard dan pilih paket yang diinginkan.</p>
            </div>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Bantuan</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {content[activeSection].title}
            </h2>
            {content[activeSection].content}
          </div>

          {/* Contact Support */}
          <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Butuh bantuan lebih?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Hubungi tim support kami jika Anda memiliki pertanyaan atau mengalami masalah.
            </p>
            <a href="mailto:support@projeksibisnis.com" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium">
              Hubungi Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
