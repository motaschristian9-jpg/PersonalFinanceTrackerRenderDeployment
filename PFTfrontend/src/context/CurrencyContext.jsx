import { createContext, useContext, useState, useEffect } from "react";
import { useProfile } from "../api/queries";

const CurrencyContext = createContext();

// CRITICAL FIX: The function getInitialCurrencyState is REMOVED.
// We no longer read from sessionStorage or localStorage on mount to prevent
// stale data contamination from the previous user's session.

export const CurrencyProvider = ({ children }) => {
  const { data: user } = useProfile();

  // ✅ FIX: Initialize state directly to the default PHP/₱.
  // This ensures a clean, default state before the user API data resolves.
  const [currency, setCurrency] = useState("PHP");
  const [symbol, setSymbol] = useState("₱");
  const [currentUserId, setCurrentUserId] = useState(null);

  // --- Helper Functions (Currency/Symbol Mapping) ---
  const getCurrencyFromSymbol = (symbol) => {
    switch (symbol) {
      case "$":
        return "USD";
      case "€":
        return "EUR";
      case "£":
        return "GBP";
      case "₱":
        return "PHP";
      default:
        // Use PHP as a safe fallback
        return "PHP";
    }
  };

  const getSymbolFromCurrency = (currency) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "PHP":
        return "₱";
      default:
        // Use ₱ as a safe fallback
        return "₱";
    }
  };

  // --- Sync currency when user data changes (Source of Truth: API) ---
  useEffect(() => {
    const isNewUser = user?.id && user.id !== currentUserId;
    const isLoggingOut = !user && currentUserId !== null;

    if (isNewUser) {
      // 1. New user logged in or user data just resolved
      setCurrentUserId(user.id);

      // ✅ FIX: Add fallback (|| "₱") in case user.currency_symbol is null/undefined
      const backendSymbol = user.currency_symbol || "₱";
      setSymbol(backendSymbol);
      setCurrency(getCurrencyFromSymbol(backendSymbol));
    } else if (isLoggingOut) {
      // 2. User has logged out (triggered by setting 'user' to null after logout)
      setCurrentUserId(null);
      setCurrency("PHP");
      setSymbol("₱");
    }
    // Dependency on 'user' ensures we react to profile data loading/unloading.
    // Dependency on 'currentUserId' ensures we only run the login logic once per user session.
  }, [user, currentUserId]);

  // --- Handle manual currency change (Triggered by user interaction) ---
  const changeCurrency = (newCurrency) => {
    const newSymbol = getSymbolFromCurrency(newCurrency);
    setCurrency(newCurrency);
    setSymbol(newSymbol);

    // NOTE: The API call to save this change to the backend is expected
    // to be handled in the component that calls changeCurrency (e.g., SettingsPage).
    // The Context itself should not manage persistence to the backend.
  };

  // --- Handle explicit logout/reset ---
  const resetCurrency = () => {
    setCurrency("PHP");
    setSymbol("₱");
    // setCurrentUserId is intentionally NOT reset here, as the useEffect will handle it
    // when 'user' becomes null after a successful queryClient.clear() and navigation.
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, symbol, changeCurrency, resetCurrency }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
