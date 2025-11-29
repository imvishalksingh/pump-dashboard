// components/Reports/DailyReport.tsx - FIXED VERSION
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { PrintReport } from "./PrintReport";
import { ExportDropdown } from "./ExportDropdown";
import { ExportData, ReportHandle } from "@/types/report";

interface DailyData {
  hour: string;
  petrol: number;
  diesel: number;
  cng: number;
}

interface DailySummary {
  totalSales: number;
  totalLiters: number;
  activeTransactions: number;
  growthPercentage: number;
}

// Fix the ref type
export const DailyReport = forwardRef<ReportHandle>((props, ref) => {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [summary, setSummary] = useState<DailySummary>({
    totalSales: 0,
    totalLiters: 0,
    activeTransactions: 0,
    growthPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDailyReport();
  }, []);


// In DailyReport.tsx - Update the fetch function to handle the response properly
const fetchDailyReport = async () => {
  try {
    setLoading(true);
    console.log("🔄 Fetching daily report...");
    
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/api/reports/daily?date=${today}`);
    
    console.log("📊 Daily report API response:", response.data);

    if (response.data.success) {
      const { hourlyData, summary: reportSummary, sales, nozzlemanSales } = response.data;

      console.log("📈 Sales data:", sales);
      console.log("👥 Nozzleman sales:", nozzlemanSales);
      console.log("⏰ Hourly data:", hourlyData);

      // Use the data from your backend response
      setDailyData(hourlyData || []);
      setSummary({
        totalSales: reportSummary?.totalSales || 0,
        totalLiters: reportSummary?.totalLiters || 0,
        activeTransactions: reportSummary?.activeTransactions || 0,
        growthPercentage: reportSummary?.growthPercentage || 0
      });
      
      // Set nozzleman sales data if available
      if (nozzlemanSales && nozzlemanSales.length > 0) {
        // You can use this data to display nozzleman performance
        console.log(`✅ Found ${nozzlemanSales.length} nozzlemen with sales data`);
      }
      
      console.log(`✅ Loaded daily report with ${hourlyData?.length || 0} hourly entries`);
    } else {
      throw new Error(response.data.message || "Failed to fetch daily report");
    }
  } catch (error: any) {
    console.error("❌ Failed to fetch daily report:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch daily report",
      variant: "destructive",
    });
    setDailyData([]);
    setSummary({
      totalSales: 0,
      totalLiters: 0,
      activeTransactions: 0,
      growthPercentage: 0
    });
  } finally {
    setLoading(false);
  }
};


  // Define columns for export
  const exportColumns = [
    { key: "hour", label: "Time Period" },
    { key: "petrol", label: "Petrol (L)" },
    { key: "diesel", label: "Diesel (L)" },
    { key: "cng", label: "CNG (L)" },
    { 
      key: "total", 
      label: "Total (L)", 
      render: (row: DailyData) => (row.petrol + row.diesel + row.cng).toLocaleString() 
    }
  ];

  // Expose data for export - FIXED TYPE
  useImperativeHandle(ref, () => ({
    getExportData: (): ExportData => ({
      data: dailyData,
      columns: exportColumns,
      summary: {
        "Total Sales": `₹${summary.totalSales.toLocaleString()}`,
        "Total Liters Sold": `${summary.totalLiters.toLocaleString()} L`,
        "Total Transactions": summary.activeTransactions.toLocaleString(),
        "Growth Percentage": `${summary.growthPercentage}%`,
        "Report Date": new Date().toLocaleDateString()
      }
    })
  }));

  const handleRefresh = () => {
    fetchDailyReport();
  };

  // Safe number formatting with fallbacks
  const formatNumber = (value: number | null | undefined): string => {
    return (value || 0).toLocaleString();
  };

  const formatCurrency = (value: number | null | undefined): string => {
    return `₹${(value || 0).toLocaleString()}`;
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} L
            </p>
          ))}
          <p className="font-semibold mt-1">
            Total: {payload.reduce((sum: number, entry: any) => sum + entry.value, 0).toLocaleString()} L
          </p>
        </div>
      );
    }
    return null;
  };

  // Fix the summary display function
  const renderSummaryValue = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Daily Report</h2>
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
              <div className="h-3 bg-gray-200 rounded mt-1 w-1/3"></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded mt-2"></div>
              <div className="h-3 bg-gray-200 rounded mt-1 w-1/3"></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded mt-2"></div>
              <div className="h-3 bg-gray-200 rounded mt-1 w-1/3"></div>
            </div>
          </Card>
        </div>
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Daily Report</h2>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <PrintReport
            title="Daily Sales Report"
            data={dailyData}
            columns={exportColumns}
            summary={{
              "Total Sales": `₹${summary.totalSales.toLocaleString()}`,
              "Total Liters Sold": `${summary.totalLiters.toLocaleString()} L`,
              "Total Transactions": summary.activeTransactions.toLocaleString(),
              "Growth Percentage": `${summary.growthPercentage}%`
            }}
          >
            {/* Custom print content for daily report */}
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', marginTop: '20px' }}>Hourly Sales Distribution (Liters)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Time Period</th>
                    <th style={tableHeaderStyle}>Petrol (L)</th>
                    <th style={tableHeaderStyle}>Diesel (L)</th>
                    <th style={tableHeaderStyle}>CNG (L)</th>
                    <th style={tableHeaderStyle}>Total (L)</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.map((hour, index) => (
                    <tr key={index}>
                      <td style={tableCellStyle}>{hour.hour}</td>
                      <td style={tableCellStyle}>{hour.petrol.toLocaleString()}</td>
                      <td style={tableCellStyle}>{hour.diesel.toLocaleString()}</td>
                      <td style={tableCellStyle}>{hour.cng.toLocaleString()}</td>
                      <td style={tableCellStyle}>{(hour.petrol + hour.diesel + hour.cng).toLocaleString()}</td>
                    </tr>
                  ))}
                  {dailyData.length > 0 && (
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                      <td style={tableCellStyle}>TOTAL</td>
                      <td style={tableCellStyle}>
                        {dailyData.reduce((sum, hour) => sum + hour.petrol, 0).toLocaleString()}
                      </td>
                      <td style={tableCellStyle}>
                        {dailyData.reduce((sum, hour) => sum + hour.diesel, 0).toLocaleString()}
                      </td>
                      <td style={tableCellStyle}>
                        {dailyData.reduce((sum, hour) => sum + hour.cng, 0).toLocaleString()}
                      </td>
                      <td style={tableCellStyle}>
                        {dailyData.reduce((sum, hour) => sum + hour.petrol + hour.diesel + hour.cng, 0).toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Additional summary section for print */}
              <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold' }}>Performance Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <strong>Peak Hour:</strong> {dailyData.length > 0 ? 
                      dailyData.reduce((max, hour) => 
                        (hour.petrol + hour.diesel + hour.cng) > (max.petrol + max.diesel + max.cng) ? hour : max
                      ).hour : 'N/A'
                    }
                  </div>
                  <div>
                    <strong>Most Sold Product:</strong> {dailyData.length > 0 ? 
                      (() => {
                        const totalPetrol = dailyData.reduce((sum, hour) => sum + hour.petrol, 0);
                        const totalDiesel = dailyData.reduce((sum, hour) => sum + hour.diesel, 0);
                        const totalCNG = dailyData.reduce((sum, hour) => sum + hour.cng, 0);
                        
                        if (totalPetrol >= totalDiesel && totalPetrol >= totalCNG) return 'Petrol';
                        if (totalDiesel >= totalPetrol && totalDiesel >= totalCNG) return 'Diesel';
                        return 'CNG';
                      })() : 'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>
          </PrintReport>
          
          <ExportDropdown
            title="Daily Sales Report"
            data={dailyData}
            columns={exportColumns}
            summary={{
              "Total Sales": `₹${summary.totalSales.toLocaleString()}`,
              "Total Liters Sold": `${summary.totalLiters.toLocaleString()} L`,
              "Total Transactions": summary.activeTransactions.toLocaleString(),
              "Growth Percentage": `${summary.growthPercentage}%`,
              "Report Date": new Date().toLocaleDateString()
            }}
            disabled={dailyData.length === 0}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Sales Today</p>
          <p className="text-3xl font-bold text-foreground mt-2">{formatCurrency(summary.totalSales)}</p>
          <p className="text-sm text-success mt-1">+{summary.growthPercentage}% from yesterday</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Liters Sold</p>
          <p className="text-3xl font-bold text-foreground mt-2">{formatNumber(summary.totalLiters)} L</p>
          <p className="text-sm text-success mt-1">+8% from yesterday</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Active Transactions</p>
          <p className="text-3xl font-bold text-foreground mt-2">{formatNumber(summary.activeTransactions)}</p>
          <p className="text-sm text-muted-foreground mt-1">Across all nozzles</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Hourly Sales Distribution</h3>
          <div className="text-sm text-muted-foreground">
            Last Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        {dailyData.length > 0 && dailyData.some(item => item.petrol > 0 || item.diesel > 0 || item.cng > 0) ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value}L`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="petrol" 
                fill="hsl(var(--chart-1))" 
                name="Petrol (L)" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="diesel" 
                fill="hsl(var(--chart-2))" 
                name="Diesel (L)" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="cng" 
                fill="hsl(var(--chart-3))" 
                name="CNG (L)" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-lg font-semibold mb-2">No Data Available</div>
            <p className="text-sm">No sales data found for today.</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        )}

        {/* Data table for quick reference */}
        {dailyData.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3">Hourly Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-2 text-left">Time</th>
                    <th className="border border-gray-200 p-2 text-right">Petrol (L)</th>
                    <th className="border border-gray-200 p-2 text-right">Diesel (L)</th>
                    <th className="border border-gray-200 p-2 text-right">CNG (L)</th>
                    <th className="border border-gray-200 p-2 text-right">Total (L)</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.map((hour, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-2 font-medium">{hour.hour}</td>
                      <td className="border border-gray-200 p-2 text-right">{hour.petrol.toLocaleString()}</td>
                      <td className="border border-gray-200 p-2 text-right">{hour.diesel.toLocaleString()}</td>
                      <td className="border border-gray-200 p-2 text-right">{hour.cng.toLocaleString()}</td>
                      <td className="border border-gray-200 p-2 text-right font-semibold">
                        {(hour.petrol + hour.diesel + hour.cng).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border border-gray-200 p-2">TOTAL</td>
                    <td className="border border-gray-200 p-2 text-right">
                      {dailyData.reduce((sum, hour) => sum + hour.petrol, 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-200 p-2 text-right">
                      {dailyData.reduce((sum, hour) => sum + hour.diesel, 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-200 p-2 text-right">
                      {dailyData.reduce((sum, hour) => sum + hour.cng, 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-200 p-2 text-right">
                      {dailyData.reduce((sum, hour) => sum + hour.petrol + hour.diesel + hour.cng, 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
});

// Add display name for the component
DailyReport.displayName = 'DailyReport';

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