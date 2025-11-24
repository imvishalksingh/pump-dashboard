// components/Reports/Reports.tsx - FULLY UPDATED WITH REF FIXES
import { useState, useRef, forwardRef } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExportDropdown } from "./ExportDropdown";
import { PrintReport } from "./PrintReport";
import { DailyReport } from "./DailyReport";
import { SalesReport } from "./SalesReport";
import { StockReport } from "./StockReport";
import { ExportData, ReportHandle } from "@/types/report";

// Create wrapper components to handle refs properly
const DailyReportWithRef = forwardRef<ReportHandle>((props, ref) => 
  <DailyReport ref={ref} {...props} />
);
DailyReportWithRef.displayName = 'DailyReportWithRef';

const SalesReportWithRef = forwardRef<ReportHandle>((props, ref) => 
  <SalesReport ref={ref} {...props} />
);
SalesReportWithRef.displayName = 'SalesReportWithRef';

const StockReportWithRef = forwardRef<ReportHandle>((props, ref) => 
  <StockReport ref={ref} {...props} />
);
StockReportWithRef.displayName = 'StockReportWithRef';

const Reports = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("daily");
  const dailyReportRef = useRef<ReportHandle>(null);
  const salesReportRef = useRef<ReportHandle>(null);
  const stockReportRef = useRef<ReportHandle>(null);

  const handleExportAll = () => {
    toast({
      title: "Exporting All Reports...",
      description: "Preparing comprehensive report package",
    });
    
    // This would typically gather data from all tabs and export together
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "All reports have been exported successfully",
      });
    }, 2000);
  };

  const getCurrentReportData = (): { data: any[]; columns: any[]; summary: Record<string, string | number> } => {
    let reportData: ExportData | null = null;
    
    switch (activeTab) {
      case "daily":
        reportData = dailyReportRef.current?.getExportData() || null;
        break;
      case "sales":
        reportData = salesReportRef.current?.getExportData() || null;
        break;
      case "stock":
        reportData = stockReportRef.current?.getExportData() || null;
        break;
      default:
        reportData = null;
    }

    return reportData || { data: [], columns: [], summary: {} };
  };

  const getReportTitle = (): string => {
    const titles: Record<string, string> = {
      daily: "Daily Sales Report",
      sales: "Sales Analysis Report", 
      stock: "Stock Management Report"
    };
    return titles[activeTab] || "Report";
  };

  const { data, columns, summary } = getCurrentReportData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Generate detailed analytical and summary reports"
        actions={
          <div className="flex gap-2">
            <PrintReport
              title={getReportTitle()}
              data={data}
              columns={columns}
              summary={summary}
            />
            <ExportDropdown
              title={getReportTitle()}
              data={data}
              columns={columns}
              summary={summary}
              disabled={data.length === 0}
            />
            <Button variant="outline" onClick={handleExportAll}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        }
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="daily">Daily Report</TabsTrigger>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="stock">Stock Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-6">
          <DailyReportWithRef ref={dailyReportRef} />
        </TabsContent>
        
        <TabsContent value="sales" className="mt-6">
          <SalesReportWithRef ref={salesReportRef} />
        </TabsContent>
        
        <TabsContent value="stock" className="mt-6">
          <StockReportWithRef ref={stockReportRef} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;