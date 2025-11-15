// utils/exportUtils.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// PDF Export Utility
export const exportToPDF = (title, data, columns, summary = null) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
  
  let yPosition = 30;
  
  // Add summary if provided
  if (summary) {
    doc.setFontSize(12);
    doc.text('Summary', 14, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    Object.keys(summary).forEach((key, index) => {
      const value = typeof summary[key] === 'number' 
        ? summary[key].toLocaleString() 
        : summary[key];
      doc.text(`${key}: ${value}`, 14, yPosition + (index * 6));
    });
    yPosition += (Object.keys(summary).length * 6) + 10;
  }
  
  // Prepare table data
  const tableData = data.map(row => {
    return columns.map(col => {
      if (col.render) {
        return col.render(row);
      }
      return row[col.key];
    });
  });
  
  const tableHeaders = columns.map(col => col.label);
  
  // Add table
  doc.autoTable({
    head: [tableHeaders],
    body: tableData,
    startY: yPosition,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

// Excel Export Utility
export const exportToExcel = (title, data, columns, summary = null) => {
  const workbook = XLSX.utils.book_new();
  
  // Prepare main data
  const excelData = data.map(row => {
    const rowData = {};
    columns.forEach(col => {
      if (col.render) {
        rowData[col.label] = col.render(row);
      } else {
        rowData[col.label] = row[col.key];
      }
    });
    return rowData;
  });
  
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');
  
  // Add summary sheet if provided
  if (summary) {
    const summaryData = Object.keys(summary).map(key => ({
      Metric: key,
      Value: typeof summary[key] === 'number' 
        ? summary[key].toLocaleString() 
        : summary[key]
    }));
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }
  
  XLSX.writeFile(workbook, `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
};

// CSV Export Utility
export const exportToCSV = (title, data, columns) => {
  const headers = columns.map(col => col.label).join(',');
  
  const csvData = data.map(row => {
    return columns.map(col => {
      let value = col.render ? col.render(row) : row[col.key];
      // Handle values that might contain commas
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      return value;
    }).join(',');
  }).join('\n');
  
  const csvContent = `${headers}\n${csvData}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};