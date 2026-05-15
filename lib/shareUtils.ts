import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const formatCurrencyForShare = (amount: number, currency = 'IDR') => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
};

export const createReportMessage = (businessName: string, metrics: Record<string, any>) => {
  let message = `📊 *Laporan Cashflow Bisnis*\n`;
  message += `🏢 Bisnis: *${businessName}*\n`;
  message += `📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}\n\n`;
  
  Object.entries(metrics).forEach(([key, value]) => {
    message += `• ${key}: *${value}*\n`;
  });
  
  message += `\n_Dibuat melalui ProjeksiSaaS_`;
  return message;
};

export const shareToWhatsApp = (message: string, phoneNumber?: string) => {
  const url = `https://wa.me/${phoneNumber || ''}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

export const exportToPDF = (filename: string, data: any[], headers?: string[], title?: string) => {
  const doc = new jsPDF();
  if (title) {
    doc.setFontSize(18);
    doc.text(title, 14, 22);
  }
  
  const tableHeaders = headers || (data.length > 0 ? Object.keys(data[0]) : []);
  const tableData = data.map(item => tableHeaders.map(h => item[h] || ''));

  autoTable(doc, {
    startY: title ? 30 : 14,
    head: [tableHeaders],
    body: tableData,
  });

  doc.save(filename);
};

export const exportToExcel = (filename: string, data: any[], sheetName: string = 'Sheet 1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

export const exportToCSV = (filename: string, data: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const exportToJSON = (filename: string, data: any[]) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// Tambahkan parameter url (opsional) agar bisa menerima 2 argumen
export const shareToTelegram = (message: string, url?: string) => {
  const fullMessage = url ? `${message}\n${url}` : message;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url || window.location.href)}&text=${encodeURIComponent(fullMessage)}`;
  window.open(telegramUrl, '_blank');
};

export const shareToTwitter = (message: string, url?: string) => {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}${url ? `&url=${encodeURIComponent(url)}` : ''}`;
  window.open(twitterUrl, '_blank');
};

export const shareToFacebook = (url?: string, message?: string) => {
  const shareUrl = url || window.location.href;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}${message ? `&quote=${encodeURIComponent(message)}` : ''}`;
  window.open(fbUrl, '_blank');
};

export const shareToLinkedIn = (url?: string, message?: string) => {
  const shareUrl = url || window.location.href;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}${message ? `&summary=${encodeURIComponent(message)}` : ''}`;
  // LinkedIn modern lebih fokus pada URL, tapi kita tambahkan message sebagai summary
  window.open(liUrl, '_blank');
};

// Ganti fungsi copyToClipboard lama dengan ini:
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    // Kita hapus alert() agar tidak mengganggu UI, 
    // karena ShareButtons.tsx sudah menangani status "Copied" sendiri.
    return true; 
  } catch (err) {
    console.error('Gagal menyalin link:', err);
    return false;
  }
};

export const shareViaWebShare = async (title: string, text: string, url: string): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true; // Berhasil share
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error saat berbagi:', err);
      }
      return false; // Gagal atau dibatalkan user
    }
  } else {
    // Fallback jika browser tidak mendukung
    return await copyToClipboard(url); 
  }
};