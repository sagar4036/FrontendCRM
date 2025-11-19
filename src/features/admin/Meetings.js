import React, { useEffect, useState } from "react";
import { FaUserFriends, FaEllipsisV } from "react-icons/fa";
import { useApi } from "../../context/ApiContext";

const Meetings = ({ selectedExecutiveId }) => {
  const { adminMeeting, fetchExecutivesAPI } = useApi();
  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [executives, setExecutives] = useState([]);

  // Fetch executives when the component mounts
  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const execData = await fetchExecutivesAPI();
        console.log("Fetched executives:", execData);
        setExecutives(Array.isArray(execData) ? execData : []);
      } catch (error) {
        console.error("❌ Error fetching executives:", error);
        setExecutives([]);
      }
    };

    fetchExecutives();
  }, [fetchExecutivesAPI]);

  // Fetch and filter meetings
  useEffect(() => {
    const fetchMeetingsData = async () => {
      setMeetingsLoading(true);
      try {
        const allMeetings = await adminMeeting();
        console.log("Fetched meetings:", allMeetings);
        console.log("Selected Executive ID:", selectedExecutiveId);

        if (Array.isArray(allMeetings)) {
          let filtered = allMeetings;

          // Apply executive filter
          if (selectedExecutiveId && selectedExecutiveId !== "all") {
            filtered = allMeetings.filter(
              (meeting) => String(meeting.executiveId) === selectedExecutiveId
            );
            console.log("Filtered meetings by executive:", filtered);
          }

          // Filter meetings where clientLead.status is "Meeting"
          filtered = filtered.filter(
            (meeting) =>
              meeting.freshLead?.lead?.clientLead?.status === "Meeting"
          );
          console.log("Filtered meetings by status 'Meeting':", filtered);

          // Deduplicate meetings based on clientPhone and latest startTime
          const deduplicatedMap = filtered.reduce((map, meeting) => {
            const key = meeting.clientPhone;
            if (!key) return map;

            if (!map.has(key)) {
              map.set(key, meeting);
            } else {
              const existing = map.get(key);
              const existingTime = new Date(existing.startTime);
              const currentTime = new Date(meeting.startTime);
              if (currentTime > existingTime) {
                map.set(key, meeting);
              }
            }
            return map;
          }, new Map());

          const uniqueMeetings = Array.from(deduplicatedMap.values());
          setMeetings(uniqueMeetings);
        } else {
          console.error("Invalid data format from adminMeeting:", allMeetings);
          setMeetings([]);
        }
      } catch (error) {
        console.error("❌ Error fetching meetings:", error);
        setMeetings([]);
      } finally {
        setMeetingsLoading(false);
      }
    };

    fetchMeetingsData();
  }, [selectedExecutiveId, adminMeeting]);

  if (meetingsLoading) {
    return <div className="meetings-container">Loading meetings...</div>;
  }

  const meetingsCount = Array.isArray(meetings) ? meetings.length : 0;

  const getTitle = () => {
    if (selectedExecutiveId && selectedExecutiveId !== "all") {
      return `${meetingsCount} Executive Meetings`;
    }
    return `${meetingsCount} Meetings`;
  };

  // Function to get executive name by ID
  const getExecutiveName = (executiveId) => {
    const executive = executives.find((exec) => String(exec.id) === String(executiveId));
    return executive ? executive.username : "Unknown Executive";
  };

  return (
    <div className="meetings-container">
      <h3 className="chart-title">{getTitle()}</h3>
      {meetingsCount === 0 ? (
        <div className="no-meet">No meetings scheduled.</div>
      ) : (
        meetings.map((meeting, index) => (
          <div
            key={meeting.id}
            className={`meeting-card ${meeting.isUpcoming ? "upcoming" : ""} card-hover-${index % 5}`}
          >
            <div className="meeting-details">
              <h4>{meeting.clientName}</h4>
              <p>{new Date(meeting.startTime).toLocaleString()}</p>
            </div>
            <div className="meeting-icons">
              {selectedExecutiveId === "all" ? (
                <span className="executive-name">
                  {getExecutiveName(meeting.executiveId)}
                </span>
              ) : (
                <>
                  <FaUserFriends className="icon" />
                  <FaUserFriends className="icon" />
                  <FaUserFriends className="icon" />
                </>
              )}
              <FaEllipsisV className="icon" />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Meetings;