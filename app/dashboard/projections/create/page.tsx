'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/app/context/BusinessContext';

const BUSINESS_TEMPLATES = {
  retail: {
    name: 'Retail/Toko',
    revenue: [
      'Penjualan Produk Fisik', 'Penjualan Online', 'Layanan Pengiriman',
      'Membership Store', 'Gift Card', 'Loyalty Program',
      'Cross-selling', 'Bundling Produk', 'Diskon Promosi',
      'Konsinyasi', 'Dropshipping', 'Reseller Commission'
    ],
    costs: [
      'Pembelian Stok Barang', 'Biaya Gudang', 'Transportasi Barang',
      'Packaging', 'Label & Branding', 'POS System',
      'Security Toko', 'Display & Merchandising', 'Loss Prevention',
      'Return Processing', 'Inventory Management', 'Staff Toko'
    ]
  },
  fnb: {
    name: 'F&B (Restoran/Kafe)',
    revenue: [
      'Penjualan Makanan', 'Penjualan Minuman', 'Delivery Order',
      'Catering', 'Event Space Rental', 'Merchandise',
      'Franchise Fee', 'Loyalty Program', 'Gift Voucher',
      'Private Dining', 'Cooking Class', 'Partnership'
    ],
    costs: [
      'Bahan Baku Makanan', 'Bahan Baku Minuman', 'Gaji Chef',
      'Gaji Waiter', 'Sewa Tempat', 'Peralatan Dapur',
      'Gas & Utilities', 'Lisensi Makanan', 'Food Cost',
      'Waste Management', 'Cleaning Supplies', 'Uniform Staff'
    ]
  },
  service: {
    name: 'Jasa/Services',
    revenue: [
      'Fee Konsultasi', 'Hourly Rate', 'Project Fee',
      'Retainer Fee', 'Maintenance Contract', 'Training Fee',
      'Workshop Fee', 'Licensing', 'Subscription Service',
      'Add-on Services', 'Premium Support', 'Custom Development'
    ],
    costs: [
      'Gaji Konsultan', 'Software Tools', 'Training Materials',
      'Marketing Professional', 'Client Acquisition', 'Legal Services',
      'Insurance', 'Professional Certification', 'Office Space',
      'Travel Client', 'Communication Tools', 'Research & Development'
    ]
  },
  manufacturing: {
    name: 'Manufaktur/Produksi',
    revenue: [
      'Penjualan Produk Jadi', 'OEM Manufacturing', 'Contract Manufacturing',
      'By-product Sales', 'Scrap Sales', 'Technical Services',
      'Spare Parts', 'Maintenance Contract', 'Licensing Technology',
      'Bulk Orders', 'Export Sales', 'Custom Manufacturing'
    ],
    costs: [
      'Raw Materials', 'Direct Labor', 'Factory Overhead',
      'Machinery Maintenance', 'Quality Control', 'R&D',
      'Packaging Materials', 'Logistics', 'Inventory Storage',
      'Energy Consumption', 'Waste Disposal', 'Safety Equipment'
    ]
  },
  digital: {
    name: 'Digital/SaaS',
    revenue: [
      'Subscription Monthly', 'Subscription Annual', 'One-time Purchase',
      'In-app Purchase', 'Advertising Revenue', 'Affiliate Commission',
      'API Usage', 'Enterprise License', 'White Label',
      'Marketplace Fee', 'Data Services', 'Premium Features'
    ],
    costs: [
      'Server Hosting', 'Cloud Services', 'CDN Costs',
      'Software Development', 'Customer Support', 'Marketing Digital',
      'Payment Processing', 'Security Tools', 'Analytics Tools',
      'Third-party APIs', 'Content Moderation', 'Compliance'
    ]
  },
  ecommerce: {
    name: 'E-commerce',
    revenue: [
      'Product Sales', 'Marketplace Fee', 'Shipping Fee',
      'Cross-border Sales', 'Dropshipping Commission', 'Affiliate Sales',
      'Flash Sale Revenue', 'Bundle Deals', 'Membership Fee',
      'Advertising Revenue', 'Data Monetization', 'Partnership'
    ],
    costs: [
      'Platform Fee', 'Payment Gateway', 'Shipping Cost',
      'Warehousing', 'Customer Service', 'Marketing Ads',
      'Product Photography', 'Content Creation', 'Return Processing',
      'Inventory Management', 'Software Subscription', 'Packaging'
    ]
  },
  education: {
    name: 'Pendidikan/Training',
    revenue: [
      'Tuition Fee', 'Course Fee', 'Workshop Fee',
      'Certification Fee', 'Corporate Training', 'Online Course',
      'Textbook Sales', 'Material Sales', 'Consulting Fee',
      'Mentorship Program', 'Bootcamp Fee', 'Partnership'
    ],
    costs: [
      'Instructor Fee', 'Venue Rental', 'Learning Materials',
      'LMS Platform', 'Marketing Education', 'Certification Cost',
      'Student Support', 'Content Development', 'Technology Infrastructure',
      'Accreditation', 'Research', 'Administrative Staff'
    ]
  },
  healthcare: {
    name: 'Healthcare/Kesehatan',
    revenue: [
      'Consultation Fee', 'Procedure Fee', 'Medication Sales',
      'Laboratory Services', 'Diagnostic Services', 'Insurance Claims',
      'Membership Program', 'Home Care Service', 'Telemedicine',
      'Specialist Referral', 'Wellness Program', 'Partnership'
    ],
    costs: [
      'Medical Supplies', 'Equipment Maintenance', 'Staff Salaries',
      'Insurance Liability', 'Licensing & Accreditation', 'Facility Costs',
      'Technology Systems', 'Patient Records', 'Waste Management',
      'Compliance', 'Continuing Education', 'Emergency Preparedness'
    ]
  }
};

