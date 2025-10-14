import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Laravel API base
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor → add token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handle expired/unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Unauthorized! Token may have expired.");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      // window.location.href = "/login"; // uncomment to auto-redirect
    }
    return Promise.reject(error);
  }
);

export default api;

/* -------------------------
   API Helper Functions
   ------------------------- */

// --- Fetch Data ---
export const fetchProfile = () => api.get("/profile");

export const fetchTransactions = () => api.get("/dashboard/transactions");

export const fetchBudgets = () => api.get("/dashboard/budgets");

export const fetchGoals = () => api.get("/dashboard/savings-goals");

export const fetchReports = () => api.get("/dashboard/reports");

// --- Adding Data ---
export const addTransaction = (txData) =>
  api.post("/dashboard/transactions", {
    type: txData.type?.toLowerCase() === "income" ? "Income" : "Expense",
    category: txData.category,
    amount: Number(txData.amount),
    transaction_date: txData.transaction_date,
    description: txData.description || "",
  });

export const addBudget = (budgetData) =>
  api.post("/dashboard/budgets", {
    category: budgetData.category,
    amount: Number(budgetData.amount),
    start_date: budgetData.start_date,
    end_date: budgetData.end_date,
    description: budgetData.description || "",
  });

export const addGoal = (goalData) =>
  api.post("/dashboard/savings-goals", {
    title: goalData.title,
    target_amount: Number(goalData.target_amount),
    deadline: goalData.deadline || null,
    description: goalData.description,
  });

export const addExpenseToBudget = (data) =>
  api.post(`/dashboard/budgets/${data.budget_id}/add-expense`, {
    title: data.title,
    amount: Number(data.amount),
    description: data.description || "",
  });

export const addContribution = (data) =>
  api.post(`/dashboard/goals/${data.goal_id}/add-contribution`, {
    amount: Number(data.amount),
    date: data.date
      ? new Date(data.date).toISOString().split("T")[0]
      : undefined,
  });

// --- Updating Data ---
export const updateTransaction = (id, data) =>
  api.put(`/dashboard/transactions/${id}`, data);

export const updateBudget = (data) =>
  api.put(`/dashboard/budgets/${data.id}`, {
    category: data.category,
    amount: Number(data.amount),
    start_date: data.start_date,
    end_date: data.end_date,
    description: data.description || "", // optional description
  });

export const updateGoal = (id, data) =>
  api.put(`/dashboard/savings-goals/${id}`, {
    title: data.title,
    target_amount: Number(data.target_amount),
    deadline: data.deadline || null,
    description: data.description || null,
  });

// --- Deleting Data ---
export const deleteTransaction = (id) =>
  api.delete(`/dashboard/transactions/${id}`);

export const deleteBudget = (id) => api.delete(`/dashboard/budgets/${id}`);

export const deleteGoal = (id) => api.delete(`/dashboard/savings-goals/${id}`);

export const deleteContribution = (id) =>
  api.delete(`/dashboard/contributions/${id}`);
// --- Reports Data ---

export const generateReport = (data) => api.post("/dashboard/reports", data);

export const changePassword = (passwordData) =>
  api.post("user/change-password", {
    current_password: passwordData.current_password,
    new_password: passwordData.new_password,
    new_password_confirmation: passwordData.new_password_confirmation,
  });

export const updateProfile = (userId, profileData) =>
  api.put(`user/${userId}`, {
    fullName: profileData.fullName,
    email: profileData.email,
  });

export const updateUserCurrency = (data) =>
  api.put("/dashboard/user/currency", data);
