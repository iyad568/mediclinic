import { ApiClient } from './api';

export interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  description?: string;
}

export interface ExpenseCreate {
  amount: number;
  category: string;
  date: string;
  description?: string;
}

export interface ExpenseResponse {
  id: number;
  amount: number;
  category: string;
  date: string;
  description?: string;
}

export interface ExpenseListResponse {
  todays_revenue: number;
  total_revenue: number;
  todays_expenses: number;
  total_expenses: number;
  todays_profit: number;
  total_profit: number;
}

export interface Transaction {
  id: number;
  type: 'revenue' | 'expense';
  amount: number;
  description: string;
  date: string;
  category?: string;
  patient_name?: string;
  payment_method?: string;
}

export interface RecentTransactions {
  expenses: Expense[];
  appointments: Array<{
    id: number;
    patient_id: number;
    patient_name: string;
    date: string;
    type: string;
    payment_amount: number;
    payment_method: string;
  }>;
}

export interface MonthlyOverview {
  revenue: number;
  expenses: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface MonthlyDataResponse {
  monthly_data: MonthlyData[];
}

export interface ExpensesByCategory {
  [category: string]: number;
}

export class FinanceService extends ApiClient {
  constructor() {
    super();
  }

  // Get expense statistics (revenue, expenses, profit)
  async getExpenseStats(): Promise<ExpenseListResponse> {
    return this.request('/api/finance/expenses/');
  }

  // Create new expense
  async createExpense(expense: ExpenseCreate): Promise<ExpenseResponse> {
    return this.request('/api/finance/expenses/', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  // Get monthly overview
  async getMonthlyOverview(): Promise<MonthlyOverview> {
    return this.request('/api/finance/overview/');
  }

  // Get monthly data for past 6 months
  async getMonthlyData(): Promise<MonthlyDataResponse> {
    return this.request('/api/finance/monthly-data/');
  }

  // Get expenses by category
  async getExpensesByCategory(): Promise<ExpensesByCategory> {
    return this.request('/api/finance/expenses/category/');
  }

  // Get recent transactions
  async getRecentTransactions(): Promise<RecentTransactions> {
    return this.request('/api/finance/transactions/recent/');
  }
}

export const financeService = new FinanceService();