const DEFAULT_REVENUE_ITEMS = [
  'Penjualan Produk Utama', 'Penjualan Produk Tambahan', 'Jasa Layanan', 'Sewa Ruang',
  'Pendapatan Iklan', 'Sponsorship', 'Komisi Penjualan', 'Lisensi/Franchise',
  'Pendapatan Digital', 'Subscription', 'Membership', 'Konsultasi',
  'Training/Workshop', 'Event Organizer', 'Catering', 'Delivery Service',
  'Maintenance', 'Custom Order', 'Bundling', 'Upselling',
  'Royalty', 'Licensing Fee', 'Affiliate Commission', 'Marketplace Fee',
  'Advertising Revenue', 'Data Monetization', 'API Usage', 'White Label',
  'Enterprise License', 'Premium Support', 'Add-on Services', 'Retainer Fee'
];

const DEFAULT_COST_ITEMS = [
  'Sewa Tempat', 'Listrik & Air', 'Gaji Karyawan', 'Bahan Baku',
  'Packaging', 'Transportasi', 'Marketing', 'Iklan Online',
  'Sosial Media Ads', 'SEO/SEM', 'Konten Kreator', 'Influencer',
  'Asuransi', 'Perizinan', 'Pajak', 'Akuntansi',
  'Legal', 'IT Support', 'Software Subscription', 'Hardware',
  'Internet', 'Telepon', 'Kebersihan', 'Security',
  'Perawatan Gedung', 'Depresiasi', 'Bunga Pinjaman', 'Biaya Bank',
  'R&D', 'Quality Control', 'Logistik', 'Gudang',
  'Inventory', 'Loss/Breakage', 'Return/Refund', 'Diskon',
  'Promosi', 'Event', 'Merchandise', 'Sample',
  'Testing', 'Training Karyawan', 'Team Building', 'Travel',
  'Entertainment', 'Client Entertainment', 'Gift/Hadiah', 'Donasi',
  'CSR', 'Emergency Fund', 'Reserve', 'Miscellaneous',
  'Server Hosting', 'Cloud Services', 'CDN Costs', 'Payment Gateway',
  'Platform Fee', 'Shipping Cost', 'Warehousing', 'Customer Service',
  'Raw Materials', 'Direct Labor', 'Factory Overhead', 'Machinery Maintenance',
  'Medical Supplies', 'Equipment Maintenance', 'Licensing & Accreditation', 'Compliance'
];

type RevenueItem = {
  id: string;
  name: string;
  type: 'fixed' | 'unit_based' | 'percentage_of_sales';
  amount: number;
  unit_price: number;
  estimated_units: number;
  percentage: number;
};

type CostItem = {
  id: string;
  name: string;
  type: 'fixed' | 'variable' | 'semi-variable' | 'niaga';
  category: string;
  amount: number;
  unit_cost: number;
};

