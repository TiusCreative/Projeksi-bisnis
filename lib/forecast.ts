// AI Forecast Engine - Phase 2 Feature

export interface ForecastData {
  month: string;
  value: number;
}

export class ForecastEngine {
  // Moving Average Forecast
  static calculateMovingAverage(data: number[], windowSize: number = 3): number[] {
    const forecast: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        forecast.push(data[i]);
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
        forecast.push(average);
      }
    }
    
    return forecast;
  }

  // Linear Regression Forecast
  static calculateLinearRegression(data: number[]): { slope: number; intercept: number; forecast: number[] } {
    const n = data.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const yValues = data;

    // Calculate slope (m) and intercept (b)
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecast
    const forecast = xValues.map(x => slope * x + intercept);

    return { slope, intercept, forecast };
  }

  // Simple Prophet-like Forecast (simplified version)
  static calculateProphetForecast(data: number[], periods: number = 12): number[] {
    // Simplified trend + seasonality
    const trend = this.calculateLinearRegression(data);
    const forecast: number[] = [];
    
    for (let i = 0; i < periods; i++) {
      const predictedValue = trend.slope * (data.length + i) + trend.intercept;
      
      // Add simple seasonality (sinusoidal pattern)
      const seasonality = Math.sin((i / 6) * Math.PI) * (data.reduce((sum, val) => sum + val, 0) / data.length) * 0.1;
      
      forecast.push(Math.max(0, predictedValue + seasonality));
    }
    
    return forecast;
  }

  // Predict sales
  static predictSales(historicalData: number[], method: 'moving_average' | 'linear_regression' | 'prophet' = 'linear_regression', periods: number = 12): number[] {
    switch (method) {
      case 'moving_average':
        const ma = this.calculateMovingAverage(historicalData);
        const lastMA = ma[ma.length - 1];
        return Array(periods).fill(lastMA);
      
      case 'linear_regression':
        const lr = this.calculateLinearRegression(historicalData);
        const forecast: number[] = [];
        for (let i = 0; i < periods; i++) {
          forecast.push(lr.slope * (historicalData.length + i) + lr.intercept);
        }
        return forecast;
      
      case 'prophet':
        return this.calculateProphetForecast(historicalData, periods);
      
      default:
        return this.calculateLinearRegression(historicalData).forecast;
    }
  }

  // Predict profit
  static predictProfit(revenueForecast: number[], expenseRatio: number = 0.7): number[] {
    return revenueForecast.map(revenue => revenue * (1 - expenseRatio));
  }

  // Predict cashflow
  static predictCashflow(revenueData: number[], expenseData: number[]): {
    revenue: number[];
    expense: number[];
    cashflow: number[];
  } {
    const revenueForecast = this.predictSales(revenueData, 'linear_regression', 12);
    const expenseForecast = this.predictSales(expenseData, 'linear_regression', 12);
    const cashflow = revenueForecast.map((rev, i) => rev - expenseForecast[i]);

    return {
      revenue: revenueForecast,
      expense: expenseForecast,
      cashflow,
    };
  }

  // Format forecast data for charts
  static formatForecastData(forecast: number[], startMonth: number = 1): ForecastData[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return forecast.map((value, index) => ({
      month: months[(startMonth + index - 1) % 12],
      value,
    }));
  }
}
