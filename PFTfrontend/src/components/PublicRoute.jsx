// src/components/PublicRoute.jsx
import { Navigate } from "react-router-dom"

export default function PublicRoute({ children }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token")

  if (token) {
    // Already logged in → redirect to dashboard
    return <Navigate to="/dashboard" replace />
  }

  return children
}
