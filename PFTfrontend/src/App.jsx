import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignUpPage from "./pages/AuthPages/SignUpPage";
import LoginPage from "./pages/AuthPages/LoginPage";
import ForgotPasswordPage from "./pages/AuthPages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/AuthPages/ResetPasswordPage";
import Dashboard from "./pages/UserPages/DashboardPage";
import Transactions from "./pages/UserPages/TransactionsPage";
import Income from "./pages/UserPages/IncomePage";
import Expenses from "./pages/UserPages/ExpensesPage";
import Budget from "./pages/UserPages/BudgetPage";
import Savings from "./pages/UserPages/SavingsPage";
import Reports from "./pages/UserPages/ReportsPage";
import Settings from "./pages/UserPages/SettingsPage";
import Profile from "./pages/UserPages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import UserLayout from "./layouts/UserLayout";

function App() {
  const publicRoutes = [
    { path: "/", element: <Landing /> },
    { path: "/signup", element: <SignUpPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/reset-password", element: <ResetPasswordPage /> },
  ];

  const protectedRoutes = [
    { path: "dashboard", element: <Dashboard /> },
    { path: "transactions", element: <Transactions /> },
    { path: "income", element: <Income /> },
    { path: "expenses", element: <Expenses /> },
    { path: "budgets", element: <Budget /> },
    { path: "savings", element: <Savings /> },
    { path: "reports", element: <Reports /> },
    { path: "settings", element: <Settings /> },
    { path: "profile", element: <Profile /> },
  ];

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<PublicRoute>{element}</PublicRoute>}
          />
        ))}

        {/* Protected Routes (with layout) */}
        <Route
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          {protectedRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
