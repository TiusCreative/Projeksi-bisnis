"use client";

import { useEffect, useState } from "react";
import { cashflowService, CashflowTransaction } from "@/lib/cashflow";
import { useBusiness } from "@/app/context/BusinessContext";

export default function FinanceDashboard() {
  const { selectedBusiness } = useBusiness();
  const [transactions, setTransactions] = useState<CashflowTransaction[]>([]);
  const [summary, setSummary] = useState<{ totalIncome: number; totalExpense: number; balance: number; transactionCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "income",
    category: "Penjualan",
    amount: 0,
    date: "",
    description: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!selectedBusiness) return;
    setLoading(true);
    cashflowService.getBusinessTransactions(selectedBusiness.id).then((res) => {
      if (res.success) setTransactions(res.data);
      setLoading(false);
    });
    cashflowService.calculateCashflowSummary(selectedBusiness.id).then((res) => {
      if (res.success) setSummary(res.data);
    });
  }, [selectedBusiness]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!selectedBusiness) return;
    if (!formData.amount || !formData.date) {
      setFormError("Nominal dan tanggal wajib diisi");
      return;
    }
    const result = await cashflowService.addTransaction({
      business_id: selectedBusiness.id,
      type: formData.type as "income" | "expense",
      category: formData.category,
      amount: Number(formData.amount),
      date: new Date(formData.date),
      description: formData.description,
    });
    if (result.success) {
      setShowForm(false);
      setFormData({ type: "income", category: "Penjualan", amount: 0, date: "", description: "" });
      // Refresh data
      const tx = await cashflowService.getBusinessTransactions(selectedBusiness.id);
      if (tx.success) setTransactions(tx.data);
      const sum = await cashflowService.calculateCashflowSummary(selectedBusiness.id);
      if (sum.success) setSummary(sum.data);
    } else {
      setFormError(result.error || "Gagal menambah transaksi");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard Keuangan</h1>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
            <div className="text-xs text-gray-500">Total Pemasukan</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{cashflowService.formatCurrency(summary.totalIncome)}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
            <div className="text-xs text-gray-500">Total Pengeluaran</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{cashflowService.formatCurrency(summary.totalExpense)}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <div className="text-xs text-gray-500">Saldo Akhir</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{cashflowService.formatCurrency(summary.balance)}</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Daftar Transaksi</h2>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Tutup" : "Tambah Transaksi"}
        </button>
      </div>

      {showForm && (
        <form className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800" onSubmit={handleAddTransaction}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select name="type" value={formData.type} onChange={handleInputChange} className="p-2 rounded border">
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
            <input name="category" value={formData.category} onChange={handleInputChange} className="p-2 rounded border" placeholder="Kategori" required />
            <input name="amount" type="number" value={formData.amount} onChange={handleInputChange} className="p-2 rounded border" placeholder="Nominal" required />
            <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="p-2 rounded border" required />
            <input name="description" value={formData.description} onChange={handleInputChange} className="p-2 rounded border" placeholder="Deskripsi (opsional)" />
          </div>
          {formError && <div className="text-red-500 mt-2">{formError}</div>}
          <button type="submit" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold">Simpan</button>
        </form>
      )}

      {loading ? (
        <div>Memuat data...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2 text-left">Tipe</th>
                <th className="px-4 py-2 text-left">Kategori</th>
                <th className="px-4 py-2 text-left">Nominal</th>
                <th className="px-4 py-2 text-left">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-2">{tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 capitalize">{tx.type === "income" ? "Pemasukan" : "Pengeluaran"}</td>
                  <td className="px-4 py-2">{tx.category}</td>
                  <td className={"px-4 py-2 font-bold " + (tx.type === "income" ? "text-green-600" : "text-red-600")}>{cashflowService.formatCurrency(tx.amount)}</td>
                  <td className="px-4 py-2">{tx.description}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">Belum ada transaksi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
