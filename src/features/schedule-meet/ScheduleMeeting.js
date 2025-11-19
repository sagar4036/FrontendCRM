import React, { useEffect, useState, useContext, useRef,useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { useApi } from "../../context/ApiContext";
import { isSameDay } from "../../utils/helpers";
import FollowUpForm from "./FollowUpForm";
import FollowUpHistory from "./FollowUpHistory";
import MeetingList from "./MeetingList";
import { SearchContext } from "../../context/SearchContext";
import LoadingSpinner from "../spinner/LoadingSpinner";

const ScheduleMeeting = () => {
  const {
    fetchMeetings,
    fetchFollowUpHistoriesAPI,
    updateFollowUp,
    createFollowUp,
    createFollowUpHistoryAPI,
    fetchFreshLeadsAPI,
    refreshMeetings,
    createConvertedClientAPI,
    createCloseLeadAPI,
    getAllFollowUps,
    updateClientLead,
  } = useApi();

  const { searchQuery } = useContext(SearchContext);
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [activeFilter, setActiveFilter] = useState("today");
  const [selectedMeetingForHistory, setSelectedMeetingForHistory] = useState(null);
  const [selectedMeetingForFollowUp, setSelectedMeetingForFollowUp] = useState(null);
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const calendarRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fp = flatpickr(calendarRef.current, {
      mode: "range",
      dateFormat: "Y-m-d",
      maxDate: "today",
      static: true, // Use static positioning
      appendTo: dropdownRef.current, // Append to dropdown container
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          setDateRange(selectedDates);
          setActiveFilter("custom");
        }
      },
      onReady: function() {
        // Set z-index and positioning when calendar is ready
        const calendarElement = this.calendarContainer;
        if (calendarElement) {
          calendarElement.style.zIndex = "1000";
          calendarElement.style.position = "absolute";
          calendarElement.style.top = "100%";
          calendarElement.style.left = "0";
          calendarElement.style.marginTop = "5px";
        }
      },
      onOpen: function() {
        // Ensure proper positioning when opened
        const calendarElement = this.calendarContainer;
        if (calendarElement) {
          calendarElement.style.zIndex = "1000";
          calendarElement.style.position = "absolute";
          calendarElement.style.top = "100%";
          calendarElement.style.left = "0";
          calendarElement.style.marginTop = "5px";
        }
      }
    });

    const handleClick = (e) => {
      if (!dropdownRef.current.contains(e.target)) {
        fp.close();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      fp.destroy();
    };
  }, []);

