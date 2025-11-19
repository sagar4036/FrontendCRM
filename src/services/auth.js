import apiService from "./apiService";
import { Navigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Shared headers
const BASE_HEADERS = {
  "Content-Type": "application/json",
  "x-company-id": "0aa80c0b-0999-4d79-8980-e945b4ea700d",
};

/*------------------------------LOGIN (fetch)---------------------------*/
export const loginUser = async (email, password,role) => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({ email, password ,role}),
  });

  if (!res.ok) {
    

    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }

  return await res.json();
};
export const loginManager = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/manager/login`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {

    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }

  return await res.json();
};

// ✅ Logout for manager
export const logoutManager = async () => {
  const token = localStorage.getItem("token"); // get token from storage

  const res = await fetch(`${API_BASE_URL}/manager/logout`, {
    method: "POST",
    credentials: "include", // ensures cookie (like manager_token) is sent
    headers: {
      ...BASE_HEADERS,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Logout failed");
  }

  return await res.json();
};

export const loginHr = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/hr/login`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }

  return await res.json();
};
export const logoutHr = async () => {
  const res = await fetch(`${API_BASE_URL}/hr/logout`, {
    method: "POST",
    credentials: "include", // ensures cookie (manager_token) is sent
    headers: BASE_HEADERS,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Logout failed");
  }

  return await res.json();
};
/*------------------------------SIGNUP (fetch)---------------------------*/
export const signupUser = async (username, email, password, role) => {
  const res = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({ username, email, password, role }),
  });

  const errorBody = await res.json();
  if (!res.ok) {
    console.error("Signup API error details:", errorBody);
    throw new Error(errorBody.message || "Signup failed");
  }

  return errorBody;
};

/*------------------------------FORGOT PASSWORD---------------------------*/
export const forgotPassword = async (email) => {
  try {
    const response = await apiService.post(
      "/forgot-password",
      { email },
      { headers: BASE_HEADERS }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to send reset link!");
  }
};

/*------------------------------RESET PASSWORD---------------------------*/
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiService.post(
      "/reset-password",
      { token, newPassword },
      { headers: BASE_HEADERS }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to reset password!");
  }
};

/*------------------------------LOGOUT---------------------------*/
export const logoutUser = async (executiveName) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiService.post(
      "/logout",
      {
        executiveName, // Now included in the request body
      },
      {
        headers: {
          ...BASE_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    console.error("Error in logoutUser:", error);
    throw error;
  }
};

 //Add this to services/auth.js
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return Boolean(token);
};

/*------------------------------AUTH HELPERS---------------------------*/
export const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role.toLowerCase();

  if (!allowedRoles.includes(role)) {
    const fallback = `/${role}`; // e.g., /manager
    return <Navigate to={fallback} replace />;
  }

  return children;
};
/*-------------------------------PUBLIC ROUTES-----------------*/
export const PublicRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const currentPath = window.location.pathname;

  // If no token, allow access to public routes
  if (!token || !user?.role) return children;

  const role = user.role;

  // Prevent role-based access to wrong route
  if (role === "admin" && !currentPath.startsWith("/admin")) {
    return <Navigate to="/admin" replace />;
  }

  if (role === "executive" && !currentPath.startsWith("/executive")) {
    return <Navigate to="/executive" replace />;
  }

  // If the current path already matches the role, block public route access
  return <Navigate to={currentPath} replace />;
};
