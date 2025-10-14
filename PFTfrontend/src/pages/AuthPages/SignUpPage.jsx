import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../api/api";
import { useGoogleLogin } from "@react-oauth/google";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      return Swal.fire("Error", "All fields are required!", "error");
    }

    if (formData.password !== formData.password_confirmation) {
      return Swal.fire("Error", "Passwords do not match!", "error");
    }

    try {
      await api.post("/register", formData);

      Swal.fire("Success!", "Account created successfully.", "success");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err.response && err.response.data) {
        Swal.fire(
          "Error",
          err.response.data.message || "Registration failed",
          "error"
        );
      } else {
        Swal.fire("Error", "Something went wrong. Try again later.", "error");
      }
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const resUser = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        const userInfo = await resUser.json();

        // Send user info to backend
        const res = await api.post("/auth/google", {
          email: userInfo.email,
          name: userInfo.name,
        });

        localStorage.setItem("token", res.data.token);

        Swal.fire({
          icon: "success",
          title: "Welcome!",
          text: `Hello, ${res.data.user.name}`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Signup Failed",
          text: "Could not sign up with Google. Please try again.",
        });
      }
    },
    onError: (err) => {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: "Please try again.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-green-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/40 to-green-200/30 rounded-full blur-2xl"></div>
      </div>

      {/* Header / Branding */}
      <header className="relative z-10 flex justify-between items-center py-4 px-6 max-w-6xl mx-auto w-full flex-shrink-0">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            MoneyTracker
          </span>
        </Link>
        <Link
          to="/login"
          className="hidden md:block text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium"
        >
          Already have an account?{" "}
          <span className="text-green-600 font-semibold hover:text-green-700">
            Sign In
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 max-w-6xl mx-auto w-full overflow-hidden">
        {/* Left side */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-sm">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-green-200/50 to-green-300/30 rounded-2xl blur opacity-60"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                      Take Control of Your
                      <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        {" "}
                        Finances
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Track income, expenses, and savings effortlessly.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        10K+
                      </div>
                      <div className="text-xs text-gray-500">Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        4.9★
                      </div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Free
                      </div>
                      <div className="text-xs text-gray-500">Forever</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
          <div className="w-full max-w-md my-auto">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6">
                {/* Title */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Get Started Free
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Start tracking your finances in minutes
                  </p>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 text-gray-500 hover:text-green-600 transition-colors duration-200"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-8 text-gray-500 hover:text-green-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm cursor-pointer"
                  >
                    Sign Up
                  </button>
                </form>

                {/* Alternative Sign Up */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-3 text-xs text-gray-500 bg-white">
                      Or
                    </span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  <button
                    onClick={() => loginWithGoogle()}
                    className="w-full bg-white border-2 border-gray-200 hover:border-green-300 text-gray-700 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2 text-sm cursor-pointer"
                  >
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 rounded-full"></div>
                    <span>Continue with Google</span>
                  </button>
                </div>

                {/* Security Note & Mobile Sign In */}
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-center text-xs text-green-700 flex items-center justify-center space-x-1">
                      <span className="text-green-600">🔒</span>
                      <span>Your data is safe and never shared</span>
                    </p>
                  </div>

                  {/* Mobile Sign In Link */}
                  <div className="md:hidden text-center">
                    <Link
                      to="/login"
                      className="text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium text-sm"
                    >
                      Already have an account?{" "}
                      <span className="text-green-600 font-semibold hover:text-green-700">
                        Sign In
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
