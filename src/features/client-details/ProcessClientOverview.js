import React, { useState, useEffect, useRef, useMemo } from "react";
import { useProcessService } from "../../context/ProcessServiceContext";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useExecutiveActivity } from "../../context/ExecutiveActivityContext";
import Swal from "sweetalert2";
import useCopyNotification from "../../hooks/useCopyNotification";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import ProcessSendEmailtoClients from "../process-client/ProcessSentEmailtoClient";
function convertTo24HrFormat(timeStr) {
  const dateObj = new Date(`1970-01-01 ${timeStr}`);
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  const seconds = "00";
  return `${hours}:${minutes}:${seconds}`;
}

const ProcessClientOverview = () => {
  const { id } = useParams();
    const {handleGetCustomerStagesById,processCreateFollowUp,getProcessFollowup,createMeetingApi,getComments,createStages,createReminder,fetchAllHistory } = useProcessService();
  const location = useLocation();
  const navigate = useNavigate();
const client = useMemo(() => location.state?.client || {}, [location.state?.client]);

  const createFollowUpFlag = location.state?.createFollowUp || false;
const userData = JSON.parse(localStorage.getItem("user"));
const name = userData?.fullName || "";
const email = userData?.email || "";
  const {
    followUpLoading,
    fetchNotifications,
    createCopyNotification,
  } = useApi();
 
  useCopyNotification(createCopyNotification, fetchNotifications);
const now = useMemo(() => new Date(), []);
  const todayStr = now.toISOString().split("T")[0];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const ampmValue = currentHour >= 12 ? "PM" : "AM";
  const hour12 = currentHour % 12 || 12;
  const currentTime12Hour = `${hour12.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
  const [clientInfo, setClientInfo] = useState(client);
  const [contactMethod, setContactMethod] = useState("");
  const [followUpType, setFollowUpType] = useState("");
  const [interactionRating, setInteractionRating] = useState("");
  const [reasonDesc, setReasonDesc] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interactionDate, setInteractionDate] = useState(todayStr);
  const [timeOnly, setTimeOnly] = useState(currentTime12Hour);
  const [ampm, setAmPm] = useState(ampmValue);
  const [isTimeEditable, setIsTimeEditable] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const [, setStagesData] = useState({});
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [emailBody, setEmailBody] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [docName, setDocName] = useState("");
  const[historyFollowup,setHistoryFollowup]=useState();
 
  let customerId;
useEffect(() => {
    const fetchFollowupAllHistory = async () => {
      try {
        const result = await fetchAllHistory(id);
        setHistoryFollowup(result?.data || []);
            
      } catch (error) {
        console.error("Failed to load followups:", error);
      } finally {
    
      }
    };
if (id) fetchFollowupAllHistory();
  
  }, [id,fetchAllHistory]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await getProcessFollowup(id);
        setHistoryFollowup(result.data); // The backend sends { message, data }
        console.log(result.data);
      } catch (err) {
        console.error("Failed to load follow-up history", err.message);
        setHistoryFollowup([]);
      } finally {
      }
    };

    if (id) {
      fetchHistory();
    }
  }, [id,getProcessFollowup]);

  const convertTo24Hour = (time12h, amPm) => {
    let [hours, minutes] = time12h.split(':').map(Number);
    if (amPm === 'PM' && hours !== 12) hours += 12;
    if (amPm === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const convertTo12Hour = (time24h) => {
    let [hours, minutes] = time24h.split(':').map(Number);
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return {
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      amPm: amPm
    };
  };

  const timeSelectRef = useRef(null);
 

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(isListening);
  const interactionTime = useMemo(() => {
    let [hr, min] = timeOnly.split(":").map(Number);
    if (ampm === "PM" && hr !== 12) hr += 12;
    if (ampm === "AM" && hr === 12) hr = 0;
    return `${hr.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:00`;
  }, [timeOnly, ampm]);
const minDate =  todayStr
  const maxDate = useMemo(() => {
  const d = new Date(now);
  d.setFullYear(d.getFullYear() + 5);
  return d.toISOString().split("T")[0];
}, [now]);


  const clientFields = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "altPhone", label: "Alt Phone" },
    { key: "education", label: "Education" },
    { key: "experience", label: "Experience" },
    { key: "state", label: "State" },
    { key: "dob", label: "Date of Birth" },
    { key: "country", label: "Country" },
  ];

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const handleChange = (field, value) => {
    setClientInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleTextUpdate = async () => {
    if (!followUpType || !interactionDate || !interactionTime) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please select a follow-up type, date and time before updating.",
      });
    }

    const followUpId = clientInfo.followUpId || clientInfo.freshLeadId || clientInfo.id;
    if (!followUpId) {
      console.error("Missing follow-up ID on clientInfo:", clientInfo);
      return Swal.fire({
        icon: "error",
        title: "Missing Record ID",
        text: "Unable to find the record to update. Please reload and try again.",
      });
    }

    try {
      if (followUpType === "meeting") {
     const meetingPayload = {
          clientName: clientInfo.name,
          clientEmail: clientInfo.email,
          clientPhone: clientInfo.phone,
          reasonForFollowup: reasonDesc,
          startTime: new Date(`${interactionDate}T${interactionTime}`).toISOString(),
          endTime: null,
          connect_via: contactMethod, 
        follow_up_type: followUpType, 
        interaction_rating: interactionRating, 
        follow_up_date: interactionDate, 
        follow_up_time: convertTo24HrFormat(interactionTime), 
          fresh_lead_id:  String(clientInfo.freshLeadId),
        };
        await createMeetingApi(meetingPayload);
         await getProcessFollowup(id);
   Swal.fire({ 
               icon: "success", 
               title: "Meeting Created",
               text: "Meeting created successfully!"
             });
     
       
        
        setTimeout(() => {
  navigate("/process/freshlead"); // Replace the current URL with the new one
}, 1000);
        return;
      } else {
 
     
      }

      setFollowUpType("");
      setInteractionDate("");
      setTimeOnly("12:00");
      setAmPm("AM");
      setIsTimeEditable(false);
      setReasonDesc("");
    } catch (error) {
      console.error("Error in handleTextUpdate:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  const handleCreateFollowUp = async () => {
    if (
      !contactMethod ||
      !followUpType ||
      !interactionRating ||
      !interactionDate ||
      !interactionTime
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill out all required fields before creating follow-up.",
      });
    }
        try {
 const newFollowUpData= {
   fresh_lead_id: String(clientInfo.freshLeadId),
     connect_via: contactMethod,
     follow_up_date: interactionDate,
      follow_up_time: convertTo24HrFormat(interactionTime),
        follow_up_type: followUpType,
   comments: reasonDesc,
   interaction_rating:interactionRating,
   document_name:docName

}
   await processCreateFollowUp(newFollowUpData);
  const result=  await getProcessFollowup(id)
    setHistoryFollowup(result.data);
  Swal.fire({ 
            icon: "success", 
            title: "Follow-up Created",
            text: "Follow-up and history created successfully!"
          });
         setTimeout(() => {
           navigate("/process/freshlead");
 // Replace the current URL with the new one
}, 1000);
}catch (error) {
    
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong. Please try again.",
      });
    }   
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      return Swal.fire({
        icon: "error",
        title: "Speech Recognition Not Supported",
        text: "Speech recognition is not supported in this browser. Please use a supported browser like Google Chrome.",
      });
    }
    isListening ? stopListening() : recognitionRef.current.start();
    setIsListening(!isListening);
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const { handleSendEmail } = useExecutiveActivity();
  const [sendingEmail, setSendingEmail] = useState(false);

  const isMeetingInPast = useMemo(() => {
    if (followUpType !== "meeting" || !interactionDate || !interactionTime) return false;
    const selectedDateTime = new Date(`${interactionDate}T${interactionTime}`);
    const now = new Date();
    return selectedDateTime < now;
  }, [followUpType, interactionDate, interactionTime]);
 // Replace with actual customer ID logic

  // 🔹 Fetch stages on mount / on demand
useEffect(() => {
  const fetchStages = async () => {
    try {
      const data = await handleGetCustomerStagesById(id);
      setStagesData(data);
    } catch (err) {
      console.error("Error fetching stages", err.message);
    }
  };

  fetchStages();
}, [id, customerId,handleGetCustomerStagesById]);


  // 🔹 Add or update stage comment

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "N/A";
  const [hour, minute] = timeStr.split(":");
  const date = new Date();
  date.setHours(+hour);
  date.setMinutes(+minute);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
 
  const [latestComment, setLatestComment] = useState({});
  const [history, setHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Load latest comment when stage is selected
  const handleStageChange = async (e) => {
    const stage = e.target.value;
    setSelectedStage(stage);

    const stageNumber = Number(stage.split(" ")[1]);
    try {
      const result = await getComments(clientInfo.id, stageNumber);
      const comments = result.comments || [];

      if (comments.length) {
        setLatestComment({
          [stage]: comments[comments.length - 1]
        });
        setHistory(comments);
      } else {
        setLatestComment({
          [stage]: { comment: "-", timestamp: "" }
        });
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to load comments", err.message);
    }
  };

  // Open view history modal
  const handleViewHistory = async () => {
    setShowHistoryModal(true);
  };

  // Submit new comment
  const handleAddCommentSubmit = async () => {
    const stageNumber = Number(selectedStage.split(" ")[1]);
    try {
      await createStages(clientInfo.id, stageNumber, newComment);

      // Refresh latest comment
      const result = await getComments(clientInfo.id, stageNumber);
      const comments = result.comments || [];

      if (comments.length) {
        setLatestComment({
          [selectedStage]: comments[comments.length - 1]
        });
        setHistory(comments);
      }

      setNewComment("");
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add comment", err.message);
    }
  };
const handleSubmit = async () => {
  const stageNumber = Number(selectedStage.split(" ")[1]);

  const latest = latestComment[selectedStage]?.comment;

  if (!latest) {
    console.warn("No comment found to send as reminder.");
    return;
  }

  try {
    await createReminder(client.id, stageNumber, latest); // ✅ Send latest comment

   
    const result = await getComments(client.id, stageNumber);
    const comments = result.comments || [];

    if (comments.length) {
      const sorted = [...comments].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setLatestComment((prev) => ({
        ...prev,
        [selectedStage]: sorted[0],
      }));
    }

    setNewComment("");
setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  } catch (err) {
    console.error("Failed to add reminder:", err.message);
  }
};
console.log(clientInfo,"id");


  const handleTemplateSelect = (template, clientEmail) => {
    if (template) {
      setSelectedTemplate(template);
      setEmailBody(template.body);
      setEmailSubject(template.subject);
      setClientEmail(clientEmail);
      setShowEmailModal(true);
    } else {
      setShowEmailModal(false);
      setSelectedTemplate(null);
      setEmailBody("");
      setEmailSubject("");
      setClientEmail("");
    }
  };
  useEffect(() => {
    console.log("Template selected:", selectedTemplate);
    console.log("Show Email Modal?", showEmailModal);
  }, [selectedTemplate, showEmailModal]);
  
  const handleEmailSubmit = async () => {
    setSendingEmail(true);

    try {
      const emailPayload = {
        templateId: selectedTemplate.id,
        executiveName: name,
        executiveEmail: email,
        clientEmail: clientInfo.email,
        emailBody: emailBody,
        emailSubject: emailSubject,
      };

      await handleSendEmail(emailPayload);
      alert("Email sent successfully!");
      setShowEmailModal(false);
      setSelectedTemplate(null);
      setEmailBody("");
      setEmailSubject("");
      setClientEmail("");
    } catch (err) {
      console.error(err);
      alert("Failed to send email.");
    } finally {
      setSendingEmail(false);
    }
  };


useEffect(() => {
  if (!selectedStage) return;

  const key = `comment_${id}_stage_${selectedStage}`;
  const stored = JSON.parse(localStorage.getItem(key) || "[]");

  if (stored.length) {
    setLatestComment(prev => ({
      ...prev,
      [selectedStage]: stored[stored.length - 1],
    }));
  }
}, [selectedStage,id]);

  return (
    <div className="client-overview-wrapper">
      <div className="c-container">
    
          <h2 style={{marginLeft:"9px",marginBottom:"10px"}}>Client Details</h2>
        
    
        <div className="c-content">
          <div className="c-layout">
            <div className="client-info-column">
              <div className="c-profile">
                <div className="c-info">
                  {clientFields.map(({ key, label }) => (
                    <div className="info-item" key={key}>
                      <label className="label">{label}:</label>
                      <input
                        type="text"
                        value={clientInfo[key] || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="client-input"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="follow-up-column">
              <div className="follow-up-box">
                <h3>Last Follow-up</h3>
               <div className="table-body">
 <div className="last-follow-up">
 {Array.isArray(historyFollowup) && historyFollowup.length > 0 ? (
  historyFollowup.map((client, index) => (
    <div key={index} className="followup-item">
      {/* Reason for follow-up */}
      <div className="followup-reason">
        {client.reason_for_follow_up|| "N/A"}
      </div>

      {/* Follow-up Date and Time */}
      <div className="followup-datetime">
        <span className="followup-date">{formatDate(client.follow_up_date)}</span>
        <span className="followup-time">{formatTime(client.follow_up_time)}</span>
      </div>
    </div>
  ))
) : (
  <div className="no-data-text">No follow-up texts</div>
)}
</div>
</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="client-interaction-container">
        <div className="interaction-form">
           <div style={{ position: "relative" }}>
                      <ProcessSendEmailtoClients clientInfo={clientInfo} onTemplateSelect={handleTemplateSelect} />
                      {showEmailModal && (
                        <div
                          style={{
                            position: "absolute",
                            left: 800,
                            width: "400px",
                            backgroundColor: "#f5f7fa",
                            border: "1px solid #e0e0e0",
                            borderRadius: "5px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            zIndex: 6,
                            padding: "15px",
                            height: "auto",
                            marginTop: "-60px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              borderBottom: "1px solid #e0e0e0",
                              paddingBottom: "5px",
                              marginBottom: "10px",
                            }}
                          >
                            <h4 style={{ margin: 0, fontSize: "16px" }}>New Message</h4>
                            <div>
                              <button
                                onClick={() => setShowEmailModal(false)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                  marginLeft: "10px",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <div style={{ marginBottom: "10px" }}>
                            <label style={{ display: "block", fontSize: "14px", marginBottom: "5px" }}>
                              To
                            </label>
                            <input
                              type="email"
                              value={clientEmail}
                              readOnly
                              style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #e0e0e0",
                                fontSize: "14px",
                              }}
                            />
                          </div>
                          <div style={{ marginBottom: "10px" }}>
                            <label style={{ display: "block", fontSize: "14px", marginBottom: "5px" }}>
                              Subject
                            </label>
                            <input
                              type="text"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #e0e0e0",
                                fontSize: "14px",
                              }}
                            />
                          </div>
                          <div style={{ marginBottom: "10px" }}>
                            <textarea
                              value={emailBody}
                              onChange={(e) => setEmailBody(e.target.value)}
                              style={{
                                width: "100%",
                                height: "150px",
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #e0e0e0",
                                fontSize: "14px",
                                resize: "vertical",
                              }}
                              placeholder="Email body"
                            />
                          </div>
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                              onClick={handleEmailSubmit}
                              disabled={sendingEmail}
                              style={{
                                backgroundColor: "#28a745",
                                color: "white",
                                padding: "8px 16px",
                                borderRadius: "5px",
                                border: "none",
                                cursor: sendingEmail ? "not-allowed" : "pointer",
                                opacity: sendingEmail ? 0.6 : 1,
                              }}
                            >
                              {sendingEmail ? "Sending..." : "Send"}
                            </button>
                          </div>
                        </div>
                      )}
          
                    </div>
         <div className="connected-via">
            <h4 style={{marginBottom:"10px"}}>Connected Via</h4>
            <div className="radio-group">
              {["Call", "Email", "Call/Email"].map((method) => (
                <label key={method} className="radio-container">
                  <input
                    type="radio"
                    name="contactMethod"
                    checked={contactMethod === method}
                    onChange={() => setContactMethod(method)}
                  />
                  <span className="radio-label">{method}</span>
                </label>
              ))}
            </div>
          </div>
         <div className="follow-up-type"  style={{ marginBottom: "10px" }}>
            <h4 style={{marginBottom:"10px"}}>Follow-Up Type</h4>
            <div className="radio-group">
              {["document collection","payment follow-up","visa filing","meeting"].map((type) => (
                <label key={type} className="radio-container">
                  <input
                    type="radio"
                    name="followUpType"
                    checked={followUpType === type}
                    onChange={() => setFollowUpType(type)}
                  />
                  <span className="radio-label">{type.replace("-", " ")}</span>
                </label>
              ))}
            </div>
          </div>
                     {followUpType === "document collection" && (
  <div className="doc-dropdown" style={{ marginBottom: "10px" }}>
  <label style={{marginTop:"10px",fontWeight:"700"}}>Select Document:</label>
  <select
    value={docName}
    onChange={(e) => setDocName(e.target.value)}
    style={{ padding: "8px", borderRadius: "5px", width: "50%", cursor: "pointer", display: "block", marginTop: "8px" }}
  >
    <option value="">Select Document</option>
    <option value="aadharcard">Aadhar Card</option>
    <option value="pancard">Pan Card</option>
    <option value="10th">10th Marksheet</option>
    <option value="12th">12th Marksheet</option>
    <option value="passport">Passport</option>
    <option value="other">Other</option>
  </select>

  {docName === "other" && (
    <input
      type="text"
      placeholder="Enter custom document name"
      value={docName}
      onChange={(e) => setDocName(e.target.value)}
      style={{
        marginTop: "10px",
        padding: "8px",
        borderRadius: "5px",
        width: "50%",
        border: "1px solid #ccc",
        display: "block",
      }}
    />
  )}
</div>


  )}
 <div className="interaction-rating" >
            <h4 style={{marginBottom:"10px"}}>Interaction Rating</h4>
            <div className="radio-group">
              {["Aggressive", "Calm", "Neutral"].map((rating) => (
                <label key={rating} className="radio-container">
                  <input
                    type="radio"
                    name="interactionRating"
                    checked={interactionRating === rating}
                    onChange={() => setInteractionRating(rating)}
                  />
                  <span className="radio-label">
                    {rating.charAt(0).toUpperCase() + rating.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>
<div>
     

 <h4 style={{marginTop:"20px"}}>Add Comments based on Stages</h4>
   <div className="stage-comments-container">
      <div className="stage-select-container">
        <select
          value={selectedStage}
          onChange={handleStageChange}
          className="stage-select"
        >
          <option value="" disabled>Select stages</option>
          {Array.from({ length: 15 }, (_, i) => (
            <option key={i + 1} value={`Stage ${i + 1}`}>
              Stage {i + 1}
            </option>
          ))}
        </select>
        <div className="reminder-action-wrapper">
  <div className="reminder-tooltip-wrapper">
     <span className="reminder-inline-label">Send the latest comment as a reminder</span>
    <button onClick={handleSubmit} className="reminder-button">⏰</button>
  </div>
 

  {showToast && (
    <span className="reminder-toast-inline">Reminder sent successfully!</span>
  )}
</div>

      </div>

      {selectedStage && (
    <table className="new-stage-comments-table">
  <thead>
    <tr>
      <th>Stage</th>
      <th>Comment</th>
      <th>View History</th>
      <th>Add Comment</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{selectedStage}</td>
      <td className="new-comment-cell">
        {latestComment[selectedStage]?.comment ? (
          <>
        {(latestComment[selectedStage]?.comment || "")
  .split(/(\/processperson\/client\/upload\/\w+)/g)
  .map((part, idx) => {
    const isUploadLink = /^\/processperson\/client\/upload\/\w+$/.test(part);

    if (isUploadLink) {
      return (
        <span
          key={idx}
          onClick={() => {
            const fullComment = latestComment[selectedStage]?.comment || "";

            // Extract comment text before the link
            const commentOnly = fullComment
              .split(/\/processperson\/client\/upload\/\w+/)[0]
              .trim();

            const idMatch = part.match(/\/processperson\/client\/upload\/(\w+)/);
            const extractedId = idMatch?.[1];

            navigate(`/processperson/client/upload/${extractedId}`, {
              state: {
                label: commentOnly,
                defaultFilename: commentOnly,
              },
            });
          }}
          style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer" }}
        >
          {part}
        </span>
      );
    }

    return <span key={idx}>{part}</span>;
  })}

          </>
        ) : (
          "-"
        )}
      </td>
      <td>
        <button
          className="p-action-btn"
          onClick={handleViewHistory}
          disabled={!history.length}
        >
          View History
        </button>
      </td>
      <td>
        <button
          className="p-action-btn"
          onClick={() => setShowAddModal(true)}
        >
          Add Comment
        </button>
      </td>
    </tr>
  </tbody>
</table>

      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>History for {selectedStage}</h4>
            <button className="modal-close-btn" onClick={() => setShowHistoryModal(false)}>×</button>
            {history.length ? (
              <ul className="history-list">
                {history.map((c, idx) => (
                  <li key={idx}>
                    <strong>{new Date(c.timestamp).toLocaleString()}:</strong> {c.comment}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No history available</p>
            )}
          </div>
        </div>
      )}

      {/* Add Comment Modal */}
  {showAddModal && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h4>Add Comment for {selectedStage}</h4>
      <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>×</button>

      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Enter your comment"
        className="comment-textarea"
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
       <button
  className="submit-btn"
  style={{ backgroundColor: "#0056b3", color: "white" }}
  onClick={() =>
    setNewComment((prev) => {
      const baseLink = `/processperson/client/upload/${client.id}`;
      return prev.includes(baseLink) ? prev : prev.trim() + " " + baseLink;
    })
  }
  disabled={!newComment.trim()}
>
  Generate Link
</button>

        <button
          className="submit-btn"
          onClick={handleAddCommentSubmit}
          disabled={!newComment.trim()}
        >
          Submit
        </button>

        
      </div>
    </div>
  </div>
)}


    </div>
    </div>
      </div>
    </div>
      <div className="followup-detail-theme">
        <div className="followup-detail-container">
          <div className="follow-up-reason">
            <h3>Reason for followup</h3>
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
                  aria-label={isListening ? "Stop recording" : "Start recording"}
                >
                  {isListening ? "⏹" : "🎤"}
                </button>
              </div>

              <div className="interaction-datetime" style={{ marginTop: "20px" }}>
                <h4>Interaction Schedule and Time</h4>
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
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

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "4px" }}>Time:</label>
                    <div
                      style={{
                        display: "flex",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        overflow: "hidden",
                        width: "150px",
                        backgroundColor: "white"
                      }}
                    >
                      <div style={{ position: "relative", flex: 1 }}>
                        {!isTimeEditable ? (
                          <>
                            <select
                              ref={timeSelectRef}
                              value={timeOnly}
                              onChange={(e) => {
                                setTimeOnly(e.target.value);
                                setIsTimeEditable(true);
                              }}
                              style={{
                                border: "none",
                                padding: "8px 4px",
                                width: "100%",
                                appearance: "none",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                              }}
                            >
                              <option value={timeOnly}>{timeOnly}</option>
                              {[
                                "12:00", "12:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30",
                                "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30",
                                "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"
                              ].filter(opt => opt !== timeOnly).map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                            <span
                              onClick={() => timeSelectRef.current?.focus()}
                              style={{
                                position: "absolute",
                                right: "9px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                                fontSize: "12px",
                                color: "#888"
                              }}
                            >
                              ▼
                            </span>
                          </>
                        ) : (
                          <input
                            type="time"
                            value={convertTo24Hour(timeOnly, ampm)}
                            onChange={(e) => {
                              const time24 = e.target.value;
                              if (time24) {
                                const converted = convertTo12Hour(time24);
                                setTimeOnly(converted.time);
                                setAmPm(converted.amPm);
                              }
                            }}
                            onBlur={() => {
                              // setIsTimeEditable(false);
                            }}
                            style={{
                              border: "none",
                              padding: "8px 4px",
                              width: "100%",
                              backgroundColor: "transparent",
                              cursor: "text",
                            }}
                          />
                        )}
                      </div>
                    </div>
                    {isTimeEditable && (
                      <button
                        type="button"
                        onClick={() => setIsTimeEditable(false)}
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "underline",
                          marginTop: "4px",
                          alignSelf: "flex-start"
                        }}
                      >
                        Use preset times
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {followUpType === "meeting" && isMeetingInPast && (
                <div style={{
                  marginTop: "12px",
                  color: "#b71c1c",
                  background: "#fff4f4",
                  borderLeft: "4px solid #e57373",
                  padding: "10px 15px",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}>
                  ⚠ Please select a <strong>future date or time</strong> to schedule the meeting.
                </div>
              )}
               <div className="client-btn">
                 {createFollowUpFlag && (
                  <button className="create-btn" onClick={handleCreateFollowUp} disabled={followUpLoading}>
                    Create Follow-Up
                  </button>
                )}
               
                {(followUpType === "meeting" || followUpType === "converted" || followUpType === "close") && (
  <button  className="update-btn"
                  onClick={handleTextUpdate}
                  disabled={followUpLoading}
                  style={{
                    backgroundColor: followUpType === "converted" ? "#28a745" : followUpType === "close" ? "#dc3545" : followUpType === "meeting" ? "#17a2b8" : "#007bff",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "50px",
                    border: "none",
                    cursor: followUpLoading ? "not-allowed" : "pointer",
                    opacity: followUpLoading ? 0.6 : 1,
                  }}>
    {followUpType === "meeting"
      ? "Create Meeting"
      : followUpType === "converted"
      ? "Convert"
      : "Close"}
  </button>
)} 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessClientOverview;