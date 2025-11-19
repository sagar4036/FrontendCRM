import React, { useEffect, useState, useContext } from "react";
import { useApi } from "../../context/ApiContext";
import { ThemeContext } from "../../features/admin/ThemeContext";
import SidebarToggle from "../admin/SidebarToggle";
import "../../styles/leadassign.css";
import { useLoading } from "../../context/LoadingContext";
import AdminSpinner from "../spinner/AdminSpinner";

const ExecutiveAssignments = () => {
  const [leads, setLeads] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [selectedExecutive, setSelectedExecutive] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [expandedLeads, setExpandedLeads] = useState({});
  const [selectedRange, setSelectedRange] = useState("");
  const [leadsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [filterType, setFilterType] = useState("all"); 
  const totalPages = Math.ceil(totalLeads / leadsPerPage);
  const paginatedLeads = leads;
  const [showPagination, setShowPagination] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { isLoading, variant, showLoader, hideLoader } = useLoading();
  const {
    fetchAllClients,
    fetchExecutivesAPI,
  } = useApi();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem("adminSidebarExpanded") === "false"
  );
  const [allClients, setAllClients] = useState([]);

  // Function to format date and time for meeting schedule
  const formatMeetingDateTime = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      
      // Format date (MM/DD/YYYY)
      const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      
      // Format time (12-hour format with AM/PM)
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { date: "Invalid Date", time: "" };
    }
  };

  useEffect(() => {
    const container = document.querySelector(".scrollable-container");
  
    const handleScroll = () => {
      if (!container) return;
      const threshold = 50; // small buffer from bottom
      const isBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
      setShowPagination(isBottom);
    };
  
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
  
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);
  
  useEffect(() => {
    const updateSidebarState = () => {
      const isExpanded = localStorage.getItem("adminSidebarExpanded") === "true";
      setSidebarCollapsed(!isExpanded);
    };
    window.addEventListener("sidebarToggle", updateSidebarState);
    updateSidebarState();
    return () => window.removeEventListener("sidebarToggle", updateSidebarState);
  }, []);

  useEffect(() => {
    const getAllLeads = async () => {
      try {
        showLoader("Loading task management...", "admin");
        const data = await fetchAllClients(); // Make sure this returns { leads: [...] }
        const normalizedLeads = Array.isArray(data) ? data : data.leads || [];
        setLeads(normalizedLeads);
        setAllClients(normalizedLeads); 
        setTotalLeads(data.pagination?.total || normalizedLeads.length);
      } catch (error) {
        console.error("Error fetching leads:", error);
        setLeads([]);
        setAllClients([]); 
        setTotalLeads(0);
      } finally {
        hideLoader();
      }
    };
  
    getAllLeads(); // Call the async function
}, [fetchAllClients, showLoader, hideLoader]);

useEffect(() => {
  const fetchExecutives = async () => {
    try {
      const data = await fetchExecutivesAPI();
      setExecutives(data);
    } catch (error) {
      console.error("❌ Failed to load executives:", error);
    }
  };

  fetchExecutives();
}, [fetchExecutivesAPI]); // ✅ include dependency



  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1); // Reset to first page when filter changes
    setSelectedLeads([]); // Clear selected leads
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleExecutiveChange = (e) => setSelectedExecutive(e.target.value);

  const handleLeadSelection = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(String(leadId))
        ? prev.filter((id) => id !== String(leadId))
        : [...prev, String(leadId)]
    );
  };

  const toggleExpandLead = (leadId) => {
    setExpandedLeads((prev) => ({ ...prev, [leadId]: !prev[leadId] }));
  };

  const toggleSelectAll = () => {
    setSelectedLeads((prev) =>
      prev.length === leads.length ? [] : leads.map((lead) => String(lead.id))
    );
  };

  const handleRangeChange = (e) => {
    const range = e.target.value;
    setSelectedRange(range);
    const [start] = range.split("-").map(Number);
    const newPage = Math.ceil(start / leadsPerPage);
    setCurrentPage(newPage);
  };

  useEffect(() => {
    if (!selectedRange || leads.length === 0) return;

    const [start, end] = selectedRange.split("-").map(Number);
    const startIndex = (currentPage - 1) * leadsPerPage + 1;

    const selectedIds = leads
      .map((lead, idx) => ({ lead, index: startIndex + idx }))
      .filter(({ index }) => index >= start && index <= end)
      .map(({ lead }) => String(lead.id));

    setSelectedLeads(selectedIds);
  }, [leads, selectedRange, currentPage,leadsPerPage]);



  useEffect(() => {
    let filtered = [...allClients];

    // Filter by selected executive if one is chosen
    if (selectedExecutive) {
      const executive = executives.find((exec) => String(exec.id) === selectedExecutive);
      if (executive) {
        filtered = filtered.filter((lead) => lead.assignedToExecutive === executive.username);
      }
    }

    // Apply status filter based on filterType
    switch (filterType) {
      case "converted":
        filtered = filtered.filter((lead) => lead.status === "Converted");
        break;
      case "followup":
        filtered = filtered.filter((lead) => lead.status === "Follow-Up");
        break;
      case "fresh":
        filtered = filtered.filter((lead) => lead.status === "Assigned");
        break;
      case "meeting": {
        filtered = filtered.filter((lead) => lead.status === "Meeting");
        // Filter out leads older than 2 days for Meetings section
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); // June 15, 2025
        filtered = filtered.filter((lead) => {
          const meetingDate = lead.meetingScheduleDate
            ? new Date(lead.meetingScheduleDate)
            : new Date(lead.updatedAt || lead.createdAt); // Fallback to updatedAt or createdAt
          return meetingDate >= twoDaysAgo;
        });
        break;
      }
      case "closed":
        filtered = filtered.filter((lead) => lead.status === "Closed");
        break;
      default:
        // "all" shows all leads for the selected executive (or all leads if no executive is selected)
        break;
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / leadsPerPage);
    const newPage = currentPage > totalPages ? 1 : currentPage;

    const offset = (newPage - 1) * leadsPerPage;
    const paginated = filtered.slice(offset, offset + leadsPerPage);

    setLeads(paginated);
    setTotalLeads(total);
    setCurrentPage(newPage);
  }, [selectedExecutive, filterType, allClients, currentPage, leadsPerPage, executives]);

 
 


  return (
    <div className={`f-lead-content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <SidebarToggle />
    
      <div className="leads-dashboard" data-theme={theme}>
      {isLoading && variant === "admin" && (
        <AdminSpinner text="Loading Lead Assign..." />
      )}
        <div className="Logo">Lead Report</div>
        <div className="taskmanage-header">
          <div className="header-actions">
            <select value={selectedExecutive} onChange={handleExecutiveChange}>
              <option value="">-- Choose Executive --</option>
              {executives.map((exec) => (
                <option key={exec.id} value={String(exec.id)}>
                  {exec.username}
                </option>
              ))}
            </select>

            <select value={selectedRange} onChange={handleRangeChange}>
              <option value="">Default Sorting</option>
              <option value="1-10">1 - 10</option>
              <option value="11-20">11 - 20</option>
              <option value="21-50">21 - 50</option>
              <option value="51-100">51 - 100</option>
            </select>

            
            <div className="lead-filter-buttons">
              {["all", "fresh", "followup", "converted", "closed", "meeting"].map(type => (
                <button
                  key={type}
                  className={`lead-filter-btn ${filterType === type ? "active" : ""}`}
                  onClick={() => handleFilterChange(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} 
                </button>
              ))}
            </div>        
          </div>
        </div>

        <div className="scrollable-container">
          <div className="leads-table">
            <div className="leads-header">
              <input
    type="checkbox"
    checked={selectedLeads.length === leads.length && leads.length > 0}
    onChange={toggleSelectAll}
  />
              <span>All customers ({totalLeads})</span>
              <span className="source-header">Source</span>
              <span className="assign-header">Assigned To</span>
              <span className="assign-date-header">{filterType === "meeting" ? "Meeting Schedule Date" : "Assigned Date"}</span>
              <span></span>
            </div>
            {paginatedLeads.map((lead) => (
              <div key={lead.id} className="lead-row">
                <div className="lead-details">
                  <div className="lead-info-container">
                    <input
                      type="checkbox"
                      className="lead-checkbox"
                      checked={selectedLeads.includes(String(lead.id))}
                      onChange={() => handleLeadSelection(lead.id)}
                    />
                    <span className="container-icon">👤</span>
                    <div className="admin-lead-info">
                      <span>Name: {lead.name}</span>
                      <span>Email: {lead.email}
                        {!expandedLeads[lead.id] && (
                          <button
                            className="see-more-btn-inline"
                            onClick={() => toggleExpandLead(lead.id)}
                          >
                            See more...
                          </button>
                        )}
                      </span>
                      {expandedLeads[lead.id] && (
                        <div>
                          <span>Phone No: {lead.phone}</span>
                          <span>Education: {lead.education || "N/A"}</span>
                          <span>Experience: {lead.experience || "N/A"}</span>
                          <span>State: {lead.state || "N/A"}</span>
                          <span>Country: {lead.country || "N/A"}</span>
                          <span>DOB: {lead.dob || "N/A"}</span>
                          <span>Lead Assign Date: {lead.leadAssignDate || "N/A"}</span>
                          <span>Country Preference: {lead.countryPreference || "N/A"}
                          <button
                          className="see-more-btn-inline"
                          onClick={() => toggleExpandLead(lead.id)}
                        >
                          See less...
                        </button>
                          </span>
                      
                        </div>
                      )}
                    
                    </div>
                  </div>
                  <div className="lead-source">{lead.source || "Unknown"}</div>
                  <div className="lead-assign">{lead.assignedToExecutive || "Unassigned"}</div>
                  <div className="lead-assign-date">
                    {filterType === "meeting" ? (
                      (() => {
                        const dateTime = formatMeetingDateTime(lead.meetingScheduleDate || lead.updatedAt);
                        return (
                          <div className="meeting-datetime">
                            <div className="meeting-date">{dateTime.date}</div>
                            <div className="meeting-time">{dateTime.time}</div>
                          </div>
                        );
                      })()
                    ) : (
                      lead.leadAssignDate || "Unassigned"
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {leads.length > 0 && showPagination && (
              <div className="pagination-controls">
              <button onClick={handlePrev} disabled={currentPage === 1} aria-label="Previous page">
                Prev
              </button>
              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages || totalPages === 0}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveAssignments;
