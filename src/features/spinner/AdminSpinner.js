import React from "react";
import "../../styles/admin-spinner.css";

const AdminSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="admin-spinner-overlay">
      <div className="admin-spinner-container">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p className="admin-spinner-text">{text}</p>
    </div>
  );
};

export default AdminSpinner;
