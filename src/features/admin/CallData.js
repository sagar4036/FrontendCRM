import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useApi } from "../../context/ApiContext";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subWeeks,
  format
} from "date-fns";

const CallData = ({ selectedExecutiveId, executiveName }) => {
  const { fetchExecutiveCallDurationsByDate } = useApi(); // must support date range

  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const [weekOffset, setWeekOffset] = useState(0);

  const isDarkMode =
    document.documentElement.getAttribute("data-theme") === "dark";

  const getWeekRange = (offset = 0) => {
    const targetDate = subWeeks(new Date(), offset);
    const start = startOfWeek(targetDate, { weekStartsOn: 0 });
    const end = endOfWeek(targetDate, { weekStartsOn: 0 });
    return { start, end };
  };

  useEffect(() => {
    const loadCallDurations = async () => {
      if (!selectedExecutiveId) return;
      setLoading(true);

      try {
        const { start, end } = getWeekRange(weekOffset);
        const weekDays = eachDayOfInterval({ start, end }).map(day =>
          format(day, "yyyy-MM-dd")
        );

        const response = await fetchExecutiveCallDurationsByDate(
          selectedExecutiveId,
          format(start, "yyyy-MM-dd"),
          format(end, "yyyy-MM-dd")
        );

        const dailyDurations = {};
        (response?.calls || []).forEach(call => {
          const date = format(new Date(call.date), "yyyy-MM-dd");
          if (weekDays.includes(date)) {
            const idx = weekDays.indexOf(date);
            dailyDurations[idx] =
              (dailyDurations[idx] || 0) + (call.durationMinutes || 0);
          }
        });

        const updatedWeeklyData = weekDays.map(
          (_, idx) => dailyDurations[idx] || 0
        );
        setWeeklyData(updatedWeeklyData);
      } catch (err) {
        console.error("CallData error:", err);
        setWeeklyData([0, 0, 0, 0, 0, 0, 0]);
      } finally {
        setLoading(false);
      }
    };

    loadCallDurations();
  }, [selectedExecutiveId, weekOffset, fetchExecutiveCallDurationsByDate]);

  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totalMinutes = weeklyData.reduce((sum, val) => sum + val, 0);
  const maxY = Math.max(...weeklyData);
  const dynamicMax = Math.max(30, Math.ceil((maxY + 5) / 5) * 5);

  const baseDataset = {
    label: "Call Duration (mins)",
    data: weeklyData,
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.3)",
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 5,
    borderWidth: 2
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.raw} mins`
        }
      },
      datalabels: {
        color: isDarkMode ? "#fff" : "#000",
        font: { size: 10, weight: "bold" },
        anchor: "end",
        align: "top",
        formatter: value => value
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDarkMode ? "#fff" : "#333",
          font: { size: 16, weight: "500" }
        }
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: dynamicMax,
        ticks: {
          stepSize: 5,
          color: isDarkMode ? "#fff" : "#333",
          font: { size: 12, weight: "500" }
        },
        grid: {
          color:
            getComputedStyle(document.documentElement).getPropertyValue(
              "--chart-grid"
            ) || "#e5e7eb"
        }
      }
    }
  };

  const handleWeekToggle = () => {
    setWeekOffset(prev => (prev + 1) % 4); // cycles between current and past 3 weeks
  };

  const getWeekLabel = () => {
    switch (weekOffset) {
      case 1:
        return "Prev Week -1";
      case 2:
        return "Prev Week -2";
      case 3:
        return "Prev Week -3";
      default:
        return "This Week";
    }
  };

  return (
    <div className="lead-graph-container">
      <div className="lead-graph-header">
        <h2 className="lead-graph-title">
          Call Time:{" "}
          <span
            className={
              loading
                ? "lead-graph-loading"
                : executiveName
                ? "lead-graph-executive-name"
                : "lead-graph-placeholder-name"
            }
          >
            {executiveName || "Loading..."}
          </span>
        </h2>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={handleWeekToggle} className="lead-graph-button">
            {getWeekLabel()}
          </button>
          <button
            onClick={() =>
              setChartType(prev => (prev === "line" ? "bar" : "line"))
            }
            className="lead-graph-button"
          >
            Switch to {chartType === "line" ? "Bar" : "Line"} Graph
          </button>
        </div>
      </div>

      <div className="lead-graph-summary">
        Total Call Time:{" "}
        <strong>{loading ? "..." : totalMinutes} mins</strong>
      </div>

      <div style={{ height: "77%" }}>
        {chartType === "line" ? (
          <Line
            data={{ labels, datasets: [baseDataset] }}
            options={chartOptions}
            plugins={[ChartDataLabels]}
          />
        ) : (
          <Bar
            data={{
              labels,
              datasets: [
                {
                  ...baseDataset,
                  backgroundColor: "#10b981",
                  borderRadius: 4,
                  borderWidth: 0
                }
              ]
            }}
            options={chartOptions}
            plugins={[ChartDataLabels]}
          />
        )}
      </div>
    </div>
  );
};

export default CallData;
