'use client';

import Link from 'next/link';
import { useBusiness } from '@/app/context/BusinessContext';

export default function BusinessesPage() {
  const { businesses, selectedBusiness, setSelectedBusiness } = useBusiness();

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manajemen Bisnis</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola semua bisnis Anda di satu tempat.</p>
        </div>
        <Link 
          href="/dashboard/businesses/create" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm"
        >
          + Buat Bisnis Baru
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Nama Bisnis</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Kategori</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Role Anda</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {businesses.map((business) => (
                <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {business.logo_url ? (
                        <img src={business.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          {business.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{business.name}</div>
                        {selectedBusiness?.id === business.id && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">Aktif di Dashboard</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{business.category || '-'}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                      business.role?.toLowerCase() === 'owner' ? 'bg-purple-100 text-purple-700' : 
                      business.role?.toLowerCase() === 'manager' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {business.role || 'Staff'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Aktif
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {selectedBusiness?.id !== business.id && (
                        <button 
                          onClick={() => setSelectedBusiness(business)}
                          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium"
                        >
                          Pilih
                        </button>
                      )}
                      {(business.role === 'owner' || business.role === 'manager') && (
                        <Link 
                          href={`/dashboard/businesses/${business.id}/edit`}
                          className="px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors font-medium"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {businesses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Belum ada bisnis yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}