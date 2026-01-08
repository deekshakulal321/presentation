import React, { useState, useEffect } from "react";
import Navbar from "../ui/Navbar.jsx";
import VideoCallStub from "../ui/VideoCallStub.jsx";
import ReportHistory from "../ui/ReportHistory.jsx";
import { MapPinned } from "lucide-react";

export default function DoctorDashboard() {
  const [onDuty, setOnDuty] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  // 🔹 Load pending patient calls from localStorage
  useEffect(() => {
    const storedRequests = JSON.parse(localStorage.getItem("pendingCalls")) || [];
    setPendingRequests(storedRequests);
  }, []);

  // 🔹 Simulate receiving a new request (for testing)
  // (Later this will come from backend or real-time socket)
  const simulateRequest = () => {
    const newRequest = {
      patientEmail: "john.doe@gmail.com",
      patientName: "John Doe",
      aiReports: true,
    };
    const updated = [...pendingRequests, newRequest];
    setPendingRequests(updated);
    localStorage.setItem("pendingCalls", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Doctor Info */}
        <section className="flex flex-col md:flex-row justify-between items-center bg-white rounded-2xl shadow-md p-6">
          <div>
            <h1 className="text-3xl font-bold text-teal-600 mb-2">🩺 Doctor Dashboard</h1>
            <p className="text-gray-600">
              View patient requests, connect via video, and review AI-generated reports.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
            <button
              onClick={() => setOnDuty(!onDuty)}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold text-white transition shadow-lg ${
                onDuty
                  ? "bg-gradient-to-r from-green-500 to-teal-400"
                  : "bg-gradient-to-r from-slate-400 to-slate-600"
              }`}
            >
              <MapPinned className="w-5 h-5" />
              {onDuty ? "🟢 On Duty" : "⚪ Off Duty"}
            </button>

            {/* Only for testing - simulate new patient request */}
            <button
              onClick={simulateRequest}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600"
            >
              ➕ Simulate Patient Request
            </button>
          </div>
        </section>

        {/* Pending Requests List */}
        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Pending Patient Requests
          </h2>

          {pendingRequests.length === 0 ? (
            <p className="text-gray-500">No patient requests yet.</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">{req.patientName}</h3>
                    <p className="text-sm text-gray-500">
                      {req.aiReports ? "AI report available ✅" : "No AI report yet ❌"}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(req)}
                    className="bg-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-600"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Call + Report Viewer */}
        {selectedPatient && (
          <section className="grid md:grid-cols-2 gap-6 mt-10">
            {/* Video Call Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-700 mb-3">
                Video Call with {selectedPatient.patientName}
              </h3>
              <VideoCallStub patient={selectedPatient} />
            </div>

            {/* Report Viewer Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-700 mb-3">
                {selectedPatient.patientName}'s Reports
              </h3>
              <ReportHistory patientEmail={selectedPatient.patientEmail} />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-10 mb-4">
          Doctor Interface — Handle patient calls & review AI reports securely.
        </footer>
      </div>
    </div>
  );
}
