import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { Mail, Lock, User, Phone, MapPin } from "lucide-react";

export default function UserLogin() {
  const navigate = useNavigate();
  const { loginUser, registerUser } = useAuth(); 

  const [isSignup, setIsSignup] = useState(false);
  const [location, setLocation] = useState("");
  const [locationReady, setLocationReady] = useState(false);
  const [error, setError] = useState("");
  
  const [isLocationAutoSet, setIsLocationAutoSet] = useState(false);

  const [form, setForm] = useState({
    name: "",
    number: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 🌍 THE FIX: Run location detection IMMEDIATELY on component load
  useEffect(() => {
    const detectLocation = () => {
      // If the user already typed a manual location (like Udupi) in this session, don't overwrite it
      const manualType = sessionStorage.getItem("location_type");
      if (manualType === "manual" && location.length > 0) return;

      if (!navigator.geolocation) {
        console.warn("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // If the user has already started typing manually while the GPS was loading, ABORT the auto-set
          if (location.length > 0 && !isLocationAutoSet) return;

          const { latitude, longitude } = pos.coords;
          const detectedLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          setLocation(detectedLocation);
          setLocationReady(true);
          setIsLocationAutoSet(true); 
          
          // Pre-emptively store so the Dashboard is ready
          sessionStorage.setItem("swift_location", detectedLocation);
          sessionStorage.setItem("location_type", "auto");
        },
        (err) => {
          console.warn("GPS Access Denied or Timeout");
          setIsLocationAutoSet(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    };

    detectLocation();
    // We only trigger this on initial mount and if the user toggles signup mode
  }, [isSignup]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "number") {
      const digitsOnly = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, number: digitsOnly.slice(0, 10) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualLocation = (e) => {
    const val = e.target.value;
    setLocation(val);
    setLocationReady(val.trim().length > 2); 
    setIsLocationAutoSet(false); 
    // Flag this as a manual entry to prevent Dashboard GPS overwrite
    sessionStorage.setItem("location_type", "manual");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim();

    if (!email || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    if (!locationReady || !location.trim()) {
        setError("Pickup location is required.");
        return;
    }

    if (isSignup) {
      if (!form.name || !form.number || !form.confirmPassword) {
        setError("Please fill all fields.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      try {
        await registerUser(email, form.password, form.name, form.number, "user");
      } catch (err) {
        setError(err.message || "Registration failed.");
        return;
      }
    }

    const loginResult = loginUser(email, form.password);

    if (!loginResult.success) {
      setError(loginResult.message || "Incorrect email or password!");
      return;
    }

    // 🎯 FINAL SYNC: Ensure the typed "Udupi" is pushed to storage before navigating
    const finalLocation = location.trim();
    sessionStorage.setItem("swift_location", finalLocation);
    localStorage.setItem("swift_location", finalLocation);

    if (!isLocationAutoSet) {
        sessionStorage.setItem("location_type", "manual");
    }

    // Role-based Navigation
    const role = loginResult.role;
    if (role === "user") navigate("/dashboard");
    else if (role === "doctor") navigate("/doctor-dashboard");
    else if (role === "driver") navigate("/driver");
    else if (role === "admin") navigate("/admin-panel");
    else navigate("/");
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#3a506b] text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#00b4d8_0%,transparent_60%)] opacity-40"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#6fffe9_0%,transparent_70%)] opacity-40"></div>

      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-8 text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-400 drop-shadow-[0_0_10px_#00ffff] hover:scale-105 transition-all duration-300"
      >
        SwiftCare 🚑
      </button>

      <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden w-[90%] max-w-5xl">
        <div className="md:w-1/2 bg-gradient-to-br from-blue-900/40 to-sky-700/40 flex items-center justify-center p-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
            alt="Ambulance"
            className="w-[75%] max-w-md drop-shadow-[0_0_30px_#00ffff90]"
          />
        </div>

        <div className="md:w-1/2 p-10 md:p-12 flex flex-col justify-center bg-white/5 backdrop-blur-xl">
          <h2 className="text-3xl font-extrabold mb-3 text-center text-white">
            {isSignup ? "Create Patient Account" : "SwiftCare Login"}
          </h2>
          <p className="text-center text-gray-300 mb-8">
            {isSignup
              ? "Join SwiftCare for instant emergency assistance."
              : "Login to access your dashboard and active calls."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-cyan-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/80 focus:ring-2 focus:ring-cyan-400 outline-none"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-cyan-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="number"
                    placeholder="Mobile Number"
                    value={form.number}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/80 focus:ring-2 focus:ring-cyan-400 outline-none"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-cyan-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/80 focus:ring-2 focus:ring-cyan-400 outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-cyan-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/80 focus:ring-2 focus:ring-cyan-400 outline-none"
              />
            </div>

            {isSignup && (
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-cyan-400 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/80 focus:ring-2 focus:ring-cyan-400 outline-none"
                />
              </div>
            )}

            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-cyan-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pickup Location (e.g. Udupi)"
                value={location}
                onChange={handleManualLocation}
                disabled={isLocationAutoSet && isSignup} 
                className={`w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 text-white placeholder-white/80 focus:ring-2 focus:ring-cyan-400 outline-none transition-all ${
                  isLocationAutoSet && isSignup
                    ? "bg-gray-600/40 cursor-not-allowed opacity-70"
                    : "bg-white/10"
                }`}
              />
              {isLocationAutoSet && (
                 <button 
                  type="button"
                  onClick={() => {setIsLocationAutoSet(false); setLocation("");}}
                  className="absolute right-3 top-3 text-[10px] bg-cyan-600 px-2 py-1 rounded-md"
                 >
                  Edit
                 </button>
              )}
            </div>

            {error && (
              <p className="text-center text-sm text-red-400 bg-red-900/20 py-2 rounded-xl border border-red-500/30">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-3 py-3 rounded-xl font-semibold shadow-[0_0_20px_rgba(0,255,255,0.3)] bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:scale-105 transition-all duration-300 active:scale-95"
            >
              {isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="text-sm text-cyan-300 hover:text-white transition-colors"
            >
              {isSignup
                ? "Already have an account? Login here"
                : "Need an account? Register as Patient"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}