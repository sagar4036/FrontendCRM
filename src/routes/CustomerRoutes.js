import React, { useState, useEffect } from "react";
import CustomerTable from "../features/convert-customer/CustomerTable";
import { useApi } from "../context/ApiContext";
import "../styles/customer.css";

const CustomerRoutes = () => {
  const { convertedClients, fetchConvertedClientsAPI } = useApi();
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    fetchConvertedClientsAPI();
  }, [fetchConvertedClientsAPI]);

  useEffect(() => {
    if (Array.isArray(convertedClients)) {
      setFilteredCustomers(convertedClients);
    }
  }, [convertedClients]);


  const openInvoiceInNewTab = () => {
    window.open("/invoice.html", "_blank");
  };

  return (
    <div className="customer-container">
      {/* <SidebarandNavbar /> */}
      <div className="customer-main-content">
        <div className="convert-heading">
          <h2>Convert Customers</h2>
          <button className="button">Export List</button>
        </div>
        <CustomerTable customers={filteredCustomers} />
        <div className="generate-btn-wrapper">
          <button className="button invoice-btn" onClick={openInvoiceInNewTab}>
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerRoutes;