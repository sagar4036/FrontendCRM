// components/MeetingItem.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faEnvelope,
  faPhone,
  faHistory,
  faEllipsisV,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { formatInteractionSchedule } from "../../utils/helpers";

const MeetingItem = ({ meeting, onAddFollowUp, onShowHistory }) => {
  const start = new Date(meeting.startTime);
  const end = meeting.endTime ? new Date(meeting.endTime) : null;

  return (
    <li className={`meeting-item ${meeting.highlighted ? "highlighted-meeting" : ""}`}>
      <div className="meeting-time">
        <p className="start-time">
          {start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </p>
        {end && (
          <p className="end-time">
            {end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      <div className="meeting-interaction-schedule">
        <FontAwesomeIcon icon={faCalendarAlt} />
        <span>{formatInteractionSchedule(meeting)}</span>
      </div>

      <div className="meeting-details">
        <p className="metadata">{meeting.clientName || meeting.clientDetails || "Unknown Client"}</p>
      </div>

      <div className="meeting-contact-info">
        {meeting.clientEmail && (
          <div className="contact-item">
            <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
            <span className="contact-text">{meeting.clientEmail}</span>
          </div>
        )}
        {meeting.clientPhone && (
          <div className="contact-item">
            <FontAwesomeIcon icon={faPhone} className="contact-icon" />
            <span className="contact-text">{meeting.clientPhone}</span>
          </div>
        )}
      </div>

      <div className="meeting-attendees">
        <button className="add-attendee" onClick={() => onAddFollowUp(meeting)}>
          <FontAwesomeIcon icon={faPlus} />
          <span>Add Follow up</span>
        </button>
      </div>

      <div className="meeting-actions">
        <button className="history-button" onClick={() => onShowHistory(meeting)} title="View Follow-up History">
          <FontAwesomeIcon icon={faHistory} />
          <span>Follow History</span>
        </button>
        <button className="meeting-options">
          <FontAwesomeIcon icon={faEllipsisV} />
        </button>
      </div>
    </li>
  );
};

export default MeetingItem;
