// components/Dashboard/StockTable.tsx - UPDATED
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
      const response = await api.get("/stock/stats");
      setStockData(response.data.products || []);
    } catch (error: any) {
      console.error("Failed to fetch stock data:", error);
      toast({
        title: "Error",
        description: "Failed to load stock data",
        variant: "destructive",
      });
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
            {stockData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  No stock data available
                </td>
              </tr>
            ) : (
              stockData.map((item) => (
                <tr key={item._id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-foreground">{item.product}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{item.capacity.toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm font-medium text-foreground">{item.closingStock.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Progress value={item.currentLevel} className="w-24 h-2" />
                      <span className="text-sm font-medium text-foreground">{item.currentLevel}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={getStatusVariant(item.alert, item.currentLevel)}>
                      {getStatusText(item.alert, item.currentLevel)}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};