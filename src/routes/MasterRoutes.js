import React from "react";
import { Routes, Route } from "react-router-dom";
import MasterDash from "../layouts/MasterDash";

const MasterRoutes = () => {
  return (
    <Routes>
        <Route path="/dashboard" element={<MasterDash />} />
    </Routes>
  );
};

export default MasterRoutes;
