import React from "react";

const UnauthorizedAccess = () => {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
    textAlign: "center",
    padding: "20px",
  };

  const iconStyle = {
    fontSize: "48px",
    color: "red",
    marginBottom: "16px",
  };

  const headingStyle = {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "8px",
  };

  const messageStyle = {
    color: "#555",
    maxWidth: "400px",
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>⚠️</div>
      <h2 style={headingStyle}>Access Denied</h2>
      <p style={messageStyle}>
        You don’t have permission to view this page. Please contact your
        administrator to request access.
      </p>
    </div>
  );
};

export default UnauthorizedAccess;