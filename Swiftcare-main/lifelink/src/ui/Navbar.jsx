import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { User, LogOut } from "lucide-react";

export default function Navbar({ emergencyMode = false }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur shadow rounded-b-3xl relative z-50">
      {/* 🩺 App Logo */}
      <h1
        className="text-2xl font-bold text-emerald-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        SwiftCare 🚑
      </h1>

      {/* 🧍 Profile Menu (hidden in emergency mode & for admin) */}
      {!emergencyMode && user && user.role !== "admin" && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-full hover:bg-slate-200 transition"
          >
            <User className="w-5 h-5 text-emerald-600" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border z-50">
              {/* 🧍 My Account */}
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-50"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
              >
                🧍 My Account
              </button>

              {/* 🔑 Change Password */}
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-50"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/change-password");
                }}
              >
                🔑 Change Password
              </button>

              {/* 📜 Report History (only for users) */}
              {user.role === "user" && (
                <button
                  className="w-full text-left px-4 py-2 hover:bg-slate-50"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/reports");
                  }}
                >
                  📜 Report History
                </button>
              )}

              {/* 🚪 Logout */}
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-rose-600 border-t"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  navigate("/user/login");
                }}
              >
                <LogOut className="inline w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
