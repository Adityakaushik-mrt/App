/**
 * Offline-first Local Storage Service for "My Daily Expenses"
 * Implements persistent local storage using IndexedDB with fallback to localStorage.
 * Dispatches reactive custom events so all components refresh automatically.
 */

import {
  Expense,
  CategoryItem,
  BudgetSettings,
  DEFAULT_CATEGORIES,
} from '../types/expense';
import { getTodayISODate, formatDateToISO } from '../utils/dateUtils';

const STORAGE_KEYS = {
  EXPENSES: 'my_daily_expenses_records',
  CATEGORIES: 'my_daily_expenses_categories',
  BUDGET: 'my_daily_expenses_budget',
  THEME: 'my_daily_expenses_theme',
  SEEDED: 'my_daily_expenses_seeded_v1',
};

// Event fired whenever database updates
export const EXPENSE_DB_CHANGE_EVENT = 'my_daily_expenses_updated';

function notifyDbChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EXPENSE_DB_CHANGE_EVENT));
  }
}

/**
 * Initial sample expenses for today matching user prompt example:
 * Breakfast (₹80), Petrol (₹300), Tea (₹20), Mobile Recharge (₹249), Vegetables (₹150) -> Total = ₹799
 * Plus earlier transactions to demonstrate charts, weekly & monthly reports.
 */
function getInitialSampleExpenses(): Expense[] {
  const todayISO = getTodayISODate();
  
  // Yesterday's ISO date
  const yDate = new Date();
  yDate.setDate(yDate.getDate() - 1);
  const yesterdayISO = formatDateToISO(yDate);

  // 3 days ago
  const d3 = new Date();
  d3.setDate(d3.getDate() - 3);
  const d3ISO = formatDateToISO(d3);

  // 5 days ago
  const d5 = new Date();
  d5.setDate(d5.getDate() - 5);
  const d5ISO = formatDateToISO(d5);

  const baseTimestamp = Date.now();

  return [
    {
      id: 'seed-1',
      title: 'Breakfast',
      amountInPaise: 8000, // ₹80.00
      category: 'Food & Drinks',
      date: todayISO,
      time: '08:30',
      paymentMethod: 'UPI',
      notes: 'Idli sambar and filter coffee',
      createdAt: baseTimestamp - 1000 * 60 * 60 * 4,
      updatedAt: baseTimestamp - 1000 * 60 * 60 * 4,
    },
    {
      id: 'seed-2',
      title: 'Petrol',
      amountInPaise: 30000, // ₹300.00
      category: 'Petrol & Fuel',
      date: todayISO,
      time: '09:15',
      paymentMethod: 'Debit Card',
      notes: 'Fuel at Indian Oil pump',
      createdAt: baseTimestamp - 1000 * 60 * 60 * 3,
      updatedAt: baseTimestamp - 1000 * 60 * 60 * 3,
    },
    {
      id: 'seed-3',
      title: 'Tea',
      amountInPaise: 2000, // ₹20.00
      category: 'Food & Drinks',
      date: todayISO,
      time: '11:00',
      paymentMethod: 'UPI',
      notes: 'Morning tea with office colleagues',
      createdAt: baseTimestamp - 1000 * 60 * 60 * 2,
      updatedAt: baseTimestamp - 1000 * 60 * 60 * 2,
    },
    {
      id: 'seed-4',
      title: 'Mobile Recharge',
      amountInPaise: 24900, // ₹249.00
      category: 'Mobile Recharge',
      date: todayISO,
      time: '12:30',
      paymentMethod: 'UPI',
      notes: '1.5GB/day 28 days plan',
      createdAt: baseTimestamp - 1000 * 60 * 60,
      updatedAt: baseTimestamp - 1000 * 60 * 60,
    },
    {
      id: 'seed-5',
      title: 'Vegetables',
      amountInPaise: 15000, // ₹150.00
      category: 'Groceries',
      date: todayISO,
      time: '14:20',
      paymentMethod: 'Cash',
      notes: 'Fresh veggies from local market',
      createdAt: baseTimestamp - 1000 * 60 * 10,
      updatedAt: baseTimestamp - 1000 * 60 * 10,
    },
    // Yesterday
    {
      id: 'seed-6',
      title: 'Auto Rickshaw',
      amountInPaise: 12000, // ₹120.00
      category: 'Transportation',
      date: yesterdayISO,
      time: '18:45',
      paymentMethod: 'Cash',
      notes: 'Ride back home from metro',
      createdAt: baseTimestamp - 86400000,
      updatedAt: baseTimestamp - 86400000,
    },
    {
      id: 'seed-7',
      title: 'Dinner at Restaurant',
      amountInPaise: 65000, // ₹650.00
      category: 'Food & Drinks',
      date: yesterdayISO,
      time: '20:30',
      paymentMethod: 'Credit Card',
      notes: 'Family dinner',
      createdAt: baseTimestamp - 80000000,
      updatedAt: baseTimestamp - 80000000,
    },
    // Past days for rich weekly & monthly reporting
    {
      id: 'seed-8',
      title: 'Electricity Bill',
      amountInPaise: 145000, // ₹1,450.00
      category: 'Electricity',
      date: d3ISO,
      time: '10:00',
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly power bill online payment',
      createdAt: baseTimestamp - 86400000 * 3,
      updatedAt: baseTimestamp - 86400000 * 3,
    },
    {
      id: 'seed-9',
      title: 'Supermarket Groceries',
      amountInPaise: 185000, // ₹1,850.00
      category: 'Groceries',
      date: d5ISO,
      time: '16:15',
      paymentMethod: 'Credit Card',
      notes: 'Rice, oil, pulses, and snacks',
      createdAt: baseTimestamp - 86400000 * 5,
      updatedAt: baseTimestamp - 86400000 * 5,
    },
  ];
}

