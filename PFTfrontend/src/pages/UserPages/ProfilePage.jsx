import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import Swal from "sweetalert2";
import ChangePasswordModal from "../../components/ChangePasswordModal"; // Import the modal
import {
  useChangePassword,
  useUpdateProfile,
  useProfile,
} from "../../api/queries";

const ProfilePage = () => {
  const { data: user } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  const changePasswordMutation = useChangePassword();

  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        profileData: formData,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Profile updated successfully!",
        confirmButtonColor: "#10B981",
      });

      setIsEditing(false);
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          err.response?.data?.message ||
          "Failed to update profile. Please try again.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await changePasswordMutation.mutateAsync(data);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Password changed successfully!",
        confirmButtonColor: "#10B981",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
      {/* Page Header */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="text-white"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Profile
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Manage your account and personal information
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                    </svg>
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Account Settings */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span>Account Settings</span>
          </h2>

          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src="https://picsum.photos/80"
                    alt="Profile"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-green-100"
                  />
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                    <svg
                      width="12"
                      height="12"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 3h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm16 2H4v12h16V5zm-8 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Profile Picture</h3>
                  <p className="text-sm text-gray-600">
                    Update your profile photo
                  </p>
                </div>
              </div>
              <button className="w-full sm:w-auto px-4 py-2 border border-green-200 text-green-700 rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base cursor-pointer">
                Change Photo
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  placeholder="Enter your full name"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 ${
                    !isEditing ? "bg-gray-50 text-gray-600" : "bg-white"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-3.5 text-gray-400"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 ${
                      !isEditing ? "bg-gray-50 text-gray-600" : "bg-white"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-200/30 to-orange-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-100/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <Shield size={18} />
            <span>Security & Privacy</span>
          </h2>

          <div className="space-y-4">
            {/* Password Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg border border-orange-200/50">
              <div className="flex items-center space-x-3">
                <svg
                  className="text-orange-500"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-800">Password</h3>
                  <p className="text-sm text-gray-600">
                    Update your account password for security
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center sm:justify-start bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-lg transition-all duration-300 border-0 px-4 py-2 rounded-lg cursor-pointer"
              >
                <Shield className="mr-2" size={18} />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  );
};

export default ProfilePage;
