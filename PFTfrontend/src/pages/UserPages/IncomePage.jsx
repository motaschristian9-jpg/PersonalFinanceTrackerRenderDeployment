// src/pages/UserPages/IncomePage.jsx
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  Plus,
  Filter,
  Calendar,
  FileDown,
  Edit,
  Trash2,
  Search,
  TrendingUp,
  Wallet,
  BarChart3,
  DollarSign,
  PiggyBank,
} from "lucide-react";
import ModalForm from "../../components/ModalForm";
import { exportIncomeReport } from "../../utils/exportUtils";
import {
  useAddTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
  useTransactions,
} from "../../api/queries";

import { useCurrency } from "../../context/CurrencyContext";

export default function IncomePage() {
  const queryClient = useQueryClient();
  const { data: transactions } = useTransactions();
  const { symbol } = useCurrency();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("This Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All Sources");

  const incomeTransactions = transactions.filter(
    (t) => t.type?.toLowerCase() === "income"
  );

  // Mutations
  const addTransactionMutation = useAddTransaction();

  const updateTransactionMutation = useUpdateTransaction();

  const deleteTransactionMutation = useDeleteTransaction();

  // Modal handling
  const handleOpenModal = () => {
    setFormData({});
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (tx) => {
    setEditingId(tx.transaction_id);
    const formattedDate = tx.transaction_date
      ? new Date(tx.transaction_date).toISOString().split("T")[0]
      : "";

    setFormData({
      category: tx.category || "",
      amount: tx.amount || "",
      description: tx.description || "",
      transaction_date: formattedDate,
    });

    setModalOpen(true);
  };

  const handleDelete = (txId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This transaction will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#10B981",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTransactionMutation.mutateAsync(txId, {
          onSuccess: () => {
            Swal.fire("Deleted!", "Transaction has been deleted.", "success");
          },
          onError: (error) => {
            Swal.fire(
              "Error!",
              error.response?.data?.message || "Failed to delete transaction.",
              "error"
            );
          },
        });
      }
    });
  };

  const handleSubmit = async (data) => {
    const payload = {
      type: "Income",
      category: data.category,
      amount: parseFloat(data.amount),
      transaction_date: data.transaction_date,
      description: data.description || "",
    };

    if (editingId) {
      await updateTransactionMutation.mutateAsync({
        id: editingId,
        data: payload,
      });
      Swal.fire("Updated!", "Income updated successfully.", "success");
    } else {
      await addTransactionMutation.mutateAsync(payload);
      Swal.fire("Added!", "New income record added.", "success");
    }

    setModalOpen(false);
    setEditingId(null);
  };

  // Filtering logic
  const filteredIncome = incomeTransactions.filter((tx) => {
    const descMatch = tx.description
      ?.toLowerCase()
      .includes(search.toLowerCase());

    let dateMatch = true;
    const txDate = new Date(tx.transaction_date);

    if (dateFilter === "This Month") {
      const now = new Date();
      dateMatch =
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear();
    } else if (dateFilter === "Last Month") {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      dateMatch =
        txDate.getMonth() === lastMonth.getMonth() &&
        txDate.getFullYear() === lastMonth.getFullYear();
    } else if (dateFilter === "Custom Range" && customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      dateMatch = txDate >= start && txDate <= end;
    }

    let sourceMatch = true;
    if (sourceFilter !== "All Sources") {
      if (sourceFilter === "Others") {
        const mainSources = ["Salary", "Freelance", "Investments", "Business"];
        sourceMatch = !mainSources.includes(tx.category);
      } else {
        sourceMatch = tx.category === sourceFilter;
      }
    }

    return descMatch && dateMatch && sourceMatch;
  });

  // Summary calculations
  const totalIncome = filteredIncome.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0
  );

  const highestSource =
    filteredIncome.length > 0
      ? filteredIncome.reduce((max, tx) =>
          Number(tx.amount) > Number(max.amount) ? tx : max
        ).category
      : "—";

  const avgMonthlyIncome =
    totalIncome /
      new Set(
        filteredIncome.map((tx) => new Date(tx.transaction_date).getMonth())
      ).size || 0;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
      {/* Page Header */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100/50 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Income
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Track and manage your income records
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleOpenModal}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base cursor-pointer"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-medium">Add Income</span>
              </button>
              <button
                onClick={() =>
                  exportIncomeReport(filteredIncome, {
                    totalIncome,
                    highestSource,
                    avgMonthlyIncome,
                  })
                }
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-green-200 text-green-700 rounded-xl shadow-lg hover:shadow-xl hover:bg-emerald-50 transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base cursor-pointer"
              >
                <FileDown size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200/30 to-emerald-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Income
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-emerald-600">
                  {symbol}
                  {totalIncome.toLocaleString()}
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
                <BarChart3 className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Highest Source
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {highestSource}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group sm:col-span-2 lg:col-span-1">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <PiggyBank className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Avg. Monthly
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">
                  {symbol}
                  {avgMonthlyIncome.toFixed(2).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100/50 p-4 sm:p-6">
          <div className="space-y-4">
            {/* First Row */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Search className="text-white" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Search Description
                  </label>
                  <input
                    type="text"
                    placeholder="Search income records..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-white" size={16} />
                </div>
                <div className="min-w-0 flex-1 sm:flex-initial">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date Filter
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all cursor-pointer"
                  >
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>Custom Range</option>
                  </select>
                </div>
              </div>

              {/* Source Filter */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Filter className="text-white" size={16} />
                </div>
                <div className="min-w-0 flex-1 sm:flex-initial">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Source Filter
                  </label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all cursor-pointer"
                  >
                    <option>All Sources</option>
                    <option>Salary</option>
                    <option>Freelance</option>
                    <option>Investments</option>
                    <option>Business</option>
                    <option>Others</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            {dateFilter === "Custom Range" && (
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/50">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Income Table - Desktop View */}
      <section className="relative hidden md:block">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100/50 overflow-hidden">
          <div className="p-6 border-b border-emerald-100/50">
            <h3 className="text-xl font-semibold text-gray-800">
              Income Records
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {filteredIncome.length} record
              {filteredIncome.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-green-50 sticky top-0">
                  <tr>
                    <th className="py-4 px-6 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="py-4 px-6 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="py-4 px-6 font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="py-4 px-6 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="py-4 px-6 font-semibold text-gray-700 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncome.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <div className="flex flex-col items-center space-y-3">
                          <TrendingUp className="text-gray-300" size={48} />
                          <span className="text-gray-500 font-medium">
                            No income records found
                          </span>
                          <p className="text-gray-400 text-sm">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredIncome.map((tx) => (
                      <tr
                        key={tx.transaction_id}
                        className="hover:bg-emerald-50/30 transition-colors border-b border-gray-100/50"
                      >
                        <td className="py-4 px-6 text-gray-700">
                          {new Date(tx.transaction_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="py-4 px-6 font-bold text-emerald-600">
                          <div className="flex items-center space-x-1">
                            <TrendingUp size={16} />
                            <span>
                              +{symbol}
                              {Number(tx.amount).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              className={`p-2 rounded-lg transition-colors flex items-center justify-center
    ${
      tx.transaction_id
        ? "text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
        : "text-gray-400 bg-gray-100 cursor-not-allowed"
    }`}
                              disabled={!tx.transaction_id}
                              onClick={() => handleEdit(tx)}
                              title={
                                !tx.transaction_id
                                  ? "Transaction is still saving..."
                                  : "Edit Transaction"
                              }
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              className={`p-2 rounded-lg transition-colors flex items-center justify-center
    ${
      tx.transaction_id
        ? "text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
        : "text-gray-400 bg-gray-100 cursor-not-allowed"
    }`}
                              disabled={!tx.transaction_id}
                              onClick={() => handleDelete(tx.transaction_id)}
                              title={
                                !tx.transaction_id
                                  ? "Transaction is still saving..."
                                  : "Delete Transaction"
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Income Cards - Mobile View */}
      <section className="relative md:hidden">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100/50 overflow-hidden">
          <div className="p-4 border-b border-emerald-100/50">
            <h3 className="text-lg font-semibold text-gray-800">
              Income Records
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {filteredIncome.length} record
              {filteredIncome.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredIncome.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="flex flex-col items-center space-y-3">
                  <TrendingUp className="text-gray-300" size={48} />
                  <span className="text-gray-500 font-medium">
                    No income records found
                  </span>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredIncome.map((tx) => (
                  <div
                    key={tx.transaction_id}
                    className="p-4 hover:bg-emerald-50/30 transition-colors"
                  >
                    <div className="flex items-start justify-between space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <TrendingUp
                              size={14}
                              className="text-emerald-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {tx.description || "No description"}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                {tx.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>
                              {new Date(
                                tx.transaction_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-emerald-600">
                            +{symbol}
                            {Number(tx.amount).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1 flex-shrink-0">
                        <button
                          className="p-2 rounded-lg transition-colors
               text-blue-500 hover:text-blue-700 hover:bg-blue-50
               disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
                          onClick={() => handleEdit(tx)}
                          disabled={!tx.transaction_id} // add this if you want to disable when no transaction_id
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          className="p-2 rounded-lg transition-colors
               text-red-500 hover:text-red-700 hover:bg-red-50
               disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
                          onClick={() => handleDelete(tx.transaction_id)}
                          disabled={!tx.transaction_id} // same here
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal for Add/Edit */}
      <ModalForm
        isOpen={modalOpen}
        type="income"
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
