# Fitur Share & Export

Aplikasi ProjeksiSaaS memiliki fitur lengkap untuk berbagi dan mengekspor data bisnis Anda.

## 📤 Share Buttons

### Penggunaan di Components

```tsx
import { ShareButtons } from '@/app/components';

export default function MyComponent() {
  return (
    <ShareButtons
      title="Proyeksi Bisnis 2024"
      text="Lihat proyeksi bisnis kami untuk tahun 2024"
      url="https://projeksi-bisnis.vercel.app/dashboard"
      businessName="Toko Online ABC"
      metrics={{
        'Proyeksi Revenue': 500000000,
        'Target Profit': 50000000,
        'Growth': '25%'
      }}
      showLabels={true}
      onShare={(platform) => console.log(`Shared via ${platform}`)}
    />
  );
}
```

### Available Platforms

| Platform | Function | Deskripsi |
|----------|----------|-----------|
| **WhatsApp** | `shareToWhatsApp()` | Bagikan pesan ke WhatsApp dengan format laporan |
| **Telegram** | `shareToTelegram()` | Bagikan ke Telegram |
| **Twitter/X** | `shareToTwitter()` | Bagikan tweet dengan hashtag |
| **Facebook** | `shareToFacebook()` | Bagikan di Facebook wall |
| **LinkedIn** | `shareToLinkedIn()` | Bagikan di LinkedIn (professional) |
| **Copy Link** | `copyToClipboard()` | Copy link ke clipboard |
| **Web Share** | `shareViaWebShare()` | Share via native OS share menu (iOS/Android) |

### Contoh Penggunaan Langsung

```tsx
import { 
  shareToWhatsApp, 
  createReportMessage 
} from '@/lib/shareUtils';

// Buat pesan laporan terformat
const message = createReportMessage('Toko ABC', {
  'Revenue': 100000000,
  'Profit': 20000000,
  'Growth': '15%'
});

// Kirim ke WhatsApp
shareToWhatsApp(message);

// Atau dengan nomor telepon spesifik
shareToWhatsApp(message, '6281234567890'); // Format: country code + phone
```

---

## 📥 Export Buttons

### Penggunaan di Components

```tsx
import { ExportButtons } from '@/app/components';

export default function DashboardPage() {
  const projectionData = [
    { month: 'Jan', revenue: 50000000, expense: 30000000 },
    { month: 'Feb', revenue: 55000000, expense: 32000000 },
    { month: 'Mar', revenue: 60000000, expense: 35000000 },
  ];

  return (
    <ExportButtons
      data={projectionData}
      filename="proyeksi-2024"
      title="Proyeksi Bisnis 2024"
      businessName="Toko ABC"
      businessId="abc123"
      vertical={false}
      showLabels={true}
      onExport={(format) => console.log(`Exported as ${format}`)}
    />
  );
}
```

### Available Export Formats

| Format | Function | File Type | Kegunaan |
|--------|----------|-----------|----------|
| **PDF** | `exportToPDF()` | .pdf | Laporan profesional, mudah dibagikan |
| **Excel** | `exportToExcel()` | .xlsx | Analisis data, pivot table |
| **CSV** | `exportToCSV()` | .csv | Import ke aplikasi lain, universal |
| **JSON** | `exportToJSON()` | .json | API, database backup |

### Contoh Penggunaan Langsung

```tsx
import { 
  exportToPDF, 
  exportToExcel, 
  exportToCSV 
} from '@/lib/shareUtils';

const data = [
  { month: 'Jan', sales: 50000000, profit: 10000000 },
  { month: 'Feb', sales: 55000000, profit: 12000000 },
];

// Export ke PDF
exportToPDF(
  'laporan-penjualan.pdf', 
  data, 
  ['month', 'sales', 'profit'],
  'Laporan Penjualan 2024'
);

// Export ke Excel dengan nama sheet
exportToExcel('laporan-penjualan.xlsx', data, 'Penjualan');

// Export ke CSV
exportToCSV('laporan-penjualan.csv', data);
```

---

## 🎯 Advanced Features

### 1. Generate Projection Report

