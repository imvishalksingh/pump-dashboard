// components/Charts/SalesChart.tsx - UPDATED
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface SalesData {
  day: string;
  petrol: number;
  diesel: number;
  cng: number;
}

interface Sale {
  _id: string;
  transactionId: string;
  liters: number;
  price: number;
  totalAmount: number;
  paymentMode: string;
  nozzle?: {
    number: string;
    fuelType: string;
  };
  createdAt: string;
}

export const SalesChart = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/sales");
      const sales: Sale[] = response.data;
      
      // Process sales data for the last 7 days
      const processedData = processSalesData(sales);
      setSalesData(processedData);
    } catch (error: any) {
      console.error("Failed to fetch sales data for chart:", error);
      toast({
        title: "Error",
        description: "Failed to load sales chart data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processSalesData = (sales: Sale[]): SalesData[] => {
    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }).reverse();

    // Create day labels for display
    const dayLabels = last7Days.map(date => {
      const day = new Date(date).toLocaleDateString('en-IN', { weekday: 'short' });
      return day;
    });

    // Initialize data structure for last 7 days
    const dailySales: { [key: string]: { petrol: number; diesel: number; cng: number } } = {};
    
    last7Days.forEach(date => {
      dailySales[date] = { petrol: 0, diesel: 0, cng: 0 };
    });

    // Aggregate sales by date and fuel type
    sales.forEach(sale => {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      const fuelType = sale.nozzle?.fuelType?.toLowerCase() || 'unknown';
      
      if (dailySales[saleDate] && fuelType in dailySales[saleDate]) {
        dailySales[saleDate][fuelType as keyof typeof dailySales[string]] += sale.liters;
      }
    });

    // Convert to chart data format
    const chartData: SalesData[] = last7Days.map((date, index) => ({
      day: dayLabels[index],
      petrol: dailySales[date].petrol,
      diesel: dailySales[date].diesel,
      cng: dailySales[date].cng,
    }));

    return chartData;
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <strong>{entry.value} L</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Sales Overview (Last 7 Days)</h3>
          <p className="text-sm text-muted-foreground mt-1">Liters dispensed by fuel type</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading chart data...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Sales Overview (Last 7 Days)</h3>
        <p className="text-sm text-muted-foreground mt-1">Liters dispensed by fuel type</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="petrol"
            stroke="hsl(var(--chart-primary))"
            strokeWidth={2}
            name="Petrol"
            dot={{ fill: "hsl(var(--chart-primary))" }}
          />
          <Line
            type="monotone"
            dataKey="diesel"
            stroke="hsl(var(--chart-secondary))"
            strokeWidth={2}
            name="Diesel"
            dot={{ fill: "hsl(var(--chart-secondary))" }}
          />
          <Line
            type="monotone"
            dataKey="cng"
            stroke="hsl(var(--chart-tertiary))"
            strokeWidth={2}
            name="CNG"
            dot={{ fill: "hsl(var(--chart-tertiary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};