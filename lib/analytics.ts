// AI Analytics - Phase 2 Feature

export interface AnalyticsInsight {
  type: 'prediction' | 'recommendation' | 'warning' | 'info';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export class AnalyticsEngine {
  // Predict revenue based on historical data
  static predictRevenue(historicalData: number[]): {
    prediction: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  } {
    if (historicalData.length < 2) {
      return {
        prediction: historicalData[0] || 0,
        trend: 'stable',
        confidence: 0,
      };
    }

    const lastMonth = historicalData[historicalData.length - 1];
    const previousMonth = historicalData[historicalData.length - 2];
    const change = ((lastMonth - previousMonth) / previousMonth) * 100;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (change > 5) trend = 'increasing';
    else if (change < -5) trend = 'decreasing';
    else trend = 'stable';

    const prediction = lastMonth * (1 + change / 100);
    const confidence = Math.min(100, Math.abs(change) * 2);

    return { prediction, trend, confidence };
  }

  // Recommend optimal price
  static recommendPrice(currentPrice: number, currentSales: number, targetSales: number): {
    recommendedPrice: number;
    reason: string;
    expectedImpact: number;
  } {
    const elasticity = -1.5; // Price elasticity of demand (assumed)
    const priceChangePercent = ((targetSales - currentSales) / currentSales) / elasticity;
    const recommendedPrice = currentPrice * (1 + priceChangePercent / 100);

    return {
      recommendedPrice: Math.max(0, recommendedPrice),
      reason: priceChangePercent > 0 
        ? 'Naikkan harga untuk mencapai target penjualan' 
        : 'Turunkan harga untuk meningkatkan penjualan',
      expectedImpact: Math.abs(targetSales - currentSales),
    };
  }

  // Predict potential loss
  static predictLoss(revenue: number, expenses: number): {
    isLoss: boolean;
    lossAmount: number;
    lossProbability: number;
    severity: 'low' | 'medium' | 'high';
  } {
    const profit = revenue - expenses;
    const isLoss = profit < 0;
    const lossAmount = Math.abs(profit);
    
    // Calculate loss probability based on profit margin
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const lossProbability = margin < 10 ? 80 : margin < 20 ? 40 : 10;
    
    let severity: 'low' | 'medium' | 'high';
    if (lossAmount > revenue * 0.5) severity = 'high';
    else if (lossAmount > revenue * 0.2) severity = 'medium';
    else severity = 'low';

    return { isLoss, lossAmount, lossProbability, severity };
  }

  // Recommend cost savings
  static recommendCostSavings(expenses: number, revenue: number): {
    recommendations: string[];
    potentialSavings: number;
    priority: 'high' | 'medium' | 'low';
  } {
    const expenseRatio = (expenses / revenue) * 100;
    const recommendations: string[] = [];
    let potentialSavings = 0;

    if (expenseRatio > 80) {
      recommendations.push('Biaya operasional terlalu tinggi (>80% dari pendapatan). Pertimbangkan untuk mengurangi biaya tetap.');
      potentialSavings += expenses * 0.1;
    }

    if (expenseRatio > 70) {
      recommendations.push('Optimalkan biaya produksi dengan mencari supplier alternatif.');
      potentialSavings += expenses * 0.05;
    }

    if (expenseRatio > 60) {
      recommendations.push('Review biaya marketing dan evaluasi ROI setiap kampanye.');
      potentialSavings += expenses * 0.03;
    }

    if (recommendations.length === 0) {
      recommendations.push('Struktur biaya sudah optimal. Pertahankan efisiensi saat ini.');
    }

    let priority: 'high' | 'medium' | 'low';
    if (expenseRatio > 80) priority = 'high';
    else if (expenseRatio > 60) priority = 'medium';
    else priority = 'low';

    return { recommendations, potentialSavings, priority };
  }

  // Generate comprehensive insights
  static generateInsights(data: {
    revenue: number[];
    expenses: number[];
    currentPrice: number;
    currentSales: number;
  }): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // Revenue prediction
    const revenuePrediction = this.predictRevenue(data.revenue);
    insights.push({
      type: 'prediction',
      title: 'Prediksi Omzet Bulan Depan',
      description: `Berdasarkan tren data, prediksi omzet bulan depan adalah ${this.formatCurrency(revenuePrediction.prediction)} dengan tren ${revenuePrediction.trend}.`,
      priority: revenuePrediction.confidence > 50 ? 'high' : 'medium',
      actionable: true,
    });

    // Loss prediction
    const lastRevenue = data.revenue[data.revenue.length - 1] || 0;
    const lastExpense = data.expenses[data.expenses.length - 1] || 0;
    const lossPrediction = this.predictLoss(lastRevenue, lastExpense);
    
    if (lossPrediction.isLoss) {
      insights.push({
        type: 'warning',
        title: 'Peringatan Kerugian',
        description: `Terdeteksi potensi kerugian sebesar ${this.formatCurrency(lossPrediction.lossAmount)} dengan probabilitas ${lossPrediction.lossProbability}%.`,
        priority: lossPrediction.severity === 'high' ? 'high' : 'medium',
        actionable: true,
      });
    }

    // Cost savings recommendations
    const costRecommendations = this.recommendCostSavings(lastExpense, lastRevenue);
    if (costRecommendations.recommendations.length > 0) {
      insights.push({
        type: 'recommendation',
        title: 'Rekomendasi Penghematan',
        description: costRecommendations.recommendations.join(' '),
        priority: costRecommendations.priority,
        actionable: true,
      });
    }

    // Price recommendation
    const targetSales = data.currentSales * 1.2; // 20% increase target
    const priceRecommendation = this.recommendPrice(data.currentPrice, data.currentSales, targetSales);
    insights.push({
      type: 'recommendation',
      title: 'Rekomendasi Harga',
      description: `${priceRecommendation.reason}. Harga optimal: ${this.formatCurrency(priceRecommendation.recommendedPrice)}.`,
      priority: 'medium',
      actionable: true,
    });

    return insights;
  }

  // Format currency
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
