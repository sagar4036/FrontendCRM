
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

const LeadGraph = ({ selectedExecutiveId, executiveName }) => {
  const {
    fetchExecutiveActivity,
    fetchAllExecutiveActivitiesByDateAPI
  } = useApi();

  const [chartData, setChartData] = useState({
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
    totalVisits: 0
  });
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("line");
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = prev-1, 2 = prev-2, 3 = prev-3

  const isDarkMode =
    document.documentElement.getAttribute("data-theme") === "dark";

  const getWeekRange = (offset = 0) => {
    const targetDate = subWeeks(new Date(), offset);
    const start = startOfWeek(targetDate, { weekStartsOn: 0 });
    const end = endOfWeek(targetDate, { weekStartsOn: 0 });
    return { start, end };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { start, end } = getWeekRange(weekOffset);
        const weekDays = eachDayOfInterval({ start, end }).map(day =>
          format(day, "yyyy-MM-dd")
        );

        const updatedWeeklyData = Array.from({ length: weekDays.length }, () => 0);

        if (selectedExecutiveId) {
          const activities = await fetchExecutiveActivity(selectedExecutiveId);
          const dailySums = {};

          activities.forEach(({ activityDate, leadSectionVisits }) => {
            if (weekDays.includes(activityDate) && leadSectionVisits > 0) {
              const idx = weekDays.indexOf(activityDate);
              dailySums[idx] = (dailySums[idx] || 0) + leadSectionVisits;
            }
          });

          weekDays.forEach((_, idx) => {
            updatedWeeklyData[idx] = dailySums[idx] || 0;
          });
        } else {
          const data = await fetchAllExecutiveActivitiesByDateAPI();
          const allActivities = data?.dailyActivities || {};
          const dailySums = {};

          Object.keys(allActivities).forEach(date => {
            if (weekDays.includes(date)) {
              const idx = weekDays.indexOf(date);
              const activities = allActivities[date];
              const totalVisits = activities.reduce(
                (sum, act) => sum + (act.leadSectionVisits || 0),
                0
              );
              dailySums[idx] = totalVisits;
            }
          });

          weekDays.forEach((_, idx) => {
            updatedWeeklyData[idx] = dailySums[idx] || 0;
          });
        }

        const totalVisits = updatedWeeklyData.reduce((sum, visits) => sum + visits, 0);
        setChartData({
          weeklyData: updatedWeeklyData.map(v => Math.max(0, v)),
          totalVisits
        });
      } catch (err) {
        console.error("Error fetching activities:", err);
        setChartData({
          weeklyData: [0, 0, 0, 0, 0, 0, 0],
          totalVisits: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedExecutiveId, weekOffset,fetchAllExecutiveActivitiesByDateAPI,fetchExecutiveActivity]);

  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxLead = Math.max(...chartData.weeklyData);
  const dynamicMax = Math.max(70, Math.ceil((maxLead + 10) / 10) * 10);

  const baseDataset = {
    label: "Lead Visits",
    data: chartData.weeklyData,
    borderColor: "#8b5cf6",
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 5,
    borderWidth: 2
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.raw} Visits`
        }
      },
      datalabels: {
        color: isDarkMode ? "#ffffff" : "#000000",
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
          color: isDarkMode ? "#ffffff" : "#333",
          font: { size: 16, weight: "500" }
        }
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: dynamicMax,
        ticks: {
          stepSize: 10,
          color: isDarkMode ? "#ffffff" : "#333",
          font: { size: 10, weight: "500" }
        },
        grid: {
          color:
            getComputedStyle(document.documentElement).getPropertyValue(
              "--chart-grid"
            ).trim() || "#e5e7eb"
        }
      }
    }
  };

  const handleWeekToggle = () => {
    setWeekOffset(prev => (prev + 1) % 4); // 0 → 1 → 2 → 3 → 0
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
          Lead Visit:{" "}
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
        Total Visits: {chartData.totalVisits}
        {loading && (
          <span style={{ marginLeft: "10px", color: "#8b5cf6" }}>
            Loading...
          </span>
        )}
      </div>

      <div style={{ height: "77%" }}>
        {chartType === "line" ? (
          <Line
            data={{ labels, datasets: [baseDataset] }}
            options={commonOptions}
            plugins={[ChartDataLabels]}
          />
        ) : (
          <Bar
            data={{
              labels,
              datasets: [
                {
                  ...baseDataset,
                  backgroundColor: "#8b5cf6",
                  borderRadius: 4,
                  borderWidth: 0
                }
              ]
            }}
            options={commonOptions}
            plugins={[ChartDataLabels]}
          />
        )}
      </div>
    </div>
  );
};

export default LeadGraph;