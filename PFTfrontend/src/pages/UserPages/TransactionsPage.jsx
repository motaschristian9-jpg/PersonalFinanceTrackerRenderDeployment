import { useState } from "react";
import {
  PlusCircle,
  MinusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Tag,
} from "lucide-react";
import ModalForm from "../../components/ModalForm";
import Swal from "sweetalert2";
import {
  useAddTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
  useTransactions,
} from "../../api/queries";

import { useCurrency } from "../../context/CurrencyContext";

import {
  TransactionSummarySkeleton,
  TransactionTableSkeleton,
} from "../../components/skeletons/TransactionSkeleton";

export default function Transactions() {
  const {
    data: transactions,
    isLoading,
    isFetching,
    isInitialLoading,
  } = useTransactions();

  // Use the correct loading state
  const showSkeleton =
    isInitialLoading ||
    (isLoading && (!transactions || transactions.length === 0));

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");
  const { symbol } = useCurrency();

  // ================= Mutations =================
  const addTransactionMutation = useAddTransaction();

  const updateTransactionMutation = useUpdateTransaction();

  const deleteTransactionMutation = useDeleteTransaction();

  // ================= Modal Handlers =================
  const handleOpenModal = (type, transaction = null) => {
    setModalType(type);

    if (transaction) {
      const txId = transaction.transaction_id;
      setEditingId(txId);

      setFormData({
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description || "",
        transaction_date: transaction.transaction_date,
      });
    } else {
      setEditingId(null);
      setFormData({
        category: "",
        amount: "",
        description: "",
        transac_date: "",
        title: "",
        target_amount: "",
        deadline: "",
      });
    }

    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (payload) => {
    try {
      const txData = {
        type: modalType === "income" ? "income" : "expense",
        category: payload.category,
        amount: Number(payload.amount),
        transaction_date: payload.transaction_date,
        description: payload.description || "",
      };

      if (editingId) {
        await updateTransactionMutation.mutateAsync({
          id: editingId,
          data: txData,
        });

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Transaction updated!",
          confirmButtonColor: "#10B981",
        });
      } else {
        await addTransactionMutation.mutateAsync(txData);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: modalType === "income" ? "Income added!" : "Expense added!",
          confirmButtonColor: "#10B981",
        });
      }

      setModalOpen(false);
    } catch (error) {
      console.error(error);
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

  // ================= Filtered Transactions =================
  const filteredTransactions = (transactions || []).filter((tx) => {
    const typeMatch =
      filterType === "all" ? true : tx.type?.toLowerCase() === filterType;
    const descMatch = tx.description
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
    return typeMatch && descMatch;
  });

  // ================= Totals =================
  const totalIncome = (transactions || [])
    .filter((t) => t.type?.toLowerCase() === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpenses = (transactions || [])
    .filter((t) => t.type?.toLowerCase() === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  if (isLoading && transactions.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
        {/* Page Header Skeleton */}
        <section className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center space-x-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
          </div>
        </section>

        <TransactionSummarySkeleton />
        <TransactionTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
      {/* Page Header */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Receipt className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Transactions
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Manage your income and expenses
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base cursor-pointer"
                onClick={() => handleOpenModal("income")}
              >
                <PlusCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-medium">Add Income</span>
              </button>
              <button
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base cursor-pointer"
                onClick={() => handleOpenModal("expense")}
              >
                <MinusCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-medium">Add Expense</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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
                  {symbol}
                  {totalIncome.toLocaleString()}
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
                <p className="text-lg sm:text-2xl font-bold text-red-500">
                  {symbol}
                  {totalExpenses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group sm:col-span-2 lg:col-span-1">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Net Balance
                </h3>
                <p
                  className={`text-lg sm:text-2xl font-bold ${
                    netBalance >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {symbol}
                  {netBalance.toLocaleString()}
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
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-end gap-4">
            {/* Filter by Type */}
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Filter className="text-white" size={16} />
              </div>
              <div className="min-w-0 flex-1 sm:flex-initial">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Filter by Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all cursor-pointer"
                >
                  <option value="all">All Transactions</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expenses Only</option>
                </select>
              </div>
            </div>

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
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transactions Table - Desktop View */}
      <section className="relative hidden md:block">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
          <div className="p-6 border-b border-green-100/50">
            <h3 className="text-xl font-semibold text-gray-800">
              Transaction History
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? "s" : ""} found
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
                    <th className="py-4 px-6 font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="py-4 px-6 font-semibold text-gray-700 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <div className="flex flex-col items-center space-y-3">
                          <Receipt className="text-gray-300" size={48} />
                          <span className="text-gray-500 font-medium">
                            No transactions found
                          </span>
                          <p className="text-gray-400 text-sm">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const txId = tx.transaction_id;
                      return (
                        <tr
                          key={txId}
                          className="hover:bg-green-50/30 transition-colors border-b border-gray-100/50"
                        >
                          <td className="py-4 px-6 text-gray-700">
                            {tx.transaction_date
                              ? new Date(
                                  tx.transaction_date
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                tx.type?.toLowerCase() === "income"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : tx.type?.toLowerCase() === "expense"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {tx.category || "-"}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                            {tx.description || "-"}
                          </td>
                          <td
                            className={`py-4 px-6 font-bold ${
                              tx.type?.toLowerCase() === "income"
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            <div className="flex items-center space-x-1">
                              {tx.type?.toLowerCase() === "income" ? (
                                <TrendingUp size={16} />
                              ) : (
                                <TrendingDown size={16} />
                              )}
                              <span>
                                {tx.type?.toLowerCase() === "income"
                                  ? "+"
                                  : "-"}{" "}
                                {symbol}
                                {Number(tx.amount || 0).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                tx.type?.toLowerCase() === "income"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {tx.type || "-"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                className="p-2 rounded-lg transition-colors
               text-blue-500 hover:text-blue-700 hover:bg-blue-50
               disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed cursor-pointer"
                                disabled={!tx.transaction_id}
                                onClick={() =>
                                  handleOpenModal(tx.type?.toLowerCase(), tx)
                                }
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                className="p-2 rounded-lg transition-colors
               text-red-500 hover:text-red-700 hover:bg-red-50
               disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed cursor-pointer"
                                disabled={!tx.transaction_id}
                                onClick={() => handleDelete(tx.transaction_id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Transactions Cards - Mobile View */}
      <section className="relative md:hidden">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
          <div className="p-4 border-b border-green-100/50">
            <h3 className="text-lg font-semibold text-gray-800">
              Transaction History
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="flex flex-col items-center space-y-3">
                  <Receipt className="text-gray-300" size={48} />
                  <span className="text-gray-500 font-medium">
                    No transactions found
                  </span>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTransactions.map((tx) => {
                  const txId = tx.id || tx._id || tx.transaction_id;
                  return (
                    <div
                      key={txId}
                      className="p-4 hover:bg-green-50/30 transition-colors"
                    >
                      <div className="flex items-start justify-between space-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                tx.type?.toLowerCase() === "income"
                                  ? "bg-green-100"
                                  : "bg-red-100"
                              }`}
                            >
                              {tx.type?.toLowerCase() === "income" ? (
                                <TrendingUp
                                  size={14}
                                  className="text-green-600"
                                />
                              ) : (
                                <TrendingDown
                                  size={14}
                                  className="text-red-500"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {tx.description || "No description"}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    tx.type?.toLowerCase() === "income"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {tx.type || "Unknown"}
                                </span>
                                {tx.category && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    <Tag size={10} className="mr-1" />
                                    {tx.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Calendar size={12} />
                              <span>
                                {tx.transaction_date
                                  ? new Date(
                                      tx.transaction_date
                                    ).toLocaleDateString()
                                  : "No date"}
                              </span>
                            </div>
                            <div
                              className={`text-lg font-bold ${
                                tx.type?.toLowerCase() === "income"
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {tx.type?.toLowerCase() === "income" ? "+" : "-"}
                              {symbol}
                              {Number(tx.amount || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-1 flex-shrink-0">
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              tx.transaction_id
                                ? "text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                : "text-gray-400 cursor-not-allowed bg-gray-100"
                            }`}
                            disabled={!tx.transaction_id}
                            onClick={() =>
                              handleOpenModal(tx.type?.toLowerCase(), tx)
                            }
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              tx.transaction_id
                                ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                                : "text-gray-400 cursor-not-allowed bg-gray-100"
                            }`}
                            disabled={!tx.transaction_id}
                            onClick={() => handleDelete(tx.transaction_id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal Form */}
      <ModalForm
        isOpen={modalOpen}
        type={modalType}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
