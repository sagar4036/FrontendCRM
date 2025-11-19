import React, { useEffect, useState, useMemo, useCallback } from "react";
import "../../styles/full-report.css";
import SidebarToggle from "./SidebarToggle";
import {
  FaUserPlus,
  FaClipboardCheck,
  FaUsers,
  FaTimesCircle,
  FaCalendarCheck,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import "../../styles/admin.css";
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
} from "../../utils/exportUtils";
import { useApi } from "../../context/ApiContext";

/* ──────────────────────────────────────────────────────────── */
/*                          CONSTANTS                           */
/* ──────────────────────────────────────────────────────────── */

const CARDS = [
  { key: "fresh", icon: <FaUserPlus />, label: "Fresh Leads" },
  { key: "followUp", icon: <FaClipboardCheck />, label: "Follow-Ups" },
  { key: "converted", icon: <FaUsers />, label: "Converted Clients" },
  { key: "closed", icon: <FaTimesCircle />, label: "Closed Clients" },
  { key: "meetings", icon: <FaCalendarCheck />, label: "Meetings" },
];

const TABLE_HEADERS = {
  fresh: ["Name", "Email", "Phone", "Status"],
  followUp: ["Name", "Email", "Phone", "Status", "View"],
  converted: ["Name", "Email", "Phone", "Status", "View"],
  closed: ["Name", "Email", "Phone", "Status", "View"],
  meetings: ["Client", "Email", "Phone", "Start", "End"],
};

/* ──────────────────────────────────────────────────────────── */
/*                          COMPONENT                           */
/* ──────────────────────────────────────────────────────────── */

