'use client';

import { useBusiness } from '@/app/context/BusinessContext';

export default function InvoicesPage() {
  const { selectedBusiness } = useBusiness();

  if (!selectedBusiness) return <div className="p-8 text-gray-500">Pilih bisnis terlebih dahulu.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice & Penagihan</h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center py-20">
        <div className="text-6xl mb-4">🧾</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Segera Hadir!</h2>
        <p className="text-gray-600 dark:text-gray-400">Fitur pembuatan invoice sedang dalam tahap pengembangan. Segera Anda dapat membuat, melacak, dan mengirimkan tagihan berformat PDF langsung ke pelanggan (via WhatsApp/Email) dari halaman ini.</p>
      </div>
    </div>
  );
}