// components/Charts/SalesChart.tsx
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

interface Shift {
  _id: string;
  startTime: string;
  fuelDispensed: number;
  nozzle?: {
    fuelType: string;
  };
  meterReadingPetrol?: {
    opening: number;
    closing: number;
  };
  meterReadingHSD?: {
    opening: number;
    closing: number;
  };
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
      
      // Get date range for last 7 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await api.get(`/api/nozzleman-sales?startDate=${startDate}&endDate=${endDate}`);
      const nozzlemanData = response.data.data || [];
      
      console.log(`📈 Found ${nozzlemanData.length} nozzlemen with data for chart`);
      
      // Process sales data for the last 7 days
      const processedData = processSalesData(nozzlemanData);
      setSalesData(processedData);
    } catch (error: any) {
      console.error("Failed to fetch sales data for chart:", error);
      toast({
        title: "Error",
        description: "Failed to load sales chart data",
        variant: "destructive",
      });
      // Set empty data for last 7 days
      setSalesData(generateEmptyData());
    } finally {
      setLoading(false);
    }
  };

  const generateEmptyData = (): SalesData[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-IN', { weekday: 'short' });
    });

    return last7Days.map(day => ({
      day,
      petrol: 0,
      diesel: 0,
      cng: 0
    }));
  };

  const processSalesData = (nozzlemanData: any[]): SalesData[] => {
    // Get last 7 days including today
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    // Create day labels for display
    const dayLabels = last7Days.map(date => {
      return new Date(date).toLocaleDateString('en-IN', { weekday: 'short' });
    });

    // Initialize data structure for last 7 days
    const dailySales: { [key: string]: { petrol: number; diesel: number; cng: number } } = {};
    
    last7Days.forEach(date => {
      dailySales[date] = { petrol: 0, diesel: 0, cng: 0 };
    });

    // Aggregate sales by date and fuel type from all nozzlemen shifts
    nozzlemanData.forEach(nozzleman => {
      if (nozzleman.shifts && nozzleman.shifts.length > 0) {
        nozzleman.shifts.forEach((shift: Shift) => {
          const shiftDate = new Date(shift.startTime).toISOString().split('T')[0];
          const fuelDispensed = shift.fuelDispensed || 0;
          
          // Determine fuel type from nozzle or meter readings
          let fuelType = shift.nozzle?.fuelType?.toLowerCase() || 'unknown';
          
          // Handle different fuel type naming conventions
          if (fuelType === 'ms' || fuelType === 'petrol') fuelType = 'petrol';
          if (fuelType === 'hsd' || fuelType === 'diesel') fuelType = 'diesel';
          if (fuelType === 'cng') fuelType = 'cng';
          
          // If fuel type is unknown, try to infer from meter readings
          if (fuelType === 'unknown') {
            if (shift.meterReadingPetrol && (shift.meterReadingPetrol.closing - shift.meterReadingPetrol.opening > 0)) {
              fuelType = 'petrol';
            } else if (shift.meterReadingHSD && (shift.meterReadingHSD.closing - shift.meterReadingHSD.opening > 0)) {
              fuelType = 'diesel';
            }
          }

          if (dailySales[shiftDate] && fuelType in dailySales[shiftDate]) {
            dailySales[shiftDate][fuelType as keyof typeof dailySales[string]] += fuelDispensed;
          }
        });
      }
    });

    // Convert to chart data format
    const chartData: SalesData[] = last7Days.map((date, index) => ({
      day: dayLabels[index],
      petrol: dailySales[date].petrol,
      diesel: dailySales[date].diesel,
      cng: dailySales[date].cng,
    }));

    console.log("📊 Processed chart data from nozzleman-sales:", chartData);
    return chartData;
  };

  // Custom tooltip formatter (remains the same)
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

  // Loading and main return remain the same...
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