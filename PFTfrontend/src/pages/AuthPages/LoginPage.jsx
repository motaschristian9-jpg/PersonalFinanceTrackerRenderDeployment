import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import api from "../../api/api";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter both email and password.",
        confirmButtonColor: "#10B981",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        "/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.token) {
        setLoading(false);

        // Choose storage based on rememberMe
        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem("token", response.data.token);
        storage.setItem("user", JSON.stringify(response.data.user));

        // Optional: store rememberMe flag in localStorage if you need it later
        localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

        await Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${response.data.user?.name || "User"} 😊`,
          confirmButtonColor: "#10B981",
        });

        navigate("/dashboard");
      } else {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: response.data.message || "Invalid credentials",
          confirmButtonColor: "#10B981",
        });
      }
    } catch (err) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#10B981",
      });
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const resUser = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        const userInfo = await resUser.json();
        const res = await api.post("/auth/google/login", {
          email: userInfo.email,
        });

        // ✅ Remember Me logic
        if (rememberMe) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else {
          sessionStorage.setItem("token", res.data.token);
          sessionStorage.setItem("user", JSON.stringify(res.data.user));
        }

        Swal.fire({
          icon: "success",
          title: "Welcome back!",
          text: `Hello, ${res.data.user.name}`,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => navigate("/dashboard"));
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text:
            err.response?.data?.message ||
            "Could not log in with Google. Please try again.",
        });
      }
    },
    onError: () =>
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: "Please try again.",
      }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-green-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/40 to-green-200/30 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
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
          to="/signup"
          className="hidden md:block text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium"
        >
          New here?{" "}
          <span className="text-green-600 font-semibold hover:text-green-700">
            Create Account
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 max-w-6xl mx-auto w-full overflow-hidden">
        {/* Left side - Welcome Section */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-sm">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-green-200/50 to-green-300/30 rounded-2xl blur opacity-60"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl">👋</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                      Welcome Back to
                      <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        {" "}
                        MoneyTracker
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Continue your financial journey and stay on top of your
                      goals.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Secure
                      </div>
                      <div className="text-xs text-gray-500">Login</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Fast
                      </div>
                      <div className="text-xs text-gray-500">Access</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Safe
                      </div>
                      <div className="text-xs text-gray-500">Data</div>
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
                {/* Title */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Welcome Back
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Sign In to Your Account
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Log in to track your income, expenses, and savings.
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-green-600 transition-colors duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-600">Remember Me</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full flex justify-center items-center py-2.5 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>

                {/* Google Login */}
                <div className="mt-4">
                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-3 text-xs text-gray-500 bg-white">
                      or
                    </span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  <button
                    onClick={() => loginWithGoogle()}
                    className="mt-3 w-full bg-white border-2 border-gray-200 hover:border-green-300 text-gray-700 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2 text-sm cursor-pointer"
                  >
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 rounded-full"></div>
                    <span>Sign in with Google</span>
                  </button>
                </div>

                {/* Footer Links & Security */}
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-center text-xs text-green-700 flex items-center justify-center space-x-1">
                      <span className="text-green-600">🔒</span>
                      <span>
                        We value your privacy. Your data is secure with us.
                      </span>
                    </p>
                  </div>

                  {/* Mobile Create Account Link */}
                  <div className="md:hidden text-center">
                    <Link
                      to="/signup"
                      className="text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium text-sm"
                    >
                      New here?{" "}
                      <span className="text-green-600 font-semibold hover:text-green-700">
                        Create Account
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
