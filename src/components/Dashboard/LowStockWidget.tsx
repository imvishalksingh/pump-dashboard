// components/Dashboard/LowStockWidget.tsx - FIXED
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface LowStockItem {
  _id: string;
  product: string;
  closingStock?: number;
  capacity?: number;
  currentLevel?: number;
  alert?: boolean;
}

interface LowStockItemWithStatus extends LowStockItem {
  status: "critical" | "low" | "adequate";
  tank: string;
  percentage: number;
}

export const LowStockWidget = () => {
  const [lowStockItems, setLowStockItems] = useState<LowStockItemWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLowStockData();
  }, []);

  // Safe number formatting function
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0";
    }
    return value.toLocaleString();
  };

  // Safe progress value
  const getProgressValue = (level: number | null | undefined): number => {
    if (level === null || level === undefined || isNaN(level)) {
      return 0;
    }
    return Math.max(0, Math.min(100, level));
  };

  const fetchLowStockData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/stock/stats"); // Fixed: removed /api prefix
      
      // Handle different response structures
      const products = response.data.products || response.data || [];
      
      if (!Array.isArray(products)) {
        console.error("Invalid products data:", products);
        setLowStockItems([]);
        return;
      }

      // Filter items that are below 30% capacity (low stock)
      const lowStockProducts = products.filter((product: any) => {
        const currentLevel = product.currentLevel || 0;
        return currentLevel < 30;
      });

      // Transform data for the widget with proper typing
      const items: LowStockItemWithStatus[] = lowStockProducts.map((product: any) => {
        const currentLevel = product.currentLevel || 0;
        const closingStock = product.closingStock || 0;
        const capacity = product.capacity || 0;
        const productName = product.product || "Unknown";

        return {
          _id: product._id || `tank-${productName}`,
          product: productName,
          closingStock,
          capacity,
          currentLevel,
          alert: product.alert || false,
          percentage: currentLevel,
          status: getStockStatus(currentLevel),
          tank: `Tank ${productName}`
        };
      });

      setLowStockItems(items);
    } catch (error: any) {
      console.error("Failed to fetch low stock data:", error);
      toast({
        title: "Error",
        description: "Failed to load low stock alerts",
        variant: "destructive",
      });
      setLowStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (percentage: number): "critical" | "low" | "adequate" => {
    if (percentage <= 15) return "critical";
    if (percentage <= 30) return "low";
    return "adequate";
  };

  const handleRequestRefill = async (product: string) => {
    try {
      // Find the current stock level for this product
      const currentItem = lowStockItems.find(item => item.product === product);
      const currentStock = currentItem?.closingStock || 0;
      const capacity = currentItem?.capacity || 50000;

      // Calculate refill quantity (fill to 80% of capacity)
      const targetStock = capacity * 0.8;
      const refillQuantity = Math.max(0, Math.round(targetStock - currentStock));

      if (refillQuantity <= 0) {
        toast({
          title: "No Refill Needed",
          description: `${product} tank doesn't need refill at this time`,
        });
        return;
      }

      // Create a stock purchase entry for refill
      await api.post("/api/stock", {
        product,
        openingStock: currentStock,
        purchases: refillQuantity,
        sales: 0,
        capacity: capacity,
        rate: 95, // Current rate
        amount: refillQuantity * 95,
        supplier: "Emergency Refill",
        invoiceNumber: `REFILL-${Date.now()}`
      });
      
      toast({
        title: "Refill Requested",
        description: `Emergency refill requested for ${product}`,
      });
      
      // Refresh data to show updated stock levels
      fetchLowStockData();
    } catch (error: any) {
      console.error("Failed to request refill:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to request refill",
        variant: "destructive",
      });
    }
  };

  const handleBulkRefillRequest = async () => {
    try {
      const criticalItems = lowStockItems.filter(item => item.status === "critical");
      
      if (criticalItems.length === 0) {
        toast({
          title: "No Critical Items",
          description: "There are no critically low stock items to refill",
        });
        return;
      }

      // Create refill requests for all critical items
      const refillPromises = criticalItems.map(item => {
        const currentStock = item.closingStock || 0;
        const capacity = item.capacity || 50000;
        const targetStock = capacity * 0.8;
        const refillQuantity = Math.max(0, Math.round(targetStock - currentStock));

        if (refillQuantity <= 0) return Promise.resolve();

        return api.post("/api/stock", {
          product: item.product,
          openingStock: currentStock,
          purchases: refillQuantity,
          sales: 0,
          capacity: capacity,
          rate: 95,
          amount: refillQuantity * 95,
          supplier: "Bulk Emergency Refill",
          invoiceNumber: `BULK-REFILL-${Date.now()}-${item.product}`
        });
      }).filter(Boolean); // Remove any undefined promises

      await Promise.all(refillPromises);

      toast({
        title: "Bulk Refill Requested",
        description: `Emergency refill requested for ${criticalItems.length} critical items`,
      });
      
      fetchLowStockData();
    } catch (error: any) {
      console.error("Failed to request bulk refill:", error);
      toast({
        title: "Error",
        description: "Failed to request bulk refill",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Low Stock Alert
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Tanks requiring immediate attention</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  const criticalItems = lowStockItems.filter(item => item.status === "critical");
  const lowItems = lowStockItems.filter(item => item.status === "low");

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Low Stock Alert
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {lowStockItems.length > 0 
              ? `${criticalItems.length} critical, ${lowItems.length} low stock items`
              : "All tanks at adequate levels"
            }
          </p>
        </div>
        <Button 
          variant="default" 
          onClick={handleBulkRefillRequest}
          disabled={criticalItems.length === 0}
        >
          <TrendingDown className="w-4 h-4 mr-2" />
          Request Bulk Refill
        </Button>
      </div>

      {lowStockItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p>All fuel tanks are at adequate levels</p>
          <p className="text-sm mt-1">No immediate action required</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockItems.map((item) => {
              // Safe values with defaults
              const product = item.product || "Unknown";
              const closingStock = item.closingStock || 0;
              const capacity = item.capacity || 0;
              const currentLevel = item.currentLevel || 0;
              const status = item.status;

              return (
                <div
                  key={item._id}
                  className={`p-4 rounded-lg border-2 ${
                    status === "critical" 
                      ? "border-destructive/30 bg-destructive/5" 
                      : "border-warning/30 bg-warning/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{product}</p>
                      <p className="text-sm text-muted-foreground">{item.tank}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="destructive"
                        className={status === "critical" ? "bg-destructive" : "bg-warning"}
                      >
                        {status === "critical" ? "Critical" : "Low"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestRefill(product)}
                      >
                        Request Refill
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available Stock</span>
                      <span className="font-medium text-foreground">
                        {formatNumber(closingStock)} L / {formatNumber(capacity)} L
                      </span>
                    </div>
                    <Progress 
                      value={getProgressValue(currentLevel)} 
                      className={`h-2 ${
                        status === "critical" ? "[&>div]:bg-destructive" : "[&>div]:bg-warning"
                      }`} 
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capacity Level</span>
                      <span className={`font-medium ${
                        status === "critical" ? "text-destructive" : "text-warning"
                      }`}>
                        {formatNumber(currentLevel)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {criticalItems.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-foreground">
                <strong>🚨 Action Required:</strong> {criticalItems.length} tank(s) are below 15% capacity. 
                Contact supplier immediately for emergency refill.
              </p>
            </div>
          )}

          {lowItems.length > 0 && criticalItems.length === 0 && (
            <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-sm text-foreground">
                <strong>⚠️ Monitor:</strong> {lowItems.length} tank(s) are below 30% capacity. 
                Consider scheduling refill soon.
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
};