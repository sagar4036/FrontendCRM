import React, { useState, useEffect,useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../features/admin/Header";
import Summary from "../features/admin/Summary";
import DealFunnel from "../features/admin/DealFunnel";
import RevenueChart from "../features/admin/RevenueChart";
import ProfitChart from "../features/admin/ProfitChart";
import Meetings from "../features/admin/Meetings";
import LeadGraph from "../features/admin/LeadGraph";
import Activity from "../features/admin/Activity";
import "../styles/admin.css";
import ExecutiveList from "../features/admin/ExecutiveList";
import { useApi } from "../context/ApiContext";
import RequirePermission from '../features/admin-settings/RequirePermission'
import HrSidebar from "./HrSidebar";
import HrNavbar from "./HrNavbar";
const HrLayout = () => {
    const { topExecutive, fetchExecutives, fetchExecutivesAPI } = useApi();
    const location = useLocation();
    const [executives, setExecutives] = useState([]);
    const [selectedExecutive, setSelectedExecutive] = useState(null);
    const [selectedExecutiveId, setSelectedExecutiveId] = useState("all");
  
  
const fetchExecutivesList = useCallback(async () => {
  try {
    const data = await fetchExecutivesAPI();
    setExecutives(data);
  } catch (error) {
    console.error("❌ Error fetching executives:", error);
  }
}, [fetchExecutivesAPI]);

    useEffect(() => {
      localStorage.setItem("adminSidebarExpanded", "false");
      window.dispatchEvent(new Event("sidebarToggle"));
      fetchExecutives();
      fetchExecutivesList();
    }, [fetchExecutives,fetchExecutivesList]);
    
    const currentExecutive = selectedExecutive || topExecutive;
    const isDashboard = location.pathname === "/hr";
  
    const handleExecutiveChange = (e) => {
      const selectedId = e.target.value;
      setSelectedExecutiveId(selectedId);
      const exec = executives.find((ex) => ex.id === parseInt(selectedId));
      setSelectedExecutive(selectedId === "all" ? null : exec || null);
    };
  

  return (
    <div className="admin-dashboard-container">
      <HrSidebar className="admin-sidebar" />
      <main className="admin-main-content">
        <HrNavbar />
        {isDashboard ? (
          <RequirePermission requiredKey="dashboard">
           <div className="dashboard-wrapper">
            <Header />
            <Summary />

            {/* Selectors Section */}
            <div className="dashboard-selectors">
              <div className="selector-group">
                <label htmlFor="executive-select" className="selector-label">
                  Executive
                </label>
                <select
                  id="executive-select"
                  value={selectedExecutiveId}
                  onChange={handleExecutiveChange}
                  className="dashboard-select"
                >
                  <option value="all">All Executives</option>
                  {executives.map((exec) => (
                    <option key={exec.id} value={exec.id}>
                      {exec.username} (ID: {exec.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="charts">
              <div className="chart-row">
                <DealFunnel />
                <Activity
                  selectedExecutiveId={selectedExecutiveId === "all" ? null : currentExecutive?.id}
                  executiveName={selectedExecutiveId === "all" ? "All Executives" : currentExecutive?.username}
                />
              </div>
              <div className="chart-row">
                <LeadGraph
                  selectedExecutiveId={selectedExecutiveId === "all" ? null : currentExecutive?.id}
                  executiveName={selectedExecutiveId === "all" ? "All Executives" : currentExecutive?.username}
                />
                <ExecutiveList onSelectExecutive={setSelectedExecutive} />
              </div>
            </div>
            <div className="revenue-executive-container">
              <RevenueChart />
            </div>
            <div className="additional-section">
              <ProfitChart />
              <Meetings selectedExecutiveId={selectedExecutiveId} />
            </div>
          </div>
          </RequirePermission>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default HrLayout;