import { PageHeader } from "@/components/Shared/PageHeader";
import { DailyReport } from "@/components/Reports/DailyReport";
import { SalesReport } from "@/components/Reports/SalesReport";
import { StockReport } from "@/components/Reports/StockReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

const Reports = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Generate detailed analytical and summary reports"
      />
      
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="daily">Daily Report</TabsTrigger>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="stock">Stock Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-6">
          <DailyReport />
        </TabsContent>
        
        <TabsContent value="sales" className="mt-6">
          <SalesReport />
        </TabsContent>
        
        <TabsContent value="stock" className="mt-6">
          <StockReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
