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