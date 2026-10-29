import React, { useState } from 'react';
import { Expense, CategoryItem } from '../../types/expense';
import { calculateDailySummary } from '../../utils/calculations';
import { formatRupees } from '../../utils/currency';
import {
  isoToDDMMYYYY,
  getTodayISODate,
  format24To12Hour,
  formatReadableDate,
  formatDateToISO,
} from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
} from 'lucide-react';

interface DailySummaryViewProps {
  expenses: Expense[];
  categories: CategoryItem[];
  onSelectExpense: (expense: Expense) => void;
  onOpenAddModal: (prefillDate?: string) => void;
}

export const DailySummaryView: React.FC<DailySummaryViewProps> = ({
  expenses,
  categories,
  onSelectExpense,
  onOpenAddModal,
}) => {
  const [selectedDateISO, setSelectedDateISO] = useState<string>(getTodayISODate());

  const summary = calculateDailySummary(expenses, selectedDateISO, categories);

  const handlePrevDay = () => {
    const d = new Date(selectedDateISO);
    d.setDate(d.getDate() - 1);
    setSelectedDateISO(formatDateToISO(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDateISO);
    d.setDate(d.getDate() + 1);
    setSelectedDateISO(formatDateToISO(d));
  };

  const handleSetToday = () => {
    setSelectedDateISO(getTodayISODate());
  };

  return (
    <div className="space-y-6">
      {/* Date Navigator Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handlePrevDay}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Previous Day"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-[#006874] dark:text-[#97f0ff]" />
            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              {formatReadableDate(selectedDateISO)}
            </span>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Next Day"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Date Picker Input & Quick Jump to Today */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <input
            type="date"
            value={selectedDateISO}
            onChange={(e) => setSelectedDateISO(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#006874]"
          />
          {selectedDateISO !== getTodayISODate() && (
            <button
              onClick={handleSetToday}
              className="px-3 py-1.5 text-xs font-medium bg-[#006874]/10 text-[#006874] dark:text-[#97f0ff] rounded-xl hover:bg-[#006874]/20 transition"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Main Banner: Daily Expense Summary Title & Total */}
      <div className="bg-gradient-to-br from-[#006874] to-[#004f58] rounded-3xl p-6 text-white shadow-lg shadow-[#006874]/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#97f0ff] font-semibold">
              Daily Expense Summary
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-0.5">
              {summary.displayDate}
            </h2>
            <p className="text-xs text-slate-200/80 mt-1">
              Date format: {summary.formattedDate}
            </p>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-slate-200">Total Expenses</span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums mt-0.5">
              {formatRupees(summary.totalAmountPaise, true)}
            </div>
          </div>
        </div>

        {/* 5 Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15 text-xs">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
            <div className="text-slate-200 flex items-center gap-1.5 mb-1">
              <Receipt size={14} className="text-[#97f0ff]" /> Transactions
            </div>
            <div className="text-lg font-bold tabular-nums">
              {summary.transactionCount}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
            <div className="text-slate-200 flex items-center gap-1.5 mb-1">
              <ArrowUpRight size={14} className="text-rose-300" /> Highest Expense
            </div>
            <div className="text-lg font-bold tabular-nums">
              {formatRupees(summary.highestExpensePaise)}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
            <div className="text-slate-200 flex items-center gap-1.5 mb-1">
              <ArrowDownRight size={14} className="text-emerald-300" /> Lowest Expense
            </div>
            <div className="text-lg font-bold tabular-nums">
              {formatRupees(summary.lowestExpensePaise)}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3">
            <div className="text-slate-200 flex items-center gap-1.5 mb-1">
              <Calculator size={14} className="text-[#97f0ff]" /> Average Expense
            </div>
            <div className="text-lg font-bold tabular-nums">
              {formatRupees(summary.averageExpensePaise, true)}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Category-Wise Breakdown
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Calculated strictly using transactions for {summary.formattedDate}
        </p>

        {summary.categoryBreakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No category expenses for this date.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-center">Items</th>
                  <th className="pb-3 text-right">Total</th>
                  <th className="pb-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summary.categoryBreakdown.map((item) => (
                  <tr key={item.category} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <CategoryIcon iconName={item.category} size={15} color={item.color} />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 text-center text-slate-500 tabular-nums">
                      {item.count}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatRupees(item.totalPaise)}
                    </td>
                    <td className="py-3 text-right text-slate-500 tabular-nums">
                      {item.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                  <td className="pt-3">Total</td>
                  <td className="pt-3 text-center tabular-nums">{summary.transactionCount}</td>
                  <td className="pt-3 text-right tabular-nums text-[#006874] dark:text-[#97f0ff]">
                    {formatRupees(summary.totalAmountPaise, true)}
                  </td>
                  <td className="pt-3 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Complete List of Transactions for this Date */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Transactions for {summary.formattedDate}
            </h3>
            <p className="text-xs text-slate-500">
              {summary.transactionCount} {summary.transactionCount === 1 ? 'record' : 'records'}
            </p>
          </div>
          <button
            onClick={() => onOpenAddModal(selectedDateISO)}
            className="text-xs font-semibold text-[#006874] dark:text-[#97f0ff] hover:underline"
          >
            + Add Expense for this day
          </button>
        </div>

        {summary.expenses.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No expenses recorded on {summary.formattedDate}.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {summary.expenses.map((exp) => (
              <div
                key={exp.id}
                onClick={() => onSelectExpense(exp)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <CategoryIcon iconName={exp.category} size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {exp.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                      <span>{exp.category}</span>
                      <span>·</span>
                      <span>{format24To12Hour(exp.time)}</span>
                      <span>·</span>
                      <span>{exp.paymentMethod}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right pl-3 shrink-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatRupees(exp.amountInPaise)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
