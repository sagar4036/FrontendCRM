import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { convertTo24HrFormat, capitalize } from "../../utils/helpers";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
// FollowUpForm component for adding a new follow-up
const FollowUpForm = ({ meeting, onClose, onSubmit }) => {
  const [clientName, setClientName] = useState(meeting.clientName || "");
  const [email, setEmail] = useState(meeting.clientEmail || "");
  const [reasonDesc, setReasonDesc] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [followUpType, setFollowUpType] = useState("");
  const [interactionRating, setInteractionRating] = useState("");
const interactionDate = new Date().toISOString().split("T")[0];

  const now = new Date();
  const defaultTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
const interactionTime = defaultTime;
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!clientName) newErrors.clientName = "Name is required";
    if (!email) newErrors.email = "Email is required";
    if (!reasonDesc) newErrors.reasonDesc = "Follow-up reason is required";
    if (!contactMethod) newErrors.contactMethod = "Please select a contact method";
    if (!followUpType) newErrors.followUpType = "Please select a follow-up type";
    if (!interactionRating) newErrors.interactionRating = "Please select an interaction rating";
    if (!interactionDate) newErrors.interactionDate = "Interaction date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in all required fields.",
      });
      return;
    }

    console.log("Submitting follow-up form with reason:", reasonDesc);

    onSubmit({
      clientName,
      email,
      reason_for_follow_up: reasonDesc,
      connect_via: capitalize(contactMethod),
      follow_up_type: followUpType,
      interaction_rating: capitalize(interactionRating),
      follow_up_date: interactionDate,
      follow_up_time: convertTo24HrFormat(interactionTime),
    });
  };

  const getFollowUpTypeLabel = (type) => {
    const labels = {
      "interested": "Interested",
      "appointment": "Appointment",
      "no response": "No Response",
      "converted": "Converted",
      "not interested": "Not Interested",
      "close": "Close Lead"
    };
    return labels[type] || type;
  };

  const getFollowUpTypeDescription = (type) => {
    const descriptions = {
      "interested": "Mark lead as interested and move to follow-up list",
      "appointment": "Schedule/reschedule meeting with client",
      "no response": "Client did not respond to contact attempts",
      "converted": "Convert lead to customer",
      "not interested": "Mark lead as not interested",
      "close": "Close this lead permanently"
    };
    return descriptions[type] || "";
  };

  return (
    <div className="followup-form-overlay">
      <div className="followup-form-modal">
        <div className="followup-form-header">
          <h3>Add Follow-Up for {meeting.clientName || "Unnamed Client"}</h3>
          <button className="close-form-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="followup-form-content">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="form-input"
              placeholder="Enter client name"
              required
            />
            {errors.clientName && <span className="error-text">{errors.clientName}</span>}
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter email"
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Follow-Up Reason</label>
            <textarea
              value={reasonDesc}
              onChange={(e) => setReasonDesc(e.target.value)}
              className="interaction-textarea"
              placeholder="Describe the follow-up reason..."
              required
            />
            {errors.reasonDesc && <span className="error-text">{errors.reasonDesc}</span>}
          </div>
          
          <div className="form-group">
            <label>Connected Via</label>
            <div className="radio-group">
              {["call", "email"].map((method) => (
                <label key={method} className="radio-container">
                  <input
                    type="radio"
                    name="contactMethod"
                    checked={contactMethod === method}
                    onChange={() => setContactMethod(method)}
                  />
                  <span className="radio-label">
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </span>
                </label>
              ))}
            </div>
            {errors.contactMethod && <span className="error-text">{errors.contactMethod}</span>}
          </div>
          
          <div className="form-group">
            <label>Follow-Up Type</label>
            <div className="radio-group">
              {[
                "interested",
                "appointment", 
                "no response",
                "converted",
                "not interested",
                "close"
              ].map((type) => (
                <label key={type} className="radio-container" title={getFollowUpTypeDescription(type)}>
                  <input
                    type="radio"
                    name="followUpType"
                    checked={followUpType === type}
                    onChange={() => setFollowUpType(type)}
                  />
                  <span className="radio-label">{getFollowUpTypeLabel(type)}</span>
                </label>
              ))}
            </div>
            {errors.followUpType && <span className="error-text">{errors.followUpType}</span>}
            {followUpType && (
              <div className="follow-up-type-info" style={{ 
                marginTop: "8px", 
                padding: "8px 12px", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "4px", 
                fontSize: "14px", 
                color: "#6c757d" 
              }}>
                {getFollowUpTypeDescription(followUpType)}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Interaction Rating</label>
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
                    {rating.charAt(0).toUpperCase() + rating.slice(1)}
                  </span>
                </label>
              ))}
            </div>
            {errors.interactionRating && <span className="error-text">{errors.interactionRating}</span>}
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {followUpType === "converted" ? "Convert Lead" :
               followUpType === "close" ? "Close Lead" :
               followUpType === "appointment" ? "Update Meeting" :
               followUpType === "interested" ? "Mark as Interested" :
               followUpType === "not interested" ? "Mark as Not Interested" :
               "Save Follow-Up"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowUpForm;