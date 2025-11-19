import React from "react";

const InvoiceTable = () => {
  const data = [
    { id: "INV001", client: "John Doe", amount: "$300", status: "Paid" },
    { id: "INV002", client: "Jane Smith", amount: "$150", status: "Pending" },
    { id: "INV003", client: "Acme Corp", amount: "$500", status: "Viewed" },
    { id: "INV004", client: "Zara Co.", amount: "$400", status: "Paid" },
  ];

  const getStatusClass = (status) => {
    if (status === "Paid") return "status-paid";
    if (status === "Pending") return "status-pending";
    return "status-view";
  };

  return (
    <div className="invoice-table-wrapper">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((invoice, index) => (
            <tr key={index}>
              <td>{invoice.id}</td>
              <td>{invoice.client}</td>
              <td>{invoice.amount}</td>
              <td>
                <span className={`invoice-status ${getStatusClass(invoice.status)}`}>
                  {invoice.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-pagination">
        <span className="invoice-page-nav">« Prev</span>
        <span>Page 1 of 5</span>
        <span className="invoice-page-nav">Next »</span>
      </div>
    </div>
  );
};

export default InvoiceTable;
