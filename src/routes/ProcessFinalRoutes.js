import React from "react";
import "../styles/closeLeads.css";
import { SearchContext } from "../context/SearchContext";
import { useEffect,useContext } from "react";
import ProcessLeads from "../features/close-leads/ProcessLeads";

const ProcessFinalRoutes = () => {
  const { searchQuery, setActivePage } = useContext(SearchContext); 
  useEffect(() => {
    setActivePage("close-leads"); 
  }, [setActivePage]);
  return (
    <div className="close-leads-container">
   
      <div className="close-leads-main">
      <ProcessLeads searchQuery={searchQuery}/>
      </div>
    </div>
  );
};

export default ProcessFinalRoutes;