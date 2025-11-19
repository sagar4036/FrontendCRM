import React, { useState, useEffect, useRef, useMemo,useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import Swal from "sweetalert2";
import useCopyNotification from "../../hooks/useCopyNotification";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import SendEmailToClients from "../client-details/SendEmailToClients";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import EmailIcon from "@mui/icons-material/Email";
import CallMadeIcon from "@mui/icons-material/CallMade";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import WbSunnyIcon from "@mui/icons-material/WbSunny";

function convertTo24HrFormat(timeStr) {
  const dateObj = new Date(`1970-01-01 ${timeStr}`);
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}:00`;
}

const ClientDetailsOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    fetchFollowUpHistoriesAPI,
    updateFollowUp,
    createConvertedClientAPI,
    createCloseLeadAPI,
    createMeetingAPI,
    fetchFreshLeadsAPI,
    fetchMeetings,
    refreshMeetings,
    followUpLoading,
    createFollowUpHistoryAPI,
    executiveInfo,
    fetchNotifications,
    createCopyNotification,
    scheduleFollowUpNotificationAPI,
  } = useApi();

  useCopyNotification(createCopyNotification, fetchNotifications);
const client = useMemo(() => location.state?.client || {}, [location.state?.client]);

  const getCurrentTime24Hour = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return `${currentHour.toString().padStart(2, "0")}:${currentMinute
      .toString()
      .padStart(2, "0")}`;
  };

  const contactIcons = {
    Call: <CallRoundedIcon fontSize="small" />,
    Email: <EmailIcon fontSize="small" />,
    "Call/Email": <CallMadeIcon fontSize="small" />,
  };

  const followUpIcons = {
    interested: <ThumbUpAltIcon fontSize="small" />,
    appointment: <EventAvailableIcon fontSize="small" />,
    "no response": <PersonOffIcon fontSize="small" />,
    converted: <CheckCircleIcon fontSize="small" />,
    "not interested": (
      <ThumbDownIcon fontSize="small" style={{ marginTop: 4 }} />
    ),
    close: <LockPersonIcon fontSize="small" />,
  };

  const ratingIcons = {
    hot: <LocalFireDepartmentIcon fontSize="small" />,
    warm: <WbSunnyIcon fontSize="small" />,
    cold: <AcUnitIcon fontSize="small" />,
  };
  // Initialize current time properly
const now = useMemo(() => new Date(), []);
  const todayStr = now.toISOString().split("T")[0];

  const [clientInfo, setClientInfo] = useState(client);
  const [contactMethod, setContactMethod] = useState("");
  const [followUpType, setFollowUpType] = useState("");
  const [interactionRating, setInteractionRating] = useState("");
  const [reasonDesc, setReasonDesc] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [reminderTime, setReminderTime] = useState(getCurrentTime24Hour());
  const [interactionDate, setInteractionDate] = useState(todayStr);
  const [timeOnly, setTimeOnly] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  });

  

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (interactionDate === today) {
      setTimeOnly(getCurrentTime24Hour());
    }
  }, [interactionDate]);

  const handleUseCurrentTime = () => {
    setTimeOnly(getCurrentTime24Hour());
  };

  const interactionTime = useMemo(() => {
    return `${timeOnly}:00`;
  }, [timeOnly]);

  // Add date constraints
  const minDate = useMemo(() => todayStr, [todayStr]);
  const maxDate = useMemo(() => {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + 5);
    return d.toISOString().split("T")[0];
  }, [now]);

  const [histories, setHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
   const recognitionRef = useRef(null);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // ENABLE continuous listening
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        setReasonDesc((prev) => `${prev} ${transcript}`);
      };

      recognition.onerror = (event) => {
        Swal.fire({
          icon: "error",
          title: "Speech Error",
          text: `Speech recognition error: ${event.error}`,
        });
        setIsListening(false);
      };

      recognition.onend = () => {
        // Don’t reset isListening here if we're actively listening
        if (isListeningRef.current) {
          recognition.start(); // restart automatically
        } else {
          setIsListening(false); // only stop if we actually intended to
        }
      };

      recognitionRef.current = recognition;
    } else {
      recognitionRef.current = null;
    }
  }, []);

  const capitalize = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  useEffect(() => {
    console.log("FollowUp Type Changed:", followUpType);
  }, [followUpType]);

  const clientFields = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "altPhone", label: "Alt Phone" },
    { key: "education", label: "Education" },
    { key: "experience", label: "Experience" },
    { key: "state", label: "State" },
    { key: "dob", label: "DOB" },
    { key: "country", label: "Country" },
    // { key: "assignDate", label: "Assign Date" },
  ];

// ✅ Move loadFollowUpHistories here first
const loadFollowUpHistories = useCallback(async (freshLeadId) => {
  if (!freshLeadId) return;
  setIsLoading(true);
  try {
    const response = await fetchFollowUpHistoriesAPI();
    if (Array.isArray(response)) {
      const filteredHistories = response.filter(
        (history) => history.fresh_lead_id === freshLeadId
      );
      filteredHistories.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setHistories(filteredHistories);
      if (filteredHistories.length > 0) {
        populateFormWithHistory(filteredHistories[0]);
      } else {
        setHistories([]);
      }
    } else {
      setHistories([]);
    }
  } catch (error) {
    console.error("Error fetching follow-up histories:", error);
    setHistories([]);
  } finally {
    setIsLoading(false);
  }
}, [fetchFollowUpHistoriesAPI]);


 useEffect(() => {
  if (client) {
    const freshLeadId =
      client.freshLead?.id || client.fresh_lead_id || client.id;
    const normalizedClient = {
      ...client,
      ...(client.freshLead || {}), // ✅ inject education, experience, dob, state, etc.
      fresh_lead_id: freshLeadId,
      followUpId: client.followUpId || client.id,
    };

    setClientInfo(normalizedClient);
    loadFollowUpHistories(freshLeadId);
  }
}, [client, loadFollowUpHistories]);

  const populateFormWithHistory = (history) => {
    setContactMethod(history.connect_via?.toLowerCase() || "");
    setFollowUpType(history.follow_up_type || "");
    setInteractionRating(history.interaction_rating?.toLowerCase() || "");
    setReasonDesc(history.reason_for_follow_up || "");
    setInteractionDate(history.follow_up_date || "");
    const time24 = history.follow_up_time || "12:00:00";
    const [hour, minute] = time24.split(":");
    setTimeOnly(`${hour}:${minute}`);
  };

  const handleChange = (field, value) => {
    setClientInfo((prev) => ({ ...prev, [field]: value }));
  };

  const updateFollowUpDetails = async (freshLeadId, followUpId) => {
    const updatePayload = {
      connect_via: capitalize(contactMethod),
      follow_up_type: followUpType,
      interaction_rating: capitalize(interactionRating),
      reason_for_follow_up: reasonDesc,
      follow_up_date: interactionDate,
      follow_up_time: convertTo24HrFormat(interactionTime),
      fresh_lead_id: freshLeadId,
    };

    await updateFollowUp(followUpId, updatePayload);

    // Create a new FollowUpHistory entry to reflect the updated details
    await createFollowUpHistoryAPI({
      follow_up_id: followUpId,
      connect_via: capitalize(contactMethod),
      follow_up_type: followUpType,
      interaction_rating: capitalize(interactionRating),
      reason_for_follow_up: reasonDesc,
      follow_up_date: interactionDate,
      follow_up_time: convertTo24HrFormat(interactionTime),
      fresh_lead_id: freshLeadId,
    });
  };

  const handleScheduleReminder = async () => {
    const freshLeadId =
      clientInfo.fresh_lead_id || clientInfo.freshLeadId || clientInfo.id;

    if (!freshLeadId || !clientInfo.name || !interactionDate || !reminderTime) {
      return Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please ensure all required fields (client name, date, and time) are filled.",
      });
    }

    try {
      const userId = executiveInfo?.id;
      if (!userId) {
        throw new Error("User ID not found.");
      }

      await scheduleFollowUpNotificationAPI({
        userId,
        clientName: clientInfo.name,
        date: interactionDate,
        time: convertTo24HrFormat(reminderTime),
        targetRole: "executive",
      });

      Swal.fire({
        icon: "success",
        title: "Reminder Scheduled",
        text: `Follow-up reminder for ${clientInfo.name} has been scheduled.`,
      });

      await fetchNotifications({ userId, userRole: "executive" });
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Schedule Reminder",
        text: error.message || "Something went wrong. Please try again.",
      });
    }
  };

  const handleUpdateFollowUp = async () => {
    const freshLeadId =
      clientInfo.fresh_lead_id || clientInfo.freshLeadId || clientInfo.id;

    if (!freshLeadId) {
      return Swal.fire({
        icon: "error",
        title: "Missing Lead ID",
        text: "Unable to find the lead. Please reload and try again.",
      });
    }

    try {
      const followUpId = clientInfo.followUpId || clientInfo.id;

      // Update follow-up details and create history entry
      await updateFollowUpDetails(freshLeadId, followUpId);

      Swal.fire({ icon: "success", title: "Follow-Up Updated" });

      // Refresh data and navigate
      await fetchFreshLeadsAPI();
      await fetchMeetings();
      await refreshMeetings();
      loadFollowUpHistories(freshLeadId);
      setTimeout(() => navigate("/executive/follow-up"), 1000);
    } catch (err) {
      console.error("Follow-Up Update Error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  const handleCreateMeeting = async () => {
    const freshLeadId =
      clientInfo.fresh_lead_id || clientInfo.freshLeadId || clientInfo.id;

    if (!freshLeadId) {
      return Swal.fire({
        icon: "error",
        title: "Missing Lead ID",
        text: "Unable to find the lead. Please reload and try again.",
      });
    }

    if (!reasonDesc) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Reason",
        text: "Please add a reason before creating a meeting.",
      });
    }

    try {
      const followUpId = clientInfo.followUpId || clientInfo.id;

      // First, update follow-up details and create history entry
      await updateFollowUpDetails(freshLeadId, followUpId);

      // Then, schedule the meeting
      const meetingPayload = {
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone,
        reasonForFollowup: reasonDesc,
        startTime: new Date(
          `${
            interactionDate || new Date().toISOString().split("T")[0]
          }T${convertTo24HrFormat(interactionTime)}`
        ).toISOString(),
        endTime: null,
        fresh_lead_id: freshLeadId,
      };
      await createMeetingAPI(meetingPayload);

      Swal.fire({ icon: "success", title: "Meeting Created" });

      // Refresh data and navigate
      await fetchFreshLeadsAPI();
      await fetchMeetings();
      await refreshMeetings();
      loadFollowUpHistories(freshLeadId);
      setTimeout(() => navigate("/executive/follow-up"), 1000);
    } catch (err) {
      console.error("Meeting Creation Error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  const handleFollowUpAction = async () => {
    const freshLeadId =
      clientInfo.fresh_lead_id || clientInfo.freshLeadId || clientInfo.id;

    if (!freshLeadId) {
      return Swal.fire({
        icon: "error",
        title: "Missing Lead ID",
        text: "Unable to find the lead. Please reload and try again.",
      });
    }

    try {
      if (followUpType === "converted") {
        await createConvertedClientAPI({ fresh_lead_id: freshLeadId });
        await createFollowUpHistoryAPI({
          follow_up_id: clientInfo.followUpId || clientInfo.id,
          connect_via: capitalize(contactMethod),
          follow_up_type: followUpType,
          interaction_rating: capitalize(interactionRating),
          reason_for_follow_up: reasonDesc,
          follow_up_date: interactionDate,
          follow_up_time: convertTo24HrFormat(interactionTime),
          fresh_lead_id: freshLeadId,
        });
        Swal.fire({ icon: "success", title: "Client Converted" });
      } else if (followUpType === "close") {
        await createCloseLeadAPI({ fresh_lead_id: freshLeadId });
        await createFollowUpHistoryAPI({
          follow_up_id: clientInfo.followUpId || clientInfo.id,
          connect_via: capitalize(contactMethod),
          follow_up_type: followUpType,
          interaction_rating: capitalize(interactionRating),
          reason_for_follow_up: reasonDesc,
          follow_up_date: interactionDate,
          follow_up_time: convertTo24HrFormat(interactionTime),
          fresh_lead_id: freshLeadId,
        });
        Swal.fire({ icon: "success", title: "Lead Closed" });
      } else {
        return; // Do nothing for other types; handled by specific buttons
      }

      await fetchFreshLeadsAPI();
      await fetchMeetings();
      await refreshMeetings();
      loadFollowUpHistories(freshLeadId);
      setTimeout(() => navigate("/executive/follow-up"), 1000);
    } catch (err) {
      console.error("Follow-up Action Error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  const toggleListening = () => {
  if (!recognitionRef.current) {
    alert(
      "Speech recognition is not supported in this browser. Please use a supported browser like Google Chrome."
    );
    return;
  }
  if (isListening) {
    stopListening();
  } else {
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  }
};

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const isMeetingInPast = useMemo(() => {
    if (followUpType !== "appointment" || !interactionDate || !interactionTime)
      return false;
    const selectedDateTime = new Date(`${interactionDate}T${interactionTime}`);
    const now = new Date();
    return selectedDateTime < now;
  }, [followUpType, interactionDate, interactionTime]);

  return (
    <>
      <div className="client-overview-wrapper">
        {/* Client Details */}
        <div className="c-container">
          <div className="c-header">
            <h2>Client Details</h2>
          </div>
          <div className="c-content">
            <div className="c-layout">
              <div className="client-info-column">
                <div className="c-profile">
                  <div className="c-info">
                    {clientFields.map(({ key, label }) => (
                      <div className="info-item" key={key}>
                        <span className="label">{label}:</span>
                        <input
                          type="text"
                          className="client-input"
                          value={clientInfo[key] || ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="follow-up-column">
                <div className="follow-up-box">
                  <div className="follow-up-header">
                    <h3>Follow-up History</h3>
                  </div>
                  {isLoading ? (
                    <div className="loading-state">
                      <p>Loading follow-up history...</p>
                    </div>
                  ) : histories.length > 0 ? (
                    <div className="followup-history-list">
                      {histories.map((history, index) => (
                        <div
                          key={index}
                          className={`followup-entry ${
                            index === 0
                              ? "latest-followup"
                              : "previous-followup"
                          }`}
                          style={{
                            marginBottom: "5px",
                            padding: "10px",
                            borderRadius: "5px",
                            position: "relative",
                          }}
                        >
                          {/* Date and Time in top right corner */}
                          <div
                            className="followup-datetime"
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "20px",
                              textAlign: "right",
                              fontSize: "0.8em",
                              color: "#666",
                            }}
                          >
                            <div className="date">
                              {new Date(history.createdAt).toLocaleDateString()}
                            </div>
                            <div className="time">
                              {new Date(history.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </div>
                          </div>

                          <div className="followup-content">
                            {/* Latest badge and interaction badges in one row */}
                            <div
                              className="badges-row"
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                                marginBottom: "8px",
                                marginLeft: "-10px",
                                flexWrap: "wrap",
                              }}
                            >
                              {index === 0 && (
                                <span
                                  className="latest-badge"
                                  style={{
                                    display: "inline-block",
                                  }}
                                >
                                  Latest
                                </span>
                              )}

                              <span
                                className="connect-badge"
                                style={{
                                  backgroundColor: "#28a745",
                                  color: "white",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontSize: "0.75em",
                                  fontWeight: "bold",
                                }}
                              >
                                {history.connect_via || "Call"}
                              </span>
                              <span
                                className="c-rating-badge"
                                style={{
                                  backgroundColor: "#fd7e14",
                                  color: "white",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontSize: "0.75em",
                                  fontWeight: "bold",
                                }}
                              >
                                {history.interaction_rating || "Warm"}
                              </span>
                            </div>

                            {/* Follow-up reason */}
                            <p
                              className="followup-reason"
                              style={{
                                margin: "0",
                                paddingRight: "80px", // Give space for date/time
                                lineHeight: "1.4",
                              }}
                            >
                              {history.reason_for_follow_up ||
                                "No description available."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No follow-up history available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Client Interaction */}
        <div className="client-interaction-container">
          <div className="interaction-form">
            <SendEmailToClients clientInfo={clientInfo} />

            <div className="connected-via">
              <h4>Connected Via</h4>
              <div className="radio-group">
                {["Call", "Email", "Call/Email"].map((method) => (
                  <label key={method} className="radio-container">
                    <input
                      type="radio"
                      name="contactMethod"
                      checked={contactMethod === method}
                      onChange={() => setContactMethod(method)}
                    />
                    <span className="radio-label">
                      {contactIcons[method]}
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="follow-up-type">
              <h4>Follow-Up Type</h4>
              <div className="radio-group">
                {[
                  "interested",
                  "appointment",
                  "no response",
                  "converted",
                  "not interested",
                  "close",
                ].map((type) => (
                  <label key={type} className="radio-container">
                    <input
                      type="radio"
                      name="followUpType"
                      checked={followUpType === type}
                      onChange={() => setFollowUpType(type)}
                    />
                    <span className="radio-label">
                      {followUpIcons[type]}
                      {type.replace("-", " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="interaction-rating">
              <h4>Interaction Rating</h4>
              <div className="radio-group">
                {["hot", "warm", "cold"].map((rating) => (
                  <label key={rating} className="radio-container">
                    <input
                      type="radio"
                      name="interactionRating"
                      checked={interactionRating === rating}
                      onChange={() => setInteractionRating(rating)}
                    />
                    <span className="radio-label">
                      {ratingIcons[rating]}
                      {rating.charAt(0).toUpperCase() + rating.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Follow-Up Detail */}
        <div className="followup-detail-theme">
          <div className="followup-detail-container">
            <div className="follow-up-reason">
              <h3>Reason for Follow-Up</h3>
              <div className="interaction-field">
                <div className="textarea-with-speech">
                  <textarea
                    value={reasonDesc}
                    onChange={(e) => setReasonDesc(e.target.value)}
                    className="interaction-textarea"
                    placeholder="Type or speak your follow-up reason using the mic"
                  />
                  <button
                    type="button"
                    className={`speech-btn ${isListening ? "listening" : ""}`}
                    onClick={toggleListening}
                    aria-label={
                      isListening ? "Stop recording" : "Start recording"
                    }
                  >
                    {isListening ? "⏹" : "🎤"}
                  </button>
                </div>

                <div
                  className="interaction-datetime"
                  style={{ marginTop: "10px" }}
                >
                  {/* Show Date and Time inputs only when appointment is selected */}
                  {followUpType === "appointment" && (
                    <>
                      <h4>Interaction Schedule and Time</h4>
                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <label style={{ display: "block" }}>Date:</label>
                          <input
                            type="date"
                            value={interactionDate}
                            min={minDate}
                            max={maxDate}
                            onChange={(e) => setInteractionDate(e.target.value)}
                            style={{ padding: "8px", borderRadius: "4px" }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {/* TIME FIELD */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "10px",
                              width: "200px",
                            }}
                          >
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "4px",
                                  fontWeight: "500",
                                }}
                              >
                                Time:
                              </label>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  border: "1px solid #ccc",
                                  borderRadius: "6px",
                                  padding: "0 10px",
                                  backgroundColor: "#fff",
                                  height: "38px",
                                }}
                              >
                                <input
                                  type="time"
                                  value={timeOnly}
                                  onChange={(e) => setTimeOnly(e.target.value)}
                                  style={{
                                    border: "none",
                                    outline: "none",
                                    width: "100px",
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={handleUseCurrentTime}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    color: "#007bff",
                                    padding: "2px 4px",
                                    borderRadius: "3px",
                                    marginLeft: "4px",
                                  }}
                                  title="Use current time"
                                >
                                  Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "10px",
                      width: "200px",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      Set Follow-up Reminder:
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        padding: "0 10px",
                        backgroundColor: "#fff",
                        height: "38px",
                        width: "150px",
                      }}
                    >
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          width: "100px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleScheduleReminder}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "12px",
                          color: "#007bff",
                          padding: "2px 4px",
                          borderRadius: "3px",
                          marginLeft: "4px",
                        }}
                        title="Schedule Reminder"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {followUpType === "appointment" && isMeetingInPast && (
          <div
            style={{
              marginTop: "12px",
              color: "#b71c1c",
              background: "#fff4f4",
              borderLeft: "4px solid #e57373",
              padding: "10px 15px",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            ⚠ Please select a <strong>future date or time</strong> to schedule
            the meeting.
          </div>
        )}

        <div
          className="button-group"
          style={{
            marginTop: "5px",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* Update Follow-Up button */}
          <button
            onClick={handleUpdateFollowUp}
            className="crm-button update-follow-btn"
            disabled={followUpLoading}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              cursor: followUpLoading ? "not-allowed" : "pointer",
              opacity: followUpLoading ? 0.6 : 1,
            }}
          >
            {followUpLoading ? "Processing..." : "Update Follow-Up"}
          </button>

          {/* Show these based on follow-up type */}
          {followUpType === "converted" && (
            <button
              onClick={handleFollowUpAction}
              className="crm-button converted-btn"
              disabled={followUpLoading}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "10px 20px",
                marginLeft: "10px",
                marginRight: "10px",
                borderRadius: "5px",
                border: "none",
              }}
            >
              Create Converted
            </button>
          )}

          {followUpType === "close" && (
            <button
              onClick={handleFollowUpAction}
              className="crm-button flw-close-btn"
              disabled={followUpLoading}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                padding: "10px 20px",
                marginLeft: "10px",
                borderRadius: "5px",
                border: "none",
              }}
            >
              Create Close
            </button>
          )}

          {followUpType === "appointment" && (
            <button
              onClick={handleCreateMeeting}
              className="crm-button meeting-btn"
              disabled={followUpLoading}
              style={{
                backgroundColor: "#17a2b8",
                color: "white",
                padding: "10px 20px",
                marginLeft: "10px",
                borderRadius: "5px",
                border: "none",
              }}
            >
              Create Meeting
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientDetailsOverview;