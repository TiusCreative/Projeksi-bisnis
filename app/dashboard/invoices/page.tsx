'use client';

import { useState, useEffect } from 'react';
import { useBusiness } from '@/app/context/BusinessContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id?: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date: string;
  notes: string;
  created_at: string;
}

export default function InvoicesPage() {
  const { selectedBusiness } = useBusiness();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    items: [{ description: '', quantity: 1, price: 0 }] as InvoiceItem[],
    tax_rate: 0,
    due_date: '',
    notes: '',
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!selectedBusiness) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'invoices'), where('business_id', '==', selectedBusiness.id));
        const snapshot = await getDocs(q);
        setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [selectedBusiness]);

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * (formData.tax_rate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, items: updatedItems });
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness || !formData.customer_name) return;

    const { subtotal, tax, total } = calculateTotals();

    try {
      const invoiceData = {
        invoice_number: editingInvoice?.invoice_number || generateInvoiceNumber(),
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        items: formData.items,
        subtotal,
        tax,
        total,
        tax_rate: formData.tax_rate,
        status: editingInvoice?.status || 'draft',
        due_date: formData.due_date,
        notes: formData.notes,
        business_id: selectedBusiness.id,
        created_at: editingInvoice?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (editingInvoice?.id) {
        await updateDoc(doc(db, 'invoices', editingInvoice.id), invoiceData);
      } else {
        await addDoc(collection(db, 'invoices'), invoiceData);
      }

      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        items: [{ description: '', quantity: 1, price: 0 }],
        tax_rate: 0,
        due_date: '',
        notes: '',
      });
      setShowForm(false);
      setEditingInvoice(null);

      const q = query(collection(db, 'invoices'), where('business_id', '==', selectedBusiness.id));
      const snapshot = await getDocs(q);
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Gagal menyimpan invoice');
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customer_name: invoice.customer_name,
      customer_email: invoice.customer_email,
      customer_phone: invoice.customer_phone,
      items: invoice.items,
      tax_rate: (invoice.tax / invoice.subtotal) * 100,
      due_date: invoice.due_date,
      notes: invoice.notes,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus invoice ini?')) return;
    try {
      await deleteDoc(doc(db, 'invoices', id));
      setInvoices(invoices.filter(inv => inv.id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Gagal menghapus invoice');
    }
  };

  const updateStatus = async (id: string, status: Invoice['status']) => {
    try {
      await updateDoc(doc(db, 'invoices', id), { status, updated_at: new Date().toISOString() });
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status } : inv));
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('Gagal mengupdate status invoice');
    }
  };

  if (!selectedBusiness) return <div className="p-8 text-gray-500">Pilih bisnis terlebih dahulu.</div>;

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice & Penagihan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola invoice dan tagihan pelanggan</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingInvoice(null);
            setFormData({
              customer_name: '',
              customer_email: '',
              customer_phone: '',
              items: [{ description: '', quantity: 1, price: 0 }],
              tax_rate: 0,
              due_date: '',
              notes: '',
            });
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Tutup Form' : 'Buat Invoice'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {editingInvoice ? 'Edit Invoice' : 'Buat Invoice Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Pelanggan *</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Pelanggan</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telepon Pelanggan</label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Invoice</label>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Deskripsi"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="col-span-5 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                    min="1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Harga"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                    className="col-span-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                    min="0"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="col-span-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                + Tambah Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pajak (%)</label>
                <input
                  type="number"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jatuh Tempo</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Pajak:</span>
                <span className="font-medium">Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                <span>Total:</span>
                <span className="text-indigo-600">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingInvoice(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                {editingInvoice ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Memuat data invoice...</p>
      ) : invoices.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500">
          Belum ada invoice tercatat.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">No. Invoice</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Pelanggan</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Total</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Jatuh Tempo</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{inv.invoice_number}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{inv.customer_name}</div>
                      <div className="text-sm text-gray-500">{inv.customer_email || inv.customer_phone || ''}</div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white">Rp {inv.total.toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <select
                      value={inv.status}
                      onChange={(e) => updateStatus(inv.id!, e.target.value as Invoice['status'])}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                        inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Terkirim</option>
                      <option value="paid">Lunas</option>
                      <option value="overdue">Terlambat</option>
                    </select>
                  </td>
                  <td className="p-4 text-gray-500">{inv.due_date ? new Date(inv.due_date).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(inv)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id!)}
                        className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
