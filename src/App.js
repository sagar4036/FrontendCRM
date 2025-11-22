// --- App.js ---

import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./services/auth";

import Login from "./features/authentication/Login";
import Signup from "./features/authentication/Signup";

import LoginMaster from "./features/masteruser/LoginMaster";
import SignupMaster from "./features/masteruser/SignupMaster";
import { PrivateMasterRoute } from "./context/MasterContext";

import ForgotPassword from "./features/authentication/ForgotPassword";
import ResetPassword from "./features/authentication/ResetPassword";

import AdminRoutes from "./routes/AdminRoutes";
import ExecutiveRoutes from "./routes/ExecutiveRoutes";
import ExecutiveFormRoutes from "./routes/ExecutiveFormRoutes";

import ChatBotRoutes from "./routes/ChatBotRoutes";
import LeadAssignRoutes from "./routes/LeadAssignRoute";

import ManagerRoutes from "./routes/ManagerRoutes";
import LoginManager from "./features/authentication/LoginManager";

import TLRoutes from "./routes/TLRoutes";

import LoginHr from "./features/authentication/LoginHr";
import HrRoutes from "./routes/HrRoutes";

import AdminPanelRoutes from "./routes/MonitoringRoutes";
import MasterRoutes from "./routes/MasterRoutes";

import ProcessRoutes from "./routes/ProcessRoutes";
import ClientLogin from "./features/process-client/ClientLogin";
import ClientSignup from "./features/process-client/ClientSignup";
import CustomerLogin from "./features/process-client/CustomerLogin";

import { CustomerPrivateRoute } from "./services/processAuth";
import { ProcessPrivateRoute } from "./services/processAuth";

import SettingsRouteWrapper from "./routes/SettingsRouteWrapper";
import ProcessDashboardRoutes from "./routes/ProcessDashboardRoutes";
import ClientCustomerRoutes from "./routes/ClientCustomer";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { ThemeProvider } from "./features/admin/ThemeContext";
import SessionTimeout from "./features/authentication/SessionTimeout";

const App = () => {
  const location = useLocation();

  const [followUpText, setFollowUpText] = useState(() => {
    return localStorage.getItem("followUpText") || "";
  });

  useEffect(() => {
    localStorage.setItem("followUpText", followUpText);
  }, [followUpText]);

  // BLOCK browser back when logged in
  useEffect(() => {
    const handleBack = () => {
      const token = localStorage.getItem("token");

      if (token) {
        const restricted = [
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/process/client/login",
          "/process/customer/login"
        ];

        if (restricted.includes(window.location.pathname)) {
          window.history.go(1);
        }
      }
    };

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  return (
    <ThemeProvider>
      <SessionTimeout timeout={45 * 60 * 1000} />

      <Routes>
        {/* PUBLIC AUTH ROUTES */}
        <Route path="/admin/login" element={<Login userType="admin" />} />
        <Route path="/admin/signup" element={<Signup userType="admin" />} />

        <Route path="/login" element={<Login userType="executive" />} />
        <Route path="/manager/login" element={<LoginManager userType="Manager" />} />
        <Route path="/hr/login" element={<LoginHr userType="Hr" />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* MASTER */}
        <Route path="/master/loginmaster" element={<LoginMaster />} />
        <Route path="/master/signupmaster" element={<SignupMaster />} />

        {/* PROCESS CLIENT */}
        <Route path="/process/client/login" element={<ClientLogin />} />
        <Route path="/process/client/signup" element={<ClientSignup />} />
        <Route path="/customer/client/login" element={<CustomerLogin />} />

        {/* EXECUTIVE SETTINGS */}
        <Route
          path="/executive/settings/*"
          element={
            <PrivateRoute allowedRoles={["executive"]}>
              <SettingsRouteWrapper />
            </PrivateRoute>
          }
        />

        {/* EXECUTIVE FORM */}
        <Route
          path="/executiveform/*"
          element={
            <PrivateRoute allowedRoles={["executive"]}>
              <ExecutiveFormRoutes />
            </PrivateRoute>
          }
        />

        {/* PRIVATE MASTER ROUTES */}
        <Route
          path="/master/*"
          element={
            <PrivateMasterRoute>
              <MasterRoutes />
            </PrivateMasterRoute>
          }
        />

        {/* MONITORING PANEL */}
        <Route
          path="/monitoring/*"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminPanelRoutes />
            </PrivateRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminRoutes />
            </PrivateRoute>
          }
        />

        {/* EXECUTIVE DASHBOARD */}
        <Route
          path="/executive/*"
          element={
            <PrivateRoute allowedRoles={["executive"]}>
              <ExecutiveRoutes onTextUpdate={setFollowUpText} />
            </PrivateRoute>
          }
        />

        {/* PROCESS PRIVATE */}
        <Route
          path="/process/*"
          element={
            <ProcessPrivateRoute>
              <ProcessRoutes />
            </ProcessPrivateRoute>
          }
        />

        {/* PROCESS DASHBOARD */}
        <Route path="/processperson/*" element={<ProcessDashboardRoutes />} />

        {/* CUSTOMER */}
        <Route
          path="/customer/*"
          element={
            <CustomerPrivateRoute>
              <ClientCustomerRoutes />
            </CustomerPrivateRoute>
          }
        />

        {/* MANAGER */}
        <Route
          path="/manager/*"
          element={
            <PrivateRoute allowedRoles={["manager"]}>
              <ManagerRoutes />
            </PrivateRoute>
          }
        />

        {/* TEAM LEAD */}
        <Route
          path="/team-lead/*"
          element={
            <PrivateRoute allowedRoles={["tl"]}>
              <TLRoutes />
            </PrivateRoute>
          }
        />

        {/* HR */}
        <Route
          path="/hr/*"
          element={
            <PrivateRoute allowedRoles={["hr"]}>
              <HrRoutes />
            </PrivateRoute>
          }
        />

        {/* CHATBOT */}
        <Route
          path="/executive/chatbot/*"
          element={
            <PrivateRoute allowedRoles={["executive"]}>
              <ChatBotRoutes />
            </PrivateRoute>
          }
        />

        {/* LEAD ASSIGN */}
        <Route
          path="/leadassign/*"
          element={
            <PrivateRoute allowedRoles={["admin", "tl"]}>
              <LeadAssignRoutes />
            </PrivateRoute>
          }
        />

        {/* 🔥 DEFAULT ROUTE FIX FOR VERCEL (VERY IMPORTANT) */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
