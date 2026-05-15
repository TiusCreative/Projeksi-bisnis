'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { businessService } from '@/lib/business';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const BUSINESS_CATEGORIES = [
  'Retail',
  'F&B',
  'Jasa',
  'Manufacturing',
  'Technology',
  'Healthcare',
  'Education',
  'Entertainment',
  'Transportation',
  'Lainnya',
];

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Retail',
    address: '',
    target_omzet: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusiness = async () => {
      const result = await businessService.getBusiness(businessId);
      if (result.success && result.data) {
        const business = result.data;
        setFormData({
          name: business.name,
          category: business.category,
          address: business.address || '',
          target_omzet: business.target_omzet.toString(),
        });
        if (business.logo_url) {
          setLogoPreview(business.logo_url);
        }
      } else {
        setError('Gagal memuat data bisnis');
      }
      setLoading(false);
    };

    fetchBusiness();
  }, [businessId]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const fileName = `business-logos/${Date.now()}-${file.name}`;
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: file.type,
    });

    await r2Client.send(command);
    return `${R2_PUBLIC_URL}/${fileName}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let logoUrl = logoPreview;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const result = await businessService.updateBusiness(businessId, {
        name: formData.name,
        category: formData.category,
        address: formData.address,
        target_omzet: parseFloat(formData.target_omzet) || 0,
        logo_url: logoUrl,
      });

      if (result.success) {
        router.push('/dashboard/businesses');
      } else {
        setError(result.error || 'Gagal mengupdate bisnis');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 inline-flex items-center gap-2"
        >
          ← Kembali
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Bisnis</h1>
        <p className="text-gray-600 dark:text-gray-400">Update informasi bisnis Anda</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo Bisnis
          </label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span className="text-3xl">🏢</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="flex-1 text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/20 dark:file:text-indigo-400"
            />
          </div>
        </div>

        {/* Business Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nama Bisnis *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            placeholder="Contoh: Toko Sembako Berkah"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kategori Bisnis *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
          >
            {BUSINESS_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alamat
          </label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
            placeholder="Alamat lengkap bisnis"
          />
        </div>

        {/* Target Omzet */}
        <div>
          <label htmlFor="target_omzet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Omzet Bulanan *
          </label>
          <input
            id="target_omzet"
            type="number"
            value={formData.target_omzet}
            onChange={(e) => setFormData({ ...formData, target_omzet: e.target.value })}
            required
            min="0"
            step="1000"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            placeholder="Contoh: 50000000"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Masukkan dalam Rupiah (tanpa titik atau koma)
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Memproses...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}
