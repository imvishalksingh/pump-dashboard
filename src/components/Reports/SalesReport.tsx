// components/Reports/SalesReport.tsx - UPDATED WITH EXPORT SUPPORT
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/Shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { PrintReport } from "./PrintReport";
import { ExportDropdown } from "./ExportDropdown";
import { ExportData, ReportHandle } from "@/types/report";

interface SalesTrend {
  date: string;
  revenue: number;
  liters: number;
  transactions: number;
}

interface ProductPerformance {
  product: string;
  revenue: number;
  liters: number;
  transactions: number;
}

export const SalesReport = forwardRef<ReportHandle>((props, ref) => {
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching sales report...");
      
      const response = await axios.get("/api/reports/sales?period=7days");
      
      console.log("📊 Sales report API response:", response.data);

      if (response.data.success) {
        const { salesTrend, productPerformance } = response.data;

        setSalesTrend(salesTrend || []);
        setTopProducts(productPerformance || []);
        
        console.log(`✅ Loaded sales report with ${salesTrend?.length || 0} days and ${productPerformance?.length || 0} products`);
      } else {
        throw new Error(response.data.message || "Failed to fetch sales report");
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch sales report:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch sales report",
        variant: "destructive",
      });
      setSalesTrend([]);
      setTopProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Define columns for export
  const trendExportColumns = [
    { key: "date", label: "Date" },
    { key: "revenue", label: "Revenue (₹)", render: (row: SalesTrend) => `₹${row.revenue.toLocaleString()}` },
    { key: "liters", label: "Liters Sold", render: (row: SalesTrend) => `${row.liters.toLocaleString()} L` },
    { key: "transactions", label: "Transactions", render: (row: SalesTrend) => row.transactions.toLocaleString() }
  ];

  const productExportColumns = [
    { key: "product", label: "Product" },
    { key: "revenue", label: "Revenue (₹)", render: (row: ProductPerformance) => `₹${row.revenue.toLocaleString()}` },
    { key: "liters", label: "Liters Sold", render: (row: ProductPerformance) => `${row.liters.toLocaleString()} L` },
    { key: "transactions", label: "Transactions", render: (row: ProductPerformance) => row.transactions.toLocaleString() }
  ];

  // Expose data for export
  useImperativeHandle(ref, () => ({
    getExportData: (): ExportData => ({
      data: topProducts,
      columns: productExportColumns,
      summary: {
        "Total Revenue": `₹${salesTrend.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}`,
        "Total Liters Sold": `${salesTrend.reduce((sum, day) => sum + day.liters, 0).toLocaleString()} L`,
        "Total Transactions": salesTrend.reduce((sum, day) => sum + day.transactions, 0).toLocaleString(),
        "Average Daily Revenue": `₹${Math.round(salesTrend.reduce((sum, day) => sum + day.revenue, 0) / (salesTrend.length || 1)).toLocaleString()}`,
        "Report Period": "Last 7 Days"
      }
    })
  }));

  const handleRefresh = () => {
    fetchSalesReport();
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
      key: "product",
      label: "Product",
      render: (item: ProductPerformance) => (
        <Badge variant="outline" className="font-medium">
          {item.product}
        </Badge>
      ),
    },
    {
      key: "revenue",
      label: "Revenue (₹)",
      render: (item: ProductPerformance) => (
        <span className="font-semibold">{formatCurrency(item.revenue)}</span>
      ),
    },
    {
      key: "liters",
      label: "Liters Sold",
      render: (item: ProductPerformance) => `${formatNumber(item.liters)} L`,
    },
    {
      key: "transactions",
      label: "Transactions",
      render: (item: ProductPerformance) => formatNumber(item.transactions),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Sales Report</h2>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <RefreshCw className="animate-spin mr-2 h-4 w-4" />
              Loading...
            </Button>
          </div>
        </div>
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </Card>
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
        <h2 className="text-2xl font-bold">Sales Report</h2>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <PrintReport
            title="Sales Analysis Report"
            data={topProducts}
            columns={productExportColumns}
            summary={{
              "Total Revenue": `₹${salesTrend.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}`,
              "Total Liters Sold": `${salesTrend.reduce((sum, day) => sum + day.liters, 0).toLocaleString()} L`,
              "Total Transactions": salesTrend.reduce((sum, day) => sum + day.transactions, 0).toLocaleString(),
              "Report Period": "Last 7 Days"
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', marginTop: '20px' }}>Product Performance</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Product</th>
                    <th style={tableHeaderStyle}>Revenue (₹)</th>
                    <th style={tableHeaderStyle}>Liters Sold</th>
                    <th style={tableHeaderStyle}>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index}>
                      <td style={tableCellStyle}>{product.product}</td>
                      <td style={tableCellStyle}>₹{product.revenue.toLocaleString()}</td>
                      <td style={tableCellStyle}>{product.liters.toLocaleString()} L</td>
                      <td style={tableCellStyle}>{product.transactions.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>7-Day Revenue Trend</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Date</th>
                    <th style={tableHeaderStyle}>Revenue (₹)</th>
                    <th style={tableHeaderStyle}>Liters Sold</th>
                    <th style={tableHeaderStyle}>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {salesTrend.map((day, index) => (
                    <tr key={index}>
                      <td style={tableCellStyle}>{day.date}</td>
                      <td style={tableCellStyle}>₹{day.revenue.toLocaleString()}</td>
                      <td style={tableCellStyle}>{day.liters.toLocaleString()} L</td>
                      <td style={tableCellStyle}>{day.transactions.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PrintReport>
          
          <ExportDropdown
            title="Sales Analysis Report"
            data={topProducts}
            columns={productExportColumns}
            summary={{
              "Total Revenue": `₹${salesTrend.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}`,
              "Total Liters Sold": `${salesTrend.reduce((sum, day) => sum + day.liters, 0).toLocaleString()} L`,
              "Total Transactions": salesTrend.reduce((sum, day) => sum + day.transactions, 0).toLocaleString(),
              "Report Period": "Last 7 Days"
            }}
            disabled={topProducts.length === 0}
          />
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">7-Day Revenue Trend</h3>
        {salesTrend.length > 0 && salesTrend.some(item => item.revenue > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`₹${value}`, 'Revenue']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Revenue (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No sales data available
          </div>
        )}
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
        {topProducts.length > 0 ? (
          <DataTable data={topProducts} columns={columns} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No product performance data available
          </div>
        )}
      </div>
    </div>
  );
});

SalesReport.displayName = 'SalesReport';

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