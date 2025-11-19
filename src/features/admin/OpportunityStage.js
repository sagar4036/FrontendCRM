import React, { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Cell } from "recharts";
import { useApi } from "../../context/ApiContext";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#ff8042", "#a4de6c"];

const OpportunityStage = () => {
  const { fetchOpportunitiesData, opportunities, opportunitiesLoading } = useApi();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchOpportunitiesData();
  }, []);

  useEffect(() => {
    if (opportunities.length > 0) {
      const stageCounts = opportunities.reduce((acc, opp) => {
        acc[opp.stage] = (acc[opp.stage] || 0) + 1;
        return acc;
      }, {});
      const dynamicData = Object.keys(stageCounts).map((stage) => ({
        name: stage,
        value: stageCounts[stage],
      }));
      setChartData(dynamicData);
    } else {
      setChartData([]);
    }
  }, [opportunities]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (opportunitiesLoading) {
    return <div>Loading...</div>;
  }

  if (chartData.length === 0) {
    return <div>No opportunity data available.</div>;
  }

  return (
    <div className="chart-container">
      <div className="chart">
        <h2 className="exec-section-title">Opportunity Stage</h2>
        <PieChart width={250} height={200}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            fill="#82ca9d"
            paddingAngle={5}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
        <p>Total <b>{total}</b></p>
      </div>
      <div className="chart-data">
        {chartData.map((item, index) => (
          <p key={index}>
            <span className="chart-label">
              <span className="dot"></span><b>{item.name}:</b>
            </span>
            <span>{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default OpportunityStage;