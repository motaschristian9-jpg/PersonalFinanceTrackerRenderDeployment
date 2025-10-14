import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api"; // your api.js

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your registered email.",
        confirmButtonColor: "#10B981",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/forgot-password", { email });

      setLoading(false);

      Swal.fire({
        icon: "success",
        title: "Link Sent!",
        text: response.data.message,
        confirmButtonColor: "#10B981",
      });

      setEmail(""); // Clear input
    } catch (error) {
      setLoading(false);

      // Check if Laravel returned validation errors
      const errors = error.response?.data?.errors;
      const message = errors
        ? Object.values(errors).flat().join("\n")
        : error.response?.data?.message || "Something went wrong. Try again.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
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
                    <span className="text-2xl">🔐</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                      Password
                      <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        {" "}
                        Recovery
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Don't worry! It happens to everyone. We'll help you get
                      back into your account safely.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Secure
                      </div>
                      <div className="text-xs text-gray-500">Process</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Fast
                      </div>
                      <div className="text-xs text-gray-500">Reset</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Safe
                      </div>
                      <div className="text-xs text-gray-500">Email</div>
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
                    Forgot Your Password?
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Enter your registered email address and we'll send you a
                    link to reset your password.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-2.5 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                {/* Help Information */}
                <div className="mt-6 space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="space-y-2 text-xs text-blue-700">
                      <p className="flex items-center space-x-1">
                        <span>💡</span>
                        <span>
                          Check your spam/junk folder if you don't see the email
                        </span>
                      </p>
                      <p className="flex items-center space-x-1">
                        <span>⏰</span>
                        <span>
                          Reset links expire in 15 minutes for security
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-center text-xs text-green-700 flex items-center justify-center space-x-1">
                      <span className="text-green-600">🔒</span>
                      <span>
                        We'll never share your email or personal information
                      </span>
                    </p>
                  </div>
                </div>

                {/* Alternative Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-center text-xs text-gray-500 mb-3">
                    Still having trouble?
                  </p>
                  <div className="flex justify-center space-x-4 text-xs">
                    <a
                      href="/contact"
                      className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                    >
                      Contact Support
                    </a>
                    <span className="text-gray-300">|</span>
                    <a
                      href="/signup"
                      className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                    >
                      Create New Account
                    </a>
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
