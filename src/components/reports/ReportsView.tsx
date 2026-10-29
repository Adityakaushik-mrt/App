import React, { useState } from 'react';
import { Expense, CategoryItem } from '../../types/expense';
import {
  calculateDailySummary,
  calculateWeeklySummary,
  calculateMonthlySummary,
} from '../../utils/calculations';
import { formatRupees } from '../../utils/currency';
import {
  isoToDDMMYYYY,
  getTodayISODate,
  format24To12Hour,
  formatDateToISO,
} from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
} from 'lucide-react';

interface ReportsViewProps {
  expenses: Expense[];
  categories: CategoryItem[];
  onSelectExpense: (expense: Expense) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  expenses,
  categories,
  onSelectExpense,
}) => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Daily report date
  const [dailyDateISO, setDailyDateISO] = useState<string>(getTodayISODate());

  // Weekly report reference date
  const [weekRefDate, setWeekRefDate] = useState<Date>(new Date());

  // Monthly report year and month
  const [monthYear, setMonthYear] = useState<number>(new Date().getFullYear());
  const [monthZeroIdx, setMonthZeroIdx] = useState<number>(new Date().getMonth());

  // Calculations
  const dailySummary = calculateDailySummary(expenses, dailyDateISO, categories);
  const weeklySummary = calculateWeeklySummary(expenses, weekRefDate, categories);
  const monthlySummary = calculateMonthlySummary(expenses, monthYear, monthZeroIdx, categories);

  // Week navigation
  const handlePrevWeek = () => {
    const d = new Date(weekRefDate);
    d.setDate(d.getDate() - 7);
    setWeekRefDate(d);
  };
  const handleNextWeek = () => {
    const d = new Date(weekRefDate);
    d.setDate(d.getDate() + 7);
    setWeekRefDate(d);
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (monthZeroIdx === 0) {
      setMonthZeroIdx(11);
      setMonthYear(monthYear - 1);
    } else {
      setMonthZeroIdx(monthZeroIdx - 1);
    }
  };
  const handleNextMonth = () => {
    if (monthZeroIdx === 11) {
      setMonthZeroIdx(0);
      setMonthYear(monthYear + 1);
    } else {
      setMonthZeroIdx(monthZeroIdx + 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Segmented Selector + Print Button */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Report Type Tabs */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={() => setReportType('daily')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              reportType === 'daily'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              reportType === 'weekly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Weekly Report
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              reportType === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Monthly Report
          </button>
        </div>

        {/* Print / PDF Trigger */}
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition w-full sm:w-auto shrink-0"
        >
          <Printer size={15} /> Print / Export PDF
        </button>
      </div>

      {/* REPORT CONTENT: DAILY REPORT */}
      {reportType === 'daily' && (
        <div className="space-y-6">
          {/* Day Navigator */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => {
                const d = new Date(dailyDateISO);
                d.setDate(d.getDate() - 1);
                setDailyDateISO(formatDateToISO(d));
              }}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <span className="text-xs text-slate-400 block">Report Date</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {dailySummary.displayDate} ({dailySummary.formattedDate})
              </span>
            </div>
            <button
              onClick={() => {
                const d = new Date(dailyDateISO);
                d.setDate(d.getDate() + 1);
                setDailyDateISO(formatDateToISO(d));
              }}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Daily Total & Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500">Total Spent</span>
              <div className="text-xl font-bold text-[#006874] dark:text-[#97f0ff] mt-1 tabular-nums">
                {formatRupees(dailySummary.totalAmountPaise, true)}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500">Transactions</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {dailySummary.transactionCount}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500">Highest Expense</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatRupees(dailySummary.highestExpensePaise)}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500">Average Expense</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatRupees(dailySummary.averageExpensePaise, true)}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Daily Itemized Transactions
            </h4>
            {dailySummary.expenses.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No transactions recorded for this day.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {dailySummary.expenses.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => onSelectExpense(e)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                        {e.title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {e.category} · {format24To12Hour(e.time)} · {e.paymentMethod}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatRupees(e.amountInPaise)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORT CONTENT: WEEKLY REPORT */}
      {reportType === 'weekly' && (
        <div className="space-y-6">
          {/* Week Navigator */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <span className="text-xs text-slate-400 block">Weekly Period</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {weeklySummary.weekLabel}
              </span>
            </div>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekly Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500">Total Expenses for Week</span>
              <div className="text-2xl font-bold text-[#006874] dark:text-[#97f0ff] mt-1 tabular-nums">
                {formatRupees(weeklySummary.totalAmountPaise, true)}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500">Average Daily Spending</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatRupees(weeklySummary.averageDailySpendingPaise, true)}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500">Highest-Spending Day</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {weeklySummary.highestSpendingDay ? (
                  <span>
                    {weeklySummary.highestSpendingDay.dayName} ({formatRupees(weeklySummary.highestSpendingDay.totalPaise)})
                  </span>
                ) : (
                  <span className="text-slate-400 text-sm">None</span>
                )}
              </div>
            </div>
          </div>

          {/* Daily Totals (Mon-Sun) Breakdown Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Daily Expense Totals (Monday to Sunday)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
              {weeklySummary.dailyTotals.map((d) => (
                <div
                  key={d.date}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center"
                >
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                    {d.dayName}
                  </span>
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {d.formattedDate.slice(0, 5)}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums block">
                    {formatRupees(d.totalPaise)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Category Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Weekly Category-Wise Spending
            </h4>
            {weeklySummary.categoryBreakdown.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No category spending this week.</div>
            ) : (
              <div className="space-y-3">
                {weeklySummary.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {cat.category}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatRupees(cat.totalPaise)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORT CONTENT: MONTHLY REPORT */}
      {reportType === 'monthly' && (
        <div className="space-y-6">
          {/* Month Navigator */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <span className="text-xs text-slate-400 block">Monthly Period</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {monthlySummary.monthLabel}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Monthly KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500">Total Spent</span>
              <div className="text-xl font-bold text-[#006874] dark:text-[#97f0ff] mt-1 tabular-nums">
                {formatRupees(monthlySummary.totalAmountPaise, true)}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500">Transactions</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {monthlySummary.transactionCount}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500">Avg Daily Spending</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatRupees(monthlySummary.averageDailySpendingPaise, true)}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500">Highest Day</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 tabular-nums truncate">
                {monthlySummary.highestSpendingDay ? (
                  <span>
                    {monthlySummary.highestSpendingDay.dayFormatted.slice(0, 5)}: {formatRupees(monthlySummary.highestSpendingDay.totalPaise)}
                  </span>
                ) : (
                  'N/A'
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500">Lowest Active Day</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 tabular-nums truncate">
                {monthlySummary.lowestSpendingDay ? (
                  <span>
                    {monthlySummary.lowestSpendingDay.dayFormatted.slice(0, 5)}: {formatRupees(monthlySummary.lowestSpendingDay.totalPaise)}
                  </span>
                ) : (
                  'N/A'
                )}
              </div>
            </div>
          </div>

          {/* Monthly Category Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Monthly Category Spending
            </h4>
            {monthlySummary.categoryBreakdown.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No expenses recorded for this month.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                      <th className="pb-2">Category</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {monthlySummary.categoryBreakdown.map((c) => (
                      <tr key={c.category}>
                        <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                          {c.category}
                        </td>
                        <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                          {formatRupees(c.totalPaise)}
                        </td>
                        <td className="py-2.5 text-right text-slate-500 tabular-nums">
                          {c.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
