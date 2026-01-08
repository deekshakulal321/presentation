import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [editable, setEditable] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    number: "",
    photo: null,
  });

  const canEdit = user?.role === "user";
  const canView = user?.role === "user" || user?.role === "doctor";

  // ✅ Load user profile (ALL user info)
  useEffect(() => {
    if (!user?.email) return;

    const key = `profile_${user.email}`;
    const storedProfile = JSON.parse(localStorage.getItem(key));

    if (storedProfile) {
      setProfile(storedProfile);
    } else {
      // First-time profile creation
      const newProfile = {
        name: user.name || "",
        email: user.email,
        number: user.number || "",
        photo: null,
      };
      setProfile(newProfile);
      localStorage.setItem(key, JSON.stringify(newProfile));
    }
  }, [user]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone: only digits, max 10
    if (name === "number") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setProfile((prev) => ({ ...prev, number: digitsOnly }));
      return;
    }

    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle profile photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () =>
      setProfile((prev) => ({ ...prev, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  // ✅ Save ALL user information
  const handleSave = () => {
    if (!profile.name.trim()) {
      alert("❌ Full name is required.");
      return;
    }

    if (!profile.number || profile.number.length !== 10) {
      alert("❌ Phone number must be 10 digits.");
      return;
    }

    if (!user?.email) return;

    const key = `profile_${user.email}`;

    const updatedProfile = {
      ...profile,
      email: user.email, // force correct email
    };

    localStorage.setItem(key, JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    setEditable(false);

    alert("✅ User profile saved successfully!");
  };

  const handleGoBack = () => {
    if (user?.role === "doctor") navigate("/doctor-dashboard");
    else navigate("/dashboard");
  };

  const initialLetter = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "?";

  if (!canView) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#3a506b] text-gray-100">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-xl p-10 w-full max-w-lg border border-white/20">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-cyan-300">
          🧍 SwiftCare User Profile
        </h1>

        {/* Profile Photo */}
        <div className="relative w-36 h-36 mx-auto mb-6">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover border-4 border-cyan-400"
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-cyan-500 flex items-center justify-center text-5xl font-bold">
              {initialLetter}
            </div>
          )}

          {editable && canEdit && (
            <label className="absolute bottom-0 right-0 bg-cyan-600 px-3 py-1 rounded-full text-xs cursor-pointer">
              Change
              <input
                type="file"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          )}
        </div>

        {/* Profile Fields */}
        <div className="space-y-5">
          <InputField
            label="Full Name"
            name="name"
            value={profile.name}
            editable={editable && canEdit}
            onChange={handleChange}
          />
          <InputField
            label="Email"
            name="email"
            value={profile.email}
            disabled
          />
          <InputField
            label="Phone Number"
            name="number"
            value={profile.number}
            editable={editable && canEdit}
            onChange={handleChange}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          {canEdit &&
            (!editable ? (
              <button
                onClick={() => setEditable(true)}
                className="px-6 py-3 bg-amber-500 rounded-xl font-semibold"
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-cyan-500 rounded-xl font-semibold"
              >
                💾 Save Profile
              </button>
            ))}

          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-white/10 rounded-xl"
          >
            🔙 Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

// 🔁 Reusable Input Component
function InputField({ label, name, value, editable, onChange, disabled }) {
  return (
    <div>
      <label className="text-sm text-cyan-300">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || !editable}
        className={`w-full px-4 py-2 mt-1 rounded-xl ${
          editable
            ? "border border-cyan-400 bg-white/5 text-white"
            : "border border-white/10 bg-white/5 text-gray-300"
        }`}
      />
    </div>
  );
}
