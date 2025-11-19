import React, { useState, useEffect } from "react";
import { useApi } from "../../context/ApiContext";
const ClientDetails = ({ selectedClient, onClose }) => {
  const { fetchFollowUpHistoriesAPI } = useApi();
  const [recentFollowUps, setRecentFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);


  // Helper function to count words in a string
  const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  };

  useEffect(() => {
    if (selectedClient) {
      const freshLeadId = selectedClient.freshLead?.id || selectedClient.fresh_lead_id;
      if (freshLeadId) {
        setLoading(true);
        fetchFollowUpHistoriesAPI(freshLeadId)
          .then((histories) => {
            if (histories && Array.isArray(histories)) {
              const filteredHistories = histories.filter(
                (history) => history.fresh_lead_id === freshLeadId
              );

              // Sort by creation date (newest first)
              filteredHistories.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );

              // Deduplicate by date, time, and reason
              const unique = [];
              const seen = new Set();

              for (const history of filteredHistories) {
                const key = `${history.follow_up_date}-${history.follow_up_time}-${history.reason_for_follow_up}`;
                if (!seen.has(key)) {
                  unique.push(history);
                  seen.add(key);
                }
                if (unique.length === 2) break;
              }

              setRecentFollowUps(unique);
            } else {
              setRecentFollowUps([]);
            }
          })
          .catch((error) => {
            console.error("Error fetching follow-up histories:", error);
            setRecentFollowUps([]);
          })
          .finally(() => setLoading(false));
      } else {
        console.warn("No valid freshLeadId found for client:", selectedClient);
        setRecentFollowUps([]);
      }
    } else {
      setRecentFollowUps([]);
    }
  }, [selectedClient,fetchFollowUpHistoriesAPI]);

  if (!selectedClient) {
    return (
      <div className="client-details-container">
        <h4 className="client-details-title">Select a client to view details</h4>
      </div>
    );
  }

  return (
    <div className="client-details-container">
      <h3 className="client-details-title">Client Details</h3>
      <div className="client-details">
        <div className="client-info-container">
          <div className="user-icon-bg">
            <div className="user-icon">👤</div>
          </div>
          <div className="client-text">
            <h4>{selectedClient.freshLead?.name || "No Name"}</h4>
          </div>
          <div className="client-other-details">
            <div>DOB:<span></span></div>
            <div>Country:<span></span></div>
            <div>State:<span></span></div>
          </div>
        </div>

        <div className="client-detail-last-followup">
          <h4>Last Follow-ups</h4>
          <div className="client-detail-last-followup-list">
            {loading ? (
              <p>Loading...</p>
            ) : recentFollowUps.length > 0 ? (
              recentFollowUps.map((followUp, index) => (
                <div
                  key={followUp.id || index}
                  className={`followup-entry-card ${index === 0 ? "latest-followup" : ""
                    }`}
                >
                  <div className="followup-content-wrapper">
                    {/* Header with Latest Badge and Date/Time - Swapped positions */}
                    <div className="followup-header">
                      {/* Latest badge positioned where date/time used to be */}
                      <div className="latest-badge-container-left">
                        {index === 0 && (
                          <span className="status-badge latest-badge">Latest</span>
                        )}
                      </div>
                      <div>
                      <span
                        className={`rating-badge rating-${followUp.interaction_rating?.toLowerCase() || "default"
                          }`}
                      >
                        Rating: {followUp.interaction_rating || "N/A"}
                      </span>
                      </div>
                      <div>
                      <span className="connect-via-badge">
                        Connected Via: {followUp.connect_via || "N/A"}
                      </span>
                      </div>
                      {/* Date/Time positioned where Latest badge used to be */}
                      <div className="followup-date-time-right" style={{display: "flex" , flexDirection: "column"}}>
                        <span className="c-followup-date">
                          {new Date(followUp.createdAt).toLocaleDateString()}
                        </span>
                        <span className="c-followup-time">
                          {new Date(followUp.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>
                    {/* Main Content */}
                    <div className="followup-main-content">
                      <div className="followup-reason-container">
                        <p
                          className={`followup-reason ${countWords(followUp.reason_for_follow_up) > 40 ? "scrollable" : ""
                            }`}
                        >
                          {followUp.reason_for_follow_up || "No description available."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No previous follow-ups available.</p>
            )}
          </div>

          <div className="close-btn" onClick={onClose}>✖</div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;