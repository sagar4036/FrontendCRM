import React from "react";
import { FaFileInvoice, FaHourglassHalf, FaCheckCircle, FaEye } from "react-icons/fa";

const InvoiceStats = () => {
  const stats = [
    { icon: <FaFileInvoice />, label: "Total Invoices", value: "120" },
    { icon: <FaHourglassHalf />, label: "Pending", value: "24" },
    { icon: <FaCheckCircle />, label: "Paid", value: "85" },
    { icon: <FaEye />, label: "Viewed", value: "11" },
  ];

  return (
    <div className="invoice-stats">
      {stats.map((stat, index) => (
        <div className="invoice-card" key={index}>
          <div className="invoice-card-icon">{stat.icon}</div>
          <div>
            <div className="invoice-card-label">{stat.label}</div>
            <div className="invoice-card-value">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvoiceStats;
