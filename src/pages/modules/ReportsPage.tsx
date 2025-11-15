import { useState } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ReportTable } from "@/components/Tables/ReportTable";
import { ChartCard } from "@/components/Widgets/ChartCard";
import { ReportFilterModal } from "@/components/Modals/ReportFilterModal";
import { Filter, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { toast } = useToast();

  const salesData = [{ date: "Mon", revenue: 45000 }, { date: "Tue", revenue: 52000 }, { date: "Wed", revenue: 48000 }];
  const stockData = [{ product: "Petrol", level: 83 }, { product: "Diesel", level: 15 }, { product: "CNG", level: 95 }];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" description="Generate and view comprehensive reports" actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilterModal(true)}><Filter className="mr-2 h-4 w-4" />Filter</Button>
          <Button variant="outline" onClick={() => toast({ title: "Downloading PDF..." })}><FileText className="mr-2 h-4 w-4" />PDF</Button>
          <Button variant="outline" onClick={() => toast({ title: "Exporting Excel..." })}><Download className="mr-2 h-4 w-4" />Excel</Button>
        </div>
      } />

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard title="Revenue Trend" data={salesData} dataKey="revenue" xKey="date" type="line" />
            <ChartCard title="Stock Levels" data={stockData} dataKey="level" xKey="product" />
          </div>
        </TabsContent>

        <TabsContent value="sales"><Card><CardContent className="pt-6"><ReportTable columns={[{ key: "date", label: "Date" }, { key: "revenue", label: "Revenue" }]} data={salesData} /></CardContent></Card></TabsContent>
        <TabsContent value="stock"><Card><CardContent className="pt-6"><ReportTable columns={[{ key: "product", label: "Product" }, { key: "level", label: "Level %" }]} data={stockData} /></CardContent></Card></TabsContent>
      </Tabs>

      <ReportFilterModal open={showFilterModal} onClose={() => setShowFilterModal(false)} onApply={() => toast({ title: "Filters applied" })} />
    </div>
  );
}
