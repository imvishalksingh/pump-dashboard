// pages/FuelStockPage.tsx
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Droplet, AlertTriangle, TrendingUp, Download, RefreshCw, TrendingDown, Package, Minus } from "lucide-react";
import { FuelStockTable } from "@/components/Tables/FuelStockTable";
import { StockPurchaseModal } from "@/components/Modals/StockPurchaseModal";
import { StockAdjustment } from "@/components/Stock/StockAdjustment";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface FuelStock {
  _id: string;
  product: string;
  openingStock: number;
  purchases: number;
  sales: number;
  closingStock: number;
  capacity: number;
  currentLevel: number;
  alert: boolean;
  rate: number;
  amount: number;
  supplier: string;
  invoiceNumber: string;
  date: string;
  createdAt: string;
}

interface StockStats {
  products: FuelStock[];
  totalCapacity: number;
  totalCurrent: number;
  averageLevel: number;
  lowStockAlerts: number;
}

export const FuelStockPage = () => {
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [stocks, setStocks] = useState<FuelStock[]>([]);
  const [stats, setStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStockData();
  }, [refresh]);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      
      // Fetch latest stocks for dashboard cards
      const statsResponse = await axios.get("/api/stock/stats");
      setStats(statsResponse.data);
      
      // Fetch all stock entries for the table
      const stocksResponse = await axios.get("/api/stock");
      setStocks(stocksResponse.data);
      
    } catch (error: any) {
      console.error("Failed to fetch fuel stock data:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch fuel stock data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefresh(prev => !prev);
  };

  const handleExport = () => {
    // Implement export functionality
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon",
    });
  };

  // Calculate today's date for filtering
  const today = new Date().toDateString();

  // Calculate today's deductions for each product (only from adjustments)
  const getTodayDeductions = (product: string) => {
    const todayStocks = stocks.filter(stock => {
      const stockDate = new Date(stock.date).toDateString();
      return stockDate === today && stock.product === product;
    });

    return todayStocks.reduce((total, stock) => {
      // Only count deductions from system adjustments
      if (stock.supplier === "System Adjustment" && stock.sales > 0) {
        return total + stock.sales;
      }
      return total;
    }, 0);
  };

  // Calculate today's additions for each product (only from adjustments)
  const getTodayAdditions = (product: string) => {
    const todayStocks = stocks.filter(stock => {
      const stockDate = new Date(stock.date).toDateString();
      return stockDate === today && stock.product === product;
    });

    return todayStocks.reduce((total, stock) => {
      // Only count additions from system adjustments
      if (stock.supplier === "System Adjustment" && stock.purchases > 0) {
        return total + stock.purchases;
      }
      return total;
    }, 0);
  };

  // Calculate today's sales for each product (only from regular sales, not adjustments)
  const getTodaySales = (product: string) => {
    const todayStocks = stocks.filter(stock => {
      const stockDate = new Date(stock.date).toDateString();
      return stockDate === today && stock.product === product;
    });

    return todayStocks.reduce((total, stock) => {
      // Only count sales from regular transactions (not adjustments)
      if (stock.supplier !== "System Adjustment" && stock.sales > 0) {
        return total + stock.sales;
      }
      return total;
    }, 0);
  };

  // Calculate today's purchases for each product (only from regular purchases, not adjustments)
  const getTodayPurchases = (product: string) => {
    const todayStocks = stocks.filter(stock => {
      const stockDate = new Date(stock.date).toDateString();
      return stockDate === today && stock.product === product;
    });

    return todayStocks.reduce((total, stock) => {
      // Only count purchases from regular transactions (not adjustments)
      if (stock.supplier !== "System Adjustment" && stock.purchases > 0) {
        return total + stock.purchases;
      }
      return total;
    }, 0);
  };

  // Calculate summary for transaction cards (ALL TIME DATA)
  const calculateTransactionSummary = () => {
    let totalPurchases = 0;
    let totalSales = 0;
    let totalAdjustmentsAdded = 0;
    let totalAdjustmentsDeducted = 0;
    let purchaseTransactions = 0;
    let salesTransactions = 0;
    let adjustmentTransactions = 0;

    stocks.forEach(stock => {
      if (stock.supplier === "System Adjustment") {
        // Adjustment transactions
        adjustmentTransactions++;
        if (stock.purchases > 0) {
          totalAdjustmentsAdded += stock.purchases;
        }
        if (stock.sales > 0) {
          totalAdjustmentsDeducted += stock.sales;
        }
      } else {
        // Regular transactions
        if (stock.purchases > 0) {
          totalPurchases += stock.purchases;
          purchaseTransactions++;
        }
        if (stock.sales > 0) {
          totalSales += stock.sales;
          salesTransactions++;
        }
      }
    });

    return {
      totalPurchases,
      totalSales,
      totalAdjustmentsAdded,
      totalAdjustmentsDeducted,
      purchaseTransactions,
      salesTransactions,
      adjustmentTransactions
    };
  };

  const transactionSummary = calculateTransactionSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading fuel stock data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Fuel Stock Management"
        description={`Monitor fuel inventory levels for ${new Date().toLocaleDateString()}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <StockAdjustment onAdjustmentAdded={handleRefresh} />
            <Button onClick={() => setPurchaseModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Purchase
            </Button>
          </div>
        }
      />

      {/* Transaction Summary Cards (ALL TIME) */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        {/* Total Purchases Card - Only regular purchases from suppliers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transactionSummary.totalPurchases.toLocaleString()} L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {transactionSummary.purchaseTransactions} purchase transactions
            </p>
          </CardContent>
        </Card>

        {/* Total Sales Card - Only regular sales to customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {transactionSummary.totalSales.toLocaleString()} L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Customer sales
            </p>
          </CardContent>
        </Card>

        {/* Stock Added Card - Only from adjustments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock Added</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {transactionSummary.totalAdjustmentsAdded.toLocaleString()} L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {transactionSummary.adjustmentTransactions} adjustment entries
            </p>
          </CardContent>
        </Card>

        {/* Stock Deducted Card - Only from adjustments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock Deducted</CardTitle>
            <Minus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {transactionSummary.totalAdjustmentsDeducted.toLocaleString()} L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Through adjustments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Cards with Today's Activity */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {stats?.products.map((stock) => {
          const todayDeductions = getTodayDeductions(stock.product);
          const todayAdditions = getTodayAdditions(stock.product);
          const todaySales = getTodaySales(stock.product);
          const todayPurchases = getTodayPurchases(stock.product);

          return (
            <Card key={stock.product} className="relative">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stock.product}</CardTitle>
                <div className="flex items-center gap-1">
                  {todayDeductions > 0 && (
                    <Minus className="h-4 w-4 text-red-500" />
                  )}
                  {todayAdditions > 0 && (
                    <Plus className="h-4 w-4 text-green-500" />
                  )}
                  <Droplet className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Main Stock Info */}
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold">{stock.closingStock.toLocaleString()} L</div>
                    <div className="text-sm text-muted-foreground">
                      / {stock.capacity.toLocaleString()} L
                    </div>
                  </div>
                  <Progress value={stock.currentLevel} />

                  {/* Stock Level and Alert */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={stock.alert ? "text-destructive font-medium" : "text-muted-foreground"}>
                      {stock.currentLevel}% Full
                    </span>
                    {stock.alert && (
                      <span className="flex items-center text-destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low Stock
                      </span>
                    )}
                  </div>

                  {/* Today's Activity */}
                  <div className="border-t pt-2 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Today's Activity:</p>
                    
                    {/* Deductions (from adjustments) */}
                    {todayDeductions > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-red-600 flex items-center">
                          <Minus className="h-3 w-3 mr-1" />
                          Deducted:
                        </span>
                        <span className="font-semibold text-red-600">
                          {todayDeductions.toLocaleString()} L
                        </span>
                      </div>
                    )}

                    {/* Additions (from adjustments) */}
                    {todayAdditions > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-green-600 flex items-center">
                          <Plus className="h-3 w-3 mr-1" />
                          Added:
                        </span>
                        <span className="font-semibold text-green-600">
                          {todayAdditions.toLocaleString()} L
                        </span>
                      </div>
                    )}

                    {/* Sales (regular sales) */}
                    {todaySales > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-orange-600 flex items-center">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Sold:
                        </span>
                        <span className="font-semibold text-orange-600">
                          {todaySales.toLocaleString()} L
                        </span>
                      </div>
                    )}

                    {/* Purchases (regular purchases) */}
                    {todayPurchases > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-blue-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Purchased:
                        </span>
                        <span className="font-semibold text-blue-600">
                          {todayPurchases.toLocaleString()} L
                        </span>
                      </div>
                    )}

                    {/* No activity today */}
                    {todayDeductions === 0 && todayAdditions === 0 && todaySales === 0 && todayPurchases === 0 && (
                      <div className="text-xs text-muted-foreground text-center">
                        No activity today
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCapacity.toLocaleString()} L</div>
            <p className="text-xs text-muted-foreground mt-1">All tanks combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageLevel}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.lowStockAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">Tanks below 20%</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Transaction History</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Complete history of all stock movements
          </p>
        </CardHeader>
        <CardContent>
          <FuelStockTable stocks={stocks} onRefresh={handleRefresh} />
        </CardContent>
      </Card>

      <StockPurchaseModal 
        open={purchaseModalOpen} 
        onOpenChange={setPurchaseModalOpen}
        onPurchaseAdded={handleRefresh}
      />
    </div>
  );
};