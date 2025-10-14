import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Edit,
  X,
  Plus,
  Calendar,
  DollarSign,
  TrendingDown,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";

import { useCurrency } from "../context/CurrencyContext";

export default function BudgetModal({
  budget,
  transactions = [],
  onClose,
  onEditBudget,
  onAddExpense,
  onDeleteTransaction,
  onDeleteBudget,
  isLoading = false,
}) {
  const [localBudget, setLocalBudget] = useState(
    budget || { allocated: 0, spent: 0, description: "" }
  );
  const [allocatedInput, setAllocatedInput] = useState(
    localBudget.amount?.toString() || ""
  );

  const [isEditing, setIsEditing] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [descriptionInput, setDescriptionInput] = useState(
    localBudget.description || ""
  );
  const { symbol } = useCurrency();

  const remaining = isEditing
    ? Number(allocatedInput || localBudget.amount || 0) -
      Number(localBudget.spent || 0)
    : Number(localBudget.amount || 0) - Number(localBudget.spent || 0);

  useEffect(() => {
    if (budget) {
      setLocalBudget({
        allocated: Number(budget.allocated ?? 0),
        spent: Number(budget.spent ?? 0),
        description: budget.description || "",
        ...budget,
      });
      setAllocatedInput(budget.allocated?.toString() || "");
      setDescriptionInput(budget.description || "");
    }
  }, [budget]);

  if (!budget) return null;

  // ========== VALIDATION LOGIC ==========
  const isEditFormValid = () => {
    return !!(
      allocatedInput &&
      Number(allocatedInput) > 0 &&
      localBudget.start_date &&
      localBudget.end_date
    );
  };

  const isExpenseFormValid = () => {
    return !!(expenseAmount && Number(expenseAmount) > 0);
  };

  const handleSaveChanges = async () => {
    if (!isEditFormValid()) return;

    await onEditBudget({
      ...localBudget,
      allocated: Number(allocatedInput) || 0,
      description: descriptionInput || "",
    });
    setIsEditing(false);
  };

  const handleAddExpense = async () => {
    if (!isExpenseFormValid()) return;

    const remainingAmount =
      Number(localBudget.amount || 0) - Number(localBudget.spent || 0);
    if (Number(expenseAmount) > remainingAmount) {
      Swal.fire({
        icon: "error",
        title: "Exceeded Budget",
        text: `You only have ${symbol}${remainingAmount.toLocaleString()} remaining in this budget.`,
        confirmButtonColor: "#EF4444",
      });
      return;
    }

    const success = await onAddExpense({
      budget_id: budget.budget_id,
      amount: Number(expenseAmount),
      description: "Budget Expense",
    });

    if (success !== false) {
      setLocalBudget((prev) => ({
        ...prev,
        spent: Number(prev.spent) + Number(expenseAmount),
      }));
      setExpenseAmount("");
    }
  };

  const percentage = localBudget.amount
    ? Math.min(
        (Number(localBudget.spent) / Number(localBudget.amount)) * 100,
        100
      )
    : 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center p-4"
      onClick={onClose}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Modal Container */}
      <div
        className="relative z-50 w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glassmorphism Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-2xl blur opacity-40"></div>

        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100/50 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {localBudget.category}
                  </h2>
                  {!isEditing && (
                    <p className="text-sm text-gray-600 mt-1">
                      {localBudget.description || "No description"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">
                    {isEditing ? "Cancel" : "Edit"}
                  </span>
                </button>
                <button
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => onDeleteBudget(budget)}
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col xl:flex-row overflow-y-auto max-h-[70vh]">
            {/* Left Panel: Budget Details */}
            <div className="flex-1 p-4 sm:p-6 xl:border-r border-gray-100/50">
              {/* Budget Progress */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <TrendingDown size={18} />
                      <span>Budget Overview</span>
                    </h3>

                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              percentage >= 90
                                ? "bg-red-500"
                                : percentage >= 70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Budget Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-blue-600 font-medium mb-1">
                            Allocated
                          </p>
                          <p className="text-lg font-bold text-blue-700">
                            {symbol}
                            {Number(localBudget.amount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-red-600 font-medium mb-1">
                            Spent
                          </p>
                          <p className="text-lg font-bold text-red-700">
                            {symbol}
                            {Number(localBudget.spent || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-green-600 font-medium mb-1">
                            Remaining
                          </p>
                          <p className="text-lg font-bold text-green-700">
                            {symbol}
                            {remaining.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Mode or Add Expense */}
              {isEditing ? (
                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-200/30 to-orange-300/20 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-100/50 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Edit Budget
                    </h3>

                    <div className="space-y-4">
                      {/* Allocated Amount */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Allocated Amount{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={allocatedInput}
                          onChange={(e) => setAllocatedInput(e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter allocated amount"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <input
                          type="text"
                          value={descriptionInput}
                          onChange={(e) => setDescriptionInput(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter description"
                        />
                      </div>

                      {/* Date Range */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={localBudget.start_date || ""}
                            onChange={(e) =>
                              setLocalBudget({
                                ...localBudget,
                                start_date: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            End Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={localBudget.end_date || ""}
                            onChange={(e) =>
                              setLocalBudget({
                                ...localBudget,
                                end_date: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={handleSaveChanges}
                        disabled={!isEditFormValid()}
                        className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                          !isEditFormValid()
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg"
                        }`}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Plus size={18} />
                      <span>Add Expense</span>
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="number"
                        placeholder="Enter expense amount"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      />
                      <button
                        onClick={handleAddExpense}
                        disabled={!isExpenseFormValid()}
                        className={`px-4 sm:px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium transition-all duration-300 ${
                          !isExpenseFormValid()
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg"
                        }`}
                      >
                        <Plus size={16} />
                        <span>Add Expense</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Transaction History */}
            <div className="flex-1 p-4 sm:p-6 bg-gray-50/30">
              <div className="relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-xl blur opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100/50 p-4 sm:p-6 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Calendar size={18} />
                    <span>Transaction History</span>
                  </h3>

                  <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 animate-pulse"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                              </div>
                            </div>
                            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="text-gray-400" size={24} />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No transactions yet
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Transactions will appear here when you add expenses
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.map((tx, index) => (
                          <div
                            key={tx.id ?? index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <TrendingDown
                                  size={14}
                                  className="text-red-600"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {symbol}
                                  {tx.amount
                                    ? Number(tx.amount).toLocaleString()
                                    : "-"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {tx.transaction_date
                                    ? new Date(
                                        tx.transaction_date
                                      ).toLocaleDateString()
                                    : "-"}
                                </p>
                              </div>
                            </div>

                            {onDeleteTransaction && (
                              <button
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                onClick={async () => {
                                  await onDeleteTransaction(tx);
                                  setLocalBudget((prev) => ({
                                    ...prev,
                                    spent:
                                      Number(prev.spent) -
                                      Number(tx.amount || 0),
                                  }));
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
