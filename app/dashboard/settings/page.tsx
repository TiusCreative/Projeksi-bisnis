'use client';

import { useState, useEffect, FormEvent } from 'react';
import { auth } from '@/lib/firebase';
import { updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, []);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const user = auth.currentUser;
    if (!user) return;

    try {
      // 1. Update Nama
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      // 2. Update Email (Memerlukan verifikasi untuk keamanan)
      if (email !== user.email) {
        // Kirim link verifikasi ke email baru. Pengguna harus klik link di email baru mereka.
        await verifyBeforeUpdateEmail(user, email);
        setMessage({ 
          text: 'Nama berhasil diubah! Untuk email, kami telah mengirimkan link verifikasi ke email baru Anda. Silakan cek kotak masuk Anda untuk menyelesaikan perubahan.', 
          type: 'success' 
        });
      } else {
        setMessage({ text: 'Profil berhasil diperbarui!', type: 'success' });
      }
    } catch (error: any) {
      console.error(error);
      // Firebase mendeteksi sesi sudah terlalu lama, butuh re-login
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ text: 'Gagal mengubah email: Sesi Anda sudah kedaluwarsa. Silakan Logout dan Login kembali untuk mengubah email.', type: 'error' });
      } else {
        setMessage({ text: `Terjadi kesalahan: ${error.message}`, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pengaturan Profil</h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola informasi pribadi akun Anda.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Lengkap</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Masukkan nama Anda" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alamat Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="nama@email.com" required />
          </div>

          <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors">
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}