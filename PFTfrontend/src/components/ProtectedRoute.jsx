// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Check both localStorage (rememberMe) and sessionStorage (temporary login)
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    // If no token found, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
}
