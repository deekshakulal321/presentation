import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function ReportHistory({ patientEmail }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);

  // 🩺 Load reports for patient or logged-in user
  useEffect(() => {
    let key = "";

    if (patientEmail) {
      // Doctor viewing a specific patient's reports
      key = `reports_${patientEmail}`;
    } else if (user?.email) {
      // Patient viewing own reports
      key = `reports_${user.email}`;
    }

    if (key) {
      const storedReports = JSON.parse(localStorage.getItem(key)) || [];
      setReports(storedReports);
    }
  }, [patientEmail, user]);

  // 🔹 Smart back navigation
  const handleBack = () => {
    if (user?.role === "doctor") navigate("/doctor-dashboard");
    else navigate("/dashboard");
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
      <h1 className="text-2xl font-bold text-teal-600">
        🧾 Report History
      </h1>

      {reports.length === 0 ? (
        <p className="text-gray-500">No reports available yet.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <h3 className="font-semibold text-gray-700">
                Report #{index + 1}
              </h3>

              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {report.date}
              </p>

              <pre className="text-xs text-gray-700 mt-2 whitespace-pre-wrap">
                {report.content}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleBack}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-600 transition"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

