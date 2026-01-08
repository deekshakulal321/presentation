import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  User2,
  Stethoscope,
  LogOut,
  Home,
  Shield,
  Ambulance,
  Brain,
} from "lucide-react";

export default function AdminPanel() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [reports, setReports] = useState([]);

  // 🧩 Load all data from localStorage
  useEffect(() => {
    const allUsers = [];
    const allDoctors = [];
    for (let key in localStorage) {
      if (key.startsWith("swiftcareUser_")) {
        const user = JSON.parse(localStorage.getItem(key));
        if (user.role === "doctor") allDoctors.push(user);
        else if (user.role === "user") allUsers.push(user);
      }
    }
    const allReports = JSON.parse(localStorage.getItem("reports")) || [];
    setUsers(allUsers);
    setDoctors(allDoctors);
    setReports(allReports);
  }, []);

  // 🩺 Count data
  const stats = [
    { title: "Total Doctors", count: doctors.length, icon: Stethoscope, color: "from-teal-400 to-green-400" },
    { title: "Total Users", count: users.length, icon: User2, color: "from-blue-400 to-cyan-400" },
    { title: "AI Reports", count: reports.length, icon: Brain, color: "from-purple-400 to-pink-400" },
    { title: "Ambulances", count: 0, icon: Ambulance, color: "from-yellow-400 to-orange-400" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#3a506b] text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,#00b4d8_0%,transparent_70%)] opacity-40"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl flex justify-between items-center px-6 py-6">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 flex items-center gap-2">
          <Shield className="w-7 h-7 text-cyan-300" />
          Admin Dashboard — SwiftCare
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-md hover:scale-105 transition-all duration-300"
          >
            <Home className="w-4 h-4" /> Home
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium shadow-md hover:scale-105 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {/* Overview Stats */}
      <section className="relative z-10 w-full max-w-6xl grid sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 mt-4">
        {stats.map((s, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl shadow-md bg-gradient-to-r ${s.color} text-white flex flex-col items-center justify-center`}
          >
            <s.icon className="w-8 h-8 mb-2 opacity-90" />
            <h3 className="text-lg font-semibold">{s.title}</h3>
            <p className="text-2xl font-bold mt-2">{s.count}</p>
          </div>
        ))}
      </section>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-6xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 mt-8 mb-10">
        <h2 className="text-2xl font-bold mb-6 text-cyan-300">
          🩺 Registered Doctors
        </h2>

        {doctors.length === 0 ? (
          <p className="text-gray-300 text-center py-8">No doctors registered yet.</p>
        ) : (
          <table className="w-full text-left border-collapse text-sm md:text-base mb-10">
            <thead>
              <tr className="text-cyan-200 border-b border-white/20">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Specialization</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d, i) => (
                <tr key={i} className="border-b border-white/10 hover:bg-white/10 transition">
                  <td className="p-3 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-300" />
                    {d.name || "N/A"}
                  </td>
                  <td className="p-3">{d.email}</td>
                  <td className="p-3">{d.specialization || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* User Table */}
        <h2 className="text-2xl font-bold mb-6 text-blue-300">👤 Registered Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-300 text-center py-8">No users found.</p>
        ) : (
          <table className="w-full text-left border-collapse text-sm md:text-base">
            <thead>
              <tr className="text-blue-200 border-b border-white/20">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr
                  key={index}
                  className="border-b border-white/10 hover:bg-white/10 transition"
                >
                  <td className="p-3 flex items-center gap-2">
                    <User2 className="w-4 h-4 text-cyan-300" />
                    {u.name || "N/A"}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.number || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 pb-6">
        SwiftCare Admin — Manage doctors, patients & system performance.
      </footer>
    </div>
  );
}
