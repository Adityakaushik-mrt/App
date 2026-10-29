/**
 * Expense Tracker Data Models & Type Definitions
 * Uses integer paise for all monetary values to prevent floating-point rounding errors.
 */

export interface Expense {
  id: string;
  title: string;
  amountInPaise: number; // e.g. 79900 for ₹799.00
  category: string;
  date: string; // ISO date format YYYY-MM-DD for database sorting
  time: string; // 24-hour HH:mm internally
  paymentMethod: PaymentMethodType;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type PaymentMethodType =
  | 'Cash'
  | 'UPI'
  | 'Debit Card'
  | 'Credit Card'
  | 'Bank Transfer'
  | 'Other';

export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
  color: string;
  isCustom?: boolean;
}

export interface BudgetSettings {
  monthlyLimitPaise: number; // e.g. 2000000 for ₹20,000.00
  warningThresholdPercent: number; // default 80%
  notificationsEnabled: boolean;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  formattedDate: string; // DD-MM-YYYY
  displayDate: string; // e.g. 29 October 2026
  totalAmountPaise: number;
  transactionCount: number;
  highestExpensePaise: number;
  lowestExpensePaise: number;
  averageExpensePaise: number;
  categoryBreakdown: {
    category: string;
    totalPaise: number;
    count: number;
    percentage: number;
    color: string;
    iconName: string;
  }[];
  expenses: Expense[];
}

export interface WeeklySummary {
  weekLabel: string;
  startDate: string;
  endDate: string;
  totalAmountPaise: number;
  dailyTotals: {
    date: string;
    dayName: string;
    formattedDate: string;
    totalPaise: number;
  }[];
  averageDailySpendingPaise: number;
  highestSpendingDay: {
    dayName: string;
    date: string;
    totalPaise: number;
  } | null;
  categoryBreakdown: {
    category: string;
    totalPaise: number;
    percentage: number;
    color: string;
  }[];
}

export interface MonthlySummary {
  monthLabel: string;
  yearMonth: string; // YYYY-MM
  totalAmountPaise: number;
  transactionCount: number;
  averageDailySpendingPaise: number;
  highestSpendingDay: {
    date: string;
    dayFormatted: string;
    totalPaise: number;
  } | null;
  lowestSpendingDay: {
    date: string;
    dayFormatted: string;
    totalPaise: number;
  } | null;
  categoryBreakdown: {
    category: string;
    totalPaise: number;
    percentage: number;
    color: string;
  }[];
  dailyTrends: {
    day: number;
    date: string;
    totalPaise: number;
  }[];
}

export type FilterPeriod =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'thisMonth'
  | 'previousMonth'
  | 'custom';

export type SortField = 'date' | 'amount' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  period: FilterPeriod;
  customStartDate?: string;
  customEndDate?: string;
  category: string; // 'all' or category name
  paymentMethod: string; // 'all' or payment method
  searchQuery: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}

export const DEFAULT_PAYMENT_METHODS: PaymentMethodType[] = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'food', name: 'Food & Drinks', iconName: 'Utensils', color: '#f97316' },
  { id: 'groceries', name: 'Groceries', iconName: 'ShoppingCart', color: '#10b981' },
  { id: 'transportation', name: 'Transportation', iconName: 'Car', color: '#3b82f6' },
  { id: 'petrol', name: 'Petrol & Fuel', iconName: 'Fuel', color: '#ef4444' },
  { id: 'shopping', name: 'Shopping', iconName: 'ShoppingBag', color: '#ec4899' },
  { id: 'rent', name: 'Rent', iconName: 'Home', color: '#8b5cf6' },
  { id: 'electricity', name: 'Electricity', iconName: 'Zap', color: '#eab308' },
  { id: 'mobile', name: 'Mobile Recharge', iconName: 'Smartphone', color: '#06b6d4' },
  { id: 'internet', name: 'Internet', iconName: 'Wifi', color: '#6366f1' },
  { id: 'medical', name: 'Medical & Healthcare', iconName: 'Activity', color: '#14b8a6' },
  { id: 'education', name: 'Education', iconName: 'GraduationCap', color: '#84cc16' },
  { id: 'entertainment', name: 'Entertainment', iconName: 'Film', color: '#a855f7' },
  { id: 'travel', name: 'Travel', iconName: 'Plane', color: '#0284c7' },
  { id: 'household', name: 'Household', iconName: 'Box', color: '#d97706' },
  { id: 'personal_care', name: 'Personal Care', iconName: 'Sparkles', color: '#f43f5e' },
  { id: 'emi_loan', name: 'EMI & Loan', iconName: 'Landmark', color: '#64748b' },
  { id: 'other', name: 'Other', iconName: 'MoreHorizontal', color: '#94a3b8' },
];
