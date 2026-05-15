/**
 * AI Investment Recommendation Service
 * Provides investment suggestions based on business financial data
 */

export interface InvestmentRecommendation {
  type: 'expand' | 'save' | 'invest' | 'reduce';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedImpact: number;
  timeframe: string;
}

export class InvestmentService {
  /**
   * Generate investment recommendations based on financial data
   */
  static generateRecommendations(data: {
    revenue: number[];
    expenses: number[];
    profit: number;
    cashflow: number;
  }): InvestmentRecommendation[] {
    const recommendations: InvestmentRecommendation[] = [];
    const avgRevenue = data.revenue.reduce((a, b) => a + b, 0) / data.revenue.length;
    const avgExpense = data.expenses.reduce((a, b) => a + b, 0) / data.expenses.length;
    const profitMargin = (data.profit / avgRevenue) * 100;

    // High profit margin - recommend expansion
    if (profitMargin > 20) {
      recommendations.push({
        type: 'expand',
        priority: 'high',
        title: 'Ekspansi Bisnis',
        description: 'Profit margin tinggi (>20%). Pertimbangkan untuk membuka cabang baru atau meningkatkan kapasitas produksi.',
        estimatedImpact: data.profit * 0.3,
        timeframe: '6-12 bulan',
      });
    }

    // Low cashflow - recommend saving
    if (data.cashflow < avgExpense * 0.5) {
      recommendations.push({
        type: 'save',
        priority: 'high',
        title: 'Tingkatkan Reservasi Kas',
        description: 'Cashflow rendah. Pertahankan kas untuk operasional dan pertimbangkan pengurangan pengeluaran tidak penting.',
        estimatedImpact: data.cashflow * 0.2,
        timeframe: '1-3 bulan',
      });
    }

    // Stable revenue - recommend investment
    const revenueVariance = this.calculateVariance(data.revenue);
    if (revenueVariance < avgRevenue * 0.1 && data.profit > 0) {
      recommendations.push({
        type: 'invest',
        priority: 'medium',
        title: 'Investasikan Keuntungan',
        description: 'Pendapatan stabil. Pertimbangkan investasi keuntungan dalam instrumen keuangan atau peralatan produktif.',
        estimatedImpact: data.profit * 0.15,
        timeframe: '3-6 bulan',
      });
    }

    // High expenses - recommend reduction
    const expenseRatio = (avgExpense / avgRevenue) * 100;
    if (expenseRatio > 70) {
      recommendations.push({
        type: 'reduce',
        priority: 'medium',
        title: 'Optimasi Pengeluaran',
        description: 'Rasio pengeluaran tinggi (>70%). Tinjau ulang biaya operasional dan cari efisiensi.',
        estimatedImpact: avgExpense * 0.1,
        timeframe: '1-3 bulan',
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate variance of an array
   */
  private static calculateVariance(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
  }

  /**
   * Calculate risk level based on financial data
   */
  static calculateRiskLevel(data: {
    revenue: number[];
    expenses: number[];
    cashflow: number;
  }): 'low' | 'medium' | 'high' {
    const avgRevenue = data.revenue.reduce((a, b) => a + b, 0) / data.revenue.length;
    const revenueVariance = this.calculateVariance(data.revenue);
    const volatility = revenueVariance / avgRevenue;

    if (volatility < 0.1 && data.cashflow > 0) {
      return 'low';
    } else if (volatility < 0.3) {
      return 'medium';
    } else {
      return 'high';
    }
  }
}
