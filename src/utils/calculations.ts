/**
 * Calculation Logic Engine for "My Daily Expenses"
 * Implements exact aggregation formulas, category breakdowns, averages, extremes,
 * and budget tracking with zero division-by-zero vulnerabilities.
 */

import {
  Expense,
  DailySummary,
  WeeklySummary,
  MonthlySummary,
  CategoryItem,
  FilterOptions,
} from '../types/expense';
import {
  isoToDDMMYYYY,
  formatReadableDate,
  getWeekRange,
  getMonthRange,
  formatDateToISO,
  getTodayISODate,
} from './dateUtils';

/**
 * Calculates complete summary for a specific calendar date (ISO YYYY-MM-DD)
 */
export function calculateDailySummary(
  expenses: Expense[],
  targetDateISO: string,
  categories: CategoryItem[]
): DailySummary {
  // Filter expenses strictly by matching calendar date
  const dayExpenses = expenses.filter((e) => e.date === targetDateISO);
  
  const count = dayExpenses.length;
  const totalAmountPaise = dayExpenses.reduce((sum, e) => sum + e.amountInPaise, 0);

  let highestExpensePaise = 0;
  let lowestExpensePaise = 0;

  if (count > 0) {
    highestExpensePaise = Math.max(...dayExpenses.map((e) => e.amountInPaise));
    lowestExpensePaise = Math.min(...dayExpenses.map((e) => e.amountInPaise));
  }

  const averageExpensePaise = count > 0 ? Math.round(totalAmountPaise / count) : 0;

  // Category breakdown
  const categoryMap = new Map<string, { total: number; count: number }>();
  dayExpenses.forEach((e) => {
    const prev = categoryMap.get(e.category) || { total: 0, count: 0 };
    categoryMap.set(e.category, {
      total: prev.total + e.amountInPaise,
      count: prev.count + 1,
    });
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([catName, data]) => {
      const catConfig = categories.find((c) => c.name === catName);
      const percentage = totalAmountPaise > 0 ? Math.round((data.total / totalAmountPaise) * 100) : 0;
      return {
        category: catName,
        totalPaise: data.total,
        count: data.count,
        percentage,
        color: catConfig ? catConfig.color : '#006874',
        iconName: catConfig ? catConfig.iconName : 'Tag',
      };
    })
    .sort((a, b) => b.totalPaise - a.totalPaise);

  return {
    date: targetDateISO,
    formattedDate: isoToDDMMYYYY(targetDateISO),
    displayDate: formatReadableDate(targetDateISO),
    totalAmountPaise,
    transactionCount: count,
    highestExpensePaise,
    lowestExpensePaise,
    averageExpensePaise,
    categoryBreakdown,
    expenses: dayExpenses,
  };
}

/**
 * Calculates weekly summary for the week containing reference date
 */
export function calculateWeeklySummary(
  expenses: Expense[],
  refDate: Date = new Date(),
  categories: CategoryItem[]
): WeeklySummary {
  const { start, end, startISO, endISO } = getWeekRange(refDate);

  // Filter expenses between Monday and Sunday
  const weekExpenses = expenses.filter((e) => e.date >= startISO && e.date <= endISO);
  const totalAmountPaise = weekExpenses.reduce((sum, e) => sum + e.amountInPaise, 0);

  // Generate all 7 days of the week (Mon to Sun)
  const dailyTotals: { date: string; dayName: string; formattedDate: string; totalPaise: number }[] = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const iterDate = new Date(start);
  for (let i = 0; i < 7; i++) {
    const currentISO = formatDateToISO(iterDate);
    const dayPaise = weekExpenses
      .filter((e) => e.date === currentISO)
      .reduce((sum, e) => sum + e.amountInPaise, 0);

    dailyTotals.push({
      date: currentISO,
      dayName: dayNames[i],
      formattedDate: isoToDDMMYYYY(currentISO),
      totalPaise: dayPaise,
    });
    iterDate.setDate(iterDate.getDate() + 1);
  }

  // Average daily spending (over 7 days)
  const averageDailySpendingPaise = Math.round(totalAmountPaise / 7);

  // Highest spending day
  let highestSpendingDay: { dayName: string; date: string; totalPaise: number } | null = null;
  const sortedDays = [...dailyTotals].sort((a, b) => b.totalPaise - a.totalPaise);
  if (sortedDays[0] && sortedDays[0].totalPaise > 0) {
    highestSpendingDay = {
      dayName: sortedDays[0].dayName,
      date: sortedDays[0].date,
      totalPaise: sortedDays[0].totalPaise,
    };
  }

  // Category breakdown for week
  const categoryMap = new Map<string, number>();
  weekExpenses.forEach((e) => {
    categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amountInPaise);
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([catName, total]) => {
      const catConfig = categories.find((c) => c.name === catName);
      const percentage = totalAmountPaise > 0 ? Math.round((total / totalAmountPaise) * 100) : 0;
      return {
        category: catName,
        totalPaise: total,
        percentage,
        color: catConfig ? catConfig.color : '#006874',
      };
    })
    .sort((a, b) => b.totalPaise - a.totalPaise);

  const startLabel = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const endLabel = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return {
    weekLabel: `${startLabel} – ${endLabel}`,
    startDate: startISO,
    endDate: endISO,
    totalAmountPaise,
    dailyTotals,
    averageDailySpendingPaise,
    highestSpendingDay,
    categoryBreakdown,
  };
}

/**
 * Calculates monthly summary for the specified calendar month
 */
export function calculateMonthlySummary(
  expenses: Expense[],
  year: number,
  monthZeroIndexed: number,
  categories: CategoryItem[]
): MonthlySummary {
  const { startISO, endISO, label } = getMonthRange(year, monthZeroIndexed);
  const yearMonth = `${year}-${String(monthZeroIndexed + 1).padStart(2, '0')}`;

  const monthExpenses = expenses.filter((e) => e.date >= startISO && e.date <= endISO);
  const totalAmountPaise = monthExpenses.reduce((sum, e) => sum + e.amountInPaise, 0);
  const transactionCount = monthExpenses.length;

  const daysInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();
  const averageDailySpendingPaise = daysInMonth > 0 ? Math.round(totalAmountPaise / daysInMonth) : 0;

  // Daily trends map
  const dailyMap = new Map<number, number>();
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap.set(d, 0);
  }

  monthExpenses.forEach((e) => {
    const day = parseInt(e.date.split('-')[2], 10);
    dailyMap.set(day, (dailyMap.get(day) || 0) + e.amountInPaise);
  });

  const dailyTrends = Array.from(dailyMap.entries()).map(([day, totalPaise]) => ({
    day,
    date: `${yearMonth}-${String(day).padStart(2, '0')}`,
    totalPaise,
  }));

  // Highest and lowest spending days (among days that had expenses or all days)
  let highestSpendingDay: { date: string; dayFormatted: string; totalPaise: number } | null = null;
  let lowestSpendingDay: { date: string; dayFormatted: string; totalPaise: number } | null = null;

  const activeDays = dailyTrends.filter((d) => d.totalPaise > 0);
  if (activeDays.length > 0) {
    const sortedActive = [...activeDays].sort((a, b) => b.totalPaise - a.totalPaise);
    highestSpendingDay = {
      date: sortedActive[0].date,
      dayFormatted: isoToDDMMYYYY(sortedActive[0].date),
      totalPaise: sortedActive[0].totalPaise,
    };
    lowestSpendingDay = {
      date: sortedActive[sortedActive.length - 1].date,
      dayFormatted: isoToDDMMYYYY(sortedActive[sortedActive.length - 1].date),
      totalPaise: sortedActive[sortedActive.length - 1].totalPaise,
    };
  }

  // Category breakdown for month
  const categoryMap = new Map<string, number>();
  monthExpenses.forEach((e) => {
    categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amountInPaise);
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([catName, total]) => {
      const catConfig = categories.find((c) => c.name === catName);
      const percentage = totalAmountPaise > 0 ? Math.round((total / totalAmountPaise) * 100) : 0;
      return {
        category: catName,
        totalPaise: total,
        percentage,
        color: catConfig ? catConfig.color : '#006874',
      };
    })
    .sort((a, b) => b.totalPaise - a.totalPaise);

  return {
    monthLabel: label,
    yearMonth,
    totalAmountPaise,
    transactionCount,
    averageDailySpendingPaise,
    highestSpendingDay,
    lowestSpendingDay,
    categoryBreakdown,
    dailyTrends,
  };
}

