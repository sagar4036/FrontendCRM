import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { SearchContext } from "../../context/SearchContext";
import { useLoading } from "../../context/LoadingContext";
import LoadingSpinner from "../spinner/LoadingSpinner";
import { useProcessService } from "../../context/ProcessServiceContext";

const ProcessClientTable = ({ filter = "All Follow Ups" }) => {
  const [activePopoverIndex, setActivePopoverIndex] = useState(null);
  const [tableHeight, setTableHeight] = useState("500px");
  const [selectedClient, setSelectedClient] = useState(null);
  const [lastFollowups, setLastFollowups] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setActivePage } = useContext(SearchContext);
  const { isLoading, loadingText } = useLoading();
  const {
    getProcessAllFollowup,
    fetchCustomers,
    customers,
    setCustomers,
    getProcessFollowup,
  } = useProcessService();

  const isFollowUpOld = (followUpDate) => {
    if (!followUpDate) return false;
    const today = new Date();
    const followDate = new Date(followUpDate);
    const diffTime = Math.abs(today - followDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  };

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        await getProcessAllFollowup();
      } catch (err) {
        console.error("❌ Failed to load follow-ups:", err.message);
      }
    };

    fetchFollowups();
  }, [getProcessAllFollowup]);

  useEffect(() => {
    fetchCustomers()
      .then((data) => {
        if (data && Array.isArray(data)) {
          const mappedClients = data.filter(
            (client) => client.status === "under_review"
          );
          setCustomers(mappedClients);
        }
      })
      .catch((err) => console.error("❌ Error fetching clients:", err));
  }, [fetchCustomers, setCustomers]);

  const clients = customers.filter(
    (client) => client.status === "under_review"
  );

  useEffect(() => {
    setActivePage("follow-up");
  }, [setActivePage]);

  useEffect(() => {
    const updateTableHeight = () => {
      const windowHeight = window.innerHeight;
      const tablePosition =
        document.querySelector(".table-container")?.getBoundingClientRect()
          .top || 0;
      const footerHeight = 40;
      const newHeight = Math.max(
        300,
        windowHeight - tablePosition - footerHeight
      );
      setTableHeight(`${newHeight}px`);
    };

    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);
    return () => window.removeEventListener("resize", updateTableHeight);
  }, []);

  const filteredClients = clients.filter((client) => {
    const type = (client.processfollowuphistories?.[0]?.follow_up_type || "")
      .toLowerCase()
      .trim();

    if (filter === "Document collection" && type !== "document collection")
      return false;
    if (filter === "Payment follow-up" && type !== "payment follow-up")
      return false;
    if (filter === "Visa filing" && type !== "visa filing") return false;

    if (location.pathname.includes("process-follow-up") && searchQuery.trim()) {
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

  const handleSelectClient = async (client) => {
    setSelectedClient(client);
    const freshLeadId = client.freshLead?.id || client.fresh_lead_id;
    if (!freshLeadId) return;

    try {
      const response = await getProcessFollowup(freshLeadId);
      const data = Array.isArray(response) ? response : response?.data || [];

      // ✅ Sort by latest first and take top 2
      const sorted = [...data]
        .filter((item) => Number(item.fresh_lead_id) === Number(freshLeadId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // latest first

      setLastFollowups(sorted.slice(0, 2)); // ✅ latest 2 follow-ups only
    } catch (err) {
      console.error("Error fetching follow-up history:", err);
      setLastFollowups([]);
    }
  };

  const handleEdit = (client) => {
    const freshLeadId = client.freshLead?.id || client.fresh_lead_id;
    if (!freshLeadId) {
      console.error("Fresh Lead ID is missing or incorrect");
      return;
    }
    const leadData = {
      ...client.freshLead,
      fresh_lead_id: freshLeadId,
      id: client.id,
    };
    navigate(
      `/process/clients/details/${encodeURIComponent(
        freshLeadId
      )}/${freshLeadId}`,
      {
        state: { client: leadData, createFollowUp: false, from: "followup" },
      }
    );
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

  console.log(filteredClients, "hhh");

  return (
    <>
      <div className="client-table-wrapper" style={{ position: "relative" }}>
        {isLoading && <LoadingSpinner text={loadingText} />}
        {selectedClient && (
          <div
            className="client-info"
            style={{
              width: "95%",
              margin: "10px auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "12px",
              borderRadius: "8px",
              background: "#fff",
              position: "relative",
            }}
          >
            {/* Close button */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
                fontSize: "20px",
                color: "#555",
                backgroundColor: "#f0f0f0",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.3s",
              }}
              onClick={() => {
                setSelectedClient(null);
                setLastFollowups([]);
              }}
              title="Close"
            >
              ✖
            </div>

            {/* Main content */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    background: "#eee",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "10px",
                  }}
                >
                  👤
                </div>
                <div>
                  <div style={{ fontWeight: "600" }}>
                    Name: {selectedClient.fullName}
                  </div>
                </div>
              </div>
            </div>

            {/* Last Follow-Ups Section */}
            {lastFollowups.length > 0 && (
              <div
                style={{
                  marginTop: "16px",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  style={{
                    marginBottom: "16px",
                    fontSize: "18px",
                    fontWeight: "600",
                    borderBottom: "2px solid #2196f3",
                    paddingBottom: "6px",
                    color: "#1e3a8a",
                  }}
                >
                  Last Follow-Ups
                </h3>

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  {lastFollowups.map((followup, index) => (
                    <div
                      key={followup.id}
                      style={{
                        flex: "1",
                        minWidth: "250px",
                        backgroundColor: "#e3f2fd",
                        padding: "12px 16px",
                        borderRadius: "6px",
                        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "8px",
                          fontWeight: "bold",
                          color: "#0d47a1",
                        }}
                      >
                        {index === 0 ? "Latest" : ""}
                      </div>

                      <div style={{ marginBottom: "6px" }}>
                        {followup.comments || "No comment"}
                      </div>

                      <div style={{ fontSize: "13px", color: "#333" }}>
                        {new Date(followup.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className="table-container responsive-table-wrapper"
          style={{ maxHeight: tableHeight }}
        >
          <table className="client-table">
            <thead>
              <tr className="sticky-header">
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Add follow up</th>
                <th>Status</th>
                <th>Call</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-text">
                    No follow-up clients found.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, index) => {
                  const isOld = isFollowUpOld(client.follow_up_date);

                  return (
                    <tr
                      key={index}
                      className={isOld ? "old-followup-row" : ""}
                      style={{
                        cursor: "pointer",
                        ...(isOld && {
                          backgroundColor: "#ffebee",
                          borderLeft: "4px solid #f44336",
                        }),
                      }}
                      onClick={() => handleSelectClient(client)}
                    >
                      <td>
                        <div className="client-name">
                          <div className="client-info">
                            <strong
                              style={
                                isOld
                                  ? { color: "#c62828", fontWeight: "bold" }
                                  : {}
                              }
                            >
                              {client.fullName || "No Name"}
                            </strong>
                          </div>
                        </div>
                      </td>
                      <td style={isOld ? { color: "#c62828" } : {}}>
                        {client.phone?.toString() || "No Phone"}
                      </td>
                      <td style={isOld ? { color: "#c62828" } : {}}>
                        {client.email || "N/A"}
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
                                  backgroundColor: "#f44336",
                                  borderColor: "#d32f2f",
                                  color: "white",
                                }
                              : {}
                          }
                        >
                          {filter === "All Follow Ups"
                            ? "Create"
                            : (
                                client.processfollowuphistories?.[0]
                                  ?.follow_up_type || ""
                              ).toLowerCase()}
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
                                    backgroundColor: "#f44336",
                                    color: "white",
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
                              client.status
                            )} ${isOld ? "old-followup-badge" : ""}`}
                            style={
                              isOld
                                ? {
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    border: "1px solid #d32f2f",
                                  }
                                : {}
                            }
                          >
                            {client.processfollowuphistories?.[0]
                              ?.interaction_rating || "N/A"}
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
                                  backgroundColor: "#f44336",
                                  color: "white",
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
                                const cleaned = (client.phone || "").replace(
                                  /[^\d]/g,
                                  ""
                                );
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
                                const cleaned = (client.phone || "").replace(
                                  /[^\d]/g,
                                  ""
                                );
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
      </div>
    </>
  );
};

export default ProcessClientTable;
