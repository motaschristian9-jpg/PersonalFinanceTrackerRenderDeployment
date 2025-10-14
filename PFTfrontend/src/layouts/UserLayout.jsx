import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "../context/CurrencyContext";
import Swal from "sweetalert2";

// Add custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
    transition: background 0.2s ease;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #22c55e;
  }
  
  .custom-scrollbar {
    scrollbar-color: #d1d5db transparent;
    scrollbar-width: thin;
  }
`;
import {
  LayoutDashboard,
  List,
  DollarSign,
  CreditCard,
  PieChart,
  Target,
  BarChart2,
  Settings,
  Bell,
  LogOut,
  User,
  Menu,
  ChevronLeft,
} from "lucide-react";

import {
  useBudgets,
  useGoals,
  useProfile,
  useReports,
  useTransactions,
} from "../api/queries";

export default function UserLayout() {
  const queryClient = useQueryClient();
  const { resetCurrency } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  // Inject custom scrollbar styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = scrollbarStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // --- React Query: Fetch data ---
  const { data: user, isLoading: profileLoading } = useProfile();
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: reports, isLoading: reportsLoading } = useReports();

  const loading =
    profileLoading ||
    transactionsLoading ||
    budgetsLoading ||
    goalsLoading ||
    reportsLoading;

  // --- Handle Logout ---
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, log out!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        resetCurrency();
        queryClient.clear();

        Swal.fire({
          icon: "success",
          title: "Logged out!",
          text: "You have been successfully logged out.",
          confirmButtonColor: "#10B981",
        }).then(() => {
          window.location.href = "/login";
        });
      }
    });
  };

  // --- Sidebar toggles ---
  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  // --- Close mobile menu on resize ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Close dropdowns when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Generate notifications ---
  const generatedNotifications = useMemo(() => {
    if (!budgets || !goals || !transactions) return [];
    const result = [];

    budgets.forEach((b) => {
      const spent = transactions
        .filter((t) => t.budget_id === b.budget_id)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const percent = b.amount > 0 ? (spent / b.amount) * 100 : 0;

      if (percent >= 100)
        result.push({
          id: `budget-${b.budget_id}-over`,
          message: `⚠️ You have spent your ${b.category} budget!`,
          type: "error",
        });
      else if (percent >= 80)
        result.push({
          id: `budget-${b.budget_id}-warn`,
          message: `⚠️ You have used ${Math.floor(percent)}% of your ${
            b.category
          } budget.`,
          type: "warning",
        });
    });

    goals.forEach((g) => {
      const current = Array.isArray(g.contributions)
        ? g.contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0)
        : 0;
      const progress =
        g.target_amount > 0 ? (current / g.target_amount) * 100 : 0;

      if (progress >= 100)
        result.push({
          id: `goal-${g.goal_id}-complete`,
          message: `🎉 You've reached your savings goal: ${g.title}!`,
          type: "success",
        });
      else if (progress >= 80)
        result.push({
          id: `goal-${g.goal_id}-high`,
          message: `🎯 You're ${Math.floor(progress)}% of the way to ${
            g.title
          }. Almost there!`,
          type: "info",
        });
      else if (progress >= 50)
        result.push({
          id: `goal-${g.goal_id}-mid`,
          message: `🎯 You've reached 50% of ${g.title}. Keep going!`,
          type: "info",
        });
    });

    return result;
  }, [budgets, goals, transactions]);

  useEffect(() => {
    const changed =
      generatedNotifications.length !== notifications.length ||
      JSON.stringify(generatedNotifications) !== JSON.stringify(notifications);

    if (changed) {
      setNotifications(generatedNotifications);
      setHasUnread(generatedNotifications.length > 0);
    }
  }, [generatedNotifications]);

  // --- Grouped Menu Items ---
  const menuGroups = [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          icon: <LayoutDashboard size={20} />,
          path: "/dashboard",
        },
      ],
    },
    {
      title: "Tracking",
      items: [
        {
          label: "Transactions",
          icon: <List size={20} />,
          path: "/transactions",
        },
        { label: "Income", icon: <DollarSign size={20} />, path: "/income" },
        {
          label: "Expenses",
          icon: <CreditCard size={20} />,
          path: "/expenses",
        },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Budgets", icon: <PieChart size={20} />, path: "/budgets" },
        { label: "Savings", icon: <Target size={20} />, path: "/savings" },
      ],
    },
    {
      title: "Insights",
      items: [
        { label: "Reports", icon: <BarChart2 size={20} />, path: "/reports" },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
      ],
    },
  ];

  // --- Loading Screen ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex items-center justify-center p-4">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-green-300/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/30 to-green-200/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative w-full max-w-sm">
          {/* Main card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-200/40 to-green-300/30 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>

          <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-green-100/60">
            {/* Logo with animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-4xl font-bold">M</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
                MoneyTracker
              </h2>
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                Loading your dashboard
              </p>
            </div>

            {/* Loading animation - Multiple dots */}
            <div className="flex justify-center items-center gap-2 mb-8">
              <div
                className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                  style={{
                    width: "75%",
                    animation: "shimmer 2s infinite",
                  }}
                ></div>
              </div>
            </div>

            {/* Loading message */}
            <p className="text-center text-gray-500 text-xs sm:text-sm">
              Building your path to financial freedom...
            </p>
          </div>
        </div>

        <style>{`
        @keyframes shimmer {
          0%, 100% { width: 30%; opacity: 0.5; }
          50% { width: 100%; opacity: 1; }
        }
      `}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-green-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/30 to-green-200/20 rounded-full blur-2xl"></div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-24"
        } hidden md:block sticky top-0 z-10 h-screen transition-all duration-200 ease-in-out`}
      >
        <div className="h-full bg-white/90 backdrop-blur-sm border-r border-green-100/50 shadow-xl">
          <div className="p-4">
            {/* Logo */}
            <div className="flex items-center justify-between mb-8">
              {sidebarOpen ? (
                <>
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    MoneyTracker
                  </span>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-600 hover:text-green-600 cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-600 hover:text-green-600"
                  >
                    <ChevronLeft size={18} className="rotate-180" />
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Groups */}
            <nav className="space-y-6 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
              {menuGroups.map((group, groupIdx) => (
                <div key={groupIdx}>
                  {sidebarOpen ? (
                    <>
                      <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {group.title}
                      </h3>
                      <div className="space-y-2">
                        {group.items.map((item, itemIdx) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Link
                              key={itemIdx}
                              to={item.path}
                              className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                                isActive
                                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                                  : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                              }`}
                            >
                              {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-700/90"></div>
                              )}
                              <div className="relative z-10 flex items-center space-x-3">
                                <div
                                  className={`${isActive ? "text-white" : ""}`}
                                >
                                  {item.icon}
                                </div>
                                <span
                                  className={`font-medium ${
                                    isActive ? "text-white" : ""
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center py-2">
                        <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      </div>
                      <div className="space-y-2">
                        {group.items.map((item, itemIdx) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Link
                              key={itemIdx}
                              to={item.path}
                              className={`group flex items-center justify-center px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                                isActive
                                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                                  : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                              }`}
                            >
                              {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-700/90"></div>
                              )}
                              <div
                                className={`relative z-10 flex items-center ${
                                  isActive ? "text-white" : ""
                                }`}
                              >
                                {item.icon}
                              </div>
                              <div className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {item.label}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-sm border-r border-green-100/50 shadow-xl transform transition-transform duration-300 ease-in-out z-30 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Mobile Logo */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              MoneyTracker
            </span>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-600 hover:text-green-600"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Mobile Navigation Groups */}
          <nav className="space-y-6 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
            {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.items.map((item, itemIdx) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={itemIdx}
                        to={item.path}
                        onClick={toggleMobileMenu}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                          isActive
                            ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                            : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-700/90"></div>
                        )}
                        <div className="relative z-10 flex items-center space-x-3">
                          <div className={`${isActive ? "text-white" : ""}`}>
                            {item.icon}
                          </div>
                          <span
                            className={`font-medium ${
                              isActive ? "text-white" : ""
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-green-100/50 shadow-sm">
          <div className="flex items-center justify-between px-6 py-1">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-600 hover:text-green-600"
              >
                <Menu size={20} />
              </button>
              {/* Mobile logo */}
              <span className="md:hidden text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                MoneyTracker
              </span>
            </div>

            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setNotificationOpen((prev) => !prev);
                    if (!notificationOpen) setHasUnread(false);
                  }}
                  className="p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-600 hover:text-green-600 relative cursor-pointer"
                >
                  <Bell size={20} />
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm border border-green-100 rounded-xl shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-green-100">
                      <h3 className="font-semibold text-gray-800">
                        Notifications
                      </h3>
                    </div>
                    <div className="p-2">
                      {notifications.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-2xl">🔔</span>
                            </div>
                            <span className="text-sm">No notifications</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 rounded-lg border-l-4 text-sm ${
                                n.type === "error"
                                  ? "bg-red-50 border-red-500 text-red-800"
                                  : n.type === "warning"
                                  ? "bg-yellow-50 border-yellow-500 text-yellow-800"
                                  : n.type === "success"
                                  ? "bg-green-50 border-green-500 text-green-800"
                                  : "bg-blue-50 border-blue-500 text-blue-800"
                              }`}
                            >
                              {n.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 cursor-pointer"
                >
                  <img
                    src="https://picsum.photos/40"
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover shadow-md"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm border border-green-100 rounded-xl shadow-xl py-2 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-green-50 transition-colors duration-200 text-gray-700 hover:text-green-600"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} />
                      <span className="font-medium">Profile Settings</span>
                    </Link>
                    <div className="border-t border-green-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors duration-200 text-red-600 hover:text-red-700 w-full text-left cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span className="font-medium">Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 space-y-6 overflow-auto relative z-10">
          <Outlet context={{ user, transactions, budgets, goals, reports }} />
        </main>

        {/* Footer */}
        <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-green-100/50 py-6 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span>© 2025</span>
              <span className="font-semibold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                MoneyTracker
              </span>
              <span>· All rights reserved</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <span>Follow us:</span>
              <div className="flex space-x-2 text-lg">
                <span className="hover:scale-110 transition-transform cursor-pointer">
                  🌐
                </span>
                <span className="hover:scale-110 transition-transform cursor-pointer">
                  📘
                </span>
                <span className="hover:scale-110 transition-transform cursor-pointer">
                  🐦
                </span>
                <span className="hover:scale-110 transition-transform cursor-pointer">
                  📸
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
