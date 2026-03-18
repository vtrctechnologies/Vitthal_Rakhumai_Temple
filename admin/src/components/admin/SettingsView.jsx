import React, { useState } from "react";
import { Lock, ArrowRight, Mail, Phone } from "lucide-react";
import authAPI from "../../services/api"; // Adjust path
import { Button, InputField } from "../customUi/AdminShared";

const SettingsView = ({ user }) => {
  const [activeSection, setActiveSection] = useState("change");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Change Password Form
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePasswordErrors, setChangePasswordErrors] = useState({});

  // Reset Password Form
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [resetPasswordErrors, setResetPasswordErrors] = useState({});

  // Change Email Form
  const [changeEmailData, setChangeEmailData] = useState({
    newEmail: "",
  });
  const [changeEmailErrors, setChangeEmailErrors] = useState({});

  // Change Phone Form
  const [changePhoneData, setChangePhoneData] = useState({
    newPhone: "",
  });
  const [changePhoneErrors, setChangePhoneErrors] = useState({});

  const validateChangePassword = () => {
    const newErrors = {};
    if (!changePasswordData.currentPassword)
      newErrors.currentPassword = "Current password is required.";
    if (changePasswordData.newPassword.length < 6)
      newErrors.newPassword = "New password must be at least 6 characters.";
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    setChangePasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetPassword = () => {
    const newErrors = {};
    if (resetPasswordData.newPassword.length < 6)
      newErrors.newPassword = "New password must be at least 6 characters.";
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    setResetPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateChangeEmail = () => {
    const newErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!changeEmailData.newEmail) {
      newErrors.newEmail = "New email is required.";
    } else if (!emailRegex.test(changeEmailData.newEmail)) {
      newErrors.newEmail = "Please enter a valid email address.";
    } else if (changeEmailData.newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      newErrors.newEmail = "New email must be different from current email.";
    }
    setChangeEmailErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateChangePhone = () => {
    const newErrors = {};
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    let formattedPhone = changePhoneData.newPhone.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`;
    }
    
    if (!changePhoneData.newPhone) {
      newErrors.newPhone = "New phone number is required.";
    } else if (!phoneRegex.test(formattedPhone)) {
      newErrors.newPhone = "Please enter a valid phone number with country code (e.g., +1234567890).";
    } else if (formattedPhone === user?.phone) {
      newErrors.newPhone = "New phone number must be different from current phone number.";
    }
    setChangePhoneErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validateChangePassword()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await authAPI.changePassword(
        changePasswordData.currentPassword,
        changePasswordData.newPassword
      );
      if (response.status === "success") {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setChangePasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setChangePasswordErrors({});
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to change password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateResetPassword()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await authAPI.resetPassword(
        resetPasswordData.newPassword
      );
      if (response.status === "success") {
        setMessage({ type: "success", text: "Password reset successfully!" });
        setResetPasswordData({
          newPassword: "",
          confirmPassword: "",
        });
        setResetPasswordErrors({});
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to reset password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!validateChangeEmail()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await authAPI.updateEmail(changeEmailData.newEmail);
      if (response.status === "success") {
        setMessage({ type: "success", text: "Email updated successfully! Please refresh the page to see the changes." });
        setChangeEmailData({
          newEmail: "",
        });
        setChangeEmailErrors({});
        // Update user in localStorage if needed
        if (response.data?.admin) {
          const updatedUser = {
            ...user,
            email: response.data.admin.email,
          };
          localStorage.setItem("temple_admin_user", JSON.stringify(updatedUser));
          // Optionally trigger a page refresh or update parent component
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update email.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = async (e) => {
    e.preventDefault();
    if (!validateChangePhone()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Format phone number
      let formattedPhone = changePhoneData.newPhone.trim();
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = `+${formattedPhone}`;
      }

      const response = await authAPI.updatePhone(formattedPhone);
      if (response.status === "success") {
        setMessage({ type: "success", text: "Phone number updated successfully! Please refresh the page to see the changes." });
        setChangePhoneData({
          newPhone: "",
        });
        setChangePhoneErrors({});
        // Update user in localStorage if needed
        if (response.data?.admin) {
          const updatedUser = {
            ...user,
            phone: response.data.admin.phone,
          };
          localStorage.setItem("temple_admin_user", JSON.stringify(updatedUser));
          // Optionally trigger a page refresh or update parent component
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update phone number.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500">
          Manage your account settings and password.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveSection("change");
            setMessage({ type: "", text: "" });
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === "change"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Change Password
        </button>
        <button
          onClick={() => {
            setActiveSection("reset");
            setMessage({ type: "", text: "" });
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === "reset"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Reset Password
        </button>
        <button
          onClick={() => {
            setActiveSection("email");
            setMessage({ type: "", text: "" });
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === "email"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Change Email
        </button>
        <button
          onClick={() => {
            setActiveSection("phone");
            setMessage({ type: "", text: "" });
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === "phone"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Change Phone
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Change Password Form */}
      {activeSection === "change" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Change Password
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your current password and choose a new one.
          </p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <InputField
              label="Current Password"
              placeholder="Enter current password"
              type="password"
              icon={Lock}
              value={changePasswordData.currentPassword}
              onChange={(e) =>
                setChangePasswordData({
                  ...changePasswordData,
                  currentPassword: e.target.value,
                })
              }
              error={changePasswordErrors.currentPassword}
            />
            <InputField
              label="New Password"
              placeholder="Enter new password"
              type="password"
              icon={Lock}
              value={changePasswordData.newPassword}
              onChange={(e) =>
                setChangePasswordData({
                  ...changePasswordData,
                  newPassword: e.target.value,
                })
              }
              error={changePasswordErrors.newPassword}
            />
            <InputField
              label="Confirm New Password"
              placeholder="Confirm new password"
              type="password"
              icon={Lock}
              value={changePasswordData.confirmPassword}
              onChange={(e) =>
                setChangePasswordData({
                  ...changePasswordData,
                  confirmPassword: e.target.value,
                })
              }
              error={changePasswordErrors.confirmPassword}
            />
            <div className="pt-2">
              <Button type="submit" isLoading={loading}>
                Change Password <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reset Password Form */}
      {activeSection === "reset" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Set a new password for your account. You don't need to provide your
            current password.
          </p>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <InputField
              label="New Password"
              placeholder="Enter new password"
              type="password"
              icon={Lock}
              value={resetPasswordData.newPassword}
              onChange={(e) =>
                setResetPasswordData({
                  ...resetPasswordData,
                  newPassword: e.target.value,
                })
              }
              error={resetPasswordErrors.newPassword}
            />
            <InputField
              label="Confirm New Password"
              placeholder="Confirm new password"
              type="password"
              icon={Lock}
              value={resetPasswordData.confirmPassword}
              onChange={(e) =>
                setResetPasswordData({
                  ...resetPasswordData,
                  confirmPassword: e.target.value,
                })
              }
              error={resetPasswordErrors.confirmPassword}
            />
            <div className="pt-2">
              <Button type="submit" isLoading={loading}>
                Reset Password <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Change Email Form */}
      {activeSection === "email" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Change Email Address
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Update your email address. This will be used for login and password recovery.
          </p>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Current Email:</span> {user?.email || "N/A"}
            </p>
          </div>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <InputField
              label="New Email Address"
              placeholder="Enter new email address"
              type="email"
              icon={Mail}
              value={changeEmailData.newEmail}
              onChange={(e) =>
                setChangeEmailData({
                  ...changeEmailData,
                  newEmail: e.target.value,
                })
              }
              error={changeEmailErrors.newEmail}
            />
            <div className="pt-2">
              <Button type="submit" isLoading={loading}>
                Update Email <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Change Phone Form */}
      {activeSection === "phone" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Change Phone Number
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Update your phone number. This will be used for OTP verification via SMS.
          </p>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Current Phone:</span> {user?.phone || "N/A"}
            </p>
          </div>
          <form onSubmit={handleChangePhone} className="space-y-4">
            <InputField
              label="New Phone Number"
              placeholder="+1234567890 (with country code)"
              type="tel"
              icon={Phone}
              value={changePhoneData.newPhone}
              onChange={(e) =>
                setChangePhoneData({
                  ...changePhoneData,
                  newPhone: e.target.value,
                })
              }
              error={changePhoneErrors.newPhone}
            />
            <div className="pt-2">
              <Button type="submit" isLoading={loading}>
                Update Phone <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
