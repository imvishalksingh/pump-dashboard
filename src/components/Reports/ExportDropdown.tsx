// components/Reports/ExportDropdown.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Sheet, File } from "lucide-react";
import { exportToPDF, exportToExcel, exportToCSV } from "@/utils/exportUtils";

interface ExportDropdownProps {
  title: string;
  data: any[];
  columns: any[];
  summary?: any;
  disabled?: boolean;
}

export const ExportDropdown = ({ 
  title, 
  data, 
  columns, 
  summary, 
  disabled = false 
}: ExportDropdownProps) => {
  
  const handleExportPDF = () => {
    exportToPDF(title, data, columns, summary);
  };

  const handleExportExcel = () => {
    exportToExcel(title, data, columns, summary);
  };

  const handleExportCSV = () => {
    exportToCSV(title, data, columns);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="w-4 h-4 mr-2" />
          PDF Document
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <Sheet className="w-4 h-4 mr-2" />
          Excel Spreadsheet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <File className="w-4 h-4 mr-2" />
          CSV File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};