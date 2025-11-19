import React, { useContext, useEffect, useState } from "react";
import { useApi } from "../../context/ApiContext";
import useCopyNotification from "../../hooks/useCopyNotification";
import { SearchContext } from "../../context/SearchContext";
import { FaPlus } from "react-icons/fa";
import { useLoading } from "../../context/LoadingContext"; // ✅ Add this
import LoadingSpinner from "../spinner/LoadingSpinner"; // ✅ Import spinner

// ...all imports remain unchanged

const Leads = ({ searchQuery }) => {
  const {
    closeLeads,
    fetchAllCloseLeadsAPI,
    closeLeadsLoading,
    fetchNotifications,
    createCopyNotification,
    fetchFollowUpHistoriesAPI,
  } = useApi();

  const { activePage } = useContext(SearchContext);
  const [selectedLead, setSelectedLead] = useState(null);
  const [followUpHistories, setFollowUpHistories] = useState([]);
  const [followUpHistoriesLoading, setFollowUpHistoriesLoading] = useState(false);
  const { showLoader, hideLoader, isLoading, loadingText } = useLoading();

  useCopyNotification(createCopyNotification, fetchNotifications);

 useEffect(() => {
  const loadCloseLeads = async () => {
    try {
      showLoader("Loading Closed Leads...");
      await fetchAllCloseLeadsAPI();
    } catch (error) {
      console.error("Failed to fetch close leads", error);
    } finally {
      hideLoader();
    }
  };

  loadCloseLeads();
}, [fetchAllCloseLeadsAPI, showLoader, hideLoader]);


  const leadsArray = closeLeads?.data || [];

  const filteredLeads =
    activePage === "close-leads"
      ? leadsArray.filter((lead) =>
          [lead.name, lead.phone, lead.email].some((field) =>
            field?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      : leadsArray;

  const handleViewHistory = async (lead) => {
    setSelectedLead(lead);
    setFollowUpHistoriesLoading(true);

    try {
      const rawData = await fetchFollowUpHistoriesAPI();
      const leadId = lead.fresh_lead_id || lead.freshLead?.id || lead.lead?.id || lead.id;

      const filtered = Array.isArray(rawData)
        ? rawData.filter((item) => {
            const historyLeadId = item.fresh_lead_id || item.followUp?.fresh_lead_id;
            return String(historyLeadId) === String(leadId);
          })
        : [];

      const parsed = filtered.map((item) => ({
        date: item.follow_up_date || item.followUp?.follow_up_date || "N/A",
        time: item.follow_up_time || item.followUp?.follow_up_time || "N/A",
        reason:
          item.reason_for_follow_up || item.followUp?.reason_for_follow_up || "No reason provided",
        tags: [
          item.connect_via || item.followUp?.connect_via || "",
          item.follow_up_type || item.followUp?.follow_up_type || "",
          item.interaction_rating || item.followUp?.interaction_rating || "",
        ].filter(Boolean),
        originalDate: item.follow_up_date || item.followUp?.follow_up_date || "N/A",
        originalTime: item.follow_up_time || item.followUp?.follow_up_time || "N/A",
      }));

      const sortedParsed = parsed.sort((a, b) => {
        const dateTimeA = `${a.originalDate} ${a.originalTime}`;
        const dateTimeB = `${b.originalDate} ${b.originalTime}`;
        const parsedDateA = new Date(dateTimeA);
        const parsedDateB = new Date(dateTimeB);
        if (!isNaN(parsedDateA.getTime()) && !isNaN(parsedDateB.getTime())) {
          return parsedDateB.getTime() - parsedDateA.getTime();
        }
        return dateTimeB.localeCompare(dateTimeA);
      });

      setFollowUpHistories(sortedParsed);
    } catch (error) {
      console.error("Failed to load follow-up history:", error);
      setFollowUpHistories([]);
    } finally {
      setFollowUpHistoriesLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  return (
    <>
      <div className="close-leads-page">
        {isLoading && (
          <div className="page-wrapper" style={{ position: "relative" }}>
            <LoadingSpinner text={loadingText || "Loading Closed Leads..."} />
          </div>
        )}
        <h2 className="c-heading">CloseLeads</h2>

        <div className="leads_page_wrapper">
          <h4 className="Total_leads">Total close leads: {filteredLeads.length}</h4>
          {closeLeadsLoading ? (
            <p>Loading close leads...</p>
          ) : currentLeads.length > 0 ? (
            <>
              <div className="scrollable-leads-container">
                <table className="c-lead-table">
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>PHONE</th>
                      <th>EMAIL</th>
                      <th>CREATED AT</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeads.map((lead, index) => (
                      <tr key={index}>
                        <td>{lead.name || "Unnamed Lead"}</td>
                        <td>{lead.phone || "N/A"}</td>
                        <td>{lead.email || "No Email"}</td>
                        <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="follow-history-btn"
                            onClick={() => handleViewHistory(lead)}
                            title="View Follow-up History"
                          >
                            <FaPlus /> Follow History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

      {/* OUTSIDE of table */}
<div className="close-pagination-wrapper">
  <div className="close-pagination">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      Prev
    </button>
    <span style={{ margin: "0 10px" }}>
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
</div>

            </>
          ) : (
            <p>No close leads found.</p>
          )}
        </div>
      </div>

      {selectedLead && (
        <div className="h-followup-modal-overlay">
          <div className="h-followup-modal">
            <div className="h-followup-modal-header">
              <h3>{selectedLead.name || "Unnamed Lead"}</h3>
              <button className="h-close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="h-followup-modal-body">
              {followUpHistoriesLoading ? (
                <p>Loading history...</p>
              ) : followUpHistories.length > 0 ? (
                followUpHistories.map((entry, idx) => (
                  <div className="h-followup-entry-card" key={idx}>
                    <div className="h-followup-date">
                      <span>{entry.date}</span>
                      <span>{entry.time}</span>
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
                      <div className="h-reason-text">{entry.reason}</div>
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

export default Leads;