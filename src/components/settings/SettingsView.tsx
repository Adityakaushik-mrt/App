import React, { useState } from 'react';
import { Expense, CategoryItem, BudgetSettings } from '../../types/expense';
import { storage } from '../../services/storage';
import { formatRupees, rupeeStringToPaise } from '../../utils/currency';
import {
  DollarSign,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';

interface SettingsViewProps {
  expenses: Expense[];
  categories: CategoryItem[];
  budget: BudgetSettings;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  expenses,
  categories,
  budget,
  darkMode,
  onToggleDarkMode,
}) => {
  // Budget Form
  const [budgetInput, setBudgetInput] = useState<string>(
    (budget.monthlyLimitPaise / 100).toString()
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    budget.notificationsEnabled
  );
  const [budgetSaveToast, setBudgetSaveToast] = useState<string | null>(null);

  // Custom Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#006874');

  // File import and action feedback
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // In-app modal confirmations (replaces browser window.confirm which is blocked in iframes)
  const [confirmModal, setConfirmModal] = useState<'clear' | 'reset' | null>(null);

  // Compute this month's spending vs budget
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthExpenses = expenses.filter((e) => e.date.startsWith(currentYM));
  const totalSpentMonthPaise = thisMonthExpenses.reduce((sum, e) => sum + e.amountInPaise, 0);

  const budgetPaise = budget.monthlyLimitPaise;
  const remainingBudgetPaise = budgetPaise - totalSpentMonthPaise;
  const percentageUsed = budgetPaise > 0 ? Math.min(Math.round((totalSpentMonthPaise / budgetPaise) * 100), 999) : 0;

  const isOverBudget = totalSpentMonthPaise > budgetPaise;
  const isNearBudget = percentageUsed >= budget.warningThresholdPercent && !isOverBudget;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const paise = rupeeStringToPaise(budgetInput);
    if (paise < 0) return;

    storage.saveBudget({
      monthlyLimitPaise: paise,
      warningThresholdPercent: 80,
      notificationsEnabled,
    });

    setBudgetSaveToast('Monthly budget updated successfully');
    setTimeout(() => setBudgetSaveToast(null), 3000);
  };

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('My Daily Expenses', {
          body: 'Budget alerts enabled! You will be alerted when spending reaches 80% or exceeds budget.',
        });
      } else {
        setNotificationsEnabled(false);
      }
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    storage.addCategory(newCatName.trim(), 'Tag', newCatColor);
    setNewCatName('');
  };

  const handleExportCSV = () => {
    const csvContent = storage.exportToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my_daily_expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonContent = storage.exportJSONBackup();
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my_daily_expenses_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storage.importJSONBackup(content);
      if (res.success) {
        setImportStatus(`Successfully restored ${res.count} transactions!`);
      } else {
        setImportStatus(`Restore failed: ${res.error}`);
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* 1. Monthly Budget Management Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#006874]/10 dark:bg-[#006874]/20 flex items-center justify-center text-[#006874] dark:text-[#97f0ff]">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Budget Management
              </h3>
              <p className="text-xs text-slate-500">
                Track limits for {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          {isOverBudget ? (
            <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-full flex items-center gap-1">
              <AlertCircle size={12} /> Budget Exceeded
            </span>
          ) : isNearBudget ? (
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full flex items-center gap-1">
              <AlertCircle size={12} /> 80% Threshold Reached
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} /> On Track
            </span>
          )}
        </div>

        {/* Budget Progress Bar & Status */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Budget Used</span>
            <span
              className={`tabular-nums ${
                isOverBudget
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {percentageUsed}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-600'
                  : isNearBudget
                  ? 'bg-amber-500'
                  : 'bg-[#006874]'
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Budget 4 Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Monthly Budget</span>
            <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
              {formatRupees(budgetPaise)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Total Spent</span>
            <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
              {formatRupees(totalSpentMonthPaise)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Remaining Budget</span>
            <span
              className={`text-base font-bold tabular-nums ${
                remainingBudgetPaise < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {remainingBudgetPaise < 0
                ? `- ${formatRupees(Math.abs(remainingBudgetPaise))}`
                : formatRupees(remainingBudgetPaise)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Status</span>
            <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
              {percentageUsed}% Used
            </span>
          </div>
        </div>

        {/* Budget Form */}
        <form onSubmit={handleSaveBudget} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Set Monthly Spending Limit (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white tabular-nums outline-hidden focus:border-[#006874]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold bg-[#006874] text-white rounded-xl hover:bg-[#00525c] transition"
              >
                Save Budget
              </button>
              
              <button
                type="button"
                onClick={handleRequestNotificationPermission}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition"
              >
                <Bell size={14} /> Alerts
              </button>
            </div>
          </div>

          {budgetSaveToast && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
              <CheckCircle2 size={14} /> {budgetSaveToast}
            </div>
          )}
        </form>
      </div>

      {/* 2. Custom Categories Management */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Expense Categories ({categories.length})
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Default and custom expense categories for tagging transactions
        </p>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add new category (e.g. Pet Care, Charity)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-[#006874]"
          />
          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="w-10 h-9 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent cursor-pointer"
            title="Pick color"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-[#006874] text-white rounded-xl hover:bg-[#00525c] transition shrink-0"
          >
            <Plus size={14} /> Add Category
          </button>
        </form>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              {c.name}
              {c.isCustom && <span className="text-[10px] text-slate-400 ml-0.5">(Custom)</span>}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Data Storage, Backup & Export */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Data Storage, Backup & Export
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            All records are stored locally and securely on your device.
          </p>
        </div>

        {importStatus && (
          <div className="p-3 text-xs rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="text-emerald-600" size={20} />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Export to CSV
                </span>
                <span className="text-[11px] text-slate-500">
                  Spreadsheet format for Excel/Sheets
                </span>
              </div>
            </div>
            <Download size={16} className="text-slate-400 group-hover:text-slate-700" />
          </button>

          {/* JSON Backup Export */}
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <Download className="text-[#006874]" size={20} />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Backup to JSON
                </span>
                <span className="text-[11px] text-slate-500">
                  Full snapshot of expenses and categories
                </span>
              </div>
            </div>
            <Download size={16} className="text-slate-400 group-hover:text-slate-700" />
          </button>

          {/* JSON Restore */}
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition group cursor-pointer text-left">
            <div className="flex items-center gap-3">
              <Upload className="text-indigo-600" size={20} />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Restore from JSON Backup
                </span>
                <span className="text-[11px] text-slate-500">
                  Load valid backup file into app
                </span>
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <Upload size={16} className="text-slate-400 group-hover:text-slate-700" />
          </label>

          {/* Sample Data Reset */}
          <button
            onClick={() => setConfirmModal('reset')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="text-amber-600" size={20} />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Reset Sample Data
                </span>
                <span className="text-[11px] text-slate-500">
                  Reload ₹799 today dataset
                </span>
              </div>
            </div>
            <RotateCcw size={16} className="text-slate-400 group-hover:text-slate-700" />
          </button>
        </div>

        {/* Clear All Warning Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Total records stored: {expenses.length}
          </span>
          <button
            onClick={() => setConfirmModal('clear')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition font-medium"
          >
            <Trash2 size={13} /> Clear All Expenses
          </button>
        </div>

        {/* Action feedback toast */}
        {actionToast && (
          <div
            className={`p-3 text-xs rounded-xl flex items-center gap-2 border animate-in fade-in ${
              actionToast.type === 'danger'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{actionToast.message}</span>
          </div>
        )}
      </div>

      {/* In-App Confirmation Modal (Replaces blocked window.confirm) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmModal === 'clear'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                }`}
              >
                {confirmModal === 'clear' ? <Trash2 size={24} /> : <RotateCcw size={24} />}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {confirmModal === 'clear' ? 'Clear All Expenses?' : 'Reset to Sample Data?'}
                </h4>
                <p className="text-xs text-slate-500">
                  {confirmModal === 'clear'
                    ? 'This will permanently remove all transactions.'
                    : 'This will restore the standard sample expenses.'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {confirmModal === 'clear'
                ? 'Are you sure you want to delete all stored expense records? All summaries, charts, and transaction lists will be reset to ₹0 immediately.'
                : 'This will replace existing records with the default demonstration expenses (including ₹799 today total).'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal === 'clear') {
                    storage.clearAllExpenses();
                    setActionToast({
                      message: 'All expenses cleared successfully. Database is now empty.',
                      type: 'danger',
                    });
                  } else {
                    storage.resetToSampleData();
                    setActionToast({
                      message: 'Sample data restored successfully.',
                      type: 'success',
                    });
                  }
                  setConfirmModal(null);
                  setTimeout(() => setActionToast(null), 4000);
                }}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition ${
                  confirmModal === 'clear'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {confirmModal === 'clear' ? 'Yes, Clear All' : 'Yes, Reset Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
