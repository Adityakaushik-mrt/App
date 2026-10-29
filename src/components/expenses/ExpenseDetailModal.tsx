import React, { useState } from 'react';
import { Expense } from '../../types/expense';
import { formatRupees } from '../../utils/currency';
import { isoToDDMMYYYY, format24To12Hour, formatReadableDate } from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';
import { storage } from '../../services/storage';
import { X, Edit3, Trash2, Calendar, Clock, CreditCard, FileText, AlertTriangle } from 'lucide-react';

interface ExpenseDetailModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDeleteSuccess?: () => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  isOpen,
  onClose,
  onEdit,
  onDeleteSuccess,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen || !expense) return null;

  const handleDelete = () => {
    storage.deleteExpense(expense.id);
    setShowConfirmDelete(false);
    if (onDeleteSuccess) onDeleteSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Top Header */}
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Transaction Details
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-left">
          
          {/* Main Hero Amount & Title */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#006874]/10 dark:bg-[#006874]/30 flex items-center justify-center shrink-0">
              <CategoryIcon iconName={expense.category} size={28} color="#006874" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {expense.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {expense.category}
              </p>
              <div className="text-2xl font-extrabold text-[#006874] dark:text-[#97f0ff] mt-1 tabular-nums">
                {formatRupees(expense.amountInPaise, true)}
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-3 border border-slate-100 dark:border-slate-800">
            {/* Date */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                Date:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                {isoToDDMMYYYY(expense.date)} ({formatReadableDate(expense.date)})
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                Time:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                {format24To12Hour(expense.time)}
              </span>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-2">
                <CreditCard size={14} className="text-slate-400" />
                Payment Method:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {expense.paymentMethod}
              </span>
            </div>

            {/* Notes */}
            {expense.notes && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                <span className="text-slate-500 flex items-center gap-2 mb-1">
                  <FileText size={14} className="text-slate-400" />
                  Notes:
                </span>
                <p className="text-slate-700 dark:text-slate-300 italic pl-5">
                  "{expense.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Delete Confirmation Warning (if toggled) */}
          {showConfirmDelete ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs">
                <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Confirm Deletion</span>
                  Are you sure you want to delete this expense? Totals and daily summaries will update immediately.
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          ) : (
            /* Action Buttons: Edit and Delete */
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(expense);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#006874] text-[#006874] dark:text-[#97f0ff] hover:bg-[#006874]/10 text-xs font-semibold transition"
              >
                <Edit3 size={15} /> Edit Expense
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition"
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
