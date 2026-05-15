'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Mendaftarkan user ke Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Mengupdate Display Name di Auth
      await updateProfile(user, { displayName: name });

      // 3. Menyimpan struktur user ke Firestore (sesuai Masterplan)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: 'owner', // Default role awal
        created_at: serverTimestamp(),
      });

      // Arahkan ke dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Daftar Akun Baru</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Contoh: Budi Santoso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Minimal 6 karakter" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Sudah punya akun? <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}