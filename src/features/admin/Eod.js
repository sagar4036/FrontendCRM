import React, { useState, useEffect, useRef } from "react";
import "../../styles/report.css";
import logo from "../../assets/logo.png";
import { Alert, soundManager } from "../modal/alert";
import { useApi } from "../../context/ApiContext";
import SidebarToggle from "./SidebarToggle";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const options = [
  { key: "leadVisits", label: "Lead Visit" },
  { key: "executiveActivity", label: "Executive Activity" },
  { key: "meeting", label: "Meeting" },
];

const getCurrentDate = () => new Date().toISOString().split("T")[0];
const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

const Eod = () => {
  const { fetchExecutivesAPI, sendEodReport } = useApi();
  const calendarRef = useRef(null);

  const [executives, setExecutives] = useState([]);
  const [cards, setCards] = useState([]);
  const [openCalendarIndex, setOpenCalendarIndex] = useState(null);
  const [alerts, setAlerts] = useState([]); // State for managing alerts
  const [sidebarCollapsed] = useState(
    localStorage.getItem("adminSidebarExpanded") === "false"
  );

  // Function to add a new alert
  const showAlert = (message, type, duration = 3000, title = type.charAt(0).toUpperCase() + type.slice(1)) => {
    const id = Date.now();
    setAlerts(prev => [
      ...prev,
      { id, message, type, title, duration }
    ]);
    soundManager.playSound(type);
  };

  // Function to close an alert
  const closeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setOpenCalendarIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const data = await fetchExecutivesAPI();
        setExecutives(data);

        const initialCards = data.map(() => ({
          email: "",
          selected: [],
          startDate: getCurrentDate(),
          endDate: getCurrentDate(),
          time: getCurrentTime(),
          dropdownOpen: false,
        }));
        setCards(initialCards);
      } catch (error) {
        console.error("Error fetching executives:", error);
        showAlert("Failed to load executives.", "error");
      }
    };

    fetchExecutives();
  }, [fetchExecutivesAPI]);

  const handleCheckboxChange = (index, key) => {
    setCards((prev) =>
      prev.map((card, i) =>
        i === index
          ? {
              ...card,
              selected: card.selected.includes(key)
                ? card.selected.filter((item) => item !== key)
                : [...card.selected, key],
            }
          : card
      )
    );
  };

  const handleDateRangeChange = (index, ranges) => {
    const { startDate, endDate } = ranges.selection;
    setCards((prev) =>
      prev.map((card, i) =>
        i === index
          ? {
              ...card,
              startDate: startDate.toISOString().split("T")[0],
              endDate: endDate.toISOString().split("T")[0],
            }
          : card
      )
    );
  };

  const handleTimeChange = (index, value) => {
    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, time: value } : card))
    );
  };

  const handleEmailChange = (index, value) => {
    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, email: value } : card))
    );
  };

  const toggleDropdown = (index) => {
    setCards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, dropdownOpen: !card.dropdownOpen } : card
      )
    );
  };

  const handleSubmit = async (e, index) => {
    e.preventDefault();
    const card = cards[index];
    const exec = executives[index];

    if (!card.email) {
      showAlert("Please enter an email.", "error");
      return;
    }

    if (card.selected.length === 0) {
      showAlert("Select at least one report option.", "error");
      return;
    }

    const payload = {
      executiveId: exec.id,
      executiveName: exec.username,
      email: card.email,
      fields: card.selected,
      startDate: card.startDate,
      endDate: card.endDate,
      time: card.time,
    };

    console.log("✅ Payload being sent:", payload);

    try {
      await sendEodReport(payload);
      showAlert("Report scheduled successfully!", "success");
    } catch (err) {
      console.error("❌ Failed to schedule:", err);
      showAlert("Failed to schedule report.", "error");
    }
  };

  return (
    <div className={`eod-layout-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
      <aside className="eod-sidebar">
        <SidebarToggle />
      </aside>
      <div className="eod-container">
        <h1 className="eod-main-title">Send Reports</h1>
        <div className="eod-table-wrapper">
          <table className="eod-table">
            <thead>
              <tr>
                <th>Executive</th>
                <th>Email</th>
                <th>Report Type</th>
                <th>Date & Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {executives.map((exec, index) => (
                <tr key={exec.id}>
                  {/* Executive Info Column */}
                  <td>
                    <div className="eod-executive-info">
                      <img src={logo} alt="logo" className="eod-logo" />
                      <div className="eod-executive-details">
                        <h4>{exec.username}</h4>
                        <span>ID: {exec.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Email Column */}
                  <td>
                    <input
                      className="eod-email-input"
                      type="email"
                      value={cards[index]?.email || ""}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="example@domain.com"
                      required
                    />
                  </td>

                  {/* Report Type Column */}
                  <td>
                    <div className="eod-dropdown">
                      <button
                        type="button"
                        onClick={() => toggleDropdown(index)}
                        className="eod-dropdown-button"
                      >
                        {cards[index]?.selected.length > 0
                          ? cards[index].selected.map((k) => options.find((o) => o.key === k)?.label).join(", ")
                          : "Choose EOD Report"}
                      </button>
                      {cards[index]?.dropdownOpen && (
                        <ul className="eod-dropdown-list">
                          {options.map(({ key, label }) => (
                            <li key={key} className="eod-dropdown-item">
                              <label className="eod-dropdown-label">
                                <input
                                  type="checkbox"
                                  checked={cards[index]?.selected.includes(key) || false}
                                  onChange={() => handleCheckboxChange(index, key)}
                                  className="eod-dropdown-checkbox"
                                />
                                {label}
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </td>

                  {/* Date Time Column */}
                  <td>
                    <div className="eod-datetime-wrapper">
                      <button
                        type="button"
                        className="eod-date-input"
                        onClick={() =>
                          setOpenCalendarIndex(openCalendarIndex === index ? null : index)
                        }
      >
                        {cards[index].startDate} to {cards[index].endDate}
                      </button>
                      {openCalendarIndex === index && (
                        <div ref={calendarRef} style={{ position: "absolute", zIndex: 10 }}>
                          <DateRange
                            editableDateInputs={true}
                            onChange={(item) => handleDateRangeChange(index, item)}
                            moveRangeOnFirstSelection={false}
                            ranges={[
                              {
                                startDate: new Date(cards[index].startDate),
                                endDate: new Date(cards[index].endDate),
                                key: "selection",
                              },
                            ]}
                          />
                        </div>
                      )}
                      <input
                        type="time"
                        value={cards[index]?.time || ""}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className="eod-time-input"
                      />
                    </div>
                  </td>

                  {/* Action Column */}
                  <td>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, index)}
                      className="eod-submit-button"
                    >
                      Schedule Email
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Alert alerts={alerts} onClose={closeAlert} />
      </div>
    </div>
  );
};

export default Eod;