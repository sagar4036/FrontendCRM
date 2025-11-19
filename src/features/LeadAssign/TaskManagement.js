

import React, { useEffect, useState, useContext,useCallback } from "react";
import { Alert, soundManager } from "../modal/alert";
import { useApi } from "../../context/ApiContext";
import { ThemeContext } from "../../features/admin/ThemeContext";
import SidebarToggle from "../admin/SidebarToggle";
import "../../styles/leadassign.css";
import "../../styles/alert.css";
import { useLoading } from "../../context/LoadingContext";
import AdminSpinner from "../spinner/AdminSpinner";
import { useProcessService } from "../../context/ProcessServiceContext";

const TaskManagement = () => {
  const [leads, setLeads] = useState([]);
  const { getAllProcessPersons, createProcesstoConverted } = useProcessService();
  const [executives, setExecutives] = useState([]);
  const [selectedExecutive, setSelectedExecutive] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [expandedLeads, setExpandedLeads] = useState({});
  const [selectedRange, setSelectedRange] = useState("");
  const [leadsPerPage, setLeadsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("executive");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [processPersons, setProcessPersons] = useState([]);
  const totalPages = Math.ceil(totalLeads / leadsPerPage);
  const paginatedLeads = leads;
  const [showPagination, setShowPagination] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { isLoading, variant, showLoader, hideLoader } = useLoading();
  const {
    fetchAllClients,
    reassignLead,
    fetchExecutivesAPI,
    assignLeadAPI,
    createFreshLeadAPI,
    createLeadAPI,
    updateClientLead,
    deleteClientLead,
    getAllConverted,triggerDashboardRefresh
  } = useApi();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem("adminSidebarExpanded") === "false"
  );
  const [allClients, setAllClients] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // Utility to generate unique ID for alerts
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Function to show alerts
  const showAlert = (message, type = "info", title = "", duration = 5000, confirm = null) => {
    const id = generateId();
    setAlerts((prev) => [
      ...prev,
      { id, message, type, title: title || type.charAt(0).toUpperCase() + type.slice(1), duration, confirm }
    ]);
    soundManager.playSound(type); // Play sound for the alert type
    if (duration) {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      }, duration);
    }
  };

  // Function to close an alert
  const closeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  useEffect(() => {
    const container = document.querySelector(".scrollable-container");
  
    const handleScroll = () => {
      if (!container) return;
      const threshold = 50;
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

const fetchExecutives = useCallback(async () => {
  try {
    const data = await fetchExecutivesAPI();
    setExecutives(data);
  } catch (error) {
    console.error("❌ Failed to load executives:", error);
  }
}, [fetchExecutivesAPI]); 

  useEffect(() => {
    fetchExecutives();
  }, [fetchExecutives]);

const getAllConvertedClients = useCallback(async () => {
  try {
    showLoader("Loading task management...", "admin");
    const data = await getAllConverted();
    const normalizedLeads = Array.isArray(data)
      ? data
      : (data.data || []).map((lead) => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          education: lead.education || "",
          experience: lead.experience || "",
          state: lead.state || "",
          country: lead.country || "",
          dob: lead.dob || "",
          leadAssignDate: lead.leadAssignDate || "",
          countryPreference: lead.countryPreference || "",
          assignedToExecutive: lead.assignedTo || "",
          status: "Converted",
        }));

    const sortedLeads = [...normalizedLeads].sort(
      (a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id)
    );

    setLeads(sortedLeads);
    setAllClients(sortedLeads);
    setTotalLeads(data.pagination?.total || sortedLeads.length);
  } catch (error) {
    console.error("Error fetching converted clients:", error);
    setLeads([]);
    setAllClients([]);
    setTotalLeads(0);
  } finally {
    hideLoader();
  }
}, [getAllConverted, showLoader, hideLoader]); // stable dependencies


const getAllLeads = useCallback(async () => {
  try {
    showLoader("Loading task management...", "admin");
    const data = await fetchAllClients();
    const normalizedLeads = Array.isArray(data) ? data : data.leads || [];
    const sortedLeads = [...normalizedLeads].sort(
      (a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id)
    );
    setLeads(sortedLeads);
    setAllClients(sortedLeads);
    setTotalLeads(data.pagination?.total || sortedLeads.length);
  } catch (error) {
    console.error("Error fetching leads:", error);
    setLeads([]);
    setAllClients([]);
    setTotalLeads(0);
  } finally {
    hideLoader();
  }
}, [fetchAllClients, showLoader, hideLoader]);

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
    setSelectedLeads([]);
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

  const assignLeads = async () => {
    const isExecutiveView = viewMode === "executive";
    const selectedTargetId = isExecutiveView ? selectedExecutive : selectedProcess;

    if (!selectedTargetId) {
      showAlert(`Please select a ${isExecutiveView ? "executive" : "process person"}.`, "warning");
      return;
    }

    if (selectedLeads.length === 0) {
      showAlert("Please select at least one lead.", "warning");
      return;
    }

    const targetList = isExecutiveView ? executives : processPersons;
    const target = targetList.find((item) => String(item.id) === selectedTargetId);

    if (!target || (!target.username && !target.fullName)) {
      showAlert(`Invalid ${isExecutiveView ? "executive" : "process"} selected.`, "warning");
      return;
    }

    const targetName = target.username || target.fullName;

    let successCount = 0;
    let failCount = 0;

    for (const leadId of selectedLeads) {
      const lead = allClients.find((l) => String(l.id) === leadId);
      if (!lead) {
        failCount++;
        continue;
      }

      const clientLeadId = lead.id;
      const phone = String(lead.phone).replace(/[eE]+([0-9]+)/gi, "");

      const leadPayload = {
        name: lead.name,
        email: lead.email || "default@example.com",
        phone,
        source: lead.source || "Unknown",
        clientLeadId: Number(clientLeadId),
        assignedToExecutive: targetName,
      };

      try {
        let finalLeadId = leadId;

        if (!lead.assignedToExecutive) {
          const createdLead = await createLeadAPI(leadPayload);
          if (!createdLead?.id) throw new Error("Lead creation failed");

          finalLeadId = createdLead.clientLeadId;
          await assignLeadAPI(Number(finalLeadId), targetName);
          const freshLeadPayload = {
            leadId: createdLead.id,
            name: createdLead.name,
            email: createdLead.email,
            phone: String(createdLead.phone),
            assignedTo: targetName,
            assignedToId: target.id,
            assignDate: new Date().toISOString(),
          };

          await createFreshLeadAPI(freshLeadPayload);
        } else {
          await reassignLead(lead.id, targetName);
        }
        triggerDashboardRefresh(); 
        successCount++;
      } catch (err) {
        console.error(`❌ Error processing lead ID ${leadId}:`, err);
        failCount++;
      }
    }

    try {
      showLoader("Refreshing leads...", "admin");
      const refreshedData = await fetchAllClients();
      const refreshedLeads = Array.isArray(refreshedData)
        ? refreshedData
        : refreshedData.leads || [];
      const sortedLeads = [...refreshedLeads].sort((a, b) => {
        return new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id);
      });
      setAllClients(sortedLeads);
      setCurrentPage(1);
      setFilterType((prev) => prev);
    } catch (fetchErr) {
      console.error("❌ Failed to refresh data after assignment:", fetchErr);
    } finally {
      hideLoader();
    }

    setSelectedLeads([]);
    setSelectedExecutive("");
    setSelectedProcess("");

    if (successCount > 0 && failCount === 0) {
      showAlert("Leads assigned successfully.", "success");
    } else if (successCount > 0 && failCount > 0) {
      showAlert(`${successCount} lead(s) assigned, ${failCount} failed. Check console.`, "warning");
    } else {
      showAlert("All lead assignments failed.", "error");
    }
  };

