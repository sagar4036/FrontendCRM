import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarandNavbar from "../layouts/SidebarandNavbar";
import { useLoading } from "../context/LoadingContext"; // ✅ Import context
import LoadingSpinner from "../features/spinner/LoadingSpinner"; // ✅ Spinner
import "../styles/executive.css";

const ExecutiveLayout = () => {
  const { isLoading, loadingText } = useLoading(); // ✅ Destructure loading state

  return (
    <div className="executive-app-container">
      <SidebarandNavbar />
      
      <div className="executive-main-content">
        {/* ✅ Spinner container with relative position */}
        <div className="dashboard-container" style={{ position: "relative" }}>
          
          {/* ✅ Conditionally show spinner in page area only */}
          {isLoading && <LoadingSpinner text={loadingText || "Loading..."} />}

          <div className="dashboard-main-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveLayout;
