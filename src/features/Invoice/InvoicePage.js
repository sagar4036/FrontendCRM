import React, { useContext, useState } from "react";
import { ThemeContext } from "../admin/ThemeContext";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceStats from "./InvoiceStats";
import InvoiceTable from "./InvoiceTable";
import BlurOverlay from "./BlurOverlay";

const InvoicePage = () => {
  const { theme } = useContext(ThemeContext);
  const [isLoading] = useState(true); 


  return (
    <div className="invoice-container" data-theme={theme}>
      <div className="invoice-main">
        <InvoiceHeader />
        
        {/* Wrap InvoiceStats and InvoiceTable with BlurOverlay */}
        <BlurOverlay isLoading={isLoading}>
          <div style={{ 
            // Ensure the content has proper styling
            backgroundColor: "transparent",
            position: "relative"
          }}>
            <InvoiceStats />
            <InvoiceTable />
          </div>
        </BlurOverlay>
      </div>
    </div>
  );
};

export default InvoicePage;