import apiService from "./apiService";
import { Navigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

// Common JSON Headers
const BASE_HEADERS = {
  "Content-Type": "application/json",
  "x-company-id":
    process.env.REACT_APP_COMPANY_ID ||
    "b371538c-c504-11f0-9e3e-3c5282470eb6",
};

/*------------------------------ LOGIN (EXEC / ADMIN / TL) ------------------------------*/
export const loginUser = async (email, password, role) => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({ email, password, role }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
};

/*------------------------------ MANAGER LOGIN ------------------------------*/
export const loginManager = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/manager/login`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
};

/*------------------------------ HR LOGIN ------------------------------*/
export const loginHr = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/hr/login`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
};

/*------------------------------ MANAGER LOGOUT ------------------------------*/
export const logoutManager = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/manager/logout`, {
    method: "POST",
    headers: {
      ...BASE_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Logout failed");
  return data;
};

/*------------------------------ HR LOGOUT ------------------------------*/
export const logoutHr = async () => {
  const res = await fetch(`${API_BASE_URL}/hr/logout`, {
    method: "POST",
    headers: BASE_HEADERS,
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Logout failed");
  return data;
};

/*------------------------------ SIGNUP ------------------------------*/
export const signupUser = async (username, email, password, role) => {
  const res = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({ username, email, password, role }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signup failed");

  return data;
};

/*------------------------------ FORGOT PASSWORD ------------------------------*/
export const forgotPassword = async (email) => {
  try {
    const res = await apiService.post("/forgot-password", { email });
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to send reset link!"
    );
  }
};

/*------------------------------ RESET PASSWORD ------------------------------*/
export const resetPassword = async (token, newPassword) => {
  try {
    const res = await apiService.post("/reset-password", {
      token,
      newPassword,
    });
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to reset password!"
    );
  }
};

/*------------------------------ LOGOUT (EXEC/ADMIN/TL) ------------------------------*/
export const logoutUser = async () => {
  try {
    const response = await apiService.post("/logout");

    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Logout failed");
  }
};

/*------------------------------ AUTH HELPERS ------------------------------*/
export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};

/*------------------------------ PRIVATE ROUTE (FIXED) ------------------------------*/

export const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // 🛑 FIXED: ALWAYS redirect unauthenticated users to a VALID login route
  // earlier it was "/login" which caused Vercel blank screen
  if (!token || !user?.role) {
    return <Navigate to="/admin/login" replace />;
  }

  const role = user.role.toLowerCase();

  if (!allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }

  return children;
};

/*------------------------------ PUBLIC ROUTE ------------------------------*/
export const PublicRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token || !user?.role) return children;

  const role = user.role.toLowerCase();

  return <Navigate to={`/${role}`} replace />;
};
