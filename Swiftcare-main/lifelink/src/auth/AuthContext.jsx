import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Check for a tab-specific session
    const activeUserEmail = sessionStorage.getItem("activeUser"); 
    if (activeUserEmail) {
      const storedUser = JSON.parse(
        localStorage.getItem(`swiftcareUser_${activeUserEmail}`)
      );
      if (storedUser) setUser(storedUser);
    }

    // --- Preload Static Accounts for Demo ---
    const preload = (email, data) => {
      if (!localStorage.getItem(`swiftcareUser_${email}`)) {
        localStorage.setItem(`swiftcareUser_${email}`, JSON.stringify(data));
      }
    };

    preload("admin@swiftcare.com", { email: "admin@swiftcare.com", password: "admin123", role: "admin", name: "System Admin" });
    preload("dr.john@swiftcare.com", { email: "dr.john@swiftcare.com", password: "swift@123", role: "doctor", name: "Dr. John Doe" });
    preload("driver1@swiftcare.com", { email: "driver1@swiftcare.com", password: "driver123", role: "driver", name: "Ambulance Driver 1", number: "8792088231" });
    preload("driver2@swiftcare.com", { email: "driver2@swiftcare.com", password: "driver123", role: "driver", name: "Ambulance Driver 2", number: "8792088232" });

  }, []);

  // --- AUTH FUNCTIONS ---
  
  const loginUser = (email, password) => {
    const storedUser = JSON.parse(localStorage.getItem(`swiftcareUser_${email}`));

    if (storedUser && storedUser.password === password) {
      // Set session for this specific window/tab
      sessionStorage.setItem("activeUser", email);
      
      // 🎯 THE FIX: Clear any stale location in this session so new entry works
      sessionStorage.removeItem("swift_location");
      sessionStorage.removeItem("location_type");
      
      setUser(storedUser);
      return { success: true, role: storedUser.role, user: storedUser };
    }
    return { success: false, message: "Incorrect email or password!" };
  };

  // 🎯 THE DB FIX: Changed to async to save to MongoDB
  const registerUser = async (email, password, name, number, role = "user") => {
    try {
      // 1. Save to MongoDB via your Backend API
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        email, 
        password, 
        name, 
        number, 
        role
      });

      if (res.data.success) {
        const newUser = { email, password, name, number, role };
        
        // 2. Local persistence for performance
        localStorage.setItem(`swiftcareUser_${email}`, JSON.stringify(newUser));
        
        // 3. Tab-specific session isolation
        sessionStorage.setItem("activeUser", email);
        sessionStorage.removeItem("swift_location");
        
        setUser(newUser);
      }
    } catch (err) {
      // Fallback for offline/demo if backend is not yet configured for /register
      console.warn("Backend registration failed, using local fallback for demo.");
      const newUser = { email, password, name, number, role };
      localStorage.setItem(`swiftcareUser_${email}`, JSON.stringify(newUser));
      sessionStorage.setItem("activeUser", email);
      setUser(newUser);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("activeUser");
    sessionStorage.removeItem("swift_location"); 
    sessionStorage.removeItem("location_type");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loginUser, 
        registerUser, 
        logout, 
        token: user?.email 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}