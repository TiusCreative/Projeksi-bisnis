'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/app/context/BusinessContext';
import { cashflowService } from '@/lib/cashflow';
import { InvestmentService, InvestmentRecommendation } from '@/lib/investment';

export default function InvestmentsPage() {
  const { selectedBusiness } = useBusiness();
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([]);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedBusiness) return;

    const generateRecommendations = async () => {
      setLoading(true);
      try {
        const transactionsResult = await cashflowService.getBusinessTransactions(selectedBusiness.id);
        
        if (transactionsResult.success) {
          const transactions = transactionsResult.data;
          
          const revenueData: number[] = [];
          const expenseData: number[] = [];
          
          transactions.forEach(t => {
            if (t.type === 'income') {
              revenueData.push(t.amount);
            } else {
              expenseData.push(t.amount);
            }
          });

          const summaryResult = await cashflowService.getCashflowSummary(selectedBusiness.id);
          
          if (summaryResult.success) {
            const summary = summaryResult.data;
            
            const recs = InvestmentService.generateRecommendations({
              revenue: revenueData.length > 0 ? revenueData : [0],
              expenses: expenseData.length > 0 ? expenseData : [0],
              profit: summary.totalIncome - summary.totalExpense,
              cashflow: summary.balance,
            });

            setRecommendations(recs);
            
            const risk = InvestmentService.calculateRiskLevel({
              revenue: revenueData.length > 0 ? revenueData : [0],
              expenses: expenseData.length > 0 ? expenseData : [0],
              cashflow: summary.balance,
            });
            setRiskLevel(risk);
          }
        }
      } catch (error) {
        console.error('Error generating recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    generateRecommendations();
  }, [selectedBusiness]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'expand': return '📈';
      case 'save': return '💰';
      case 'invest': return '🎯';
      case 'reduce': return '📉';
      default: return '💡';
    }
  };

  if (!selectedBusiness) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Pilih bisnis terlebih dahulu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Rekomendasi Investasi AI</h1>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Memuat rekomendasi...</p>
        </div>
      ) : (
        <>
          {/* Risk Level */}
          <div className={`mb-8 p-6 rounded-xl ${getRiskColor(riskLevel)}`}>
            <h2 className="text-xl font-semibold mb-2">Tingkat Risiko Bisnis: {riskLevel.toUpperCase()}</h2>
            <p className="text-sm opacity-90">
              {riskLevel === 'low' && 'Bisnis Anda memiliki risiko rendah dengan pendapatan stabil dan cashflow positif.'}
              {riskLevel === 'medium' && 'Bisnis Anda memiliki risiko sedang. Perlu monitoring rutin.'}
              {riskLevel === 'high' && 'Bisnis Anda memiliki risiko tinggi. Perlu perhatian khusus pada cashflow dan pengeluaran.'}
            </p>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">Belum ada cukup data untuk menghasilkan rekomendasi.</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{getTypeIcon(rec.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{rec.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                          rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{rec.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Estimasi Dampak:</span> Rp {new Intl.NumberFormat('id-ID').format(rec.estimatedImpact)}
                        </div>
                        <div>
                          <span className="font-medium">Timeframe:</span> {rec.timeframe}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