export default function ProyeksiCreate() {
  const router = useRouter();
  const { selectedBusiness } = useBusiness();

  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [projectType, setProjectType] = useState<'new' | 'existing'>('new');
  const [businessType, setBusinessType] = useState<string>('');
  const [initialCapital, setInitialCapital] = useState('');
  const [revenueItems, setRevenueItems] = useState<RevenueItem[]>([]);
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [showRevenueDropdown, setShowRevenueDropdown] = useState(false);
  const [showCostDropdown, setShowCostDropdown] = useState(false);
  const [calculations, setCalculations] = useState({
    totalRevenue: 0,
    totalCost: 0,
    profit: 0,
    bep: 0,
    roi: 0,
    forecast: [] as number[],
  });

  const addRevenueItem = (name: string) => {
    const newItem: RevenueItem = {
      id: `r${Date.now()}`,
      name,
      type: 'unit_based',
      amount: 0,
      unit_price: 0,
      estimated_units: 0,
      percentage: 0,
    };
    setRevenueItems([...revenueItems, newItem]);
    setShowRevenueDropdown(false);
  };

  const addCostItem = (name: string) => {
    const newItem: CostItem = {
      id: `c${Date.now()}`,
      name,
      type: 'variable',
      category: 'Operasional',
      amount: 0,
      unit_cost: 0,
    };
    setCostItems([...costItems, newItem]);
    setShowCostDropdown(false);
  };

  const applyBusinessTemplate = (type: string) => {
    const template = BUSINESS_TEMPLATES[type as keyof typeof BUSINESS_TEMPLATES];
    if (!template) return;

    // Clear existing items
    setRevenueItems([]);
    setCostItems([]);

    // Add template revenue items
    template.revenue.forEach(name => {
      const newItem: RevenueItem = {
        id: `r${Date.now()}_${Math.random()}`,
        name,
        type: 'unit_based',
        amount: 0,
        unit_price: 0,
        estimated_units: 0,
        percentage: 0,
      };
      setRevenueItems(prev => [...prev, newItem]);
    });

    // Add template cost items
    template.costs.forEach(name => {
      const newItem: CostItem = {
        id: `c${Date.now()}_${Math.random()}`,
        name,
        type: 'variable',
        category: 'Operasional',
        amount: 0,
        unit_cost: 0,
      };
      setCostItems(prev => [...prev, newItem]);
    });
  };

  const handleBusinessTypeChange = (type: string) => {
    setBusinessType(type);
    if (type && BUSINESS_TEMPLATES[type as keyof typeof BUSINESS_TEMPLATES]) {
      if (confirm('Terapkan template untuk tipe bisnis ini? Item yang ada akan diganti.')) {
        applyBusinessTemplate(type);
      }
    }
  };

  const removeRevenueItem = (id: string) => {
    setRevenueItems(revenueItems.filter(item => item.id !== id));
  };

  const removeCostItem = (id: string) => {
    setCostItems(costItems.filter(item => item.id !== id));
  };

  const updateRevenueItem = (id: string, field: keyof RevenueItem, value: any) => {
    setRevenueItems(revenueItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const updateCostItem = (id: string, field: keyof CostItem, value: any) => {
    setCostItems(costItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateProjections = () => {
    const totalRevenue = revenueItems.reduce((sum, item) => {
      if (item.type === 'unit_based') {
        return sum + (item.unit_price * item.estimated_units);
      } else if (item.type === 'fixed') {
        return sum + item.amount;
      }
      return sum;
    }, 0);

    const totalCost = costItems.reduce((sum, item) => {
      if (item.type === 'fixed') {
        return sum + item.amount;
      } else if (item.type === 'variable' || item.type === 'niaga') {
        return sum + (item.unit_cost * (revenueItems[0]?.estimated_units || 0));
      }
      return sum + item.amount;
    }, 0);

    const profit = totalRevenue - totalCost;
    const investment = parseFloat(initialCapital) || 0;
    const roi = investment > 0 ? (profit / investment) * 100 : 0;

    const fixedCost = costItems
      .filter(item => item.type === 'fixed')
      .reduce((sum, item) => sum + item.amount, 0);

    const variableCostPerUnit = costItems
      .filter(item => item.type === 'variable' || item.type === 'niaga')
      .reduce((sum, item) => sum + item.unit_cost, 0);

    const sellingPrice = revenueItems[0]?.unit_price || 0;
    const bep = sellingPrice > variableCostPerUnit
      ? fixedCost / (sellingPrice - variableCostPerUnit)
      : 0;

    const forecast = [];
    const growthRate = 0.05;
    for (let i = 1; i <= 12; i++) {
      forecast.push(totalRevenue * Math.pow(1 + growthRate, i));
    }

    setCalculations({
      totalRevenue,
      totalCost,
      profit,
      bep,
      roi,
      forecast,
    });
  };

  useEffect(() => {
    calculateProjections();
  }, [revenueItems, costItems, initialCapital]);

  const saveProject = async () => {
    if (!selectedBusiness || !projectName) {
      alert('Mohon lengkapi nama proyek');
      return;
    }

    try {
      const projectRef = await addDoc(collection(db, 'projections'), {
        business_id: selectedBusiness.id,
        name: projectName,
        location,
        type: projectType,
        business_type: businessType,
        initial_capital: parseFloat(initialCapital) || 0,
        revenue: revenueItems.map(item => ({
          name: item.name,
          type: item.type,
          amount: item.amount,
          unit_price: item.unit_price,
          estimated_units: item.estimated_units,
          percentage: item.percentage,
        })),
        costs: costItems.map(item => ({
          name: item.name,
          type: item.type,
          category: item.category,
          amount: item.amount,
          unit_cost: item.unit_cost,
        })),
        calculations,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      router.push(`/dashboard/projections/${projectRef.id}`);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Gagal menyimpan proyeksi');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buat Proyeksi Bisnis</h1>
        <p className="text-gray-600 dark:text-gray-400">Input detail komponen biaya dan pendapatan untuk perhitungan proyeksi</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Proyek *</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lokasi</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipe Bisnis</label>
            <select
              value={businessType}
              onChange={(e) => handleBusinessTypeChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Pilih Tipe Bisnis (Opsional)</option>
              <option value="retail">Retail/Toko</option>
              <option value="fnb">F&B (Restoran/Kafe)</option>
              <option value="service">Jasa/Services</option>
              <option value="manufacturing">Manufaktur/Produksi</option>
              <option value="digital">Digital/SaaS</option>
              <option value="ecommerce">E-commerce</option>
              <option value="education">Pendidikan/Training</option>
              <option value="healthcare">Healthcare/Kesehatan</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pilih tipe bisnis untuk auto-fill template pendapatan & biaya</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipe Proyek *</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="new">Proyek Baru</option>
              <option value="existing">Proyek Existing</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modal Awal (Rp)</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pendapatan</h2>
          <div className="relative">
            <button
              onClick={() => setShowRevenueDropdown(!showRevenueDropdown)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              + Tambah dari Template
            </button>
            {showRevenueDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {DEFAULT_REVENUE_ITEMS.map((item) => (
                  <button
                    key={item}
                    onClick={() => addRevenueItem(item)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {revenueItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada item pendapatan. Tambah dari template atau input manual.</p>
        ) : (
          <div className="space-y-4">
            {revenueItems.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateRevenueItem(item.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Nama Pendapatan"
                  />
                  <button
                    onClick={() => removeRevenueItem(item.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tipe</label>
                    <select
                      value={item.type}
                      onChange={(e) => updateRevenueItem(item.id, 'type', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="fixed">Tetap</option>
                      <option value="unit_based">Per Unit</option>
                      <option value="percentage_of_sales">Persentase</option>
                    </select>
                  </div>
                  {item.type === 'unit_based' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Harga/Unit</label>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateRevenueItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Estimasi Unit</label>
                        <input
                          type="number"
                          value={item.estimated_units}
                          onChange={(e) => updateRevenueItem(item.id, 'estimated_units', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </>
                  )}
                  {item.type === 'fixed' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Jumlah</label>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateRevenueItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}
                  {item.type === 'percentage_of_sales' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Persentase (%)</label>
                      <input
                        type="number"
                        value={item.percentage}
                        onChange={(e) => updateRevenueItem(item.id, 'percentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Biaya</h2>
          <div className="relative">
            <button
              onClick={() => setShowCostDropdown(!showCostDropdown)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              + Tambah dari Template
            </button>
            {showCostDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {DEFAULT_COST_ITEMS.map((item) => (
                  <button
                    key={item}
                    onClick={() => addCostItem(item)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {costItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada item biaya. Tambah dari template atau input manual.</p>
        ) : (
          <div className="space-y-4">
            {costItems.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateCostItem(item.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Nama Biaya"
                  />
                  <button
                    onClick={() => removeCostItem(item.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tipe</label>
                    <select
                      value={item.type}
                      onChange={(e) => updateCostItem(item.id, 'type', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="fixed">Tetap</option>
                      <option value="variable">Variabel</option>
                      <option value="semi-variable">Semi-Variabel</option>
                      <option value="niaga">Niaga</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Kategori</label>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => updateCostItem(item.id, 'category', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {item.type === 'fixed' ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Jumlah</label>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateCostItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Biaya/Unit</label>
                      <input
                        type="number"
                        value={item.unit_cost}
                        onChange={(e) => updateCostItem(item.id, 'unit_cost', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hasil Perhitungan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Pendapatan</p>
            <p className="text-2xl font-bold text-blue-600">Rp {calculations.totalRevenue.toLocaleString('id-ID')}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Biaya</p>
            <p className="text-2xl font-bold text-red-600">Rp {calculations.totalCost.toLocaleString('id-ID')}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Profit</p>
            <p className="text-2xl font-bold text-green-600">Rp {calculations.profit.toLocaleString('id-ID')}</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">ROI</p>
            <p className="text-2xl font-bold text-purple-600">{calculations.roi.toFixed(2)}%</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">BEP (Unit)</p>
            <p className="text-2xl font-bold text-yellow-600">{calculations.bep.toFixed(2)} unit</p>
          </div>
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Forecast 12 Bulan</p>
            <p className="text-2xl font-bold text-indigo-600">Rp {calculations.forecast[11]?.toLocaleString('id-ID') || '0'}</p>
          </div>
        </div>
      </div>

      <button
        onClick={saveProject}
        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
      >
        Simpan Proyeksi
      </button>
    </div>
  );
}