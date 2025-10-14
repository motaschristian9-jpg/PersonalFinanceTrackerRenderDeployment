import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CurrencyProvider } from "./context/CurrencyContext"; // ✅ import the provider

const clientId =
  "974205201861-gsbf234jp3tso8ffdmdi945fft1o0eu8.apps.googleusercontent.com";

// ✅ configure query client with default caching/stale times
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      cacheTime: 1000 * 60 * 30, // 30 minutes in cache
      refetchOnWindowFocus: false, // don’t refetch just because window focused
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          {" "}
          {/* ✅ wrap your app with this */}
          <App />
        </CurrencyProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
