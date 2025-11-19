import React from "react";
import { FaBars } from "react-icons/fa";
import AdminCalendar from "../admin/AdminCalendar";

const Header = () => {
  const toggleSidebar = () => {
    const isExpanded = document.body.classList.contains("sidebar-expanded");
    document.body.classList.toggle("sidebar-expanded", !isExpanded);
    document.body.classList.toggle("sidebar-collapsed", isExpanded);

    localStorage.setItem("adminSidebarExpanded", (!isExpanded).toString());
    window.dispatchEvent(new Event("sidebarToggle"));
  };
  const user = JSON.parse(localStorage.getItem("user"));
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "";
  return (
    <>
      <header className="header">
        <div className="header-left">
          <FaBars className="sidebar-toggle-btn" onClick={toggleSidebar} />
          <div>
            {/* ✅ Updated heading with role */}
            <h1 className="manager-dashboard-title">
              {roleLabel} Dashboard
            </h1>
            <div className="title-accent-line"></div>
          </div>
        </div>

        <div className="header-right">
          <AdminCalendar />
        </div>
      </header>

      <style>{`

        .title-accent-line {
          height: 3px;
          width: 0;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
          border-radius: 2px;
          margin-top: 0.5rem;
          animation: lineExpand 2s ease-out forwards;
        }

        @keyframes lineExpand {
          to {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
