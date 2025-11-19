import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FaCalendarAlt } from "react-icons/fa";

// Hardcoded profit data (matching the image)
const hardcodedChartData = [
  { month: "May", profit: 40000 },
  { month: "Jun", profit: 10000 },
  { month: "Jul", profit: 30000 },
  { month: "Aug", profit: 10000 },
  { month: "Sep", profit: 40000 },
];

// Get the current year
const currentYear = new Date().getFullYear();

// Generate an array of years from 2009 to the current year
const availableYears = Array.from({ length: currentYear - 2008 }, (_, i) => 2009 + i);

const ProfitChart = () => {
  const [selectedYear, setSelectedYear] = useState(currentYear);

  return (
    <div className="profit-container">
      {/* Header with title and year dropdown */}
      <div className="profit-header">
        <h3>Profit</h3>
        <div className="year-selector">
          <div className="year-dropdown-container">
            <FaCalendarAlt className="calendar-icon" />
            <select
              className="year-dropdown"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart displaying hardcoded data */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={hardcodedChartData}>
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
          <Tooltip formatter={(value) => `$${value}`} />
          <Line type="monotone" dataKey="profit" stroke="#4A4A4A" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitChart;
