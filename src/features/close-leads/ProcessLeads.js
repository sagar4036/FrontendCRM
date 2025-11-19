import React, { useEffect, useState, useCallback } from "react";
import { FaPlus } from "react-icons/fa";
import { useLoading } from "../../context/LoadingContext";
import LoadingSpinner from "../spinner/LoadingSpinner";
import { useProcessService } from "../../context/ProcessServiceContext";

const ProcessLeads = () => {
  const { fetchCustomers, customers, setCustomers, getProcessFollowup } = useProcessService();
  const [selectedLead, setSelectedLead] = useState(null);
  const [followUpHistoriesLoading, setFollowUpHistoriesLoading] = useState(false);
  const { showLoader, hideLoader, isLoading, loadingText } = useLoading();
  const [historyData, setHistoryData] = useState([]);

  const handleViewHistory = async (lead) => {
    setSelectedLead(lead);
    setFollowUpHistoriesLoading(true);
    try {
      const id = lead.fresh_lead_id;
      if (id) {
        const result = await getProcessFollowup(id);
        setHistoryData(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load follow-up history:", error);
      setHistoryData([]);
    } finally {
      setFollowUpHistoriesLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
  };

  // ✅ Load all customers, not just rejected ones
  const loadCustomers = useCallback(async () => {
    try {
      showLoader("Loading Final Stage Leads...");
      const data = await fetchCustomers();
      if (Array.isArray(data)) {
        setCustomers(data); // ✅ Store all customers
      }
    } catch (err) {
      console.error("❌ Error fetching clients:", err);
    } finally {
      hideLoader();
    }
  }, [fetchCustomers, setCustomers, showLoader, hideLoader]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // ✅ Only show approved leads in UI
  const clients = customers.filter((client) => client.status === "approved");

  return (
    <>
      <div className="close-leads-page">
        {isLoading && (
          <div className="page-wrapper" style={{ position: "relative" }}>
            <LoadingSpinner text={loadingText || "Loading Final Stage Leads..."} />
          </div>
        )}

        <h2 className="c-heading">Final Stage Leads</h2>

        <div className="leads_page_wrapper">
          <h4 className="Total_leads" style={{ marginBottom: "20px" }}>
            Total Final Stage leads: {clients.length}
          </h4>

          {clients.length > 0 ? (
            <div className="leads-table-wrapper">
              <table className="rejected-leads-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Created At</th>
                    <th>Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((lead, index) => (
                    <tr key={index}>
                      <td>{lead.fullName || "Unnamed Lead"}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.email || "No Email"}</td>
                      <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="r-follow-history-btn"
                          onClick={() => handleViewHistory(lead)}
                          title="View Follow-up History"
                        >
                          <span className="history-icon">
                            <FaPlus />
                          </span>{" "}
                          Follow History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No final stage leads found.</p>
          )}
        </div>
      </div>

      {/* Follow-up History Modal */}
      {selectedLead && (
        <div className="h-followup-modal-overlay">
          <div className="h-followup-modal">
            <div className="h-followup-modal-header">
              <h3>{selectedLead.fullName || "Unnamed Lead"}</h3>
              <button className="h-close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="h-followup-modal-body">
              {followUpHistoriesLoading ? (
                <p>Loading history...</p>
              ) : historyData.length > 0 ? (
                historyData.map((entry, idx) => (
                  <div className="h-followup-entry-card" key={idx}>
                    <div className="h-followup-date">
                      <span>{entry.follow_up_date}</span>
                      <span>{entry.follow_up_time}</span>
                      {idx === 0 && <span className="h-latest-tag">LATEST</span>}
                    </div>
                    <div className="h-followup-tags">
                      {entry.tags?.map((tag, i) => (
                        <button key={i} className={`h-tag ${tag === "Hot" ? "hot" : ""}`}>
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="h-followup-reason-box">
                      <p>Follow-Up Reason</p>
                      <div className="h-reason-text">{entry.comments}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No follow-up history found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProcessLeads;