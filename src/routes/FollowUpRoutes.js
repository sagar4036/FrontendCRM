import React, { useState, useEffect } from "react";
import ClientDetails from "../features/follow-ups/ClientDetails";
import ClientTable from "../features/follow-ups/ClientTable";
import "../styles/followup.css";
import { useLocation } from "react-router-dom";
import { FormControl, MenuItem, Select } from "@mui/material";

const FollowUpRoutes = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "All Follow Ups"
  );
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRating, setSelectedRating] = useState("All");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="follow-app-container">
      {/* <SidebarandNavbar /> */}
      <div className="follow-main-content">
        <h2>Client List</h2>
        <ClientDetails selectedClient={selectedClient} onClose={() => setSelectedClient(null)} />
        <div className="followup-tabs">
          {["All Follow Ups", "Interested", "Not Interested"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
           {/* 🔽 Rating Filter Dropdown */}
           <FormControl
  size="small"
  sx={{
    minWidth: "80px",
    height: "36px",
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      padding: '8px 0',
      height: '36px',
      backgroundColor: '#fff',
      fontSize: '14px',
      '& fieldset': {
        borderColor: '#ccc', // normal border
      },
      '&:hover fieldset': {
        borderColor: '#aaa', // on hover
      },
      '&.Mui-focused fieldset': {
        borderColor: '#ccc', // remove blue border on focus
      },
    },
  }}
>
  <Select
    value={selectedRating}
    onChange={(e) => {
      setSelectedClient(null);
      setSelectedRating(e.target.value);
    }}
    displayEmpty
    notched={false}
    MenuProps={{
      PaperProps: {
        sx: {
          fontSize: "12px",
        },
      },
    }}
  >
    <MenuItem value="All">All</MenuItem>
    <MenuItem value="hot">Hot</MenuItem>
    <MenuItem value="warm">Warm</MenuItem>
    <MenuItem value="cold">Cold</MenuItem>
  </Select>
</FormControl>




        </div>
        <ClientTable filter={activeTab} onSelectClient={setSelectedClient}  
          selectedRating={selectedRating}/>
      </div>
 
    </div>
  );
};

export default FollowUpRoutes;