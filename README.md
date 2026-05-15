# Projeksi Bisnis SaaS 🚀

Aplikasi manajemen proyeksi bisnis, simulasi keuangan, dan AI cashflow analytics berbasis Next.js (App Router), Firebase, dan TailwindCSS.

## ⚙️ Persyaratan Sistem Lokal
- Node.js (Versi 18 ke atas)
- Akun Firebase & Cloudflare R2
- Akun GitHub & Vercel untuk deployment

## 💻 Pengembangan Lokal
1. Clone repositori ini atau masuk ke direktori proyek.
2. Jalankan perintah instalasi dependensi:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```
4. Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## ☁️ Panduan Deploy ke Vercel

Vercel adalah platform terbaik dan gratis untuk mendeploy aplikasi Next.js. Ikuti langkah-langkah berikut:

### Langkah 1: Push Kode ke GitHub
Pastikan kode Anda sudah di-push ke repositori GitHub.
```bash
git init
git add .
git commit -m "Initial commit Projeksi Bisnis SaaS"
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO.git
git push -u origin main
```

### Langkah 2: Hubungkan Repositori di Vercel
1. Buka [vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Temukan repositori GitHub yang baru saja Anda buat dan klik tombol **"Import"**.

### Langkah 3: Konfigurasi Environment Variables (Variabel Lingkungan)
Sebelum mengeklik deploy, gulir ke bagian **Environment Variables** di Vercel, lalu tambahkan *key* berikut sesuai dengan konfigurasi Anda:

| Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_WA_WEBHOOK_URL` | `https://hook.us1.make.com/ganti-dengan-webhook-anda` |
| `R2_ACCESS_KEY_ID` | `Masukkan Access Key R2 Anda di sini` |
| `R2_SECRET_KEY` | `Masukkan Secret Key R2 Anda di sini` |

*(Catatan: Konfigurasi Firebase saat ini tertanam langsung di `firebase.ts`. Sangat disarankan untuk memindahkannya ke Environment Variables Vercel demi keamanan).*

### Langkah 4: Deploy
1. Setelah menambahkan variabel, klik tombol **"Deploy"**.
2. Tunggu proses build Vercel (sekitar 1-2 menit).
3. Selesai! Vercel akan memberikan domain gratis (contoh: `projeksi-bisnis.vercel.app`) yang bisa langsung Anda bagikan ke pengguna Anda.