```tsx
import { generateProjectionReport } from '@/lib/shareUtils';

// Generate report dalam berbagai format
await generateProjectionReport(
  'business-id-123',
  'Toko ABC',
  projectionData,
  'pdf' // atau 'excel', 'csv', 'json'
);
```

### 2. Create Formatted Report Message

```tsx
import { createReportMessage } from '@/lib/shareUtils';

const message = createReportMessage('Bisnis Saya', {
  'Revenue': 500000000,
  'Profit': 50000000,
  'Growth': '25%',
  'ROI': '10%'
});

console.log(message);
// Output:
// 📊 *Laporan Proyeksi Bisnis*
// Bisnis: *Bisnis Saya*
// Tanggal: 01/01/2024
// • Revenue: *Rp 500.000.000,00*
// • Profit: *Rp 50.000.000,00*
// • Growth: *25%*
// • ROI: *10%*
```

### 3. Generate Shareable Link with Parameters

```tsx
import { generateShareLink } from '@/lib/shareUtils';

const shareLink = generateShareLink(
  'https://projeksi-bisnis.vercel.app/reports/shared',
  {
    businessId: 'abc123',
    month: 'January',
    year: 2024
  }
);

// Result: https://projeksi-bisnis.vercel.app/reports/shared?businessId=abc123&month=January&year=2024
```

### 4. Format Currency for Sharing

```tsx
import { formatCurrencyForShare } from '@/lib/shareUtils';

const formatted = formatCurrencyForShare(500000000, 'IDR');
console.log(formatted); // Output: Rp 500.000.000,00
```

---

## 💾 Installation & Dependencies

Fitur share/export membutuhkan library tambahan:

```bash
npm install jspdf html2canvas xlsx
```

Atau jika menggunakan yarn:

```bash
yarn add jspdf html2canvas xlsx
```

---

## 🎨 UI Component Props

### ShareButtons Props

```tsx
interface ShareButtonsProps {
  title: string;              // Judul untuk sharing
  text: string;               // Teks untuk sharing
  url?: string;               // URL untuk sharing
  showLabels?: boolean;       // Tampilkan label button (default: true)
  businessName?: string;      // Nama bisnis untuk laporan
  metrics?: Record<string, any>; // Metrics untuk laporan
  onShare?: (platform: string) => void; // Callback saat share
}
```

### ExportButtons Props

```tsx
interface ExportButtonsProps {
  data: any[];               // Data untuk export
  filename: string;          // Nama file (tanpa extension)
  title?: string;            // Judul laporan
  businessName?: string;     // Nama bisnis
  businessId?: string;       // ID bisnis
  onExport?: (format: string) => void; // Callback saat export
  showLabels?: boolean;      // Tampilkan label (default: true)
  vertical?: boolean;        // Arrange buttons vertically (default: false)
}
```

---

## 🔐 Privacy & Security

- Semua sharing dilakukan melalui protokol HTTPS
- Data tidak tersimpan di server eksternal
- WhatsApp Web membuka di tab baru tanpa tracking
- Social media sharing menggunakan share intent resmi

---

## 📱 Mobile Support

Fitur ini sepenuhnya responsive dan mendukung:

- ✅ iOS (Safari, Chrome)
- ✅ Android (Chrome, Firefox, Samsung Internet)
- ✅ Desktop (All modern browsers)
- ✅ Web Share API pada perangkat yang mendukung

---

## ⚠️ Troubleshooting

### WhatsApp tidak membuka

**Solusi:**
- Pastikan WhatsApp Web sudah di-setup di browser
- Atau install WhatsApp Desktop
- Gunakan nomor telepon dengan kode negara: `62812345678`

### Export PDF tidak berfungsi

**Solusi:**
- Pastikan `jspdf` sudah terinstall
- Browser mungkin memblok popup, allow popups untuk domain

### Excel tidak membuka di mobile

**Solusi:**
- Download file terlebih dahulu
- Buka dengan aplikasi Excel/Google Sheets

---

## 📞 Support

Untuk pertanyaan atau issue, hubungi tim support ProjeksiSaaS melalui WhatsApp atau email.