useEffect(() => {
  let filtered = [...allClients];

  switch (filterType) {
    case "unassigned":
      filtered = filtered.filter((lead) => !lead.assignedToExecutive);
      break;
    case "converted":
      filtered = filtered.filter((lead) => lead.status === "Converted");
      break;
    case "new":
      filtered = filtered.filter((lead) => lead.status === "New");
      break;
    case "followup":
      filtered = filtered.filter((lead) => lead.status === "Follow-Up");
      break;
    case "fresh":
      filtered = filtered.filter((lead) => lead.status === "Assigned");
      break;
    case "meeting":
      filtered = filtered.filter((lead) => lead.status === "Meeting");
      break;
    case "closed":
      filtered = filtered.filter((lead) => lead.status === "Closed");
      break;
    default:
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
}, [filterType, allClients, currentPage, leadsPerPage]);

  const handleEditClick = (lead) => {
    setEditingLead({ ...lead });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingLead(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingLead) return;
    try {
      await updateClientLead(editingLead.id, editingLead);
      const updatedLeads = leads.map((lead) =>
        lead.id === editingLead.id ? { ...lead, ...editingLead } : lead
      );
      setLeads(updatedLeads);
      setAllClients(
        allClients.map((lead) =>
          lead.id === editingLead.id ? { ...lead, ...editingLead } : lead
        )
      );
      showAlert("Lead updated successfully.", "success");
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error updating lead:", error);
      showAlert("Failed to update lead.", "error");
    }
  };

  const handleDeleteClick = async (leadId) => {
    const confirmDelete = () => {
      deleteClientLead(leadId)
        .then(() => {
          const updatedLeads = leads.filter((lead) => lead.id !== leadId);
          setLeads(updatedLeads);
          setAllClients(allClients.filter((lead) => lead.id !== leadId));
          setTotalLeads(totalLeads - 1);
          showAlert("Lead deleted successfully.", "success");
        })
        .then(() => {
          const updatedLeads = leads.filter((lead) => lead.id !== leadId);
          setLeads(updatedLeads);
          setAllClients(allClients.filter((lead) => lead.id !== leadId));
          setTotalLeads(totalLeads - 1);
          showAlert("Lead deleted successfully.", "success");
        })
        .catch((error) => {
          console.error("❌ Error deleting lead:", error);
          showAlert("Failed to delete lead.", "error");
        });
    };

    showAlert(
      "Are you sure you want to delete this lead?",
      "warning",
      "Confirm Deletion",
      0,
      confirmDelete
    );
  };

  const handleProcessChange = (e) => setSelectedProcess(e.target.value);

  useEffect(() => {
    const fetchProcessPersons = async () => {
      try {
        const persons = await getAllProcessPersons();
        setProcessPersons(persons.processPersons);
      } catch (err) {
        console.error("Failed to load process persons", err);
      } finally {
        //setLoading(false);
      }
    };

    fetchProcessPersons();
  }, [getAllProcessPersons]);

  const [previousFilterType, setPreviousFilterType] = useState("all");

  useEffect(() => {
    const loadDataByView = async () => {
      if (viewMode === "process") {
        setPreviousFilterType(filterType);
        await getAllConvertedClients();
        handleFilterChange("converted");
      } else {
        await getAllLeads();
        handleFilterChange(previousFilterType);
      }
    };

    loadDataByView();
}, [viewMode, filterType, getAllConvertedClients, getAllLeads, previousFilterType]);

  const handleImportToProcess = async () => {
    if (!selectedProcess) {
      showAlert("Select a process person first.", "warning");
      return;
    }
    if (selectedLeads.length === 0) {
      showAlert("Select at least one client.", "warning");
      return;
    }

    try {
      showLoader("Importing clients...", "admin");
      const resp = await createProcesstoConverted({
        processPersonId: selectedProcess,
        selectedClientIds: selectedLeads,
      });
      hideLoader();
      showAlert(resp.message || "Clients imported successfully.", "success");
      setSelectedLeads([]);
      await getAllConvertedClients();
      handleFilterChange("converted");
      setCurrentPage(1);
    } catch (err) {
      hideLoader();
      console.error(err);
      showAlert("Import failed, check console.", "error");
    }
  };

  return (
    <div className={`f-lead-content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <SidebarToggle />
      <div className="leads-dashboard" data-theme={theme}>
        {isLoading && variant === "admin" && (
          <AdminSpinner text="Loading Lead Assign..." />
        )}
        <Alert alerts={alerts} onClose={closeAlert} />
        <div style={{ display: "flex" }}>
          <div className="Logo">Lead Assign</div>
          <div className="toggle-slider-wrapper" style={{ marginLeft: "20px" }}>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={viewMode === "process"}
                onChange={() => {
                  setViewMode((prev) => {
                    const newMode = prev === "executive" ? "process" : "executive";
                    if (newMode === "process") {
                      setPreviousFilterType(filterType);
                      handleFilterChange("converted");
                    } else {
                      handleFilterChange(previousFilterType);
                      getAllLeads();
                    }
                    return newMode;
                  });
                }}
              />
              <span className="toggle-slider" />
            </label>
            <span className="toggle-label">
              {viewMode === "executive" ? "Executive" : "Process"}
            </span>
          </div>
        </div>
        <div className="taskmanage-header">
          <div className="header-actions">
            {viewMode === "executive" && (
              <select value={selectedExecutive} onChange={handleExecutiveChange}>
                <option value=""> Select Executive </option>
                {executives.map((exec) => (
                  <option key={exec.id} value={String(exec.id)}>
                    {exec.username}
                  </option>
                ))}
              </select>
            )}
            {viewMode === "process" && (
              <>
                <select value={selectedProcess} onChange={handleProcessChange}>
                  <option value="">Select Process </option>
                  {processPersons.map((proc) => (
                    <option key={proc.id} value={proc.id}>
                      {proc.fullName}
                    </option>
                  ))}
                </select>
              </>
            )}
            <select value={selectedRange} onChange={handleRangeChange}>
              <option value="">Default Sorting</option>
              <option value="1-10">1 - 10</option>
              <option value="11-20">11 - 20</option>
              <option value="21-50">21 - 50</option>
              <option value="51-100">51 - 100</option>
            </select>
            <select
    value={leadsPerPage}
    onChange={(e) => setLeadsPerPage(Number(e.target.value))}
  >
    <option value={10}>10 per page</option>
    <option value={20}>20 per page</option>
    <option value={50}>50 per page</option>
  </select>
            <div className="header-sort-filter">
              <button className="gradient-button" onClick={toggleSelectAll}>
                Select/Unselect All Leads
              </button>
              <button
                className="gradient-button"
                onClick={() => {
                  if (viewMode === "executive") {
                    assignLeads();
                  } else {
                    handleImportToProcess();
                  }
                }}
              >
                Assign
              </button>
              <button className="gradient-button" onClick={() => setSelectedLeads([])}>
                Reset
              </button>
            </div>
               <div className="lead-filter-buttons">
   {(viewMode === "executive"
    ? ["all", "new", "fresh", "followup", "converted", "closed", "meeting"]
    : ["converted", "unassigned"]
  ).map((type) => (
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
              <span>All customers ({totalLeads})</span>
              <span className="source-header">Source</span>
              <span className="assign-header">Assigned To</span>
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
                      disabled={viewMode === "process" && lead.assignedToExecutive}
                    />
                    <span className="container-icon">👤</span>
                    <div className="admin-lead-info">
                      <span>Name: {lead.name}</span>
                      <span>
                        Email: {lead.email}
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
                          <span>
                            Country Preference: {lead.countryPreference || "N/A"}
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
                  <div className="lead-actions">
                    <button className="edit" onClick={() => handleEditClick(lead)}>
                      Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDeleteClick(lead.id)}
                    >
                      Delete
                    </button>
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
        {isEditModalOpen && editingLead && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Lead</h2>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editingLead.name}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editingLead.email || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="text"
                  name="phone"
                  value={editingLead.phone}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Education:</label>
                <input
                  type="text"
                  name="education"
                  value={editingLead.education || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Experience:</label>
                <input
                  type="text"
                  name="experience"
                  value={editingLead.experience || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>State:</label>
                <input
                  type="text"
                  name="state"
                  value={editingLead.state || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Country:</label>
                <input
                  type="text"
                  name="country"
                  value={editingLead.country || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Date of Birth (DOB):</label>
                <input
                  type="date"
                  name="dob"
                  value={editingLead.dob || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Lead Assign Date:</label>
                <input
                  type="date"
                  name="leadAssignDate"
                  value={editingLead.leadAssignDate || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Country Preference:</label>
                <input
                  type="text"
                  name="countryPreference"
                  value={editingLead.countryPreference || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="modal-actions">
                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={handleCloseModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;






