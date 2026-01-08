import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.jsx";

import LandingPage from "./pages/LandingPage.jsx";
import UserLogin from "./pages/UserLogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import ReportHistory from "./ui/ReportHistory.jsx";
import ChangePasswordPage from "./ui/ChangePasswordPage.jsx";
import Profile from "./ui/Profile.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import DriverDashboard from "./pages/DriverDashboard.jsx";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 🌍 Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/emergency" element={<Dashboard emergencyMode={true} />} />

      {/* 🔒 Protected User Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard emergencyMode={false} />
          </PrivateRoute>
        }
      />

      {/* 🔒 Profile */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            {user?.role === "admin" ? (
              <Navigate to="/admin-panel" />
            ) : (
              <Profile />
            )}
          </PrivateRoute>
        }
      />

      {/* 🔒 Reports */}
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <ReportHistory />
          </PrivateRoute>
        }
      />

      {/* 🔒 Change Password */}
      <Route
        path="/change-password"
        element={
          <PrivateRoute>
            <ChangePasswordPage />
          </PrivateRoute>
        }
      />

      {/* 🔒 Doctor Dashboard */}
      <Route
        path="/doctor-dashboard"
        element={
          <PrivateRoute>
            <DoctorDashboard />
          </PrivateRoute>
        }
      />

      {/* 🔒 Admin Dashboard */}
      <Route
        path="/admin-panel"
        element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        }
      />

      {/* 🔥 DRIVER LOGIN — PROTECTED ROUTE */}
      <Route
        path="/driver"
        element={
          <PrivateRoute>
            {user?.role === "driver" ? (
              <DriverDashboard />
            ) : (
              <Navigate to="/" replace />
            )}
          </PrivateRoute>
        }
      />

      {/* ❗ Unknown routes redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
