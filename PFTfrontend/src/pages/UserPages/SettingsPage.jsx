import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Settings, Moon, Globe, LogOut } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { useUpdateCurrency } from "../../api/queries";
import { useQueryClient } from "@tanstack/react-query";

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const { currency, changeCurrency } = useCurrency();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { resetCurrency } = useCurrency();
  const { mutate: updateCurrency, isPending } = useUpdateCurrency();

  const handleCurrencyChange = (newCurrency) => {
    // 1. FIX: Call changeCurrency. (The function in CurrencyContext is now clean,
    // without outdated storage writes.)
    changeCurrency(newCurrency);

    // 🗺️ Map currency code to its symbol
    let newSymbol;
    switch (newCurrency) {
      case "PHP":
        newSymbol = "₱";
        break;
      case "USD":
        newSymbol = "$";
        break;
      case "EUR":
        newSymbol = "€";
        break;
      case "GBP":
        newSymbol = "£";
        break;
      default:
        newSymbol = "₱"; // fallback just in case
    }

    // 2. Update backend with the new symbol
    updateCurrency({ currency_symbol: newSymbol });
  };

  const handleLogout = () => {
    // 1. Aggressively remove all possible user/token storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // 2. Clear application state (Context and React Query Cache)
    resetCurrency();
    queryClient.clear();

    // 3. 💥 FIX: Navigate IMMEDIATELY to prevent stale data flashing
    window.location.href = "/login";
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
      {/* Page Header (No Change) */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Settings
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Customize your app preferences and settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-200/30 to-indigo-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <Moon size={18} />
            <span>Preferences</span>
          </h2>

          <div className="space-y-6">
            {/* Currency Setting */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg border border-green-200/50">
              <div className="flex items-center space-x-3">
                <Globe className="text-green-500" size={20} />
                <div>
                  <h3 className="font-medium text-gray-800">Currency</h3>
                  <p className="text-sm text-gray-600">
                    Select your preferred currency
                  </p>
                </div>
              </div>

              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                disabled={isPending}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white disabled:opacity-50 cursor-pointer"
              >
                <option value="PHP">Philippine Peso (₱)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Logout Section (Ignored/Left untouched as requested) */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-200/30 to-red-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-red-100/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <LogOut size={18} />
            <span>Log Out</span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <p className="text-gray-600">
              Ready to log out? You'll need to sign back in to access your
              account.
            </p>
            <Button
              className="bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg transition-all duration-300 w-full sm:w-auto cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" size={16} />
              Log Out
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
