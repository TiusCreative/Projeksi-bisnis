export interface ProjectionInput {
  modal_awal: number;
  biaya_operasional: number;
  sumbangan_investor: number;
  pendapatan_iklan: number;
  target_penjualan: number;
  harga_jual: number;
  biaya_produksi: number;
  pertumbuhan_penjualan: number;
}

export interface ProjectionResult {
  bep: number;
  roi: number;
  profit: number;
  forecast_growth: any[];
  summary: {
    total_investment: number;
    break_even_units: number;
    monthly_profit: number;
    annual_profit: number;
  };
}

export const projectionService = {
  // Calculate BEP (Break Even Point)
  calculateBEP(fixedCost: number, sellingPrice: number, variableCost: number): number {
    if (sellingPrice - variableCost <= 0) return 0;
    return fixedCost / (sellingPrice - variableCost);
  },

  // Calculate ROI (Return on Investment)
  calculateROI(netProfit: number, investment: number): number {
    if (investment <= 0) return 0;
    return (netProfit / investment) * 100;
  },

  // Calculate Profit
  calculateProfit(revenue: number, expenses: number): number {
    return revenue - expenses;
  },

  // Calculate Forecast Growth: y = a(1+r)^t
  calculateForecastGrowth(initialValue: number, growthRate: number, periods: number): number[] {
    const forecast: number[] = [];
    for (let t = 0; t <= periods; t++) {
      forecast.push(initialValue * Math.pow(1 + growthRate / 100, t));
    }
    return forecast;
  },

  // Complete projection calculation
  calculateProjection(input: ProjectionInput): ProjectionResult {
    // Total investment = modal awal + biaya operasional
    const totalInvestment = input.modal_awal + input.biaya_operasional;
    
    // Variable cost per unit = biaya produksi per unit
    const variableCostPerUnit = input.biaya_produksi / input.target_penjualan;
    
    // BEP calculation
    const bep = this.calculateBEP(input.biaya_operasional, input.harga_jual, variableCostPerUnit);
    
    // Monthly revenue
    const monthlyRevenue = input.target_penjualan * input.harga_jual;
    
    // Monthly expenses = biaya operasional + biaya produksi
    const monthlyExpenses = input.biaya_operasional + input.biaya_produksi;
    
    // Monthly profit
    const monthlyProfit = monthlyRevenue - monthlyExpenses + input.pendapatan_iklan;
    
    // Annual profit
    const annualProfit = monthlyProfit * 12;
    
    // ROI calculation
    const roi = this.calculateROI(annualProfit, totalInvestment);
    
    // Profit calculation
    const profit = this.calculateProfit(monthlyRevenue, monthlyExpenses);
    
    // Forecast growth for 12 months
    const forecastGrowth = this.calculateForecastGrowth(
      monthlyRevenue,
      input.pertumbuhan_penjualan,
      12
    ).map((value, index) => ({
      month: index + 1,
      revenue: value,
      expenses: monthlyExpenses * Math.pow(1 + input.pertumbuhan_penjualan / 100, index),
      profit: value - monthlyExpenses * Math.pow(1 + input.pertumbuhan_penjualan / 100, index),
    }));

    return {
      bep,
      roi,
      profit,
      forecast_growth: forecastGrowth,
      summary: {
        total_investment: totalInvestment,
        break_even_units: bep,
        monthly_profit: monthlyProfit,
        annual_profit: annualProfit,
      },
    };
  },

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  },
};
