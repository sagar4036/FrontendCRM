import React, { createContext, useContext, useState } from "react";
import {
  generateExecutivePayroll,
  getPayrollForExecutive,
  getPayrollByFilters,
} from "../services/payrollService";
import { toast } from "react-toastify";

const PayrollContext = createContext();

export const PayrollProvider = ({ children }) => {
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollData, setPayrollData] = useState(null);
  const [payrollError, setPayrollError] = useState(null);

  const [filteredPayrolls, setFilteredPayrolls] = useState([]);
  const [executivePayroll, setExecutivePayroll] = useState(null);

  // ✅ Generate Payroll
  const handleGeneratePayroll = async (payload) => {
    setPayrollLoading(true);
    setPayrollError(null);

    try {
      const data = await generateExecutivePayroll(payload);
      setPayrollData(data.payroll || data);
      toast.success(data.message || "Payroll generated successfully");
      return data;
    } catch (error) {
      console.error("❌ Error generating payroll:", error);
      setPayrollError(error);
      toast.error(error.error || "Failed to generate payroll");
      return null;
    } finally {
      setPayrollLoading(false);
    }
  };

  // ✅ Get Payroll for Logged-in Executive
  const fetchPayrollForExecutive = async () => {
    setPayrollLoading(true);
    setPayrollError(null);

    try {
      const data = await getPayrollForExecutive();
      setExecutivePayroll(data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching executive payroll:", error);
      setPayrollError(error);
      toast.error(error.error || "Failed to fetch executive payroll");
      return null;
    } finally {
      setPayrollLoading(false);
    }
  };

  // ✅ Get Payrolls by Filters
  const fetchPayrollByFilters = async (filters) => {
    setPayrollLoading(true);
    setPayrollError(null);

    try {
      const data = await getPayrollByFilters(filters);
      setFilteredPayrolls(data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching filtered payrolls:", error);
      setPayrollError(error);
      toast.error(error.error || "Failed to fetch filtered payrolls");
      return null;
    } finally {
      setPayrollLoading(false);
    }
  };

  return (
    <PayrollContext.Provider
      value={{
        // state
        payrollLoading,
        payrollError,
        payrollData,
        executivePayroll,
        filteredPayrolls,

        // actions
        handleGeneratePayroll,
        fetchPayrollForExecutive,
        fetchPayrollByFilters,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

// ✅ Custom hook
export const usePayroll = () => useContext(PayrollContext);