const loadMeetings = useCallback(async () => {
  try {
    setLocalLoading(true);
    const allMeetings = await fetchMeetings();

    if (!Array.isArray(allMeetings)) {
      setMeetings([]);
      return;
    }

    const filteredByStatus = allMeetings.filter(
      (m) => m?.clientLead?.status === "Meeting"
    );

    const enriched = await Promise.all(
      filteredByStatus.map(async (meeting) => {
        const leadId =
          meeting.fresh_lead_id ||
          meeting.freshLead?.id ||
          meeting.clientLead?.freshLead?.id ||
          meeting.clientLead?.fresh_lead_id ||
          meeting.freshLead?.lead?.id ||
          meeting.id ||
          meeting.clientLead?.id;

        try {
          const histories = await fetchFollowUpHistoriesAPI();
          const recent = histories
            .filter((h) => String(h.fresh_lead_id) === String(leadId))
            .sort(
              (a, b) =>
                new Date(b.created_at || b.follow_up_date) -
                new Date(a.created_at || a.follow_up_date)
            )[0];

          return {
            ...meeting,
            leadId,
            interactionScheduleDate: recent?.follow_up_date,
            interactionScheduleTime: recent?.follow_up_time,
            followUpDetails: recent,
          };
        } catch {
          return { ...meeting, leadId };
        }
      })
    );

    const uniqueMeetings = enriched.reduce((unique, meeting) => {
      const exists = unique.find(
        (m) => String(m.leadId) === String(meeting.leadId)
      );
      if (!exists) {
        unique.push(meeting);
      } else {
        const oldDate = new Date(exists.startTime);
        const newDate = new Date(meeting.startTime);
        if (newDate > oldDate) {
          const index = unique.indexOf(exists);
          unique[index] = meeting;
        }
      }
      return unique;
    }, []);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filtered = uniqueMeetings.filter((m) => {
      const start = new Date(m.startTime);
      if (activeFilter === "today") return isSameDay(start, now);
      if (activeFilter === "week") {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);
        return start >= today && start < weekFromNow;
      }
      if (activeFilter === "month") {
        const monthFromNow = new Date(today);
        monthFromNow.setDate(today.getDate() + 30);
        return start >= today && start < monthFromNow;
      }
      if (activeFilter === "custom" && dateRange.length === 2) {
        const [startDate, endDate] = dateRange;
        return start >= new Date(startDate) && start <= new Date(endDate);
      }
      return true;
    });

    const query = searchQuery.toLowerCase();
    const searchFiltered = filtered.filter((m) =>
      [m.clientName, m.clientEmail, m.clientPhone?.toString()]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query))
    );

    setMeetings(searchFiltered);
  } catch (error) {
    console.error("Failed to load meetings:", error);
    setMeetings([]);
  } finally {
    setLocalLoading(false);
  }
}, [activeFilter, dateRange, searchQuery, fetchMeetings, fetchFollowUpHistoriesAPI]);

  const handleFollowUpSubmit = async (formData) => {
    const {
      clientName,
      email,
      reason_for_follow_up,
      connect_via,
      follow_up_type,
      interaction_rating,
      follow_up_date,
      follow_up_time,
    } = formData;

    const meeting = selectedMeetingForFollowUp;

    const freshLeadId =
      meeting.fresh_lead_id ||
      meeting.freshLead?.id ||
      meeting.clientLead?.freshLead?.id ||
      meeting.clientLead?.fresh_lead_id ||
      meeting.freshLead?.lead?.id ||
      meeting.id ||
      meeting.clientLead?.id;

    const clientLeadId = meeting.clientLead?.id;

    if (!freshLeadId || !clientLeadId) {
      Swal.fire({
        icon: "error",
        title: "Missing Lead Info",
        text: "Unable to find the lead ID or client lead ID.",
      });
      return;
    }

    try {
      let followUpId;
      const histories = await fetchFollowUpHistoriesAPI();
      if (Array.isArray(histories)) {
        const recent = histories
          .filter((h) => String(h.fresh_lead_id) === String(freshLeadId))
          .sort(
            (a, b) =>
              new Date(b.created_at || b.follow_up_date) -
              new Date(a.created_at || a.follow_up_date)
          )[0];
        followUpId = recent?.follow_up_id;
      }

      const payload = {
        connect_via,
        follow_up_type,
        interaction_rating,
        reason_for_follow_up,
        follow_up_date,
        follow_up_time,
        fresh_lead_id: freshLeadId,
      };

      if (followUpId) {
        await updateFollowUp(followUpId, payload);
      } else {
        const res = await createFollowUp(payload);
        followUpId = res.data.id;
      }

      if (["interested", "not interested", "no response"].includes(follow_up_type)) {
        await updateClientLead(clientLeadId, {
          status: "Follow-Up",
          companyId: meeting.clientLead?.companyId,
        });
      }

      await createFollowUpHistoryAPI({ ...payload, follow_up_id: followUpId });

      const leadDetails = {
        fresh_lead_id: freshLeadId,
        clientName,
        email,
        phone: meeting.clientPhone,
        reason_for_follow_up,
        connect_via,
        follow_up_type,
        interaction_rating,
        follow_up_date,
        follow_up_time,
      };

      if (follow_up_type === "converted") {
        await createConvertedClientAPI({ fresh_lead_id: freshLeadId });
      } else if (follow_up_type === "close") {
        await createCloseLeadAPI({ fresh_lead_id: freshLeadId });
      }

      setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));

      await Promise.all([
        fetchFreshLeadsAPI(),
        refreshMeetings(),
        getAllFollowUps(),
      ]);

      if (follow_up_type === "converted") {
        Swal.fire({ icon: "success", title: "Client Converted Successfully!" });
        navigate("/executive/customer", { state: { lead: leadDetails } });
      } else if (follow_up_type === "close") {
        Swal.fire({ icon: "success", title: "Lead Closed Successfully!" });
        navigate("/executive/close-leads", { state: { lead: leadDetails } });
      } else {
        const targetTab = "All Follow Ups";
        navigate("/executive/follow-up", {
          state: { lead: leadDetails, activeTab: targetTab },
        });
      }

      handleCloseFollowUpForm();
    } catch (error) {
      console.error("Follow-up submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text: error.message || "Something went wrong. Please try again.",
      });
    }
  };

  const handleAddFollowUp = (meeting) => setSelectedMeetingForFollowUp(meeting);
  const handleCloseFollowUpForm = () => setSelectedMeetingForFollowUp(null);
  const handleShowHistory = (meeting) => setSelectedMeetingForHistory(meeting);
  const handleCloseHistory = () => setSelectedMeetingForHistory(null);

  useEffect(() => {
    loadMeetings();
  }, [activeFilter, searchQuery, dateRange,loadMeetings]);

  return (
    <div className="task-management-container">
      {localLoading && <LoadingSpinner text="Loading Meetings..." />}
      <div className="task-management-wrapper">
        <div className="content-header">
          <div className="header-top">
            <div className="header-left">
              <h2 className="meetings-title">Your Meetings</h2>
              <div className="date-section">
                <p className="day-name">
                  {new Date().toLocaleDateString(undefined, { weekday: "long" })}
                </p>
                <p className="current-date">
                  {dateRange.length === 2
                    ? `${dateRange[0].toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                      })} - ${dateRange[1].toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                      })}`
                    : new Date().toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                      })}
                </p>
                <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="date-dropdown"
                    onClick={() => calendarRef.current._flatpickr.toggle()}
                    style={{ cursor: "pointer" }}
                  />
                  <input
                    ref={calendarRef}
                    style={{ display: "none" }}
                    type="text"
                    placeholder="Select date range"
                  />
                </div>
              </div>
            </div>
            <div className="filter-controls">
              {["today", "week", "month"].map((key) => (
                <button
                  key={key}
                  className={activeFilter === key ? "active-filter" : ""}
                  onClick={() => {
                    setActiveFilter(key);
                    setDateRange([new Date(), new Date()]);
                  }}
                  disabled={localLoading}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="meetings-content">
          <MeetingList
            meetings={meetings}
            onAddFollowUp={handleAddFollowUp}
            onShowHistory={handleShowHistory}
          />
        </div>
      </div>

      {selectedMeetingForFollowUp && (
        <FollowUpForm
          meeting={selectedMeetingForFollowUp}
          onClose={handleCloseFollowUpForm}
          onSubmit={handleFollowUpSubmit}
        />
      )}

      {selectedMeetingForHistory && (
        <FollowUpHistory
          meeting={selectedMeetingForHistory}
          onClose={handleCloseHistory}
        />
      )}
    </div>
  );
};

export default ScheduleMeeting;