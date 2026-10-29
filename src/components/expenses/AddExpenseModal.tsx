import React, { useState, useEffect } from 'react';
import { Expense, CategoryItem, PaymentMethodType, DEFAULT_PAYMENT_METHODS } from '../../types/expense';
import { storage } from '../../services/storage';
import { rupeeStringToPaise } from '../../utils/currency';
import {
  getTodayISODate,
  getCurrentTime24,
  format24To12Hour,
  format12To24Hour,
  isoToDDMMYYYY,
  ddmmYYYYToISO,
} from '../../utils/dateUtils';
import { X, Plus, AlertCircle, CheckCircle, Tag } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  expenseToEdit?: Expense | null;
  onSuccess?: (savedExpense: Expense) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  categories,
  expenseToEdit,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [category, setCategory] = useState('Food & Drinks');
  const [dateISO, setDateISO] = useState(getTodayISODate());
  const [time12h, setTime12h] = useState('12:00 PM');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('UPI');
  const [notes, setNotes] = useState('');

  // Custom category addition inline state
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Validation error state
  const [errors, setErrors] = useState<{ title?: string; amount?: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize or reset form values
  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmountInput((expenseToEdit.amountInPaise / 100).toString());
      setCategory(expenseToEdit.category);
      setDateISO(expenseToEdit.date);
      setTime12h(format24To12Hour(expenseToEdit.time));
      setPaymentMethod(expenseToEdit.paymentMethod);
      setNotes(expenseToEdit.notes || '');
    } else {
      setTitle('');
      setAmountInput('');
      setCategory(categories[0]?.name || 'Food & Drinks');
      setDateISO(getTodayISODate());
      setTime12h(format24To12Hour(getCurrentTime24()));
      setPaymentMethod('UPI');
      setNotes('');
    }
    setErrors({});
    setIsAddingCustomCategory(false);
    setNewCategoryName('');
  }, [expenseToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleCreateCustomCategory = () => {
    if (!newCategoryName.trim()) return;
    const created = storage.addCategory(newCategoryName.trim(), 'Tag', '#006874');
    setCategory(created.name);
    setNewCategoryName('');
    setIsAddingCustomCategory(false);
  };

  const validate = (): boolean => {
    const newErrors: { title?: string; amount?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Expense title is required';
    }

    const paise = rupeeStringToPaise(amountInput);
    if (!amountInput.trim() || isNaN(paise) || paise <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than ₹0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const amountInPaise = rupeeStringToPaise(amountInput);
    const time24 = format12To24Hour(time12h);

    if (expenseToEdit) {
      // Update existing
      storage.updateExpense(expenseToEdit.id, {
        title: title.trim(),
        amountInPaise,
        category,
        date: dateISO,
        time: time24,
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      const updated = storage.getExpenseById(expenseToEdit.id);
      setToastMessage('Expense updated successfully');
      setTimeout(() => {
        if (updated && onSuccess) onSuccess(updated);
        onClose();
      }, 400);
    } else {
      // Add new
      const created = storage.addExpense({
        title: title.trim(),
        amountInPaise,
        category,
        date: dateISO,
        time: time24,
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      setToastMessage('Expense added successfully');
      setTimeout(() => {
        if (onSuccess) onSuccess(created);
        onClose();
      }, 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-250">
        
        {/* Header with drag indicator for mobile */}
        <div className="pt-3 pb-2 px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <p className="text-xs text-slate-500">
                {expenseToEdit ? 'Update expense details' : 'Record everyday spending in Indian Rupees (₹)'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-left">
          
          {/* Toast feedback */}
          {toastMessage && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-medium">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Amount Field (Hero Input) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-[#006874] dark:text-[#97f0ff] select-none">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  if (errors.amount) setErrors({ ...errors, amount: undefined });
                }}
                className={`w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border ${
                  errors.amount
                    ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900/40'
                    : 'border-slate-200 dark:border-slate-700 focus:border-[#006874] focus:ring-2 focus:ring-[#006874]/20'
                } rounded-xl text-lg font-bold text-slate-900 dark:text-white tabular-nums outline-hidden transition`}
                autoFocus={!expenseToEdit}
              />
            </div>
            {errors.amount && (
              <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                <AlertCircle size={12} /> {errors.amount}
              </p>
            )}
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Expense Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Breakfast, Petrol, Mobile Recharge..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border ${
                errors.title
                  ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900/40'
                  : 'border-slate-200 dark:border-slate-700 focus:border-[#006874] focus:ring-2 focus:ring-[#006874]/20'
              } rounded-xl text-sm text-slate-900 dark:text-white outline-hidden transition`}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                <AlertCircle size={12} /> {errors.title}
              </p>
            )}
          </div>

          {/* Category Selection + Custom Category Creator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category <span className="text-rose-500">*</span>
              </label>
              {!isAddingCustomCategory && (
                <button
                  type="button"
                  onClick={() => setIsAddingCustomCategory(true)}
                  className="text-xs text-[#006874] dark:text-[#97f0ff] hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus size={12} /> Custom Category
                </button>
              )}
            </div>

            {isAddingCustomCategory ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="New category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCustomCategory}
                    className="px-3 py-1.5 text-xs bg-[#006874] text-white font-medium rounded-lg hover:bg-[#00525c] transition"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomCategory(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden focus:border-[#006874] focus:ring-2 focus:ring-[#006874]/20"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.isCustom ? '(Custom)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date Field (Formats as DD-MM-YYYY in display) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date (DD-MM-YYYY) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden focus:border-[#006874] focus:ring-2 focus:ring-[#006874]/20"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Selected: {isoToDDMMYYYY(dateISO)}
              </span>
            </div>

            {/* Time Field (12-hour AM/PM) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Time (12-Hour AM/PM) <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={format12To24Hour(time12h)}
                onChange={(e) => setTime12h(format24To12Hour(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden focus:border-[#006874] focus:ring-2 focus:ring-[#006874]/20"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Time: {time12h}
              </span>
            </div>
          </div>

          {/* Payment Method Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DEFAULT_PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2.5 text-xs font-medium rounded-xl border text-center transition-colors truncate ${
                      isSelected
                        ? 'bg-[#006874] text-white border-[#006874] shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add extra context, item details or merchant name..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden focus:border-[#006874] focus:ring-2 focus:ring-[#006874]/20 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold bg-[#006874] hover:bg-[#00525c] text-white rounded-xl shadow-md shadow-[#006874]/20 active:scale-[0.98] transition"
            >
              {expenseToEdit ? 'Save Changes' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
