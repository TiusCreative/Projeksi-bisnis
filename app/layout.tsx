import type { Metadata } from 'next';
import './globals.css';
import { BusinessProvider } from '@/app/context/BusinessContext';

export const metadata: Metadata = {
  title: 'ProjeksiSaaS - Kelola & Prediksi Keuangan Bisnis dengan AI',
  description: 'Aplikasi manajemen proyeksi bisnis, simulasi keuangan, perhitungan ROI & BEP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <BusinessProvider>
          {children}
        </BusinessProvider>
      </body>
    </html>
  );
}
