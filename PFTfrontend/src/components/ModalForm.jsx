import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import {
  X,
  Loader2,
  DollarSign,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  FileText,
} from "lucide-react";

import { useCurrency } from "../context/CurrencyContext";

export default function ModalForm({
  isOpen,
  type,
  formData,
  setFormData,
  editingId,
  selectedBudget = null,
  onClose,
  onSubmit,
}) {
  const [loading, setLoading] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const { symbol } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const expenseCategories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Shopping",
    "Other",
  ];
  const incomeCategories = [
    "Salary",
    "Business",
    "Investments",
    "Freelancing",
    "Gifts",
    "Other",
  ];

  // ========== VALIDATION LOGIC ==========
  const isFormValid = () => {
    if (type === "income" || type === "expense") {
      return !!(
        formData.category &&
        formData.amount &&
        Number(formData.amount) > 0 &&
        formData.transaction_date
      );
    } else if (type === "budget") {
      if (selectedBudget && expenseAmount) {
        return Number(expenseAmount) > 0;
      } else {
        return !!(
          formData.category &&
          formData.amount &&
          Number(formData.amount) > 0 &&
          formData.start_date &&
          formData.end_date
        );
      }
    } else if (type === "goal") {
      return !!(
        formData.title &&
        formData.target_amount &&
        Number(formData.target_amount) > 0 &&
        formData.deadline
      );
    }
    return false;
  };

  const getModalConfig = () => {
    switch (type) {
      case "income":
        return {
          title: editingId ? "Edit Income" : "Add Income",
          icon: TrendingUp,
          color: "green",
          gradient: "from-green-500 to-green-600",
          borderColor: "border-green-100/50",
          bgGradient: "from-green-200/30 to-green-300/20",
        };
      case "expense":
        return {
          title: editingId ? "Edit Expense" : "Add Expense",
          icon: TrendingDown,
          color: "red",
          gradient: "from-red-500 to-red-600",
          borderColor: "border-red-100/50",
          bgGradient: "from-red-200/30 to-red-300/20",
        };
      case "budget":
        return {
          title: selectedBudget
            ? `Budget: ${selectedBudget.category}`
            : editingId
            ? "Edit Budget"
            : "Add Budget",
          icon: Target,
          color: "blue",
          gradient: "from-blue-500 to-blue-600",
          borderColor: "border-blue-100/50",
          bgGradient: "from-blue-200/30 to-blue-300/20",
        };
      case "goal":
        return {
          title: editingId ? "Edit Goal" : "Add Goal",
          icon: Target,
          color: "purple",
          gradient: "from-purple-500 to-purple-600",
          borderColor: "border-purple-100/50",
          bgGradient: "from-purple-200/30 to-purple-300/20",
        };
      default:
        return {
          title: "Form",
          icon: FileText,
          color: "gray",
          gradient: "from-gray-500 to-gray-600",
          borderColor: "border-gray-100/50",
          bgGradient: "from-gray-200/30 to-gray-300/20",
        };
    }
  };

  const config = getModalConfig();
  const IconComponent = config.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't proceed if form is invalid
    if (!isFormValid()) return;

    setLoading(true);

    try {
      let payload = {};

      if (type === "income" || type === "expense") {
        payload = {
          type: type.charAt(0).toUpperCase() + type.slice(1),
          category: formData.category,
          amount: Number(formData.amount),
          transaction_date: formData.transaction_date,
          description: formData.description || "",
          editingId: editingId || null,
        };
      } else if (type === "budget") {
        if (selectedBudget && expenseAmount) {
          payload = {
            budget_id: selectedBudget.budget_id,
            amount: Number(expenseAmount),
          };
        } else {
          payload = {
            category: formData.category,
            amount: Number(formData.amount),
            start_date: formData.start_date,
            end_date: formData.end_date,
            description: formData.description || "",
            editingId: editingId || null,
          };
        }
      } else if (type === "goal") {
        payload = {
          title: formData.title,
          target_amount: Number(formData.target_amount),
          deadline: formData.deadline,
          description: formData.description || "",
          editingId: editingId || null,
        };
      }

      await onSubmit(payload);

      if (expenseAmount) setExpenseAmount("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join("\n")
          : err.message || "Something went wrong. Please try again.");

      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: errorMessage,
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`absolute -inset-1 bg-gradient-to-r ${config.bgGradient} rounded-2xl blur opacity-40`}
        ></div>

        <div
          className={`relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border ${config.borderColor} overflow-hidden`}
        >
          <div
            className={`p-4 sm:p-6 border-b border-gray-100/50 bg-gradient-to-r ${config.bgGradient}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${config.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <IconComponent className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {config.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {type === "income" && "Record your income transaction"}
                    {type === "expense" && "Record your expense transaction"}
                    {type === "budget" &&
                      !selectedBudget &&
                      "Set up a new budget"}
                    {type === "budget" &&
                      selectedBudget &&
                      "Add expense to this budget"}
                    {type === "goal" && "Create a new savings goal"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {(type === "income" || type === "expense") && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                      >
                        <option value="" disabled>
                          Select category
                        </option>
                        {(type === "income"
                          ? incomeCategories
                          : expenseCategories
                        ).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {symbol}
                      </span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={formData.amount || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        min="0"
                        step="0.01"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="date"
                        value={formData.transaction_date || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            transaction_date: e.target.value,
                          })
                        }
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <div className="relative">
                      <FileText
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <textarea
                        placeholder="Add a note (optional)"
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {type === "budget" && (
                <>
                  {!selectedBudget && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.category || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                        >
                          <option value="" disabled>
                            Select category
                          </option>
                          {expenseCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Budget Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            {symbol}
                          </span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={formData.amount || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                amount: e.target.value,
                              })
                            }
                            min="0"
                            step="0.01"
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar
                              size={18}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                              type="date"
                              value={formData.start_date || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  start_date: e.target.value,
                                })
                              }
                              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            End Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar
                              size={18}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                              type="date"
                              value={formData.end_date || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  end_date: e.target.value,
                                })
                              }
                              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <div className="relative">
                          <FileText
                            size={18}
                            className="absolute left-3 top-3 text-gray-400"
                          />
                          <textarea
                            placeholder="Enter a short description (optional)"
                            value={formData.description || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            rows={3}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedBudget && (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-30"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4">
                          <div className="text-center">
                            <h3 className="font-semibold text-gray-800 mb-2">
                              {selectedBudget.category} Budget
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Allocated</p>
                                <p className="font-bold text-blue-600">
                                  {symbol}
                                  {Number(
                                    selectedBudget.allocated || 0
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Remaining</p>
                                <p className="font-bold text-green-600">
                                  {symbol}
                                  {Number(
                                    selectedBudget.remaining || 0
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Expense Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            {symbol}
                          </span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            min="0"
                            step="0.01"
                            max={selectedBudget.remaining}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                        {selectedBudget.remaining && (
                          <p className="text-xs text-gray-500">
                            Maximum: {symbol}
                            {Number(selectedBudget.remaining).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {type === "goal" && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Goal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter goal name"
                      value={formData.title || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Target Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {symbol}
                      </span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={formData.target_amount || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            target_amount: e.target.value,
                          })
                        }
                        min="0"
                        step="0.01"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Deadline <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.deadline || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deadline: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <div className="relative">
                      <FileText
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <textarea
                        placeholder="Enter a short description (optional)"
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !isFormValid()}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold mt-4 transition-all duration-200 cursor-pointer ${
                  loading || !isFormValid()
                    ? "bg-gray-300 cursor-not-allowed opacity-60"
                    : `bg-gradient-to-r ${config.gradient} hover:opacity-90`
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : editingId ? (
                  "Update"
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
