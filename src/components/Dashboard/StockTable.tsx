// components/Dashboard/StockTable.tsx - FIXED WITH KEYS
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface StockData {
  _id: string;
  product: string;
  closingStock: number;
  capacity: number;
  currentLevel: number;
  alert: boolean;
}

export const StockTable = () => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
  try {
    const response = await api.get("/api/tanks/config");
    console.log("Stock stats response:", response.data);

    const tanks = response.data.tanks || [];

    const formatted = tanks.map((tank: any) => ({
      _id: tank._id,
      product: tank.product,
      capacity: tank.capacity,
      closingStock: tank.currentStock,       // ⚠️ FIX: map properly
      currentLevel: tank.currentLevel,       // already %
      alert: tank.alert                      // boolean
    }));

    setStockData(formatted);
  } catch (error: any) {
    console.error("Failed to fetch stock data:", error);
    toast({
      title: "Error",
      description: "Failed to load stock data",
      variant: "destructive",
    });
    setStockData([]);
  } finally {
    setLoading(false);
  }
};


  const getStatusVariant = (alert: boolean, level: number) => {
    if (alert || level < 20) return "destructive";
    if (level < 50) return "outline";
    return "secondary";
  };

  const getStatusText = (alert: boolean, level: number) => {
    if (alert || level < 20) return "Low";
    if (level < 50) return "Medium";
    return "Normal";
  };

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0";
    }
    return value.toLocaleString();
  };

  const getProgressValue = (level: number | null | undefined): number => {
    if (level === null || level === undefined || isNaN(level)) {
      return 0;
    }
    return Math.max(0, Math.min(100, level));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Stock Summary</h3>
          <p className="text-sm text-muted-foreground mt-1">Current fuel inventory levels</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading stock data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Stock Summary</h3>
        <p className="text-sm text-muted-foreground mt-1">Current fuel inventory levels</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Product</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Capacity (L)</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Available (L)</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Level</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {!stockData || stockData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  No stock data available
                </td>
              </tr>
            ) : (
              stockData.map((item) => {
                const product = item.product || "Unknown";
                const capacity = item.capacity || 0;
                const closingStock = item.closingStock || 0;
                const currentLevel = item.currentLevel || 0;
                const alert = item.alert || false;

                return (
                  <tr 
                    key={item._id} // ✅ ADDED UNIQUE KEY
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm font-medium text-foreground">{product}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {formatNumber(capacity)}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-foreground">
                      {formatNumber(closingStock)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={getProgressValue(currentLevel)} 
                          className="w-24 h-2" 
                        />
                        <span className="text-sm font-medium text-foreground">
                          {formatNumber(currentLevel)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getStatusVariant(alert, currentLevel)}>
                        {getStatusText(alert, currentLevel)}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {stockData && stockData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Capacity: </span>
              <span className="font-medium">
                {formatNumber(stockData.reduce((sum, item) => sum + (item.capacity || 0), 0))} L
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Stock: </span>
              <span className="font-medium">
                {formatNumber(stockData.reduce((sum, item) => sum + (item.closingStock || 0), 0))} L
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};