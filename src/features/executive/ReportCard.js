import React, { useState, useEffect } from "react";
import { FaUserPlus, FaClipboardCheck, FaUsers, FaExclamationTriangle } from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ReportCard = () => {
  const {
    freshLeads,
    followUps,
    convertedClients,
    meetings,
    fetchFreshLeadsAPI,
    getAllFollowUps,
    fetchConvertedClientsAPI,
    refreshMeetings,
    executiveInfo,refreshDashboard
  } = useApi();

  const navigate = useNavigate();

  const [freshleadCounts, setFreshLeadCounts] = useState(0);
  const [followupCounts, setFollowupCounts] = useState(0);
  const [convertedCounts, setConvertedCounts] = useState(0);
  const [meetingsCount, setMeetings] = useState(0);
  const [missedMeetingsCount, setMissedMeetingsCount] = useState(0);

  // Load data once executive is ready
  useEffect(() => {
  if (executiveInfo?.id) {
    fetchFreshLeadsAPI();
    getAllFollowUps();
    fetchConvertedClientsAPI();
    refreshMeetings();
  }
}, [
  executiveInfo,
  fetchFreshLeadsAPI,
  getAllFollowUps,
  fetchConvertedClientsAPI,
  refreshMeetings
]);
  useEffect(() => {
    if (refreshDashboard) {
      toast.success("Dashboard updated");
    }
  }, [refreshDashboard]);
  
  // Count fresh leads
  useEffect(() => {
    if (Array.isArray(freshLeads?.data)) {
      const count = freshLeads.data.filter(
        (lead) =>
          lead.clientLead?.status === "New" ||
          lead.clientLead?.status === "Assigned"
      ).length;
      setFreshLeadCounts(count);
    } else {
      setFreshLeadCounts(0);
    }
  }, [freshLeads]);
  
  // Count followups
  useEffect(() => {
    if (Array.isArray(followUps?.data)) {
      const count = followUps.data.filter(
        (lead) => lead.clientLeadStatus === "Follow-Up"
      ).length;
      setFollowupCounts(count);
    } else {
      setFollowupCounts(0);
    }
  }, [followUps]);
  

  // Count converted
  useEffect(() => {
    if (Array.isArray(convertedClients)) {
      const count = convertedClients.filter(
        (lead) => lead.status === "Converted"
      ).length;
      setConvertedCounts(count);
    } else {
      setConvertedCounts(0);
    }
  }, [convertedClients]);
  

  // Count meetings
  useEffect(() => {
    if (!Array.isArray(meetings)) {
      setMeetings(0);
      setMissedMeetingsCount(0);
      return;
    }
    const currentDateTime = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const meetingsWithStatus = meetings.filter(
      (lead) => lead.clientLead?.status === "Meeting"
    );

    const todaysMeetings = meetingsWithStatus.filter((lead) => {
      if (!lead.startTime) return false;
      const meetingDate = new Date(lead.startTime);
      return meetingDate >= today && meetingDate <= endOfToday;
    });

    const futureMeetings = meetingsWithStatus.filter((lead) => {
      if (!lead.startTime) return false;
      const meetingDate = new Date(lead.startTime);
      return meetingDate > endOfToday;
    });

    const missedTodayMeetings = todaysMeetings.filter((lead) => {
      const meetingDate = new Date(lead.startTime);
      return meetingDate < currentDateTime;
    });

    const upcomingTodayMeetings = todaysMeetings.filter((lead) => {
      const meetingDate = new Date(lead.startTime);
      return meetingDate >= currentDateTime;
    });

    const allUpcomingMeetings = [...upcomingTodayMeetings, ...futureMeetings];

    const meetingsByFreshLeadId = {};
    const missedMeetingsByFreshLeadId = {};

    allUpcomingMeetings.forEach((meeting) => {
      const freshLeadId = meeting.freshLead?.id;
      if (!freshLeadId) return;
      if (
        !meetingsByFreshLeadId[freshLeadId] ||
        new Date(meeting.startTime) > new Date(meetingsByFreshLeadId[freshLeadId].startTime)
      ) {
        meetingsByFreshLeadId[freshLeadId] = meeting;
      }
    });

    missedTodayMeetings.forEach((meeting) => {
      const freshLeadId = meeting.freshLead?.id;
      if (!freshLeadId) return;
      if (
        !missedMeetingsByFreshLeadId[freshLeadId] ||
        new Date(meeting.startTime) > new Date(missedMeetingsByFreshLeadId[freshLeadId].startTime)
      ) {
        missedMeetingsByFreshLeadId[freshLeadId] = meeting;
      }
    });

    setMeetings(Object.keys(meetingsByFreshLeadId).length);
    setMissedMeetingsCount(Object.keys(missedMeetingsByFreshLeadId).length);
  }, [meetings]);

  const cards = [
    {
      title: "Fresh Leads",
      value: <div>{freshleadCounts}</div>,
      route: "/executive/freshlead",
      icon: <FaUserPlus />,
    },
    {
      title: "Follow-ups",
      value: <div>{followupCounts}</div>,
      route: "/executive/follow-up",
      icon: <FaClipboardCheck />,
    },
    {
      title: "Converted Clients",
      value: <div>{convertedCounts}</div>,
      route: "/executive/customer",
      icon: <FaUsers />,
    },
    {
      title: "Scheduled Meetings",
      value: <div>{meetingsCount}</div>,
      route: "/executive/schedule",
      icon: <FaUsers />,
      missedCount: missedMeetingsCount,
    },
  ];

  return (
    <div className="report-cards-exec">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`report-card report-card-${index}`}
          onClick={() => navigate(card.route)}
        >
          <div className="bubble-small bubble-1"></div>
          <div className="bubble-small bubble-2"></div>
          <div className="bubble-small bubble-3"></div>
          <div className="bubble-small bubble-4"></div>
          <div className="card-icon">{card.icon}</div>
          <div className="card-details">
            <h4>{card.title}</h4>
            <p className="card-value1">{card.value}</p>
          </div>
          {card.missedCount !== undefined && card.missedCount > 0 && (
            <div className="missed-meetings-badge">
              <FaExclamationTriangle className="missed-icon" />
              <span className="missed-count">Missed {card.missedCount} meeting</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReportCard; 