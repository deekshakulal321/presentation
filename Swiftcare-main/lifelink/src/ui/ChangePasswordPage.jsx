import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function ChangePasswordPage() {
  const { changePassword, user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSave = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("❌ New passwords do not match!");
      return;
    }

    const result = changePassword(oldPassword, newPassword);
    setMessage(result.message);

    if (result.success) {
      // ✅ Redirect based on role after successful password change
      setTimeout(() => {
        if (user?.role === "doctor") navigate("/doctor-dashboard");
        else if (user?.role === "admin") navigate("/admin-panel");
        else navigate("/dashboard");
      }, 1500);
    }
  };

  // ✅ Role-based Go Back logic
  const handleBack = () => {
    if (user?.role === "doctor") navigate("/doctor-dashboard");
    else if (user?.role === "admin") navigate("/admin-panel");
    else navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-gray-100 bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#3a506b]">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#00b4d8_0%,transparent_70%)] opacity-25"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#6fffe9_0%,transparent_70%)] opacity-25"></div>

      {/* Main Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_0_30px_rgba(0,255,255,0.15)] p-10 w-[90%] max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-400 mb-6 drop-shadow-[0_0_10px_#00ffff90]">
          🔐 Change Password
        </h2>

        <form onSubmit={handleSave} className="space-y-5">
          <input
            type="password"
            placeholder="Enter Old Password"
            className="w-full px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none transition-all"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter New Password"
            className="w-full px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none transition-all"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none transition-all"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {message && (
            <p
              className={`text-sm mt-2 ${
                message.includes("success") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 font-medium shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:scale-105 transition-all duration-300"
            >
              🔙 Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-medium shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:scale-105 transition-all duration-300"
            >
              💾 Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
