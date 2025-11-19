import React from "react";
import Leads from "../features/close-leads/leads";
import "../styles/closeLeads.css";
import { SearchContext } from "../context/SearchContext";
import { useEffect,useContext } from "react";

const CloseLeadRoutes = () => {
  const { searchQuery, setActivePage } = useContext(SearchContext); 
  useEffect(() => {
    setActivePage("close-leads"); 
  }, [setActivePage]);
  return (
    <div className="close-leads-container">
      {/* <SideandNavbar/> */}
      <div className="close-leads-main">
      <Leads searchQuery={searchQuery}/>
      </div>
    </div>
  );
};

export default CloseLeadRoutes;