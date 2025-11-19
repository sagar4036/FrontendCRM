import React, { useState, useEffect } from "react";
import SidebarandNavbar from "../layouts/SidebarandNavbar";
import SettingsLayout from "../features/settings/SettingLayout";
import "../styles/setting.css";

const SettingRoutes = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const styles = {
    settingsPageContainer: {
      display: "flex",
      flexDirection: "column",
      margin: 0,
      padding: 0,
      height: "100vh",
      overflow: "hidden",
    },
    settingsNavbar: {
      height: "60px",
      width: "100%",
      position: "fixed",
      top: 0,
      left: "250px", // Adjust for sidebar
      right: 0,
      zIndex: 1000,
      background: "#fff",
      borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
    },
    settingsMainContent: {
      marginTop: "60px", // height of navbar
      marginLeft: "250px", // width of sidebar
      height: "calc(100vh - 60px)",
      overflowY: "auto",
    },
    settingsMobileHeader: {
      display: "flex",
      alignItems: "center",
      padding: "16px 20px",
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: "70px",
      zIndex: 999,
    },
    sidebarToggleBtn: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      border: "none",
      borderRadius: "12px",
      padding: "12px",
      cursor: "pointer",
      marginRight: "16px",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
    },
    hamburgerLine: {
      display: "block",
      width: "20px",
      height: "2px",
      background: "white",
      margin: "3px 0",
      transition: "all 0.3s ease",
      borderRadius: "2px",
    },
    settingsPageTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#2d3748",
      margin: 0,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    settingsContentWrapper: {
      height: "100%",
      padding: 0,
      margin: 0,
    },
    mobileBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      zIndex: 998,
      backdropFilter: "blur(4px)",
    },
  };

  return (
    <div
      className={`settings-page-container ${isMobile ? "mobile" : "desktop"}`}
      style={styles.settingsPageContainer}
    >
      {/* Navigation Bar */}
      <div className="settings-navbar" style={styles.settingsNavbar}>
        <SidebarandNavbar />
      </div>

      {/* Main Content Area */}
      <div className="settings-main-content" style={styles.settingsMainContent}>
        {/* Mobile Header with Menu Toggle */}
        {isMobile && (
          <div
            className="settings-mobile-header"
            style={styles.settingsMobileHeader}
          >
            <button
              className="sidebar-toggle-btn"
              onClick={toggleSidebar}
              aria-label="Toggle Settings Menu"
              style={styles.sidebarToggleBtn}
            >
              <span className={`hamburger ${sidebarCollapsed ? "" : "active"}`}>
                <span style={styles.hamburgerLine}></span>
                <span style={styles.hamburgerLine}></span>
                <span style={styles.hamburgerLine}></span>
              </span>
            </button>
            <h1
              className="settings-page-title"
              style={styles.settingsPageTitle}
            >
              Settings
            </h1>
          </div>
        )}

        {/* Settings Content with Sidebar State */}
        <div
          className={`settings-content-wrapper ${
            sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
          }`}
          style={styles.settingsContentWrapper}
        >
          <SettingsLayout
            isMobile={isMobile}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="mobile-backdrop"
          onClick={toggleSidebar}
          aria-hidden="true"
          style={styles.mobileBackdrop}
        />
      )}
    </div>
  );
};

export default SettingRoutes;