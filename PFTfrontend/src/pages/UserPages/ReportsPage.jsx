import React, { useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  FileText,
  FileDown,
  PieChart as PieChartIcon,
} from "lucide-react";

import { useCurrency } from "../../context/CurrencyContext";
import {
  exportIncomeReport,
  exportExpenseReport,
  exportFullReport,
} from "../../utils/exportUtils";

import { useTransactions,
  useBudgets,
  useGoals,} from "../../api/queries";

// ===================================================================
// Helper Functions
// ===================================================================
const formatCurrency = (value) => {
  const { symbol } = useCurrency();
  return `${symbol}${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatPercentage = (value) => `${Number(value || 0).toFixed(0)}%`;

// ===================================================================
// Custom Tooltip Components
// ===================================================================
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-gray-800 mb-1">{data.name}</p>
        <p className="text-gray-600">
          Amount:{" "}
          <span className="font-bold text-orange-600">
            {formatCurrency(data.value)}
          </span>
        </p>
        <p className="text-gray-600">
          Percentage:{" "}
          <span className="font-bold text-gray-700">
            {formatPercentage(payload[0].percent * 100)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload, label }) => {
  const { symbol } = useCurrency();
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-gray-800 mb-1">Month: {label}</p>
        {payload.map((p, index) => (
          <p key={index} className="text-gray-700" style={{ color: p.color }}>
            {p.name}:{" "}
            <span className="font-bold">{formatCurrency(p.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ===================================================================
// Main Component
// ===================================================================
const ReportsPage = () => {
  const { data: transactions = [] } = useTransactions();
    const { data: budgets = [] } = useBudgets();
    const { data: goals = [] } = useGoals();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedRange, setAppliedRange] = useState({ from: "", to: "" });
  const { symbol } = useCurrency();

  // Expense data grouped by category
  const expenseData = React.useMemo(() => {
    if (!transactions) return [];

    const from = appliedRange?.from ? new Date(appliedRange.from) : null;
    const to = appliedRange?.to ? new Date(appliedRange.to) : null;

    return transactions
      .filter((t) => t.type?.toLowerCase() === "expense")
      .filter((t) => {
        const txDate = new Date(t.transaction_date || t.date);
        if (from && txDate < from) return false;
        if (to && txDate > to) return false;
        return true;
      })
      .reduce((acc, tx) => {
        const existing = acc.find((item) => item.name === tx.category);
        if (existing) {
          existing.value += parseFloat(tx.amount) || 0;
        } else {
          acc.push({ name: tx.category, value: parseFloat(tx.amount) || 0 });
        }
        return acc;
      }, []);
  }, [transactions, appliedRange]);

  // Income vs Expenses Trend
  const incomeExpenseData = React.useMemo(() => {
    if (!transactions) return [];

    const monthlyTotals = {};
    const from = appliedRange?.from ? new Date(appliedRange.from) : null;
    const to = appliedRange?.to ? new Date(appliedRange.to) : null;

    transactions.forEach((tx) => {
      const dateStr = tx.transaction_date;
      if (!dateStr) return;

      const date = new Date(dateStr);
      if (from && date < from) return;
      if (to && date > to) return;

      const month = date.toLocaleString("en-US", { month: "short" });
      if (!monthlyTotals[month])
        monthlyTotals[month] = { month, income: 0, expenses: 0 };

      if (tx.type.toLowerCase() === "income") {
        monthlyTotals[month].income += Number(tx.amount) || 0;
      } else if (tx.type.toLowerCase() === "expense") {
        monthlyTotals[month].expenses += Number(tx.amount) || 0;
      }
    });

    const monthOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return monthOrder.map((m) => monthlyTotals[m]).filter(Boolean);
  }, [transactions, appliedRange]);

  // Budget Utilization
  const budgetUtilization = React.useMemo(() => {
    if (!budgets || !transactions) return [];

    return budgets.map((budget) => {
      const from = appliedRange?.from ? new Date(appliedRange.from) : null;
      const to = appliedRange?.to ? new Date(appliedRange.to) : null;

      const spent = transactions
        .filter((tx) => {
          if (tx.type !== "expense" || tx.budget_id !== budget.budget_id)
            return false;
          const date = new Date(tx.transaction_date || tx.date);
          if (from && date < from) return false;
          if (to && date > to) return false;
          return true;
        })
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      const allocated = Number(budget.amount || 0);
      const percentage =
        allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

      return {
        category: budget.category || "Uncategorized",
        allocated,
        spent,
        percentage,
      };
    });
  }, [budgets, transactions, appliedRange]);

  // Income & Expense Reports
  const incomeReports = React.useMemo(() => {
    if (!transactions) return [];
    const from = appliedRange?.from ? new Date(appliedRange.from) : null;
    const to = appliedRange?.to ? new Date(appliedRange.to) : null;

    return transactions
      .filter((tx) => tx.type === "income")
      .filter((tx) => {
        const date = new Date(tx.transaction_date || tx.date);
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      })
      .map((tx) => ({
        source: tx.source || tx.category || "Other",
        amount: Number(tx.amount || 0),
        date: tx.transaction_date,
        description: tx.description || "No description",
        category: tx.category,
        transaction_date: tx.transaction_date,
      }));
  }, [transactions, appliedRange]);

  const expenseReports = React.useMemo(() => {
    if (!transactions) return [];
    const from = appliedRange?.from ? new Date(appliedRange.from) : null;
    const to = appliedRange?.to ? new Date(appliedRange.to) : null;

    return transactions
      .filter((tx) => tx.type === "expense")
      .filter((tx) => {
        const date = new Date(tx.transaction_date || tx.date);
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      })
      .map((tx) => ({
        category: tx.category || "Uncategorized",
        amount: Number(tx.amount || 0),
        date: tx.transaction_date,
        description: tx.description || "No description",
        transaction_date: tx.transaction_date,
      }));
  }, [transactions, appliedRange]);

  // Filtered Summary Data
  const filteredSummaryData = React.useMemo(() => {
    if (!transactions) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
      };
    }

    const from = appliedRange?.from ? new Date(appliedRange.from) : null;
    const to = appliedRange?.to ? new Date(appliedRange.to) : null;

    const totalIncome = transactions
      .filter((tx) => {
        if (tx.type?.toLowerCase() !== "income") return false;
        const txDate = new Date(tx.transaction_date || tx.date);
        if (from && txDate < from) return false;
        if (to && txDate > to) return false;
        return true;
      })
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const totalExpenses = transactions
      .filter((tx) => {
        if (tx.type?.toLowerCase() !== "expense") return false;
        const txDate = new Date(tx.transaction_date || tx.date);
        if (from && txDate < from) return false;
        if (to && txDate > to) return false;
        return true;
      })
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    };
  }, [transactions, appliedRange]);

  // Filtered Savings Data
  const filteredSavingsData = React.useMemo(() => {
    if (!goals) return 0;

    const from = appliedRange?.from ? new Date(appliedRange.from) : null;
    const to = appliedRange?.to ? new Date(appliedRange.to) : null;

    return goals.reduce((sum, g) => {
      const goalTotal = (g.contributions ?? [])
        .filter((c) => {
          const contDate = new Date(c.date || c.contribution_date);
          if (from && contDate < from) return false;
          if (to && contDate > to) return false;
          return true;
        })
        .reduce((s, c) => s + Number(c.amount || 0), 0);
      return sum + goalTotal;
    }, 0);
  }, [goals, appliedRange]);

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  const handleApplyFilter = () =>
    setAppliedRange({ from: dateFrom, to: dateTo });

  // Updated export handlers
  const handleExport = (type) => {
    if (type === "Income") {
      const incomeSummary = {
        totalIncome: filteredSummaryData.totalIncome,
        highestSource:
          incomeReports.length > 0
            ? incomeReports.reduce((max, tx) =>
                Number(tx.amount) > Number(max.amount) ? tx : max
              ).source
            : "—",
        avgMonthlyIncome:
          incomeReports.length > 0
            ? filteredSummaryData.totalIncome /
              new Set(
                incomeReports.map((tx) =>
                  new Date(tx.transaction_date).getMonth()
                )
              ).size
            : 0,
      };
      exportIncomeReport(incomeReports, incomeSummary, appliedRange);
    } else if (type === "Expense") {
      const expenseSummary = {
        totalExpenses: filteredSummaryData.totalExpenses,
        largestCategory:
          expenseReports.length > 0
            ? expenseReports.reduce((max, tx) =>
                Number(tx.amount) > Number(max.amount) ? tx : max
              ).category
            : "—",
        avgMonthlyExpenses:
          expenseReports.length > 0
            ? filteredSummaryData.totalExpenses /
              new Set(
                expenseReports.map((tx) =>
                  new Date(tx.transaction_date).getMonth()
                )
              ).size
            : 0,
      };
      exportExpenseReport(expenseReports, expenseSummary, appliedRange);
    } else if (type === "Full Report") {
      const incomeSummary = {
        totalIncome: filteredSummaryData.totalIncome,
        highestSource:
          incomeReports.length > 0
            ? incomeReports.reduce((max, tx) =>
                Number(tx.amount) > Number(max.amount) ? tx : max
              ).source
            : "—",
        avgMonthlyIncome:
          incomeReports.length > 0
            ? filteredSummaryData.totalIncome /
              new Set(
                incomeReports.map((tx) =>
                  new Date(tx.transaction_date).getMonth()
                )
              ).size
            : 0,
      };

      const expenseSummary = {
        totalExpenses: filteredSummaryData.totalExpenses,
        largestCategory:
          expenseReports.length > 0
            ? expenseReports.reduce((max, tx) =>
                Number(tx.amount) > Number(max.amount) ? tx : max
              ).category
            : "—",
        avgMonthlyExpenses:
          expenseReports.length > 0
            ? filteredSummaryData.totalExpenses /
              new Set(
                expenseReports.map((tx) =>
                  new Date(tx.transaction_date).getMonth()
                )
              ).size
            : 0,
      };

      exportFullReport(
        incomeReports,
        expenseReports,
        incomeSummary,
        expenseSummary,
        appliedRange,
        symbol
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
      {/* Page Header */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Reports & Analytics
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Comprehensive financial insights and analysis
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleExport("Full Report")}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-orange-200 text-orange-700 rounded-xl shadow-lg hover:shadow-xl hover:bg-orange-50 transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base cursor-pointer"
              >
                <FileDown size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-medium">Export Full Report</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Date Range Filter */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Calendar size={18} className="text--600" />
              <span>Report Period</span>
            </h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-sm"
                />
                <span className="hidden sm:flex items-center text-gray-500">
                  to
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-sm"
                />
              </div>
              <button
                onClick={handleApplyFilter}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm hover:from-orange-700 hover:to-orange-800 cursor-pointer"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Income
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {formatCurrency(filteredSummaryData.totalIncome)}
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
                  Total Expenses
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-red-600">
                  {formatCurrency(filteredSummaryData.totalExpenses)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Net Balance
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {formatCurrency(filteredSummaryData.netBalance)}
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
                <Target className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Savings Achieved
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">
                  {formatCurrency(filteredSavingsData)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Expense Breakdown PieChart */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-200/30 to-orange-300/20 rounded-xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-100/50 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <BarChart3 size={18} className="text-orange-600" />
              <span>
                Expense Breakdown (Total:{" "}
                {formatCurrency(
                  expenseData.reduce((sum, item) => sum + item.value, 0)
                )}
                )
              </span>
            </h3>
            <div className="w-full h-64 sm:h-80">
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius="80%"
                      fill="#8884d8"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${formatPercentage(percent * 100)}`
                      }
                    >
                      {expenseData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <CustomPieTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No expense data found for the selected period.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Income vs Expenses LineChart */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <BarChart3 size={18} className="text-blue-600" />
              <span>Income vs Expenses Trend</span>
            </h3>
            <div className="w-full h-64 sm:h-80">
              {incomeExpenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incomeExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        `${symbol}${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <CustomLineTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#10B981"
                      strokeWidth={3}
                      name="Income"
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#EF4444"
                      strokeWidth={3}
                      name="Expenses"
                      dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No income/expense trend data found for the selected period.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Budget Utilization */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <PieChartIcon size={18} className="text-green-600" />
            <span>Budget Utilization</span>
          </h3>
          <div className="space-y-6">
            {budgetUtilization.length > 0 ? (
              budgetUtilization.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {item.category}
                    </span>
                    <div className="text-sm text-gray-600">
                      <span
                        className={`font-semibold ${
                          item.spent > item.allocated
                            ? "text-red-500"
                            : "text-gray-800"
                        }`}
                      >
                        {formatCurrency(item.spent)}
                      </span>
                      <span className="text-gray-400"> / </span>
                      <span>{formatCurrency(item.allocated)}</span>
                      <span className="ml-2 font-medium">
                        ({formatPercentage(item.percentage)})
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        item.percentage >= 100
                          ? "bg-red-500"
                          : item.percentage >= 75
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                No active budgets or tracked expenses in the selected period.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Reports Tables */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Income Report */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-green-100/50 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <TrendingUp size={18} className="text-green-600" />
                  <span>Income Report</span>
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Recent income transactions ({incomeReports.length} items)
                </p>
              </div>
              <button
                onClick={() => handleExport("Income")}
                className="text-green-600 hover:text-green-700 transition-colors p-2 rounded-lg hover:bg-green-50 text-sm flex items-center space-x-1 cursor-pointer"
              >
                <FileDown size={14} />
                <span>Export</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left">
                <thead className="bg-green-50/50 sticky top-0 border-b border-green-100/50">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm w-1/4">
                      Source
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm w-1/4">
                      Amount
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm w-1/4 hidden sm:table-cell">
                      Description
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm w-1/4">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incomeReports.length > 0 ? (
                    incomeReports.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100/50 hover:bg-green-50/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-800 text-sm">
                            {item.source}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-600 text-sm">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm hidden sm:table-cell truncate max-w-xs">
                          {item.description}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-4 px-4 text-center text-gray-500 text-sm"
                      >
                        No income transactions found for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Expense Report */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-200/30 to-red-300/20 rounded-xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-red-100/50 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-red-100/50 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <TrendingDown size={18} className="text-red-600" />
                  <span>Expense Report</span>
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Recent expense transactions ({expenseReports.length} items)
                </p>
              </div>
              <button
                onClick={() => handleExport("Expense")}
                className="text-red-600 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50 text-sm flex items-center space-x-1 cursor-pointer"
              >
                <FileDown size={14} />
                <span>Export</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left">
                <thead className="bg-red-50/50 sticky top-0 border-b border-red-100/50">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm w-1/4">
                      Category
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm w-1/4">
                      Amount
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm w-1/4 hidden sm:table-cell">
                      Description
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm w-1/4">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenseReports.length > 0 ? (
                    expenseReports.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100/50 hover:bg-red-50/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-800 text-sm">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-red-600 text-sm">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm hidden sm:table-cell truncate max-w-xs">
                          {item.description}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-4 px-4 text-center text-gray-500 text-sm"
                      >
                        No expense transactions found for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Insights */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-200/30 to-yellow-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-100/50 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <FileText size={18} className="text-yellow-600" />
            <span>Financial Insights</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">
                Spending Pattern
              </h4>
              <p className="text-sm text-blue-700">
                {expenseData.length > 0
                  ? (() => {
                      const totalExpense = expenseData.reduce(
                        (sum, d) => sum + d.value,
                        0
                      );
                      const highest = expenseData.reduce(
                        (max, d) => (d.value > max.value ? d : max),
                        { name: "N/A", value: 0 }
                      );
                      const percentage =
                        totalExpense > 0
                          ? Math.round((highest.value / totalExpense) * 100)
                          : 0;
                      return `Your highest spending category is **${
                        highest.name
                      }** (${formatCurrency(
                        highest.value
                      )}), representing **${formatPercentage(
                        percentage
                      )}** of total expenses.`;
                    })()
                  : "Analyze your spending patterns by applying a date filter to see your top categories."}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-800 mb-2">
                Savings Rate
              </h4>
              <p className="text-sm text-green-700">
                {filteredSummaryData.totalIncome > 0
                  ? (() => {
                      const netProfit =
                        filteredSummaryData.totalIncome -
                        filteredSummaryData.totalExpenses;
                      const savingsRate = Math.round(
                        (netProfit / filteredSummaryData.totalIncome) * 100
                      );
                      const status = savingsRate >= 20 ? "above" : "below";
                      return `Your net financial gain is **${formatCurrency(
                        netProfit
                      )}**. This translates to a saving/profit rate of **${formatPercentage(
                        savingsRate
                      )}**, which is ${status} the recommended 20% rate.`;
                    })()
                  : "Track your savings performance by ensuring you have income and expense data for a period."}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h4 className="font-semibold text-purple-800 mb-2">
                Budget Performance
              </h4>
              <p className="text-sm text-purple-700">
                {budgetUtilization.length > 0
                  ? (() => {
                      const overspent = budgetUtilization.filter(
                        (b) => b.percentage > 100
                      );
                      const nearLimit = budgetUtilization.filter(
                        (b) => b.percentage >= 90 && b.percentage <= 100
                      );

                      if (overspent.length > 0) {
                        const amountOver =
                          overspent[0].spent - overspent[0].allocated;
                        return `**Warning**: You have overspent on the **${
                          overspent[0].category
                        }** budget by **${formatCurrency(
                          amountOver
                        )}**. Review this category immediately!`;
                      } else if (nearLimit.length > 0) {
                        return `**Heads up**: The **${
                          nearLimit[0].category
                        }** budget is at **${formatPercentage(
                          nearLimit[0].percentage
                        )}** utilization. Monitor your spending in this area.`;
                      } else {
                        return "Excellent job! All tracked budgets are currently well within their allocated limits for this period.";
                      }
                    })()
                  : "Set up budgets and track expenses to get personalized performance insights."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;
