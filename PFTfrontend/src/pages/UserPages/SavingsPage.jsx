import { useState, useMemo } from "react";
import ModalForm from "../../components/ModalForm";

import {
  Plus,
  Trash2,
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import SavingsCardModal from "../../components/SavingsCardModal";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAddGoal,
  useUpdateGoal,
  useAddContribution,
  useDeleteContribution,
  useDeleteGoal,
  useGoals,
} from "../../api/queries";

import { useCurrency } from "../../context/CurrencyContext"; // ✅ Import context hook

export default function SavingsPage() {
  const queryClient = useQueryClient();
  const { data: goals = [] } = useGoals();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState(null);
  const [savingsModalOpen, setSavingsModalOpen] = useState(false);
  const { symbol } = useCurrency(); // ✅ Get currency symbol

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
  const MAX_GOALS = 9;

  // Mutations
  const addGoalMutation = useAddGoal();

  const updateGoalMutation = useUpdateGoal();

  const deleteGoalMutation = useDeleteGoal();

  const addContributionMutation = useAddContribution();

  const deleteContributionMutation = useDeleteContribution();

  // Helper functions
  const getStatus = (goal) => {
    // Calculate total saved from contributions
    const saved = (
      Array.isArray(goal.contributions) ? goal.contributions : []
    ).reduce((sum, c) => {
      const amount = parseFloat(c.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const target = parseFloat(goal.target_amount) || 0;

    // Check if goal is completed (saved >= target)
    if (saved >= target && target > 0) return "Completed";

    // Check if behind schedule
    const now = new Date();
    const deadline = goal.deadline ? new Date(goal.deadline) : null;
    if (deadline && now > deadline) return "Behind";

    return "On Track";
  };

  // Summary calculations
  const totalTarget = goals.reduce(
    (sum, g) => sum + Number(g.target_amount),
    0
  );

  const totalSaved = goals.reduce((sum, g) => {
    const goalContributions = g.contributions ?? [];
    const goalTotal = goalContributions.reduce(
      (s, c) => s + Number(c.amount || 0),
      0
    );
    return sum + goalTotal;
  }, 0);

  const totalRemaining = totalTarget - totalSaved;
  const completedGoalsCount = goals.filter(
    (g) => getStatus(g) === "Completed"
  ).length;

  // Chart data
  const progressData = useMemo(() => {
    return [
      { name: "Saved", value: totalSaved },
      { name: "Remaining", value: Math.max(totalTarget - totalSaved, 0) },
    ];
  }, [goals]);

  const barData = useMemo(() => {
    return goals.map((g) => ({
      name: g.title,
      Saved: Number(g.current_amount),
      Target: Number(g.target_amount),
    }));
  }, [goals]);

  // Handlers

  const handleDeleteTransaction = async (transaction) => {
    const result = await Swal.fire({
      title: "Delete this transaction?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return false;
    }

    try {
      await deleteContributionMutation.mutateAsync(transaction.id);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The transaction has been deleted.",
        confirmButtonColor: "#10B981",
      });
      return true;
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Could not delete transaction.",
        confirmButtonColor: "#EF4444",
      });
      return false;
    }
  };

  const handleAddSavings = async (contributions) => {
    try {
      const contributionData = {
        goal_id: contributions.goal_id,
        amount: Number(contributions.amount),
        date: contributions.date,
      };

      // 🔥 Use mutation (like you did with addGoalMutation)
      await addContributionMutation.mutateAsync(contributionData);

      Swal.fire({
        icon: "success",
        title: "Savings Added!",
        text: `${symbol}${Number(
          savingsAmount
        ).toLocaleString()} added to your savings goal.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  const handleEditGoal = async (updatedGoal) => {
    console.log("Updating goal:", updatedGoal);
    try {
      // ✅ Validation
      if (!updatedGoal.title || updatedGoal.title.trim() === "") {
        await Swal.fire({
          icon: "warning",
          title: "Missing Title",
          text: "Please enter a goal title.",
          confirmButtonColor: "#F59E0B",
        });
        return; // ⛔ Stop here, don't reset modal or editing state
      }

      if (
        updatedGoal.target_amount === undefined ||
        updatedGoal.target_amount === null ||
        isNaN(updatedGoal.target_amount) ||
        updatedGoal.target_amount < 0
      ) {
        await Swal.fire({
          icon: "warning",
          title: "Invalid Target Amount",
          text: "Please enter a valid non-negative number.",
          confirmButtonColor: "#F59E0B",
        });
        return;
      }

      if (updatedGoal.deadline && isNaN(Date.parse(updatedGoal.deadline))) {
        await Swal.fire({
          icon: "warning",
          title: "Invalid Deadline",
          text: "Please provide a valid date.",
          confirmButtonColor: "#F59E0B",
        });
        return;
      }

      // ✅ If all validations pass → Update API
      await updateGoalMutation.mutateAsync({
        id: updatedGoal.goal_id,
        data: {
          title: updatedGoal.title,
          target_amount: updatedGoal.target_amount,
          deadline: updatedGoal.deadline,
          description: updatedGoal.description || "",
        },
      });

      // ✅ Only close modal when successful
      setModalOpen(false);
      setActiveGoal(null);

      Swal.fire({
        icon: "success",
        title: "Goal updated!",
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

  const handleOpenModal = (goal = null) => {
    if (!goal && goals.length >= MAX_GOALS) {
      Swal.fire({
        icon: "warning",
        title: "Limit Reached",
        text: `You can only create up to ${MAX_GOALS} budgets.`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    setModalType("goal");
    setFormData({
      category: "",
      customCategory: "",
      amount: "",
      description: "",
      transaction_date: "",
      title: "",
      target_amount: "",
      deadline: "",
      start_date: "",
      end_date: "",
    });
    setSelectedGoal(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleDeleteGoal = async (goalId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This goal will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteGoalMutation.mutateAsync(goalId.goal_id);
      Swal.fire("Deleted!", "Your savings goal has been removed.", "success");
      setSavingsModalOpen(false);
    } catch (error) {
      Swal.fire("Error", "Failed to delete the goal.", "error");
    }
  };

  const handleSubmit = async (data) => {
    try {
      let message = "";

      if (modalType === "income" || modalType === "expense") {
        const txData = {
          type: modalType === "income" ? "Income" : "Expense",
          category:
            data.category === "Other" ? data.customCategory : data.category,
          amount: parseFloat(data.amount),
          transaction_date: data.transaction_date,
          description: data.description || "",
        };

        await addTransactionMutation.mutateAsync(txData);
        message = modalType === "income" ? "Income added!" : "Expense added!";
      } else if (modalType === "budget") {
        const budgetData = {
          category:
            data.category === "Other" ? data.customCategory : data.category,
          amount: Number(data.limit || data.amount),
          start_date: data.start_date,
          end_date: data.end_date,
          description: data.description || "",
        };
        await budgetMutation.mutateAsync(budgetData);
        message = "Budget set!";
      } else if (modalType === "goal") {
        const goalData = {
          title: data.title,
          target_amount: Number(data.target_amount),
          deadline: data.deadline || null,
          description: data.description || "",
        };
        await addGoalMutation.mutateAsync(goalData);
        message = "Savings goal created!";
        queryClient.invalidateQueries(["goals", "reports"]);
      }

      handleCloseModal();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: message,
        confirmButtonColor: "#10B981",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleSaveGoal = (goalData) => {
    if (goalData.goal_id) {
      updateGoalMutation.mutateAsync(goalData, {
        onSuccess: (response) => {
          Swal.fire({
            icon: "success",
            title: "Goal Updated",
            text: "Your savings goal was updated successfully!",
            showConfirmButton: true,
            confirmButtonText: "OK",
          });
        },
        onError: (error) => {
          Swal.fire({
            icon: "error",
            title: "Update Failed",
            text: error.response?.data?.message || "Something went wrong!",
            showConfirmButton: true,
            confirmButtonText: "OK",
          });
        },
      });
    } else {
      createGoalMutation.mutateAsync(goalData, {
        onSuccess: (response) => {
          Swal.fire({
            icon: "success",
            title: "Goal Added",
            text: "Your savings goal was added successfully!",
            showConfirmButton: true,
            confirmButtonText: "OK",
          });
        },
        onError: (error) => {
          Swal.fire({
            icon: "error",
            title: "Creation Failed",
            text: error.response?.data?.message || "Something went wrong!",
            showConfirmButton: true,
            confirmButtonText: "OK",
          });
        },
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
      {/* Page Header */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Savings Goals
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Track and achieve your financial objectives
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto cursor-pointer"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-medium">Add Goal</span>
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Target
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">
                  {symbol}
                  {totalTarget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Saved
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {symbol}
                  {totalSaved.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-200/30 to-orange-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Remaining
                </h3>
                <p
                  className={`text-lg sm:text-2xl font-bold ${
                    totalRemaining >= 0 ? "text-orange-600" : "text-red-600"
                  }`}
                >
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Completed
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">
                  {completedGoalsCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Goals Cards Grid */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Savings Goals Overview
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {goals.length} goal{goals.length !== 1 ? "s" : ""} created
            </p>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <Target className="text-gray-300" size={48} />
                <span className="text-gray-500 font-medium">
                  No savings goals created yet
                </span>
                <p className="text-gray-400 text-sm">
                  Create your first savings goal to start tracking your progress
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {goals.map((goal, i) => {
                // ✅ sum all contributions for this goal
                const saved = (
                  Array.isArray(goal.contributions) ? goal.contributions : []
                ).reduce((sum, c) => {
                  const amount = parseFloat(c.amount);
                  return sum + (isNaN(amount) ? 0 : amount);
                }, 0);

                const target = parseFloat(goal.target_amount) || 0;
                const remaining = target - saved;
                const progress =
                  target > 0 ? Math.min((saved / target) * 100, 100) : 0;

                const status = getStatus(goal);
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
                      setActiveGoal(null);
                      setTimeout(() => {
                        setActiveGoal({ ...goal });
                        setSavingsModalOpen(true);
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

                      {/* Goal Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-800 truncate">
                            {goal.title ?? "Unknown Goal"}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {goal.description || "No Description"}
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

                      {/* Deadline */}
                      <div className="flex items-center space-x-1 mb-4 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>
                          Deadline:{" "}
                          {goal.deadline
                            ? new Date(goal.deadline).toLocaleDateString()
                            : "No deadline"}
                        </span>
                      </div>

                      {/* Goal Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Target:</span>
                          <span className="font-semibold text-blue-600">
                            {symbol}
                            {Number(goal.target_amount).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Saved:</span>
                          <span className="font-semibold text-green-600">
                            {symbol}
                            {Number(saved).toLocaleString()}
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
                            {progress.toFixed(1)}%
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
                            style={{ width: `${Math.min(progress, 100)}%` }}
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
                          className="text-gray-400 group-hover:text-green-500 transition-colors"
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

      {/* Goals Table - Desktop Only */}
      <section className="relative hidden lg:block">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
          <div className="p-6 border-b border-green-100/50">
            <h3 className="text-xl font-semibold text-gray-800">
              Goal Details
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Detailed view of all savings goals
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-green-50/50">
                <tr>
                  <th className="py-4 px-6 font-semibold text-gray-700">
                    Goal Name
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-700">
                    Target
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-700">
                    Saved
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-700">
                    Remaining
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-700">
                    Deadline
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
                {goals.map((goal) => {
                  // ✅ sum all contributions for this goal
                  const saved = (
                    Array.isArray(goal.contributions) ? goal.contributions : []
                  ).reduce((sum, c) => {
                    const amount = parseFloat(c.amount);
                    return sum + (isNaN(amount) ? 0 : amount);
                  }, 0);

                  const target = parseFloat(goal.target_amount) || 0;
                  const remaining = target - saved;

                  // ✅ recalculate status based on contributions
                  const status = getStatus({ ...goal, current_amount: saved });
                  const isCompleted = status === "Completed";
                  const isBehind = status === "Behind";

                  return (
                    <tr
                      key={goal.goal_id} // ✅ The correct placement of the unique key prop
                      className="border-b border-gray-100/50 hover:bg-green-50/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-800">
                            {goal.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {goal.description || "No description"}
                          </p>
                        </div>
                      </td>

                      {/* Target */}
                      <td className="py-4 px-6 font-semibold text-blue-600">
                        {symbol}
                        {target.toLocaleString()}
                      </td>

                      {/* Saved (from contributions) */}
                      <td className="py-4 px-6 font-semibold text-green-600">
                        {symbol}
                        {saved.toLocaleString()}
                      </td>

                      {/* Remaining */}
                      <td
                        className={`py-4 px-6 font-semibold ${
                          remaining <= 0 ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {symbol}
                        {Math.max(remaining, 0).toLocaleString()}
                      </td>

                      {/* Deadline */}
                      <td className="py-4 px-6 text-gray-600">
                        {goal.deadline
                          ? new Date(goal.deadline).toLocaleDateString()
                          : "No deadline"}
                      </td>

                      {/* Status */}
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

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            className="p-2 rounded-lg transition-colors
               text-red-500 hover:text-red-700 hover:bg-red-50
               disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGoal(goal);
                            }}
                            disabled={!goal} // disables button if `goal` is falsy
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
      {goals.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Progress Overview PieChart */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-xl blur opacity-40"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Progress Overview
              </h3>
              <div className="w-full h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius="80%"
                      fill="#8884d8"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {progressData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `${symbol}${value.toLocaleString()}`,
                        "",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Savings per Goal BarChart */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-40"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Savings per Goal
              </h3>
              <div className="w-full h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
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
                        name,
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="Target"
                      fill="#93C5FD"
                      name="Target"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Saved"
                      fill="#10B981"
                      name="Saved"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tips Section */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-200/30 to-yellow-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-100/50 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <span>💡</span>
            <span>Savings Tips</span>
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">•</span>
              <span>
                Add {symbol}500 weekly to reach your Vacation goal by December.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">•</span>
              <span>
                You've completed {completedGoalsCount} goals so far! Keep up the
                great work.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">•</span>
              <span>
                Set up automatic transfers to make saving effortless and
                consistent.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">•</span>
              <span>
                Break large goals into smaller milestones to stay motivated.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Modals */}

      <ModalForm
        isOpen={modalOpen}
        type={modalType}
        formData={formData}
        setFormData={setFormData}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {savingsModalOpen && (
        <SavingsCardModal
          goal={activeGoal}
          onClose={() => {
            setSavingsModalOpen(false);
            setActiveGoal(null);
          }}
          onEditGoal={handleEditGoal}
          onSave={handleSaveGoal}
          onAddSavings={handleAddSavings}
          onDeleteTransaction={handleDeleteTransaction}
          onDeleteGoal={handleDeleteGoal}
        />
      )}
    </div>
  );
}
