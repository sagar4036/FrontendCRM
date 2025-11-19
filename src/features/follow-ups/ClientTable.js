import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faPenToSquare
  
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { SearchContext } from "../../context/SearchContext";
import { useLoading } from "../../context/LoadingContext";
import LoadingSpinner from "../spinner/LoadingSpinner";

const ClientTable = ({
  filter = "All Follow Ups",
  onSelectClient,
  selectedRating = "All",
}) => {
  const { followUps, getAllFollowUps } = useApi();
  const clients = Array.isArray(followUps?.data) ? followUps.data : [];
  const [activePopoverIndex, setActivePopoverIndex] = useState(null);
 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();
  const { searchQuery, setActivePage } = useContext(SearchContext);
  const location = useLocation();
  const { showLoader, hideLoader, isLoading, loadingText } = useLoading();

  const isFollowUpOld = (followUpDate) => {
    if (!followUpDate) return false;
    const today = new Date();
    const followDate = new Date(followUpDate);
    const diffTime = Math.abs(today - followDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  };

  useEffect(() => {
    const loadFollowUps = async () => {
      try {
        showLoader("Loading Follow-Ups...");
        await getAllFollowUps();
      } finally {
        hideLoader();
      }
    };
    loadFollowUps();
}, [getAllFollowUps, showLoader, hideLoader]);

  useEffect(() => {
    setActivePage("follow-up");
  }, [setActivePage ,getAllFollowUps, hideLoader, showLoader]);

  

  const filteredClients = clients.filter((client) => {
    const type = (client.follow_up_type || "").toLowerCase().trim();
    const status = (client.clientLeadStatus || "").toLowerCase().trim();
    const rating = (client.interaction_rating || "").toLowerCase().trim();

    if (status !== "follow-up") return false;
    if (filter === "Interested" && type !== "interested") return false;
    if (filter === "Not Interested" && type !== "not interested") return false;

    // New: Filter by selected rating from dropdown
    if (selectedRating !== "All" && rating !== selectedRating.toLowerCase()) {
      return false;
    }

    if (location.pathname.includes("follow-up") && searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      const name = client.freshLead?.name?.toLowerCase() || "";
      const phone = client.freshLead?.phone?.toString() || "";
      const email = client.freshLead?.email?.toLowerCase() || "";
      return (
        name.includes(search) ||
        phone.includes(search) ||
        email.includes(search)
      );
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

 

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleEdit = (client) => {
    const freshLeadId = client.freshLead?.id || client.fresh_lead_id;
    if (!freshLeadId) {
      console.error("Fresh Lead ID is missing or incorrect");
      return;
    }

    const leadData = {
      ...client,
      ...(client.freshLead || {}),
      fresh_lead_id: freshLeadId,
      followUpId: client.id,
    };

    navigate(`/executive/clients/${encodeURIComponent(client.id)}/details`, {
      state: { client: leadData, createFollowUp: false, from: "followup" },
    });
  };

  const getStatusColorClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "follow-up":
        return "status-followup";
      case "converted":
        return "status-converted";
      case "not interested":
        return "status-notinterested";
      default:
        return "status-default";
    }
  };

  const getRatingColorClass = (rating) => {
    switch ((rating || "").toLowerCase()) {
      case "hot":
        return "rating-hot";
      case "warm":
        return "rating-warm";
      case "cold":
        return "rating-cold";
      default:
        return "rating-default";
    }
  };

  return (
    <>
      <div className="client-table-wrapper" style={{ position: "relative" }}>
        {isLoading && <LoadingSpinner text={loadingText} />}

        <div
          className="table-container responsive-table-wrapper"
          style={{ maxHeight: "none" }}
        >
          <table className="client-table">
            <thead>
              <tr className="sticky-header">
                <th>NAME</th>
                <th>PHONE</th>
                <th>EMAIL</th>
                <th>ADD FOLLOW-UPS</th>
                <th>STATUS</th>
                <th>CALL</th>
              </tr>
            </thead>
            <tbody>
              {currentClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-text">
                    No follow-up clients found.
                  </td>
                </tr>
              ) : (
                currentClients.map((client, index) => {
                  const isOld = isFollowUpOld(client.follow_up_date);
                  const ratingClass = getRatingColorClass(
                    client.interaction_rating
                  );

                  return (
                    <tr
                      key={index}
                      className={`clickable-row ${isOld ? "old-followup-row" : ""} ${ratingClass}`}
                      style={
                        isOld
                          ? {
                              backgroundColor: "white",
                              fontWeight:"900",
                            }
                          : {}
                      }
                    >
                      <td onClick={() => onSelectClient?.(client)}>
                        <div className="client-name">
                          <div className="client-info">
                            <strong
                              style={
                                isOld
                                  ? { color: "#c62828", fontWeight: "bold" }
                                  : {}
                              }
                            >
                              {client.freshLead?.name || "No Name"}
                            </strong>
                          </div>
                        </div>
                      </td>
                      <td style={isOld ? { color: "#c62828" } : {}}>
                        {client.freshLead?.phone?.toString() || "No Phone"}
                      </td>
                      <td style={isOld ? { color: "#c62828" } : {}}>
                        {client.freshLead?.email || "N/A"}
                      </td>
                      <td>
                        <button
                          className={`followup-badge full-click ${
                            isOld ? "old-followup-button" : ""
                          }`}
                          onClick={() => handleEdit(client)}
                          style={
                            isOld
                              ? {
                                  borderColor: "#d32f2f",
                                }
                              : {}
                          }
                        >
                          {filter === "All Follow Ups"
                            ? "Create"
                            : (client.follow_up_type || "").toLowerCase()}
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="icon"
                          />
                        </button>
                      </td>
                      <td>
                        {client.interaction_rating ? (
                          <span
                            className={`rating-badge ${getRatingColorClass(
                              client.interaction_rating
                            )} ${isOld ? "old-followup-badge" : ""}`}
                            style={
                              isOld
                                ? {
                                    border: "1px solid #d32f2f",
                                  }
                                : {}
                            }
                          >
                            {client.interaction_rating.charAt(0).toUpperCase() +
                              client.interaction_rating.slice(1)}
                          </span>
                        ) : (
                          <span
                            className={`status-badge ${getStatusColorClass(
                              client.clientLeadStatus
                            )} ${isOld ? "old-followup-badge" : ""}`}
                            style={
                              isOld
                                ? {
                                    color: "#d32f2f",
                                    border: "1px solid #d32f2f",
                                  }
                                : {}
                            }
                          >
                            {client.clientLeadStatus || "N/A"}
                          </span>
                        )}
                      </td>
                      <td className="call-cell">
                        <button
                          className={`call-button ${
                            isOld ? "old-followup-call" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePopoverIndex(
                              activePopoverIndex === index ? null : index
                            );
                          }}
                          style={
                            isOld
                              ? {
                                  color: "#d32f2f",
                                  border: "1px solid #d32f2f",
                                }
                              : {}
                          }
                        >
                          📞
                        </button>
                        {activePopoverIndex === index && (
                          <div className="popover">
                            <button
                              className="popover-option"
                              onClick={() => {
                                const cleaned = (
                                  client.freshLead?.phone || ""
                                ).replace(/[^\d]/g, "");
                                window.location.href = `whatsapp://send?phone=91${cleaned}`;
                                setActivePopoverIndex(null);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faWhatsapp}
                                style={{
                                  color: "#25D366",
                                  marginRight: "6px",
                                  fontSize: "18px",
                                }}
                              />
                              WhatsApp
                            </button>
                            <button
                              className="popover-option"
                              onClick={() => {
                                const cleaned = (
                                  client.freshLead?.phone || ""
                                ).replace(/[^\d]/g, "");
                                window.open(`tel:${cleaned}`);
                                setActivePopoverIndex(null);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faPhone}
                                style={{
                                  color: "#4285F4",
                                  marginRight: "6px",
                                  fontSize: "16px",
                                }}
                              />
                              Normal Call
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      {/* Pagination */}
      {filteredClients.length > itemsPerPage && (
          <div className="flw-unique-pagination">
            <button
              className="flw-unique-pagination-btn"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="flw-unique-pagination-span">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="flw-unique-pagination-btn"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ClientTable;