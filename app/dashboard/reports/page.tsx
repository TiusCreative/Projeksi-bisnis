'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useBusiness } from '@/app/context/BusinessContext';

export default function ReportsPage() {
  const { selectedBusiness } = useBusiness();
  const [activeTab, setActiveTab] = useState('keuangan');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>({});
  
  // Filters
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetchProjects();
  }, [selectedBusiness]);

  useEffect(() => {
    fetchReportData();
  }, [selectedBusiness, activeTab, dateFilter, customStartDate, customEndDate, selectedProject, transactionTypeFilter, categoryFilter]);

  const fetchProjects = async () => {
    if (!selectedBusiness) return;
    
    try {
      const projectsQ = query(
        collection(db, 'projects'),
        where('business_id', '==', selectedBusiness.id)
      );
      const projectsSnap = await getDocs(projectsQ);
      setProjects(projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : new Date(0);
        endDate = customEndDate ? new Date(customEndDate) : now;
        break;
      default:
        startDate = new Date(0);
    }

    return { startDate, endDate };
  };

  const filterByDate = (items: any[], dateField: string) => {
    const { startDate, endDate } = getDateRange();
    return items.filter(item => {
      const itemDate = item[dateField]?.toDate ? item[dateField].toDate() : new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const filterByProject = (items: any[]) => {
    if (selectedProject === 'all') return items;
    return items.filter(item => item.project_id === selectedProject);
  };

  const filterByType = (items: any[]) => {
    if (transactionTypeFilter === 'all') return items;
    return items.filter(item => item.type === transactionTypeFilter);
  };

  const filterByCategory = (items: any[]) => {
    if (categoryFilter === 'all') return items;
    return items.filter(item => item.category === categoryFilter);
  };

  const fetchReportData = async () => {
    if (!selectedBusiness) return;
    
    setLoading(true);
    try {
      let data: any = {};

      if (activeTab === 'keuangan') {
        // Fetch invoices
        const invoicesQ = query(
          collection(db, 'invoices'),
          where('business_id', '==', selectedBusiness.id)
        );
        const invoicesSnap = await getDocs(invoicesQ);
        let invoices = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch HPP items
        const hppQ = query(
          collection(db, 'hpp'),
          where('business_id', '==', selectedBusiness.id)
        );
        const hppSnap = await getDocs(hppQ);
        let hpp = hppSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch cashflow transactions
        const cashflowQ = query(
          collection(db, 'cashflows'),
          where('business_id', '==', selectedBusiness.id)
        );
        const cashflowSnap = await getDocs(cashflowQ);
        let cashflows = cashflowSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Apply filters
        invoices = filterByDate(invoices, 'invoiceDate');
        hpp = filterByDate(hpp, 'createdAt');
        cashflows = filterByDate(cashflows, 'date');
        cashflows = filterByType(cashflows);

        data.invoices = invoices;
        data.hpp = hpp;
        data.cashflows = cashflows;
      } else if (activeTab === 'proyeksi') {
        // Fetch projections
        const projectionsQ = query(
          collection(db, 'projections'),
          where('business_id', '==', selectedBusiness.id)
        );
        const projectionsSnap = await getDocs(projectionsQ);
        let projections = projectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        projections = filterByDate(projections, 'created_at');
        projections = filterByProject(projections);

        data.projections = projections;
      } else if (activeTab === 'proyek') {
        // Fetch projects
        const projectsQ = query(
          collection(db, 'projects'),
          where('business_id', '==', selectedBusiness.id)
        );
        const projectsSnap = await getDocs(projectsQ);
        let projectData = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        projectData = filterByDate(projectData, 'startDate');
        if (selectedProject !== 'all') {
          projectData = projectData.filter((p: any) => p.id === selectedProject);
        }

        data.projects = projectData;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'keuangan', name: 'Laporan Keuangan', icon: '💰' },
    { id: 'proyeksi', name: 'Laporan Proyeksi', icon: '📈' },
    { id: 'proyek', name: 'Laporan Proyek', icon: '📋' },
  ];

  if (!selectedBusiness) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Pilih bisnis terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Laporan Bisnis</h1>
        <p className="text-gray-600 dark:text-gray-400">Lihat analisis dan laporan lengkap bisnis Anda</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter Tanggal</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
              <option value="year">1 Tahun Terakhir</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          {dateFilter === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter Proyek</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Semua Proyek</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>{proj.name}</option>
              ))}
            </select>
          </div>

          {activeTab === 'keuangan' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe Transaksi</label>
                <select
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                <input
                  type="text"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  placeholder="Filter kategori..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Memuat data laporan...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'keuangan' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Rp {reportData.invoices?.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0).toLocaleString('id-ID') || 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total HPP</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    Rp {reportData.hpp?.reduce((sum: number, item: any) => sum + (item.totalCost || 0), 0).toLocaleString('id-ID') || 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Jumlah Invoice</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {reportData.invoices?.length || 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Profit</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    Rp {(reportData.invoices?.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0) - reportData.hpp?.reduce((sum: number, item: any) => sum + (item.totalCost || 0), 0)).toLocaleString('id-ID') || 0}
                  </p>
                </div>
              </div>

              {/* Cashflow Summary */}
              {reportData.cashflows && reportData.cashflows.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cashflow Masuk</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      Rp {reportData.cashflows.filter((c: any) => c.type === 'income').reduce((sum: number, c: any) => sum + c.amount, 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cashflow Keluar</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      Rp {reportData.cashflows.filter((c: any) => c.type === 'expense').reduce((sum: number, c: any) => sum + c.amount, 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Cashflow</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      Rp {(reportData.cashflows.filter((c: any) => c.type === 'income').reduce((sum: number, c: any) => sum + c.amount, 0) - reportData.cashflows.filter((c: any) => c.type === 'expense').reduce((sum: number, c: any) => sum + c.amount, 0)).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}

              {/* Invoice Table */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Daftar Invoice</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">No. Invoice</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Pelanggan</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Tanggal</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {reportData.invoices?.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-3 text-gray-900 dark:text-white">{inv.invoiceNumber}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">{inv.customerName}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">{new Date(inv.invoiceDate).toLocaleDateString('id-ID')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              inv.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              inv.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-gray-900 dark:text-white">
                            Rp {inv.total.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cashflow Table */}
              {reportData.cashflows && reportData.cashflows.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Cashflow Transactions</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Tanggal</th>
                          <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Tipe</th>
                          <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Kategori</th>
                          <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Deskripsi</th>
                          <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {reportData.cashflows.map((tx: any) => (
                          <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="p-3 text-gray-600 dark:text-gray-400">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                tx.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                              </span>
                            </td>
                            <td className="p-3 text-gray-600 dark:text-gray-400">{tx.category}</td>
                            <td className="p-3 text-gray-600 dark:text-gray-400">{tx.description || '-'}</td>
                            <td className={`p-3 font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              Rp {tx.amount.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'proyeksi' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Proyeksi</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {reportData.projections?.length || 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Pendapatan Proyeksi</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Rp {reportData.projections?.reduce((sum: number, proj: any) => sum + (proj.calculations?.totalRevenue || 0), 0).toLocaleString('id-ID') || 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Biaya Proyeksi</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    Rp {reportData.projections?.reduce((sum: number, proj: any) => sum + (proj.calculations?.totalCost || 0), 0).toLocaleString('id-ID') || 0}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Daftar Proyeksi</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Nama Proyeksi</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Tipe Bisnis</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Investasi</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">ROI</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {reportData.projections?.map((proj: any) => (
                        <tr key={proj.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-3 text-gray-900 dark:text-white">{proj.name}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">{proj.business_type || proj.businessType}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">
                            Rp {proj.initial_capital?.toLocaleString('id-ID') || proj.investment?.toLocaleString('id-ID') || 0}
                          </td>
                          <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400">
                            {proj.calculations?.roi?.toFixed(2) || 0}%
                          </td>
                          <td className="p-3 font-medium text-green-600 dark:text-green-400">
                            Rp {(proj.calculations?.profit || 0).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'proyek' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Proyek</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {reportData.projects?.length || 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Proyek Aktif</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {reportData.projects?.filter((p: any) => p.status === 'active').length || 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Proyek Selesai</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {reportData.projects?.filter((p: any) => p.status === 'completed').length || 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    Rp {reportData.projects?.reduce((sum: number, p: any) => sum + (p.budget || 0), 0).toLocaleString('id-ID') || 0}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Daftar Proyek</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Nama Proyek</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Tipe</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Lokasi</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="p-3 font-semibold text-gray-600 dark:text-gray-400">Budget</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {reportData.projects?.map((proj: any) => (
                        <tr key={proj.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-3 text-gray-900 dark:text-white">{proj.name}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">{proj.type}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">{proj.location}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              proj.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              proj.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {proj.status}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-gray-900 dark:text-white">
                            Rp {proj.budget?.toLocaleString('id-ID') || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}