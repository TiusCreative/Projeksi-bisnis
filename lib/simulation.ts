// Business Simulation - Phase 2 Feature

export interface SimulationInput {
  baseRevenue: number;
  baseExpense: number;
  scenario: 'sales_increase' | 'sales_decrease' | 'cost_increase' | 'add_branch' | 'add_employee' | 'price_change';
  parameters: {
    percentage?: number;
    branches?: number;
    employees?: number;
    newPrice?: number;
  };
}

export interface SimulationResult {
  scenario: string;
  before: {
    revenue: number;
    expense: number;
    profit: number;
  };
  after: {
    revenue: number;
    expense: number;
    profit: number;
  };
  impact: {
    revenueChange: number;
    expenseChange: number;
    profitChange: number;
    profitChangePercent: number;
  };
  monthlyData: any[];
}

export class SimulationEngine {
  // Simulate sales increase
  static simulateSalesIncrease(baseRevenue: number, baseExpense: number, percentage: number): SimulationResult {
    const newRevenue = baseRevenue * (1 + percentage / 100);
    const newExpense = baseExpense * (1 + percentage / 100 * 0.3); // Expenses increase but less than revenue
    const newProfit = newRevenue - newExpense;
    const oldProfit = baseRevenue - baseExpense;

    return {
      scenario: 'Penjualan Naik',
      before: { revenue: baseRevenue, expense: baseExpense, profit: oldProfit },
      after: { revenue: newRevenue, expense: newExpense, profit: newProfit },
      impact: {
        revenueChange: newRevenue - baseRevenue,
        expenseChange: newExpense - baseExpense,
        profitChange: newProfit - oldProfit,
        profitChangePercent: ((newProfit - oldProfit) / Math.abs(oldProfit)) * 100,
      },
      monthlyData: this.generateMonthlyData(baseRevenue, baseExpense, newRevenue, newExpense, 12),
    };
  }

  // Simulate sales decrease
  static simulateSalesDecrease(baseRevenue: number, baseExpense: number, percentage: number): SimulationResult {
    const newRevenue = baseRevenue * (1 - percentage / 100);
    const newExpense = baseExpense * (1 - percentage / 100 * 0.2); // Some costs decrease
    const newProfit = newRevenue - newExpense;
    const oldProfit = baseRevenue - baseExpense;

    return {
      scenario: 'Penjualan Turun',
      before: { revenue: baseRevenue, expense: baseExpense, profit: oldProfit },
      after: { revenue: newRevenue, expense: newExpense, profit: newProfit },
      impact: {
        revenueChange: newRevenue - baseRevenue,
        expenseChange: newExpense - baseExpense,
        profitChange: newProfit - oldProfit,
        profitChangePercent: ((newProfit - oldProfit) / Math.abs(oldProfit)) * 100,
      },
      monthlyData: this.generateMonthlyData(baseRevenue, baseExpense, newRevenue, newExpense, 12),
    };
  }

  // Simulate cost increase
  static simulateCostIncrease(baseRevenue: number, baseExpense: number, percentage: number): SimulationResult {
    const newExpense = baseExpense * (1 + percentage / 100);
    const newProfit = baseRevenue - newExpense;
    const oldProfit = baseRevenue - baseExpense;

    return {
      scenario: 'Biaya Naik',
      before: { revenue: baseRevenue, expense: baseExpense, profit: oldProfit },
      after: { revenue: baseRevenue, expense: newExpense, profit: newProfit },
      impact: {
        revenueChange: 0,
        expenseChange: newExpense - baseExpense,
        profitChange: newProfit - oldProfit,
        profitChangePercent: ((newProfit - oldProfit) / Math.abs(oldProfit)) * 100,
      },
      monthlyData: this.generateMonthlyData(baseRevenue, baseExpense, baseRevenue, newExpense, 12),
    };
  }

  // Simulate adding branches
  static simulateAddBranch(baseRevenue: number, baseExpense: number, branches: number): SimulationResult {
    const newRevenue = baseRevenue * (1 + branches * 0.8); // Each branch adds 80% revenue
    const newExpense = baseExpense * (1 + branches * 0.6); // Each branch adds 60% expense
    const newProfit = newRevenue - newExpense;
    const oldProfit = baseRevenue - baseExpense;

    return {
      scenario: `Tambah ${branches} Cabang`,
      before: { revenue: baseRevenue, expense: baseExpense, profit: oldProfit },
      after: { revenue: newRevenue, expense: newExpense, profit: newProfit },
      impact: {
        revenueChange: newRevenue - baseRevenue,
        expenseChange: newExpense - baseExpense,
        profitChange: newProfit - oldProfit,
        profitChangePercent: ((newProfit - oldProfit) / Math.abs(oldProfit)) * 100,
      },
      monthlyData: this.generateMonthlyData(baseRevenue, baseExpense, newRevenue, newExpense, 12),
    };
  }

