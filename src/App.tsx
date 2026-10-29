import React, { useState, useEffect } from 'react';
import { Expense, CategoryItem, BudgetSettings } from './types/expense';
import { storage, EXPENSE_DB_CHANGE_EVENT } from './services/storage';
import { TopAppBar } from './components/layout/TopAppBar';
import { BottomNavBar, NavigationTab } from './components/layout/BottomNavBar';
import { AndroidDeviceShell } from './components/layout/AndroidDeviceShell';
import { HomeDashboard } from './components/home/HomeDashboard';
import { TransactionsView } from './components/transactions/TransactionsView';
import { DailySummaryView } from './components/daily/DailySummaryView';
import { ExpenseCharts } from './components/analytics/ExpenseCharts';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { ExpenseDetailModal } from './components/expenses/ExpenseDetailModal';
import { AndroidProjectModal } from './components/android/AndroidProjectModal';
import { Plus, ArrowLeft } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isDailySummaryMode, setIsDailySummaryMode] = useState<boolean>(false);

  // App data state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [budget, setBudget] = useState<BudgetSettings>({
    monthlyLimitPaise: 2000000,
    warningThresholdPercent: 80,
    notificationsEnabled: true,
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [selectedExpenseForDetail, setSelectedExpenseForDetail] = useState<Expense | null>(null);
  const [isAndroidProjectOpen, setIsAndroidProjectOpen] = useState<boolean>(false);

  // Appearance & Device frame states
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(false);

  // Clock for Android status bar
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('12:00');

  // Load data and set up reactive subscription
  const reloadData = () => {
    setExpenses(storage.getExpenses());
    setCategories(storage.getCategories());
    setBudget(storage.getBudget());
  };

  useEffect(() => {
    reloadData();

    // Listen for database changes from anywhere in the app
    const handleDbChange = () => reloadData();
    window.addEventListener(EXPENSE_DB_CHANGE_EVENT, handleDbChange);

    // Initial theme check
    const savedTheme = localStorage.getItem('my_daily_expenses_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Time ticker for status bar
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours() % 12 || 12);
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);

    return () => {
      window.removeEventListener(EXPENSE_DB_CHANGE_EVENT, handleDbChange);
      clearInterval(interval);
    };
  }, []);

  const handleToggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('my_daily_expenses_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('my_daily_expenses_theme', 'light');
    }
  };

  const handleOpenAddModal = () => {
    setExpenseToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsAddModalOpen(true);
  };

  const handleSelectExpense = (expense: Expense) => {
    setSelectedExpenseForDetail(expense);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0f1416] text-[#1a1c1e] dark:text-[#e1e3e5] flex flex-col font-sans transition-colors">
      
      {/* Top App Bar */}
      <TopAppBar
        title="My Daily Expenses"
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isDeviceFrame={isDeviceFrame}
        onToggleDeviceFrame={() => setIsDeviceFrame(!isDeviceFrame)}
        onOpenAndroidProject={() => setIsAndroidProjectOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1">
        <AndroidDeviceShell isDeviceFrame={isDeviceFrame} currentTime={currentTimeStr}>
          
          {/* Back button when inside Dedicated Daily Summary */}
          {isDailySummaryMode ? (
            <div className="space-y-4">
              <button
                onClick={() => setIsDailySummaryMode(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <DailySummaryView
                expenses={expenses}
                categories={categories}
                onSelectExpense={handleSelectExpense}
                onOpenAddModal={() => handleOpenAddModal()}
              />
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeDashboard
                  expenses={expenses}
                  categories={categories}
                  budget={budget}
                  onSelectExpense={handleSelectExpense}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenDailySummary={() => setIsDailySummaryMode(true)}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsView
                  expenses={expenses}
                  categories={categories}
                  onSelectExpense={handleSelectExpense}
                  onOpenAddModal={handleOpenAddModal}
                />
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Expense Analytics & Charts
                      </h2>
                      <p className="text-xs text-slate-500">
                        Interactive category pie, daily bars, trend curves & comparisons
                      </p>
                    </div>
                  </div>
                  <ExpenseCharts expenses={expenses} categories={categories} />
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Expense Reports
                    </h2>
                    <p className="text-xs text-slate-500">
                      Generate daily, weekly, and monthly summaries with print & PDF export
                    </p>
                  </div>
                  <ReportsView
                    expenses={expenses}
                    categories={categories}
                    onSelectExpense={handleSelectExpense}
                  />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Settings & Budget
                    </h2>
                    <p className="text-xs text-slate-500">
                      Monthly spending limit, custom categories, CSV export & JSON backup
                    </p>
                  </div>
                  <SettingsView
                    expenses={expenses}
                    categories={categories}
                    budget={budget}
                    darkMode={darkMode}
                    onToggleDarkMode={handleToggleDarkMode}
                  />
                </div>
              )}
            </>
          )}
        </AndroidDeviceShell>
      </main>

      {/* Prominent Floating Action Button (+) as requested */}
      {(activeTab === 'home' || activeTab === 'transactions' || isDailySummaryMode) && (
        <button
          onClick={handleOpenAddModal}
          className="fixed bottom-20 right-5 z-40 w-14 h-14 bg-[#006874] hover:bg-[#00525c] active:scale-95 text-white rounded-2xl shadow-xl shadow-[#006874]/30 flex items-center justify-center transition-all group"
          title="Add New Expense"
          aria-label="Add New Expense"
        >
          <Plus size={26} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>
      )}

      {/* Fixed Bottom Navigation Bar (5 tabs) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setIsDailySummaryMode(false);
          setActiveTab(tab);
        }}
      />

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setExpenseToEdit(null);
        }}
        categories={categories}
        expenseToEdit={expenseToEdit}
      />

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        isOpen={!!selectedExpenseForDetail}
        expense={selectedExpenseForDetail}
        onClose={() => setSelectedExpenseForDetail(null)}
        onEdit={(exp) => {
          setSelectedExpenseForDetail(null);
          handleEditExpense(exp);
        }}
        onDeleteSuccess={() => {
          setSelectedExpenseForDetail(null);
        }}
      />

      {/* Android Native Studio Project & APK Guide Modal */}
      <AndroidProjectModal
        isOpen={isAndroidProjectOpen}
        onClose={() => setIsAndroidProjectOpen(false)}
      />
    </div>
  );
}
