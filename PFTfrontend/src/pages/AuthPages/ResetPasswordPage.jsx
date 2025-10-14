import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api"; // your api.js

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      Swal.fire({
        icon: "error",
        title: "Invalid Link",
        text: "Missing token or email. Please request a new password reset.",
        confirmButtonColor: "#10B981",
      }).then(() => navigate("/forgot-password"));
    }
  }, [token, email, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please fill in both password fields.",
        confirmButtonColor: "#10B981",
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Passwords do not match.",
        confirmButtonColor: "#10B981",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      setLoading(false);

      Swal.fire({
        icon: "success",
        title: "Password Reset!",
        text: response.data.message,
        confirmButtonColor: "#10B981",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "Something went wrong. Try again.",
        confirmButtonColor: "#10B981",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-green-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/40 to-green-200/30 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center py-4 px-6 max-w-6xl mx-auto w-full flex-shrink-0">
        <a href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            MoneyTracker
          </span>
        </a>
        <Link
          to="/login"
          className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200">
            ←
          </span>
          <span>Back to Login</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 max-w-6xl mx-auto w-full overflow-hidden">
        {/* Left side - Help Section */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-sm">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-green-200/50 to-green-300/30 rounded-2xl blur opacity-60"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                      Create New
                      <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        {" "}
                        Password
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      You're almost done! Create a strong new password to secure
                      your account and continue managing your finances safely.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Strong
                      </div>
                      <div className="text-xs text-gray-500">Security</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Quick
                      </div>
                      <div className="text-xs text-gray-500">Setup</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Protected
                      </div>
                      <div className="text-xs text-gray-500">Account</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-md my-auto">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 lg:p-8">
                {/* Mobile Back Link */}
                <div className="md:hidden mb-4">
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium group text-sm"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform duration-200">
                      ←
                    </span>
                    <span>Back to Login</span>
                  </Link>
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Password Reset
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Create New Password
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Enter your new password below to update your account
                    password and regain access.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-2.5 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                  >
                    {loading && (
                      <svg
                        className="animate-spin h-4 w-4 text-white mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                    )}
                    {loading ? "Updating..." : "Reset Password"}
                  </button>
                </form>

                {/* Help Information */}
                <div className="mt-6 space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="space-y-2 text-xs text-blue-700">
                      <p className="flex items-center space-x-1">
                        <span>🔑</span>
                        <span>
                          Use at least 8 characters with a mix of letters and
                          numbers
                        </span>
                      </p>
                      <p className="flex items-center space-x-1">
                        <span>💪</span>
                        <span>
                          Include special characters for stronger security
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-center text-xs text-green-700 flex items-center justify-center space-x-1">
                      <span className="text-green-600">🛡️</span>
                      <span>
                        Your password is encrypted and stored securely
                      </span>
                    </p>
                  </div>
                </div>

                {/* Alternative Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-center text-xs text-gray-500 mb-3">
                    Need help with your account?
                  </p>
                  <div className="flex justify-center space-x-4 text-xs">
                    <a
                      href="/contact"
                      className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                    >
                      Contact Support
                    </a>
                    <span className="text-gray-300">|</span>
                    <Link
                      to="/forgot-password"
                      className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                    >
                      Request New Link
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex-shrink-0 py-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-center space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-500 hover:text-green-600 transition-colors duration-200"
            >
              Help Center
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-green-600 transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-green-600 transition-colors duration-200"
            >
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
