// components/Dashboard/StockTable.tsx
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface StockData {
  _id: string;
  tankName: string;
  product: string;
  capacity: string;
  currentStock: string;
  currentLevel: number;
  alert: boolean;
  rawCapacity: number;
  rawCurrentStock: number;
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
      console.log("🔄 Fetching tank configurations...");
      const response = await api.get("/api/stock/stats");
      console.log("Stock stats response:", response.data);

      const tanks = response.data.tanks || [];
      
      console.log(`📊 Processing ${tanks.length} tanks`);

      const formatted = tanks.map((tank: any) => {
        // Convert large numbers to readable format (K for thousands)
        const formatStock = (stock: number) => {
          if (stock >= 10000) return `${(stock / 1000).toFixed(0)}K`;
          if (stock >= 1000) return `${(stock / 1000).toFixed(1)}K`;
          return stock.toString();
        };

        const currentStock = tank.currentStock || 0;
        const capacity = tank.capacity || 1;
        const currentLevel = tank.currentLevel || Math.round((currentStock / capacity) * 100);
        
        return {
          _id: tank._id || `tank-${Math.random()}`,
          tankName: tank.tankName || "Unknown Tank",
          product: tank.product || "Unknown",
          capacity: formatStock(capacity),
          currentStock: formatStock(currentStock),
          currentLevel: currentLevel,
          alert: tank.alert || currentLevel <= 20,
          // Keep original values for calculations
          rawCapacity: capacity,
          rawCurrentStock: currentStock
        };
      });

      console.log("✅ Formatted tank data:", formatted);
      setStockData(formatted);
    } catch (error: any) {
      console.error("❌ Failed to fetch stock data:", error);
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
    return "Good";
  };

  const getProgressColor = (level: number) => {
    if (level < 20) return "bg-red-500";
    if (level < 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
          <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
              <div className="h-8 w-24 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Fuel Stock Status</h3>
        <Badge variant="outline" className="text-xs">
          {stockData.length} Tanks
        </Badge>
      </div>
      
      <div className="space-y-4">
        {stockData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No stock data available
          </div>
        ) : (
          stockData.map((item) => (
            <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground">{item.tankName}</h4>
                  {item.alert && <AlertTriangle className="h-4 w-4 text-red-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{item.product}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Stock: {item.currentStock}L</span>
                  <span>Capacity: {item.capacity}L</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Progress 
                    value={item.currentLevel} 
                    className={`w-20 h-2 ${getProgressColor(item.currentLevel)}`}
                  />
                  <span className="text-sm font-medium w-12 text-right">
                    {item.currentLevel}%
                  </span>
                </div>
                <Badge variant={getStatusVariant(item.alert, item.currentLevel)}>
                  {getStatusText(item.alert, item.currentLevel)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};