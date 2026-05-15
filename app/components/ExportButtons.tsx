'use client';

import { useState } from 'react';
import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
  exportToJSON,
} from '@/lib/shareUtils';

interface ExportButtonsProps {
  data: any[];
  filename: string;
  title?: string;
  businessName?: string;
  onExport?: (format: string) => void;
  showLabels?: boolean;
  vertical?: boolean;
}

export default function ExportButtons({
  data,
  filename,
  title,
  businessName,
  onExport,
  showLabels = true,
  vertical = false,
}: ExportButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExportPDF = async () => {
    try {
      setLoading('pdf');
      exportToPDF(`${filename}.pdf`, data, undefined, title);
      onExport?.('pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading('excel');
      exportToExcel(`${filename}.xlsx`, data, businessName || 'Data');
      onExport?.('excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading('csv');
      exportToCSV(`${filename}.csv`, data);
      onExport?.('csv');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleExportJSON = async () => {
    try {
      setLoading('json');
      exportToJSON(`${filename}.json`, data);
      onExport?.('json');
    } catch (error) {
      console.error('Error exporting to JSON:', error);
    } finally {
      setLoading(null);
    }
  };

  const containerClass = vertical
    ? 'flex flex-col gap-2'
    : 'flex flex-wrap gap-2 items-center';

  const buttonClass = (format: string) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium shadow-sm ${
      loading === format
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:shadow-md active:scale-95'
    }`;

  return (
    <div className={containerClass}>
      {/* Export to PDF */}
      <button
        onClick={handleExportPDF}
        disabled={loading === 'pdf'}
        className={`${buttonClass('pdf')} bg-red-500 hover:bg-red-600 text-white`}
        title="Export ke PDF"
      >
        <span className="text-lg">📄</span>
        {showLabels && (
          <span className="text-sm">
            {loading === 'pdf' ? 'Generating...' : 'PDF'}
          </span>
        )}
      </button>

      {/* Export to Excel */}
      <button
        onClick={handleExportExcel}
        disabled={loading === 'excel'}
        className={`${buttonClass('excel')} bg-green-600 hover:bg-green-700 text-white`}
        title="Export ke Excel"
      >
        <span className="text-lg">📊</span>
        {showLabels && (
          <span className="text-sm">
            {loading === 'excel' ? 'Generating...' : 'Excel'}
          </span>
        )}
      </button>

      {/* Export to CSV */}
      <button
        onClick={handleExportCSV}
        disabled={loading === 'csv'}
        className={`${buttonClass('csv')} bg-blue-500 hover:bg-blue-600 text-white`}
        title="Export ke CSV"
      >
        <span className="text-lg">📋</span>
        {showLabels && (
          <span className="text-sm">
            {loading === 'csv' ? 'Generating...' : 'CSV'}
          </span>
        )}
      </button>

      {/* Export to JSON */}
      <button
        onClick={handleExportJSON}
        disabled={loading === 'json'}
        className={`${buttonClass('json')} bg-yellow-600 hover:bg-yellow-700 text-white`}
        title="Export ke JSON"
      >
        <span className="text-lg">🔧</span>
        {showLabels && (
          <span className="text-sm">
            {loading === 'json' ? 'Generating...' : 'JSON'}
          </span>
        )}
      </button>
    </div>
  );
}
