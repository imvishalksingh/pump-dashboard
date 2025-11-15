// types/reports.ts
export interface ExportData {
  data: any[];
  columns: any[];
  summary: Record<string, string | number>;
}

export interface ReportHandle {
  getExportData: () => ExportData;
}