const FullReport = () => {
  /* ========== context fns ========== */
  const isSidebarExpanded =
    localStorage.getItem("adminSidebarExpanded") === "true";

  const {
    /* generic */
    fetchExecutivesAPI,
    /* single-exec APIs */
    fetchAssignedLeads,
    fetchFollowUpsByExecutive,
    fetchConvertedByExecutive,
    fetchClosedByExecutive,
    fetchMeetingsByExecutive,
    fetchExecutiveSummaryByRangeAPI,
    fetchCallTimeByRangeAPI,
  } = useApi();

  /* ========== helpers ========== */
  const getExecId = (ex) => (ex?._id ?? ex?.id ?? ex?.ID ?? "").toString();

  /* ─────────────────────────────────── SINGLE MODE ─────────────────────────────────── */
  const [compareLoading, setCompareLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [comparisonData, setComparisonData] = useState(null); // Kept for future use
  const showCustomPopup = (message, type = "info") => {
    alert(`${type.toUpperCase()}: ${message}`);
  };
  
  const [executives, setExecutives] = useState([]);
  const [selectedExec, setSelectedExec] = useState(null);

  /* raw responses for table */
  const [raw, setRaw] = useState({
    fresh: [],
    followUps: [],
    converted: [],
    closed: [],
    meetings: [],
  });

  /* counts for cards */
  const [counts, setCounts] = useState({
    fresh: 0,
    followUp: 0,
    converted: 0,
    closed: 0,
    meetings: 0,
  });

  /* which card’s table is open */
  const [activeCard, setActiveCard] = useState("");

  /* fetch single-exec data */
  const pullSingleExecData = useCallback(
    async (exec) => {
      if (!exec) return;

      const [freshLeads, followUpsRaw, convertedRaw, closedRaw, meetingsRaw] =
        await Promise.all([
          fetchAssignedLeads(exec.username),
          fetchFollowUpsByExecutive(exec.username),
          fetchConvertedByExecutive(exec.username),
          fetchClosedByExecutive(exec.username),
          fetchMeetingsByExecutive(exec.username),
        ]);

      /* group follow-ups by fresh_lead_id & keep only latest */
      const fuMap = {};
      (followUpsRaw || []).forEach((f) => {
        fuMap[f.fresh_lead_id] = f;
      });
      const followUpGrouped = Object.values(fuMap).filter(
        (f) => (f.clientLeadStatus || "").toLowerCase() === "follow-up"
      );

      /* update counts + raw cache */
      setCounts({
        fresh: (freshLeads || []).filter(
          (l) =>
            ["new", "assigned"].includes((l.status || "").toLowerCase()) ||
            ["new", "assigned"].includes(
              (l.clientLead?.status || "").toLowerCase()
            )
        ).length,
        followUp: followUpGrouped.length,
        converted: (convertedRaw || []).length,
        closed: (closedRaw || []).length,
        meetings: (meetingsRaw || []).length,
      });

      setRaw({
        fresh: freshLeads || [],
        followUps: followUpsRaw || [],
        converted: convertedRaw || [],
        closed: closedRaw || [],
        meetings: meetingsRaw || [],
      });

      setActiveCard(""); // reset table view
    },
    [
      fetchAssignedLeads,
      fetchFollowUpsByExecutive,
      fetchConvertedByExecutive,
      fetchClosedByExecutive,
      fetchMeetingsByExecutive,
    ]
  );

  /* table rows generator */
   const getTableRows = useCallback(() => {
    if (!activeCard) return [];

    if (activeCard === "followUp") {
      const unique = {};
      raw.followUps.forEach((f) => {
        if (
          (f.clientLeadStatus || "").toLowerCase() === "follow-up" &&
          !unique[f.fresh_lead_id]
        ) {
          unique[f.fresh_lead_id] = {
            id: f.fresh_lead_id,
            name: f.freshLead?.name || "",
            email: f.freshLead?.email || "",
            phone: f.freshLead?.phone || "",
            status: f.clientLeadStatus,
          };
        }
      });
      return Object.values(unique);
    }

    if (activeCard === "converted")
      return raw.converted.map((c) => ({
        id: c.fresh_lead_id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: "Converted",
      }));

    if (activeCard === "closed")
      return raw.closed.map((c) => ({
        id: c.fresh_lead_id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: "Closed",
      }));

    if (activeCard === "fresh") return raw.fresh;
    if (activeCard === "meetings") return raw.meetings;
    return [];
  }, [activeCard, raw]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Calculate paginated rows
  const paginatedRows = useMemo(() => {
    const allRows = getTableRows();
    const start = (currentPage - 1) * rowsPerPage;
    return allRows.slice(start, start + rowsPerPage);
  }, [getTableRows, currentPage]); // Fixed dependency array

  // Reset to first page when table changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCard]);

  /* FOLLOW-UP HISTORY MODAL */
  const [historyModal, setHistoryModal] = useState({
    open: false,
    clientName: "",
    items: [],
  });

  const openHistory = (freshLeadId, clientName) => {
    const items = raw.followUps.filter((f) => f.fresh_lead_id === freshLeadId);
    setHistoryModal({ open: true, clientName, items });
  };
  const closeHistory = () =>
    setHistoryModal({ open: false, clientName: "", items: [] });

  /* EXPORT HANDLER */
  const handleExport = (type) => {
    const data = getTableRows();
    if (!data.length) return;

    const fileName = `${selectedExec?.username || "Executive"}_${activeCard}`;
    const keys = TABLE_HEADERS[activeCard]
      .map((h) => h.toLowerCase())
      .filter((k) => k !== "view");

    const formatted = data.map((row) =>
      Object.fromEntries(keys.map((k) => [k, row[k] || ""]))
    );

    if (type === "excel") exportToExcel(formatted, fileName);
    else if (type === "csv") exportToCSV(formatted, fileName);
    else if (type === "pdf") exportToPDF(formatted, fileName, keys);
  };

  /* ─────────────────────────────────── COMPARE MODE ─────────────────────────────────── */

  const [compareMode, setCompareMode] = useState(false);
  const [selectedExecs, setSelectedExecs] = useState([]); // up to 5
  const [compareStats, setCompareStats] = useState({});
  const [timeStats, setTimeStats] = useState({});
  const [selectedTimeRange, setSelectedTimeRange] = useState("today"); // today | week | month | custom
  const [customDate, setCustomDate] = useState(null);
  const [activeRadar, setActiveRadar] = useState("");

  /* fetch stats for one exec */
  const fetchStats = useCallback(
    async (username) => {
      const [fresh, fu, conv, closed, meet] = await Promise.all([
        fetchAssignedLeads(username),
        fetchFollowUpsByExecutive(username),
        fetchConvertedByExecutive(username),
        fetchClosedByExecutive(username),
        fetchMeetingsByExecutive(username),
      ]);

      const fuMap = {};
      fu.forEach((f) => (fuMap[f.fresh_lead_id] = f));
      const fuGrouped = Object.values(fuMap).filter(
        (f) => (f.clientLeadStatus || "").toLowerCase() === "follow-up"
      );

      return {
        fresh: fresh.filter(
          (l) =>
            ["new", "assigned"].includes((l.status || "").toLowerCase()) ||
            ["new", "assigned"].includes(
              (l.clientLead?.status || "").toLowerCase()
            )
        ).length,
        followUp: fuGrouped.length,
        converted: conv.length,
        closed: closed.length,
        meetings: meet.length,
      };
    },
    [
      fetchAssignedLeads,
      fetchFollowUpsByExecutive,
      fetchConvertedByExecutive,
      fetchClosedByExecutive,
      fetchMeetingsByExecutive,
    ]
  );

  /* delta util */
  const getDelta = (base, target) => {
    if (base === 0 && target === 0) return "0%";
    const diff = ((target - base) / (base || 1)) * 100;
    return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
  };

  /* fetch time stats based on selected range */
  const fetchTimeStats = async (executives) => {
    const today = new Date();
    let startDate, endDate;
  
    if (selectedTimeRange === "today") {
      startDate = endDate = today.toISOString().split("T")[0];
    } else if (selectedTimeRange === "week") {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      startDate = start.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    } else if (selectedTimeRange === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = start.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    } else if (selectedTimeRange === "custom" && customDate) {
      startDate = endDate = customDate;
    } else {
      return;
    }
  
    const result = {};
  
    await Promise.all(
      executives.map(async (ex) => {
        const res = await fetchExecutiveSummaryByRangeAPI(
          ex._id || ex.id,
          startDate,
          endDate
        );
  
        const totalWorkSeconds = res.reduce(
          (sum, r) => sum + (r.workTime || 0),
          0
        );
        const totalBreakSeconds = res.reduce(
          (sum, r) => sum + (r.breakTime || 0),
          0
        );
  
        const totalCallResponse = await fetchCallTimeByRangeAPI(
          [ex._id || ex.id],
          startDate,
          endDate
        );
  
        const totalCallHours = parseFloat(totalCallResponse?.totalCallTimeHours ?? 0);
        result[ex.username] = {
          work: +(totalWorkSeconds / 3600).toFixed(2),
          break: +(totalBreakSeconds / 3600).toFixed(2),
          call: totalCallHours,
        };
      })
    );
    console.log("✅ Time Stats Result:", result);

    setTimeStats(result);
  };
  
  const applyCompare = async () => {
    if (!selectedExecs.length || !selectedTimeRange) {
      showCustomPopup("Please select executives and date range", "error");
      return;
    }

    let startDate, endDate;
    const today = new Date();

    if (selectedTimeRange === "today") {
      startDate = endDate = today.toISOString().split("T")[0];
    } else if (selectedTimeRange === "week") {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      startDate = start.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    } else if (selectedTimeRange === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = start.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    } else if (selectedTimeRange === "custom" && customDate) {
      startDate = endDate = customDate;
    } else {
      showCustomPopup("Please select a valid date range", "error");
      return;
    }

    setCompareLoading(true);

    try {
      // Fetch stats for all selected executives
      const statsPromises = selectedExecs.map((ex) => fetchStats(ex.username));
      const statsResults = await Promise.all(statsPromises);

      // Update compareStats
      const newCompareStats = {};
      selectedExecs.forEach((ex, idx) => {
        newCompareStats[ex.username] = statsResults[idx];
      });
      setCompareStats(newCompareStats);

      // Fetch time stats for call time chart
      await fetchTimeStats(selectedExecs);

      // Fetch summary data (if needed for other purposes)
      const summaryData = await fetchExecutiveSummaryByRangeAPI(
        selectedExecs.map((exe) => exe.id),
        startDate,
        endDate
      );
      setComparisonData(summaryData);

    } catch (error) {
      console.error("Comparison fetch error", error);
      showCustomPopup("Failed to fetch comparison data", "error");
    } finally {
      setCompareLoading(false);
    }
  };

  /* bar data */
  const barData = useMemo(() => {
    return CARDS.map(({ key, label }) => {
      const row = { name: label };
      selectedExecs.forEach((ex) => {
        row[ex.username] = compareStats?.[ex.username]?.[key] || 0;
      });
      return row;
    });
  }, [compareStats, selectedExecs]);

  const callTimeChartData = useMemo(() => {
    return Object.entries(timeStats).map(([username, data]) => {
      const callTime = Number(data.call) || 0; // ✅ force numeric value
      return {
        name: username,
        Call: callTime,
      };
    });
  }, [timeStats]);

  // eslint-disable-next-line no-unused-vars
  const radarData = useMemo(() => {
    if (!activeRadar || !compareStats[activeRadar]) return [];
    return CARDS.map(({ key, label }) => ({
      category: label,
      value: compareStats[activeRadar]?.[key] || 0,
    }));
  }, [activeRadar, compareStats]); // Kept for future use

  const isAllCallTimesLessThanHour = useMemo(() => {
    return callTimeChartData.every((d) => d.Call < 1);
  }, [callTimeChartData]);

  /* ─────────────────────────────────── EFFECTS ─────────────────────────────────── */

  /* load exec list once */
  useEffect(() => {
    (async () => {
      const execs = await fetchExecutivesAPI();
      setExecutives(execs || []);
    })();
  }, [fetchExecutivesAPI]);

  /* fetch data for single exec whenever changed */
  useEffect(() => {
    if (!compareMode && selectedExec) pullSingleExecData(selectedExec);
  }, [selectedExec, compareMode, pullSingleExecData]);

  /* ─────────────────────────────────── UI HELPERS ─────────────────────────────────── */

  const isChecked = (id) =>
    selectedExecs.some((x) => getExecId(x) === id.toString());

  const toggleExecCheckbox = (id) => {
    const found = executives.find((x) => getExecId(x) === id);
    if (!found) return;

    setSelectedExecs((prev) => {
      const exists = prev.some((x) => getExecId(x) === id);
      if (exists) return prev.filter((x) => getExecId(x) !== id);
      if (prev.length >= 5) {
        alert("You can compare up to 5 executives only.");
        return prev;
      }
      return [...prev, found];
    });
  };

  /* rows renderer for single-exec table */
  const renderRow = (row, idx) => {
    switch (activeCard) {
      case "fresh":
        return (
          <tr key={idx}>
            <td>{row.name}</td>
            <td>{row.email}</td>
            <td>{row.phone}</td>
            <td>{row.status || row.clientLead?.status}</td>
          </tr>
        );

      case "followUp":
      case "converted":
      case "closed":
        return (
          <tr key={idx}>
            <td>{row.name}</td>
            <td>{row.email}</td>
            <td>{row.phone}</td>
            <td>{row.status}</td>
            <td style={{ textAlign: "center" }}>
              <FaEye
                className="fullreport-eye-icon"
                onClick={() => openHistory(row.id, row.name)}
              />
            </td>
          </tr>
        );

      case "meetings":
        return (
          <tr key={idx}>
            <td>{row.clientName}</td>
            <td>{row.clientEmail}</td>
            <td>{row.clientPhone}</td>
            <td>{new Date(row.startTime).toLocaleString()}</td>
            <td>
              {row.endTime ? new Date(row.endTime).toLocaleString() : "-"}
            </td>
          </tr>
        );

      default:
        return null;
    }
  };

  /* generate HSL color for bars */
  const barColor = (idx) => `hsl(${(idx * 60) % 360}, 70%, 60%)`;

  /* ─────────────────────────────────── JSX ─────────────────────────────────── */

  return (
    <div
      className={` ${
        isSidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"
      }`}
    >
      <SidebarToggle />
      <div className="admin-full-report">
        <h2>{compareMode ? "Compare Executives" : "Full Report"}</h2>

        {/* ───────────── Selector Section ───────────── */}
        {!compareMode && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <select
              value={selectedExec ? getExecId(selectedExec) : ""}
              onChange={(e) => {
                const exec = executives.find(
                  (x) => getExecId(x) === e.target.value
                );
                setSelectedExec(exec || null);
              }}
              className="fullreport-admin-dropdown"
            >
              <option value="">-- Select Executive --</option>
              {executives.map((ex) => (
                <option key={getExecId(ex)} value={getExecId(ex)}>
                  {ex.username}
                </option>
              ))}
            </select>

            <button
              className="fullreport-compare-btn"
              onClick={() => setCompareMode(true)}
            >
              Compare
            </button>
          </div>
        )}

        {/* ───────────── Single Exec View ───────────── */}
        {!compareMode && selectedExec && (
          <>
            {/* cards */}
            <div className="fullreport-card-grid">
              {CARDS.map(({ key, icon, label }) => (
                <div key={key} className="report-card-animated-border">
                  <div
                    className={`fullreport-reports-card ${
                      activeCard === key ? "active" : ""
                    }`}
                    onClick={() =>
                      setActiveCard((prev) => (prev === key ? "" : key))
                    }
                  >
                    {icon}
                    <div className="count">{counts[key]}</div>
                    <div className="label">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* table */}
            {activeCard && (
              <>
                <div className="fullreport-table-actions">
                  <h3 style={{ margin: 0 }}>
                    {CARDS.find((c) => c.key === activeCard).label}
                  </h3>
                  <div>
                    <button onClick={() => handleExport("excel")}>Excel</button>
                    <button onClick={() => handleExport("csv")}>CSV</button>
                    <button onClick={() => handleExport("pdf")}>PDF</button>
                    <button onClick={() => setActiveCard("")}>Close</button>
                  </div>
                </div>

                <div className="fullreport-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        {TABLE_HEADERS[activeCard].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row, idx) => renderRow(row, idx))}
                    </tbody>
                  </table>
                  {getTableRows().length > rowsPerPage && (
                    <div className="fullreport-pagination-controls">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                      <span>
                        Page {currentPage} of{" "}
                        {Math.ceil(getTableRows().length / rowsPerPage)}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(
                              p + 1,
                              Math.ceil(getTableRows().length / rowsPerPage)
                            )
                          )
                        }
                        disabled={
                          currentPage ===
                          Math.ceil(getTableRows().length / rowsPerPage)
                        }
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ───────────── Compare Mode UI ───────────── */}
        {compareMode && (
          <>
            {compareLoading && (
              <div className="fullreport-loading">
                <p>Loading comparison data...</p>
              </div>
            )}
            {/* checkbox list */}
            <div className="fullreport-multi-select">
              <label>Select Executives (max 5)</label>
              <div className="fullreport-dropdown-box">
                {executives.map((ex) => (
                  <label key={getExecId(ex)} style={{ marginRight: "1rem" }}>
                    <input
                      type="checkbox"
                      value={getExecId(ex)}
                      checked={isChecked(getExecId(ex))}
                      onChange={(e) => toggleExecCheckbox(e.target.value)}
                    />
                    {ex.username}
                  </label>
                ))}
              </div>
            </div>

            {/* buttons */}
            <div style={{ marginTop: "1rem" }}>
              <button className="fullreport-compare-btn" onClick={applyCompare}>
                Compare
              </button>
              <button
                className="fullreport-back-btn"
                style={{ marginLeft: "1rem" }}
                onClick={() => {
                  setCompareMode(false);
                  setSelectedExecs([]);
                  setCompareStats({});
                  setActiveRadar("");
                }}
              >
                ✕ Cancel
              </button>
            </div>
            {/* Time Filter block */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
              <label>Time Range:</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Specific Date</option>
              </select>

              {selectedTimeRange === "custom" && (
                <input
                  type="date"
                  value={customDate || ""}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              )}
            </div>
            {/* results */}
            {Object.keys(compareStats).length > 0 && (
              <>
                {/* summary grid */}
                <div className="fullreport-compare-results">
                  {CARDS.map(({ key, icon, label }) => (
                    <div className="fullreport-compare-card" key={key}>
                      <div className="fullreport-compare-icon">{icon}</div>
                      <h4>{label}</h4>
                      <div className="compare-values">
                        {selectedExecs.map((ex, idx) => (
                          <div key={ex.username} style={{ fontSize: ".85rem" }}>
                            <b>{ex.username}</b>:{" "}
                            {compareStats[ex.username]?.[key] || 0}
                            {idx > 0 && (
                              <small style={{ marginLeft: 4 }}>
                                (
                                {getDelta(
                                  compareStats[selectedExecs[0].username]?.[
                                    key
                                  ] || 0,
                                  compareStats[ex.username]?.[key] || 0
                                )}
                                )
                              </small>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* bar chart */}
                <div style={{ marginTop: "2.5rem" }}>
                  <h3 style={{ marginBottom: "0.2rem" }}>
                    Performance Comparison Chart
                  </h3>
                  <div className="fullreport-accent-line" />

                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={barData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {selectedExecs.map((ex, idx) => (
                        <Bar
                          key={ex.username}
                          dataKey={ex.username}
                          fill={barColor(idx)}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {Object.keys(timeStats).length > 0 && (
                  <div style={{ marginTop: "2rem" }}>
                    <h3>Work vs Break Time (in Hours)</h3>
                    {(() => {
                      const convertedData = Object.keys(timeStats).map((executiveName) => {
                        const { work, break: breakTime } = timeStats[executiveName];

                        return {
                          name: executiveName,
                          Work: parseFloat(work.toFixed(2)),        // ✅ already in hours
                          Break: parseFloat(breakTime.toFixed(2)),  // ✅ already in hours
                        };
                      });

                      // ✅ Dynamic Y-axis scale
                      const allValues = convertedData.flatMap(d => [d.Work, d.Break]);
                      const maxVal = Math.max(...allValues, 1);
                      const roundedMax = Math.ceil(maxVal / 5) * 5;

                      return (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={convertedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis
                              label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                              domain={[0, roundedMax]}
                              allowDecimals={true}
                              tickFormatter={(v) => `${v}h`}
                            />
                            <Tooltip formatter={(value) => `${value} hrs`} />
                            <Legend />
                            <Bar dataKey="Work" fill="#28a745" />
                            <Bar dataKey="Break" fill="#dc3545" />
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                )}
                {/* Call Time Comparison Chart */}
                {Object.keys(timeStats).length > 0 && (
                  <div style={{ marginTop: "3rem" }}>
                    <h3>Call Time Comparison (in Hours)</h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <label>Time Range:</label>
                      <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                      >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="custom">Specific Date</option>
                      </select>

                      {selectedTimeRange === "custom" && (
                        <input
                          type="date"
                          value={customDate || ""}
                          onChange={(e) => setCustomDate(e.target.value)}
                        />
                      )}
                    </div>

                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart
                        layout="vertical"
                        data={callTimeChartData}
                        margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          label={{
                            value: isAllCallTimesLessThanHour ? "Minutes" : "Hours",
                            position: "insideBottomRight",
                            offset: -5,
                          }}
                          domain={[0, (dataMax) =>
                            Math.ceil(Math.max(dataMax * (isAllCallTimesLessThanHour ? 60 : 1), 1) / 5) * 5
                          ]}
                          tickFormatter={(v) =>
                            isAllCallTimesLessThanHour ? `${Math.round(v * 60)} min` : `${v}h`
                          }
                        />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip
                          formatter={(value) =>
                            isAllCallTimesLessThanHour
                              ? `${Math.round(value * 60)} minutes`
                              : `${value} hours`
                          }
                        />
                        <Legend />
                        <Bar dataKey="Call" fill="#007bff" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* radar selector + chart */}
                <div style={{ marginTop: "3rem" }}>
                  <h3 style={{ textAlign: "center", marginBottom: "0.2rem" }}>
                    Radar Charts for Selected Executives
                  </h3>
                  <div className="fullreport-accent-line1 center-line" />

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: "2rem",
                    }}
                  >
                    {selectedExecs.map((ex, idx) => (
                      <div key={ex.username}>
                        <h4 style={{ textAlign: "center" }}>{ex.username}</h4>
                        <RadarChart
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          width={300}
                          height={260}
                          data={CARDS.map(({ key, label }) => ({
                            category: label,
                            value: compareStats[ex.username]?.[key] || 0,
                          }))}
                        >
                          <PolarGrid />
                          <PolarAngleAxis dataKey="category" />
                          <PolarRadiusAxis />
                          <Radar
                            name={ex.username}
                            dataKey="value"
                            stroke={barColor(idx)}
                            fill={barColor(idx)}
                            fillOpacity={0.6}
                          />
                        </RadarChart>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ───────────── Follow-Up History Modal ───────────── */}
        {historyModal.open && (
          <div className="fullreport-modal-overlay">
            <div className="fullreport-modal">
              <button className="fullreport-modal-close" onClick={closeHistory}>
                <FaTimes />
              </button>
              <h3>
                Follow-Up History — <b>{historyModal.clientName}</b>
              </h3>
              {historyModal.items.length ? (
                <ul className="fullreport-history-list">
                  {historyModal.items.map((it, idx) => (
                    <li key={idx}>
                      <span>{new Date(it.createdAt).toLocaleString()}:</span>{" "}
                      {it.notes || it.status}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No history found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullReport;