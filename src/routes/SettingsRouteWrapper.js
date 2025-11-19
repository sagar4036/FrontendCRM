// SettingsRouteWrapper.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SettingRoutes from "./SettingRoutes";
import MyProfile from "../features/settings/MyProfile";
import Theme from "../features/settings/Theme";
import ChangePassword from "../features/settings/ChangePassword";
import BeepSound from "../features/settings/BeepSound";
import CreateTemplate from "../features/settings/CreateTemplate";
import EmployeeLeave from "../features/settings/EmployeeLeave";

const SettingsRouteWrapper = () => {
  return (
    <Routes>
      <Route path="/" element={<SettingRoutes />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="theme" element={<Theme />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="change-beep" element={<BeepSound />} />
        <Route path="create-template" element={<CreateTemplate />} />
        <Route path="leave" element={<EmployeeLeave />} />

      </Route>
    </Routes>
  );
};

export default SettingsRouteWrapper;
