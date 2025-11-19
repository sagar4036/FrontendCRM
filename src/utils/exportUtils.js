// src/utils/exportUtils.js
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";   

export const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook  = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToCSV = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv       = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href  = URL.createObjectURL(blob);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data, fileName, columns) => {
  const doc  = new jsPDF();
  const rows = data.map((item) =>
    columns.map((col) => item[col] ?? "") 
  );

  autoTable(doc, {
    head: [columns],
    body: rows,
    styles: { fontSize: 9 },                  
    headStyles: { fillColor: [30, 144, 255] }, 
  });

  doc.save(`${fileName}.pdf`);
};
