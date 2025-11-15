// pages/SalesManagementPage.tsx - FIXED VERSION
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, FileText, Fuel, RefreshCw } from "lucide-react";
import { SalesTable } from "@/components/Tables/SalesTable";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";

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
  verifiedBy?: {
    name: string;
  };
  createdAt: string;
}

interface SalesStats {
  totalSales: number;
  totalTransactions: number;
  totalFuelSold: number;
  averagePrice: number;
}

export const SalesManagementPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalTransactions: 0,
    totalFuelSold: 0,
    averagePrice: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching sales data...");
      
      const [salesRes, statsRes] = await Promise.all([
        api.get("/sales"),
        api.get("/sales/stats")
      ]);
      
      console.log("📊 Sales API response:", salesRes.data);
      console.log("📈 Stats API response:", statsRes.data);

      // Transform backend data to match frontend expectations
      const transformedSales: Sale[] = salesRes.data.map((sale: any) => ({
        _id: sale._id,
        transactionId: sale.transactionId || sale._id,
        liters: sale.liters || 0,
        price: sale.price || 0,
        totalAmount: sale.totalAmount || (sale.liters || 0) * (sale.price || 0),
        paymentMode: sale.paymentMode || 'Cash',
        nozzle: sale.nozzle,
        verifiedBy: sale.verifiedBy,
        createdAt: sale.createdAt || new Date().toISOString()
      }));

      // Safely handle stats data (convert null to 0)
      const safeStats = {
        totalSales: statsRes.data.totalSales || 0,
        totalTransactions: statsRes.data.totalTransactions || 0,
        totalFuelSold: statsRes.data.totalFuelSold || 0,
        averagePrice: statsRes.data.averagePrice || 0
      };

      setSales(transformedSales);
      setStats(safeStats);
      
      console.log(`✅ Loaded ${transformedSales.length} sales`);
      console.log(`💰 Stats: ₹${safeStats.totalSales}, ${safeStats.totalTransactions} transactions, ${safeStats.totalFuelSold}L`);
    } catch (error: any) {
      console.error("❌ Failed to fetch sales data:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch sales data",
        variant: "destructive",
      });
      // Set default values on error
      setStats({
        totalSales: 0,
        totalTransactions: 0,
        totalFuelSold: 0,
        averagePrice: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSalesData();
  };

  // Safe number formatting with fallbacks
  const formatNumber = (value: number | null | undefined): string => {
    return (value || 0).toLocaleString();
  };

  const formatCurrency = (value: number | null | undefined): string => {
    return `₹${(value || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <PageHeader
          title="Sales Management"
          description="Track daily sales and transactions"
        />
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 mr-2" />
          <span>Loading sales data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Sales Management"
          description="Track daily sales and transactions"
        />
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">Today's revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalTransactions)}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fuel Sold</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalFuelSold)} L</div>
            <p className="text-xs text-muted-foreground mt-1">All products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.averagePrice || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per liter</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions ({sales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTable sales={sales} />
        </CardContent>
      </Card>
    </div>
  );
};