import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import {
  X,
  DollarSign,
  Calendar,
  Plus,
  TrendingUp,
  PiggyBank,
  Edit,
  Trash2,
} from "lucide-react";

import { useCurrency } from "../context/CurrencyContext";

// Utility function to safely format dates for display
const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date)
    ? date.toLocaleDateString()
    : null;
};

// Utility function to format date for HTML input[type="date"]
const formatInputDate = (isoString) => {
  if (!isoString) return "";
  return isoString.split("T")[0] || "";
};

// Utility function for consistent currency formatting
const formatCurrency = (amount, symbol) => {
  const num = Number(amount);
  if (isNaN(num)) return `${symbol}0.00`;
  return `${symbol}${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function SavingsCardModal({
  goal,
  onClose,
  onEditGoal,
  onAddSavings,
  onDeleteTransaction,
  onDeleteGoal,
}) {
  const { symbol } = useCurrency();
  const [localGoal, setLocalGoal] = useState(goal);
  const [isEditing, setIsEditing] = useState(false);
  const [savingsAmount, setSavingsAmount] = useState("");

  // Start with empty fields for edit mode
  const [editFields, setEditFields] = useState({
    title: "",
    target_amount: "",
    description: "",
    deadline: "",
  });

  // =========================================================================
  // VALIDATION LOGIC
  // =========================================================================

  const isEditFormValid = () => {
    return !!(
      editFields.title.trim() &&
      editFields.target_amount &&
      Number(editFields.target_amount) > 0 &&
      !isNaN(Number(editFields.target_amount))
    );
  };

  const isSavingsAmountValid = () => {
    return !!(
      savingsAmount &&
      Number(savingsAmount) > 0 &&
      !isNaN(Number(savingsAmount))
    );
  };

  // =========================================================================
  // EFFECTS & HOOKS
  // =========================================================================

  const handleEditFieldChange = useCallback(
    (field) => (e) => {
      setEditFields((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  // Only sync localGoal when goal prop changes
  useEffect(() => {
    if (!goal) return;
    setLocalGoal(goal);
  }, [goal]);

  // Handle body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!goal) return null;

  // =========================================================================
  // CALCULATIONS
  // =========================================================================

  const targetAmount = Number(localGoal.target_amount) || 0;
  const contributions = Array.isArray(localGoal.contributions)
    ? localGoal.contributions
    : [];
  const savedAmount = contributions.reduce(
    (total, c) => total + Number(c.amount || 0),
    0
  );
  const remainingAmount = targetAmount - savedAmount;
  const progressPercentage =
    targetAmount > 0 ? Math.min((savedAmount / targetAmount) * 100, 100) : 0;
  const isGoalReached = progressPercentage >= 100;

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleToggleEditing = () => {
    if (isEditing) {
      // Clear fields when canceling edit
      setEditFields({
        title: "",
        target_amount: "",
        description: "",
        deadline: "",
      });
    } else {
      // Clear fields when entering edit mode (start fresh)
      setEditFields({
        title: "",
        target_amount: "",
        description: "",
        deadline: "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    if (!isEditFormValid()) return;

    const newTargetAmount = Number(editFields.target_amount);

    const updatedGoal = {
      ...localGoal,
      title: editFields.title.trim(),
      target_amount: newTargetAmount >= 0 ? newTargetAmount : 0,
      description: editFields.description.trim(),
      deadline: editFields.deadline || null,
    };

    const success = await onEditGoal(updatedGoal);

    if (success !== false) {
      setLocalGoal(updatedGoal);
      setIsEditing(false);
      setEditFields({
        title: "",
        target_amount: "",
        description: "",
        deadline: "",
      });

      Swal.fire({
        icon: "success",
        title: "Goal Updated! 🎉",
        text: "Your savings goal has been successfully updated.",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleAddSavingsSubmit = async () => {
    if (!isSavingsAmountValid()) return;

    const amountToAdd = Number(savingsAmount);

    // Add a small buffer for floating point comparison
    if (amountToAdd > remainingAmount + 0.001) {
      Swal.fire({
        icon: "info",
        title: "Amount Exceeds Goal",
        text: `You only need ${formatCurrency(
          remainingAmount,
          symbol
        )} more to reach your goal.`,
      });
      return;
    }

    if (onAddSavings) {
      const newContribution = {
        id: `temp-${Date.now()}`,
        goal_id: goal.goal_id || goal.id,
        amount: amountToAdd,
        date: new Date().toISOString(),
      };

      const success = await onAddSavings(newContribution);

      if (success !== false) {
        setLocalGoal((prev) => ({
          ...prev,
          contributions: [...(prev.contributions || []), newContribution],
        }));

        setSavingsAmount("");
        Swal.fire({
          icon: "success",
          title: "Savings Added! 💰",
          text: `${formatCurrency(
            amountToAdd,
            symbol
          )} added to your savings goal.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  };

  const handleDeleteContribution = async (contribution) => {
    const success = await onDeleteTransaction(contribution);

    if (success !== false) {
      setLocalGoal((prev) => {
        if (!prev) return prev;

        const updatedContributions = prev.contributions?.filter(
          (c) => (c.id || c.tempId) !== (contribution.id || contribution.tempId)
        );

        return {
          ...prev,
          contributions: updatedContributions,
        };
      });

      await Swal.fire({
        icon: "success",
        title: "Transaction Deleted!",
        text: "The saving contribution has been removed.",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================
  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div
        className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>

        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-100/50 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <PiggyBank className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {localGoal.title}
                  </h2>
                  {localGoal.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {localGoal.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleEditing}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium cursor-pointer select-none"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">
                    {isEditing ? "Cancel" : "Edit"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (localGoal?.goal_id) {
                      onDeleteGoal(localGoal);
                    }
                  }}
                  disabled={!localGoal?.goal_id}
                  className={`p-2 rounded-lg transition-colors ${
                    !localGoal?.goal_id
                      ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none opacity-50"
                      : "text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  }`}
                >
                  <Trash2 size={16} />
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row overflow-y-auto max-h-[70vh]">
            {/* Left Panel: Goal Details & Progress */}
            <div className="flex-1 p-4 sm:p-6 lg:border-r border-gray-100/50">
              {/* Progress Overview */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <TrendingUp size={18} />
                      <span>Savings Overview</span>
                    </h3>

                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              isGoalReached
                                ? "bg-green-500"
                                : progressPercentage >= 75
                                ? "bg-blue-500"
                                : progressPercentage >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(progressPercentage, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Savings Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-green-600 font-medium mb-1">
                            Target
                          </p>
                          <p className="text-lg font-bold text-green-700">
                            {formatCurrency(targetAmount, symbol)}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-blue-600 font-medium mb-1">
                            Saved
                          </p>
                          <p className="text-lg font-bold text-blue-700">
                            {formatCurrency(savedAmount, symbol)}
                          </p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-orange-600 font-medium mb-1">
                            Remaining
                          </p>
                          <p className="text-lg font-bold text-orange-700">
                            {formatCurrency(remainingAmount, symbol)}
                          </p>
                        </div>
                      </div>

                      {/* Deadline Info */}
                      {localGoal.deadline && (
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar size={16} className="text-purple-600" />
                            <span className="text-sm font-medium text-purple-800">
                              Target Date
                            </span>
                          </div>
                          <p className="text-purple-700 font-bold">
                            {formatDate(localGoal.deadline)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Savings Section / Edit Goal Section */}
              {isEditing ? (
                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-200/30 to-orange-300/20 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-100/50 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Edit Goal Details
                    </h3>

                    <div className="space-y-4">
                      {/* Goal Name */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Goal Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Goal Name"
                          value={editFields.title}
                          onChange={handleEditFieldChange("title")}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>

                      {/* Target Amount */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Target Amount ({symbol}){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={editFields.target_amount}
                          onChange={handleEditFieldChange("target_amount")}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter Target Amount"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description (Optional)
                        </label>
                        <textarea
                          rows="2"
                          value={editFields.description}
                          onChange={handleEditFieldChange("description")}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                          placeholder="Enter description"
                        />
                      </div>

                      {/* Deadline */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Deadline (Optional)
                        </label>
                        <input
                          type="date"
                          value={editFields.deadline}
                          onChange={handleEditFieldChange("deadline")}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
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
                      <span>Add Savings</span>
                    </h3>

                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                          <DollarSign
                            size={18}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="number"
                            placeholder={`Amount (${symbol})`}
                            value={savingsAmount}
                            onChange={(e) => setSavingsAmount(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            min="0.01"
                            step="0.01"
                          />
                        </div>
                        <button
                          onClick={handleAddSavingsSubmit}
                          disabled={!isSavingsAmountValid()}
                          className={`px-4 sm:px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium transition-all duration-300 ${
                            !isSavingsAmountValid()
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                          }`}
                        >
                          <Plus size={16} />
                          <span>Add Savings</span>
                        </button>
                      </div>

                      {remainingAmount > 0 && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-sm text-green-700">
                            <span className="font-medium">
                              Remaining to goal:
                            </span>{" "}
                            {formatCurrency(remainingAmount, symbol)}
                          </p>
                        </div>
                      )}

                      {isGoalReached && (
                        <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800 font-medium text-center">
                            Congratulations! You've reached your savings goal!
                          </p>
                        </div>
                      )}
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
                    <span>Savings History</span>
                  </h3>

                  <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    {contributions.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PiggyBank className="text-gray-400" size={24} />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No savings yet
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Start adding savings to track your progress
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {contributions
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((contribution, index) => (
                            <div
                              key={contribution.id ?? index}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <TrendingUp
                                    size={14}
                                    className="text-green-600"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {formatCurrency(
                                      contribution.amount,
                                      symbol
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(contribution.date) ||
                                      "Unknown Date"}
                                  </p>
                                </div>
                              </div>

                              {onDeleteTransaction && (
                                <button
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  onClick={() =>
                                    handleDeleteContribution(contribution)
                                  }
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
    </div>
  );

  return createPortal(modalContent, document.body);
}
