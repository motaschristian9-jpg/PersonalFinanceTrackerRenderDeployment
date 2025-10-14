import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { X, Loader2, Lock, Eye, EyeOff, Shield } from "lucide-react";

export default function ChangePasswordModal({ isOpen, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordStrength, setPasswordStrength] = useState("");

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswords({ current: false, new: false, confirm: false });
    setPasswordStrength("");
    onClose();
  };

  // ✅ Check password strength dynamically
  const getPasswordStrength = (password) => {
    if (!password) return "";
    if (password.length < 8) return "weak";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return "medium";
    if (
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    )
      return "strong";
    return "weak";
  };

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.newPassword));
  }, [formData.newPassword]);

  // Check if all required fields are filled
  const isFormValid =
    formData.currentPassword.trim() &&
    formData.newPassword.trim() &&
    formData.confirmPassword.trim() &&
    formData.newPassword === formData.confirmPassword &&
    formData.newPassword.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !formData.currentPassword ||
        !formData.newPassword ||
        !formData.confirmPassword
      ) {
        throw new Error("All fields are required");
      }

      if (formData.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("New passwords do not match");
      }

      if (formData.currentPassword === formData.newPassword) {
        throw new Error("New password must be different from current password");
      }

      await onSubmit({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        new_password_confirmation: formData.confirmPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Password Changed!",
        text: "Your password has been successfully updated.",
        confirmButtonColor: "#4F46E5",
      });

      handleClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join("\n")
          : err.message || "Something went wrong. Please try again.");

      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: errorMessage,
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const strengthColors = {
    weak: "text-red-500",
    medium: "text-yellow-500",
    strong: "text-green-600",
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center p-4"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-200/30 to-indigo-300/20 rounded-2xl blur opacity-40"></div>

        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-indigo-100/50 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-gradient-to-r from-indigo-200/30 to-indigo-300/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Change Password
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Update your account password
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Enter current password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* Password strength indicator */}
                {formData.newPassword && (
                  <p
                    className={`text-xs mt-1 ${strengthColors[passwordStrength]}`}
                  >
                    Strength: {passwordStrength}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {formData.confirmPassword &&
                  formData.newPassword !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold mt-6 transition-all duration-200 ${
                  isFormValid && !loading
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-90 cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed opacity-50"
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