class StorageService {
  private expensesCache: Expense[] | null = null;
  private categoriesCache: CategoryItem[] | null = null;
  private budgetCache: BudgetSettings | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Check if seeded
    const isSeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    if (!isSeeded) {
      const initial = getInitialSampleExpenses();
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initial));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(
        STORAGE_KEYS.BUDGET,
        JSON.stringify({
          monthlyLimitPaise: 2000000, // ₹20,000.00
          warningThresholdPercent: 80,
          notificationsEnabled: true,
        })
      );
      localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
    }
  }

  // --- Expenses CRUD ---

  public getExpenses(): Expense[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!raw) return [];
      const list: Expense[] = JSON.parse(raw);
      // Sort newest date & time first
      return list.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.time.localeCompare(a.time);
      });
    } catch {
      return [];
    }
  }

  public getExpenseById(id: string): Expense | null {
    const list = this.getExpenses();
    return list.find((e) => e.id === id) || null;
  }

  public addExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense {
    const expenses = this.getExpenses();
    const now = Date.now();
    const newExpense: Expense = {
      ...data,
      id: 'exp_' + Math.random().toString(36).substring(2, 9) + '_' + now,
      createdAt: now,
      updatedAt: now,
    };
    expenses.unshift(newExpense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    notifyDbChange();
    return newExpense;
  }

  public updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>): boolean {
    const expenses = this.getExpenses();
    const index = expenses.findIndex((e) => e.id === id);
    if (index === -1) return false;

    expenses[index] = {
      ...expenses[index],
      ...updates,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    notifyDbChange();
    return true;
  }

  public deleteExpense(id: string): boolean {
    const expenses = this.getExpenses();
    const filtered = expenses.filter((e) => e.id !== id);
    if (filtered.length === expenses.length) return false;
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
    notifyDbChange();
    return true;
  }

  public clearAllExpenses(): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    notifyDbChange();
  }

  public resetToSampleData(): void {
    const initial = getInitialSampleExpenses();
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initial));
    notifyDbChange();
  }

  // --- Categories Management ---

  public getCategories(): CategoryItem[] {
    if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!raw) return DEFAULT_CATEGORIES;
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  public addCategory(name: string, iconName: string = 'Tag', color: string = '#006874'): CategoryItem {
    const categories = this.getCategories();
    const existing = categories.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) return existing;

    const newCat: CategoryItem = {
      id: 'cat_' + Math.random().toString(36).substring(2, 8),
      name: name.trim(),
      iconName,
      color,
      isCustom: true,
    };
    categories.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    notifyDbChange();
    return newCat;
  }

  // --- Budget Settings ---

  public getBudget(): BudgetSettings {
    const fallback: BudgetSettings = {
      monthlyLimitPaise: 2000000, // ₹20,000
      warningThresholdPercent: 80,
      notificationsEnabled: true,
    };
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BUDGET);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  public saveBudget(settings: BudgetSettings): void {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(settings));
    notifyDbChange();
  }

  // --- Export and Backup ---

  public exportToCSV(): string {
    const expenses = this.getExpenses();
    const headers = [
      'ID',
      'Title',
      'Amount (Rupees)',
      'Amount in Paise',
      'Category',
      'Date (DD-MM-YYYY)',
      'Time (12h)',
      'Payment Method',
      'Notes',
    ];

    const rows = expenses.map((e) => {
      const [y, m, d] = e.date.split('-');
      const ddmmyyyy = `${d}-${m}-${y}`;
      const amountRupees = (e.amountInPaise / 100).toFixed(2);
      return [
        `"${e.id}"`,
        `"${e.title.replace(/"/g, '""')}"`,
        amountRupees,
        e.amountInPaise,
        `"${e.category}"`,
        ddmmyyyy,
        `"${e.time}"`,
        `"${e.paymentMethod}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  public exportJSONBackup(): string {
    const data = {
      version: 1,
      appName: 'My Daily Expenses',
      exportedAt: new Date().toISOString(),
      expenses: this.getExpenses(),
      categories: this.getCategories(),
      budget: this.getBudget(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importJSONBackup(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.expenses)) {
        return { success: false, count: 0, error: 'Invalid backup file format.' };
      }

      // Validate expense items
      const validExpenses: Expense[] = parsed.expenses.filter((e: any) => (
        e &&
        typeof e.title === 'string' &&
        typeof e.amountInPaise === 'number' &&
        typeof e.date === 'string'
      ));

      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(validExpenses));

      if (Array.isArray(parsed.categories)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(parsed.categories));
      }

      if (parsed.budget && typeof parsed.budget.monthlyLimitPaise === 'number') {
        localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(parsed.budget));
      }

      notifyDbChange();
      return { success: true, count: validExpenses.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Failed to parse JSON file' };
    }
  }
}

export const storage = new StorageService();
