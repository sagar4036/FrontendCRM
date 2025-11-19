import React from "react";
import "../styles/client.css";
import ClientOverview from "../features/client-details/ClientOverview";
import ClientDetailsOverview from "../features/follow-ups/ClientDetailsOverview";
import { Routes, Route, useLocation } from "react-router-dom";
import ProcessClientOverview from "../features/client-details/ProcessClientOverview";
import ProcessClientDetailsOverview from "../features/follow-ups/ProcessClientDetailsOverview";
const ClientRoutes = () => {
  const location = useLocation(); // ✅ import & use the hook properly

  return (
    <div className="client-app-container">
      {/* <SideandNavbar /> */}
      <div className="client-main-content">
        {/* ✅ Only ONE Routes block, properly keyed to force remount */}
        <Routes location={location} key={location.pathname}>
          <Route path=":clientId" element={<ClientOverview />} />
          <Route path=":clientId/details" element={<ClientDetailsOverview />} />
             <Route path="/processperson/:clientId/:id" element={<ProcessClientOverview />} />
                <Route path="/details/:clientId/:id" element={<ProcessClientDetailsOverview />} />
        </Routes>
      </div>
    </div>
  );
};

export default ClientRoutes;