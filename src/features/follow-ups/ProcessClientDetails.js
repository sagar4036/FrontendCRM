
import React, { useState, useEffect } from "react";
import { useProcessService } from "../../context/ProcessServiceContext";

const ProcessClientDetails = ({ selectedClient, onClose }) => {
  const { getProcessFollowupHistory}=useProcessService;
  const [recentFollowUps, setRecentFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (selectedClient) {
      const freshLeadId = selectedClient.freshLead?.id || selectedClient.fresh_lead_id;
      if (freshLeadId) {
        setLoading(true);
        getProcessFollowupHistory(freshLeadId)
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
  }, [selectedClient,getProcessFollowupHistory]);

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
        <div className="client-info">
          <div className="user-icon-bg">
            <div className="user-icon">👤</div>
          </div>
          <div className="client-text">
            <h4>{selectedClient.freshLead?.name || "No Name"}</h4>
            <div className="lead-info">
              <span className="lead-badge">Lead</span>
            </div>
          </div>
        </div>

        <div className="last-followup">
          <h4>Last Follow-ups</h4>
          {loading ? (
            <p>Loading...</p>
          ) : recentFollowUps.length > 0 ? (
            recentFollowUps.map((followUp, index) => (
              <div key={followUp.id || index} className="followup-entry-horizontal">
              <p className="followup-reason">{followUp.reason_for_follow_up || "No description available."}</p>
              <strong>
              <p className="followup-time">
                {new Date(followUp.follow_up_date).toLocaleDateString()} - {followUp.follow_up_time}
              </p>
              </strong>
            </div>
            
            ))
            
          ) : (
            <p>No previous follow-ups available.</p>
          )}
        </div>

        <div className="close-btn" onClick={onClose}>✖</div>
      </div>
    </div>
  );
};

export default ProcessClientDetails;