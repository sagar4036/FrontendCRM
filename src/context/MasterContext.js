import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  loginMasterUser,
  signupMasterUser,
  logoutMasterUser,
} from "../services/MasterUser";

// 1. Create Context
const MasterContext = createContext();

// 2. Custom Hook for easy access
export const useMaster = () => useContext(MasterContext);

// 3. Provider Component
export const MasterProvider = ({ children }) => {
  const [masterUser, setMasterUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ---------------------------------------
  // Load session from localStorage on mount
  // ---------------------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("masterUser");
    const token = localStorage.getItem("masterToken");

    if (storedUser && token) {
      setMasterUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // ---------------------------------------
  // Master Login
  // ---------------------------------------
  const login = async (credentials) => {
    const response = await loginMasterUser(credentials);
    const { user, token } = response;

    if (user) {
      localStorage.setItem("masterUser", JSON.stringify(user));
      setMasterUser(user);
    }

    if (token && typeof token === "string" && token.split(".").length === 3) {
      localStorage.setItem("masterToken", token);
    } else {
      console.warn("⚠️ Skipping storage of malformed token:", token);
    }

    return response;
  };

  // ---------------------------------------
  // Master Signup
  // ---------------------------------------
  const signup = async (userData) => {
    const response = await signupMasterUser(userData);
    const { user } = response;

    localStorage.setItem("masterUser", JSON.stringify(user));
    setMasterUser(user);

    return response;
  };

  // ---------------------------------------
  // Master Logout
  // ---------------------------------------
  const logout = async () => {
    try {
      await logoutMasterUser(); // Backend clears session/cookie

      localStorage.removeItem("masterUser");
      localStorage.removeItem("masterToken");

      setMasterUser(null);
      navigate("/master-login");
    } catch (error) {
      console.error("❌ Logout failed:", error);
      alert("Something went wrong during logout.");
    }
  };

  // ---------------------------------------
  // Provider Return
  // ---------------------------------------
  return (
    <MasterContext.Provider
      value={{
        masterUser,
        loading,
        isAuthenticated: !!masterUser,
        login,
        signup,
        logout,
      }}
    >
      {!loading && children}
    </MasterContext.Provider>
  );
};

// 4. Route Guard for Master-only access
export const PrivateMasterRoute = ({ children }) => {
  const { isAuthenticated } = useMaster();
  return isAuthenticated ? children : <Navigate to="/master/loginmaster" replace />;
};