/**
 * Filter and search expenses based on active FilterOptions
 */
export function filterExpenses(expenses: Expense[], filter: FilterOptions): Expense[] {
  const todayISO = getTodayISODate();
  const now = new Date();

  return expenses
    .filter((e) => {
      // Search query by title or notes
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        const matchTitle = e.title.toLowerCase().includes(query);
        const matchNotes = e.notes ? e.notes.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchNotes) return false;
      }

      // Category filter
      if (filter.category !== 'all' && e.category !== filter.category) {
        return false;
      }

      // Payment method filter
      if (filter.paymentMethod !== 'all' && e.paymentMethod !== filter.paymentMethod) {
        return false;
      }

      // Period filter
      if (filter.period === 'today') {
        return e.date === todayISO;
      } else if (filter.period === 'yesterday') {
        const yDate = new Date();
        yDate.setDate(yDate.getDate() - 1);
        return e.date === formatDateToISO(yDate);
      } else if (filter.period === 'last7days') {
        const d7 = new Date();
        d7.setDate(d7.getDate() - 6);
        return e.date >= formatDateToISO(d7) && e.date <= todayISO;
      } else if (filter.period === 'thisMonth') {
        const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return e.date.startsWith(currentYM);
      } else if (filter.period === 'previousMonth') {
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevYM = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        return e.date.startsWith(prevYM);
      } else if (filter.period === 'custom') {
        if (filter.customStartDate && e.date < filter.customStartDate) return false;
        if (filter.customEndDate && e.date > filter.customEndDate) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const orderMultiplier = filter.sortOrder === 'asc' ? 1 : -1;
      if (filter.sortBy === 'amount') {
        return (a.amountInPaise - b.amountInPaise) * orderMultiplier;
      } else if (filter.sortBy === 'title') {
        return a.title.localeCompare(b.title) * orderMultiplier;
      } else {
        // Sort by date then time
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date) * orderMultiplier;
        }
        return a.time.localeCompare(b.time) * orderMultiplier;
      }
    });
}
