import React from "react";
import "../styles/closeLeads.css";
import { SearchContext } from "../context/SearchContext";
import { useEffect,useContext } from "react";
import RejectedLeads from "../features/rejected-leads/RejectedLeads";

const RejectedLeadRoutes = () => {
  const { searchQuery, setActivePage } = useContext(SearchContext); 
  useEffect(() => {
    setActivePage("close-leads"); 
  }, [setActivePage]);
  return (
    <div className="close-leads-container">
      {/* <SideandNavbar/> */}
      <div className="close-leads-main">
      <RejectedLeads searchQuery={searchQuery}/>
      </div>
    </div>
  );
};

export default RejectedLeadRoutes;