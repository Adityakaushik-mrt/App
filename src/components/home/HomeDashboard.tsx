import React from 'react';
import { Expense, CategoryItem, BudgetSettings } from '../../types/expense';
import { calculateDailySummary } from '../../utils/calculations';
import { formatRupees } from '../../utils/currency';
import {
  getTodayISODate,
  format24To12Hour,
  formatReadableDate,
} from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Wallet,
  Receipt,
  ArrowUpRight,
  Calculator,
  Plus,
  CalendarDays,
  Sparkles,
} from 'lucide-react';

interface HomeDashboardProps {
  expenses: Expense[];
  categories: CategoryItem[];
  budget: BudgetSettings;
  onSelectExpense: (expense: Expense) => void;
  onOpenAddModal: () => void;
  onOpenDailySummary: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  expenses,
  categories,
  budget,
  onSelectExpense,
  onOpenAddModal,
  onOpenDailySummary,
}) => {
  const todayISO = getTodayISODate();
  const todaySummary = calculateDailySummary(expenses, todayISO, categories);

  // Build the automatic calculation equation string:
  // e.g. "Total Expenses = ₹80 + ₹300 + ₹20 + ₹249 + ₹150 = ₹799"
  const equationParts = todaySummary.expenses.map((e) => formatRupees(e.amountInPaise));
  const equationText =
    todaySummary.expenses.length > 0
      ? `Total Expenses = ${equationParts.join(' + ')} = ${formatRupees(
          todaySummary.totalAmountPaise
        )}`
      : 'No expenses recorded yet today';

  // Budget snippet for current month
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthExpenses = expenses.filter((e) => e.date.startsWith(currentYM));
  const totalSpentMonthPaise = thisMonthExpenses.reduce((sum, e) => sum + e.amountInPaise, 0);
  const budgetPaise = budget.monthlyLimitPaise;
  const budgetPercentUsed = budgetPaise > 0 ? Math.min(Math.round((totalSpentMonthPaise / budgetPaise) * 100), 999) : 0;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Greeting & Today's Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Today's Expense Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span>{formatReadableDate(todayISO)}</span>
            <span>·</span>
            <span>Indian Rupees (₹)</span>
          </p>
        </div>

        {/* Action: Dedicated Daily Summary trigger */}
        <button
          onClick={onOpenDailySummary}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#006874] dark:text-[#97f0ff] bg-[#006874]/10 hover:bg-[#006874]/20 rounded-xl transition"
        >
          <CalendarDays size={14} /> Open Daily Summary
        </button>
      </div>

      {/* 2. Today's Expense Summary: 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Total Expenses Today */}
        <div className="bg-gradient-to-br from-[#006874] to-[#004f58] text-white p-4 sm:p-5 rounded-3xl shadow-md shadow-[#006874]/15 m3-card relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#97f0ff]">
              1. Total Expenses Today
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Wallet size={16} className="text-[#97f0ff]" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
              {formatRupees(todaySummary.totalAmountPaise, true)}
            </div>
            <p className="text-[10px] text-slate-200/80 mt-1">
              Auto-calculated from today's entries
            </p>
          </div>
        </div>

        {/* Card 2: Total Number of Transactions */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs m3-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              2. Total Transactions
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300">
              <Receipt size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {todaySummary.transactionCount}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {todaySummary.transactionCount === 1 ? 'Recorded payment' : 'Recorded payments'}
            </p>
          </div>
        </div>

        {/* Card 3: Highest Single Expense Today */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs m3-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              3. Highest Expense Today
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0 text-rose-600">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formatRupees(todaySummary.highestExpensePaise)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Maximum single spend today
            </p>
          </div>
        </div>

        {/* Card 4: Average Expense Per Transaction */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs m3-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              4. Average / Transaction
            </span>
            <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center shrink-0 text-cyan-700">
              <Calculator size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formatRupees(todaySummary.averageExpensePaise, true)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Total divided by transactions
            </p>
          </div>
        </div>
      </div>

      {/* 3. Monthly Budget Bar Snippet */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              Monthly Budget Status ({now.toLocaleDateString('en-US', { month: 'short' })})
            </div>
            <div className="text-[11px] text-slate-500">
              {formatRupees(totalSpentMonthPaise)} spent of {formatRupees(budgetPaise)} limit ({budgetPercentUsed}% used)
            </div>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              budgetPercentUsed > 100
                ? 'bg-rose-600'
                : budgetPercentUsed >= 80
                ? 'bg-amber-500'
                : 'bg-[#006874]'
            }`}
            style={{ width: `${Math.min(budgetPercentUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* 4. Today's Expense List Section with Prominent Total and Calculation Equation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Today's Expense List
            </h2>
            <p className="text-xs text-slate-500">
              Tap any transaction to view details, edit, or delete
            </p>
          </div>

          {/* Prominently displayed Total at top of expense list as requested */}
          <div className="bg-[#006874]/10 dark:bg-[#006874]/20 border border-[#006874]/30 rounded-2xl px-4 py-2 flex items-center justify-between sm:justify-end gap-3 self-start sm:self-auto">
            <span className="text-xs text-[#006874] dark:text-[#97f0ff] font-semibold">
              Today's Total:
            </span>
            <span className="text-lg font-black text-[#006874] dark:text-[#97f0ff] tabular-nums">
              {formatRupees(todaySummary.totalAmountPaise, true)}
            </span>
          </div>
        </div>

        {/* Explicit Calculation Equation Display */}
        {todaySummary.expenses.length > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              Automatic Calculation:
            </div>
            <div className="font-mono text-xs font-semibold text-[#006874] dark:text-[#97f0ff] whitespace-nowrap">
              {equationText}
            </div>
          </div>
        )}

        {/* List of Today's Transactions */}
        {todaySummary.expenses.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Receipt size={26} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No expenses recorded today yet
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Tap the "+ Add Expense" button below or the floating action button to log your first spend.
            </p>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006874] text-white text-xs font-semibold rounded-xl hover:bg-[#00525c] transition"
            >
              <Plus size={14} /> Add First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {todaySummary.expenses.map((exp) => (
              <div
                key={exp.id}
                onClick={() => onSelectExpense(exp)}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl px-2.5 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CategoryIcon iconName={exp.category} size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {exp.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                      <span>·</span>
                      <span>{format24To12Hour(exp.time)}</span>
                      <span>·</span>
                      <span>{exp.paymentMethod}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right pl-3 shrink-0">
                  <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums block">
                    {formatRupees(exp.amountInPaise)}
                  </span>
                  {exp.notes && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px] block">
                      {exp.notes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
