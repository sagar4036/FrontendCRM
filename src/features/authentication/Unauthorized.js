import React from 'react';
import { useNavigate } from 'react-router-dom';

function Unauthorized() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  return (
    <div className="unauthorized-container">
      <h1>Unauthorized Access</h1>
      <p>You don't have permission to access this page.</p>
      <button onClick={() => {
        const role = userRole;
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "executive") {
          navigate("/executive");
        } else {
          navigate("/user");
        }
      }}>Go to your Dashboard</button>
    </div>
  );
}

export default Unauthorized;