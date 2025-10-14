// src/pages/UserPages/BudgetsPage.jsx
import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  TrendingDown,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart as PieChartIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import ModalForm from "../../components/ModalForm";
import BudgetCardModal from "../../components/BudgetCardModal";
import {
  useAddBudget,
  useAddExpenseToBudget,
  useDeleteBudget,
  useDeleteTransaction,
  useUpdateBudget,
  useTransactions,
  useBudgets,
} from "../../api/queries";

import { useCurrency } from "../../context/CurrencyContext";

export default function BudgetsPage() {
  const { data: transactions = [] } = useTransactions();
    const { data: budgets = [] } = useBudgets();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [activeBudget, setActiveBudget] = useState(null);

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
  const MAX_BUDGETS = 9;
  const { symbol } = useCurrency();

  const safeNumber = (n) => (typeof n === "number" ? n : 0);

  const budgetSpent = (budgetId) => {
    return transactions
      .filter((tx) => tx.budget_id === budgetId)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  };

  // Helper function to get budget status
  const getBudgetStatus = (budget) => {
    const allocated = Number(budget.amount || 0);
    const spent = budgetSpent(budget.budget_id);
    const remaining = allocated - spent;

    // Check if budget is completed (spent >= allocated)
    if (spent >= allocated) return "Completed";

    // Check if behind schedule (end_date passed)
    const now = new Date();
    const endDate = budget.end_date ? new Date(budget.end_date) : null;
    if (endDate && now > endDate && remaining > 0) return "Behind";

    return "On Track";
  };

  const chartData = useMemo(() => {
    return budgets
      .filter((b) => Number(b.amount) > 0)
      .map((b) => ({
        category: b.category,
        allocated: Number(b.amount),
        spent: transactions
          .filter((tx) => tx.budget_id === b.budget_id)
          .reduce((sum, tx) => sum + Number(tx.amount), 0),
      }));
  }, [budgets, transactions]);

  // Summary calculations
  const totalAllocated = budgets.reduce(
    (sum, b) => sum + Number(b.amount || 0),
    0
  );
  const totalSpent = budgets.reduce(
    (sum, b) => sum + budgetSpent(b.budget_id),
    0
  );
  const totalRemaining = totalAllocated - totalSpent;
  const completedBudgetCount = budgets.filter(
    (b) => getBudgetStatus(b) === "Completed"
  ).length;

  // Mutations
  const addBudgetMutation = useAddBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const addExpenseMutation = useAddExpenseToBudget();
  const deleteTransactionMutation = useDeleteTransaction();

  // Handlers
  const handleDeleteTransaction = async (transaction) => {
    const result = await Swal.fire({
      title: `Delete this transaction?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteTransactionMutation.mutateAsync(transaction.transaction_id);
        Swal.fire("Deleted!", "The transaction has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Could not delete transaction.", "error");
      }
    }
  };

  const handleAddExpense = async ({ budget_id, amount, description }) => {
    const localBudget = budgets.find((b) => b.budget_id === budget_id);
    if (!localBudget) return false;

    const spent = budgetSpent(budget_id);
    const remaining = Number(localBudget.amount) - spent;

    if (Number(amount) > remaining) {
      Swal.fire({
        icon: "error",
        title: "Exceeded Budget",
        text: `You only have ${symbol}${remaining.toLocaleString()} remaining in this budget.`,
        confirmButtonColor: "#EF4444",
      });
      return false;
    }

    try {
      await addExpenseMutation.mutateAsync({ budget_id, amount, description });
      Swal.fire({
        icon: "success",
        title: "Expense added!",
        confirmButtonColor: "#10B981",
      });
      return true;
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#EF4444",
      });
      return false;
    }
  };

  const handleEditBudget = async (updatedBudget) => {
    try {
      await updateBudgetMutation.mutateAsync({
        id: updatedBudget.budget_id,
        amount: updatedBudget.allocated,
        start_date: updatedBudget.start_date,
        end_date: updatedBudget.end_date,
        description: updatedBudget.description || "",
      });
      setBudgetModalOpen(false);
      setActiveBudget(null);
      Swal.fire({
        icon: "success",
        title: "Budget updated!",
        confirmButtonColor: "#10B981",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleOpenModal = (budget = null) => {
    if (!budget && budgets.length >= MAX_BUDGETS) {
      Swal.fire({
        icon: "warning",
        title: "Limit Reached",
        text: `You can only create up to ${MAX_BUDGETS} budgets.`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (budget) {
      setSelectedBudget(budget);
      setFormData({
        category: budget.category ?? "",
        amount: safeNumber(budget.allocated),
        start_date: budget.start_date || "",
        end_date: budget.end_date || "",
        description: budget.description || "",
      });
      setEditingId(budget.budget_id);
    } else {
      setSelectedBudget(null);
      setFormData({
        category: "",
        amount: "",
        start_date: "",
        end_date: "",
        description: "",
      });
      setEditingId(null);
    }

    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBudget(null);
    setFormData({});
    setEditingId(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingId) {
        await updateBudgetMutation.mutateAsync({
          id: editingId,
          ...data,
        });
        Swal.fire({
          icon: "success",
          title: "Budget updated!",
          confirmButtonColor: "#10B981",
        });
      } else {
        await addBudgetMutation.mutateAsync({ ...data });
        Swal.fire({
          icon: "success",
          title: "Budget added!",
          confirmButtonColor: "#10B981",
        });
      }
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleDelete = (budget) => {
    Swal.fire({
      title: `Delete ${budget.category}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBudgetMutation.mutateAsync(budget.budget_id);

          Swal.fire(
            "Deleted!",
            `${budget.category} budget has been deleted.`,
            "success"
          ).then(() => {
            setBudgetModalOpen(false);
          });
        } catch (error) {
          Swal.fire("Error", "Failed to delete budget.", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
      {/* Page Header */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <PieChartIcon className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Budgets
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Track and manage your budget allocations
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base cursor-pointer"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-medium">Add Budget</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Allocated
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {symbol}
                  {totalAllocated.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-200/30 to-red-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-red-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Spent
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-red-600">
                  {symbol}
                  {totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Remaining
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">
                  {symbol}
                  {totalRemaining.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Completed
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {completedBudgetCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Budget Cards Grid */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Budget Overview
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {budgets.length} budget{budgets.length !== 1 ? "s" : ""} created
            </p>
          </div>

          {budgets.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <PieChartIcon className="text-gray-300" size={48} />
                <span className="text-gray-500 font-medium">
                  No budgets created yet
                </span>
                <p className="text-gray-400 text-sm">
                  Create your first budget to start tracking expenses
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  Create Budget
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {budgets.map((b, i) => {
                const spent = budgetSpent(b.budget_id);
                const allocated = Number(b.amount);
                const remaining = allocated - spent;
                const percent = Math.min((spent / allocated) * 100, 100);

                // Get status using the helper function
                const status = getBudgetStatus(b);
                const isCompleted = status === "Completed";
                const isBehind = status === "Behind";
                const statusColor = isCompleted
                  ? "green"
                  : isBehind
                  ? "red"
                  : "blue";

                return (
                  <div
                    key={i}
                    className="group relative cursor-pointer"
                    onClick={() => {
                      setActiveBudget(null);
                      setTimeout(() => {
                        setActiveBudget({ ...b, spent, remaining });
                        setBudgetModalOpen(true);
                      }, 50);
                    }}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 overflow-hidden">
                      {/* Colored Accent Top */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${
                          statusColor === "green"
                            ? "bg-gradient-to-r from-green-500 to-green-400"
                            : statusColor === "red"
                            ? "bg-gradient-to-r from-red-500 to-red-400"
                            : "bg-gradient-to-r from-blue-500 to-blue-400"
                        }`}
                      ></div>

                      {/* Budget Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-800 truncate">
                            {b.category ?? "Unknown"}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {b.description || "No Description"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {isCompleted ? (
                            <CheckCircle className="text-green-500" size={20} />
                          ) : isBehind ? (
                            <AlertCircle className="text-red-500" size={20} />
                          ) : (
                            <Clock className="text-blue-500" size={20} />
                          )}
                        </div>
                      </div>

                      {/* Date Range */}
                      <div className="flex items-center space-x-4 mb-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>
                            {b.start_date
                              ? new Date(b.start_date).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                        <span>to</span>
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>
                            {b.end_date
                              ? new Date(b.end_date).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Budget Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Allocated:
                          </span>
                          <span className="font-semibold text-blue-600">
                            {symbol}
                            {allocated.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Spent:</span>
                          <span className="font-semibold text-red-600">
                            {symbol}
                            {spent.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Remaining:
                          </span>
                          <span
                            className={`font-semibold ${
                              remaining <= 0
                                ? "text-orange-600"
                                : "text-orange-600"
                            }`}
                          >
                            {symbol}
                            {Math.max(remaining, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-500">
                            Progress
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            {percent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              statusColor === "green"
                                ? "bg-green-500"
                                : statusColor === "red"
                                ? "bg-red-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColor === "green"
                              ? "bg-green-100 text-green-800"
                              : statusColor === "red"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {status}
                        </span>
                        <Eye
                          className="text-gray-400 group-hover:text-blue-500 transition-colors"
                          size={16}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Budget Table - Desktop Only */}
      <section className="relative hidden lg:block">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 overflow-hidden">
          <div className="p-6 border-b border-blue-100/50">
            <h3 className="text-xl font-semibold text-gray-800">
              Budget Details
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Detailed view of all budgets
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-blue-50/50">
                <tr>
                  <th className="py-4 px-6 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-700">
                    Allocated
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-700">
                    Spent
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-700">
                    Remaining
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-700 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b, i) => {
                  const allocated = safeNumber(Number(b.amount));
                  const spent = budgetSpent(b.budget_id);
                  const remaining = allocated - spent;

                  // Get status using helper function
                  const status = getBudgetStatus(b);
                  const isCompleted = status === "Completed";
                  const isBehind = status === "Behind";

                  return (
                    <tr
                      key={i}
                      className="border-b border-gray-100/50 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-800">
                            {b.category ?? "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {b.description || "No description"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-blue-600">
                        {symbol}
                        {allocated.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 font-semibold text-red-600">
                        {symbol}
                        {spent.toLocaleString()}
                      </td>
                      <td
                        className={`py-4 px-6 font-semibold ${
                          remaining <= 0 ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {symbol}
                        {Math.max(remaining, 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isCompleted
                              ? "bg-green-100 text-green-800"
                              : isBehind
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(b);
                            }}
                            disabled={!b.budget_id} // disables button if budget_id is missing
                            className={`p-2 rounded-lg transition-colors ${
                              !b.budget_id
                                ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none opacity-50"
                                : "text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            }`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Charts */}
      {chartData.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Budget Distribution PieChart */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-40"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Budget Distribution
              </h3>
              <div className="w-full h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="allocated"
                      nameKey="category"
                      outerRadius="80%"
                      fill="#8884d8"
                      label={({ category, percent }) =>
                        `${category} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `${symbol}${value.toLocaleString()}`,
                        "Allocated",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Budget vs Spending BarChart */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-xl blur opacity-40"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Budget vs Spending
              </h3>
              <div className="w-full h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        `${symbol}${value.toLocaleString()}`,
                        name === "allocated" ? "Allocated" : "Spent",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="allocated"
                      fill="#3B82F6"
                      name="Allocated"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="spent"
                      fill="#EF4444"
                      name="Spent"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Budget Add/Edit Modal */}
      <ModalForm
        isOpen={modalOpen}
        type="budget"
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        selectedBudget={selectedBudget}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {/* Budget Card Modal */}
      {budgetModalOpen && (
        <BudgetCardModal
          budget={activeBudget}
          transactions={transactions.filter(
            (tx) => tx.budget_id === activeBudget?.budget_id
          )}
          onClose={() => {
            setBudgetModalOpen(false);
            setActiveBudget(null);
          }}
          onEditBudget={handleEditBudget}
          onAddExpense={handleAddExpense}
          onDeleteTransaction={handleDeleteTransaction}
          onDeleteBudget={handleDelete}
        />
      )}
    </div>
  );
}
