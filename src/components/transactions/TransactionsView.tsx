import React, { useState } from 'react';
import { Expense, CategoryItem, FilterOptions, FilterPeriod, SortField, SortOrder, DEFAULT_PAYMENT_METHODS } from '../../types/expense';
import { filterExpenses } from '../../utils/calculations';
import { formatRupees } from '../../utils/currency';
import {
  isoToDDMMYYYY,
  format24To12Hour,
  getRelativeDateLabel,
  getTodayISODate,
} from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  X,
  CreditCard,
  Plus,
} from 'lucide-react';

interface TransactionsViewProps {
  expenses: Expense[];
  categories: CategoryItem[];
  onSelectExpense: (expense: Expense) => void;
  onOpenAddModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  expenses,
  categories,
  onSelectExpense,
  onOpenAddModal,
}) => {
  const [filter, setFilter] = useState<FilterOptions>({
    period: 'all',
    category: 'all',
    paymentMethod: 'all',
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const filteredList = filterExpenses(expenses, filter);
  const totalFilteredPaise = filteredList.reduce((sum, e) => sum + e.amountInPaise, 0);

  // Overall today total to fulfill requirement:
  // "Clearly distinguish between the overall daily total and filtered search results."
  const todayISO = getTodayISODate();
  const overallTodayPaise = expenses
    .filter((e) => e.date === todayISO)
    .reduce((sum, e) => sum + e.amountInPaise, 0);

  const periods: { id: FilterPeriod; label: string }[] = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'previousMonth', label: 'Previous Month' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const handlePeriodChange = (p: FilterPeriod) => {
    setFilter({ ...filter, period: p });
  };

  const handleClearFilters = () => {
    setFilter({
      period: 'all',
      category: 'all',
      paymentMethod: 'all',
      searchQuery: '',
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filter.period !== 'all' ||
    filter.category !== 'all' ||
    filter.paymentMethod !== 'all' ||
    filter.searchQuery.trim() !== '';

  return (
    <div className="space-y-4">
      {/* Search Bar & Filter Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses by title or notes..."
            value={filter.searchQuery}
            onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
            className="w-full pl-10 pr-9 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-hidden focus:ring-2 focus:ring-[#006874] shadow-xs"
          />
          {filter.searchQuery && (
            <button
              onClick={() => setFilter({ ...filter, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Drawer / Dropdown Trigger */}
        <button
          onClick={() => setShowFiltersModal(!showFiltersModal)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-2xl border transition shadow-xs shrink-0 ${
            hasActiveFilters
              ? 'bg-[#006874] text-white border-[#006874]'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Filter size={15} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          )}
        </button>

        {/* Sort Trigger */}
        <button
          onClick={() => {
            const nextSort = filter.sortBy === 'date' ? 'amount' : filter.sortBy === 'amount' ? 'title' : 'date';
            setFilter({ ...filter, sortBy: nextSort });
          }}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 shrink-0 shadow-xs"
          title={`Sort by: ${filter.sortBy} (${filter.sortOrder})`}
        >
          <ArrowUpDown size={16} />
        </button>
      </div>

      {/* Horizontal Period Chip Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {periods.map((p) => {
          const isActive = filter.period === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handlePeriodChange(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-[#006874] text-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Picker (shown when 'custom' is active) */}
      {filter.period === 'custom' && (
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="flex items-center gap-2 w-full">
            <span className="text-slate-500 whitespace-nowrap">From:</span>
            <input
              type="date"
              value={filter.customStartDate || ''}
              onChange={(e) => setFilter({ ...filter, customStartDate: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-slate-500 whitespace-nowrap">To:</span>
            <input
              type="date"
              value={filter.customEndDate || ''}
              onChange={(e) => setFilter({ ...filter, customEndDate: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Expanded Filters Drawer (Category, Payment Method, Sort Order) */}
      {showFiltersModal && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white">Detailed Filters</span>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-rose-500 hover:underline font-medium"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category Dropdown */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Category</label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Dropdown */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Payment Method</label>
              <select
                value={filter.paymentMethod}
                onChange={(e) => setFilter({ ...filter, paymentMethod: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">All Methods</option>
                {DEFAULT_PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order Direction */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                Sort: {filter.sortBy.toUpperCase()}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFilter({ ...filter, sortOrder: 'desc' })}
                  className={`flex-1 py-1.5 rounded-xl border text-center ${
                    filter.sortOrder === 'desc'
                      ? 'bg-[#006874] text-white font-bold border-[#006874]'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Desc (High to Low)
                </button>
                <button
                  type="button"
                  onClick={() => setFilter({ ...filter, sortOrder: 'asc' })}
                  className={`flex-1 py-1.5 rounded-xl border text-center ${
                    filter.sortOrder === 'asc'
                      ? 'bg-[#006874] text-white font-bold border-[#006874]'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Asc (Low to High)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dual Totals Banner: Filtered Results vs Overall Today Total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Active Filtered Sum */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Filtered Search Results</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatRupees(totalFilteredPaise, true)}
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {filteredList.length} {filteredList.length === 1 ? 'transaction' : 'transactions'}
          </span>
        </div>

        {/* Overall Today Total */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Overall Today's Total</span>
            <span className="text-xl font-bold text-[#006874] dark:text-[#97f0ff] tabular-nums">
              {formatRupees(overallTodayPaise, true)}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {isoToDDMMYYYY(todayISO)}
          </span>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-14 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Search size={22} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No matching expenses found
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              Try adjusting your search query, period, or filter parameters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-xs font-semibold text-[#006874] dark:text-[#97f0ff] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredList.map((exp) => (
              <div
                key={exp.id}
                onClick={() => onSelectExpense(exp)}
                className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CategoryIcon iconName={exp.category} size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {exp.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                      <span>{exp.category}</span>
                      <span>·</span>
                      <span>{getRelativeDateLabel(exp.date)}</span>
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
