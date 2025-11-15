// components/Reports/StockReport.tsx - UPDATED WITH EXPORT SUPPORT
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/Shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { PrintReport } from "./PrintReport";
import { ExportDropdown } from "./ExportDropdown";
import { ExportData, ReportHandle } from "@/types/report";

interface StockMovement {
  date: string;
  product: string;
  opening: number;
  received: number;
  sold: number;
  closing: number;
  capacity: number;
  percentage: number;
}

interface StockSummary {
  totalStockValue: number;
  lowStockAlerts: number;
  avgConsumption: number;
}

export const StockReport = forwardRef<ReportHandle>((props, ref) => {
  const [stockMovement, setStockMovement] = useState<StockMovement[]>([]);
  const [summary, setSummary] = useState<StockSummary>({
    totalStockValue: 0,
    lowStockAlerts: 0,
    avgConsumption: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStockReport();
  }, []);

  const fetchStockReport = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching stock report...");
      
      const response = await api.get("/reports/stock");
      
      console.log("📊 Stock report API response:", response.data);

      if (response.data.success) {
        const { stockMovement, summary: reportSummary } = response.data;

        setStockMovement(stockMovement || []);
        setSummary({
          totalStockValue: reportSummary?.totalStockValue || 0,
          lowStockAlerts: reportSummary?.lowStockAlerts || 0,
          avgConsumption: reportSummary?.avgConsumption || 0
        });
        
        console.log(`✅ Loaded stock report with ${stockMovement?.length || 0} products`);
      } else {
        throw new Error(response.data.message || "Failed to fetch stock report");
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch stock report:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch stock report",
        variant: "destructive",
      });
      setStockMovement([]);
      setSummary({
        totalStockValue: 0,
        lowStockAlerts: 0,
        avgConsumption: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Define columns for export
  const exportColumns = [
    { key: "date", label: "Date" },
    { key: "product", label: "Product" },
    { key: "opening", label: "Opening Stock (L)" },
    { key: "received", label: "Received (L)" },
    { key: "sold", label: "Sold (L)" },
    { key: "closing", label: "Closing Stock (L)" },
    { key: "capacity", label: "Capacity (L)" },
    { key: "percentage", label: "Stock Level %", render: (row: StockMovement) => `${row.percentage}%` }
  ];

  // Expose data for export
  useImperativeHandle(ref, () => ({
    getExportData: (): ExportData => ({
      data: stockMovement,
      columns: exportColumns,
      summary: {
        "Total Stock Value": `₹${summary.totalStockValue.toLocaleString()}`,
        "Low Stock Alerts": summary.lowStockAlerts.toString(),
        "Average Consumption": `${summary.avgConsumption.toLocaleString()} L/day`,
        "Total Products": stockMovement.length.toString(),
        "Report Date": new Date().toLocaleDateString()
      }
    })
  }));

  const handleRefresh = () => {
    fetchStockReport();
  };

  // Safe number formatting with fallbacks
  const formatNumber = (value: number | null | undefined): string => {
    return (value || 0).toLocaleString();
  };

  const formatCurrency = (value: number | null | undefined): string => {
    return `₹${(value || 0).toLocaleString()}`;
  };

  const columns = [
    {
      key: "date",
      label: "Date",
    },
    {
      key: "product",
      label: "Product",
      render: (item: StockMovement) => (
        <Badge variant="outline">{item.product}</Badge>
      ),
    },
    {
      key: "opening",
      label: "Opening (L)",
      render: (item: StockMovement) => formatNumber(item.opening),
    },
    {
      key: "received",
      label: "Received (L)",
      render: (item: StockMovement) => (
        <span className="text-success">+{formatNumber(item.received)}</span>
      ),
    },
    {
      key: "sold",
      label: "Sold (L)",
      render: (item: StockMovement) => (
        <span className="text-destructive">-{formatNumber(item.sold)}</span>
      ),
    },
    {
      key: "closing",
      label: "Closing (L)",
      render: (item: StockMovement) => (
        <span className="font-semibold">{formatNumber(item.closing)}</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Stock Report</h2>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <RefreshCw className="animate-spin mr-2 h-4 w-4" />
              Loading...
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded mt-2"></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded mt-2"></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded mt-2"></div>
            </div>
          </Card>
        </div>
        <div>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Stock Report</h2>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <PrintReport
            title="Stock Management Report"
            data={stockMovement}
            columns={exportColumns}
            summary={{
              "Total Stock Value": `₹${summary.totalStockValue.toLocaleString()}`,
              "Low Stock Alerts": summary.lowStockAlerts.toString(),
              "Average Consumption": `${summary.avgConsumption.toLocaleString()} L/day`,
              "Total Products": stockMovement.length.toString()
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', marginTop: '20px' }}>Stock Movement</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Date</th>
                    <th style={tableHeaderStyle}>Product</th>
                    <th style={tableHeaderStyle}>Opening (L)</th>
                    <th style={tableHeaderStyle}>Received (L)</th>
                    <th style={tableHeaderStyle}>Sold (L)</th>
                    <th style={tableHeaderStyle}>Closing (L)</th>
                    <th style={tableHeaderStyle}>Capacity (L)</th>
                    <th style={tableHeaderStyle}>Stock Level %</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovement.map((item, index) => (
                    <tr key={index}>
                      <td style={tableCellStyle}>{item.date}</td>
                      <td style={tableCellStyle}>{item.product}</td>
                      <td style={tableCellStyle}>{item.opening.toLocaleString()}</td>
                      <td style={tableCellStyle}>+{item.received.toLocaleString()}</td>
                      <td style={tableCellStyle}>-{item.sold.toLocaleString()}</td>
                      <td style={tableCellStyle}>{item.closing.toLocaleString()}</td>
                      <td style={tableCellStyle}>{item.capacity.toLocaleString()}</td>
                      <td style={tableCellStyle}>{item.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PrintReport>
          
          <ExportDropdown
            title="Stock Management Report"
            data={stockMovement}
            columns={exportColumns}
            summary={{
              "Total Stock Value": `₹${summary.totalStockValue.toLocaleString()}`,
              "Low Stock Alerts": summary.lowStockAlerts.toString(),
              "Average Consumption": `${summary.avgConsumption.toLocaleString()} L/day`,
              "Total Products": stockMovement.length.toString(),
              "Report Date": new Date().toLocaleDateString()
            }}
            disabled={stockMovement.length === 0}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Stock Value</p>
          <p className="text-3xl font-bold text-foreground mt-2">{formatCurrency(summary.totalStockValue)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
          <p className="text-3xl font-bold text-destructive mt-2">{formatNumber(summary.lowStockAlerts)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Avg. Consumption/Day</p>
          <p className="text-3xl font-bold text-foreground mt-2">{formatNumber(summary.avgConsumption)} L</p>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Stock Movement</h3>
        {stockMovement.length > 0 ? (
          <DataTable data={stockMovement} columns={columns} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No stock movement data available
          </div>
        )}
      </div>
    </div>
  );
});

StockReport.displayName = 'StockReport';

// Table styles for print
const tableHeaderStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '10px',
  textAlign: 'left',
  backgroundColor: '#f8f9fa',
  fontWeight: 'bold',
  fontSize: '12px'
};

const tableCellStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '10px',
  textAlign: 'left',
  fontSize: '11px'
};