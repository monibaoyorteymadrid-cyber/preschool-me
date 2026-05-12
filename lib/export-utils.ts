import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const exportToExcel = (data: any[], fileName: string) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    toast.success(`Exported ${fileName} to Excel successfully`);
  } catch (error) {
    console.error("Excel export error:", error);
    toast.error("Failed to export to Excel");
  }
};

export const exportReportsToPDF = (reports: any[], fileName: string) => {
  try {
    const doc = new jsPDF();
    doc.text("Preschool Daily Reports Summary", 14, 15);
    
    const tableData = reports.map((report) => [
      report.child?.firstName + " " + report.child?.lastName,
      new Date(report.reportDate).toLocaleDateString(),
      report.attendanceStatus,
      report.mood,
      report.status.replace(/_/g, " "),
    ]);

    autoTable(doc, {
      head: [["Student", "Date", "Attendance", "Mood", "Status"]],
      body: tableData,
      startY: 25,
    });

    doc.save(`${fileName}.pdf`);
    toast.success(`Generated PDF for ${fileName} successfully`);
  } catch (error) {
    console.error("PDF export error:", error);
    toast.error("Failed to generate PDF");
  }
};
