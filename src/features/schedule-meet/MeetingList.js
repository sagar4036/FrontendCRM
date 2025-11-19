// components/MeetingList.jsx
import React from "react";
import MeetingItem from "./MeetingItem";

const MeetingList = ({ meetings, onAddFollowUp, onShowHistory }) => {
  return (
    <ul className="meetings-list">
      {meetings.length > 0 ? (
        meetings.map((meeting) => (
          <MeetingItem
            key={meeting.id}
            meeting={meeting}
            onAddFollowUp={onAddFollowUp}
            onShowHistory={onShowHistory}
          />
        ))
      ) : (
        <li className="no-meetings">No Meetings...</li>
      )}
    </ul>
  );
};

export default MeetingList;
