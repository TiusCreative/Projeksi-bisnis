'use client';

import { useState, useEffect } from 'react';
import { useBusiness } from '@/app/context/BusinessContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Header({ setIsSidebarOpen }: { setIsSidebarOpen: (v: boolean) => void }) {
  const { selectedBusiness, setSelectedBusiness, businesses } = useBusiness();
  const [showNotif, setShowNotif] = useState(false);
  const [hasNegativeCashflow, setHasNegativeCashflow] = useState(false);

  useEffect(() => {
    const checkCashflowAlert = async () => {
      if (!selectedBusiness) {
        setHasNegativeCashflow(false);
        return;
      }
      // Cek transaksi cashflow untuk bisnis ini
      const q = query(collection(db, 'cashflows'), where('business_id', '==', selectedBusiness.id));
      const snap = await getDocs(q);
      
      let income = 0, expense = 0;
      snap.docs.forEach(doc => {
        const data = doc.data();
        if (data.type === 'income') income += data.amount;
        if (data.type === 'expense') expense += data.amount;
      });
      
      setHasNegativeCashflow(expense > income);
    };

    checkCashflowAlert();
  }, [selectedBusiness]);

  return (
    <header className="print:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="flex items-center">
        <button onClick={() => setIsSidebarOpen(true)} className="mr-4 md:hidden text-gray-600 dark:text-gray-300 focus:outline-none hover:text-gray-900 dark:hover:text-white">
          <span className="text-2xl">☰</span>
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">Owner Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Dropdown Pemilih Bisnis */}
        <select
          className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2 outline-none"
          value={selectedBusiness?.id || ''}
          onChange={(e) => {
            const bus = businesses.find(b => b.id === e.target.value);
            if (bus) setSelectedBusiness(bus);
          }}
        >
          <option value="" disabled>{businesses.length > 0 ? 'Pilih Bisnis...' : 'Belum Ada Bisnis'}</option>
          {businesses.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {/* Lonceng Notifikasi */}
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {hasNegativeCashflow && <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
          </button>
          
          {/* Pop-up Dropdown Notifikasi */}
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700"><h4 className="text-sm font-bold text-gray-900 dark:text-white">Notifikasi AI Insights</h4></div>
              <div className="p-4">
                {hasNegativeCashflow ? (
                  <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-100 leading-relaxed font-medium"><span className="mr-2 text-lg">⚠️</span> Peringatan: Total pengeluaran Anda saat ini melebihi pemasukan (Cashflow Negatif). Silakan menuju ke halaman AI Analytics untuk rekomendasi perbaikan!</p>
                ) : (
                  <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100 leading-relaxed font-medium"><span className="mr-2 text-lg">✅</span> Cashflow bisnis berjalan sehat. Tidak ada peringatan AI saat ini.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0 overflow-hidden shadow-sm">
          {selectedBusiness?.logo_url ? (
             <img src={selectedBusiness.logo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
             selectedBusiness?.name ? selectedBusiness.name.charAt(0).toUpperCase() : 'O'
          )}
        </div>
      </div>
    </header>
  );
}
