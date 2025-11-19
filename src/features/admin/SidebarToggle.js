
import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
// import "../../styles/SidebarToggle.css";


const SidebarToggle = () => {
  const [isExpanded, setIsExpanded] = useState(
    localStorage.getItem("adminSidebarExpanded") === "true"

  );

  useEffect(() => {
    const handleSidebarToggle = () => {
      const updated = localStorage.getItem("adminSidebarExpanded") === "true";
      setIsExpanded(updated);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () => window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

  const toggleSidebar = () => {
    const updated = !isExpanded;
    document.body.classList.toggle("sidebar-expanded", updated);
    document.body.classList.toggle("sidebar-collapsed", !updated);
    localStorage.setItem("adminSidebarExpanded", updated.toString());
    window.dispatchEvent(new Event("sidebarToggle"));
    setIsExpanded(updated); // update local state
  };

  return (
    <div
      className="custom-sidebar-toggle"
      style={{
        paddingLeft: isExpanded ? "300px" : "100px", // adjust here
        paddingTop: "20px",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1100,
      }}
    >
      <FaBars className="sidebar-toggle-btn" onClick={toggleSidebar} />
    </div>
  );
};

export default SidebarToggle;