  // Simulate adding employees
  static simulateAddEmployee(baseRevenue: number, baseExpense: number, employees: number): SimulationResult {
    const avgSalaryPerEmployee = 5000000; // Average salary per employee
    const additionalExpense = employees * avgSalaryPerEmployee;
    const newExpense = baseExpense + additionalExpense;
    const newRevenue = baseRevenue * (1 + employees * 0.05); // Each employee adds 5% revenue
    const newProfit = newRevenue - newExpense;
    const oldProfit = baseRevenue - baseExpense;

    return {
      scenario: `Tambah ${employees} Pegawai`,
      before: { revenue: baseRevenue, expense: baseExpense, profit: oldProfit },
      after: { revenue: newRevenue, expense: newExpense, profit: newProfit },
      impact: {
        revenueChange: newRevenue - baseRevenue,
        expenseChange: newExpense - baseExpense,
        profitChange: newProfit - oldProfit,
        profitChangePercent: ((newProfit - oldProfit) / Math.abs(oldProfit)) * 100,
      },
      monthlyData: this.generateMonthlyData(baseRevenue, baseExpense, newRevenue, newExpense, 12),
    };
  }

  // Simulate price change
  static simulatePriceChange(baseRevenue: number, baseExpense: number, newPrice: number, currentPrice: number): SimulationResult {
    const priceChangePercent = ((newPrice - currentPrice) / currentPrice) * 100;
    const newRevenue = baseRevenue * (1 + priceChangePercent / 100);
    const newExpense = baseExpense; // Expenses stay the same
    const newProfit = newRevenue - newExpense;
    const oldProfit = baseRevenue - baseExpense;

    return {
      scenario: `Ubah Harga ke ${newPrice}`,
      before: { revenue: baseRevenue, expense: baseExpense, profit: oldProfit },
      after: { revenue: newRevenue, expense: newExpense, profit: newProfit },
      impact: {
        revenueChange: newRevenue - baseRevenue,
        expenseChange: 0,
        profitChange: newProfit - oldProfit,
        profitChangePercent: ((newProfit - oldProfit) / Math.abs(oldProfit)) * 100,
      },
      monthlyData: this.generateMonthlyData(baseRevenue, baseExpense, newRevenue, newExpense, 12),
    };
  }

  // Generate monthly data for charts
  private static generateMonthlyData(
    beforeRevenue: number,
    beforeExpense: number,
    afterRevenue: number,
    afterExpense: number,
    period: number
  ) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return Array.from({ length: period }, (_, i) => ({
      month: monthNames[i],
      beforeRevenue: beforeRevenue,
      beforeExpense: beforeExpense,
      beforeProfit: beforeRevenue - beforeExpense,
      afterRevenue: afterRevenue,
      afterExpense: afterExpense,
      afterProfit: afterRevenue - afterExpense,
    }));
  }

  // Run simulation based on scenario
  static runSimulation(input: SimulationInput): SimulationResult {
    switch (input.scenario) {
      case 'sales_increase':
        return this.simulateSalesIncrease(input.baseRevenue, input.baseExpense, input.parameters.percentage || 10);
      case 'sales_decrease':
        return this.simulateSalesDecrease(input.baseRevenue, input.baseExpense, input.parameters.percentage || 10);
      case 'cost_increase':
        return this.simulateCostIncrease(input.baseRevenue, input.baseExpense, input.parameters.percentage || 10);
      case 'add_branch':
        return this.simulateAddBranch(input.baseRevenue, input.baseExpense, input.parameters.branches || 1);
      case 'add_employee':
        return this.simulateAddEmployee(input.baseRevenue, input.baseExpense, input.parameters.employees || 1);
      case 'price_change':
        return this.simulatePriceChange(input.baseRevenue, input.baseExpense, input.parameters.newPrice || input.baseRevenue / 100, input.baseRevenue / 100);
      default:
        return this.simulateSalesIncrease(input.baseRevenue, input.baseExpense, 10);
    }
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
