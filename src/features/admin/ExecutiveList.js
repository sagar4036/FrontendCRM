import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useApi } from "../../context/ApiContext";

const ExecutiveList = ({ onSelectExecutive }) => {
  const [executives, setExecutives] = useState([]);
  const { fetchExecutivesAPI, onlineExecutives, fetchOnlineExecutivesData } = useApi();

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const data = await fetchExecutivesAPI();
        setExecutives(data);
      } catch (error) {
        console.error("❌ Error fetching executives:", error);
      }
    };

    fetchExecutives();

    const interval = setInterval(() => {
      fetchOnlineExecutivesData();
    }, 5000); // adjust time if needed

    return () => clearInterval(interval);
  }, [fetchExecutivesAPI,fetchOnlineExecutivesData]);

  const isExecutiveOnline = (execId) => {
    const isOnline =
      Array.isArray(onlineExecutives) &&
      onlineExecutives.some((onlineExec) => onlineExec.id === execId);

    return isOnline;
  };

  return (
    <div className="executive-container">
      <h2 className="executive-title">Executives</h2>
      {executives.length === 0 ? (
        <p className="executive-empty">No executives found</p>
      ) : (
        <ul className="executive-list">
          {executives.map((exec) => (
           <li
           key={exec.id}
           className="executive-item"
           onClick={() => {
             onSelectExecutive(exec);
           }}
           style={{ cursor: "pointer" }}
         >
              <div className="executive-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  className={`status-dot ${isExecutiveOnline(exec.id) ? "online" : "offline"}`}
                ></span>
                <FaUserCircle className="executive-icon" />
                <div className="executive-details">
                  <p className="executive-name">{exec.username}</p>
                </div>
              </div>
              <p className="executive-id">ID: {exec.id}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExecutiveList;
